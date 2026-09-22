const teacherView = {
    getAssignedCourses(teacher) {
        const user = store.getCurrentUser() || {};
        const teachers = store.get("teachers") || [];

        let tcData = teacher || user.teacher_data || user;

        if (tcData && (tcData.id || tcData.staff_id || tcData.email)) {
            const matchedTeacher = teachers.find(t =>
                (tcData.id && (t.id === tcData.id || t.id === tcData.teacher_id)) ||
                (tcData.staff_id && t.staff_id === tcData.staff_id) ||
                (tcData.email && (t.email === tcData.email || t.email === user.email))
            );
            if (matchedTeacher) {
                tcData = matchedTeacher;
            }
        }

        if (!tcData || (!tcData.id && !tcData.staff_id && !tcData.email)) {
            tcData = teachers[0] || {};
        }

        const allCourses = store.get("courses") || [];

        return allCourses.filter(c => {
            const isDirectTeacherMatch = (c.teacher_id && (c.teacher_id === tcData.id || c.teacher_id === tcData.staff_id)) ||
                (c.teacher_name && tcData.full_name && c.teacher_name.trim().toLowerCase() === tcData.full_name.trim().toLowerCase());

            const isTeacherArrayMatch = (tcData.assigned_courses && tcData.assigned_courses.includes(c.course_code)) ||
                (tcData.courses_assigned && tcData.courses_assigned.includes(c.course_code));

            if (c.teacher_id && c.teacher_id !== tcData.id && c.teacher_id !== tcData.staff_id && c.teacher_id !== 'unassigned') {
                return false;
            }

            return isDirectTeacherMatch || isTeacherArrayMatch;
        });
    },

    renderDashboard(teacher) {
        const user = store.getCurrentUser() || {};
        const tcData = teacher || user.teacher_data || (store.get("teachers") || [])[0] || {};
        const teacherId = tcData.staff_id || tcData.id;
        const assignedCourses = this.getAssignedCourses(tcData);
        const students = store.get("students") || [];
        const attendance = store.get("attendance") || [];
        const quizzes = store.get("quizzes") || [];
        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { academic_year: '2026/2027', current_semester: 'Semester 1', full_label: '2026/2027 - Semester 1' };

        return `
            <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08)); border: 1px solid var(--border-color); border-left: 4px solid var(--brand-primary); padding: 14px 20px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: white; font-size: 1rem;"><i class="fa-solid fa-chalkboard-user"></i></span>
                    <div>
                        <div style="font-size: 0.76rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px;">Current Academic Session</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);" class="active-academic-session-label">${activeSession.full_label}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-success" style="font-size: 0.8rem;"><i class="fa-solid fa-circle-dot"></i> Active Teaching Term</span>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">Academic Year: <strong id="teacher-dashboard-acad-year">${activeSession.academic_year}</strong></span>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <span>Assigned Courses</span>
                        <h3>${assignedCourses.length} Active Module(s)</h3>
                    </div>
                    <div class="stat-icon primary"><i class="fa-solid fa-book-bookmark"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Total Roster Students</span>
                        <h3>${students.length} Enrolled</h3>
                    </div>
                    <div class="stat-icon success"><i class="fa-solid fa-users"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Quizzes Uploaded</span>
                        <h3>${quizzes.length} Materials</h3>
                    </div>
                    <div class="stat-icon warning"><i class="fa-solid fa-file-arrow-up"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Attendance Logs</span>
                        <h3>${attendance.length} Register Entries</h3>
                    </div>
                    <div class="stat-icon purple"><i class="fa-solid fa-clipboard-check"></i></div>
                </div>
            </div>

            
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card teacher-dashboard-container" id="tc-analytics-container">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-chart-simple" style="color: var(--brand-primary);"></i> Attendance & Performance Analytics Container</h3>
                        </div>
                        <canvas id="teacher-analytics-chart" height="180"></canvas>
                    </div>

                    
                    <div class="card teacher-dashboard-container" id="tc-assigned-courses-container">
                        <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h3><i class="fa-solid fa-book-bookmark" style="color: var(--brand-primary);"></i> My Assigned Courses Overview</h3>
                            <button class="btn btn-sm btn-outline-primary" onclick="app.navigateTo('course-entry')"><i class="fa-solid fa-arrow-right"></i> Course Materials Workspace</button>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                            Courses assigned to your teaching schedule by System & Sub-Administrators for the active semester:
                        </p>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Title</th>
                                        <th>Credit Hours</th>
                                        <th>Department</th>
                                        <th>Academic Level</th>
                                        <th>Session</th>
                                        <th>Enrolled Students</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${assignedCourses.map(c => `
                                        <tr>
                                            <td><strong>${c.course_code}</strong></td>
                                            <td>${c.title}</td>
                                            <td>${c.credit_hours || 3} Hrs</td>
                                            <td>${c.department || 'Computer Science'}</td>
                                            <td>Level ${c.level || 300}</td>
                                            <td><span class="badge badge-primary">${c.session || 'Morning'}</span></td>
                                            <td><span class="badge badge-info">${c.enrolled_count || 120} Enrolled</span></td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="7" class="text-muted">No courses assigned to your teaching schedule by an administrator yet.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div class="card teacher-dashboard-container" id="tc-attendance-submissions-container">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-clipboard-user" style="color: var(--status-success);"></i> Recent Class Attendance Submissions Container</h3>
                            <button class="btn btn-sm btn-outline-primary" onclick="app.navigateTo('attendance')">Manage Register</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Student Name</th>
                                        <th>Student ID</th>
                                        <th>Course</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendance.slice(0, 5).map(a => `
                                        <tr>
                                            <td>${a.date}</td>
                                            <td><strong>${a.student_name}</strong></td>
                                            <td>${a.student_id}</td>
                                            <td>${a.course_code}</td>
                                            <td><span class="badge ${a.status === 'Present' ? 'badge-success' : 'badge-danger'}">${a.status}</span></td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="5" class="text-muted">No recent attendance logged.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card teacher-dashboard-container" id="tc-quick-actions-container">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-bolt" style="color: var(--status-warning);"></i> Quick Teacher Actions Container</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <button class="btn btn-primary btn-block" onclick="app.navigateTo('grade-entry')">
                                <i class="fa-solid fa-file-pen"></i> Enter Student Exam & CA Scores
                            </button>
                            <button class="btn btn-success btn-block" onclick="app.navigateTo('course-entry')">
                                <i class="fa-solid fa-upload"></i> Upload Quiz & Coursework Materials
                            </button>
                            <button class="btn btn-warning btn-block" onclick="app.navigateTo('announcements')">
                                <i class="fa-solid fa-bullhorn"></i> Post Class Announcement
                            </button>
                        </div>
                    </div>

                    
                    <div class="card teacher-dashboard-container" id="tc-bulletins-container" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-message" style="color: var(--brand-secondary);"></i> Active Course Bulletins</h3>
                        </div>
                        <div class="announcements-list">
                            ${(store.get("announcements") || []).filter(a => !a.target_audience || a.target_audience === 'ALL' || a.target_audience === 'TEACHERS').slice(0, 3).map(ann => `
                                <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                                    <h5 style="font-size: 0.9rem; margin-bottom: 4px;">${ann.title}</h5>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary);">${ann.content}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted);">${ann.date} • ${ann.author || ann.posted_by || 'Admin'}</small>
                                </div>
                            `).join('') || '<p class="text-muted" style="padding: 10px 0; font-size: 0.85rem;">No active course bulletins for teachers.</p>'}
                        </div>
                    </div>

                    
                    <div class="card teacher-dashboard-container" id="tc-complaints-container">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-comments" style="color: var(--status-warning);"></i> Student Complaints & Inquiries</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${(store.get("complaints") || []).filter(c => c.target_recipient_id === teacherId || c.target_recipient_type === 'TEACHER' || (teacher && c.target_recipient_name && c.target_recipient_name.includes(teacher.full_name))).map(c => `
                                <div style="padding: 12px; border-radius: var(--radius-md); background: var(--bg-primary); border-left: 4px solid ${c.reply ? 'var(--status-success)' : 'var(--status-warning)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                        <strong>${c.subject}</strong>
                                        <span class="badge ${c.reply ? 'badge-success' : 'badge-warning'}">${c.status || 'Pending'}</span>
                                    </div>
                                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 2px 0 6px 0;">${c.message}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted); display: block;">From: <strong>${c.student_name} (${c.student_id})</strong> • ${c.date}</small>

                                    ${c.reply ? `
                                        <div style="margin-top: 6px; padding: 6px 10px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(34, 197, 94, 0.2); font-size: 0.8rem;">
                                            <strong style="color: var(--status-success);"><i class="fa-solid fa-check"></i> Replied:</strong> ${c.reply}
                                        </div>
                                    ` : `
                                        <button type="button" class="btn btn-xs btn-outline-warning" style="margin-top: 8px;" onclick="teacherView.replyToComplaint('${c.id}')">
                                            <i class="fa-solid fa-reply"></i> Reply to Student Query
                                        </button>
                                    `}
                                </div>
                            `).join('') || '<p class="text-muted" style="font-size: 0.85rem;">No student complaints submitted to you.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    initTeacherChart() {
        const ctx = document.getElementById("teacher-analytics-chart");
        if (!ctx || typeof Chart === "undefined") return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                datasets: [{
                    label: 'Class Attendance Average (%)',
                    data: [92, 88, 95, 85, 90],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 6,
                    barThickness: 19,
                    maxBarThickness: 19
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    },

    renderCourseEntry() {
        const user = store.getCurrentUser() || {};
        const tcData = user.teacher_data || {};
        const courses = this.getAssignedCourses(tcData);
        const quizzes = store.get("quizzes") || [];

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-book-bookmark" style="color: var(--brand-primary);"></i> Assigned Semester Course Modules Overview</h3>
                            <span class="badge badge-info"><i class="fa-solid fa-lock"></i> Provisioned by Administrator</span>
                        </div>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px;">
                            Below are the academic courses allocated to your teaching schedule for the active semester. Course creation and credit modifications are managed strictly by the System / Academic Administrator.
                        </p>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Course Title</th>
                                        <th>Credits</th>
                                        <th>Level</th>
                                        <th>Session</th>
                                        <th>Attendance Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${courses.map(c => {
            const crsAtt = store.calculateCourseAttendance ? store.calculateCourseAttendance(c.course_code) : { rate: 100, total: 0 };
            return `
                                        <tr>
                                            <td><strong>${c.course_code}</strong></td>
                                            <td>${c.title}</td>
                                            <td>${c.credit_hours || 3} Hrs</td>
                                            <td>Level ${c.level || 300}</td>
                                            <td><span class="badge badge-primary">${c.session || 'Morning'}</span></td>
                                            <td>
                                                <span class="badge ${crsAtt.rate >= 75 ? 'badge-success' : 'badge-warning'}">
                                                    <i class="fa-solid fa-clipboard-user"></i> ${crsAtt.rate}% (${crsAtt.total} logs)
                                                </span>
                                            </td>
                                        </tr>
                                    `;
        }).join('') || '<tr><td colspan="6" class="text-muted">No courses assigned to your roster yet.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-upload" style="color: var(--status-success);"></i> Upload Quiz & Course Materials</h3>
                        </div>
                        <form onsubmit="teacherView.handleUploadQuiz(event)">
                            <div class="form-group">
                                <label for="qz-course">Select Assigned Course *</label>
                                <select id="qz-course" class="form-control" required>
                                    ${courses.map(c => `<option value="${c.course_code}">${c.course_code} - ${c.title}</option>`).join('') || '<option value="">No Assigned Courses</option>'}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="qz-title">Quiz / Resource Title *</label>
                                <input type="text" id="qz-title" class="form-control" placeholder="e.g. Mid-Sem Quiz 1 PDF" required>
                            </div>
                            <div class="form-group">
                                <label for="qz-url">Material Link / Document URL *</label>
                                <input type="text" id="qz-url" class="form-control" placeholder="https://isms.edu.gh/docs/quiz1.pdf" required>
                            </div>
                            <button type="submit" class="btn btn-success btn-block"><i class="fa-solid fa-arrow-up-from-bracket"></i> Publish Material</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    handleUploadQuiz(event) {
        event.preventDefault();
        const code = document.getElementById("qz-course").value;
        const title = document.getElementById("qz-title").value.trim();
        const url = document.getElementById("qz-url").value.trim();

        const quizzes = store.get("quizzes") || [];
        quizzes.unshift({ id: "q-" + Date.now(), course_code: code, title: title, file_url: url, date: new Date().toLocaleDateString() });
        store.set("quizzes", quizzes);

        store.logAudit(`Teacher published course resource: "${title}" for ${code}`, "Academic");
        app.showToast(`Resource "${title}" published for ${code}!`, "success");
    },

    renderStudentList() {
        const students = store.get("students") || [];
        return `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fa-solid fa-users" style="color: var(--brand-primary);"></i> Enrolled Students Roster</h3>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Programme</th>
                                <th>Level</th>
                                <th>Session</th>
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
                                    <td>${s.session}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderAttendanceManagement() {
        const students = store.get("students") || [];
        const user = store.getCurrentUser() || {};
        const courses = this.getAssignedCourses(user.teacher_data);
        const attendanceLogs = store.get("attendance") || [];

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-clipboard-check" style="color: var(--status-success);"></i> Mark Daily Class Attendance</h3>
                        </div>
                        <form onsubmit="teacherView.handleBulkAttendanceSubmit(event)">
                            <div class="form-row" style="margin-bottom: 16px;">
                                <div class="form-group col-6">
                                    <label for="tc-att-course">Course Class *</label>
                                    <select id="tc-att-course" class="form-control" required>
                                        ${courses.map(c => `<option value="${c.course_code}|${c.title}">${c.course_code} - ${c.title}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group col-6">
                                    <label for="tc-att-date">Class Date *</label>
                                    <input type="date" id="tc-att-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Attendance Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${students.map(s => `
                                            <tr>
                                                <td><strong>${s.student_id}</strong></td>
                                                <td>${s.first_name} ${s.surname}</td>
                                                <td>
                                                    <select class="form-control form-control-sm tc-att-status" data-id="${s.student_id}" data-name="${s.first_name} ${s.surname}">
                                                        <option value="Present">Present</option>
                                                        <option value="Late">Late</option>
                                                        <option value="Absent">Absent</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>

                            <button type="submit" class="btn btn-success btn-block" style="margin-top: 16px;">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Submit & Synchronize Attendance Register
                            </button>
                        </form>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-clock-rotate-left" style="color: var(--brand-primary);"></i> Attendance History Lookup</h3>
                        </div>
                        <div class="form-row" style="margin-bottom: 12px;">
                            <div class="form-group col-12">
                                <input type="text" id="tc-att-history-search" class="form-control" placeholder="Search by Student ID, Name, or Course Code..." oninput="teacherView.filterAttendanceHistory()">
                            </div>
                        </div>

                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="tc-att-history-body">
                                    ${attendanceLogs.slice(0, 15).map(a => `
                                        <tr>
                                            <td>${a.date}</td>
                                            <td><strong>${a.student_name}</strong><br><small class="text-muted">${a.student_id}</small></td>
                                            <td>${a.course_code}</td>
                                            <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="4" class="text-muted">No attendance logs recorded.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    filterAttendanceHistory() {
        const query = (document.getElementById("tc-att-history-search")?.value || '').toLowerCase().trim();
        const tbody = document.getElementById("tc-att-history-body");
        if (!tbody) return;

        const attendanceLogs = store.get("attendance") || [];
        const filtered = attendanceLogs.filter(a => {
            if (!query) return true;
            return (a.student_name || '').toLowerCase().includes(query) ||
                (a.student_id || '').toLowerCase().includes(query) ||
                (a.course_code || '').toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">No attendance logs matching "${query}".</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(a => `
            <tr>
                <td>${a.date}</td>
                <td><strong>${a.student_name}</strong><br><small class="text-muted">${a.student_id}</small></td>
                <td>${a.course_code}</td>
                <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
            </tr>
        `).join('');
    },

    handleBulkAttendanceSubmit(event) {
        event.preventDefault();
        const val = document.getElementById("tc-att-course").value;
        const date = document.getElementById("tc-att-date").value;
        const [code, title] = val.split('|');

        const selects = document.querySelectorAll(".tc-att-status");
        const attendance = store.get("attendance") || [];

        selects.forEach(sel => {
            const stId = sel.getAttribute("data-id");
            const stName = sel.getAttribute("data-name");
            const status = sel.value;

            attendance.unshift({
                id: "att-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
                student_id: stId,
                student_name: stName,
                course_code: code,
                course_title: title,
                date: date,
                status: status
            });
        });

        store.set("attendance", attendance);
        store.logAudit(`Teacher submitted attendance register for ${code} on ${date}`, "Attendance");
        app.showToast(`Attendance register submitted for ${code} on ${date}!`, "success");
        this.filterAttendanceHistory();
    },

    renderGradeEntry() {
        const students = store.get("students") || [];
        const user = store.getCurrentUser() || {};
        const firstStudent = students[0] || {};
        const enrollments = store.get("enrollments") || [];
        const studentEnrollments = enrollments.filter(e => e.student_id === firstStudent.student_id);
        const assignedCourses = this.getAssignedCourses(user.teacher_data);

        let initialCourses = studentEnrollments.length > 0
            ? studentEnrollments.map(e => `<option value="${e.course_code}|${e.course_title}">${e.course_code} - ${e.course_title}${e.is_resit ? ' (RE-SIT)' : ''}</option>`).join('')
            : assignedCourses.map(c => `<option value="${c.course_code}|${c.title}">${c.course_code} - ${c.title}</option>`).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fa-solid fa-file-pen" style="color: var(--brand-primary);"></i> Student Gradebook & Marks Entry</h3>
                </div>
                <form onsubmit="teacherView.handleSaveGrade(event)">
                    <div class="form-row">
                        <div class="form-group col-6">
                            <label for="grd-student">Select Student *</label>
                            <select id="grd-student" class="form-control" required onchange="teacherView.updateStudentCourseDropdown(this.value)">
                                ${students.map(s => `<option value="${s.student_id}">${s.student_id} - ${s.first_name} ${s.surname}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group col-6">
                            <label for="grd-course">Select Registered Course *</label>
                            <select id="grd-course" class="form-control" required>
                                ${initialCourses || '<option value="">No Registered Courses Available</option>'}
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-6">
                            <label for="grd-ca">Continuous Assessment Score (Out of 30) *</label>
                            <input type="number" id="grd-ca" class="form-control" min="0" max="30" placeholder="e.g. 26" required>
                        </div>
                        <div class="form-group col-6">
                            <label for="grd-exam">Final Exam Score (Out of 70) *</label>
                            <input type="number" id="grd-exam" class="form-control" min="0" max="70" placeholder="e.g. 60" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 16px;">
                        <i class="fa-solid fa-check"></i> Calculate Grade & Publish to Student Dashboard
                    </button>
                </form>
            </div>
        `;
    },

    updateStudentCourseDropdown(studentId) {
        const dropdown = document.getElementById("grd-course");
        if (!dropdown) return;

        const enrollments = store.get("enrollments") || [];
        const studentEnrollments = enrollments.filter(e => e.student_id === studentId);
        const user = store.getCurrentUser() || {};
        const assignedCourses = this.getAssignedCourses(user.teacher_data);

        let optionsHtml = '';

        if (studentEnrollments.length > 0) {
            optionsHtml = studentEnrollments.map(e => {
                const label = `${e.course_code} - ${e.course_title}${e.is_resit ? ' (RE-SIT / RE-TAKE)' : ''}`;
                return `<option value="${e.course_code}|${e.course_title}">${label}</option>`;
            }).join('');
        } else {
            optionsHtml = assignedCourses.map(c => `<option value="${c.course_code}|${c.title}">${c.course_code} - ${c.title}</option>`).join('');
        }

        dropdown.innerHTML = optionsHtml || '<option value="">No Registered Courses Found</option>';
    },

    handleSaveGrade(event) {
        event.preventDefault();
        const stId = document.getElementById("grd-student").value;
        const courseVal = document.getElementById("grd-course").value;
        if (!courseVal) {
            app.showToast("Please select a registered course to publish grade.", "warning");
            return;
        }

        const [code, title] = courseVal.split('|');
        const ca = Number(document.getElementById("grd-ca").value);
        const exam = Number(document.getElementById("grd-exam").value);
        const total = ca + exam;

        let letter = "F";
        let point = "0.0";

        if (total >= 80) { letter = "A"; point = "4.0"; }
        else if (total >= 75) { letter = "B+"; point = "3.5"; }
        else if (total >= 70) { letter = "B"; point = "3.0"; }
        else if (total >= 65) { letter = "C+"; point = "2.5"; }
        else if (total >= 60) { letter = "C"; point = "2.0"; }
        else if (total >= 50) { letter = "D"; point = "1.0"; }

        const grades = store.get("grades") || [];
        const students = store.get("students") || [];
        const studentObj = students.find(s => s.student_id === stId || s.id === stId);
        const existingIdx = grades.findIndex(g => g.student_id === stId && g.course_code === code);
        const stName = studentObj ? (studentObj.full_name || `${studentObj.first_name} ${studentObj.surname}`) : (existingIdx >= 0 ? grades[existingIdx].student_name : stId);

        const record = {
            id: existingIdx >= 0 ? grades[existingIdx].id : "g-" + Date.now(),
            student_id: stId,
            student_name: stName,
            course_code: code,
            course_title: title,
            assessment_score: ca,
            exam_score: exam,
            total_score: total,
            letter_grade: letter,
            grade_point: point,
            is_published: true,
            status: "Approved & Published"
        };

        if (existingIdx >= 0) grades[existingIdx] = record;
        else grades.push(record);

        store.set("grades", grades);


        const enrollments = store.get("enrollments") || [];
        const targetEnrs = enrollments.filter(e => e.student_id === stId && (e.course_code === code || code.startsWith(e.course_code)));
        targetEnrs.forEach(enr => {
            enr.status = "Published";
            enr.is_published = true;
        });
        store.set("enrollments", enrollments);

        const studentGrades = grades.filter(g => g.student_id === stId && g.is_published !== false);
        let totalPts = 0;
        let totalCredits = 0;
        studentGrades.forEach(sg => {
            totalPts += Number(sg.grade_point || 0) * 3;
            totalCredits += 3;
        });
        const updatedGpa = totalCredits > 0 ? Number((totalPts / totalCredits).toFixed(2)) : 4.00;

        const targetStudent = students.find(s => s.student_id === stId);
        if (targetStudent) {
            targetStudent.gpa = updatedGpa;
            targetStudent.cgpa = updatedGpa;
            store.set("students", students);
        }

        store.logAudit(`Teacher published results for student ${stId} in ${code}: ${total}% (Grade ${letter}, New CGPA: ${updatedGpa})`, "Results");
        app.showToast(`Grade published for ${stId} in ${code}: ${total}% (${letter}). Re-sit status updated to PUBLISHED.`, "success");
        alert(`GRADE CALCULATED & PUBLISHED TO STUDENT DASHBOARD!\n\nStudent ID: ${stId}\nCourse: ${code} - ${title}\nContinuous Assessment (30%): ${ca}\nFinal Exam (70%): ${exam}\nTotal Score: ${total}%\nLetter Grade: ${letter} (${point})\n\nCourse Registration Status: PUBLISHED\nUpdated Cumulative GPA: ${updatedGpa} / 4.00`);
    },

    renderAnnouncements() {
        const announcements = (store.get("announcements") || []).filter(a => !a.target_audience || a.target_audience === 'ALL' || a.target_audience === 'TEACHERS');

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-bullhorn" style="color: var(--brand-secondary);"></i> Broadcast New Announcement</h3>
                        </div>
                        <form onsubmit="teacherView.handlePostAnnouncement(event)">
                            <div class="form-group">
                                <label for="ann-title">Bulletin Title *</label>
                                <input type="text" id="ann-title" class="form-control" placeholder="e.g. Mid-Sem Project Submission Deadline" required>
                            </div>
                            <div class="form-group">
                                <label for="ann-content">Announcement Body *</label>
                                <textarea id="ann-content" class="form-control" rows="4" placeholder="Write full details..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-warning btn-block"><i class="fa-solid fa-paper-plane"></i> Publish Bulletin to Student Dashboard</button>
                        </form>
                    </div>
                </div>

                <div class="grid-column">
                    <div class="card">
                        <div class="card-header">
                            <h3>Posted Bulletins & Class Announcements</h3>
                        </div>
                        <div class="announcements-list">
                            ${announcements.map(a => `
                                <div style="padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                                    <div>
                                        <strong style="font-size: 0.92rem;">${a.title}</strong>
                                        <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 4px 0;">${a.content}</p>
                                        <small style="font-size: 0.75rem; color: var(--text-muted);">${a.date} • Posted by ${a.author || 'Academic Staff'}</small>
                                    </div>
                                    <button type="button" class="btn btn-xs btn-outline-danger" onclick="teacherView.handleDeleteAnnouncement('${a.id}')" title="Delete announcement from student dashboard">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            `).join('') || '<p class="text-muted">No announcements posted yet.</p>'}
                        </div>
                    </div>
                </div>
            
            <div class="card" style="margin-top: 24px;">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <h3><i class="fa-solid fa-bell" style="color: var(--status-warning);"></i> Received Notifications & Alerts from Students & Sub-Administrators</h3>
                    <button type="button" class="btn btn-xs btn-outline-danger" onclick="teacherView.handleDeleteAllNotifications()">
                        <i class="fa-solid fa-trash-can"></i> Delete All Notifications
                    </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${(() => {
                const user = store.getCurrentUser() || {};
                const teacherData = user.teacher_data || {};
                const complaints = store.get("complaints") || [];
                const teacherNotifs = complaints.filter(c =>
                    c.target_recipient_id === teacherData.staff_id ||
                    c.target_recipient_type === 'TEACHER' ||
                    (c.target_recipient_name && c.target_recipient_name.includes(teacherData.full_name || '')) ||
                    (c.target_recipient_name && c.target_recipient_name.toLowerCase().includes('teacher'))
                );

                if (teacherNotifs.length === 0) {
                    return '<p class="text-muted" style="padding: 10px;">No notifications or alerts received from students or sub-administrators.</p>';
                }

                return teacherNotifs.map(c => `
                            <div style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-primary); border-left: 4px solid ${c.reply ? 'var(--status-success)' : 'var(--status-warning)'};">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                                    <strong>${c.subject}</strong>
                                    <div style="display: flex; gap: 6px; align-items: center;">
                                        <span class="badge ${c.reply ? 'badge-success' : 'badge-warning'}">${c.status || 'Pending'}</span>
                                        <button type="button" class="btn btn-xs btn-outline-danger" onclick="teacherView.handleDeleteNotification('${c.id}')" title="Delete notification">
                                            <i class="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 4px 0 8px 0;">${c.message}</p>
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                    <small style="font-size: 0.76rem; color: var(--text-muted);">From: <strong>${c.student_name || 'User'} (${c.student_id || 'ID'})</strong> • Recipient: <strong>${c.target_recipient_name || 'Teacher'}</strong> • ${c.date}</small>
                                    ${c.reply ? `
                                        <div style="width: 100%; margin-top: 6px; padding: 8px 12px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(34, 197, 94, 0.2); font-size: 0.82rem;">
                                            <strong style="color: var(--status-success);"><i class="fa-solid fa-check"></i> Your Response:</strong> ${c.reply}
                                        </div>
                                    ` : `
                                        <button type="button" class="btn btn-xs btn-outline-warning" onclick="teacherView.handleReplyToComplaint('${c.id}')">
                                            <i class="fa-solid fa-reply"></i> Respond to Query
                                        </button>
                                    `}
                                </div>
                            </div>
                        `).join('');
            })()}
                </div>
            </div>
        `;
    },

    handleReplyToComplaint(complaintId) {
        const replyText = prompt("Enter your response to this student/administrator query:");
        if (!replyText || !replyText.trim()) return;

        const user = store.getCurrentUser() || {};
        const complaints = store.get("complaints") || [];
        const comp = complaints.find(c => c.id === complaintId);

        if (comp) {
            comp.reply = replyText.trim();
            comp.status = "Resolved";
            comp.replied_by = user.full_name || "Teacher";
            store.set("complaints", complaints);
            app.showToast("Response submitted successfully!", "success");
            app.navigateTo("announcements");
        }
    },

    handleDeleteNotification(complaintId) {
        if (!confirm("Are you sure you want to delete this notification from your dashboard?")) return;

        let complaints = store.get("complaints") || [];
        complaints = complaints.filter(c => c.id !== complaintId);
        store.set("complaints", complaints);

        app.showToast("Notification deleted successfully!", "info");
        app.navigateTo("announcements");
    },

    handleDeleteAllNotifications() {
        const user = store.getCurrentUser() || {};
        const teacherData = user.teacher_data || {};
        if (!confirm("Are you sure you want to delete all received notifications from your dashboard?")) return;

        let complaints = store.get("complaints") || [];
        complaints = complaints.filter(c =>
            c.target_recipient_id !== teacherData.staff_id &&
            c.target_recipient_name !== teacherData.full_name
        );
        store.set("complaints", complaints);

        app.showToast("All notifications deleted successfully!", "info");
        app.navigateTo("announcements");
    },

    handlePostAnnouncement(event) {
        event.preventDefault();
        const user = store.getCurrentUser() || {};
        const teacher = user.teacher_data || {};
        const title = document.getElementById("ann-title").value.trim();
        const content = document.getElementById("ann-content").value.trim();

        const announcements = store.get("announcements") || [];
        announcements.unshift({
            id: "ann-" + Date.now(),
            title: title,
            content: content,
            target_audience: "STUDENTS",
            date: new Date().toLocaleDateString(),
            author: teacher.full_name || user.full_name || "Academic Lecturer"
        });

        store.set("announcements", announcements);
        store.logAudit(`Teacher published announcement: "${title}"`, "Communication");
        app.showToast("Announcement published successfully to student dashboards!", "success");
        app.navigateTo("announcements");
    },

    handleDeleteAnnouncement(annId) {
        if (!confirm("Are you sure you want to delete this posted announcement from student dashboards?")) return;

        let announcements = store.get("announcements") || [];
        announcements = announcements.filter(a => a.id !== annId);
        store.set("announcements", announcements);

        store.logAudit(`Teacher deleted announcement ID: ${annId}`, "Communication");
        app.showToast("Announcement removed successfully!", "info");
        app.navigateTo("announcements");
    },

    renderSettings(teacher) {
        const user = store.getCurrentUser() || {};
        const tcData = user.teacher_data || teacher || {};

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-user-pen" style="color: var(--status-success);"></i> Edit Teacher Profile & Photo</h3>
                        </div>

                        
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                            <img id="tc-setting-avatar-preview" src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Profile Photo" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary); box-shadow: var(--shadow-sm);">
                            <div>
                                <strong style="font-size: 0.9rem; display: block; margin-bottom: 4px;">Teacher Profile Photo</strong>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                                    <label class="btn btn-xs btn-primary" style="cursor: pointer; margin: 0;">
                                        <i class="fa-solid fa-upload"></i> Upload Photo
                                        <input type="file" accept="image/*" style="display: none;" onchange="app.handleAvatarUpload(event)">
                                    </label>
                                    <button type="button" class="btn btn-xs btn-outline-danger" onclick="app.deleteAvatarPhoto()">
                                        <i class="fa-solid fa-trash"></i> Delete Photo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <form onsubmit="teacherView.handleTeacherProfileUpdate(event)">
                            <div class="form-group">
                                <label for="tc-set-name">Full Name *</label>
                                <input type="text" id="tc-set-name" class="form-control" value="${user.full_name || tcData.full_name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="tc-set-id">Staff ID (Read Only)</label>
                                <input type="text" id="tc-set-id" class="form-control" value="${tcData.staff_id || user.staff_id || 'STF23001'}" readonly>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label for="tc-set-email">Official Email Address *</label>
                                    <input type="email" id="tc-set-email" class="form-control" value="${user.email || tcData.email || ''}" required>
                                </div>
                                <div class="form-group col-6">
                                    <label for="tc-set-phone">Phone Number *</label>
                                    <input type="tel" id="tc-set-phone" class="form-control" value="${user.phone_number || tcData.phone_number || ''}" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-floppy-disk"></i> Update Teacher Profile</button>
                        </form>
                    </div>

                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-key" style="color: var(--brand-primary);"></i> Update Account Password</h3>
                        </div>
                        <form onsubmit="teacherView.handleTeacherPasswordUpdate(event)">
                            <div class="form-group">
                                <label for="tc-curr-pass">Current Password *</label>
                                <input type="password" id="tc-curr-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="tc-new-pass">New Password * <small class="text-muted">(Min 6, 1 Upper, 1 Num, 1 Symbol)</small></label>
                                <input type="password" id="tc-new-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="tc-rep-pass">Repeat New Password *</label>
                                <input type="password" id="tc-rep-pass" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save New Password</button>
                        </form>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-palette" style="color: var(--brand-secondary);"></i> Theme & Visual Settings</h3>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <div>
                                <strong>Dark / Light Theme Mode</strong>
                                <p style="font-size: 0.82rem; color: var(--text-secondary);">Toggle workspace visual color theme.</p>
                            </div>
                            <button class="btn btn-outline-primary" onclick="app.toggleTheme()">
                                <i class="fa-solid fa-circle-half-stroke"></i> Switch Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleTeacherProfileUpdate(event) {
        event.preventDefault();
        const name = document.getElementById("tc-set-name").value.trim();
        const email = document.getElementById("tc-set-email").value.trim();
        const phone = document.getElementById("tc-set-phone").value.trim();

        const user = store.getCurrentUser();
        if (user) {
            user.full_name = name;
            user.email = email;
            user.phone_number = phone;

            if (user.teacher_data) {
                user.teacher_data.full_name = name;
                user.teacher_data.email = email;
                user.teacher_data.phone_number = phone;
            }

            store.setCurrentUser(user);

            const briefName = document.getElementById("brief-name");
            if (briefName) briefName.innerText = name;

            const teachers = store.get("teachers") || [];
            const tc = teachers.find(t => t.staff_id === (user.teacher_data ? user.teacher_data.staff_id : null) || t.email === email);
            if (tc) {
                tc.full_name = name;
                tc.email = email;
                tc.phone_number = phone;
                store.set("teachers", teachers);
            }

            const profiles = store.get("profiles") || [];
            const pr = profiles.find(p => p.id === user.id || p.email === email);
            if (pr) {
                pr.full_name = name;
                pr.email = email;
                pr.phone_number = phone;
                store.set("profiles", profiles);
            }

            store.logAudit(`Teacher (${name}) updated account profile details`, "User Management");
            app.showToast("Teacher profile details updated successfully!", "success");
        }
    },

    async handleTeacherPasswordUpdate(event) {
        event.preventDefault();
        const curr = document.getElementById("tc-curr-pass").value;
        const newP = document.getElementById("tc-new-pass").value;
        const rep = document.getElementById("tc-rep-pass").value;

        if (newP !== rep) {
            app.showToast("New passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(newP)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }

        const user = store.getCurrentUser();
        const tcData = user.teacher_data;
        const teachers = store.get("teachers") || [];
        const target = teachers.find(t => t.staff_id === (tcData ? tcData.staff_id : null) || t.email === user.email);

        if (target && target.password) {
            const isValidCurr = await passwordHelper.verifyPassword(curr, target.password);
            if (!isValidCurr) {
                app.showToast("Current password is incorrect!", "danger");
                return;
            }
        }

        const hashedNew = await passwordHelper.hashPassword(newP);
        if (target) {
            target.password = hashedNew;
            store.set("teachers", teachers);
        }

        user.password = hashedNew;
        if (user.teacher_data) user.teacher_data.password = hashedNew;
        store.setCurrentUser(user);
        app.showToast("Password updated successfully!", "success");
        event.target.reset();
    },

    replyToComplaint(complaintId) {
        const replyText = prompt("Enter your official response to this student complaint:");
        if (!replyText || !replyText.trim()) return;

        const user = store.getCurrentUser();
        const complaints = store.get("complaints") || [];
        const comp = complaints.find(c => c.id === complaintId);

        if (comp) {
            comp.reply = replyText.trim();
            comp.status = "Resolved";
            comp.replied_by = user.full_name || "Course Lecturer";
            store.set("complaints", complaints);

            store.logAudit(`Teacher (${user.full_name}) responded to student complaint: ${comp.subject}`, "Communication");
            app.showToast("Reply sent successfully to student!", "success");
            app.navigateTo("dashboard");
        }
    }
};
