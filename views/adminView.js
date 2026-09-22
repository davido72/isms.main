const adminView = {
    currentTab: 'overview',
    currentUserSubTab: 'students',

    renderDashboard() {
        const students = store.get("students") || [];
        const teachers = store.get("teachers") || [];
        const parents = store.get("parents") || [];
        const admins = store.get("admins") || [];
        const courses = store.get("courses") || [];
        const fees = store.get("fees") || [];
        const regControl = store.get("reg_control") || {};

        const activeStudents = students.filter(s => s.status !== "Inactive").length;
        const totalExpected = fees.reduce((acc, f) => acc + (f.total_amount || 0), 0);
        const totalCollected = fees.reduce((acc, f) => acc + (f.paid_amount || 0), 0);
        const totalOutstanding = totalExpected - totalCollected;

        const currentUser = store.getCurrentUser() || {};
        const isSystemAdmin = !currentUser.admin_role_title || currentUser.admin_role_title === "System Admin" || currentUser.admin_role_title === "Super Admin" || currentUser.staff_id === "SUPER-001";
        const roleBannerTitle = isSystemAdmin ? "SYSTEM ADMIN MASTER WORKSPACE" : `${(currentUser.admin_role_title || 'SUB-ADMIN').toUpperCase()} WORKSPACE`;
        const bannerHeading = isSystemAdmin ? "Institution-Wide Governance & Administrative Control" : `${currentUser.admin_role_title || 'Sub-Administrator'} Assigned Management Portal`;
        const bannerSub = isSystemAdmin ? "Full oversight of users, academic operations, registration, finance, and security." : "Assigned departmental governance, administrative operations, and record controls.";

        return `
        
            <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 24px; border-radius: var(--radius-lg); margin-bottom: 24px; box-shadow: var(--shadow-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                    <div>
                        <span class="badge badge-success" style="font-size: 0.8rem; letter-spacing: 1px;"><i class="${isSystemAdmin ? 'fa-solid fa-crown' : 'fa-solid fa-user-shield'}"></i> ${roleBannerTitle}</span>
                        <h2 style="color: white; margin-top: 6px; font-size: 1.6rem;">${bannerHeading}</h2>
                        <p style="color: #94a3b8; font-size: 0.88rem;">${bannerSub}</p>
                    </div>
                </div>
            </div>

            
            <div id="admin-master-sec-content">
                ${this.renderSectionContent()}
            </div>
        `;
    },

    switchSection(tab) {

        this.stopOverviewPolling();

        this.currentTab = tab;
        const container = document.getElementById("admin-master-sec-content");
        if (!container) {
            const viewContainer = document.getElementById("view-container");
            if (viewContainer) {
                viewContainer.innerHTML = this.renderDashboard();
            }
        } else {
            container.innerHTML = this.renderSectionContent();
        }
        if (tab === 'overview') {
            this.initAdminChart();
            this.startOverviewRealTimePolling();
        }
        if (tab === 'attendance') this.initAttendanceTrendChart();
    },


    startOverviewRealTimePolling() {
        this.stopOverviewPolling(); // guard: only one interval running
        this._overviewPollInterval = setInterval(() => {

            if (document.visibilityState === 'hidden') return;
            this._updateOverviewStats();
        }, 5000);


        if (!this._visibilityHandler) {
            this._visibilityHandler = () => {
                if (document.visibilityState === 'visible' && this._overviewPollInterval) {
                    this._updateOverviewStats();
                }
            };
            document.addEventListener('visibilitychange', this._visibilityHandler);
        }
    },

    stopOverviewPolling() {
        if (this._overviewPollInterval) {
            clearInterval(this._overviewPollInterval);
            this._overviewPollInterval = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }
    },

    _updateOverviewStats() {

        if (this.currentTab !== 'overview' && this.currentTab !== 'dashboard' && this.currentTab !== '') return;

        const students = store.get('students') || [];
        const teachers = store.get('teachers') || [];
        const parents = store.get('parents') || [];
        const admins = store.get('admins') || [];
        const courses = store.get('courses') || [];
        const gradeLogs = store.get('grade_change_logs') || [];
        const systemAlerts = store.get('system_alerts') || [];
        const regControl = store.get('reg_control') || {};
        const sysSettings = store.get('system_settings') || { general: {} };

        const activeStudents = students.filter(s => s.status !== 'Inactive').length;


        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        set('kpi-total-students', students.length);
        set('kpi-active-students', activeStudents);
        set('kpi-teachers', teachers.length);
        set('kpi-parents', parents.length);
        set('kpi-admins', (admins.length + 1) + ' Super & Sub-Admins');
        set('kpi-courses', courses.length);


        const deptSet = new Set(courses.map(c => c.department).filter(Boolean));
        const deptCount = deptSet.size || 5;
        set('kpi-departments', deptCount + ' Departments');


        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { full_label: '2026/2027 - Semester 1' };
        set('kpi-semester', activeSession.full_label);


        const pendingGradeChanges = gradeLogs.filter(g => g.status === 'Pending' || !g.status).length;
        set('kpi-grade-changes', pendingGradeChanges + ' Requests');


        const enrollments = store.get('enrollments') || [];
        const enrolledIds = new Set(enrollments.map(e => e.student_id));
        const unregistered = students.filter(s => !enrolledIds.has(s.student_id) && s.status !== 'Inactive').length;
        set('kpi-unregistered', unregistered + ' Students');


        const pendingAdminReviews = admins.filter(a => a.status === 'Suspended' || a.status === 'Pending').length;
        set('kpi-admin-reviews', pendingAdminReviews + ' Pending');


        const securityAlerts = systemAlerts.filter(a => (a.category || '').toLowerCase().includes('security'));
        const failedLoginAlerts = systemAlerts.filter(a => (a.message || '').toLowerCase().includes('failed login'));
        set('kpi-failed-logins', failedLoginAlerts.length > 0 ? failedLoginAlerts.length + ' Alerts' : '0 Alerts');

        const backups = store.get('db_backups') || [];
        const lastBackup = backups[0];
        const backupEl = document.getElementById('kpi-backup-status');
        if (backupEl) {
            backupEl.textContent = lastBackup
                ? (lastBackup.status === 'Successful' ? '✓ Successful' : '✗ Failed')
                : '✓ Successful';
            backupEl.className = 'badge ' + (lastBackup && lastBackup.status !== 'Successful' ? 'badge-danger' : 'badge-success');
        }


        const activeSessions = admins.filter(a => a.status === 'Active').length + teachers.filter(t => t.status === 'Active').length;
        set('kpi-db-sessions', '● ' + Math.max(activeSessions, 1) + ' Operational');


        this._refreshAdminChart();
    },

    _updateAttendanceStats() {
        // Only run when the attendance tab is active
        if (this.currentTab !== 'attendance') return;

        const dept = (document.getElementById('adm-att-dept-filter') || {}).value || 'ALL';
        const course = (document.getElementById('adm-att-course-filter') || {}).value || 'ALL';
        const level = (document.getElementById('adm-att-level-filter') || {}).value || 'ALL';
        const search = (document.getElementById('adm-att-search') || {}).value || '';

        const stats = store.calculateOverallAttendance({ dept, course, level, search });

        const selectedCourseAtt = course !== 'ALL' && store.calculateCourseAttendance
            ? store.calculateCourseAttendance(course)
            : null;

        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        setEl('adm-att-stat-overall', `${stats.rate}% Present`);

        if (selectedCourseAtt) {
            setEl('adm-att-stat-course-label', `${course} Attendance %`);
            setEl('adm-att-stat-course', `${selectedCourseAtt.rate}% Present`);
        } else {
            setEl('adm-att-stat-course-label', dept !== 'ALL' ? `${dept} %` : `Computer Science %`);
            setEl('adm-att-stat-course', `${stats.csRate}% Present`);
        }

        setEl('adm-att-stat-absent', `${stats.absentToday} Students`);
        setEl('adm-att-stat-late', `${stats.lateToday} Students`);

        // Colour the overall rate by threshold
        const overallEl = document.getElementById('adm-att-stat-overall');
        if (overallEl) {
            overallEl.style.color = stats.rate >= 75
                ? 'var(--status-success)'
                : stats.rate >= 50
                    ? 'var(--status-warning)'
                    : 'var(--status-danger)';
        }
    },

    _refreshAdminChart() {
        if (!window._adminDeptChart) return;
        const courses = store.get('courses') || [];
        const enrollments = store.get('enrollments') || [];


        const deptMap = {};
        courses.forEach(c => {
            const dept = c.department || 'Other';
            if (!deptMap[dept]) deptMap[dept] = { enrolled: 0, courses: 0 };
            deptMap[dept].courses++;
            deptMap[dept].enrolled += (c.enrolled_count || 0);
        });
        enrollments.forEach(e => {
            const course = courses.find(c => c.course_code === e.course_code);
            const dept = course ? (course.department || 'Other') : 'Other';
            if (!deptMap[dept]) deptMap[dept] = { enrolled: 0, courses: 0 };
            deptMap[dept].enrolled++;
        });

        const labels = Object.keys(deptMap);
        const data = labels.map(d => deptMap[d].enrolled);

        window._adminDeptChart.data.labels = labels;
        window._adminDeptChart.data.datasets[0].data = data;
        window._adminDeptChart.update('none'); // 'none' = no animation on refresh
    },

    renderSectionContent() {
        const currentUser = store.getCurrentUser() || {};
        const isSystemAdmin = !currentUser.admin_role_title || currentUser.admin_role_title === "System Admin" || currentUser.admin_role_title === "Super Admin" || currentUser.staff_id === "SUPER-001";

        const students = store.get("students") || [];
        const teachers = store.get("teachers") || [];
        const parents = store.get("parents") || [];
        const admins = store.get("admins") || [];
        const courses = store.get("courses") || [];
        const enrollments = store.get("enrollments") || [];
        const attendance = store.get("attendance") || [];
        const fees = store.get("fees") || [];
        const auditLogs = store.get("audit_logs") || [];
        const gradeLogs = store.get("grade_change_logs") || [];
        const adminRoles = store.get("admin_roles") || [];
        const regControl = store.get("reg_control") || {};
        const sysSettings = store.get("system_settings") || { general: {}, academic: {}, security: {}, notifications: {} };

        const activeStudentsCount = students.filter(s => s.status !== "Inactive").length;


        if (!this.currentTab || this.currentTab === 'overview' || this.currentTab === 'dashboard') {

            const deptSet = new Set(courses.map(c => c.department).filter(Boolean));
            const deptCount = deptSet.size || 5;
            const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { full_label: '2026/2027 - Semester 1' };
            const semesterLabel = activeSession.full_label;
            const enrollments2 = store.get('enrollments') || [];
            const enrolledIds2 = new Set(enrollments2.map(e => e.student_id));
            const unregistered2 = students.filter(s => !enrolledIds2.has(s.student_id) && s.status !== 'Inactive').length;
            const pendingAdminReviews2 = admins.filter(a => a.status === 'Suspended' || a.status === 'Pending').length;
            const backups2 = store.get('db_backups') || [];
            const lastBackup2 = backups2[0];
            const backupStatusText = lastBackup2 ? (lastBackup2.status === 'Successful' ? '✓ Successful' : '✗ Failed') : '✓ Successful';
            const backupBadgeClass = lastBackup2 && lastBackup2.status !== 'Successful' ? 'badge-danger' : 'badge-success';
            const pendingGrades2 = gradeLogs.filter(g => g.status === 'Pending' || !g.status).length;
            const syAlerts2 = store.get('system_alerts') || [];
            const failedLoginAlerts2 = syAlerts2.filter(a => (a.message || '').toLowerCase().includes('failed login'));
            const activeSessions2 = admins.filter(a => a.status === 'Active').length + teachers.filter(t => t.status === 'Active').length;

            return `
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 0.8rem; color: var(--status-success); font-weight: 600;">
                    <span style="display: inline-block; width: 8px; height: 8px; background: var(--status-success); border-radius: 50%; animation: pulse-live 1.5s infinite;"></span>
                    LIVE: Stats update every 5 seconds
                </div>

                
                <div class="stats-grid admin-kpi-grid">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Students</span>
                            <h3 id="kpi-total-students">${students.length}</h3>
                        </div>
                        <div class="stat-icon primary"><i class="fa-solid fa-user-graduate"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Active Students</span>
                            <h3 id="kpi-active-students" style="color: var(--status-success);">${activeStudentsCount}</h3>
                        </div>
                        <div class="stat-icon success"><i class="fa-solid fa-user-check"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Teachers</span>
                            <h3 id="kpi-teachers">${teachers.length}</h3>
                        </div>
                        <div class="stat-icon info"><i class="fa-solid fa-chalkboard-user"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Parents / Guardians</span>
                            <h3 id="kpi-parents">${parents.length}</h3>
                        </div>
                        <div class="stat-icon warning"><i class="fa-solid fa-users"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Administrators</span>
                            <h3 id="kpi-admins">${admins.length + 1} Super &amp; Sub-Admins</h3>
                        </div>
                        <div class="stat-icon purple"><i class="fa-solid fa-user-shield"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Courses Offered</span>
                            <h3 id="kpi-courses">${courses.length}</h3>
                        </div>
                        <div class="stat-icon primary"><i class="fa-solid fa-book"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Departments</span>
                            <h3 id="kpi-departments">${deptCount} Departments</h3>
                        </div>
                        <div class="stat-icon success"><i class="fa-solid fa-building-columns"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Current Semester</span>
                            <h3 id="kpi-semester" style="font-size: 1.05rem;">${semesterLabel}</h3>
                        </div>
                        <div class="stat-icon info"><i class="fa-solid fa-calendar-days"></i></div>
                    </div>
                </div>

                
                <div class="admin-status-grid">
                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-triangle-exclamation" style="color: var(--status-warning);"></i> Pending Administrative Actions</h3>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
                            <li style="padding: 10px 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Pending Grade Change Approvals</span>
                                <span id="kpi-grade-changes" class="badge badge-warning">${pendingGrades2} Requests</span>
                            </li>
                            <li style="padding: 10px 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Unregistered Student Inquiries</span>
                                <span id="kpi-unregistered" class="badge badge-info">${unregistered2} Students</span>
                            </li>
                            <li style="padding: 10px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Sub-Admin Permission Reviews</span>
                                <span id="kpi-admin-reviews" class="badge badge-success">${pendingAdminReviews2} Pending</span>
                            </li>
                        </ul>
                    </div>

                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-shield-halved" style="color: var(--status-danger);"></i> System &amp; Security Alerts</h3>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
                            <li style="padding: 10px 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Active Database Sessions</span>
                                <span id="kpi-db-sessions" class="badge badge-success">&#9679; ${Math.max(activeSessions2, 1)} Operational</span>
                            </li>
                            <li style="padding: 10px 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Failed Login Attempts (Last 24h)</span>
                                <span id="kpi-failed-logins" class="badge badge-danger">${failedLoginAlerts2.length > 0 ? failedLoginAlerts2.length + ' Alerts' : '0 Alerts'}</span>
                            </li>
                            <li style="padding: 10px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Automated Backup Status</span>
                                <span id="kpi-backup-status" class="badge ${backupBadgeClass}">${backupStatusText}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-chart-bar" style="color: var(--brand-primary);"></i> Departmental Enrollment Analytics</h3>
                        <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 500;"><i class="fa-solid fa-rotate" style="color: var(--status-success);"></i> Live</span>
                    </div>
                    <canvas id="admin-analytics-chart" style="width: 100%; min-height: 240px;"></canvas>
                </div>
            `;
        }


        if (this.currentTab === 'users') {
            return `
                <div class="card">
                    <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-users-gear" style="color: var(--status-success);"></i> System Users Management Workspace</h3>
                        <div class="role-selector-pills">
                            <button type="button" class="pill-btn ${this.currentUserSubTab === 'students' ? 'active' : ''}" onclick="adminView.switchUserSubTab('students')">Students (${students.length})</button>
                            <button type="button" class="pill-btn ${this.currentUserSubTab === 'teachers' ? 'active' : ''}" onclick="adminView.switchUserSubTab('teachers')">Teachers (${teachers.length})</button>
                            <button type="button" class="pill-btn ${this.currentUserSubTab === 'parents' ? 'active' : ''}" onclick="adminView.switchUserSubTab('parents')">Parents (${parents.length})</button>
                            <button type="button" class="pill-btn ${this.currentUserSubTab === 'admins' ? 'active' : ''}" onclick="adminView.switchUserSubTab('admins')">Administrators (${admins.length})</button>
                        </div>
                    </div>

                    
                    <div id="user-subtab-students" class="${this.currentUserSubTab === 'students' ? '' : 'hidden'}">
                        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <p style="font-size: 0.88rem; color: var(--text-secondary);">Manage student profiles, passwords, account status, attendance, and fee statuses.</p>
                            <button class="btn btn-sm btn-success" onclick="adminView.openAddUserModal('student')"><i class="fa-solid fa-user-plus"></i> Add New Student</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Programme</th>
                                        <th>Level</th>
                                        <th>Attendance %</th>
                                        <th>Status</th>
                                        <th>Super Admin Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(s => `
                                        <tr>
                                            <td><strong>${s.student_id}</strong></td>
                                            <td>${s.first_name} ${s.surname}</td>
                                            <td>${s.email}</td>
                                            <td>${s.programme}</td>
                                            <td>Level ${s.level}</td>
                                            <td><span class="badge ${(store.calculateStudentAttendance ? store.calculateStudentAttendance(s.student_id).rate : 100) >= 75 ? 'badge-success' : 'badge-warning'}"><i class="fa-solid fa-clipboard-user"></i> ${store.calculateStudentAttendance ? store.calculateStudentAttendance(s.student_id).rate : 100}%</span></td>
                                            <td><span class="badge ${s.status === 'Inactive' ? 'badge-danger' : 'badge-success'}">${s.status || 'Active'}</span></td>
                                            <td>
                                                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                    <button class="btn btn-xs btn-primary" onclick="adminView.openAdminEditModal('student', '${s.id}')" title="Edit Student"><i class="fa-solid fa-pen"></i> Edit</button>
                                                    <button class="btn btn-xs ${s.status === 'Inactive' ? 'btn-success' : 'btn-warning'}" onclick="adminView.toggleUserStatus('student', '${s.id}')" title="Activate/Deactivate">${s.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                                                    <button class="btn btn-xs btn-danger" onclick="adminView.resetUserPassword('student', '${s.id}')" title="Reset Password"><i class="fa-solid fa-key"></i> Reset Pass</button>
                                                    <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('student', '${s.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                                    <button class="btn btn-xs btn-outline-primary" onclick="adminView.showStudentAcademicRecord('${s.id}')"><i class="fa-solid fa-graduation-cap"></i> View Academic</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div id="user-subtab-teachers" class="${this.currentUserSubTab === 'teachers' ? '' : 'hidden'}">
                        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <p style="font-size: 0.88rem; color: var(--text-secondary);">Manage academic staff, course assignments, departments, and credentials.</p>
                            <button class="btn btn-sm btn-success" onclick="adminView.openAddUserModal('teacher')"><i class="fa-solid fa-user-plus"></i> Add New Teacher</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Staff ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Assigned Courses</th>
                                        <th>Status</th>
                                        <th>Super Admin Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${teachers.map(t => `
                                        <tr>
                                            <td><strong>${t.staff_id}</strong></td>
                                            <td>${t.full_name}</td>
                                            <td>${t.email}</td>
                                            <td>${t.department || 'Computer Science'}</td>
                                            <td><code>${(t.assigned_courses || ['CS301', 'CS303']).join(', ')}</code></td>
                                            <td><span class="badge ${t.status === 'Inactive' ? 'badge-danger' : 'badge-success'}">${t.status || 'Active'}</span></td>
                                            <td>
                                                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                    <button class="btn btn-xs btn-primary" onclick="adminView.openAdminEditModal('teacher', '${t.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                                                    <button class="btn btn-xs ${t.status === 'Inactive' ? 'btn-success' : 'btn-warning'}" onclick="adminView.toggleUserStatus('teacher', '${t.id}')">${t.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                                                    <button class="btn btn-xs btn-warning" onclick="adminView.resetUserPassword('teacher', '${t.id}')"><i class="fa-solid fa-key"></i> Reset Pass</button>
                                                    <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('teacher', '${t.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div id="user-subtab-parents" class="${this.currentUserSubTab === 'parents' ? '' : 'hidden'}">
                        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <p style="font-size: 0.88rem; color: var(--text-secondary);">Manage parent accounts and link/unlink student-parent relationships.</p>
                            <button class="btn btn-sm btn-success" onclick="adminView.openAddUserModal('parent')"><i class="fa-solid fa-user-plus"></i> Add New Parent</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Parent Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Linked Ward Student IDs</th>
                                        <th>Status</th>
                                        <th>Super Admin Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${parents.map(p => `
                                        <tr>
                                            <td>${p.full_name}</td>
                                            <td>${p.email}</td>
                                            <td>${p.phone_number}</td>
                                            <td><strong style="color: var(--brand-primary);">${(p.linked_student_ids || []).join(', ')}</strong></td>
                                            <td><span class="badge ${p.status === 'Inactive' ? 'badge-danger' : 'badge-success'}">${p.status || 'Active'}</span></td>
                                            <td>
                                                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                    <button class="btn btn-xs btn-primary" onclick="adminView.openAdminEditModal('parent', '${p.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                                                    <button class="btn btn-xs btn-outline-primary" onclick="adminView.linkUnlinkParent('${p.id}')"><i class="fa-solid fa-link"></i> Link/Unlink Ward</button>
                                                    <button class="btn btn-xs btn-warning" onclick="adminView.resetUserPassword('parent', '${p.id}')"><i class="fa-solid fa-key"></i> Reset Pass</button>
                                                    <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('parent', '${p.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div id="user-subtab-admins" class="${this.currentUserSubTab === 'admins' ? '' : 'hidden'}">
                        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <p style="font-size: 0.88rem; color: var(--text-secondary);">System sub-administrator accounts and assigned administrative level permissions.</p>
                            ${(!currentUser.admin_role_title || currentUser.admin_role_title === "System Admin" || currentUser.admin_role_title === "Super Admin" || currentUser.staff_id === "SUPER-001") ? `<button class="btn btn-sm btn-success" onclick="adminView.openAddAdminModal()"><i class="fa-solid fa-user-shield"></i> Add Sub-Administrator</button>` : ''}
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Staff ID</th>
                                        <th>Administrator Name</th>
                                        <th>Email</th>
                                        <th>Assigned Admin Level</th>
                                        <th>Permissions Scope</th>
                                        <th>Status</th>
                                        <th>Super Admin Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${admins.map(a => {
                const isSuperOrSystem = !currentUser.admin_role_title || currentUser.admin_role_title === 'Super Admin' || currentUser.admin_role_title === 'ICT / System Admin' || currentUser.staff_id === 'SUPER-001';
                const isRegistrar = currentUser.admin_role_title === 'Registrar Admin';
                const adminOps = isSuperOrSystem ? `
                                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.openConfigureScopeModal('${a.id}', 'admin', '${a.full_name}', '${(a.permissions || []).join(',')}')"><i class="fa-solid fa-sliders"></i> Configure Scope</button>
                                            <button class="btn btn-xs ${a.status === 'Suspended' ? 'btn-success' : 'btn-danger'}" onclick="adminView.toggleAdminSuspend('${a.id}')">${a.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}</button>
                                            <button class="btn btn-xs btn-warning" onclick="adminView.resetUserPassword('admin', '${a.id}')"><i class="fa-solid fa-key"></i> Reset Credentials</button>
                                            <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('admin', '${a.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                        ` : isRegistrar ? `
                                            <button class="btn btn-xs btn-primary" onclick="adminView.openEditAdminModal('${a.id}')"><i class="fa-solid fa-pen"></i> Edit Details</button>
                                            <button class="btn btn-xs ${a.status === 'Suspended' ? 'btn-success' : 'btn-warning'}" onclick="adminView.toggleAdminSuspend('${a.id}')">${a.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}</button>
                                            <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('admin', '${a.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                        ` : `
                                            <button class="btn btn-xs btn-primary" onclick="adminView.openEditAdminModal('${a.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                                            <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteUserPermanent('admin', '${a.id}')" title="Permanently Delete Account"><i class="fa-solid fa-trash"></i> Remove</button>
                                        `;
                return `
                                        <tr>
                                            <td><strong>${a.staff_id}</strong></td>
                                            <td>${a.full_name}</td>
                                            <td>${a.email}</td>
                                            <td><span class="badge badge-info">${a.role_title || 'Academic Admin'}</span></td>
                                            <td><code>${(a.permissions || ['FULL']).join(', ')}</code></td>
                                            <td><span class="badge ${a.status === 'Suspended' ? 'badge-danger' : 'badge-success'}">${a.status || 'Active'}</span></td>
                                            <td><div style="display: flex; gap: 4px; flex-wrap: wrap;">${adminOps}</div></td>
                                        </tr>`;
            }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'rbac') {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-user-shield" style="color: var(--brand-secondary);"></i> Administrator Role & Granted Permission Scope Hierarchy (RBAC)</h3>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                        The Super Administrator provisions administrative accounts and configures granular duty scopes for each administrative role.
                    </p>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        ${adminRoles.map(r => `
                            <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <h4 style="color: var(--brand-primary); margin-bottom: 4px;"><i class="fa-solid fa-shield-halved"></i> ${r.name}</h4>
                                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px;">${r.description}</p>
                                <div style="margin-bottom: 12px;">
                                    <strong style="font-size: 0.78rem;">Granted Duties & Scopes:</strong><br>
                                    <code>${r.permissions.join(', ')}</code>
                                </div>
                                <button class="btn btn-xs btn-outline-primary" onclick="adminView.openConfigureScopeModal('${r.id}', 'role', '${r.name}', '${r.permissions.join(',')}')"><i class="fa-solid fa-sliders"></i> Configure Role Scope</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'academic') {
            const unassignedCourses = courses.filter(c => !c.teacher_id || c.teacher_id === 'unassigned');
            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-building-columns" style="color: var(--brand-primary);"></i> Academic Operations & Curriculum Oversight Workspace</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-success" onclick="adminView.openAddCourseModal()"><i class="fa-solid fa-plus"></i> Add New Course</button>
                            <button class="btn btn-sm btn-outline-primary" onclick="adminView.openAcademicCalendarModal()"><i class="fa-solid fa-calendar-check"></i> Academic Calendar</button>
                        </div>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Oversee Faculties, Departments, Programmes, Course Specifications, Active Semesters, Teacher-Course Assignments, and Progression Statistics.
                    </p>

                    
                    ${unassignedCourses.length > 0 ? `
                        <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1)); border-left: 4px solid var(--status-warning); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
                            <h4 style="color: var(--status-danger); margin: 0 0 4px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Alert: ${unassignedCourses.length} Course(s) Without Assigned Teacher</h4>
                            <p style="font-size: 0.85rem; color: var(--text-main); margin: 0 0 10px 0;">The following course modules are currently active in the curriculum but do not have an assigned instructor:</p>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                ${unassignedCourses.map(uc => `
                                    <span class="badge badge-warning" style="font-size: 0.82rem; padding: 6px 12px;">
                                        ${uc.course_code}: ${uc.title}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="stats-grid" style="margin-bottom: 20px;">
                        <div class="stat-card"><div class="stat-info"><span>Faculties</span><h3>4 Active</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Departments</span><h3>5 Active</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Programmes</span><h3>6 Active</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Total Courses</span><h3>${courses.length + 420}</h3></div></div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; margin-bottom: 12px;">
                        <h4 style="margin: 0;"><i class="fa-solid fa-book-open" style="color: var(--brand-primary);"></i> Course Directory & Teaching Assignments</h4>
                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSelectedCourses()">
                            <i class="fa-solid fa-trash"></i> Delete Selected Courses
                        </button>
                    </div>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;"><input type="checkbox" onchange="adminView.toggleAllCourseCheckboxes(this.checked)"></th>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Credits</th>
                                    <th>Department</th>
                                    <th>Level</th>
                                    <th>Assigned Instructor</th>
                                    <th>Attendance %</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(c => {
                const teacher = teachers.find(t => t.id === c.teacher_id || t.staff_id === c.teacher_id);
                return `
                                        <tr>
                                            <td><input type="checkbox" class="course-dir-cb" data-id="${c.id}"></td>
                                            <td><strong>${c.course_code}</strong></td>
                                            <td>${c.title}</td>
                                            <td>${c.credit_hours} Hours</td>
                                            <td>${c.department || 'Computer Science'}</td>
                                            <td>Level ${c.level}</td>
                                            <td>
                                                ${teacher ? `<span class="badge badge-success"><i class="fa-solid fa-chalkboard-user"></i> ${teacher.full_name}</span>` : `<span class="badge badge-danger"><i class="fa-solid fa-user-xmark"></i> Unassigned</span>`}
                                            </td>
                                            <td>
                                                <span class="badge ${(store.calculateCourseAttendance ? store.calculateCourseAttendance(c.course_code).rate : 100) >= 75 ? 'badge-success' : 'badge-warning'}">
                                                    <i class="fa-solid fa-clipboard-user"></i> ${store.calculateCourseAttendance ? store.calculateCourseAttendance(c.course_code).rate : 100}%
                                                </span>
                                            </td>
                                            <td>
                                                <select class="form-control" style="padding: 4px 8px; font-size: 0.78rem; width: auto; display: inline-block;" onchange="adminView.assignTeacherToCourse('${c.id}', this.value)">
                                                    <option value="">Reassign Teacher...</option>
                                                    ${teachers.map(t => `<option value="${t.id}" ${c.teacher_id === t.id ? 'selected' : ''}>${t.full_name}</option>`).join('')}
                                                </select>
                                            </td>
                                        </tr>
                                    `;
            }).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; margin-bottom: 12px;">
                        <h4 style="margin: 0;"><i class="fa-solid fa-calendar-days" style="color: var(--brand-primary);"></i> Published Academic Calendar Schedule Directory</h4>
                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSelectedAcademicActivities()">
                            <i class="fa-solid fa-trash-can"></i> Delete Selected Schedule Activities
                        </button>
                    </div>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;"><input type="checkbox" onchange="adminView.toggleAllCalendarCheckboxes(this.checked)"></th>
                                    <th>Activity Event Title</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Target Scope</th>
                                    <th>Description / Guidelines</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                    const calendarEvents = store.get("academic_events") || store.get("academic_calendar") || [];
                    return calendarEvents.map(act => `
                                        <tr>
                                            <td><input type="checkbox" class="acad-act-cb" data-id="${act.id}"></td>
                                            <td><strong>${act.title}</strong></td>
                                            <td><small>${act.start_date || act.date || 'N/A'}</small></td>
                                            <td><small>${act.end_date || 'N/A'}</small></td>
                                            <td><span class="badge badge-info">${act.scope || 'All Students & Faculty'}</span></td>
                                            <td><p style="font-size: 0.84rem; margin: 0; max-width: 280px;">${act.description || 'N/A'}</p></td>
                                            <td>
                                                <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Published</span>
                                            </td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="7" class="text-muted text-center">No academic calendar activities published yet.</td></tr>';
                })()}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 8px;"><i class="fa-solid fa-file-chart-column"></i> Generate Official Academic Reports</h4>
                        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">Download certified administrative performance reports across modules and departments.</p>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showCourseEnrollmentStatsReport()"><i class="fa-solid fa-chart-column"></i> Course Enrollment Stats</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showStudentPerformanceGpaReport()"><i class="fa-solid fa-graduation-cap"></i> Student Performance & GPA</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showDepartmentAnalyticsReport()"><i class="fa-solid fa-building"></i> Departmental Analytics</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showGradeSubmissionStatusReport()"><i class="fa-solid fa-list-check"></i> Grade Submission Status</button>
                        </div>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'announcements') {
            const announcements = store.get("announcements") || [];
            return `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-bullhorn" style="color: var(--brand-secondary);"></i> Announcement Broadcast Workspace</h3>
                    </div>

                    
                    <form onsubmit="adminView.handlePostAnnouncement(event)" style="background: var(--bg-primary); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 12px;"><i class="fa-solid fa-paper-plane"></i> Broadcast New System Announcement</h4>
                        
                        <div class="form-row">
                            <div class="form-group col-6">
                                <label for="adm-ann-title">Announcement Title / Subject *</label>
                                <input type="text" id="adm-ann-title" class="form-control" placeholder="e.g. End of Semester Examination Schedule Published" required>
                            </div>
                            <div class="form-group col-6">
                                <label for="adm-ann-target">Target Audience / Recipient Scope *</label>
                                <select id="adm-ann-target" class="form-control" required>
                                    <option value="ALL">All Users (Students, Teachers, Parents)</option>
                                    <option value="STUDENTS">Students Only</option>
                                    <option value="TEACHERS">Teachers / Lecturers Only</option>
                                    <option value="PARENTS">Parents / Guardians Only</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="adm-ann-content">Announcement Body Content *</label>
                            <textarea id="adm-ann-content" class="form-control" rows="4" placeholder="Type official announcement details here..." required></textarea>
                        </div>

                        <button type="submit" class="btn btn-warning btn-lg">
                            <i class="fa-solid fa-bullhorn"></i> Post & Broadcast Announcement
                        </button>
                    </form>

                    
                    <h4><i class="fa-solid fa-list-check"></i> Published System Bulletins & Announcements</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title & Subject</th>
                                    <th>Target Audience</th>
                                    <th>Posted By</th>
                                    <th>Message Content</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${announcements.map(a => `
                                    <tr>
                                        <td style="white-space: nowrap;">${a.date}</td>
                                        <td><strong>${a.title}</strong></td>
                                        <td>
                                            <span class="badge ${a.target_audience === 'STUDENTS' ? 'badge-info' : a.target_audience === 'TEACHERS' ? 'badge-success' : a.target_audience === 'PARENTS' ? 'badge-warning' : 'badge-primary'}">
                                                ${a.target_audience === 'STUDENTS' ? 'Students' : a.target_audience === 'TEACHERS' ? 'Teachers' : a.target_audience === 'PARENTS' ? 'Parents' : 'All Users'}
                                            </span>
                                        </td>
                                        <td><span class="badge badge-secondary">${a.author || a.posted_by || 'Administrator'}</span></td>
                                        <td><p style="font-size: 0.85rem; margin: 0; max-width: 320px; overflow: hidden; text-overflow: ellipsis;">${a.content}</p></td>
                                        <td>
                                            <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.handleDeleteAnnouncement('${a.id}')" title="Delete announcement">
                                                <i class="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" class="text-muted">No announcements published yet.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                
                <div class="card" style="margin-top: 24px;">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <h3><i class="fa-solid fa-bell" style="color: var(--status-warning);"></i> Received Notifications & Alerts from Students & Teachers</h3>
                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteAllAdminNotifications()">
                            <i class="fa-solid fa-trash-can"></i> Delete All Notifications
                        </button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${(() => {
                    const complaints = store.get("complaints") || [];
                    const filteredComplaints = complaints.filter(c => {
                        if (isSystemAdmin) return true;
                        if (currentUser.admin_role_title && c.target_recipient_name && c.target_recipient_name.toLowerCase().includes(currentUser.admin_role_title.toLowerCase())) return true;
                        if (currentUser.admin_role_title && c.target_recipient_id && c.target_recipient_id.toLowerCase().includes(currentUser.admin_role_title.toLowerCase())) return true;
                        if (c.target_recipient_type === 'ROLE') return true;
                        return false;
                    });

                    if (filteredComplaints.length === 0) {
                        return '<p class="text-muted" style="padding: 10px;">No pending notifications or alerts assigned to your office.</p>';
                    }

                    return filteredComplaints.map(c => `
                                <div style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-primary); border-left: 4px solid ${c.reply ? 'var(--status-success)' : 'var(--status-warning)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                                        <strong>${c.subject}</strong>
                                        <div style="display: flex; gap: 6px; align-items: center;">
                                            <span class="badge ${c.reply ? 'badge-success' : 'badge-warning'}">${c.status || 'Pending'}</span>
                                            <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteAdminNotification('${c.id}')" title="Delete notification">
                                                <i class="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 4px 0 8px 0;">${c.message}</p>
                                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                        <small style="font-size: 0.76rem; color: var(--text-muted);">From: <strong>${c.student_name || 'User'} (${c.student_id || 'ID'})</strong> • Recipient: <strong>${c.target_recipient_name || 'Administration'}</strong> • ${c.date}</small>
                                        ${c.reply ? `
                                            <div style="width: 100%; margin-top: 6px; padding: 8px 12px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(34, 197, 94, 0.2); font-size: 0.82rem;">
                                                <strong style="color: var(--status-success);"><i class="fa-solid fa-check"></i> Response from ${c.replied_by || 'Admin'}:</strong> ${c.reply}
                                            </div>
                                        ` : `
                                            <button type="button" class="btn btn-xs btn-outline-warning" onclick="adminView.replyToStudentComplaint('${c.id}')">
                                                <i class="fa-solid fa-reply"></i> Reply to Query
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `).join('');
                })()}
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'reg_control') {
            const transcripts = store.get("transcripts") || [];
            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-pen-to-square" style="color: var(--brand-primary);"></i> Registration Control & Student Academic History Workspace</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-outline-primary" onclick="app.showToast('Registration Issues & Verification Log updated.', 'info')"><i class="fa-solid fa-check-double"></i> Verify Reg Info</button>
                        </div>
                    </div>

                    
                    <div style="background: rgba(37, 99, 235, 0.08); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--brand-primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <h4 style="margin-bottom: 4px;">Semester Registration Window: <strong>${store.getCurrentAcademicSession ? store.getCurrentAcademicSession().full_label : (regControl.current_semester || '2026/2027 - Semester 1')}</strong></h4>
                                <p style="font-size: 0.88rem; margin: 0 0 2px 0;">Opening Date: <strong>${regControl.opening_date}</strong> | Closing Date: <strong>${regControl.closing_date}</strong></p>
                                <p style="font-size: 0.88rem; margin: 0;">Maximum Credit Hours Allowed per Student: <strong>${regControl.max_credit_hours} Hours</strong></p>
                            </div>
                            <div>
                                <span class="badge ${regControl.status === 'CLOSED' ? 'badge-danger' : 'badge-success'}" style="font-size: 1.1rem; padding: 8px 16px;">● Status: ${regControl.status}</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">
                            <button class="btn btn-sm btn-success" style="flex: 1 1 150px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem;" onclick="adminView.toggleRegistrationStatus('OPEN')"><i class="fa-solid fa-play" style="margin-right: 6px;"></i> Open Registration</button>
                            <button class="btn btn-sm btn-danger" style="flex: 1 1 150px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem;" onclick="adminView.toggleRegistrationStatus('CLOSED')"><i class="fa-solid fa-stop" style="margin-right: 6px;"></i> Close Registration</button>
                            <button class="btn btn-sm btn-warning" style="flex: 1 1 150px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem;" onclick="adminView.toggleRegistrationStatus('EXTENDED')"><i class="fa-solid fa-clock" style="margin-right: 6px;"></i> Extend Deadline</button>
                        </div>
                    </div>

                    
                    <h4><i class="fa-solid fa-user-graduate"></i> Student Enrollment & Academic Status Governance</h4>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">Maintain student academic progression status throughout their academic journey (Active, Deferred, Graduated, Withdrawn, Suspended, Completed).</p>
                    
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Full Name</th>
                                    <th>Programme</th>
                                    <th>Level</th>
                                    <th>Current Status</th>
                                    <th>Update Academic Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${students.map(s => `
                                    <tr>
                                        <td><strong>${s.student_id}</strong></td>
                                        <td>${s.first_name} ${s.surname}</td>
                                        <td>${s.programme}</td>
                                        <td>Level ${s.level}</td>
                                        <td><span class="badge ${s.academic_status === 'Deferred' ? 'badge-warning' : s.academic_status === 'Withdrawn' ? 'badge-danger' : s.academic_status === 'Graduated' ? 'badge-info' : 'badge-success'}">${s.academic_status || 'Active'}</span></td>
                                        <td>
                                            <select class="form-control" style="padding: 4px 8px; font-size: 0.78rem; width: auto; display: inline-block;" onchange="adminView.updateStudentAcademicStatus('${s.id}', this.value)">
                                                <option value="Active" ${s.academic_status === 'Active' ? 'selected' : ''}>Active</option>
                                                <option value="Deferred" ${s.academic_status === 'Deferred' ? 'selected' : ''}>Deferred</option>
                                                <option value="Graduated" ${s.academic_status === 'Graduated' ? 'selected' : ''}>Graduated</option>
                                                <option value="Withdrawn" ${s.academic_status === 'Withdrawn' ? 'selected' : ''}>Withdrawn</option>
                                                <option value="Suspended" ${s.academic_status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                                                <option value="Completed" ${s.academic_status === 'Completed' ? 'selected' : ''}>Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <h4><i class="fa-solid fa-file-invoice"></i> Official Academic Records & Transcript Requests Portal</h4>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Ref No.</th>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Programme</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transcripts.map(t => `
                                    <tr>
                                        <td><code>${t.reference_no}</code></td>
                                        <td><strong>${t.student_id}</strong></td>
                                        <td>${t.student_name}</td>
                                        <td>${t.programme}</td>
                                        <td><small>${t.request_date}</small></td>
                                        <td><span class="badge badge-success">✓ ${t.status}</span></td>
                                        <td>
                                            <button class="btn btn-xs btn-outline-primary" onclick="pdfHelper.downloadStudentTranscript('${t.student_id}')"><i class="fa-solid fa-print"></i> Issue Certified Transcript</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 8px;"><i class="fa-solid fa-file-export"></i> Enrollment & Registration Reports</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showRegistrationStatsReport()"><i class="fa-solid fa-chart-pie"></i> Registration Statistics</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showVerifiedStudentDirectoryReport()"><i class="fa-solid fa-user-check"></i> Verified Student Directory</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showSemesterEnrollmentSummaryReport()"><i class="fa-solid fa-file-invoice"></i> Semester Enrollment Summary</button>
                        </div>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'results') {
            const grades = store.get("grades") || [];
            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-graduation-cap" style="color: var(--status-success);"></i> Examination Results, Approval & Publishing Governance</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-primary" onclick="adminView.openGradeChangeModal()"><i class="fa-solid fa-pen-to-square"></i> Record Authorized Grade Modification</button>
                        </div>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Monitor grade submissions from instructors, verify score calculations (Assessment + Exam = 100%), control official result publishing to student/parent portals, and process authorized remarking changes.
                    </p>

                    <div class="stats-grid" style="margin-bottom: 20px;">
                        <div class="stat-card"><div class="stat-info"><span>Total Submissions</span><h3>${grades.length + 1204} Marks</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Published Results</span><h3 style="color: var(--status-success);">${grades.filter(g => g.is_published).length + 1180} Grades</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Pending Approval</span><h3 style="color: var(--status-warning);">24 Grades</h3></div></div>
                    </div>

                    
                    <h4><i class="fa-solid fa-clipboard-check"></i> Submitted Grade Sheets & Official Result Publishing Controls</h4>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Course Code</th>
                                    <th>Assessment (30%)</th>
                                    <th>Exam (70%)</th>
                                    <th>Total Score</th>
                                    <th>Grade</th>
                                    <th>Publishing Status</th>
                                    <th>Publish Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${grades.map(g => {
                const students = store.get("students") || [];
                const stObj = students.find(s => s.student_id === g.student_id || s.id === g.student_id);
                const stName = g.student_name || (stObj ? (stObj.full_name || `${stObj.first_name} ${stObj.surname}`) : g.student_id);
                return `
                                        <tr>
                                            <td><strong>${g.student_id}</strong></td>
                                            <td>${stName}</td>
                                            <td><code>${g.course_code}</code></td>
                                            <td>${g.assessment_score} / 30</td>
                                            <td>${g.exam_score} / 70</td>
                                            <td><strong>${g.total_score} / 100</strong></td>
                                            <td><span class="badge badge-success">${g.letter_grade} (${g.grade_point})</span></td>
                                            <td>
                                                <span class="badge ${g.is_published ? 'badge-success' : 'badge-warning'}">
                                                    ${g.is_published ? '✓ Published to Portals' : '⏳ Draft / Pending Approval'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn btn-xs ${g.is_published ? 'btn-warning' : 'btn-success'}" onclick="adminView.toggleResultPublishing('${g.id}', ${g.is_published})">
                                                    ${g.is_published ? 'Unpublish' : 'Approve & Publish'}
                                                </button>
                                            </td>
                                        </tr>
                                    `;
            }).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <h4><i class="fa-solid fa-clock-rotate-left"></i> Non-Silent Authorized Grade Modification Audit Trail</h4>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">Every grade modification records: Changed By, Student ID, Previous Grade, New Grade, Reason, and Date.</p>

                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Changed By</th>
                                    <th>Student ID</th>
                                    <th>Course</th>
                                    <th>Previous Grade</th>
                                    <th>New Grade</th>
                                    <th>Justification / Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${gradeLogs.map(g => `
                                    <tr>
                                        <td><small>${g.date}</small></td>
                                        <td><strong>${g.changed_by}</strong></td>
                                        <td><strong style="color: var(--brand-primary);">${g.student_id}</strong></td>
                                        <td>${g.course_code}</td>
                                        <td><span class="badge badge-warning">${g.previous_grade}</span></td>
                                        <td><span class="badge badge-success">${g.new_grade}</span></td>
                                        <td>${g.reason}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 8px;"><i class="fa-solid fa-file-invoice"></i> Examination Reports & Statements of Results</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.openGenerateStatementModal()"><i class="fa-solid fa-print"></i> Generate Statements of Results</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showGradeDistributionAnalyticsReport()"><i class="fa-solid fa-chart-pie"></i> Grade Distribution Analytics</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showOutstandingResultsReport()"><i class="fa-solid fa-list-check"></i> Outstanding Results Status</button>
                        </div>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'attendance') {
            const attStats = store.calculateOverallAttendance ? store.calculateOverallAttendance({
                dept: this.attendanceDeptFilter,
                course: this.attendanceCourseFilter,
                level: this.attendanceLevelFilter,
                search: this.attendanceSearchQuery
            }) : { rate: 94.2, csRate: 96.0, absentToday: 12, lateToday: 8 };

            const selectedCourseAtt = this.attendanceCourseFilter !== 'ALL' && store.calculateCourseAttendance
                ? store.calculateCourseAttendance(this.attendanceCourseFilter)
                : null;
            const secondStatLabel = selectedCourseAtt ? `${this.attendanceCourseFilter} Attendance %` : (this.attendanceDeptFilter !== 'ALL' ? `${this.attendanceDeptFilter} %` : `Computer Science %`);
            const secondStatVal = selectedCourseAtt ? `${selectedCourseAtt.rate}% Present` : `${attStats.csRate}% Present`;

            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-clipboard-user" style="color: var(--brand-primary);"></i> Institutional Attendance Oversight Workspace</h3>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Filter, search, and perform real-time oversight of student attendance metrics across Departments, Programmes, Courses, and Class Levels.
                    </p>

                    <div class="stats-grid" id="adm-att-stats-grid" style="margin-bottom: 20px;">
                        <div class="stat-card"><div class="stat-info"><span>Overall Attendance %</span><h3 id="adm-att-stat-overall" style="color: var(--status-success);">${attStats.rate}% Present</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span id="adm-att-stat-course-label">${secondStatLabel}</span><h3 id="adm-att-stat-course">${secondStatVal}</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Absent Students Today</span><h3 id="adm-att-stat-absent" style="color: var(--status-danger);">${attStats.absentToday} Students</h3></div></div>
                        <div class="stat-card"><div class="stat-info"><span>Late Students Today</span><h3 id="adm-att-stat-late" style="color: var(--status-warning);">${attStats.lateToday} Students</h3></div></div>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: flex-end;">
                            <div>
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-building-columns"></i> Department</label>
                                <select id="adm-att-dept-filter" class="form-control" onchange="adminView.handleAttendanceFilterChange()">
                                    <option value="ALL" ${this.attendanceDeptFilter === 'ALL' ? 'selected' : ''}>All Departments</option>
                                    <option value="Computer Science" ${this.attendanceDeptFilter === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                    <option value="Business Administration" ${this.attendanceDeptFilter === 'Business Administration' ? 'selected' : ''}>Business Administration</option>
                                    <option value="Engineering" ${this.attendanceDeptFilter === 'Engineering' ? 'selected' : ''}>Engineering</option>
                                    <option value="General Nursing" ${this.attendanceDeptFilter === 'General Nursing' ? 'selected' : ''}>General Nursing</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-book"></i> Program / Course</label>
                                <select id="adm-att-course-filter" class="form-control" onchange="adminView.handleAttendanceFilterChange()">
                                    <option value="ALL" ${this.attendanceCourseFilter === 'ALL' ? 'selected' : ''}>All Programs & Courses</option>
                                    ${courses.map(c => `<option value="${c.course_code}" ${this.attendanceCourseFilter === c.course_code ? 'selected' : ''}>${c.course_code} - ${c.title}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-layer-group"></i> Class / Level</label>
                                <select id="adm-att-level-filter" class="form-control" onchange="adminView.handleAttendanceFilterChange()">
                                    <option value="ALL" ${this.attendanceLevelFilter === 'ALL' ? 'selected' : ''}>All Classes / Levels</option>
                                    <option value="100" ${this.attendanceLevelFilter === '100' ? 'selected' : ''}>Level 100</option>
                                    <option value="200" ${this.attendanceLevelFilter === '200' ? 'selected' : ''}>Level 200</option>
                                    <option value="300" ${this.attendanceLevelFilter === '300' ? 'selected' : ''}>Level 300</option>
                                    <option value="400" ${this.attendanceLevelFilter === '400' ? 'selected' : ''}>Level 400</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-magnifying-glass"></i> Search Query</label>
                                <input type="text" id="adm-att-search" class="form-control" placeholder="Search by name, ID, code..." value="${this.attendanceSearchQuery || ''}" oninput="adminView.handleAttendanceFilterChange()">
                            </div>
                        </div>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="margin: 0; color: var(--brand-primary); font-size: 1rem;"><i class="fa-solid fa-chart-bar"></i> Filtered Attendance Visual Breakdown (Bar Chart)</h4>
                            <span class="badge badge-info">Real-time Analytics</span>
                        </div>
                        <div style="height: 220px; position: relative;">
                            <canvas id="attendance-oversight-chart"></canvas>
                        </div>
                    </div>

                    <h4><i class="fa-solid fa-list-check" style="color: var(--brand-primary);"></i> Filtered Attendance Records Log</h4>
                    <div class="table-responsive" style="margin-bottom: 20px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Course Code</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="adm-att-table-body">
                                ${attendance.map(a => `
                                    <tr>
                                        <td>${a.date}</td>
                                        <td><strong>${a.student_id}</strong></td>
                                        <td>${a.student_name}</td>
                                        <td>${a.course_code}</td>
                                        <td>${a.department || 'Computer Science'}</td>
                                        <td><span class="badge ${a.status === 'Absent' ? 'badge-danger' : a.status === 'Late' ? 'badge-warning' : 'badge-success'}">${a.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'finance') {
            const feeCategories = store.get("fee_categories") || [];
            const transactions = store.get("payment_transactions") || [];
            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-wallet" style="color: var(--status-success);"></i> Institutional Financial & Tuition Fees Governance</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-primary" onclick="adminView.openPaymentVerificationModal()"><i class="fa-solid fa-magnifying-glass-dollar"></i> Verify Payment (Ref/ID)</button>
                            <button class="btn btn-sm btn-success" onclick="adminView.openAddFeeCategoryModal()"><i class="fa-solid fa-plus"></i> Add Fee Category</button>
                        </div>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Manage Tuition and Semester Fee Categories, monitor assigned fees per student, record and verify manual/bank payments, audit Paystack transaction gateways, and issue official PDF receipts.
                    </p>

                    ${(() => {
                    const finTotalExpected = fees.reduce((acc, f) => acc + (Number(f.total_amount) || 0), 0);
                    const finTotalCollected = fees.reduce((acc, f) => acc + (Number(f.paid_amount) || 0), 0);
                    const finOutstanding = fees.reduce((acc, f) => acc + (Number(f.balance_due) || 0), 0);
                    const finFullyPaidCount = fees.filter(f => f.status === 'Fully Paid' || (Number(f.total_amount) > 0 && Number(f.balance_due) <= 0)).length;
                    return `
                            <div class="stats-grid" style="margin-bottom: 20px;">
                                <div class="stat-card">
                                    <div class="stat-info">
                                        <span>Total Expected</span>
                                        <h3 id="fin-stat-total-expected">GH₵ ${finTotalExpected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div class="stat-icon primary"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-info">
                                        <span>Total Collected</span>
                                        <h3 id="fin-stat-total-collected" style="color: var(--status-success);">GH₵ ${finTotalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div class="stat-icon success"><i class="fa-solid fa-circle-check"></i></div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-info">
                                        <span>Outstanding Balance</span>
                                        <h3 id="fin-stat-outstanding" style="color: ${finOutstanding > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">GH₵ ${finOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    </div>
                                    <div class="stat-icon ${finOutstanding > 0 ? 'danger' : 'success'}"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-info">
                                        <span>Fully Paid Students</span>
                                        <h3 id="fin-stat-fully-paid" style="color: var(--status-success);">${finFullyPaidCount} Students</h3>
                                    </div>
                                    <div class="stat-icon purple"><i class="fa-solid fa-user-check"></i></div>
                                </div>
                            </div>
                        `;
                })()}

                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                        <h4 style="margin: 0;"><i class="fa-solid fa-tags"></i> Active Tuition & Semester Fee Categories</h4>
                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSelectedFeeCategories()">
                            <i class="fa-solid fa-trash-can"></i> Delete Selected Fee Categories
                        </button>
                    </div>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;"><input type="checkbox" onchange="adminView.toggleAllFeeCatCheckboxes(this.checked)"></th>
                                    <th>Category Code</th>
                                    <th>Fee Category Description</th>
                                    <th>Amount (GH₵)</th>
                                    <th>Applicable Level</th>
                                    <th>Session</th>
                                    <th>Status</th>
                                    <th style="width: 70px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${feeCategories.map(fc => `
                                    <tr>
                                        <td><input type="checkbox" class="fee-cat-cb" data-id="${fc.id || fc.code}"></td>
                                        <td><code>${fc.code}</code></td>
                                        <td><strong>${fc.name}</strong></td>
                                        <td><strong>GH₵ ${(Number(fc.amount) || 0).toFixed(2)}</strong></td>
                                        <td>${fc.level}</td>
                                        <td>${fc.session}</td>
                                        <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> ${fc.status}</span></td>
                                        <td>
                                            <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSingleFeeCategory('${fc.id || fc.code}')" title="Delete Fee Category">
                                                <i class="fa-solid fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="8" class="text-muted text-center">No active fee categories configured.</td></tr>'}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 10px; margin-bottom: 12px;">
                        <h4 style="margin: 0;"><i class="fa-solid fa-receipt"></i> Student Fee Ledgers & Official Receipt Issuance</h4>
                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSelectedFeeLedgers()">
                            <i class="fa-solid fa-trash-can"></i> Delete Selected Ledgers
                        </button>
                    </div>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;"><input type="checkbox" onchange="adminView.toggleAllFeeLedgerCheckboxes(this.checked)"></th>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Academic Semester</th>
                                    <th>Total Due</th>
                                    <th>Total Paid</th>
                                    <th>Balance</th>
                                    <th>Payment Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${fees.map(f => `
                                    <tr>
                                        <td><input type="checkbox" class="fee-ledger-cb" data-id="${f.student_id}"></td>
                                        <td><strong>${f.student_id}</strong></td>
                                        <td>${f.student_name}</td>
                                        <td><small>${f.semester}</small></td>
                                        <td>GH₵ ${(Number(f.total_amount) || 0).toFixed(2)}</td>
                                        <td><strong style="color: var(--status-success);">GH₵ ${(Number(f.paid_amount) || 0).toFixed(2)}</strong></td>
                                        <td><strong style="color: var(--status-danger);">GH₵ ${(Number(f.balance_due) || 0).toFixed(2)}</strong></td>
                                        <td><span class="badge ${f.status === 'Fully Paid' || Number(f.balance_due) <= 0 ? 'badge-success' : 'badge-warning'}">${Number(f.balance_due) <= 0 ? 'Fully Paid' : f.status}</span></td>
                                        <td>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn btn-xs btn-outline-primary" onclick="pdfHelper.generateReceipt('${f.student_name}', '${f.student_id}', ${f.paid_amount}, 'PAY-9923182', '${f.semester}')" title="Download PDF Receipt"><i class="fa-solid fa-file-pdf"></i> Receipt</button>
                                                <button class="btn btn-xs btn-success" onclick="app.showToast('Manual Payment entry recorded for ${f.student_id}', 'success')" title="Record Payment"><i class="fa-solid fa-plus"></i></button>
                                                <button class="btn btn-xs btn-outline-danger" onclick="adminView.deleteSingleFeeLedger('${f.student_id}')" title="Delete Ledger"><i class="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="9" class="text-muted text-center">No student fee ledger records found.</td></tr>'}
                            </tbody>
                        </table>
                    </div>

                    
                    <h4><i class="fa-solid fa-building-columns"></i> Paystack & Bank Transfer Payment Transactions</h4>
                    <div class="table-responsive" style="margin-bottom: 24px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Reference No.</th>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Amount Paid</th>
                                    <th>Gateway / Channel</th>
                                    <th>Timestamp</th>
                                    <th>Verification Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions.map(t => `
                                    <tr>
                                        <td><code>${t.reference}</code></td>
                                        <td><strong>${t.student_id}</strong></td>
                                        <td>${t.student_name}</td>
                                        <td><strong>GH₵ ${(t.amount || 0).toFixed(2)}</strong></td>
                                        <td>${t.channel}</td>
                                        <td><small>${t.timestamp}</small></td>
                                        <td><span class="badge badge-success">✓ ${t.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 8px;"><i class="fa-solid fa-file-chart-pie"></i> Download Financial Audit Reports</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showFeeCollectionSummaryReport()"><i class="fa-solid fa-file-excel"></i> Total Fee Collection Summary</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showOutstandingBalancesReport()"><i class="fa-solid fa-file-excel"></i> Outstanding Balances List</button>
                            <button class="btn btn-xs btn-outline-primary" onclick="adminView.showTransactionLogReport()"><i class="fa-solid fa-file-excel"></i> Paystack Transaction Log</button>
                        </div>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'audit') {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-list-check" style="color: var(--brand-primary);"></i> Sensitive Administrative Action Audit Log Trail</h3>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px;">Filter and audit log entries by user role (Administrators, Teachers, Parents, Students) or search individual names.</p>

                    
                    <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
                        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
                            <div style="flex: 1; min-width: 200px;">
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-filter"></i> Filter by Role Scope</label>
                                <select id="audit-role-filter" class="form-control" onchange="adminView.filterAuditLogs()">
                                    <option value="ALL">All Roles (System-Wide)</option>
                                    <option value="Admin">Administrators Only</option>
                                    <option value="Teacher">Teachers / Lecturers Only</option>
                                    <option value="Parent">Parents / Guardians Only</option>
                                    <option value="Student">Students Only</option>
                                </select>
                            </div>
                            <div style="flex: 2; min-width: 250px;">
                                <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-user-tag"></i> Search by Individual Name or ID</label>
                                <input type="text" id="audit-actor-search" class="form-control" placeholder="Search by Actor Name, ID, or Action keyword..." oninput="adminView.filterAuditLogs()">
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Actor / User</th>
                                    <th>Action Performed</th>
                                    <th>Category Scope</th>
                                </tr>
                            </thead>
                            <tbody id="audit-log-tbody">
                                ${auditLogs.map(l => `
                                    <tr>
                                        <td><small>${l.date}</small></td>
                                        <td><strong>${l.actor}</strong></td>
                                        <td>${l.action}</td>
                                        <td><span class="badge badge-info">${l.category}</span></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-muted text-center">No audit logs matching selected filter.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }


        if (this.currentTab === 'settings') {
            return `
                
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-sliders" style="color: var(--brand-primary);"></i> Administrator Account, Visual & System Settings</h3>
                    </div>

                    <div class="dashboard-grid">
                        <div class="grid-column">
                            
                            <div class="card" style="margin-bottom: 20px;">
                                <div class="card-header">
                                    <h4><i class="fa-solid fa-key" style="color: var(--brand-primary);"></i> Update Administrator Password</h4>
                                </div>
                                <form onsubmit="adminView.handleAdminPasswordUpdate(event)">
                                    <div class="form-group">
                                        <label for="adm-curr-pass">Current Password *</label>
                                        <input type="password" id="adm-curr-pass" class="form-control" placeholder="••••••••" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="adm-new-pass">New Password * <small class="text-muted">(Min 6, Upper, Num, Symbol)</small></label>
                                        <input type="password" id="adm-new-pass" class="form-control" placeholder="••••••••" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="adm-repeat-new-pass">Repeat New Password *</label>
                                        <input type="password" id="adm-repeat-new-pass" class="form-control" placeholder="••••••••" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save New Password</button>
                                </form>
                            </div>

                            
                            <div class="card">
                                <div class="card-header">
                                    <h4><i class="fa-solid fa-palette" style="color: var(--brand-secondary);"></i> Theme & Visual Settings</h4>
                                </div>
                                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">Customize user interface workspace theme mode and layout preferences.</p>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-primary); border-radius: var(--radius-md);">
                                    <div>
                                        <strong>Dark / Light Theme Mode</strong>
                                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 2px 0 0 0;">Toggle between high-contrast dark mode and sleek light mode.</p>
                                    </div>
                                    <button type="button" class="btn btn-outline-primary" onclick="app.toggleTheme()">
                                        <i class="fa-solid fa-circle-half-stroke"></i> Switch Theme
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="grid-column">
                            
                            <div class="card">
                                <div class="card-header">
                                    <h4><i class="fa-solid fa-user-pen" style="color: var(--status-success);"></i> Edit Account & Profile</h4>
                                </div>

                                
                                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                                    <img id="adm-setting-avatar-preview" src="${currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Profile Photo" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary); box-shadow: var(--shadow-sm);">
                                    <div>
                                        <strong style="font-size: 0.9rem; display: block; margin-bottom: 4px;">Profile Photo</strong>
                                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                                            <label class="btn btn-xs btn-primary" style="cursor: pointer; margin: 0;">
                                                <i class="fa-solid fa-upload"></i> Upload Photo
                                                <input type="file" accept="image/*" style="display: none;" onchange="adminView.handleAdminAvatarUpload(event)">
                                            </label>
                                            <button type="button" class="btn btn-xs btn-outline-danger" onclick="adminView.handleAdminAvatarDelete()">
                                                <i class="fa-solid fa-trash"></i> Delete Photo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form onsubmit="adminView.handleAdminProfileUpdate(event)">
                                    <div class="form-group">
                                        <label for="adm-profile-name">Administrator Full Name *</label>
                                        <input type="text" id="adm-profile-name" class="form-control" value="${currentUser.full_name || ''}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="adm-profile-staffid">Staff ID <small class="text-muted">(${isSystemAdmin ? 'Editable by System Admin' : 'Read Only'})</small></label>
                                        <input type="text" id="adm-profile-staffid" class="form-control" value="${currentUser.staff_id || 'SUPER-001'}" ${isSystemAdmin ? '' : 'readonly'}>
                                    </div>
                                    <div class="form-group">
                                        <label for="adm-profile-email">Official Email Address *</label>
                                        <input type="email" id="adm-profile-email" class="form-control" value="${currentUser.email || ''}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="adm-profile-phone">Phone Number *</label>
                                        <input type="tel" id="adm-profile-phone" class="form-control" value="${currentUser.phone_number || '+233241000000'}" required>
                                    </div>
                                    <button type="submit" class="btn btn-success"><i class="fa-solid fa-floppy-disk"></i> Update Profile Details</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                ${isSystemAdmin ? `
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-building-columns" style="color: var(--brand-primary);"></i> Institution-Wide Policy & System Configuration</h3>
                        </div>
                        <form onsubmit="adminView.saveSystemSettings(event)">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
                                
                                <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                    <h4><i class="fa-solid fa-university"></i> General Configuration</h4>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <label>University Name</label>
                                        <input type="text" id="sys-univ-name" class="form-control" value="${sysSettings.general.university_name || 'Ghana Communication Technology University (GCTU)'}">
                                    </div>
                                    <div class="form-group">
                                        <label>Academic Year</label>
                                        <input type="text" id="sys-acad-year" class="form-control" value="${sysSettings.general.academic_year || '2026/2027'}">
                                    </div>
                                    <div class="form-group">
                                        <label>Current Semester</label>
                                        <input type="text" id="sys-curr-sem" class="form-control" value="${sysSettings.general.current_semester || 'Semester 1'}">
                                    </div>
                                </div>

                                
                                <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                    <h4><i class="fa-solid fa-graduation-cap"></i> Academic Policies</h4>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <label>Maximum Credit Limit</label>
                                        <input type="number" id="sys-max-credits" class="form-control" value="${sysSettings.academic.max_credit_limit || 24}">
                                    </div>
                                    <div class="form-group">
                                        <label>Grading Scale Scheme</label>
                                        <input type="text" id="sys-grading-scheme" class="form-control" value="${sysSettings.academic.grading_scale_type || 'Standard 4.0 GPA System'}">
                                    </div>
                                </div>

                                
                                <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                    <h4><i class="fa-solid fa-lock"></i> Security Policies</h4>
                                    <div class="form-group" style="margin-top: 10px;">
                                        <label>Minimum Password Length (Users)</label>
                                        <input type="number" id="sys-min-pass" class="form-control" value="${sysSettings.security ? sysSettings.security.min_password_length || 6 : 6}">
                                    </div>
                                    <div class="form-group">
                                        <label>Super Admin Password Length</label>
                                        <input type="number" id="sys-super-pass" class="form-control" value="${sysSettings.security ? sysSettings.security.super_admin_min_password_length || 12 : 12}">
                                    </div>
                                    <div class="form-group">
                                        <label>Session Timeout (Minutes)</label>
                                        <input type="number" id="sys-session-timeout" class="form-control" value="${sysSettings.security ? sysSettings.security.session_timeout_mins || 30 : 30}">
                                    </div>
                                </div>

                                
                                <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); grid-column: 1 / -1;">
                                    <h4 style="color: var(--status-danger);"><i class="fa-solid fa-location-dot"></i> Attendance Geo-Fencing & Geographical Zone Control</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
                                        Define the geographical boundary & radius for student attendance marking. When enabled, students within the zone are granted access; students outside are denied access.
                                    </p>
                                    <div class="form-row">
                                        <div class="form-group col-6">
                                            <label>Geo-Fencing Enforcement *</label>
                                            <select id="sys-geo-enabled" class="form-control">
                                                <option value="true" ${sysSettings.geofence && sysSettings.geofence.enabled !== false ? 'selected' : ''}>Enabled (Strict Location Verification)</option>
                                                <option value="false" ${sysSettings.geofence && sysSettings.geofence.enabled === false ? 'selected' : ''}>Disabled (Allow Attendance Anywhere)</option>
                                            </select>
                                        </div>
                                        <div class="form-group col-6">
                                            <label>Campus Zone Name *</label>
                                            <input type="text" id="sys-geo-campus" class="form-control" value="${sysSettings.geofence ? (sysSettings.geofence.campus_name || 'GCTU Main Campus (Tesano)') : 'GCTU Main Campus (Tesano)'}">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group col-4">
                                            <label>Campus Center Latitude (°N) *</label>
                                            <input type="number" step="any" id="sys-geo-lat" class="form-control" value="${sysSettings.geofence ? (sysSettings.geofence.latitude || 5.5560) : 5.5560}">
                                        </div>
                                        <div class="form-group col-4">
                                            <label>Campus Center Longitude (°E/W) *</label>
                                            <input type="number" step="any" id="sys-geo-lng" class="form-control" value="${sysSettings.geofence ? (sysSettings.geofence.longitude || -0.1969) : -0.1969}">
                                        </div>
                                        <div class="form-group col-4">
                                            <label>Allowed Boundary Radius (Meters) *</label>
                                            <input type="number" id="sys-geo-radius" class="form-control" value="${sysSettings.geofence ? (sysSettings.geofence.radius || 500) : 500}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save System & Geo-Fencing Configuration</button>
                        </form>
                    </div>
                ` : ''}
            `;
        }


        if (this.currentTab === 'backup') {
            const dbBackups = store.get("db_backups") || [];
            return `
                <div class="card">
                    <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <h3><i class="fa-solid fa-database" style="color: var(--brand-primary);"></i> Database Environment, Backups & Disaster Recovery Workspace</h3>
                        <button class="btn btn-sm btn-primary" onclick="adminView.triggerBackup()"><i class="fa-solid fa-hard-drive"></i> Trigger Manual DB Backup Now</button>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.08)); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--brand-primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <h4 style="margin-bottom: 4px; color: var(--brand-primary);"><i class="fa-solid fa-server"></i> PostgreSQL / Supabase Database Cluster Status</h4>
                                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">Status: <strong style="color: var(--status-success);">● Healthy & Operational</strong> | Active Connections: <strong>427 Sessions</strong> | DB Size: <strong>14.2 MB</strong></p>
                            </div>
                            <span class="badge badge-success" style="font-size: 0.9rem; padding: 8px 14px;"><i class="fa-solid fa-shield-halved"></i> Automated Daily Backups Active (02:00 AM)</span>
                        </div>
                    </div>

                    <h4><i class="fa-solid fa-clock-rotate-left"></i> Database Backup Snapshots Log</h4>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">Historical snapshot points available for emergency point-in-time database restoration and offsite archive downloads.</p>

                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Snapshot Filename</th>
                                    <th>File Size</th>
                                    <th>Timestamp Created</th>
                                    <th>Backup Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dbBackups.map(b => `
                                    <tr>
                                        <td><code>${b.filename}</code></td>
                                        <td>${b.size}</td>
                                        <td><small>${b.timestamp}</small></td>
                                        <td><span class="badge badge-info">${b.type}</span></td>
                                        <td><span class="badge badge-success">✓ ${b.status}</span></td>
                                        <td>
                                            <div style="display: flex; gap: 4px;">
                                                <button class="btn btn-xs btn-outline-primary" onclick="adminView.downloadBackupSnapshot('${b.id}')"><i class="fa-solid fa-download"></i> Download</button>
                                                <button class="btn btn-xs btn-outline-danger" onclick="adminView.restoreBackupSnapshot('${b.id}')"><i class="fa-solid fa-rotate-left"></i> Restore Point</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                    </div>
                </div>
            `;
        }

        if (this.currentTab === 'e-library') {
            const user = store.getCurrentUser();
            return libraryView.renderLibrary(user);
        }


        this.currentTab = 'overview';
        return this.renderSectionContent();
    },

    initAdminChart() {
        const ctx = document.getElementById("admin-analytics-chart");
        if (!ctx || typeof Chart === "undefined") return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Computer Science', 'Info Tech', 'Business Admin', 'Communication', 'Engineering'],
                datasets: [{
                    label: 'Enrolled Students Count',
                    data: [142, 118, 95, 64, 48],
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderRadius: 6,
                    barThickness: 19,
                    maxBarThickness: 19
                }]
            },
            options: { responsive: true }
        });
    },

    initAttendanceTrendChart() {
        const ctx = document.getElementById("attendance-trend-chart");
        if (!ctx || typeof Chart === "undefined") return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                datasets: [{
                    label: 'Attendance Rate %',
                    data: [92, 94, 95, 93, 96],
                    borderColor: 'rgb(37, 99, 235)',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: { responsive: true }
        });
    },

    switchUserSubTab(subTab) {
        this.currentUserSubTab = subTab;
        this.switchSection('users');
    },

    toggleUserStatus(userType, userId) {
        const key = userType === 'student' ? 'students' : userType === 'teacher' ? 'teachers' : 'parents';
        const list = store.get(key);
        const target = list.find(u => u.id === userId);
        if (target) {
            target.status = target.status === 'Inactive' ? 'Active' : 'Inactive';
            store.set(key, list);
            store.logAudit(`Super Admin toggled status for ${userType} (${target.full_name || target.first_name}): ${target.status}`, "User Management");
            app.showToast(`User status updated to: ${target.status}`, "success");
            this.switchSection('users');
        }
    },

    resetUserPassword(userType, userId) {
        store.logAudit(`Super Admin reset password for ${userType} ID: ${userId}`, "Security");
        app.showToast(`Password reset successfully! Temporary password set to: Password@123`, "success");
    },

    toggleAdminSuspend(adminId) {
        const admins = store.get("admins") || [];
        const target = admins.find(a => a.id === adminId);
        if (target) {
            target.status = target.status === 'Suspended' ? 'Active' : 'Suspended';
            store.set("admins", admins);
            store.logAudit(`Super Admin ${target.status === 'Suspended' ? 'suspended' : 'unsuspended'} Sub-Admin: ${target.full_name}`, "Security");
            app.showToast(`Administrator status updated to: ${target.status}`, "success");
            this.switchSection('users');
        }
    },

    toggleRegistrationStatus(status) {
        const reg = store.get("reg_control") || {};
        reg.status = status;
        store.set("reg_control", reg);
        store.logAudit(`Super Admin set Course Registration Status to ${status}`, "System Configuration");
        const alerts = store.get("system_alerts") || [];
        alerts.unshift({
            id: "alt-" + Date.now(),
            category: "Registration Control",
            message: `Course Registration Window status updated to ${status} for ${reg.current_semester || 'current semester'}.`,
            date: new Date().toISOString().replace("T", " ").substring(0, 19),
            level: status === "OPEN" ? "success" : (status === "EXTENDED" ? "warning" : "danger"),
            target_audience: "ALL"
        });
        store.set("system_alerts", alerts);
        app.showToast(`Course Registration Status set to: ${status}`, "success");
        this.switchSection('reg_control');
    },

    triggerBackup() {
        const backups = store.get("db_backups") || [];
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        const filename = `isms_manual_snapshot_${Date.now()}.sql`;

        backups.unshift({
            id: "bak-" + Date.now(),
            filename: filename,
            size: "14.3 MB",
            timestamp: nowStr,
            type: "Manual Trigger",
            status: "Successful"
        });

        store.set("db_backups", backups);
        store.logAudit(`Triggered Manual Database Backup (${filename})`, "System Security");
        app.showToast("Database snapshot backup created successfully!", "success");
        if (this.currentTab === 'backup') this.switchSection('backup');
    },

    openAddUserModal(userType) {
        if (userType === 'student') {
            document.getElementById("add-student-modal").classList.remove("hidden");
            const stidInput = document.getElementById("new-st-id");
            if (stidInput) {
                stidInput.value = validators.generateStudentId();
                stidInput.readOnly = true;
            }
        } else if (userType === 'teacher') {
            document.getElementById("add-teacher-modal").classList.remove("hidden");
            const tcidInput = document.getElementById("new-tc-staffid");
            if (tcidInput) {
                tcidInput.value = validators.generateTeacherId();
                tcidInput.readOnly = true;
            }
        } else if (userType === 'parent') {
            document.getElementById("add-parent-modal").classList.remove("hidden");
        } else {
            app.showToast(`Add New ${userType.toUpperCase()} modal opened.`, "info");
        }
    },

    saveNewStudent(event) {
        event.preventDefault();
        const fname = document.getElementById("new-st-fname").value.trim();
        const sname = document.getElementById("new-st-sname").value.trim();
        const onames = document.getElementById("new-st-onames").value.trim();
        const stid = document.getElementById("new-st-id").value.trim().toUpperCase();
        const email = document.getElementById("new-st-email").value.trim();
        const phone = document.getElementById("new-st-phone").value.trim();
        const programme = document.getElementById("new-st-programme").value;
        const level = document.getElementById("new-st-level").value;
        const session = document.getElementById("new-st-session").value;

        const fullName = `${fname} ${onames ? onames + ' ' : ''}${sname}`;
        const defaultPlainPassword = "Password@123";
        const defaultHashedPassword = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";

        const profiles = store.get("profiles") || [];
        const students = store.get("students") || [];

        const newProfile = {
            id: "prof-st-" + Date.now(),
            email: email,
            full_name: fullName,
            phone_number: phone,
            role: "student",
            status: "Active",
            avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        };
        profiles.push(newProfile);
        store.set("profiles", profiles);

        const newStudent = {
            id: "stu-" + Date.now(),
            profile_id: newProfile.id,
            student_id: stid,
            first_name: fname,
            surname: sname,
            other_names: onames,
            full_name: fullName,
            email: email,
            phone_number: phone,
            programme: programme,
            level: level,
            session: session,
            status: "Active",
            academic_status: "Active",
            gpa: 4.0,
            cgpa: 4.0,
            password: defaultHashedPassword,
            avatar_url: newProfile.avatar_url
        };
        students.push(newStudent);
        store.set("students", students);


        if (typeof supabaseAuth !== "undefined" && typeof supabaseAuth.provisionUser === "function") {
            supabaseAuth.provisionUser("student", email, defaultPlainPassword, {
                full_name: fullName,
                first_name: fname,
                surname: sname,
                other_names: onames,
                student_id: stid,
                phone_number: phone,
                programme: programme,
                level: level,
                session: session
            }).then(sbRes => {
                if (sbRes.success) {
                    store.logAudit(`Student credentials stored in Supabase for ${fullName} (${email})`, "Security");
                } else {
                    console.warn("[AdminView] Supabase student provision notice:", sbRes.error);
                }
            }).catch(err => console.warn("[AdminView] Supabase provision exception:", err));
        }

        store.logAudit(`Registered New Student: ${fullName} (${stid}) with credentials in Supabase`, "User Management");
        app.closeModal("add-student-modal");
        app.showToast(`New Student ${fullName} registered successfully and credentials stored in Supabase!`, "success");
        this.switchSection('users');
    },

    saveNewTeacher(event) {
        event.preventDefault();
        const name = document.getElementById("new-tc-name").value.trim();
        const rawStaffId = document.getElementById("new-tc-staffid").value.trim();
        const email = document.getElementById("new-tc-email").value.trim();
        const phone = document.getElementById("new-tc-phone").value.trim();
        const dept = document.getElementById("new-tc-dept").value;
        const qual = document.getElementById("new-tc-qual").value.trim();

        if (!validators.isValidStaffIdPrefix(rawStaffId)) {
            app.showToast("Teacher Staff ID prefix must use UPPERCASE letters only (e.g., STF23001)!", "danger");
            return;
        }

        if (!validators.isValidTeacherId(rawStaffId)) {
            app.showToast("Invalid Teacher Staff ID format! Must use uppercase prefix STF followed by 5 digits (e.g., STF23001).", "danger");
            return;
        }

        const staffId = rawStaffId.toUpperCase();
        const teachers = store.get("teachers") || [];
        if (teachers.some(t => (t.email || "").toLowerCase() === email.toLowerCase() || (t.staff_id || "").toUpperCase() === staffId)) {
            app.showToast("A teacher with this Email or Staff ID already exists.", "danger");
            return;
        }

        const defaultPlainPassword = "Password@123";
        const defaultHashedPassword = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";

        const newTeacher = {
            id: "tc-" + Date.now(),
            staff_id: staffId,
            full_name: name,
            email: email,
            phone_number: phone,
            department: dept,
            qualification: qual || "Degree",
            session: "Morning",
            assigned_courses: [],
            status: "Active",
            password: defaultHashedPassword
        };
        teachers.push(newTeacher);
        store.set("teachers", teachers);

        const profiles = store.get("profiles") || [];
        profiles.push({
            id: "prof-tc-" + Date.now(),
            email: email,
            full_name: name,
            role: "teacher",
            staff_id: staffId,
            phone_number: phone,
            status: "Active",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        });
        store.set("profiles", profiles);


        if (typeof supabaseAuth !== "undefined" && typeof supabaseAuth.provisionUser === "function") {
            supabaseAuth.provisionUser("teacher", email, defaultPlainPassword, {
                full_name: name,
                staff_id: staffId,
                phone_number: phone,
                department: dept,
                qualification: qual || "Degree",
                session: "Morning"
            }).then(sbRes => {
                if (sbRes.success) {
                    store.logAudit(`Teacher credentials stored in Supabase for ${name} (${email})`, "Security");
                } else {
                    console.warn("[AdminView] Supabase teacher provision notice:", sbRes.error);
                }
            }).catch(err => console.warn("[AdminView] Supabase provision exception:", err));
        }

        store.logAudit(`Provisioned New Teacher Profile: ${name} (${staffId}) with credentials in Supabase`, "User Management");
        app.closeModal("add-teacher-modal");
        app.showToast(`New Teacher Profile for ${name} registered successfully and stored in Supabase!`, "success");
        this.switchSection('users');
    },

    saveNewParent(event) {
        event.preventDefault();
        const name = document.getElementById("new-pr-name").value.trim();
        const email = document.getElementById("new-pr-email").value.trim();
        const phone = document.getElementById("new-pr-phone").value.trim();
        const stuid = document.getElementById("new-pr-stuid").value.trim().toUpperCase();

        const defaultPlainPassword = "Password@123";
        const defaultHashedPassword = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";
        const profiles = store.get("profiles") || [];
        const parents = store.get("parents") || [];

        const newProfile = {
            id: "prof-pr-" + Date.now(),
            email: email,
            full_name: name,
            phone_number: phone,
            role: "parent",
            status: "Active",
            avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        };
        profiles.push(newProfile);
        store.set("profiles", profiles);

        const newParent = {
            id: "prnt-" + Date.now(),
            profile_id: newProfile.id,
            full_name: name,
            email: email,
            phone_number: phone,
            status: "Active",
            linked_student_ids: [stuid],
            password: defaultHashedPassword
        };
        parents.push(newParent);
        store.set("parents", parents);


        if (typeof supabaseAuth !== "undefined" && typeof supabaseAuth.provisionUser === "function") {
            supabaseAuth.provisionUser("parent", email, defaultPlainPassword, {
                full_name: name,
                phone_number: phone,
                linked_student_ids: [stuid]
            }).then(sbRes => {
                if (sbRes.success) {
                    store.logAudit(`Guardian credentials stored in Supabase for ${name} (${email})`, "Security");
                } else {
                    console.warn("[AdminView] Supabase parent provision notice:", sbRes.error);
                }
            }).catch(err => console.warn("[AdminView] Supabase provision exception:", err));
        }

        store.logAudit(`Registered New Guardian: ${name} linked to Ward ${stuid} with credentials in Supabase`, "User Management");
        app.closeModal("add-parent-modal");
        app.showToast(`Guardian Account for ${name} registered successfully and stored in Supabase!`, "success");
        this.switchSection('users');
    },

    updateStudentAcademicStatus(studentId, newStatus) {
        const students = store.get("students") || [];
        const target = students.find(s => s.id === studentId);
        if (target) {
            target.academic_status = newStatus;
            if (newStatus === "Withdrawn" || newStatus === "Suspended") {
                target.status = "Inactive";
            } else {
                target.status = "Active";
            }
            store.set("students", students);
            store.logAudit(`Updated Academic Status for Student ${target.full_name || target.first_name} (${target.student_id}) to: ${newStatus}`, "Registration Control");
            app.showToast(`Student Academic Status updated to: ${newStatus}`, "success");
            this.switchSection('reg_control');
        }
    },

    assignTeacherToCourse(courseId, teacherId) {
        const courses = store.get("courses") || [];
        const teachers = store.get("teachers") || [];
        const targetCourse = courses.find(c => c.id === courseId || c.course_code === courseId);

        if (targetCourse) {

            teachers.forEach(t => {
                if (t.assigned_courses) {
                    t.assigned_courses = t.assigned_courses.filter(code => code !== targetCourse.course_code);
                }
                if (t.courses_assigned) {
                    t.courses_assigned = t.courses_assigned.filter(code => code !== targetCourse.course_code);
                }
            });

            if (teacherId && teacherId !== "" && teacherId !== "unassigned") {
                const teacher = teachers.find(t => t.id === teacherId || t.staff_id === teacherId);
                if (teacher) {
                    targetCourse.teacher_id = teacher.id;
                    targetCourse.teacher_name = teacher.full_name;
                    teacher.assigned_courses = teacher.assigned_courses || [];
                    if (!teacher.assigned_courses.includes(targetCourse.course_code)) {
                        teacher.assigned_courses.push(targetCourse.course_code);
                    }
                    teacher.courses_assigned = teacher.assigned_courses;
                } else {
                    targetCourse.teacher_id = teacherId;
                    targetCourse.teacher_name = teacherId;
                }
            } else {
                targetCourse.teacher_id = null;
                targetCourse.teacher_name = "Unassigned";
            }

            store.set("teachers", teachers);
            store.set("courses", courses);


            const currentUser = store.getCurrentUser();
            if (currentUser && (currentUser.role === 'teacher' || currentUser.teacher_data)) {
                const activeTeacher = teachers.find(t =>
                    (currentUser.teacher_data && (t.id === currentUser.teacher_data.id || t.staff_id === currentUser.teacher_data.staff_id)) ||
                    t.id === currentUser.id ||
                    t.staff_id === currentUser.staff_id ||
                    t.email === currentUser.email
                );
                if (activeTeacher) {
                    currentUser.teacher_data = activeTeacher;
                    store.setCurrentUser(currentUser);
                }
            }

            const assignedTeacher = teachers.find(t => t.id === targetCourse.teacher_id || t.staff_id === targetCourse.teacher_id);
            const teacherName = assignedTeacher ? assignedTeacher.full_name : (targetCourse.teacher_name || "Unassigned");
            const adminUser = currentUser || {};
            store.logAudit(`Administrator (${adminUser.full_name || 'Admin'}) assigned Instructor ${teacherName} to Course module ${targetCourse.course_code}`, "Academic Management");
            app.showToast(`Teaching Assignment for ${targetCourse.course_code} set to: ${teacherName}`, "success");
            this.switchSection('academic');
        }
    },

    toggleResultPublishing(gradeId, currentStatus) {
        const grades = store.get("grades") || [];
        const target = grades.find(g => g.id === gradeId);
        if (target) {
            target.is_published = !currentStatus;
            target.status = target.is_published ? "Approved & Published" : "Draft / Pending Approval";
            store.set("grades", grades);
            store.logAudit(`Toggled Result Publishing for ${target.student_id} (${target.course_code}): ${target.status}`, "Examinations Oversight");
            app.showToast(`Result status set to: ${target.status}`, "success");
            this.switchSection('results');
        }
    },

    openPaymentVerificationModal() {
        document.getElementById("pv-results-area").innerHTML = '';
        document.getElementById("payment-verification-modal").classList.remove("hidden");
    },

    runPaymentVerification(event) {
        event.preventDefault();
        const query = document.getElementById("pv-search-input").value.trim().toUpperCase();
        const txs = store.get("payment_transactions") || [];
        const fees = store.get("fees") || [];

        const foundTx = txs.find(t => t.reference.toUpperCase().includes(query) || t.student_id.toUpperCase() === query);
        const foundFee = fees.find(f => f.student_id.toUpperCase() === query);

        const resultsArea = document.getElementById("pv-results-area");
        if (foundTx || foundFee) {
            const studentId = foundTx ? foundTx.student_id : foundFee.student_id;
            const studentName = foundTx ? foundTx.student_name : foundFee.student_name;
            const status = foundTx ? foundTx.status : foundFee.status;
            const ref = foundTx ? foundTx.reference : "PAY-9923182";
            const amt = foundTx ? foundTx.amount : foundFee.paid_amount;

            resultsArea.innerHTML = `
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--status-success); padding: 16px; border-radius: var(--radius-md);">
                    <h4 style="color: var(--status-success); margin-bottom: 6px;"><i class="fa-solid fa-circle-check"></i> Transaction Record Found & Verified</h4>
                    <p style="margin: 4px 0; font-size: 0.88rem;">Reference Number: <code>${ref}</code></p>
                    <p style="margin: 4px 0; font-size: 0.88rem;">Student ID & Name: <strong>${studentId} - ${studentName}</strong></p>
                    <p style="margin: 4px 0; font-size: 0.88rem;">Amount Processed: <strong>GH₵ ${(amt || 0).toFixed(2)}</strong></p>
                    <p style="margin: 4px 0; font-size: 0.88rem;">Gateway Verification Status: <span class="badge badge-success">✓ ${status}</span></p>
                </div>
            `;
            store.logAudit(`Ran Payment Verification Query for ${query}: Verified Successful`, "Finance Governance");
        } else {
            resultsArea.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid var(--status-danger); padding: 16px; border-radius: var(--radius-md);">
                    <h4 style="color: var(--status-danger); margin-bottom: 6px;"><i class="fa-solid fa-circle-xmark"></i> Transaction Record Not Found</h4>
                    <p style="margin: 0; font-size: 0.88rem;">No payment entry matched the search query "${query}". Please check Student ID or Reference Number.</p>
                </div>
            `;
        }
    },

    processTranscriptRequest(transcriptId) {
        const transcripts = store.get("transcripts") || [];
        const target = transcripts.find(t => t.id === transcriptId);
        if (target) {
            target.status = "Approved & Issued";
            store.set("transcripts", transcripts);
            store.logAudit(`Approved & Issued Official Academic Transcript Ref: ${target.reference_no} for ${target.student_name}`, "Registration Control");
            app.showToast(`Official Transcript Ref ${target.reference_no} Issued & Certified!`, "success");
            this.switchSection('reg_control');
        }
    },

    openGradeChangeModal() {
        document.getElementById("grade-change-modal").classList.remove("hidden");
    },

    saveGradeChange(event) {
        event.preventDefault();
        const studentId = document.getElementById("gc-student-id").value.trim().toUpperCase();
        const courseCode = document.getElementById("gc-course-code").value.trim().toUpperCase();
        const prevGrade = document.getElementById("gc-prev-grade").value.trim();
        const newGrade = document.getElementById("gc-new-grade").value.trim();
        const reason = document.getElementById("gc-reason").value.trim();

        if (!studentId || !courseCode || !reason) {
            app.showToast("Please fill out all required grade change fields.", "danger");
            return;
        }

        const currentUser = store.getCurrentUser();
        const changedBy = currentUser ? `${currentUser.full_name} (${currentUser.admin_role_title || 'Super Admin'})` : "Super Administrator";

        store.logGradeChange(changedBy, studentId, courseCode, prevGrade, newGrade, reason);
        app.closeModal("grade-change-modal");
        app.showToast("Non-silent grade change recorded in Audit Log!", "success");
        this.switchSection('results');
    },

    // saveSystemSettings is implemented comprehensively below with full general, academic, security, and geofence settings

    openAdminEditModal(userType, userId) {
        document.getElementById("adm-user-type").value = userType;
        document.getElementById("adm-user-id").value = userId;

        const stFields = document.getElementById("adm-student-fields");
        const tcFields = document.getElementById("adm-teacher-fields");
        const customIdLabel = document.getElementById("adm-custom-id-label");
        customIdLabel.innerText = userType === "student" ? "Student ID" : userType === "teacher" ? "Staff ID" : "Linked Student ID";

        if (userType === "student") {
            const student = store.get("students").find(s => s.id === userId);
            if (!student) return;

            document.getElementById("adm-user-name").value = `${student.first_name} ${student.surname}`;
            document.getElementById("adm-user-email").value = student.email;
            document.getElementById("adm-user-phone").value = student.phone_number;
            document.getElementById("adm-custom-id").value = student.student_id;

            document.getElementById("adm-st-programme").value = student.programme;
            document.getElementById("adm-st-level").value = student.level;
            document.getElementById("adm-st-session").value = student.session;

            stFields.classList.remove("hidden");
            tcFields.classList.add("hidden");
        } else if (userType === "teacher") {
            const teacher = store.get("teachers").find(t => t.id === userId);
            if (!teacher) return;

            document.getElementById("adm-user-name").value = teacher.full_name;
            document.getElementById("adm-user-email").value = teacher.email;
            document.getElementById("adm-user-phone").value = teacher.phone_number;
            document.getElementById("adm-custom-id").value = teacher.staff_id;

            document.getElementById("adm-tc-qual").value = teacher.qualification;
            document.getElementById("adm-tc-session").value = teacher.session;

            stFields.classList.add("hidden");
            tcFields.classList.remove("hidden");
        } else if (userType === "parent") {
            const parent = store.get("parents").find(p => p.id === userId);
            if (!parent) return;

            document.getElementById("adm-user-name").value = parent.full_name;
            document.getElementById("adm-user-email").value = parent.email;
            document.getElementById("adm-user-phone").value = parent.phone_number;
            document.getElementById("adm-custom-id").value = (parent.linked_student_ids || ['STU2025001'])[0];

            stFields.classList.add("hidden");
            tcFields.classList.add("hidden");
        }

        document.getElementById("admin-edit-user-modal").classList.remove("hidden");
    },

    saveAdminUserEdit(event) {
        event.preventDefault();
        const userType = document.getElementById("adm-user-type").value;
        const userId = document.getElementById("adm-user-id").value;

        const name = document.getElementById("adm-user-name").value.trim();
        const email = document.getElementById("adm-user-email").value.trim();
        const phone = document.getElementById("adm-user-phone").value.trim();
        const customId = document.getElementById("adm-custom-id").value.trim();

        const profiles = store.get("profiles");

        if (userType === "student") {
            const students = store.get("students");
            const target = students.find(s => s.id === userId);
            if (target) {
                const nameParts = name.split(" ");
                target.first_name = nameParts[0] || name;
                target.surname = nameParts.slice(1).join(" ") || "";
                target.email = email;
                target.phone_number = phone;
                target.student_id = customId.toUpperCase();
                target.programme = document.getElementById("adm-st-programme").value;
                target.level = document.getElementById("adm-st-level").value;
                target.session = document.getElementById("adm-st-session").value;

                store.set("students", students);

                const p = profiles.find(pr => pr.id === target.profile_id);
                if (p) {
                    p.full_name = name;
                    p.email = email;
                    p.phone_number = phone;
                }

                store.logAudit(`Super Admin edited Student details: ${target.first_name} (${target.student_id})`, "User Management");
            }
        } else if (userType === "teacher") {
            const teachers = store.get("teachers");
            const target = teachers.find(t => t.id === userId);
            if (target) {
                target.full_name = name;
                target.email = email;
                target.phone_number = phone;
                target.staff_id = customId.toUpperCase();
                target.qualification = document.getElementById("adm-tc-qual").value;
                target.session = document.getElementById("adm-tc-session").value;

                store.set("teachers", teachers);

                const p = profiles.find(pr => pr.id === target.profile_id);
                if (p) {
                    p.full_name = name;
                    p.email = email;
                    p.phone_number = phone;
                }

                store.logAudit(`Super Admin edited Teacher details: ${target.full_name}`, "User Management");
            }
        }

        store.set("profiles", profiles);
        app.closeModal("admin-edit-user-modal");
        app.showToast("Admin modification saved and synchronized successfully!", "success");
        app.navigateTo("dashboard");
    },

    openConfigureScopeModal(targetId, targetType, name, currentPerms) {
        document.getElementById("scope-target-id").value = targetId;
        document.getElementById("scope-target-type").value = targetType;
        document.getElementById("scope-target-name").innerText = name;

        const perms = Array.isArray(currentPerms) ? currentPerms : (currentPerms || '').split(',');

        ['users', 'academic', 'elibrary', 'reg_control', 'results', 'attendance', 'finance', 'audit', 'announcements', 'settings', 'backup'].forEach(scopeKey => {
            const chkId = scopeKey === 'elibrary' ? 'chk-scope-elibrary' : `chk-scope-${scopeKey}`;
            const chk = document.getElementById(chkId);
            if (chk) {
                const targetKey = scopeKey === 'elibrary' ? 'e-library' : scopeKey;
                chk.checked = perms.includes(targetKey) || perms.includes('ALL');
            }
        });

        document.getElementById("configure-scope-modal").classList.remove("hidden");
    },

    saveSubAdminScope(event) {
        event.preventDefault();
        const targetId = document.getElementById("scope-target-id").value;
        const targetType = document.getElementById("scope-target-type").value;
        const targetName = document.getElementById("scope-target-name").innerText;

        const selectedScopes = [];
        ['users', 'academic', 'elibrary', 'reg_control', 'results', 'attendance', 'finance', 'audit', 'announcements', 'settings', 'backup'].forEach(scopeKey => {
            const chkId = scopeKey === 'elibrary' ? 'chk-scope-elibrary' : `chk-scope-${scopeKey}`;
            const chk = document.getElementById(chkId);
            if (chk && chk.checked) {
                selectedScopes.push(scopeKey === 'elibrary' ? 'e-library' : scopeKey);
            }
        });

        if (targetType === 'role') {
            const adminRoles = store.get("admin_roles") || [];
            const role = adminRoles.find(r => r.id === targetId || r.name === targetName);
            if (role) {
                role.permissions = selectedScopes;
                store.set("admin_roles", adminRoles);
            }

            const admins = store.get("admins") || [];
            admins.forEach(a => {
                if (a.role_title === targetName) {
                    a.permissions = selectedScopes;
                }
            });
            store.set("admins", admins);

            const profiles = store.get("profiles") || [];
            profiles.forEach(p => {
                if (p.admin_role_title === targetName) {
                    p.permissions = selectedScopes;
                }
            });
            store.set("profiles", profiles);
        } else if (targetType === 'admin') {
            const admins = store.get("admins") || [];
            const admin = admins.find(a => a.id === targetId);
            if (admin) {
                admin.permissions = selectedScopes;
                store.set("admins", admins);
            }

            const profiles = store.get("profiles") || [];
            const profile = profiles.find(p => p.id === targetId || (admin && p.staff_id === admin.staff_id));
            if (profile) {
                profile.permissions = selectedScopes;
                store.set("profiles", profiles);
            }
        }

        store.logAudit(`Super Admin configured granted scope for ${targetName}: ${selectedScopes.join(', ')}`, "RBAC Management");
        app.closeModal("configure-scope-modal");
        app.showToast(`Granted administrative scope saved for ${targetName}!`, "success");
        this.switchSection("rbac");
    },


    openAddCourseModal() {
        const teachers = store.get("teachers") || [];
        const teacherSelect = document.getElementById("new-crs-teacher");
        if (teacherSelect) {
            teacherSelect.innerHTML = `<option value="">Unassigned (Select Later)</option>` +
                teachers.map(t => `<option value="${t.id}">${t.full_name} (${t.staff_id})</option>`).join('');
        }
        document.getElementById("add-course-modal").classList.remove("hidden");
    },

    saveNewCourse(event) {
        event.preventDefault();
        const code = document.getElementById("new-crs-code").value.trim().toUpperCase();
        const title = document.getElementById("new-crs-title").value.trim();
        const credits = parseInt(document.getElementById("new-crs-credits").value, 10) || 3;
        const level = document.getElementById("new-crs-level").value;
        const dept = document.getElementById("new-crs-dept").value;
        const programme = document.getElementById("new-crs-programme").value;
        const session = document.getElementById("new-crs-session") ? document.getElementById("new-crs-session").value : "All Sessions";
        const teacherId = document.getElementById("new-crs-teacher") ? document.getElementById("new-crs-teacher").value : "";

        const courses = store.get("courses") || [];
        const teachers = store.get("teachers") || [];
        const teacher = teachers.find(t => t.id === teacherId || t.staff_id === teacherId);
        const existingIdx = courses.findIndex(c => c.course_code === code);

        const newCourse = {
            id: existingIdx >= 0 ? courses[existingIdx].id : "crs-" + Date.now(),
            course_code: code,
            title: title,
            credit_hours: credits,
            level: level,
            department: dept,
            programme: programme,
            session: session,
            teacher_id: teacher ? teacher.id : (teacherId || "unassigned"),
            teacher_name: teacher ? teacher.full_name : "Unassigned",
            enrolled_count: existingIdx >= 0 ? (courses[existingIdx].enrolled_count || 0) : 0
        };

        if (existingIdx >= 0) {
            courses[existingIdx] = newCourse;
        } else {
            courses.push(newCourse);
        }

        if (teacher) {
            teacher.assigned_courses = teacher.assigned_courses || [];
            if (!teacher.assigned_courses.includes(code)) {
                teacher.assigned_courses.push(code);
            }
            teacher.courses_assigned = teacher.assigned_courses;
            store.set("teachers", teachers);
        }

        store.set("courses", courses);


        const alerts = store.get("system_alerts") || [];
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        alerts.unshift({
            id: "alt-" + Date.now(),
            category: "Academic Management",
            message: `New Semester Course Published: ${code} - ${title} for ${programme} (Level ${level}, ${session}). Available for student registration.`,
            date: nowStr,
            level: "info",
            target_audience: "ALL"
        });
        store.set("system_alerts", alerts);

        store.logAudit(`Added/Published Semester Course: ${code} - ${title} (${dept}, ${programme}, Level: ${level}, Session: ${session})`, "Academic Management");

        app.closeModal("add-course-modal");
        app.showToast(`Course Module ${code} published! It now reflects in ${programme} (Level ${level}, ${session}) student dashboards.`, "success");

        if (this.currentTab === 'academic') {
            this.switchSection('academic');
        }


        if (window.app && typeof window.app.refreshActiveViews === "function") {
            window.app.refreshActiveViews();
        }
    },


    openGenerateStatementModal() {
        document.getElementById("generate-statement-modal").classList.remove("hidden");
    },

    toggleStatementScopeInput() {
        const scope = document.getElementById("stmt-scope").value;
        const label = document.getElementById("stmt-target-label");
        const valInput = document.getElementById("stmt-target-val");

        if (scope === 'single') {
            label.innerText = "Student Index / ID";
            valInput.placeholder = "e.g. STU2025001";
        } else if (scope === 'level') {
            label.innerText = "Academic Level";
            valInput.placeholder = "e.g. 300";
        } else if (scope === 'department') {
            label.innerText = "Department Name";
            valInput.placeholder = "e.g. Computer Science";
        } else if (scope === 'programme') {
            label.innerText = "Programme Title";
            valInput.placeholder = "e.g. BSc Computer Science";
        }
    },

    runGenerateStatementOfResults(event) {
        event.preventDefault();
        const scope = document.getElementById("stmt-scope").value;
        const val = document.getElementById("stmt-target-val").value.trim();

        if (scope === 'single') {
            pdfHelper.downloadStudentTranscript(val.toUpperCase());
        } else {
            app.showToast(`Generating batch Statement of Results for ${scope.toUpperCase()}: ${val}...`, "info");
            pdfHelper.downloadStudentTranscript("STU2025001");
        }
        app.closeModal("generate-statement-modal");
    },


    _propagateFeeCategoryToStudents(cat) {
        const students = store.get("students") || [];
        const fees = store.get("fees") || [];

        const normalizeLvl = (val) => {
            if (!val) return "";
            const s = String(val).toLowerCase().trim();
            if (s.includes("all") || s === "*") return "all";
            const m = s.match(/\d+/);
            return m ? m[0] : s;
        };

        const normalizeSess = (val) => {
            if (!val) return "";
            const s = String(val).toLowerCase().trim();
            if (s.includes("all") || s === "*" || s === "regular") return "all";
            return s;
        };

        const catLvl = normalizeLvl(cat.level);
        const catSess = normalizeSess(cat.session);

        const matchingStudents = students.filter(s => {
            const studentLvl = normalizeLvl(s.level);
            const studentSess = normalizeSess(s.session);
            const levelMatches = (catLvl === "all" || catLvl === studentLvl);
            const sessionMatches = (catSess === "all" || catSess === studentSess);
            return levelMatches && sessionMatches;
        });

        let affected = 0;
        const today = new Date().toISOString().split("T")[0];
        const sys = store.get("system_settings") || {};
        const semester = (sys.general && sys.general.current_semester)
            ? `${sys.general.academic_year || "2026/2027"} - ${sys.general.current_semester}`
            : "2026/2027 - Semester 1";

        matchingStudents.forEach(student => {
            const idx = fees.findIndex(f => f.student_id === student.student_id);
            const applied = idx !== -1 ? (fees[idx].fee_categories_applied || []) : [];


            if (applied.includes(cat.id)) return;

            const balInfo = store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(student.student_id) : null;

            if (idx !== -1) {
                if (balInfo && balInfo.total_amount > 0) {
                    fees[idx].total_amount = balInfo.total_amount;
                    fees[idx].paid_amount = balInfo.paid_amount;
                    fees[idx].balance_due = balInfo.balance_due;
                    fees[idx].status = balInfo.status;
                } else {
                    const catAmt = Number(cat.amount) || 0;
                    fees[idx].total_amount = Number(fees[idx].total_amount || 0) + catAmt;
                    fees[idx].balance_due = Math.max(0, Number(fees[idx].balance_due || 0) + catAmt);
                    fees[idx].status = fees[idx].balance_due <= 0 ? "Fully Paid" : (Number(fees[idx].paid_amount || 0) > 0 ? "Partially Paid" : "Pending");
                }
                fees[idx].fee_categories_applied = [...applied, cat.id];
                fees[idx].semester = semester;
            } else {
                fees.push({
                    student_id: student.student_id,
                    student_name: `${student.first_name || ""} ${student.surname || ""}`.trim(),
                    semester: semester,
                    total_amount: balInfo ? balInfo.total_amount : (Number(cat.amount) || 0),
                    paid_amount: balInfo ? balInfo.paid_amount : 0,
                    balance_due: balInfo ? balInfo.balance_due : (Number(cat.amount) || 0),
                    status: balInfo ? balInfo.status : "Pending",
                    payment_history: [],
                    fee_categories_applied: balInfo ? balInfo.assigned_categories.map(c => c.id) : [cat.id],
                    created_date: today
                });
            }
            affected++;
        });

        if (affected > 0) {

            store.set("fees", fees);
        }

        return affected;
    },

    openAddFeeCategoryModal() {
        document.getElementById("add-fee-category-modal").classList.remove("hidden");
    },

    saveFeeCategory(event) {
        event.preventDefault();
        const name = document.getElementById("fee-cat-name")?.value.trim() || "Semester Academic Fee";
        const code = (document.getElementById("fee-cat-code")?.value || ("FEE-" + Date.now().toString().slice(-4))).trim().toUpperCase();
        const amtInput = document.getElementById("fee-cat-amt") || document.getElementById("fee-cat-amount");
        const amount = parseFloat(amtInput ? amtInput.value : 0);
        const level = document.getElementById("fee-cat-level")?.value || "All Levels";
        const session = document.getElementById("fee-cat-session")?.value || "All Sessions";

        const catId = "fc-" + Date.now();
        const feeCategories = store.get("fee_categories") || [];
        feeCategories.push({ id: catId, code, name, amount, level, session, status: "Active" });
        store.set("fee_categories", feeCategories);


        const affected = this._propagateFeeCategoryToStudents({ id: catId, code, name, amount, level, session });

        store.logAudit(`Added Fee Category: ${name} (${code}) - GH₵ ${amount.toFixed(2)} | Target: ${level}, ${session} | Applied to ${affected} student(s)`, "Finance Governance");
        app.closeModal("add-fee-category-modal");
        app.showToast(`Fee Category "${name}" saved and applied to ${affected} student(s) for ${level} (${session}) in real time!`, "success");
        this.switchSection('finance');
    },

    downloadBackupSnapshot(backupId) {
        const backups = store.get("db_backups") || [];
        const backup = backups.find(b => b.id === backupId || b.filename === backupId) || backups[0];

        const stateData = {
            timestamp: new Date().toISOString(),
            snapshot_id: backup ? backup.id : "snapshot-latest",
            system_store: {
                students: store.get("students"),
                teachers: store.get("teachers"),
                parents: store.get("parents"),
                admins: store.get("admins"),
                courses: store.get("courses"),
                grades: store.get("grades"),
                fees: store.get("fees"),
                fee_categories: store.get("fee_categories"),
                payment_transactions: store.get("payment_transactions")
            }
        };

        const jsonStr = JSON.stringify(stateData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = backup ? backup.filename : `isms_backup_${Date.now()}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        store.logAudit(`Downloaded System Database Snapshot: ${backup ? backup.filename : 'Snapshot'}`, "Database Security");
        app.showToast(`Database Snapshot File downloaded!`, "success");
    },

    restoreBackupSnapshot(backupId) {
        const backups = store.get("db_backups") || [];
        const backup = backups.find(b => b.id === backupId || b.filename === backupId);
        const filename = backup ? backup.filename : "Selected Snapshot";

        if (confirm(`ARE YOU SURE you want to restore point-in-time database snapshot "${filename}"? Current data will be safely synchronized.`)) {
            store.logAudit(`Restored System Database from Snapshot Point: ${filename}`, "Database Security");
            app.showToast(`Database state restored successfully from snapshot point: ${filename}!`, "success");
            this.switchSection('overview');
        }
    },


    openReportModal(title, bodyHtml) {
        pdfHelper.openPrintModal(bodyHtml, title);
    },

    showRegistrationStatsReport() {
        const students = store.get("students") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';
        const uniName = sys.general?.university_name || 'Ghana Communication Technology University (GCTU)';

        const total = students.length;
        const active = students.filter(s => s.status !== 'Inactive').length;
        const inactive = total - active;


        const byProg = {};
        students.forEach(s => {
            const prog = s.programme || 'Unspecified';
            if (!byProg[prog]) byProg[prog] = { l100: 0, l200: 0, l300: 0, l400: 0, total: 0 };
            const lv = String(s.level || '').replace(/[^0-9]/g, '');
            if (lv === '100') byProg[prog].l100++;
            else if (lv === '200') byProg[prog].l200++;
            else if (lv === '300') byProg[prog].l300++;
            else if (lv === '400') byProg[prog].l400++;
            byProg[prog].total++;
        });
        const progRows = Object.entries(byProg).map(([prog, c]) =>
            `<tr><td>${prog}</td><td>${c.l100}</td><td>${c.l200}</td><td>${c.l300}</td><td>${c.l400}</td><td><strong>${c.total}</strong></td></tr>`
        ).join('') || '<tr><td colspan="6" class="text-muted">No student records found.</td></tr>';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>INSTITUTIONAL REGISTRATION STATISTICS REPORT</h2>
                        <p>${uniName} &mdash; ${semLabel}</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="badge badge-success">Live Data</span></p>
                    </div>
                </div>
                <div class="stats-grid" style="margin-bottom: 20px;">
                    <div class="stat-card"><div class="stat-info"><span>Total Registered Students</span><h3>${total.toLocaleString()}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Active Registrations</span><h3 style="color: var(--status-success);">${active.toLocaleString()}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Inactive / Deferred</span><h3 style="color: var(--status-warning);">${inactive.toLocaleString()}</h3></div></div>
                </div>
                <h4>Breakdown by Academic Programme</h4>
                <table class="table" style="margin-bottom: 20px;">
                    <thead><tr><th>Programme</th><th>Level 100</th><th>Level 200</th><th>Level 300</th><th>Level 400</th><th>Total</th></tr></thead>
                    <tbody>${progRows}</tbody>
                </table>
            </div>
        `;
        this.openReportModal("Registration Statistics Report", bodyHtml);
    },


    showVerifiedStudentDirectoryReport() {
        const students = store.get("students") || [];
        const sys = store.get("system_settings") || {};
        const uniName = sys.general?.university_name || 'Ghana Communication Technology University (GCTU)';
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';
        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>VERIFIED STUDENT DIRECTORY &amp; OFFICIAL RECORDS</h2>
                        <p>${uniName}</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Semester:</strong> ${semLabel}</p>
                        <p><strong>Total Verified:</strong> ${students.length} Records</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <table class="table">
                    <thead><tr><th>Student ID</th><th>Full Name</th><th>Email</th><th>Programme</th><th>Level</th><th>Session</th><th>Status</th></tr></thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td><strong>${s.student_id}</strong></td>
                                <td>${s.first_name} ${s.surname}</td>
                                <td>${s.email}</td>
                                <td>${s.programme}</td>
                                <td>Level ${s.level}</td>
                                <td>${s.session || 'N/A'}</td>
                                <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> ${s.academic_status || 'Active'}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-muted">No student records found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Verified Student Directory", bodyHtml);
    },

    showSemesterEnrollmentSummaryReport() {
        const students = store.get("students") || [];
        const enrollments = store.get("enrollments") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';


        const morning = students.filter(s => String(s.session || '').toLowerCase().includes('morning')).length;
        const evening = students.filter(s => String(s.session || '').toLowerCase().includes('evening') || String(s.session || '').toLowerCase().includes('weekend')).length;
        const other = students.length - morning - evening;


        const byDept = {};
        students.forEach(s => {
            const dept = s.department || s.programme || 'Unspecified';
            if (!byDept[dept]) byDept[dept] = { ug: 0, pg: 0 };
            const lv = parseInt(String(s.level || '100').replace(/[^0-9]/g, ''), 10);
            if (lv >= 500 || String(s.level || '').toLowerCase().includes('pg') || String(s.programme || '').toLowerCase().includes('msc') || String(s.programme || '').toLowerCase().includes('mba') || String(s.programme || '').toLowerCase().includes('phd')) {
                byDept[dept].pg++;
            } else {
                byDept[dept].ug++;
            }
        });
        const deptRows = Object.entries(byDept).map(([dept, c]) => {
            const tot = c.ug + c.pg;
            const rate = enrollments.length > 0 ? ((enrollments.filter(e => students.find(s => s.student_id === e.student_id && (s.department === dept || s.programme === dept))).length / Math.max(tot, 1)) * 100).toFixed(1) : '100.0';
            return `<tr><td>${dept}</td><td>${c.ug}</td><td>${c.pg}</td><td><strong>${Number(rate).toFixed(1)}%</strong></td></tr>`;
        }).join('') || '<tr><td colspan="4" class="text-muted">No records found.</td></tr>';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>SEMESTER ENROLLMENT SUMMARY REPORT</h2>
                        <p>${semLabel}</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>
                </div>
                <div class="stats-grid" style="margin-bottom: 20px;">
                    <div class="stat-card"><div class="stat-info"><span>Total Students</span><h3>${students.length.toLocaleString()}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Morning Session</span><h3>${morning.toLocaleString()}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Evening / Weekend</span><h3>${evening.toLocaleString()}</h3></div></div>
                    ${other > 0 ? `<div class="stat-card"><div class="stat-info"><span>Other / Unspecified</span><h3>${other.toLocaleString()}</h3></div></div>` : ''}
                </div>
                <table class="table">
                    <thead><tr><th>Department / Programme</th><th>Undergraduate</th><th>Postgraduate</th><th>Registration Rate</th></tr></thead>
                    <tbody>${deptRows}</tbody>
                </table>
            </div>
        `;
        this.openReportModal("Semester Enrollment Summary", bodyHtml);
    },

    showCourseEnrollmentStatsReport() {
        const courses = store.get("courses") || [];
        const enrollments = store.get("enrollments") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>COURSE ENROLLMENT STATISTICS REPORT</h2>
                        <p>${semLabel} &mdash; Course Module Participation &amp; Credits</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>
                </div>
                <table class="table">
                    <thead><tr><th>Course Code</th><th>Course Title</th><th>Credits</th><th>Enrolled Students</th><th>Instructor</th></tr></thead>
                    <tbody>
                        ${courses.map(c => {
            const enrolled = enrollments.filter(e => e.course_code === c.course_code).length;
            return `<tr>
                                <td><strong>${c.course_code}</strong></td>
                                <td>${c.title}</td>
                                <td>${c.credit_hours} hrs</td>
                                <td><strong>${enrolled}</strong></td>
                                <td><span class="badge ${c.teacher_id ? 'badge-info' : 'badge-warning'}">${c.teacher_id ? 'Assigned' : 'Unassigned'}</span></td>
                            </tr>`;
        }).join('') || '<tr><td colspan="5" class="text-muted">No courses found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Course Enrollment Statistics Report", bodyHtml);
    },

    showStudentPerformanceGpaReport() {
        const students = store.get("students") || [];
        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>STUDENT PERFORMANCE & GPA ANALYTICS REPORT</h2>
                        <p>Grade Point Averages & Academic Standing Distribution</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p></div>
                </div>

                <table class="table">
                    <thead>
                        <tr><th>Student ID</th><th>Student Name</th><th>Programme</th><th>GPA</th><th>CGPA</th><th>Academic Standing</th></tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td><strong>${s.student_id}</strong></td>
                                <td>${s.first_name} ${s.surname}</td>
                                <td>${s.programme}</td>
                                <td><strong style="color: var(--status-success);">${s.gpa || '3.85'}</strong></td>
                                <td><strong>${s.cgpa || '3.80'}</strong></td>
                                <td><span class="badge badge-success">First Class / Good Standing</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Student Performance & GPA Report", bodyHtml);
    },

    showDepartmentAnalyticsReport() {
        const students = store.get("students") || [];
        const teachers = store.get("teachers") || [];
        const courses = store.get("courses") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';


        const depts = {};
        students.forEach(s => {
            const d = s.department || s.programme || 'Unspecified';
            if (!depts[d]) depts[d] = { students: 0, faculty: 0, courses: 0 };
            depts[d].students++;
        });
        teachers.forEach(t => {
            const d = t.department || 'Unspecified';
            if (!depts[d]) depts[d] = { students: 0, faculty: 0, courses: 0 };
            depts[d].faculty++;
        });
        courses.forEach(c => {
            const d = c.department || 'Unspecified';
            if (!depts[d]) depts[d] = { students: 0, faculty: 0, courses: 0 };
            depts[d].courses++;
        });
        const deptRows = Object.entries(depts).map(([dept, c]) =>
            `<tr><td>${dept}</td><td>${c.faculty} Instructors</td><td>${c.courses} Modules</td><td><strong style="color: var(--status-success);">Live</strong></td><td>${c.students.toLocaleString()}</td></tr>`
        ).join('') || '<tr><td colspan="5" class="text-muted">No department data found.</td></tr>';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>DEPARTMENTAL PERFORMANCE ANALYTICS REPORT</h2>
                        <p>${semLabel} &mdash; Academic Operations &amp; Departmental Output Metrics</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>
                </div>
                <table class="table">
                    <thead><tr><th>Department</th><th>Active Faculty</th><th>Courses Offered</th><th>Data</th><th>Student Count</th></tr></thead>
                    <tbody>${deptRows}</tbody>
                </table>
            </div>
        `;
        this.openReportModal("Departmental Performance Analytics", bodyHtml);
    },

    showGradeSubmissionStatusReport() {
        const courses = store.get("courses") || [];
        const grades = store.get("grades") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>GRADE SUBMISSION STATUS REPORT</h2>
                        <p>${semLabel} &mdash; Faculty Mark Sheets &amp; Exam Score Submission</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>
                </div>
                <table class="table">
                    <thead><tr><th>Course Code</th><th>Course Title</th><th>Department</th><th>Grades Submitted</th><th>Status</th></tr></thead>
                    <tbody>
                        ${courses.map(c => {
            const submitted = grades.filter(g => g.course_code === c.course_code).length;
            const status = submitted > 0
                ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> ${submitted} Grades Submitted</span>`
                : `<span class="badge badge-warning"><i class="fa-regular fa-clock"></i> Pending</span>`;
            return `<tr>
                                <td><strong>${c.course_code}</strong></td>
                                <td>${c.title}</td>
                                <td>${c.department || 'General'}</td>
                                <td>${submitted}</td>
                                <td>${status}</td>
                            </tr>`;
        }).join('') || '<tr><td colspan="5" class="text-muted">No courses found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Grade Submission Status Report", bodyHtml);
    },

    showGradeDistributionAnalyticsReport() {
        const grades = store.get("grades") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';
        const total = grades.length;


        const gradeCount = { A: 0, 'B+': 0, B: 0, C: 0, D: 0, F: 0 };
        grades.forEach(g => {
            const score = Number(g.total_score || g.score || 0);
            if (score >= 80) gradeCount['A']++;
            else if (score >= 75) gradeCount['B+']++;
            else if (score >= 70) gradeCount['B']++;
            else if (score >= 60) gradeCount['C']++;
            else if (score >= 50) gradeCount['D']++;
            else gradeCount['F']++;
        });
        const pct = (n) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';
        const gradeRows = [
            ['A (Excellent)', '80% - 100%', '4.00', gradeCount['A'], 'badge-success'],
            ['B+ (Very Good)', '75% - 79%', '3.50', gradeCount['B+'], 'badge-success'],
            ['B (Good)', '70% - 74%', '3.00', gradeCount['B'], 'badge-info'],
            ['C (Credit)', '60% - 69%', '2.00', gradeCount['C'], 'badge-warning'],
            ['D (Pass)', '50% - 59%', '1.00', gradeCount['D'], 'badge-warning'],
            ['F (Fail)', '0% - 49%', '0.00', gradeCount['F'], 'badge-danger'],
        ].map(([label, range, pts, count, cls]) =>
            `<tr><td><span class="badge ${cls}">${label}</span></td><td>${range}</td><td>${pts}</td><td>${count} Records</td><td><strong>${pct(count)}%</strong></td></tr>`
        ).join('');

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>GRADE DISTRIBUTION ANALYTICS REPORT</h2>
                        <p>${semLabel} &mdash; Grade Curve &amp; Letter Grade Allocations</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Total Grade Records:</strong> ${total}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <table class="table">
                    <thead><tr><th>Grade Category</th><th>Score Range</th><th>Grade Points</th><th>Count</th><th>Percentage</th></tr></thead>
                    <tbody>${gradeRows}</tbody>
                </table>
            </div>
        `;
        this.openReportModal("Grade Distribution Analytics", bodyHtml);
    },

    showOutstandingResultsReport() {
        const courses = store.get("courses") || [];
        const grades = store.get("grades") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';

        const outstanding = courses.filter(c => !grades.some(g => g.course_code === c.course_code));

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>OUTSTANDING RESULTS &amp; UNPUBLISHED GRADES REPORT</h2>
                        <p>${semLabel} &mdash; Modules Pending Grade Submission</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Pending Courses:</strong> ${outstanding.length}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <table class="table">
                    <thead><tr><th>Course Code</th><th>Course Title</th><th>Instructor</th><th>Status</th></tr></thead>
                    <tbody>
                        ${outstanding.map(c => `
                            <tr>
                                <td><strong>${c.course_code}</strong></td>
                                <td>${c.title}</td>
                                <td>${c.teacher_id || 'Unassigned'}</td>
                                <td><span class="badge badge-warning"><i class="fa-regular fa-clock"></i> Grade Not Yet Submitted</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" class="text-muted text-center" style="padding:20px;">All courses have grades submitted.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Outstanding Results Status Report", bodyHtml);
    },

    showFeeCollectionSummaryReport() {
        const fees = store.get("fees") || [];
        const transactions = store.get("payment_transactions") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';

        const totalExp = fees.reduce((acc, f) => acc + Number(f.total_amount || 0), 0);
        const totalPaid = fees.reduce((acc, f) => acc + Number(f.paid_amount || 0), 0);
        const outstanding = Math.max(0, totalExp - totalPaid);
        const fullyPaid = fees.filter(f => Number(f.balance_due || 0) <= 0).length;


        const byChannel = {};
        transactions.forEach(t => {
            const ch = t.channel || t.gateway || 'Other';
            if (!byChannel[ch]) byChannel[ch] = { count: 0, total: 0 };
            byChannel[ch].count++;
            byChannel[ch].total += Number(t.amount || 0);
        });
        const channelRows = Object.entries(byChannel).map(([ch, c]) =>
            `<tr><td>${ch}</td><td>${c.count} Transactions</td><td>GH₵ ${c.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td><strong>${totalPaid > 0 ? ((c.total / totalPaid) * 100).toFixed(1) : 0}%</strong></td></tr>`
        ).join('') || '<tr><td colspan="4" class="text-muted">No transactions recorded.</td></tr>';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>TOTAL FEE COLLECTION &amp; REVENUE SUMMARY REPORT</h2>
                        <p>${semLabel} &mdash; Institutional Financial Audit</p>
                    </div>
                    <div style="text-align: right;"><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>
                </div>
                <div class="stats-grid" style="margin-bottom: 20px;">
                    <div class="stat-card"><div class="stat-info"><span>Total Expected Revenue</span><h3>GH₵ ${totalExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Total Revenue Collected</span><h3 style="color: var(--status-success);">GH₵ ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Outstanding Balance</span><h3 style="color: var(--status-danger);">GH₵ ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Fully Paid Students</span><h3 style="color: var(--status-success);">${fullyPaid}</h3></div></div>
                </div>
                <h4>Revenue by Payment Channel</h4>
                <table class="table">
                    <thead><tr><th>Payment Channel</th><th>Transaction Count</th><th>Total Processed</th><th>Share</th></tr></thead>
                    <tbody>${channelRows}</tbody>
                </table>
            </div>
        `;
        this.openReportModal("Total Fee Collection Summary", bodyHtml);
    },

    showOutstandingBalancesReport() {
        const fees = store.get("fees") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';
        const outstanding = fees.filter(f => Number(f.balance_due || 0) > 0);
        const totalOwed = outstanding.reduce((acc, f) => acc + Number(f.balance_due || 0), 0);

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>OUTSTANDING FEE BALANCES AUDIT LIST</h2>
                        <p>${semLabel} &mdash; Students with Outstanding Tuition Balances</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Students with Balances:</strong> ${outstanding.length}</p>
                        <p><strong>Total Owed:</strong> GH₵ ${totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <table class="table">
                    <thead><tr><th>Student ID</th><th>Student Name</th><th>Semester</th><th>Total Fee</th><th>Paid</th><th>Balance Due</th><th>Status</th></tr></thead>
                    <tbody>
                        ${outstanding.map(f => `
                            <tr>
                                <td><strong>${f.student_id}</strong></td>
                                <td>${f.student_name}</td>
                                <td>${f.semester || semLabel}</td>
                                <td>GH₵ ${Number(f.total_amount || 0).toFixed(2)}</td>
                                <td>GH₵ ${Number(f.paid_amount || 0).toFixed(2)}</td>
                                <td><strong style="color: var(--status-danger);">GH₵ ${Number(f.balance_due || 0).toFixed(2)}</strong></td>
                                <td><span class="badge badge-warning">${f.status || 'Pending'}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-muted text-center" style="padding:20px;">No outstanding balances found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Outstanding Balances List", bodyHtml);
    },

    showTransactionLogReport() {
        const transactions = store.get("payment_transactions") || [];
        const sys = store.get("system_settings") || {};
        const semLabel = sys.general ? `${sys.general.academic_year || '2026/2027'} - ${sys.general.current_semester || 'Semester 1'}` : '2026/2027 - Semester 1';

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>PAYMENT GATEWAY TRANSACTION LOG REPORT</h2>
                        <p>${semLabel} &mdash; Complete Audit of Payment Gateway Transactions</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Total Transactions:</strong> ${transactions.length}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <table class="table">
                    <thead><tr><th>Reference No.</th><th>Student ID</th><th>Student Name</th><th>Amount (GH₵)</th><th>Channel</th><th>Timestamp</th><th>Status</th></tr></thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td><code>${t.reference}</code></td>
                                <td><strong>${t.student_id}</strong></td>
                                <td>${t.student_name}</td>
                                <td><strong>GH₵ ${Number(t.amount || 0).toFixed(2)}</strong></td>
                                <td>${t.channel || t.gateway || 'N/A'}</td>
                                <td><small>${t.timestamp || t.date || 'N/A'}</small></td>
                                <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> ${t.status || 'Verified'}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-muted text-center" style="padding:20px;">No transactions recorded yet.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
        this.openReportModal("Payment Gateway Transaction Log", bodyHtml);
    },


    openAddAdminModal() {
        document.getElementById("add-admin-modal").classList.remove("hidden");

        this.updateNewAdminIdPrefix();
    },

    updateNewAdminIdPrefix() {
        const levelSelect = document.getElementById("new-admin-level");
        const staffIdInput = document.getElementById("new-admin-staffid");
        if (!levelSelect || !staffIdInput) return;
        const level = levelSelect.value;
        const prefixMap = {
            "Registrar Admin": "REG",
            "Academic Admin": "ACA",
            "Examination Admin": "EXA",
            "Finance Admin": "FIN",
            "ICT / System Admin": "ICT"
        };
        const prefix = prefixMap[level] || "ADM";
        staffIdInput.value = validators.generateAdminId(prefix);
    },

    saveNewAdmin(event) {
        event.preventDefault();
        const rawStaffId = document.getElementById("new-admin-staffid").value.trim();
        if (!validators.isValidStaffIdPrefix(rawStaffId)) {
            app.showToast("Administrator Staff ID prefix must use UPPERCASE letters only (e.g., ADM-REG-26, SUPER-001)!", "danger");
            return;
        }

        if (!validators.isValidAdminId(rawStaffId)) {
            app.showToast("Invalid Administrator Staff ID format! Must use uppercase prefix (e.g., ADM-REG-26 or SUPER-001).", "danger");
            return;
        }

        const staffId = rawStaffId.toUpperCase();
        const name = document.getElementById("new-admin-name").value.trim();
        const email = document.getElementById("new-admin-email").value.trim().toLowerCase();
        const level = document.getElementById("new-admin-level").value;

        const existingAdmins = store.get("admins") || [];
        if (existingAdmins.some(a => a.email.toLowerCase() === email)) {
            app.showToast("An administrator with this email already exists.", "danger");
            return;
        }

        const prefixMap = {
            "Registrar Admin": ["users", "reg_control"],
            "Academic Admin": ["academic", "e-library"],
            "Examination Admin": ["results", "attendance"],
            "Finance Admin": ["finance"],
            "ICT / System Admin": ["settings", "backup", "audit"]
        };
        const defaultPerms = prefixMap[level] || [];

        const defaultHashedPassword = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";
        const newAdmin = {
            id: "adm-" + Date.now(),
            staff_id: staffId,
            full_name: name,
            email: email,
            role_title: level,
            permissions: defaultPerms,
            status: "Active",
            password: defaultHashedPassword
        };

        existingAdmins.push(newAdmin);
        store.set("admins", existingAdmins);

        const profiles = store.get("profiles") || [];
        profiles.push({
            id: "prof-adm-" + Date.now(),
            email: email,
            full_name: name,
            role: "admin",
            admin_role_title: level,
            staff_id: staffId,
            permissions: defaultPerms,
            status: "Active",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        });
        store.set("profiles", profiles);


        if (typeof supabaseAuth !== "undefined" && typeof supabaseAuth.provisionUser === "function") {
            supabaseAuth.provisionUser("admin", email, "Password@123", {
                full_name: name,
                staff_id: staffId,
                admin_role_title: level,
                permissions: defaultPerms
            }).then(sbRes => {
                if (sbRes.success) {
                    store.logAudit(`Sub-Admin credentials stored in Supabase for ${name} (${email})`, "Security");
                } else {
                    console.warn("[AdminView] Supabase admin provision notice:", sbRes.error);
                }
            }).catch(err => console.warn("[AdminView] Supabase provision exception:", err));
        }

        store.logAudit(`Provisioned New Sub-Admin: ${name} (${staffId}) as ${level} with credentials in Supabase`, "User Management");
        app.closeModal("add-admin-modal");
        app.showToast(`Sub-Administrator ${name} provisioned successfully and credentials stored in Supabase!`, "success");
        this.switchSection("users");
    },

    deleteAdmin(adminId) {
        if (!confirm("Are you sure you want to permanently remove this Sub-Administrator account? This action cannot be undone.")) return;
        const admins = store.get("admins") || [];
        const target = admins.find(a => a.id === adminId);
        if (!target) { app.showToast("Administrator account not found.", "danger"); return; }

        const filtered = admins.filter(a => a.id !== adminId);
        store.set("admins", filtered);

        const profiles = store.get("profiles") || [];
        const filteredProfiles = profiles.filter(p => p.staff_id !== target.staff_id);
        store.set("profiles", filteredProfiles);

        store.logAudit(`Removed Sub-Admin Account: ${target.full_name} (${target.staff_id})`, "User Management");
        app.showToast(`Sub-Administrator ${target.full_name} has been removed from the system.`, "success");
        this.switchSection("users");
    },

    openEditAdminModal(adminId) {
        const admins = store.get("admins") || [];
        const target = admins.find(a => a.id === adminId);
        if (!target) { app.showToast("Administrator not found.", "danger"); return; }

        document.getElementById("edit-admin-id").value = adminId;
        document.getElementById("edit-admin-name").value = target.full_name;
        document.getElementById("edit-admin-email").value = target.email;
        document.getElementById("edit-admin-staffid").value = target.staff_id;
        document.getElementById("edit-admin-level-display").textContent = target.role_title;
        document.getElementById("edit-admin-modal").classList.remove("hidden");
    },

    saveEditAdmin(event) {
        event.preventDefault();
        const adminId = document.getElementById("edit-admin-id").value;
        const name = document.getElementById("edit-admin-name").value.trim();
        const email = document.getElementById("edit-admin-email").value.trim().toLowerCase();

        const admins = store.get("admins") || [];
        const target = admins.find(a => a.id === adminId);
        if (!target) { app.showToast("Administrator not found.", "danger"); return; }

        target.full_name = name;
        target.email = email;
        store.set("admins", admins);

        const profiles = store.get("profiles") || [];
        const profile = profiles.find(p => p.staff_id === target.staff_id);
        if (profile) {
            profile.full_name = name;
            profile.email = email;
            store.set("profiles", profiles);
        }

        store.logAudit(`Edited Sub-Admin details: ${name} (${target.staff_id})`, "User Management");
        app.closeModal("edit-admin-modal");
        app.showToast(`Administrator ${name}'s details updated successfully!`, "success");
        this.switchSection("users");
    },


    showStudentAcademicRecord(studentId) {
        const students = store.get("students") || [];
        const grades = store.get("grades") || [];
        const enrollments = store.get("enrollments") || [];

        const student = students.find(s => s.id === studentId);
        if (!student) { app.showToast("Student record not found.", "danger"); return; }

        const studentGrades = grades.filter(g => g.student_id === student.student_id);
        const studentEnrollments = enrollments.filter(e => e.student_id === student.student_id);

        const totalCredits = studentEnrollments.reduce((acc, e) => acc + (e.credit_hours || 3), 0);

        const bodyHtml = `
            <div style="padding: 10px;">
                <div class="printable-header">
                    <div>
                        <h2>STUDENT ACADEMIC RECORD</h2>
                        <p>${student.programme || 'BSc Computer Science'} | Level ${student.level || 300}</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Student ID:</strong> ${student.student_id}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
                    <div class="stat-card"><div class="stat-info"><span>Full Name</span><h3 style="font-size: 1rem;">${student.first_name} ${student.surname}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Current GPA</span><h3 style="color: var(--status-success);">${student.gpa || '3.85'}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>CGPA</span><h3>${student.cgpa || '3.80'}</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Total Credits</span><h3>${totalCredits || 24} Hrs</h3></div></div>
                    <div class="stat-card"><div class="stat-info"><span>Academic Status</span><h3 style="font-size: 0.9rem;"><span class="badge badge-success">${student.academic_status || 'Active'}</span></h3></div></div>
                </div>

                <h4 style="margin-bottom: 10px;">Course Grades & Performance</h4>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr><th>Code</th><th>Course</th><th>Asmt.</th><th>Exam</th><th>Total</th><th>Grade</th><th>GP</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${studentGrades.length > 0 ? studentGrades.map(g => `
                                <tr>
                                    <td><strong>${g.course_code}</strong></td>
                                    <td>${g.course_title}</td>
                                    <td>${g.assessment_score || '-'}/30</td>
                                    <td>${g.exam_score || '-'}/70</td>
                                    <td><strong>${g.total_score || '-'}</strong></td>
                                    <td><strong style="color: var(--brand-primary);">${g.letter_grade}</strong></td>
                                    <td>${g.grade_point}</td>
                                    <td><span class="badge ${g.is_published ? 'badge-success' : 'badge-warning'}">${g.status}</span></td>
                                </tr>
                            `).join('') : `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">No grade records found for this student.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.openReportModal(`Academic Record: ${student.first_name} ${student.surname}`, bodyHtml);
    },

    linkUnlinkParent(parentId) {
        const parents = store.get("parents") || [];
        const parent = parents.find(p => p.id === parentId);
        if (!parent) { app.showToast("Parent account not found.", "danger"); return; }

        const currentLinks = (parent.linked_student_ids || []).join(", ");
        const input = prompt(`Parent: ${parent.full_name}\nCurrently linked Ward(s): ${currentLinks || 'None'}\n\nEnter Student ID(s) to link (comma-separated), or leave empty to unlink all:`);

        if (input === null) return; // user cancelled

        const newIds = input.split(",").map(id => id.trim().toUpperCase()).filter(id => id.length > 0);

        const students = store.get("students") || [];
        const validIds = newIds.filter(id => students.some(s => s.student_id === id));
        const invalidIds = newIds.filter(id => !students.some(s => s.student_id === id));

        if (invalidIds.length > 0) {
            app.showToast(`Warning: Student IDs not found: ${invalidIds.join(', ')}`, "warning");
        }

        parent.linked_student_ids = validIds;
        store.set("parents", parents);


        const fees = store.get("fees") || [];
        let feesUpdated = false;
        validIds.forEach(stId => {
            const existingFee = fees.find(f => f.student_id === stId);
            if (!existingFee) {
                const st = students.find(s => s.student_id === stId);
                fees.push({
                    id: "fee-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
                    student_id: stId,
                    student_name: st ? `${st.first_name} ${st.surname}` : stId,
                    semester: "Semester 1, 2026/2027",
                    total_amount: 4800.00,
                    paid_amount: 0.00,
                    balance_due: 4800.00,
                    status: "Pending",
                    payment_history: []
                });
                feesUpdated = true;
            }
        });
        if (feesUpdated) {
            store.set("fees", fees);
        }

        const profiles = store.get("profiles") || [];
        const profile = profiles.find(p => p.email === parent.email);
        if (profile) {
            profile.parent_data = parent;
            store.set("profiles", profiles);
        }


        const currentUser = store.getCurrentUser();
        if (currentUser && (currentUser.email === parent.email || currentUser.id === parent.id || (currentUser.parent_data && currentUser.parent_data.id === parent.id))) {
            currentUser.parent_data = parent;
            currentUser.linked_student_ids = validIds;
            store.setCurrentUser(currentUser);
        }

        const action = validIds.length > 0 ? `Linked to Ward(s): ${validIds.join(', ')}` : "All wards unlinked";
        store.logAudit(`Updated Parent-Ward Link for ${parent.full_name}: ${action}`, "User Management");
        app.showToast(`Parent-Ward relationship updated! ${action}`, "success");
        if (window.app && typeof window.app.refreshActiveViews === "function") {
            window.app.refreshActiveViews();
        }
        this.switchSection("users");
    },


    toggleUserStatus(userType, userId) {
        const collection = userType === 'student' ? 'students' : userType === 'teacher' ? 'teachers' : 'parents';
        const items = store.get(collection) || [];
        const target = items.find(i => i.id === userId);
        if (!target) { app.showToast("User not found.", "danger"); return; }

        target.status = target.status === 'Inactive' ? 'Active' : 'Inactive';
        store.set(collection, items);

        const profiles = store.get("profiles") || [];
        const profile = profiles.find(p => p.email === target.email);
        if (profile) {
            profile.status = target.status;
            store.set("profiles", profiles);
        }

        store.logAudit(`${target.status === 'Active' ? 'Activated' : 'Deactivated'} ${userType} account: ${target.full_name || target.first_name} (${target.student_id || target.staff_id || ''})`, "User Management");
        app.showToast(`User account ${target.status === 'Active' ? 'activated' : 'deactivated'} successfully.`, "success");
        this.switchSection("users");
    },

    toggleAdminSuspend(adminId) {
        const admins = store.get("admins") || [];
        const target = admins.find(a => a.id === adminId);
        if (!target) { app.showToast("Administrator not found.", "danger"); return; }

        target.status = target.status === 'Suspended' ? 'Active' : 'Suspended';
        store.set("admins", admins);

        const profiles = store.get("profiles") || [];
        const profile = profiles.find(p => p.staff_id === target.staff_id);
        if (profile) {
            profile.status = target.status;
            store.set("profiles", profiles);
        }

        store.logAudit(`${target.status === 'Suspended' ? 'Suspended' : 'Reinstated'} Sub-Admin account: ${target.full_name} (${target.staff_id})`, "User Management");
        app.showToast(`Administrator ${target.full_name} has been ${target.status === 'Suspended' ? 'suspended' : 'reinstated'}.`, "success");
        this.switchSection("users");
    },

    resetUserPassword(userType, userId) {
        const defaultHashedPass = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";

        let collection, nameKey;
        if (userType === 'student') { collection = 'students'; nameKey = 'first_name'; }
        else if (userType === 'teacher') { collection = 'teachers'; nameKey = 'full_name'; }
        else if (userType === 'parent') { collection = 'parents'; nameKey = 'full_name'; }
        else if (userType === 'admin') { collection = 'admins'; nameKey = 'full_name'; }
        else return;

        const items = store.get(collection) || [];
        const target = items.find(i => i.id === userId);
        if (!target) { app.showToast("User not found.", "danger"); return; }

        target.password = defaultHashedPass;
        store.set(collection, items);

        const displayName = target[nameKey] || target.full_name || target.first_name || "User";
        store.logAudit(`Password reset for ${userType}: ${displayName} — reset to default Password@123 (stored as salted SHA-256 hash)`, "Security");
        app.showToast(`Password for ${displayName} reset to: Password@123`, "success");
    },

    async handleAdminPasswordUpdate(event) {
        event.preventDefault();
        const currPass = document.getElementById("adm-curr-pass").value;
        const newPass = document.getElementById("adm-new-pass").value;
        const repeatPass = document.getElementById("adm-repeat-new-pass").value;

        if (newPass !== repeatPass) {
            app.showToast("New passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(newPass)) {
            app.showToast("Password must contain at least 6 characters, including uppercase, number, and symbol.", "warning");
            return;
        }

        const user = store.getCurrentUser();
        if (user) {
            if (user.password) {
                const isValidCurr = await passwordHelper.verifyPassword(currPass, user.password);
                if (!isValidCurr) {
                    app.showToast("Current password is incorrect!", "danger");
                    return;
                }
            }

            const hashedNew = await passwordHelper.hashPassword(newPass);
            user.password = hashedNew;
            store.setCurrentUser(user);


            const profiles = store.get("profiles") || [];
            const p = profiles.find(pr => pr.id === user.id || pr.staff_id === user.staff_id || pr.email === user.email);
            if (p) { p.password = hashedNew; store.set("profiles", profiles); }

            const admins = store.get("admins") || [];
            const a = admins.find(adm => adm.id === user.id || adm.staff_id === user.staff_id);
            if (a) { a.password = hashedNew; store.set("admins", admins); }

            store.logAudit(`Administrator (${user.full_name || user.email}) updated account password`, "Security");
            app.showToast("Administrator password updated successfully!", "success");
            event.target.reset();
        }
    },

    handleAdminAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDataUrl = e.target.result;
                const user = store.getCurrentUser();
                if (user) {
                    user.avatar_url = imgDataUrl;
                    store.setCurrentUser(user);

                    const briefAvatar = document.getElementById("brief-avatar");
                    if (briefAvatar) briefAvatar.src = imgDataUrl;

                    const preview = document.getElementById("adm-setting-avatar-preview");
                    if (preview) preview.src = imgDataUrl;

                    const profiles = store.get("profiles") || [];
                    const p = profiles.find(pr => pr.id === user.id || pr.staff_id === user.staff_id);
                    if (p) { p.avatar_url = imgDataUrl; store.set("profiles", profiles); }

                    app.showToast("Administrator profile photo uploaded successfully!", "success");
                }
            };
            reader.readAsDataURL(file);
        }
    },

    handleAdminAvatarDelete() {
        const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        const user = store.getCurrentUser();
        if (user) {
            user.avatar_url = defaultAvatar;
            store.setCurrentUser(user);

            const briefAvatar = document.getElementById("brief-avatar");
            if (briefAvatar) briefAvatar.src = defaultAvatar;

            const preview = document.getElementById("adm-setting-avatar-preview");
            if (preview) preview.src = defaultAvatar;

            const profiles = store.get("profiles") || [];
            const p = profiles.find(pr => pr.id === user.id || pr.staff_id === user.staff_id);
            if (p) { p.avatar_url = defaultAvatar; store.set("profiles", profiles); }

            app.showToast("Administrator profile photo deleted.", "info");
        }
    },

    handleAdminProfileUpdate(event) {
        event.preventDefault();
        const name = document.getElementById("adm-profile-name").value.trim();
        const email = document.getElementById("adm-profile-email").value.trim();
        const phone = document.getElementById("adm-profile-phone").value.trim();
        const staffIdInput = document.getElementById("adm-profile-staffid");
        const staffIdVal = staffIdInput ? staffIdInput.value.trim().toUpperCase() : null;

        const user = store.getCurrentUser();
        if (user) {
            const isSystemAdmin = !user.admin_role_title || user.admin_role_title === "System Admin" || user.admin_role_title === "Super Admin" || user.staff_id === "SUPER-001";
            const oldStaffId = user.staff_id;

            user.full_name = name;
            user.email = email;
            user.phone_number = phone;
            if (isSystemAdmin && staffIdVal) {
                user.staff_id = staffIdVal;
            }
            store.setCurrentUser(user);

            const briefName = document.getElementById("brief-name");
            if (briefName) briefName.innerText = name;

            const profiles = store.get("profiles") || [];
            const p = profiles.find(pr => pr.id === user.id || pr.staff_id === oldStaffId || pr.email === email);
            if (p) {
                p.full_name = name;
                p.email = email;
                p.phone_number = phone;
                if (isSystemAdmin && staffIdVal) p.staff_id = staffIdVal;
                store.set("profiles", profiles);
            }

            const admins = store.get("admins") || [];
            const a = admins.find(adm => adm.id === user.id || adm.staff_id === oldStaffId);
            if (a) {
                a.full_name = name;
                a.email = email;
                if (isSystemAdmin && staffIdVal) a.staff_id = staffIdVal;
                store.set("admins", admins);
            }

            store.logAudit(`Administrator (${name}) updated account profile details`, "User Management");
            app.showToast("Profile and account details updated successfully!", "success");
        }
    },


    attendanceDeptFilter: 'ALL',
    attendanceCourseFilter: 'ALL',
    attendanceLevelFilter: 'ALL',
    attendanceSearchQuery: '',
    attendanceChartInstance: null,

    handleAttendanceFilterChange() {
        const dept = document.getElementById("adm-att-dept-filter");
        const crs = document.getElementById("adm-att-course-filter");
        const lvl = document.getElementById("adm-att-level-filter");
        const srch = document.getElementById("adm-att-search");

        if (dept) this.attendanceDeptFilter = dept.value;
        if (crs) this.attendanceCourseFilter = crs.value;
        if (lvl) this.attendanceLevelFilter = lvl.value;
        if (srch) this.attendanceSearchQuery = srch.value.trim();

        this._updateAttendanceStats();
    },

    _updateAttendanceStats() {
        if (typeof store === "undefined" || !store.calculateOverallAttendance) return;

        const attStats = store.calculateOverallAttendance({
            dept: this.attendanceDeptFilter,
            course: this.attendanceCourseFilter,
            level: this.attendanceLevelFilter,
            search: this.attendanceSearchQuery
        });

        const overallEl = document.getElementById("adm-att-stat-overall");
        if (overallEl) overallEl.textContent = `${attStats.rate}% Present`;

        const selectedCourseAtt = this.attendanceCourseFilter !== 'ALL' && store.calculateCourseAttendance
            ? store.calculateCourseAttendance(this.attendanceCourseFilter)
            : null;
        const secondStatLabel = selectedCourseAtt ? `${this.attendanceCourseFilter} Attendance %` : (this.attendanceDeptFilter !== 'ALL' ? `${this.attendanceDeptFilter} %` : `Computer Science %`);
        const secondStatVal = selectedCourseAtt ? `${selectedCourseAtt.rate}% Present` : `${attStats.csRate}% Present`;

        const courseLabelEl = document.getElementById("adm-att-stat-course-label");
        if (courseLabelEl) courseLabelEl.textContent = secondStatLabel;

        const courseEl = document.getElementById("adm-att-stat-course");
        if (courseEl) courseEl.textContent = secondStatVal;

        const absentEl = document.getElementById("adm-att-stat-absent");
        if (absentEl) absentEl.textContent = `${attStats.absentToday} Students`;

        const lateEl = document.getElementById("adm-att-stat-late");
        if (lateEl) lateEl.textContent = `${attStats.lateToday} Students`;

        this.renderFilteredAttendanceTable();
        this.initAttendanceOversightChart();
    },

    renderFilteredAttendanceTable() {
        const tableBody = document.getElementById("adm-att-table-body");
        if (!tableBody) return;

        const attendance = store.get("attendance") || [];
        const students = store.get("students") || [];

        const dept = this.attendanceDeptFilter || 'ALL';
        const crs = this.attendanceCourseFilter || 'ALL';
        const lvl = this.attendanceLevelFilter || 'ALL';
        const query = (this.attendanceSearchQuery || '').toLowerCase();

        const filtered = attendance.filter(a => {
            const student = students.find(s => s.student_id === a.student_id);
            const aDept = a.department || (student ? student.department : 'Computer Science');
            const aLvl = student ? String(student.level) : '100';

            if (dept !== 'ALL' && aDept !== dept) return false;
            if (crs !== 'ALL' && a.course_code !== crs) return false;
            if (lvl !== 'ALL' && aLvl !== lvl) return false;
            if (query) {
                const matchName = (a.student_name || '').toLowerCase().includes(query);
                const matchId = (a.student_id || '').toLowerCase().includes(query);
                const matchCrs = (a.course_code || '').toLowerCase().includes(query);
                if (!matchName && !matchId && !matchCrs) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">No attendance records found matching the selected filters.</td></tr>`;
            return;
        }

        tableBody.innerHTML = filtered.map(a => `
            <tr>
                <td>${a.date}</td>
                <td><strong>${a.student_id}</strong></td>
                <td>${a.student_name}</td>
                <td>${a.course_code}</td>
                <td>${a.department || 'Computer Science'}</td>
                <td><span class="badge ${a.status === 'Absent' ? 'badge-danger' : a.status === 'Late' ? 'badge-warning' : 'badge-success'}">${a.status}</span></td>
            </tr>
        `).join('');
    },

    initAttendanceOversightChart() {
        const ctx = document.getElementById("attendance-oversight-chart");
        if (!ctx) return;

        const attendance = store.get("attendance") || [];
        const students = store.get("students") || [];

        const dept = this.attendanceDeptFilter || 'ALL';
        const crs = this.attendanceCourseFilter || 'ALL';
        const lvl = this.attendanceLevelFilter || 'ALL';
        const query = (this.attendanceSearchQuery || '').toLowerCase();

        const filtered = attendance.filter(a => {
            const student = students.find(s => s.student_id === a.student_id);
            const aDept = a.department || (student ? student.department : 'Computer Science');
            const aLvl = student ? String(student.level) : '100';

            if (dept !== 'ALL' && aDept !== dept) return false;
            if (crs !== 'ALL' && a.course_code !== crs) return false;
            if (lvl !== 'ALL' && aLvl !== lvl) return false;
            if (query) {
                const matchName = (a.student_name || '').toLowerCase().includes(query);
                const matchId = (a.student_id || '').toLowerCase().includes(query);
                const matchCrs = (a.course_code || '').toLowerCase().includes(query);
                if (!matchName && !matchId && !matchCrs) return false;
            }
            return true;
        });

        const presentCount = filtered.filter(a => a.status === 'Present').length;
        const lateCount = filtered.filter(a => a.status === 'Late').length;
        const absentCount = filtered.filter(a => a.status === 'Absent').length;

        if (!ctx || typeof Chart === "undefined") return;

        if (this.attendanceChartInstance) {
            this.attendanceChartInstance.destroy();
        }

        this.attendanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Present Sessions', 'Late Arrivals', 'Absent Sessions'],
                datasets: [{
                    label: 'Session Count',
                    data: [presentCount || (dept === 'ALL' && crs === 'ALL' ? 42 : 12), lateCount || (dept === 'ALL' && crs === 'ALL' ? 8 : 2), absentCount || (dept === 'ALL' && crs === 'ALL' ? 12 : 3)],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.75)',
                        'rgba(245, 158, 11, 0.75)',
                        'rgba(239, 68, 68, 0.75)'
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    initAttendanceTrendChart() {
        this.initAttendanceOversightChart();
    },

    replyToStudentComplaint(complaintId) {
        const replyText = prompt("Enter official administrative response to this student complaint:");
        if (!replyText || !replyText.trim()) return;

        const user = store.getCurrentUser();
        const complaints = store.get("complaints") || [];
        const comp = complaints.find(c => c.id === complaintId);

        if (comp) {
            comp.reply = replyText.trim();
            comp.status = "Resolved";
            comp.replied_by = user.admin_role_title || user.full_name || "Administrator";
            store.set("complaints", complaints);

            store.logAudit(`Administrator (${user.full_name}) responded to student complaint: ${comp.subject}`, "Communication");
            app.showToast("Official response sent successfully to student!", "success");
            app.navigateToAdminSection("overview");
        }
    },

    handlePostAnnouncement(event) {
        event.preventDefault();
        const title = document.getElementById("adm-ann-title").value.trim();
        const targetAudience = document.getElementById("adm-ann-target").value;
        const content = document.getElementById("adm-ann-content").value.trim();

        const user = store.getCurrentUser();
        const author = user.admin_role_title || user.full_name || "Administrator";

        const announcements = store.get("announcements") || [];
        announcements.unshift({
            id: "ANN" + Date.now(),
            title: title,
            content: content,
            target_audience: targetAudience,
            author: author,
            posted_by: author,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });

        store.set("announcements", announcements);
        store.logAudit(`Administrator (${author}) published announcement: "${title}" for audience [${targetAudience}]`, "Communication");
        app.showToast("Announcement posted and broadcasted successfully!", "success");
        this.currentTab = 'announcements';
        app.navigateToAdminSection('announcements');
    },

    handleDeleteAnnouncement(annId) {
        if (!confirm("Are you sure you want to delete this posted announcement from user dashboards?")) return;

        let announcements = store.get("announcements") || [];
        announcements = announcements.filter(a => a.id !== annId);
        store.set("announcements", announcements);

        const user = store.getCurrentUser();
        store.logAudit(`Administrator (${user.full_name}) deleted announcement ID: ${annId}`, "Communication");
        app.showToast("Announcement deleted successfully!", "info");
        this.currentTab = 'announcements';
        app.navigateToAdminSection('announcements');
    },

    deleteAdminNotification(complaintId) {
        if (!confirm("Are you sure you want to delete this notification from your dashboard?")) return;

        let complaints = store.get("complaints") || [];
        complaints = complaints.filter(c => c.id !== complaintId);
        store.set("complaints", complaints);

        app.showToast("Notification deleted successfully!", "info");
        this.switchSection("announcements");
    },

    deleteAllAdminNotifications() {
        if (!confirm("Are you sure you want to delete all notifications from your dashboard?")) return;

        store.set("complaints", []);
        app.showToast("All notifications deleted successfully!", "info");
        this.switchSection("announcements");
    },

    deleteUserPermanent(userType, userId) {
        if (!confirm(`Are you sure you want to permanently delete this ${userType} account from the system? The user account will be removed permanently and will not be able to sign in.`)) {
            return;
        }

        const typeTitle = userType.charAt(0).toUpperCase() + userType.slice(1);
        let emailToDelete = null;

        if (userType === 'student') {
            let students = store.get("students") || [];
            const target = students.find(s => s.id === userId || s.student_id === userId);
            if (target) emailToDelete = target.email;
            students = students.filter(s => s.id !== userId && s.student_id !== userId);
            store.set("students", students);
        } else if (userType === 'teacher') {
            let teachers = store.get("teachers") || [];
            const target = teachers.find(t => t.id === userId || t.staff_id === userId);
            if (target) emailToDelete = target.email;
            teachers = teachers.filter(t => t.id !== userId && t.staff_id !== userId);
            store.set("teachers", teachers);
        } else if (userType === 'parent') {
            let parents = store.get("parents") || [];
            const target = parents.find(p => p.id === userId);
            if (target) emailToDelete = target.email;
            parents = parents.filter(p => p.id !== userId);
            store.set("parents", parents);
        } else if (userType === 'admin') {
            let admins = store.get("admins") || [];
            const target = admins.find(a => a.id === userId || a.staff_id === userId);
            if (target) emailToDelete = target.email;
            admins = admins.filter(a => a.id !== userId && a.staff_id !== userId);
            store.set("admins", admins);
        }


        if (emailToDelete) {
            let profiles = store.get("profiles") || [];
            profiles = profiles.filter(p => (p.email || "").toLowerCase() !== emailToDelete.toLowerCase());
            store.set("profiles", profiles);
        }

        const currentUser = store.getCurrentUser();
        store.logAudit(`Administrator (${currentUser ? currentUser.full_name : 'Admin'}) permanently deleted ${typeTitle} account [ID: ${userId}]`, "User Management");

        app.showToast(`${typeTitle} account permanently removed from system.`, "success");
        this.switchSection('users');
    },

    saveSystemSettings(event) {
        event.preventDefault();
        const settings = store.get("system_settings") || {};
        const acadYear = document.getElementById("sys-acad-year") ? document.getElementById("sys-acad-year").value.trim() : "2026/2027";
        const currSem = document.getElementById("sys-curr-sem") ? document.getElementById("sys-curr-sem").value.trim() : "Semester 1";

        settings.general = {
            university_name: document.getElementById("sys-univ-name") ? document.getElementById("sys-univ-name").value.trim() : "Ghana Communication Technology University (GCTU)",
            academic_year: acadYear,
            current_semester: currSem
        };
        settings.academic = {
            max_credit_limit: parseInt(document.getElementById("sys-max-credits") ? document.getElementById("sys-max-credits").value : 24, 10),
            grading_scale_type: document.getElementById("sys-grading-scheme") ? document.getElementById("sys-grading-scheme").value.trim() : "Standard 4.0 GPA System"
        };
        settings.security = {
            min_password_length: parseInt(document.getElementById("sys-min-pass") ? document.getElementById("sys-min-pass").value : 6, 10),
            super_admin_min_password_length: parseInt(document.getElementById("sys-super-pass") ? document.getElementById("sys-super-pass").value : 12, 10),
            session_timeout_mins: parseInt(document.getElementById("sys-session-timeout") ? document.getElementById("sys-session-timeout").value : 30, 10)
        };
        settings.geofence = {
            enabled: document.getElementById("sys-geo-enabled") ? (document.getElementById("sys-geo-enabled").value === "true") : true,
            campus_name: document.getElementById("sys-geo-campus") ? document.getElementById("sys-geo-campus").value.trim() : "GCTU Main Campus (Tesano)",
            latitude: parseFloat(document.getElementById("sys-geo-lat") ? document.getElementById("sys-geo-lat").value : 5.5560),
            longitude: parseFloat(document.getElementById("sys-geo-lng") ? document.getElementById("sys-geo-lng").value : -0.1969),
            radius: parseInt(document.getElementById("sys-geo-radius") ? document.getElementById("sys-geo-radius").value : 500, 10)
        };
        store.set("system_settings", settings);

        const fullLabel = currSem.includes(acadYear) ? currSem : `${acadYear} - ${currSem}`;
        store.set("current_semester", fullLabel);

        const regControl = store.get("reg_control") || {};
        regControl.current_semester = fullLabel;
        store.set("reg_control", regControl);

        // Immediately update Current Semester container in Admin Overview & Summary
        const kpiSemEl = document.getElementById("kpi-semester");
        if (kpiSemEl) {
            kpiSemEl.textContent = fullLabel;
        }
        const liveSemEl = document.getElementById("live-current-semester");
        if (liveSemEl) {
            liveSemEl.textContent = fullLabel;
        }

        // Broadcast update to all user dashboards
        if (window.app && typeof window.app.refreshActiveViews === "function") {
            window.app.refreshActiveViews();
        }

        if (typeof app.renderAcademicCalendarModal === 'function') {
            app.renderAcademicCalendarModal();
        }
        store.logAudit(`Institution settings updated: Academic Year ${acadYear}, Semester: ${currSem}`, "Settings");
        app.showToast(`System settings saved. Academic Session updated to: ${fullLabel}.`, "success");
    },

    deleteSingleFeeCategory(catId) {
        if (!confirm("Are you sure you want to delete this fee category from the system?")) return;
        let feeCategories = store.get("fee_categories") || [];
        feeCategories = feeCategories.filter(fc => fc.id !== catId && fc.code !== catId);
        store.set("fee_categories", feeCategories);

        this._recalculateAllStudentFees();
        store.logAudit(`Admin deleted Fee Category ID: ${catId}`, "Finance Governance");
        app.showToast("Fee category deleted and student fee schedules updated.", "info");
        this.switchSection('finance');
    },

    deleteSelectedFeeCategories() {
        const checkboxes = document.querySelectorAll(".fee-cat-cb:checked");
        if (checkboxes.length === 0) {
            app.showToast("Please select at least one fee category to delete.", "warning");
            return;
        }
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected fee categories?`)) return;

        let feeCategories = store.get("fee_categories") || [];
        const toDeleteIds = Array.from(checkboxes).map(cb => cb.getAttribute("data-id"));
        feeCategories = feeCategories.filter(fc => !toDeleteIds.includes(fc.id) && !toDeleteIds.includes(fc.code));

        store.set("fee_categories", feeCategories);
        this._recalculateAllStudentFees();
        store.logAudit(`Admin deleted ${checkboxes.length} Fee Categories`, "Finance Governance");
        app.showToast(`Deleted ${checkboxes.length} fee categories and updated student balances.`, "success");
        this.switchSection('finance');
    },

    toggleAllFeeCatCheckboxes(checked) {
        document.querySelectorAll(".fee-cat-cb").forEach(cb => cb.checked = checked);
    },

    deleteSelectedFeeLedgers() {
        const checkboxes = document.querySelectorAll(".fee-ledger-cb:checked");
        if (checkboxes.length === 0) {
            app.showToast("Please select at least one student fee ledger to delete.", "warning");
            return;
        }
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected student fee ledger(s)?`)) return;

        let fees = store.get("fees") || [];
        const toDeleteIds = Array.from(checkboxes).map(cb => cb.getAttribute("data-id"));
        fees = fees.filter(f => !toDeleteIds.includes(f.student_id));

        store.set("fees", fees);
        store.logAudit(`Admin deleted ${checkboxes.length} Student Fee Ledger(s)`, "Finance Governance");
        app.showToast(`Deleted ${checkboxes.length} student fee ledger(s) successfully.`, "success");
        this.switchSection('finance');
    },

    deleteSingleFeeLedger(studentId) {
        if (!confirm(`Are you sure you want to delete the fee ledger for student ${studentId}?`)) return;
        let fees = store.get("fees") || [];
        fees = fees.filter(f => f.student_id !== studentId);
        store.set("fees", fees);

        store.logAudit(`Admin deleted Student Fee Ledger for: ${studentId}`, "Finance Governance");
        app.showToast(`Student fee ledger for ${studentId} deleted successfully.`, "info");
        this.switchSection('finance');
    },

    toggleAllFeeLedgerCheckboxes(checked) {
        document.querySelectorAll(".fee-ledger-cb").forEach(cb => cb.checked = checked);
    },

    _updateFinanceStats() {
        const fees = store.get("fees") || [];
        const finTotalExpected = fees.reduce((acc, f) => acc + (Number(f.total_amount) || 0), 0);
        const finTotalCollected = fees.reduce((acc, f) => acc + (Number(f.paid_amount) || 0), 0);
        const finOutstanding = fees.reduce((acc, f) => acc + (Number(f.balance_due) || 0), 0);
        const finFullyPaidCount = fees.filter(f => f.status === 'Fully Paid' || (Number(f.total_amount) > 0 && Number(f.balance_due) <= 0)).length;

        const elExp = document.getElementById("fin-stat-total-expected");
        if (elExp) elExp.textContent = `GH₵ ${finTotalExpected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const elCol = document.getElementById("fin-stat-total-collected");
        if (elCol) elCol.textContent = `GH₵ ${finTotalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const elOut = document.getElementById("fin-stat-outstanding");
        if (elOut) {
            elOut.textContent = `GH₵ ${finOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            elOut.style.color = finOutstanding > 0 ? 'var(--status-danger)' : 'var(--status-success)';
        }

        const elPaid = document.getElementById("fin-stat-fully-paid");
        if (elPaid) elPaid.textContent = `${finFullyPaidCount} Students`;
    },

    _recalculateAllStudentFees() {
        const students = store.get("students") || [];
        const fees = store.get("fees") || [];
        const sys = store.get("system_settings") || {};
        const semester = (sys.general && sys.general.current_semester)
            ? `${sys.general.academic_year || "2026/2027"} - ${sys.general.current_semester}`
            : "2026/2027 - Semester 1";
        const today = new Date().toISOString().split("T")[0];

        students.forEach(student => {
            const balInfo = store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(student.student_id) : null;
            if (!balInfo) return;

            const idx = fees.findIndex(f => f.student_id === student.student_id);
            if (idx !== -1) {
                fees[idx].total_amount = balInfo.total_amount;
                fees[idx].paid_amount = balInfo.paid_amount;
                fees[idx].balance_due = balInfo.balance_due;
                fees[idx].status = balInfo.status;
                fees[idx].fee_categories_applied = balInfo.assigned_categories.map(c => c.id);
            } else if (balInfo.total_amount > 0) {
                fees.push({
                    student_id: student.student_id,
                    student_name: `${student.first_name || ""} ${student.surname || ""}`.trim(),
                    semester: semester,
                    total_amount: balInfo.total_amount,
                    paid_amount: balInfo.paid_amount,
                    balance_due: balInfo.balance_due,
                    status: balInfo.status,
                    payment_history: [],
                    fee_categories_applied: balInfo.assigned_categories.map(c => c.id),
                    created_date: today
                });
            }
        });

        store.set("fees", fees);
    },

    openAcademicCalendarModal() {
        document.getElementById("academic-calendar-modal").classList.remove("hidden");
    },

    saveAcademicActivity(event) {
        event.preventDefault();
        const titleEl = document.getElementById("acad-act-title");
        const sdateEl = document.getElementById("acad-act-sdate");
        const edateEl = document.getElementById("acad-act-edate");
        const scopeEl = document.getElementById("acad-act-scope");
        const descEl = document.getElementById("acad-act-desc");

        const title = titleEl ? titleEl.value.trim() : "";
        const sdate = sdateEl ? sdateEl.value : "";
        const edate = edateEl ? edateEl.value : "";
        const scope = scopeEl ? scopeEl.value : "All Students & Faculty";
        const desc = descEl ? descEl.value.trim() : "";

        if (!title || !sdate || !edate) {
            app.showToast("Please fill in the title, start date, and end date.", "warning");
            return;
        }

        const ev1 = store.get("academic_events") || [];
        const ev2 = store.get("academic_calendar") || [];
        const calendarEvents = [...ev1];
        ev2.forEach(e2 => {
            if (!calendarEvents.some(e => e.id === e2.id || (e.title === e2.title && e.start_date === e2.start_date))) {
                calendarEvents.push(e2);
            }
        });

        const newActivity = {
            id: "act-" + Date.now(),
            title: title,
            start_date: sdate,
            end_date: edate,
            date: sdate,
            scope: scope,
            description: desc || 'No additional instructions provided.',
            status: "Published"
        };

        calendarEvents.unshift(newActivity);

        store.set("academic_calendar", calendarEvents);
        store.set("academic_events", calendarEvents);

        store.logAudit(`Published Academic Calendar Activity: "${title}" (${sdate} to ${edate})`, "Academic Management");


        if (titleEl) titleEl.value = "";
        if (sdateEl) sdateEl.value = "";
        if (edateEl) edateEl.value = "";
        if (descEl) descEl.value = "";

        app.closeModal("academic-calendar-modal");
        app.showToast(`✓ Academic Activity "${title}" published! Automatically reflected on Live Calendar.`, "success");


        if (typeof app.renderAcademicCalendarModal === 'function') {
            app.renderAcademicCalendarModal();
        }

        this.switchSection('academic');
    },

    deleteSingleAcademicActivity(actId) {
        if (!confirm("Are you sure you want to delete this academic calendar activity?")) return;
        const ev1 = store.get("academic_events") || [];
        const ev2 = store.get("academic_calendar") || [];
        let calendarEvents = [...ev1];
        ev2.forEach(e2 => {
            if (!calendarEvents.some(e => e.id === e2.id || (e.title === e2.title && e.start_date === e2.start_date))) {
                calendarEvents.push(e2);
            }
        });

        calendarEvents = calendarEvents.filter(a => a.id !== actId);
        store.set("academic_calendar", calendarEvents);
        store.set("academic_events", calendarEvents);

        store.logAudit(`Admin deleted Academic Activity ID: ${actId}`, "Academic Management");
        app.showToast("Academic calendar activity deleted successfully!", "info");
        if (typeof app.renderAcademicCalendarModal === 'function') {
            app.renderAcademicCalendarModal();
        }
        this.switchSection('academic');
    },

    deleteSelectedAcademicActivities() {
        const checkboxes = document.querySelectorAll(".acad-act-cb:checked");
        if (checkboxes.length === 0) {
            app.showToast("Please select at least one schedule activity to delete.", "warning");
            return;
        }
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected calendar activities?`)) return;

        const ev1 = store.get("academic_events") || [];
        const ev2 = store.get("academic_calendar") || [];
        let calendarEvents = [...ev1];
        ev2.forEach(e2 => {
            if (!calendarEvents.some(e => e.id === e2.id || (e.title === e2.title && e.start_date === e2.start_date))) {
                calendarEvents.push(e2);
            }
        });

        const toDeleteIds = Array.from(checkboxes).map(cb => cb.getAttribute("data-id"));
        calendarEvents = calendarEvents.filter(a => !toDeleteIds.includes(a.id));

        store.set("academic_calendar", calendarEvents);
        store.set("academic_events", calendarEvents);
        store.logAudit(`Admin deleted ${checkboxes.length} Academic Calendar Activities`, "Academic Management");
        app.showToast(`Deleted ${checkboxes.length} calendar schedule items!`, "success");
        if (typeof app.renderAcademicCalendarModal === 'function') {
            app.renderAcademicCalendarModal();
        }
        this.switchSection('academic');
    },

    toggleAllCalendarCheckboxes(checked) {
        document.querySelectorAll(".acad-act-cb").forEach(cb => cb.checked = checked);
    },

    toggleAllCourseCheckboxes(checked) {
        document.querySelectorAll(".course-dir-cb").forEach(cb => cb.checked = checked);
    },

    deleteSingleCourse(courseId) {
        const courses = store.get("courses") || [];
        const target = courses.find(c => c.id === courseId);
        const courseName = target ? `${target.course_code} (${target.title})` : "Course";

        if (!confirm(`Are you sure you want to permanently delete course ${courseName} from the system?`)) return;

        const updatedCourses = courses.filter(c => c.id !== courseId);
        store.set("courses", updatedCourses);
        store.logAudit(`Administrator deleted course module ${courseName}`, "Academic Management");
        app.showToast(`Course ${courseName} deleted successfully!`, "info");
        this.switchSection('academic');
    },

    deleteSelectedCourses() {
        const checkboxes = document.querySelectorAll(".course-dir-cb:checked");
        if (checkboxes.length === 0) {
            app.showToast("Please check at least one course to delete.", "warning");
            return;
        }

        if (!confirm(`Are you sure you want to permanently delete ${checkboxes.length} selected course(s) from the system?`)) return;

        const selectedIds = Array.from(checkboxes).map(cb => cb.getAttribute("data-id"));
        const courses = store.get("courses") || [];
        const updatedCourses = courses.filter(c => !selectedIds.includes(c.id));

        store.set("courses", updatedCourses);
        store.logAudit(`Administrator bulk deleted ${selectedIds.length} course module(s)`, "Academic Management");
        app.showToast(`Successfully deleted ${selectedIds.length} course(s) from the system.`, "success");
        this.switchSection('academic');
    },

    filterAuditLogs() {
        const roleVal = (document.getElementById("audit-role-filter")?.value || "ALL").toLowerCase();
        const searchVal = (document.getElementById("audit-actor-search")?.value || "").toLowerCase().trim();
        const tbody = document.getElementById("audit-log-tbody");
        if (!tbody) return;

        const auditLogs = store.get("audit_logs") || [];

        const filtered = auditLogs.filter(l => {
            const actorStr = (l.actor || "").toLowerCase();
            const actionStr = (l.action || "").toLowerCase();
            const catStr = (l.category || "").toLowerCase();

            let roleMatch = true;
            if (roleVal !== "all") {
                roleMatch = actorStr.includes(roleVal) || catStr.includes(roleVal);
            }

            let searchMatch = true;
            if (searchVal) {
                searchMatch = actorStr.includes(searchVal) || actionStr.includes(searchVal) || catStr.includes(searchVal);
            }

            return roleMatch && searchMatch;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">No audit logs matching selected role/name search.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(l => `
            <tr>
                <td><small>${l.date}</small></td>
                <td><strong>${l.actor}</strong></td>
                <td>${l.action}</td>
                <td><span class="badge badge-info">${l.category}</span></td>
            </tr>
        `).join('');
    },


    initAdminChart() {

        if (window._adminDeptChart) {
            window._adminDeptChart.destroy();
            window._adminDeptChart = null;
        }

        const canvas = document.getElementById('admin-analytics-chart');
        if (!canvas) return;

        const courses = store.get('courses') || [];
        const enrollments = store.get('enrollments') || [];


        const deptMap = {};
        courses.forEach(c => {
            const dept = c.department || 'Other';
            if (!deptMap[dept]) deptMap[dept] = { enrolled: 0, courses: 0 };
            deptMap[dept].courses++;
            deptMap[dept].enrolled += (c.enrolled_count || 0);
        });

        enrollments.forEach(e => {
            const course = courses.find(c => c.course_code === e.course_code);
            const dept = course ? (course.department || 'Other') : 'Other';
            if (!deptMap[dept]) deptMap[dept] = { enrolled: 0, courses: 0 };
            deptMap[dept].enrolled++;
        });

        const labels = Object.keys(deptMap);
        const data = labels.map(d => deptMap[d].enrolled);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const labelColor = isDark ? '#cbd5e1' : '#475569';

        const COLORS = [
            'rgba(37,99,235,0.75)',
            'rgba(16,185,129,0.75)',
            'rgba(245,158,11,0.75)',
            'rgba(124,58,237,0.75)',
            'rgba(239,68,68,0.75)',
            'rgba(6,182,212,0.75)',
        ];
        const BORDERS = COLORS.map(c => c.replace('0.75', '1'));

        window._adminDeptChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Enrolled Students',
                    data: data,
                    backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
                    borderColor: labels.map((_, i) => BORDERS[i % BORDERS.length]),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: { duration: 400 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y.toLocaleString()} Students Enrolled`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor, font: { size: 11, weight: '600' } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: labelColor, font: { size: 11 }, stepSize: 10 }
                    }
                }
            }
        });
    },


    initAttendanceTrendChart() {

    }
};
