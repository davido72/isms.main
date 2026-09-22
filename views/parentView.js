const parentView = {
    _selectedWardFeeId: null,

    getLinkedWards() {
        const user = store.getCurrentUser() || {};
        const parents = store.get("parents") || [];
        const parentRecord = parents.find(p =>
            (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
            (user.id && (p.id === user.id || p.profile_id === user.id)) ||
            (user.staff_id && p.id === user.staff_id)
        ) || user.parent_data || user;

        const linkedIds = parentRecord.linked_student_ids || [];
        const students = store.get("students") || [];
        const linkedStudents = students.filter(s => linkedIds.includes(s.student_id));
        return { linkedIds, linkedStudents, parentRecord };
    },

    renderDashboard(parent) {
        const { linkedIds, linkedStudents } = this.getLinkedWards();
        const child = linkedStudents[0] || (linkedIds.length > 0 ? { first_name: "Ward", surname: linkedIds[0], student_id: linkedIds[0], level: "100" } : null);


        const allFees = store.get("fees") || [];
        let totalFeesAmount = 0;
        let totalPaidAmount = 0;
        let totalBalanceDue = 0;

        if (linkedIds.length > 0) {
            linkedIds.forEach(id => {
                const feeObj = allFees.find(f => f.student_id === id);
                if (feeObj) {
                    totalFeesAmount += Number(feeObj.total_amount || 0);
                    totalPaidAmount += Number(feeObj.paid_amount || 0);
                    totalBalanceDue += Number(feeObj.balance_due || 0);
                } else {
                    totalFeesAmount += 4800;
                    totalBalanceDue += 4800;
                }
            });
        }

        const attendanceLogs = (store.get("attendance") || []).filter(a => child && a.student_id === child.student_id);
        const childAtt = child && store.calculateStudentAttendance ? store.calculateStudentAttendance(child.student_id) : null;
        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { academic_year: '2026/2027', current_semester: 'Semester 1', full_label: '2026/2027 - Semester 1' };

        return `
            <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08)); border: 1px solid var(--border-color); border-left: 4px solid var(--brand-primary); padding: 14px 20px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: white; font-size: 1rem;"><i class="fa-solid fa-users"></i></span>
                    <div>
                        <div style="font-size: 0.76rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px;">Current Academic Session</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);" class="active-academic-session-label">${activeSession.full_label}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-success" style="font-size: 0.8rem;"><i class="fa-solid fa-circle-dot"></i> Active Semester</span>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">Academic Year: <strong id="parent-dashboard-acad-year">${activeSession.academic_year}</strong></span>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <span>Linked Ward(s)</span>
                        <h3>${linkedStudents.length > 1 ? `${child.first_name} ${child.surname} (+${linkedStudents.length - 1} more)` : child ? `${child.first_name} ${child.surname}` : 'No Ward Linked'}</h3>
                    </div>
                    <div class="stat-icon primary"><i class="fa-solid fa-child"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Student ID(s)</span>
                        <h3>${linkedIds.length > 0 ? linkedIds.join(', ') : 'None'}</h3>
                    </div>
                    <div class="stat-icon success"><i class="fa-solid fa-id-badge"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Programme & Level</span>
                        <h3>${child ? (child.programme ? `${child.programme} (L${child.level || 100})` : `Level ${child.level || 100}`) : 'N/A'}</h3>
                    </div>
                    <div class="stat-icon warning"><i class="fa-solid fa-graduation-cap"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Outstanding Fees</span>
                        <h3 style="color: ${totalBalanceDue > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
                            GHS ${totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div class="stat-icon ${totalBalanceDue > 0 ? 'danger' : 'purple'}"><i class="fa-solid fa-wallet"></i></div>
                </div>
            </div>

            
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card parent-dashboard-container" id="ward-results-container">
                        <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h3><i class="fa-solid fa-magnifying-glass" style="color: var(--brand-primary);"></i> Ward Academic Results</h3>
                            <button class="btn btn-primary" onclick="app.navigateTo('child-results')">Open Results Search</button>
                        </div>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">
                            Query your child's continuous assessment (30%), end-of-semester exam marks (70%), computed GPA, and download official PDF Statement of Results.
                        </p>
                        ${linkedStudents.length > 0 ? `
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                                ${linkedStudents.map(st => `
                                    <button class="btn btn-sm btn-outline-primary" onclick="parentView.quickViewResults('${st.student_id}', '${st.first_name} ${st.surname}')">
                                        <i class="fa-solid fa-user-graduate"></i> View ${st.first_name}'s Results (${st.student_id})
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    
                    <div class="card parent-dashboard-container" id="ward-attendance-container">
                        <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h3><i class="fa-solid fa-user-check" style="color: var(--status-success);"></i> Ward Attendance Overview</h3>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${childAtt ? `<span class="badge ${childAtt.rate >= 75 ? 'badge-success' : 'badge-warning'}" style="font-size: 0.82rem;"><i class="fa-solid fa-chart-pie"></i> ${childAtt.rate}% Overall (${childAtt.attended}/${childAtt.total} sessions)</span>` : ''}
                                <button class="btn btn-sm btn-outline-primary" onclick="app.navigateTo('attendance')">View Full Register</button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Ward ID</th>
                                        <th>Course</th>
                                        <th>Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendanceLogs.slice(0, 5).map(a => `
                                        <tr>
                                            <td>${a.date}</td>
                                            <td><strong>${a.student_id}</strong></td>
                                            <td>${a.course_code} - ${a.course_title || ''}</td>
                                            <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
                                        </tr>
                                    `).join('') || `<tr><td colspan="4" class="text-muted" style="text-align: center; padding: 16px;">${child ? 'No recent attendance entries recorded for this ward.' : 'No linked student ward.'}</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card parent-dashboard-container" id="ward-fee-summary-container" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-hand-holding-dollar" style="color: var(--brand-secondary);"></i> Ward Tuition Fee Summary</h3>
                        </div>
                        <div style="padding: 6px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
                                <span style="color: var(--text-secondary);">Total Assigned Tuition:</span>
                                <strong>GHS ${totalFeesAmount.toFixed(2)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
                                <span style="color: var(--text-secondary);">Total Verified Paid:</span>
                                <strong style="color: var(--status-success);">GHS ${totalPaidAmount.toFixed(2)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 0.95rem; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                                <strong>Total Outstanding Balance:</strong>
                                <strong style="color: ${totalBalanceDue > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">GHS ${totalBalanceDue.toFixed(2)}</strong>
                            </div>
                        </div>
                        <button class="btn btn-success btn-block" onclick="app.navigateTo('fees')">
                            <i class="fa-solid fa-credit-card"></i> Manage Ward Fees & Pay Online
                        </button>
                    </div>

                    
                    <div class="card parent-dashboard-container" id="ward-bulletins-container">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-bullhorn" style="color: var(--brand-primary);"></i> University Bulletins & Notices</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${(store.get("announcements") || []).filter(a => !a.target_audience || a.target_audience === 'ALL' || a.target_audience === 'PARENTS').slice(0, 3).map(a => `
                                <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 4px;">
                                        <strong style="font-size: 0.88rem;">${a.title}</strong>
                                        <small style="font-size: 0.75rem; color: var(--text-muted);">${a.date}</small>
                                    </div>
                                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 2px 0 6px 0;">${a.content}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-user-pen"></i> Posted by ${a.author || a.posted_by || 'Administration'}</small>
                                </div>
                            `).join('') || '<p class="text-muted" style="font-size: 0.85rem;">No active announcements posted for parents.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    quickViewResults(stId, stName) {
        app.navigateTo("child-results");
        setTimeout(() => {
            const nameEl = document.getElementById("pr-search-name");
            const idEl = document.getElementById("pr-search-id");
            if (nameEl && idEl) {
                nameEl.value = stName;
                idEl.value = stId;
                const form = document.getElementById("parent-results-search-form");
                if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        }, 150);
    },

    renderChildResults() {
        const { linkedIds, linkedStudents } = this.getLinkedWards();

        return `
            <div class="card parent-dashboard-container" id="ward-results-container">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3><i class="fa-solid fa-magnifying-glass" style="color: var(--brand-primary);"></i> Search Ward Academic Results</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Query real-time academic grades, semester GPAs, and generate official statements.</p>
                    </div>
                </div>

                ${linkedStudents.length > 0 ? `
                    <div style="background: rgba(59, 130, 246, 0.05); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <strong style="font-size: 0.85rem;">Your Linked Ward(s):</strong>
                            <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 6px;">Click to auto-fill search form:</span>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${linkedStudents.map(st => `
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="parentView.autoFillSearch('${st.first_name} ${st.surname}', '${st.student_id}')">
                                    <i class="fa-solid fa-user-check"></i> ${st.first_name} ${st.surname} (${st.student_id})
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <form id="parent-results-search-form" onsubmit="parentView.handleChildResultSearch(event)" style="background: var(--bg-primary); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px;">
                    <div class="form-row">
                        <div class="form-group col-6">
                            <label for="pr-search-name">Student's Full Name *</label>
                            <input type="text" id="pr-search-name" class="form-control" value="${linkedStudents[0] ? `${linkedStudents[0].first_name} ${linkedStudents[0].surname}` : ''}" placeholder="e.g. Abena Osei Appiah" required>
                        </div>
                        <div class="form-group col-6">
                            <label for="pr-search-id">Student ID *</label>
                            <input type="text" id="pr-search-id" class="form-control" value="${linkedStudents[0] ? linkedStudents[0].student_id : (linkedIds[0] || '')}" placeholder="e.g. 4211260001" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fa-solid fa-magnifying-glass"></i> Search & Retrieve Results
                    </button>
                </form>

                <div id="child-result-output" class="hidden">
                    <!-- Results populated dynamically -->
                </div>
            </div>
        `;
    },

    autoFillSearch(name, id) {
        const nameEl = document.getElementById("pr-search-name");
        const idEl = document.getElementById("pr-search-id");
        if (nameEl) nameEl.value = name;
        if (idEl) idEl.value = id;
        const form = document.getElementById("parent-results-search-form");
        if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
    },

    handleChildResultSearch(event) {
        event.preventDefault();
        const name = (document.getElementById("pr-search-name")?.value || "").trim().toLowerCase();
        const id = (document.getElementById("pr-search-id")?.value || "").trim().toUpperCase();

        const students = store.get("students") || [];
        const student = students.find(s => s.student_id === id);

        if (!student) {
            app.showToast("No student found with the provided Student ID.", "danger");
            return;
        }

        const grades = (store.get("grades") || []).filter(g => g.student_id === id && g.is_published);

        let totalPoints = 0;
        let totalCredits = 0;
        grades.forEach(g => {
            const credits = Number(g.credit_hours || 3);
            const gp = Number(g.grade_point || (g.letter_grade === 'A' ? 4.0 : g.letter_grade === 'B+' ? 3.5 : g.letter_grade === 'B' ? 3.0 : g.letter_grade === 'C+' ? 2.5 : g.letter_grade === 'C' ? 2.0 : g.letter_grade === 'D+' ? 1.5 : g.letter_grade === 'D' ? 1.0 : 0.0));
            totalPoints += (gp * credits);
            totalCredits += credits;
        });
        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        const outputDiv = document.getElementById("child-result-output");
        outputDiv.classList.remove("hidden");
        outputDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(37, 99, 235, 0.1)); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h4>Result Statement for ${student.first_name} ${student.surname} (${student.student_id})</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${student.programme || 'BSc Computer Science'} - Level ${student.level || 100}</p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">CUMULATIVE GPA</span>
                    <h2 style="color: var(--status-success); margin: 2px 0;">${gpa}</h2>
                    <button class="btn btn-sm btn-success" style="margin-top: 6px;" onclick="parentView.downloadWardPDF('${student.student_id}')">
                        <i class="fa-solid fa-file-pdf"></i> Save as PDF & Download
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Title</th>
                            <th>Assessment (30%)</th>
                            <th>Exam (70%)</th>
                            <th>Total (100%)</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.map(g => `
                            <tr>
                                <td><strong>${g.course_code}</strong></td>
                                <td>${g.course_title || g.course_code}</td>
                                <td>${g.assessment_score} / 30</td>
                                <td>${g.exam_score} / 70</td>
                                <td><strong>${g.total_score || (g.assessment_score + g.exam_score)}%</strong></td>
                                <td><span class="badge ${g.letter_grade === 'F' ? 'badge-danger' : 'badge-success'}">${g.letter_grade || 'A'}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 20px;">No published examination grades found for this student.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    downloadWardPDF(stId) {
        const student = (store.get("students") || []).find(s => s.student_id === stId);
        const grades = (store.get("grades") || []).filter(g => g.student_id === stId);
        const html = pdfHelper.generateResultsTranscript(student, grades);
        pdfHelper.openPrintModal(html);
    },

    renderChildAttendance() {
        const { linkedIds, linkedStudents } = this.getLinkedWards();
        const attendance = store.get("attendance") || [];
        const wardAttendance = attendance.filter(a => linkedIds.includes(a.student_id));

        const wardStatsHtml = linkedStudents.map(w => {
            const wAtt = store.calculateStudentAttendance ? store.calculateStudentAttendance(w.student_id) : { rate: 100, attended: 0, total: 0 };
            return `
                <div class="stat-card">
                    <div class="stat-info">
                        <span>${w.first_name} ${w.surname} (${w.student_id})</span>
                        <h3 style="color: ${wAtt.rate >= 75 ? 'var(--status-success)' : 'var(--status-warning)'};">${wAtt.rate}% Attendance</h3>
                        <small class="text-muted">${wAtt.attended} attended / ${wAtt.total} total sessions</small>
                    </div>
                    <div class="stat-icon ${wAtt.rate >= 75 ? 'success' : 'warning'}"><i class="fa-solid fa-clipboard-user"></i></div>
                </div>
            `;
        }).join('');

        return `
            <div class="card parent-dashboard-container" id="ward-attendance-container">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3><i class="fa-solid fa-clipboard-user" style="color: var(--brand-primary);"></i> Ward Attendance History (Linked Wards)</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Track lecture attendance records and physical presence for your linked children.</p>
                    </div>
                </div>

                ${wardStatsHtml ? `<div class="stats-grid" style="margin-bottom: 20px;">${wardStatsHtml}</div>` : ''}

                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student ID</th>
                                <th>Ward Name</th>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${wardAttendance.map(a => `
                                <tr>
                                    <td>${a.date}</td>
                                    <td><strong>${a.student_id}</strong></td>
                                    <td>${a.student_name || 'Ward'}</td>
                                    <td><strong>${a.course_code}</strong></td>
                                    <td>${a.course_title || a.course_code}</td>
                                    <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 20px;">No attendance logs recorded for your linked ward(s) yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderChildFees() {
        const { linkedIds, linkedStudents } = this.getLinkedWards();
        const students = store.get("students") || [];

        if (linkedIds.length === 0) {
            return `
                <div class="card parent-dashboard-container" id="ward-fees-container">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-wallet" style="color: var(--brand-secondary);"></i> Ward Semester Tuition Fees</h3>
                    </div>
                    <div style="padding: 40px 20px; text-align: center;">
                        <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 16px;"></i>
                        <h4>No Student Ward Currently Linked</h4>
                        <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 16px;">
                            There are no student accounts currently linked to your parent portal. Once the Administrator links your ward, their real tuition, payment history, and balance due will automatically appear here.
                        </p>
                    </div>
                </div>
            `;
        }


        const currentWardId = this._selectedWardFeeId && linkedIds.includes(this._selectedWardFeeId)
            ? this._selectedWardFeeId
            : linkedIds[0];

        const feeDataList = store.get("fees") || [];
        const wardStudent = students.find(s => s.student_id === currentWardId);
        const feeInfo = store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(currentWardId) : null;
        let fees = feeInfo || feeDataList.find(f => f.student_id === currentWardId);

        if (!fees) {
            fees = {
                student_id: currentWardId,
                student_name: wardStudent ? `${wardStudent.first_name} ${wardStudent.surname}` : currentWardId,
                semester: "Semester 1, 2026/2027",
                total_amount: 4800,
                paid_amount: 0,
                balance_due: 4800,
                status: "Pending",
                payment_history: []
            };
        }

        const assignedCategories = (store.getFeeCategoriesForStudent && wardStudent)
            ? store.getFeeCategoriesForStudent(wardStudent)
            : (feeInfo?.assigned_categories || []);

        return `
            <div class="card parent-dashboard-container" id="ward-fees-container">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3><i class="fa-solid fa-wallet" style="color: var(--brand-secondary);"></i> Ward Semester Tuition Fees</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                            Fees assigned specifically to your ward's academic level and session with real-time balance calculations.
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                        ${linkedIds.length > 1 ? `
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label for="parent-ward-fee-select" style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; margin: 0;">Select Ward:</label>
                                <select id="parent-ward-fee-select" class="form-control" style="min-width: 180px; max-width: 260px;" onchange="parentView.switchWardFees(this.value)">
                                    ${linkedIds.map(id => {
            const st = students.find(s => s.student_id === id);
            const name = st ? `${st.first_name} ${st.surname}` : id;
            return `<option value="${id}" ${id === currentWardId ? 'selected' : ''}>${name} (${id})</option>`;
        }).join('')}
                                </select>
                            </div>
                        ` : ''}
                        <button class="btn btn-success" onclick="studentView.openPaymentModal()">
                            <i class="fa-solid fa-credit-card"></i> Pay Ward Fees via Paystack / Banks
                        </button>
                    </div>
                </div>

                <!-- WARD DETAIL PILL -->
                <div style="background: rgba(59, 130, 246, 0.05); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong>Ward:</strong> ${wardStudent ? `${wardStudent.first_name} ${wardStudent.surname}` : currentWardId}
                        <span style="margin: 0 8px; color: var(--border-color);">|</span>
                        <strong>Student ID:</strong> <code>${currentWardId}</code>
                        <span style="margin: 0 8px; color: var(--border-color);">|</span>
                        <strong>Level:</strong> Level ${wardStudent?.level || '300'}
                        <span style="margin: 0 8px; color: var(--border-color);">|</span>
                        <strong>Session:</strong> ${wardStudent?.session || 'Morning'} Session
                        <span style="margin: 0 8px; color: var(--border-color);">|</span>
                        <strong>Programme:</strong> ${wardStudent ? (wardStudent.programme || 'BSc Computer Science') : 'Undergraduate'}
                    </div>
                    <div>
                        <span class="badge ${fees.status === 'Fully Paid' || Number(fees.balance_due) <= 0 ? 'badge-success' : 'badge-warning'}">
                            ${fees.status === 'Fully Paid' || Number(fees.balance_due) <= 0 ? 'Fully Paid' : 'Balance Pending'}
                        </span>
                    </div>
                </div>

                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Semester Fees</span>
                            <h3>GHS ${Number(fees.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div class="stat-icon primary"><i class="fa-solid fa-file-invoice"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Amount Paid</span>
                            <h3 style="color: var(--status-success);">GHS ${Number(fees.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div class="stat-icon success"><i class="fa-solid fa-check"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Outstanding Balance Due</span>
                            <h3 style="color: ${Number(fees.balance_due) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
                                GHS ${Number(fees.balance_due).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div class="stat-icon ${Number(fees.balance_due) > 0 ? 'danger' : 'success'}"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    </div>
                </div>

                
                <div class="card-header" style="margin-top: 10px;">
                    <h4><i class="fa-solid fa-list-check" style="color: var(--brand-primary);"></i> Ward Assigned Fee Breakdown (Level ${wardStudent?.level || '300'}, ${wardStudent?.session || 'Morning'} Session)</h4>
                </div>
                <div class="table-responsive" style="margin-bottom: 24px;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Category Code</th>
                                <th>Fee Category Name</th>
                                <th>Applicable Level</th>
                                <th>Applicable Session</th>
                                <th>Amount (GH₵)</th>
                                <th>Assignment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${assignedCategories.length > 0 ? assignedCategories.map(cat => `
                                <tr>
                                    <td><span class="badge badge-light" style="font-family: monospace; font-weight: 600;">${cat.code || 'FEE'}</span></td>
                                    <td><strong>${cat.name}</strong></td>
                                    <td><span class="badge badge-primary">${cat.level || 'All Levels'}</span></td>
                                    <td><span class="badge badge-secondary">${cat.session || 'All Sessions'}</span></td>
                                    <td><strong style="color: var(--brand-primary);">GHS ${Number(cat.amount).toFixed(2)}</strong></td>
                                    <td><span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Assigned to Ward</span></td>
                                </tr>
                            `).join('') : `<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 16px;">No specific fee categories assigned to this ward's level and session.</td></tr>`}
                        </tbody>
                    </table>
                </div>

                <div class="card-header" style="margin-top: 10px;">
                    <h4><i class="fa-solid fa-receipt"></i> Verified Payment Transactions & Official Receipts</h4>
                </div>

                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction Ref</th>
                                <th>Payment Gateway</th>
                                <th>Amount Paid</th>
                                <th>Official Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(fees.payment_history || []).map(p => `
                                <tr>
                                    <td>${p.date}</td>
                                    <td><strong>${p.reference}</strong></td>
                                    <td>${p.gateway}</td>
                                    <td><strong style="color: var(--status-success);">GHS ${Number(p.amount).toFixed(2)}</strong></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="studentView.downloadReceipt('${p.reference}')">
                                            <i class="fa-solid fa-file-pdf"></i> Download PDF Receipt
                                        </button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-muted" style="text-align: center; padding: 20px;">No payment transaction receipts available for this ward.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    switchWardFees(wardId) {
        this._selectedWardFeeId = wardId;
        const container = document.getElementById("view-content");
        if (container) {
            container.innerHTML = this.renderChildFees();
        }
    },

    renderSettings(parent) {
        const user = store.getCurrentUser() || {};
        const prData = user.parent_data || parent || {};

        return `
            <div class="dashboard-grid parent-dashboard-container">
                <div class="grid-column">
                    <!-- EDIT PARENT PROFILE & AVATAR PHOTO CARD -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-user-pen" style="color: var(--status-success);"></i> Edit Parent Profile & Photo</h3>
                        </div>

                        <!-- PROFILE PHOTO MANAGEMENT -->
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap;">
                            <img id="pr-setting-avatar-preview" src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Profile Photo" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary); box-shadow: var(--shadow-sm);">
                            <div>
                                <strong style="font-size: 0.9rem; display: block; margin-bottom: 4px;">Parent / Guardian Photo</strong>
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

                        <form onsubmit="parentView.handleParentProfileUpdate(event)">
                            <div class="form-group">
                                <label for="pr-set-name">Parent Full Name *</label>
                                <input type="text" id="pr-set-name" class="form-control" value="${user.full_name || prData.full_name || ''}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label for="pr-set-email">Email Address *</label>
                                    <input type="email" id="pr-set-email" class="form-control" value="${user.email || prData.email || ''}" required>
                                </div>
                                <div class="form-group col-6">
                                    <label for="pr-set-phone">Phone Number *</label>
                                    <input type="tel" id="pr-set-phone" class="form-control" value="${user.phone_number || prData.phone_number || ''}" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-floppy-disk"></i> Update Parent Profile</button>
                        </form>
                    </div>

                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-key" style="color: var(--brand-primary);"></i> Update Account Password</h3>
                        </div>
                        <form onsubmit="parentView.handleParentPasswordUpdate(event)">
                            <div class="form-group">
                                <label for="pr-curr-pass">Current Password *</label>
                                <input type="password" id="pr-curr-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="pr-new-pass">New Password * <small class="text-muted">(Min 6, 1 Upper, 1 Num, 1 Symbol)</small></label>
                                <input type="password" id="pr-new-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="pr-rep-pass">Repeat New Password *</label>
                                <input type="password" id="pr-rep-pass" class="form-control" required>
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
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; flex-wrap: wrap; gap: 10px;">
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

    handleParentProfileUpdate(event) {
        event.preventDefault();
        const name = document.getElementById("pr-set-name").value.trim();
        const email = document.getElementById("pr-set-email").value.trim();
        const phone = document.getElementById("pr-set-phone").value.trim();

        const user = store.getCurrentUser();
        if (user) {
            user.full_name = name;
            user.email = email;
            user.phone_number = phone;

            if (user.parent_data) {
                user.parent_data.full_name = name;
                user.parent_data.email = email;
                user.parent_data.phone_number = phone;
            }

            store.setCurrentUser(user);

            const briefName = document.getElementById("brief-name");
            if (briefName) briefName.innerText = name;

            const parents = store.get("parents") || [];
            const pr = parents.find(p => p.email === email || (p.parent_data && p.parent_data.email === email));
            if (pr) {
                pr.full_name = name;
                pr.email = email;
                pr.phone_number = phone;
                store.set("parents", parents);
            }

            const profiles = store.get("profiles") || [];
            const prof = profiles.find(p => p.id === user.id || p.email === email);
            if (prof) {
                prof.full_name = name;
                prof.email = email;
                prof.phone_number = phone;
                store.set("profiles", profiles);
            }

            store.logAudit(`Parent (${name}) updated profile details`, "User Management");
            app.showToast("Parent profile updated successfully!", "success");
        }
    },

    handleParentPasswordUpdate(event) {
        event.preventDefault();
        const curr = document.getElementById("pr-curr-pass").value;
        const newP = document.getElementById("pr-new-pass").value;
        const rep = document.getElementById("pr-rep-pass").value;

        if (newP !== rep) {
            app.showToast("New passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(newP)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }

        const user = store.getCurrentUser();
        const parents = store.get("parents") || [];
        const target = parents.find(p => p.email === user.email);

        if (target && target.password && target.password !== curr) {
            app.showToast("Current password is incorrect!", "danger");
            return;
        }

        if (target) {
            target.password = newP;
            store.set("parents", parents);
        }

        user.password = newP;
        store.setCurrentUser(user);
        app.showToast("Password updated successfully!", "success");
    }
};

if (typeof window !== "undefined") {
    window.parentView = parentView;
}
