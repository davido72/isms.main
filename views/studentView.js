const studentView = {
    renderDashboard(student) {
        const studentId = student.student_id;
        const enrollments = store.get("enrollments").filter(e => e.student_id === studentId);
        const grades = store.get("grades").filter(g => g.student_id === studentId);
        const attendance = store.get("attendance").filter(a => a.student_id === studentId);
        const fees = (store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(studentId) : null) || store.get("fees").find(f => f.student_id === studentId) || { total_amount: 0, paid_amount: 0, balance_due: 0, status: "Pending" };


        let totalPoints = 0;
        grades.forEach(g => totalPoints += Number(g.grade_point || 4.0) * 3);
        const gpa = grades.length > 0 ? (totalPoints / (grades.length * 3)).toFixed(2) : "4.00";


        const studentAtt = store.calculateStudentAttendance ? store.calculateStudentAttendance(studentId) : { rate: 100, attended: 0, total: 0 };
        const attRate = studentAtt.rate;
        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { academic_year: '2026/2027', current_semester: 'Semester 1', full_label: '2026/2027 - Semester 1' };

        return `
            <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08)); border: 1px solid var(--border-color); border-left: 4px solid var(--brand-primary); padding: 14px 20px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: white; font-size: 1rem;"><i class="fa-solid fa-calendar-check"></i></span>
                    <div>
                        <div style="font-size: 0.76rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px;">Current Academic Session</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);" class="active-academic-session-label">${activeSession.full_label}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-success" style="font-size: 0.8rem;"><i class="fa-solid fa-circle-dot"></i> Active Semester</span>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">Academic Year: <strong id="student-dashboard-acad-year">${activeSession.academic_year}</strong></span>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <span>Enrolled Courses</span>
                        <h3>${enrollments.length} Subjects</h3>
                    </div>
                    <div class="stat-icon primary"><i class="fa-solid fa-book-open"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Cumulative GPA</span>
                        <h3>${gpa} / 4.00</h3>
                    </div>
                    <div class="stat-icon success"><i class="fa-solid fa-graduation-cap"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Attendance Rate</span>
                        <h3>${attRate}%</h3>
                    </div>
                    <div class="stat-icon warning"><i class="fa-solid fa-clipboard-user"></i></div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <span>Tuition Fee Status</span>
                        <h3>GHS ${Number(fees.balance_due).toFixed(2)}</h3>
                    </div>
                    <div class="stat-icon purple"><i class="fa-solid fa-wallet"></i></div>
                </div>
            </div>

            
            <div class="dashboard-grid">
                <div class="grid-column">
                    <div class="card" id="student-chart-card">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <h3><i class="fa-solid fa-chart-line" style="color: var(--brand-primary);"></i> Academic Progress Overview</h3>
                            <span id="chart-gpa-badge" class="badge badge-info" style="font-size: 0.8rem; padding: 4px 10px;">Cumulative GPA: ${gpa} / 4.00</span>
                        </div>
                        <div id="chart-container-wrapper" style="position: relative; width: 100%; height: 230px; min-height: 200px;">
                            <canvas id="student-progress-chart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-calendar-check" style="color: var(--status-success);"></i> Recent Attendance Register</h3>
                            <button class="btn btn-sm btn-outline-primary" onclick="app.navigateTo('attendance')">View All</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Course</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendance.slice(0, 5).map(a => `
                                        <tr>
                                            <td>${a.date}</td>
                                            <td>${a.course_code} - ${a.course_title}</td>
                                            <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="3" class="text-muted">No attendance marked yet.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="grid-column">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-bullhorn" style="color: var(--brand-secondary);"></i> Latest Announcements</h3>
                        </div>
                        <div class="announcements-list">
                            ${(store.get("announcements") || []).filter(a => !a.target_audience || a.target_audience === 'ALL' || a.target_audience === 'STUDENTS').slice(0, 3).map(ann => `
                                <div style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                                    <h5 style="margin-bottom: 4px;">${ann.title}</h5>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary);">${ann.content}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted);">${ann.date} • ${ann.author || ann.posted_by || 'Admin'}</small>
                                </div>
                            `).join('') || '<p class="text-muted" style="padding: 10px 0; font-size: 0.85rem;">No active announcements for students.</p>'}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-headset" style="color: var(--status-info);"></i> Need Assistance?</h3>
                        </div>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">Have questions about your fees, GPA, or course registration? Ask our AI Assistant.</p>
                        <button class="btn btn-primary btn-block" onclick="app.navigateTo('ai-assistant')">
                            <i class="fa-solid fa-robot"></i> Open AI Assistant
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    initDashboardChart(student) {

        if (this._progressChart) {
            try {
                this._progressChart.destroy();
            } catch (e) {
                console.warn("[Chart] Warning destroying chart:", e);
            }
            this._progressChart = null;
        }

        const ctx = document.getElementById("student-progress-chart");
        const wrapper = document.getElementById("chart-container-wrapper");
        if (!ctx) return;

        const studentId = student.student_id;
        const enrollments = store.get("enrollments").filter(e => e.student_id === studentId);
        const grades = store.get("grades").filter(g => g.student_id === studentId);


        let chartDataList = [];

        if (grades.length > 0) {
            chartDataList = grades.map(g => {
                const enr = enrollments.find(e => e.course_code === g.course_code);
                const assessmentScore = Number(g.assessment_score !== undefined ? g.assessment_score : Math.round(Number(g.total_score || 0) * 0.3));
                const examScore = Number(g.exam_score !== undefined ? g.exam_score : Math.round(Number(g.total_score || 0) * 0.7));
                return {
                    code: g.course_code,
                    title: g.course_title || (enr ? enr.course_title : g.course_code),
                    assessment: assessmentScore,
                    exam: examScore,
                    total: Number(g.total_score !== undefined ? g.total_score : (assessmentScore + examScore)),
                    letter: g.letter_grade || (g.total_score >= 80 ? 'A' : g.total_score >= 70 ? 'B+' : g.total_score >= 60 ? 'B' : g.total_score >= 50 ? 'C' : 'F'),
                    gp: g.grade_point !== undefined ? g.grade_point : 4.0
                };
            });
        } else if (enrollments.length > 0) {

            chartDataList = enrollments.map(e => ({
                code: e.course_code,
                title: e.course_title,
                assessment: 0,
                exam: 0,
                total: 0,
                letter: 'Pending',
                gp: 0
            }));
        }


        if (chartDataList.length === 0) {
            if (wrapper) {
                wrapper.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 200px; padding: 20px; text-align: center; color: var(--text-secondary);">
                        <i class="fa-solid fa-chart-simple" style="font-size: 2.8rem; opacity: 0.35; margin-bottom: 10px; color: var(--brand-primary);"></i>
                        <h4 style="margin: 0 0 6px 0; color: var(--text-primary); font-size: 1rem;">No Academic Scores Yet</h4>
                        <p style="font-size: 0.84rem; max-width: 360px; margin: 0 0 12px 0;">Courses registered for your current semester will automatically display here once assessment scores are published.</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.navigateTo('course-registration')"><i class="fa-solid fa-pen-to-square"></i> Go to Course Registration</button>
                    </div>
                `;
            }
            return;
        }

        const labels = chartDataList.map(d => d.code);
        const assessmentScores = chartDataList.map(d => d.assessment);
        const examScores = chartDataList.map(d => d.exam);

        if (typeof Chart === "undefined") {
            console.warn("Chart.js library is not loaded or offline.");
            return;
        }

        this._progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Continuous Assessment (30%)',
                        data: assessmentScores,
                        backgroundColor: 'rgba(37, 99, 235, 0.75)',
                        borderColor: '#2563eb',
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 28
                    },
                    {
                        label: 'Final Examination (70%)',
                        data: examScores,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 28
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11, family: "'Inter', sans-serif" }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            afterBody: function (tooltipItems) {
                                const idx = tooltipItems[0].dataIndex;
                                const item = chartDataList[idx];
                                if (!item) return '';
                                return [
                                    `Course: ${item.title}`,
                                    `Total Score: ${item.total}%`,
                                    `Grade: ${item.letter} (${item.gp} GP)`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { font: { size: 11, weight: '600' } }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(156, 163, 175, 0.15)' },
                        ticks: { stepSize: 20, font: { size: 10 } }
                    }
                }
            }
        });
    },

    renderCourseRegistration(student) {
        const studentData = student.student_data || student;
        const cleanStr = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const studentCleanProg = cleanStr(studentData.programme || 'BSc Computer Science');
        const studentLevel = (studentData.level || '300').toString().replace(/\D/g, '');
        const studentSession = (studentData.session || 'Morning').trim().toLowerCase();
        const studentCleanDept = cleanStr(studentData.department || '');

        const courses = store.get("courses") || [];
        const enrollments = store.get("enrollments").filter(e => e.student_id === student.student_id);
        const grades = store.get("grades").filter(g => g.student_id === student.student_id);
        const enrolledCodes = enrollments.map(e => e.course_code);


        const assignedCourses = courses.filter(c => {
            if (enrolledCodes.includes(c.course_code)) return true;

            const cProgRaw = (c.programme || '').trim();
            const cProgClean = cleanStr(cProgRaw);
            const progMatch = !cProgRaw ||
                cProgClean === "allprogrammes" ||
                cProgClean === "all" ||
                cProgClean === studentCleanProg ||
                (studentCleanProg && (cProgClean.includes(studentCleanProg) || studentCleanProg.includes(cProgClean)));

            const cLvl = (c.level || '').toString().replace(/\D/g, '');
            const levelMatch = !c.level || c.level === "All Levels" || c.level === "All" || !studentLevel || cLvl === studentLevel;

            const cSess = (c.session || '').trim().toLowerCase();
            const sessMatch = !c.session || cSess === "all sessions" || cSess === "all" || !studentSession || cSess === studentSession;

            const cDeptClean = cleanStr(c.department);
            const deptMatch = !c.department || cDeptClean === "alldepartments" || cDeptClean === "all" || !studentCleanDept || cDeptClean === studentCleanDept || studentCleanDept.includes(cDeptClean) || cDeptClean.includes(studentCleanDept);

            return progMatch && levelMatch && sessMatch && deptMatch;
        });


        const failedGrades = grades.filter(g => (g.letter_grade === 'F' || (g.total_score !== undefined && g.total_score < 50)));

        let totalCredits = enrollments.reduce((acc, curr) => acc + Number(curr.credit_hours || 3), 0);

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3><i class="fa-solid fa-pen-to-square" style="color: var(--brand-primary);"></i> Student Course Registration</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Select the courses you wish to register for this semester. Registered courses are locked and highlighted.</p>
                    </div>
                    <div>
                        <button class="btn btn-outline-primary" onclick="studentView.downloadCourseSlip()">
                            <i class="fa-solid fa-file-pdf"></i> Save as PDF & Download
                        </button>
                    </div>
                </div>

                <div style="background: rgba(37, 99, 235, 0.08); padding: 14px 20px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong>Student ID:</strong> ${student.student_id} | <strong>Programme:</strong> ${student.programme || 'BSc Computer Science'} (Level ${student.level || '300'} - ${student.session || 'Morning'})
                    </div>
                    <div>
                        <strong>Total Registered Credits:</strong> <span id="calc-total-credits" style="font-size: 1.2rem; color: var(--brand-primary); font-weight: 800;">${totalCredits} Hours</span>
                    </div>
                </div>

                <form id="course-reg-form" onsubmit="studentView.saveCourseRegistration(event)">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Register</th>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Level & Session</th>
                                    <th>Credit Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${assignedCourses.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-secondary);">
                                            <i class="fa-solid fa-circle-info" style="font-size: 1.8rem; color: var(--brand-primary); margin-bottom: 8px; display: block;"></i>
                                            <strong>No courses currently assigned to your specific programme (${student.programme || 'General'}), Level ${student.level || '300'}, and Session (${student.session || 'Morning'}).</strong>
                                            <p style="font-size: 0.82rem; margin: 4px 0 0 0;">New courses added by the Administrator for your cohort will automatically reflect here.</p>
                                        </td>
                                    </tr>
                                ` : assignedCourses.map(c => {
            const isRegistered = enrolledCodes.includes(c.course_code);
            return `
                                        <tr style="${isRegistered ? 'background: rgba(34, 197, 94, 0.06); font-weight: 500;' : ''}">
                                            <td>
                                                <input type="checkbox" class="course-checkbox" data-code="${c.course_code}" data-title="${c.title}" data-credits="${c.credit_hours}" ${isRegistered ? 'checked disabled' : ''} onchange="studentView.recalculateCredits()">
                                            </td>
                                            <td><strong>${c.course_code}</strong></td>
                                            <td>${c.title}</td>
                                            <td>Level ${c.level} (${c.session || 'All Sessions'})</td>
                                            <td>${c.credit_hours} Hours</td>
                                            <td>
                                                ${isRegistered ? '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Registered & Locked</span>' : '<span class="badge badge-secondary">Available</span>'}
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fa-solid fa-floppy-disk"></i> Save & Submit Course Registration
                        </button>
                    </div>
                </form>
            </div>

            
            <div class="card" style="margin-top: 24px;">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3><i class="fa-solid fa-rotate-right" style="color: var(--status-warning);"></i> Re-sit / Re-take Course Registration Portal</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">Courses where a grade of "F" or score below 50% was achieved automatically reflect here for re-sit registration.</p>
                    </div>
                </div>

                ${failedGrades.length === 0 ? `
                    <div style="padding: 20px; text-align: center; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: var(--status-success); margin-bottom: 8px;"></i>
                        <h4 style="color: var(--status-success); margin: 0 0 4px 0;">No Re-sit / Re-take Required!</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">You have passed all registered courses successfully. No failed courses (Grade F) recorded on your transcript.</p>
                    </div>
                ` : `
                    <form onsubmit="studentView.saveResitRegistration(event)">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Select Re-sit</th>
                                        <th>Course Code</th>
                                        <th>Course Title</th>
                                        <th>Previous Grade</th>
                                        <th>Previous Score</th>
                                        <th>Re-sit Fee Status</th>
                                        <th>Status & Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${failedGrades.map(fg => {
            const resitEnr = enrollments.find(e => e.student_id === student.student_id && (e.course_code === fg.course_code || e.course_code.startsWith(fg.course_code)));
            const isResitRegistered = !!resitEnr;
            const resitStatus = resitEnr ? (resitEnr.status || (resitEnr.is_published ? 'Published' : 'Pending')) : 'Not Registered';

            return `
                                            <tr style="${isResitRegistered ? 'background: rgba(34, 197, 94, 0.12); border-left: 4px solid var(--status-success); font-weight: 500;' : 'background: rgba(239, 68, 68, 0.05);'}">
                                                <td>
                                                    <input type="checkbox" class="resit-checkbox" data-code="${fg.course_code}" data-title="${fg.course_title}" ${isResitRegistered ? 'checked disabled' : ''}>
                                                </td>
                                                <td><strong style="color: ${isResitRegistered ? 'var(--status-success)' : 'var(--status-danger)'};">${fg.course_code}</strong></td>
                                                <td>${fg.course_title} ${isResitRegistered ? '<span class="badge badge-success" style="margin-left: 6px;"><i class="fa-solid fa-check"></i> Registered</span>' : ''}</td>
                                                <td><span class="badge badge-danger">Grade ${fg.letter_grade || 'F'}</span></td>
                                                <td><strong>${fg.total_score || 0}%</strong></td>
                                                <td><span class="badge badge-info">GH₵ 150.00 / Paper</span></td>
                                                <td>
                                                    ${isResitRegistered ? `
                                                        <span class="badge ${resitStatus === 'Published' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.88rem; padding: 6px 12px;">
                                                            ${resitStatus === 'Published' ? '<i class="fa-solid fa-check"></i> Published' : '<i class="fa-regular fa-clock"></i> Pending Results'}
                                                        </span>
                                                    ` : `
                                                        <button type="button" class="btn btn-xs btn-warning" onclick="app.showToast('Re-sit course ${fg.course_code} selected for registration.', 'info')">
                                                            <i class="fa-solid fa-plus"></i> Select Re-sit
                                                        </button>
                                                    `}
                                                </td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                            <button type="submit" class="btn btn-warning btn-lg">
                                <i class="fa-solid fa-rotate-right"></i> Register Selected Re-sit Courses
                            </button>
                        </div>
                    </form>
                `}
            </div>
        `;
    },

    recalculateCredits() {
        const checkboxes = document.querySelectorAll(".course-checkbox:checked");
        let total = 0;
        checkboxes.forEach(cb => total += Number(cb.getAttribute("data-credits") || 3));
        document.getElementById("calc-total-credits").innerText = `${total} Hours`;
    },

    saveCourseRegistration(event) {
        event.preventDefault();
        const student = store.getCurrentUser().student_data;
        const checkboxes = document.querySelectorAll(".course-checkbox:checked");

        const newEnrollments = Array.from(checkboxes).map(cb => ({
            id: "e-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            student_id: student.student_id,
            course_code: cb.getAttribute("data-code"),
            course_title: cb.getAttribute("data-title"),
            credit_hours: Number(cb.getAttribute("data-credits")),
            semester: "Semester 1",
            status: "Pending",
            date: new Date().toISOString().split("T")[0]
        }));

        let allEnrollments = store.get("enrollments").filter(e => e.student_id !== student.student_id);
        allEnrollments = [...allEnrollments, ...newEnrollments];

        store.set("enrollments", allEnrollments);
        app.showToast(`Course registration saved successfully! Registered ${newEnrollments.length} courses. Registered courses are now locked and reflected in Results & GPA as 'X'.`, "success");
        app.navigateTo("course-registration");
    },

    saveResitRegistration(event) {
        event.preventDefault();
        const student = store.getCurrentUser().student_data;
        const checkboxes = document.querySelectorAll(".resit-checkbox:checked:not(:disabled)");
        if (checkboxes.length === 0) {
            app.showToast("Please select at least one failed course to register for re-sit.", "warning");
            return;
        }

        const resitEnrollments = Array.from(checkboxes).map(cb => ({
            id: "e-resit-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            student_id: student.student_id,
            course_code: cb.getAttribute("data-code"),
            course_title: cb.getAttribute("data-title") + " (RE-SIT)",
            credit_hours: 3,
            semester: "Semester 1 Re-sit",
            is_resit: true,
            status: "Pending",
            is_published: false,
            date: new Date().toISOString().split("T")[0]
        }));

        const enrollments = store.get("enrollments") || [];
        store.set("enrollments", [...enrollments, ...resitEnrollments]);
        app.showToast(`Re-sit registration complete: ${resitEnrollments.length} course(s) added. Status set to PENDING.`, "success");
        alert(`RE-SIT COURSE REGISTRATION CONFIRMED!\n\nRegistered ${resitEnrollments.length} re-sit course(s).\nStatus: PENDING (Awaiting Grade Entry & Publishing by Lecturer).\nRegistered courses have been locked and highlighted in your portal.`);
        app.navigateTo("course-registration");
    },

    downloadCourseSlip() {
        const student = store.getCurrentUser().student_data;
        const enrollments = store.get("enrollments").filter(e => e.student_id === student.student_id);
        if (!enrollments.length) {
            app.showToast("Please register and save your courses before downloading the slip.", "warning");
            return;
        }
        const slipHtml = pdfHelper.generateCourseRegistrationSlip(student, enrollments);
        pdfHelper.openPrintModal(slipHtml, "Course Registration Slip PDF");
    },

    printResitRegistrationSlip() {
        const user = store.getCurrentUser() || {};
        const student = user.student_data || (store.get("students") || [])[0];
        if (!student) return;

        const enrollments = store.get("enrollments").filter(e => e.student_id === student.student_id && e.is_resit);
        if (!enrollments.length) {
            app.showToast("No active re-sit course registrations found to print. Please select and register a re-sit course first.", "warning");
            return;
        }
        const slipHtml = pdfHelper.generateResitRegistrationSlip(student, enrollments);
        pdfHelper.openPrintModal(slipHtml, "Re-sit Course Registration Slip PDF");
    },

    renderResults(student) {
        const enrollments = store.get("enrollments").filter(e => e.student_id === student.student_id);
        const grades = store.get("grades").filter(g => g.student_id === student.student_id);

        const publishedGrades = grades.filter(g => g.is_published);
        let totalPoints = 0;
        let totalCredits = 0;
        publishedGrades.forEach(g => {
            totalPoints += Number(g.grade_point || 4.0) * 3;
            totalCredits += 3;
        });
        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "4.00";

        return `
            <div class="card">
                <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3><i class="fa-solid fa-award" style="color: var(--status-success);"></i> Academic Results & Cumulative GPA Statement</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">View current and previous semester or level results oversight. Registered courses display "X" until published.</p>
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="studentView.downloadResultsTranscript()">
                            <i class="fa-solid fa-file-pdf"></i> <span class="btn-label-text">Download Official Statement of Results (PDF)</span><span class="btn-label-short" style="display:none">Download PDF</span>
                        </button>
                    </div>
                </div>

                <div class="results-summary-banner">
                    <div class="results-student-info">
                        <h4 style="font-size: 1.1rem; color: var(--text-primary);">${student.first_name} ${student.surname} (${student.student_id})</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${student.programme} - Current Level ${student.level}</p>
                    </div>
                    <div class="results-gpa-display">
                        <span id="res-gpa-label" class="results-gpa-label">CUMULATIVE GPA</span>
                        <h2 id="res-gpa-display" class="results-gpa-value">${gpa} / 4.00</h2>
                    </div>
                </div>

                
                <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
                        <div style="flex: 1; min-width: 180px;">
                            <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-layer-group"></i> Academic Level / Year Oversight</label>
                            <select id="res-level-filter" class="form-control" onchange="studentView.filterResultsView()">
                                <option value="ALL" selected>All Academic Levels</option>
                                <option value="100">Level 100 (Year 1)</option>
                                <option value="200">Level 200 (Year 2)</option>
                                <option value="300">Level 300 (Year 3)</option>
                                <option value="400">Level 400 (Year 4)</option>
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 180px;">
                            <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-calendar-week"></i> Semester Scope</label>
                            <select id="res-sem-filter" class="form-control" onchange="studentView.filterResultsView()">
                                <option value="ALL" selected>All Semesters</option>
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Assessment (30%)</th>
                                <th>Final Exam (70%)</th>
                                <th>Total Score</th>
                                <th>Letter Grade</th>
                                <th>Grade Point</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="st-results-tbody">
                            ${(() => {
                return enrollments.map(enr => {
                    const foundGrade = grades.find(g => g.course_code === enr.course_code && g.is_published);
                    if (foundGrade) {
                        return `
                                            <tr>
                                                <td><strong>${enr.course_code}</strong></td>
                                                <td>${enr.course_title}</td>
                                                <td>${foundGrade.assessment_score} / 30</td>
                                                <td>${foundGrade.exam_score} / 70</td>
                                                <td><strong>${foundGrade.total_score}%</strong></td>
                                                <td><span class="badge badge-success">${foundGrade.letter_grade || 'A'}</span></td>
                                                <td>${foundGrade.grade_point || '4.0'}</td>
                                                <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> Published</span></td>
                                            </tr>
                                        `;
                    } else {
                        return `
                                            <tr>
                                                <td><strong>${enr.course_code}</strong></td>
                                                <td>${enr.course_title}</td>
                                                <td>X</td>
                                                <td>X</td>
                                                <td><strong>X</strong></td>
                                                <td><span class="badge badge-warning">X</span></td>
                                                <td>X</td>
                                                <td><span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Pending Results (X)</span></td>
                                            </tr>
                                        `;
                    }
                }).join('') || '<tr><td colspan="8" class="text-muted text-center">No registered course results found.</td></tr>';
            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterResultsView() {
        const student = store.getCurrentUser()?.student_data || (store.get("students") || [])[0];
        const levelVal = document.getElementById("res-level-filter")?.value || "ALL";
        const semVal = document.getElementById("res-sem-filter")?.value || "ALL";

        const tbody = document.getElementById("st-results-tbody");
        if (!tbody || !student) return;

        const allCourses = store.get("courses") || [];
        let enrollments = store.get("enrollments").filter(e => e.student_id === student.student_id);
        let grades = store.get("grades").filter(g => g.student_id === student.student_id);

        const getCourseLevel = (enr) => {
            if (enr.level) return enr.level.toString().replace(/\D/g, '');
            const foundCourse = allCourses.find(c => c.course_code === enr.course_code);
            if (foundCourse && foundCourse.level) {
                return foundCourse.level.toString().replace(/\D/g, '');
            }
            const match = (enr.course_code || '').match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (num >= 400) return '400';
                if (num >= 300) return '300';
                if (num >= 200) return '200';
                if (num >= 100) return '100';
            }
            return '300';
        };

        if (levelVal !== "ALL") {
            enrollments = enrollments.filter(e => getCourseLevel(e) === levelVal);
        }

        if (semVal !== "ALL") {
            enrollments = enrollments.filter(e => !e.semester || e.semester.toLowerCase().includes(semVal.toLowerCase()));
        }


        let filteredPoints = 0;
        let filteredCredits = 0;
        enrollments.forEach(enr => {
            const foundGrade = grades.find(g => g.course_code === enr.course_code && g.is_published);
            if (foundGrade) {
                const credits = Number(enr.credit_hours || 3);
                filteredPoints += Number(foundGrade.grade_point !== undefined ? foundGrade.grade_point : 4.0) * credits;
                filteredCredits += credits;
            }
        });
        const currentGpa = filteredCredits > 0 ? (filteredPoints / filteredCredits).toFixed(2) : "0.00";
        const gpaDisplay = document.getElementById("res-gpa-display");
        const gpaLabel = document.getElementById("res-gpa-label");
        if (gpaDisplay) {
            gpaDisplay.innerText = `${currentGpa} / 4.00`;
        }
        if (gpaLabel) {
            if (levelVal !== "ALL" || semVal !== "ALL") {
                const parts = [];
                if (levelVal !== "ALL") parts.push(`Level ${levelVal}`);
                if (semVal !== "ALL") parts.push(semVal);
                gpaLabel.innerText = `GPA (${parts.join(' - ')})`;
            } else {
                gpaLabel.innerText = "CUMULATIVE GPA";
            }
        }

        if (enrollments.length === 0) {
            const desc = `${levelVal !== 'ALL' ? 'Level ' + levelVal : 'All Levels'} - ${semVal !== 'ALL' ? semVal : 'All Semesters'}`;
            tbody.innerHTML = `<tr><td colspan="8" class="text-muted text-center" style="padding: 24px;">No results recorded for ${desc}.</td></tr>`;
            return;
        }

        tbody.innerHTML = enrollments.map(enr => {
            const foundGrade = grades.find(g => g.course_code === enr.course_code && g.is_published);
            if (foundGrade) {
                return `
                    <tr>
                        <td><strong>${enr.course_code}</strong></td>
                        <td>${enr.course_title}</td>
                        <td>${foundGrade.assessment_score} / 30</td>
                        <td>${foundGrade.exam_score} / 70</td>
                        <td><strong>${foundGrade.total_score}%</strong></td>
                        <td><span class="badge badge-success">${foundGrade.letter_grade || 'A'}</span></td>
                        <td>${foundGrade.grade_point || '4.0'}</td>
                        <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> Published</span></td>
                    </tr>
                `;
            } else {
                return `
                    <tr>
                        <td><strong>${enr.course_code}</strong></td>
                        <td>${enr.course_title}</td>
                        <td>X</td>
                        <td>X</td>
                        <td><strong>X</strong></td>
                        <td><span class="badge badge-warning">X</span></td>
                        <td>X</td>
                        <td><span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Pending Results (X)</span></td>
                    </tr>
                `;
            }
        }).join('');
    },

    downloadResultsTranscript() {
        const student = store.getCurrentUser().student_data;
        const grades = store.get("grades").filter(g => g.student_id === student.student_id);
        const transcriptHtml = pdfHelper.generateResultsTranscript(student, grades);
        pdfHelper.openPrintModal(transcriptHtml);
    },

    renderAttendance(student) {
        const attendance = (store.get("attendance") || []).filter(a => a.student_id === student.student_id);
        const enrollments = (store.get("enrollments") || []).filter(e => e.student_id === student.student_id);
        const currentSemester = "Semester 1";
        const semesterEnrollments = enrollments.filter(e => !e.semester || e.semester.toLowerCase().includes(currentSemester.toLowerCase()));
        const overallAtt = store.calculateStudentAttendance ? store.calculateStudentAttendance(student.student_id) : { rate: 100, attended: 0, total: 0 };
        const courseBreakdownHtml = semesterEnrollments.map(e => {
            const cAtt = store.calculateStudentAttendance ? store.calculateStudentAttendance(student.student_id, e.course_code) : { rate: 100, attended: 0, total: 0 };
            const isEligible = cAtt.rate >= 75;
            return `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${e.course_code} - ${e.course_title || e.course_code}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                            <span>${cAtt.attended} attended / ${cAtt.total} sessions held</span> &bull; 
                            <span style="color: ${isEligible ? 'var(--status-success)' : 'var(--status-danger)'}; font-weight: 600;">
                                ${isEligible ? '<i class="fa-solid fa-check"></i> Eligible for Exams' : '<i class="fa-solid fa-triangle-exclamation"></i> Low Attendance Warning (&lt;75%)'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span class="badge ${isEligible ? 'badge-success' : 'badge-warning'}" style="font-size: 0.9rem; padding: 6px 12px;">
                            ${cAtt.rate}% Attendance
                        </span>
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-muted" style="font-size: 0.88rem;">No registered courses found for attendance tracking.</p>';

        return `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fa-solid fa-clipboard-user" style="color: var(--brand-primary);"></i> Attendance Register Portal</h3>
                </div>

                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Your Overall Attendance %</span>
                            <h3 style="color: ${(overallAtt.rate >= 75) ? 'var(--status-success)' : 'var(--status-warning)'};">${overallAtt.rate}% Present</h3>
                            <small class="text-muted">${overallAtt.attended} attended / ${overallAtt.total} total sessions</small>
                        </div>
                        <div class="stat-icon ${(overallAtt.rate >= 75) ? 'success' : 'warning'}"><i class="fa-solid fa-clipboard-user"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Examination Eligibility</span>
                            <h3 style="color: ${(overallAtt.rate >= 75) ? 'var(--status-success)' : 'var(--status-danger)'};">${overallAtt.rate >= 75 ? 'ELIGIBLE' : 'AT RISK'}</h3>
                            <small class="text-muted">${overallAtt.rate >= 75 ? 'Minimum 75% threshold achieved' : 'Attendance below 75% threshold'}</small>
                        </div>
                        <div class="stat-icon ${(overallAtt.rate >= 75) ? 'success' : 'danger'}"><i class="fa-solid ${(overallAtt.rate >= 75) ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i></div>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-primary);"><i class="fa-solid fa-chart-pie" style="color: var(--brand-primary);"></i> Registered Courses Real-Time Attendance Breakdown</h4>
                    <div style="display: grid; gap: 10px;">
                        ${courseBreakdownHtml}
                    </div>
                </div>

                
                <div class="form-group" style="max-width: 320px; margin-bottom: 24px;">
                    <label for="att-mode-select">Select Attendance Action</label>
                    <select id="att-mode-select" class="form-control" onchange="studentView.toggleAttendanceView(this.value)">
                        <option value="mark">Mark Attendance</option>
                        <option value="history">Check Attendance History</option>
                    </select>
                </div>

                
                <div id="mark-attendance-section">
                    <form id="student-mark-att-form" onsubmit="studentView.handleMarkAttendance(event)">
                        <div class="form-row">
                            <div class="form-group col-6">
                                <label>Full Name</label>
                                <input type="text" class="form-control" value="${student.first_name} ${student.surname}" readonly>
                            </div>
                            <div class="form-group col-6">
                                <label>Student ID</label>
                                <input type="text" class="form-control" value="${student.student_id}" readonly>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group col-6">
                                <label for="att-semester-select">Academic Semester</label>
                                <select id="att-semester-select" class="form-control" onchange="studentView.onAttendanceSemesterChange(this.value)">
                                    <option value="Semester 1" selected>Semester 1</option>
                                    <option value="Semester 2">Semester 2</option>
                                </select>
                            </div>
                            <div class="form-group col-6">
                                <label for="att-course-select">Select Course Class (Registered Courses Only) *</label>
                                <select id="att-course-select" class="form-control" required>
                                    ${semesterEnrollments.length > 0
                ? `<option value="">-- Choose Course to Mark Attendance (${semesterEnrollments.length} Registered) --</option>` +
                semesterEnrollments.map(e => `<option value="${e.course_code}|${e.course_title || e.course_code}">${e.course_code} - ${e.course_title || e.course_code}</option>`).join('')
                : `<option value="" disabled selected>No registered courses found for Semester 1. Please complete course registration first.</option>`
            }
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fa-solid fa-location-dot"></i> Submit Geo-Fenced Attendance Entry
                        </button>
                    </form>
                </div>

                
                <div id="check-attendance-section" class="hidden">
                    <form onsubmit="studentView.filterAttendanceHistory(event)" style="margin-bottom: 20px;">
                        <div class="form-row">
                            <div class="form-group col-6">
                                <label>Student Full Name</label>
                                <input type="text" id="att-search-name" class="form-control" value="${student.first_name} ${student.surname}">
                            </div>
                            <div class="form-group col-6">
                                <label>Student ID</label>
                                <input type="text" id="att-search-id" class="form-control" value="${student.student_id}">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-outline-primary"><i class="fa-solid fa-magnifying-glass"></i> Search History</button>
                    </form>

                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="att-history-tbody">
                                ${attendance.map(a => `
                                    <tr>
                                        <td>${a.date}</td>
                                        <td><strong>${a.course_code}</strong></td>
                                        <td>${a.course_title}</td>
                                        <td><span class="badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}">${a.status}</span></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-muted">No attendance logs recorded.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    toggleAttendanceView(mode) {
        document.getElementById("mark-attendance-section").classList.toggle("hidden", mode !== "mark");
        document.getElementById("check-attendance-section").classList.toggle("hidden", mode !== "history");
    },

    onAttendanceSemesterChange(semesterVal) {
        const user = store.getCurrentUser() || {};
        const student = user.student_data || (store.get("students") || [])[0];
        const enrollments = (store.get("enrollments") || []).filter(e => e.student_id === student.student_id);
        const filtered = enrollments.filter(e => !e.semester || e.semester.toLowerCase().includes(semesterVal.toLowerCase()));
        const selectEl = document.getElementById("att-course-select");
        if (!selectEl) return;

        if (filtered.length === 0) {
            selectEl.innerHTML = `<option value="" disabled selected>No registered courses found for ${semesterVal}. Please complete course registration first.</option>`;
        } else {
            selectEl.innerHTML = `<option value="">-- Choose Course to Mark Attendance (${filtered.length} Registered) --</option>` +
                filtered.map(e => `<option value="${e.course_code}|${e.course_title || e.course_code}">${e.course_code} - ${e.course_title || e.course_code}</option>`).join('');
        }
    },

    handleMarkAttendance(event) {
        event.preventDefault();
        const user = store.getCurrentUser() || {};
        const student = user.student_data || (store.get("students") || [])[0];
        const val = document.getElementById("att-course-select")?.value;
        if (!val) {
            app.showToast("Please select a course module to mark attendance.", "warning");
            return;
        }

        const [code, title] = val.split('|');
        const today = new Date().toISOString().split('T')[0];


        const sysSettings = store.get("system_settings") || {};
        const geofence = sysSettings.geofence || { enabled: true, latitude: 5.5560, longitude: -0.1969, radius: 500, campus_name: "GCTU Main Campus (Tesano)" };

        const recordAttendance = (lat = null, lng = null, dist = 0) => {
            const attendance = store.get("attendance") || [];
            const newRecord = {
                id: "att-" + Date.now(),
                student_id: student.student_id,
                student_name: `${student.first_name} ${student.surname}`,
                course_code: code,
                course_title: title,
                date: today,
                status: "Present",
                verified_lat: lat,
                verified_lng: lng,
                verified_distance_m: dist
            };

            attendance.unshift(newRecord);
            store.set("attendance", attendance);
            app.showToast(`Attendance confirmed for ${code} on ${today}. Location verified.`, "success");
            alert(`GEOGRAPHICAL ZONE CONFIRMED!\n\nDevice Location: ${lat ? lat.toFixed(4) : '5.5560'}°N, ${lng ? lng.toFixed(4) : '-0.1969'}°E\nZone Status: Inside ${geofence.campus_name || 'Campus Zone'} (${dist}m from center)\n\nAttendance successfully marked for ${code}!`);
        };

        if (geofence && geofence.enabled !== false) {
            app.showToast(`Accessing device location and verifying geographical zone for ${geofence.campus_name || 'Campus Zone'}...`, "info");
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLat = position.coords.latitude;
                        const userLng = position.coords.longitude;
                        const check = validators.isWithinGeoFence(userLat, userLng, geofence.latitude, geofence.longitude, geofence.radius);

                        if (check.within) {
                            recordAttendance(userLat, userLng, check.distance);
                        } else {
                            app.showToast(`GEO-FENCING DENIED: You are outside the authorized campus zone for ${geofence.campus_name || 'Campus'}. Distance: ${check.distance}m away (Max allowed: ${check.radius}m).`, "danger");
                            alert(`GEO-FENCING ACCESS DENIED!\n\nDevice Location: ${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E\nCampus Center: ${geofence.latitude}°N, ${geofence.longitude}°E\nDistance: ${check.distance} meters (Max allowed: ${check.radius}m)\n\nYou must be physically present inside the designated campus geographical zone to mark attendance.`);
                        }
                    },
                    (error) => {
                        console.warn("Device location access denied / error:", error);
                        let errMsg = "LOCATION ACCESS DENIED!\n\nYou must turn ON location on your device and allow the system access to your device location before you can be granted access to mark attendance.";
                        if (error.code === 1) {
                            errMsg = "LOCATION ACCESS DENIED!\n\nYou denied location permission on your device. Attendance entry is blocked. Please enable device location and grant permission in browser settings.";
                        } else if (error.code === 2) {
                            errMsg = "LOCATION POSITION UNAVAILABLE!\n\nCould not capture your GPS device location. Please make sure location/GPS is turned ON on your device and try again.";
                        } else if (error.code === 3) {
                            errMsg = "LOCATION REQUEST TIMEOUT!\n\nDevice location request timed out. Please turn ON your device location button and try again.";
                        }

                        app.showToast("LOCATION ACCESS DENIED: Attendance marking blocked.", "danger");
                        alert(errMsg);

                    },
                    { enableHighAccuracy: true, timeout: 8000 }
                );
            } else {
                app.showToast("LOCATION SERVICES NOT SUPPORTED: Device location required to mark attendance.", "danger");
                alert("LOCATION SERVICES NOT SUPPORTED!\n\nYour browser or device does not support Geolocation Services. Access to mark attendance is denied.");
            }
        } else {
            recordAttendance();
        }
    },

    renderFees(student) {
        const studentRecord = student || store.getCurrentUser()?.student_data || (store.get("students") || [])[0];
        const studentId = studentRecord?.student_id;
        const feeInfo = store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(studentId) : null;
        const feeData = feeInfo || (store.get("fees") || []).find(f => f.student_id === studentId) || {
            total_amount: 0.00,
            paid_amount: 0.00,
            balance_due: 0.00,
            status: "Pending",
            payment_history: []
        };
        const assignedCategories = (store.getFeeCategoriesForStudent && studentRecord)
            ? store.getFeeCategoriesForStudent(studentRecord)
            : (feeInfo?.assigned_categories || []);

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3><i class="fa-solid fa-wallet" style="color: var(--brand-secondary);"></i> Student Semester Fees & Wallet</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Fee structures assigned specifically to your academic level and session with real-time balance calculations.</p>
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="studentView.openPaymentModal()">
                            <i class="fa-solid fa-credit-card"></i> Pay Fees Direct from Wallet
                        </button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px 16px; background: rgba(37, 99, 235, 0.08); border-left: 4px solid var(--brand-primary); border-radius: 6px; margin-bottom: 20px;">
                    <div>
                        <i class="fa-solid fa-graduation-cap" style="color: var(--brand-primary); margin-right: 8px;"></i>
                        <strong>Academic Level:</strong> Level ${studentRecord?.level || '300'} &nbsp;|&nbsp; 
                        <strong>Session:</strong> ${studentRecord?.session || 'Morning'} Session &nbsp;|&nbsp;
                        <strong>Programme:</strong> ${studentRecord?.programme || 'BSc Computer Science'}
                    </div>
                    <span class="badge badge-info" style="font-size: 0.8rem;"><i class="fa-solid fa-shield-halved"></i> Live Scoped to Your Level & Session</span>
                </div>

                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Total Semester Fee</span>
                            <h3>GHS ${Number(feeData.total_amount).toFixed(2)}</h3>
                        </div>
                        <div class="stat-icon primary"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Amount Paid</span>
                            <h3 style="color: var(--status-success);">GHS ${Number(feeData.paid_amount).toFixed(2)}</h3>
                        </div>
                        <div class="stat-icon success"><i class="fa-solid fa-circle-check"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Balance Due</span>
                            <h3 style="color: ${Number(feeData.balance_due) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">GHS ${Number(feeData.balance_due).toFixed(2)}</h3>
                        </div>
                        <div class="stat-icon ${Number(feeData.balance_due) > 0 ? 'danger' : 'success'}"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span>Payment Status</span>
                            <h3><span class="badge ${feeData.status === 'Fully Paid' || Number(feeData.balance_due) <= 0 ? 'badge-success' : (Number(feeData.paid_amount) > 0 ? 'badge-info' : 'badge-warning')}" style="font-size: 1.1rem;">${Number(feeData.balance_due) <= 0 ? 'Fully Paid' : feeData.status}</span></h3>
                        </div>
                        <div class="stat-icon purple"><i class="fa-solid fa-receipt"></i></div>
                    </div>
                </div>

                <div class="card-header" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <div>
                        <h4><i class="fa-solid fa-list-check" style="color: var(--brand-primary);"></i> Assigned Fee Categories Breakdown</h4>
                        <p style="font-size: 0.82rem; color: var(--text-secondary);">Individual fee components assigned to Level ${studentRecord?.level || '300'} (${studentRecord?.session || 'Morning'} Session) only.</p>
                    </div>
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
                                    <td><span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Assigned to Level ${studentRecord?.level || '300'}</span></td>
                                </tr>
                            `).join('') : `<tr><td colspan="6" class="text-muted" style="text-align: center; padding: 16px;">No specific fee categories assigned to Level ${studentRecord?.level || '300'} (${studentRecord?.session || 'Morning'} Session) at this time.</td></tr>`}
                        </tbody>
                    </table>
                </div>

                <div class="card-header">
                    <h4>Payment Transaction History</h4>
                </div>

                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction Ref</th>
                                <th>Payment Gateway / Wallet</th>
                                <th>Amount Paid</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(feeData.payment_history || []).map(p => `
                                <tr>
                                    <td>${p.date}</td>
                                    <td><strong>${p.reference}</strong></td>
                                    <td>${p.gateway}</td>
                                    <td><strong style="color: var(--status-success);">GHS ${Number(p.amount).toFixed(2)}</strong></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="studentView.downloadReceipt('${p.reference}')">
                                            <i class="fa-solid fa-download"></i> PDF Receipt
                                        </button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-muted">No transaction history found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openPaymentModal() {
        const user = store.getCurrentUser();
        const student = user.student_data || (store.get("students") || [])[0];
        if (!student) { app.showToast("Student data not found.", "danger"); return; }

        const feeInfo = store.calculateStudentFeeBalance ? store.calculateStudentFeeBalance(student.student_id) : null;
        const feeData = feeInfo || (store.get("fees") || []).find(f => f.student_id === student.student_id) || { balance_due: 2500 };

        document.getElementById("modal-fee-balance").innerText = `GHS ${Number(feeData.balance_due).toFixed(2)}`;
        document.getElementById("payment-amount").value = feeData.balance_due;
        document.getElementById("payment-modal").classList.remove("hidden");
        this.togglePaymentAccountField();
    },

    togglePaymentAccountField() {
        const gateway = document.getElementById("payment-gateway")?.value;
        const accountGroup = document.getElementById("payment-account-group");
        const paystackInfo = document.getElementById("paystack-info-box");
        if (!accountGroup) return;

        if (gateway === "Paystack") {
            accountGroup.style.display = "none";
            if (paystackInfo) paystackInfo.style.display = "block";
        } else {
            accountGroup.style.display = "block";
            if (paystackInfo) paystackInfo.style.display = "none";
        }
    },

    processFeePayment(event) {
        event.preventDefault();
        const user = store.getCurrentUser();
        const student = user.student_data || (store.get("students") || [])[0];
        if (!student) { app.showToast("Student data not found.", "danger"); return; }

        const amount = parseFloat(document.getElementById("payment-amount").value);
        const gateway = document.getElementById("payment-gateway").value;

        if (!amount || amount <= 0) {
            app.showToast("Please enter a valid payment amount.", "danger");
            return;
        }

        if (gateway === "Paystack") {

            const handler = PaystackPop.setup({
                key: CONFIG.PAYSTACK_PUBLIC_KEY,
                email: student.email || user.email,
                amount: Math.round(amount * 100),
                currency: "GHS",
                ref: `ISMS-PAY-${student.student_id}-${Date.now()}`,
                metadata: {
                    custom_fields: [
                        { display_name: "Student ID", variable_name: "student_id", value: student.student_id },
                        { display_name: "Student Name", variable_name: "student_name", value: student.full_name || `${student.first_name} ${student.surname}` },
                        { display_name: "Programme", variable_name: "programme", value: student.programme }
                    ]
                },
                callback: (response) => {

                    this.recordSuccessfulPayment(student, amount, "Paystack (Card/MoMo)", response.reference);
                },
                onClose: () => {
                    app.showToast("Payment window closed. You can try again when ready.", "info");
                }
            });
            handler.openIframe();
        } else {

            const accountNum = document.getElementById("payment-account-num")?.value?.trim();
            if (!accountNum) {
                app.showToast("Please enter your account or phone number.", "danger");
                return;
            }
            const fakeRef = `ISMS-${gateway.replace(/\s/g, "").toUpperCase()}-${Date.now()}`;
            this.recordSuccessfulPayment(student, amount, gateway, fakeRef);
        }
    },

    recordSuccessfulPayment(student, amount, gateway, reference) {
        const fees = store.get("fees") || [];
        const feeIndex = fees.findIndex(f => f.student_id === student.student_id);

        const txDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const paymentEntry = {
            date: txDate,
            reference: reference,
            gateway: gateway,
            amount: amount
        };

        if (feeIndex !== -1) {
            fees[feeIndex].paid_amount = (fees[feeIndex].paid_amount || 0) + amount;
            fees[feeIndex].balance_due = Math.max(0, (fees[feeIndex].balance_due || 0) - amount);
            fees[feeIndex].status = fees[feeIndex].balance_due <= 0 ? "Paid" : "Partial";
            fees[feeIndex].payment_history = fees[feeIndex].payment_history || [];
            fees[feeIndex].payment_history.unshift(paymentEntry);
        } else {
            fees.push({
                student_id: student.student_id,
                student_name: student.full_name || `${student.first_name} ${student.surname}`,
                semester: "2026/2027 - Semester 1",
                total_amount: 4800.00,
                paid_amount: amount,
                balance_due: Math.max(0, 4800.00 - amount),
                status: amount >= 4800 ? "Paid" : "Partial",
                payment_history: [paymentEntry]
            });
        }
        store.set("fees", fees);


        const txns = store.get("payment_transactions") || [];
        txns.unshift({
            id: "tx-" + Date.now(),
            reference: reference,
            student_id: student.student_id,
            student_name: student.full_name || `${student.first_name} ${student.surname}`,
            amount: amount,
            channel: gateway,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            status: "Successful"
        });
        store.set("payment_transactions", txns);

        store.logAudit(`Fee Payment: ${student.student_id} paid GHS ${amount.toFixed(2)} via ${gateway} | Ref: ${reference}`, "Finance");

        app.closeModal("payment-modal");
        app.showToast(`Payment of GHS ${amount.toFixed(2)} via ${gateway} recorded successfully. Ref: ${reference}`, "success");
        app.navigateTo("fees");
    },

    downloadReceipt(ref) {
        const user = store.getCurrentUser();
        const student = user.student_data || (store.get("students") || [])[0];
        if (!student) return;

        const feeData = (store.get("fees") || []).find(f => f.student_id === student.student_id);
        const pItem = feeData ? (feeData.payment_history || []).find(p => p.reference === ref) : null;

        const pEntry = pItem || {
            date: new Date().toLocaleDateString(),
            amount: 2300,
            gateway: "Paystack",
            reference: ref
        };

        const html = pdfHelper.generateFeeReceipt(student, feeData || { total_amount: 4800, paid_amount: pEntry.amount, balance_due: 4800 - pEntry.amount, status: "Partial" }, pEntry);
        pdfHelper.openPrintModal(html);
    },

    renderNotifications(student) {
        const deletedAlertIds = store.get(`deleted_alerts_${student.student_id}`) || [];
        const allNotifs = store.get("notifications") || [];
        const notifications = allNotifs.filter(n => !deletedAlertIds.includes(n.id) && (n.user_id === student.student_id || n.target_audience === 'student' || n.target_audience === 'ALL'));
        const announcements = (store.get("announcements") || []).filter(a => !deletedAlertIds.includes(a.id) && (!a.target_audience || a.target_audience === 'ALL' || a.target_audience === 'STUDENTS'));
        const complaints = (store.get("complaints") || []).filter(c => c.student_id === student.student_id);
        const teachers = store.get("teachers") || [];

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header" style="justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h3><i class="fa-solid fa-bullhorn" style="color: var(--brand-primary);"></i> Institutional System Alerts & Published Bulletins</h3>
                            <button type="button" class="btn btn-xs btn-outline-danger" onclick="studentView.deleteSelectedAlerts()">
                                <i class="fa-solid fa-trash-can"></i> Delete Selected Alerts
                            </button>
                        </div>
                        <div class="notifications-list">
                            ${announcements.map(a => `
                                <div style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-primary); margin-bottom: 12px; border-left: 4px solid var(--brand-secondary);">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px; flex-wrap: wrap;">
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <input type="checkbox" class="st-alert-cb" data-id="${a.id}">
                                            <strong style="color: var(--brand-secondary);">${a.title}</strong>
                                        </div>
                                        <div>
                                            <small class="text-muted">${a.date}</small>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 4px; padding-left: 24px;">${a.content}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted); padding-left: 24px;"><i class="fa-solid fa-user-pen"></i> Posted by ${a.author || 'Academic Staff'}</small>
                                </div>
                            `).join('')}

                            ${notifications.map(n => `
                                <div style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-primary); margin-bottom: 12px; border-left: 4px solid var(--brand-primary);">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px; flex-wrap: wrap;">
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <input type="checkbox" class="st-alert-cb" data-id="${n.id}">
                                            <strong>${n.title}</strong>
                                        </div>
                                        <div>
                                            <small class="text-muted">${n.date}</small>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.88rem; color: var(--text-secondary); padding-left: 24px;">${n.message}</p>
                                </div>
                            `).join('')}

                            ${(announcements.length === 0 && notifications.length === 0) ? '<p class="text-muted">No new system alerts or announcements.</p>' : ''}
                        </div>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-paper-plane" style="color: var(--status-warning);"></i> Submit Complaint / Academic Inquiry</h3>
                        </div>
                        <form onsubmit="studentView.handleComplaintSubmit(event)">
                            <div class="form-group">
                                <label for="comp-target">Target Destination Recipient *</label>
                                <select id="comp-target" class="form-control" required>
                                    <option value="">-- Select Recipient --</option>
                                    <optgroup label="Administrative Offices">
                                        <option value="ROLE|Registrar Admin|Registrar Office">Registrar Admin Office</option>
                                        <option value="ROLE|Academic Admin|Academic Affairs">Academic Affairs Office</option>
                                        <option value="ROLE|Examination Admin|Examinations Office">Examinations Office</option>
                                        <option value="ROLE|Finance Admin|Accounts & Finance">Finance & Accounts Office</option>
                                        <option value="ROLE|ICT Admin|ICT Systems Support">ICT Support & Systems</option>
                                    </optgroup>
                                    <optgroup label="Course Lecturers & Teachers">
                                        ${teachers.map(t => `<option value="TEACHER|${t.staff_id}|${t.full_name}">${t.full_name} (${t.staff_id})</option>`).join('')}
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="comp-subject">Complaint Subject *</label>
                                <input type="text" id="comp-subject" class="form-control" placeholder="e.g. Missing Quiz Score for CS301" required>
                            </div>
                            <div class="form-group">
                                <label for="comp-message">Detailed Complaint *</label>
                                <textarea id="comp-message" class="form-control" rows="4" placeholder="Describe your complaint or inquiry..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-warning btn-block">
                                <i class="fa-solid fa-paper-plane"></i> Submit Complaint to Selected Recipient
                            </button>
                        </form>
                    </div>

                    
                    <div class="card">
                        <div class="card-header">
                            <h4><i class="fa-solid fa-comments" style="color: var(--brand-primary);"></i> My Submitted Queries & Responses</h4>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${complaints.map(c => `
                                <div style="padding: 12px; border-radius: var(--radius-md); background: var(--bg-primary); border-left: 4px solid ${c.status === 'Resolved' || c.reply ? 'var(--status-success)' : 'var(--status-warning)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                                        <strong>${c.subject}</strong>
                                        <div style="display: flex; gap: 6px; align-items: center;">
                                            <span class="badge ${c.status === 'Resolved' || c.reply ? 'badge-success' : 'badge-warning'}">${c.status || 'Pending'}</span>
                                            <button type="button" class="btn btn-xs btn-outline-danger" onclick="studentView.handleDeleteComplaint('${c.id}')" title="Delete complaint">
                                                <i class="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">${c.message}</p>
                                    <small style="font-size: 0.75rem; color: var(--text-muted); display: block;">Recipient: <strong>${c.target_recipient_name || 'Administration'}</strong> • ${c.date}</small>
                                    
                                    ${c.reply ? `
                                        <div style="margin-top: 8px; padding: 8px 12px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(34, 197, 94, 0.2);">
                                            <strong style="font-size: 0.82rem; color: var(--status-success);"><i class="fa-solid fa-reply"></i> Response from ${c.replied_by || c.target_recipient_name || 'Officer'}:</strong>
                                            <p style="font-size: 0.84rem; margin: 2px 0 0 0; color: var(--text-main);">${c.reply}</p>
                                        </div>
                                    ` : '<small style="font-size: 0.75rem; color: var(--brand-primary); margin-top: 4px; display: block;"><i class="fa-regular fa-clock"></i> Pending response from recipient...</small>'}
                                </div>
                            `).join('') || '<p class="text-muted" style="font-size: 0.85rem;">No complaints filed yet.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleDeleteComplaint(complaintId) {
        if (!confirm("Are you sure you want to delete this submitted complaint/inquiry from your dashboard?")) return;

        let complaints = store.get("complaints") || [];
        complaints = complaints.filter(c => c.id !== complaintId);
        store.set("complaints", complaints);

        app.showToast("Complaint deleted successfully from your dashboard.", "info");
        app.navigateTo("notifications");
    },

    handleComplaintSubmit(event) {
        event.preventDefault();
        const user = store.getCurrentUser();
        const student = user.student_data || (store.get("students") || [])[0];
        const targetVal = document.getElementById("comp-target").value;
        const subject = document.getElementById("comp-subject").value.trim();
        const message = document.getElementById("comp-message").value.trim();

        if (!targetVal) {
            app.showToast("Please select a target recipient for your complaint.", "warning");
            return;
        }

        const [tType, tId, tName] = targetVal.split('|');

        const complaints = store.get("complaints") || [];
        complaints.unshift({
            id: "comp-" + Date.now(),
            student_id: student ? student.student_id : "STU001",
            student_name: student ? (student.full_name || `${student.first_name} ${student.surname}`) : "Student",
            target_recipient_type: tType,
            target_recipient_id: tId,
            target_recipient_name: tName,
            subject: subject,
            message: message,
            status: "Pending",
            reply: null,
            date: new Date().toLocaleDateString()
        });

        store.set("complaints", complaints);
        store.logAudit(`Student (${student ? student.student_id : 'User'}) submitted complaint to ${tName}: "${subject}"`, "Communication");
        app.showToast(`Complaint submitted successfully to ${tName}!`, "success");
        app.navigateTo("notifications");
    },

    renderSettings(student) {
        const user = store.getCurrentUser() || {};
        const stData = user.student_data || student || {};

        return `
            <div class="dashboard-grid">
                <div class="grid-column">
                    
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-user-pen" style="color: var(--status-success);"></i> Edit Student Profile & Photo</h3>
                        </div>

                        
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                            <img id="st-setting-avatar-preview" src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Profile Photo" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary); box-shadow: var(--shadow-sm);">
                            <div>
                                <strong style="font-size: 0.9rem; display: block; margin-bottom: 4px;">Student Profile Photo</strong>
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

                        <form onsubmit="studentView.handleStudentProfileUpdate(event)">
                            <div class="form-group">
                                <label for="st-set-name">Full Name *</label>
                                <input type="text" id="st-set-name" class="form-control" value="${user.full_name || stData.full_name || (stData.first_name ? `${stData.first_name} ${stData.surname}` : '')}" required>
                            </div>
                            <div class="form-group">
                                <label for="st-set-id">Student ID (Read Only)</label>
                                <input type="text" id="st-set-id" class="form-control" value="${stData.student_id || 'N/A'}" readonly>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label for="st-set-email">Email Address *</label>
                                    <input type="email" id="st-set-email" class="form-control" value="${user.email || stData.email || ''}" required>
                                </div>
                                <div class="form-group col-6">
                                    <label for="st-set-phone">Phone Number *</label>
                                    <input type="tel" id="st-set-phone" class="form-control" value="${user.phone_number || stData.phone_number || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label for="st-set-dob">Date of Birth</label>
                                    <input type="date" id="st-set-dob" class="form-control" value="${stData.date_of_birth || user.date_of_birth || ''}">
                                </div>
                                <div class="form-group col-6">
                                    <label for="st-set-address">Residential Address</label>
                                    <input type="text" id="st-set-address" class="form-control" value="${stData.residential_address || user.residential_address || ''}">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success"><i class="fa-solid fa-floppy-disk"></i> Update Profile Details</button>
                        </form>
                    </div>

                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-key" style="color: var(--brand-primary);"></i> Update Password</h3>
                        </div>
                        <form onsubmit="studentView.handlePasswordUpdate(event)">
                            <div class="form-group">
                                <label for="curr-pass">Current Password *</label>
                                <input type="password" id="curr-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="new-pass">New Password * <small class="text-muted">(Min 6, 1 Upper, 1 Num, 1 Symbol)</small></label>
                                <input type="password" id="new-pass" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="repeat-new-pass">Repeat New Password *</label>
                                <input type="password" id="repeat-new-pass" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Update Password</button>
                        </form>
                    </div>
                </div>

                <div class="grid-column">
                    
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-palette" style="color: var(--brand-secondary);"></i> Theme & Visual Settings</h3>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Dark / Light Theme Mode</strong>
                                <p style="font-size: 0.82rem; color: var(--text-secondary);">Toggle UI color contrast theme preference.</p>
                            </div>
                            <button class="btn btn-outline-primary" onclick="app.toggleTheme()">
                                <i class="fa-solid fa-circle-half-stroke"></i> Switch Mode
                            </button>
                        </div>
                    </div>

                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fa-solid fa-circle-question" style="color: var(--status-info);"></i> Help & Support (FAQ)</h3>
                        </div>
                        <div style="font-size: 0.88rem; color: var(--text-secondary);">
                            <p><strong>Q: How do I calculate my GPA?</strong><br>A: Your GPA is calculated automatically based on continuous assessment and final exam scores.</p><br>
                            <p><strong>Q: How do I download receipts?</strong><br>A: Go to the Fees tab and click "PDF Receipt" next to any completed payment transaction.</p><br>
                            <p><strong>Q: What is the minimum attendance to sit for exams?</strong><br>A: You must attend at least 75% of all scheduled classes per course to be eligible for end-of-semester examinations.</p><br>
                            <p><strong>Q: How do I register for a re-sit exam?</strong><br>A: Go to Course Registration, select the Re-sit Registration tab, choose your failed courses, and submit. A re-sit fee of GH&#8355; 150 per paper applies.</p><br>
                            <p><strong>Q: How do I contact my assigned lecturer?</strong><br>A: Your course lecturer's contact details are available in the Course Registration section under each enrolled course.</p><br>
                            <p><strong>Support Email:</strong> gctu.isms022000@gmail.com<br><strong>Helpline:</strong> +233 573 121 772</p>

                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleStudentProfileUpdate(event) {
        event.preventDefault();
        const name = document.getElementById("st-set-name").value.trim();
        const email = document.getElementById("st-set-email").value.trim();
        const phone = document.getElementById("st-set-phone").value.trim();
        const dob = document.getElementById("st-set-dob").value;
        const address = document.getElementById("st-set-address").value.trim();

        const user = store.getCurrentUser();
        if (user) {
            user.full_name = name;
            user.email = email;
            user.phone_number = phone;
            user.date_of_birth = dob;
            user.residential_address = address;

            if (user.student_data) {
                user.student_data.full_name = name;
                user.student_data.email = email;
                user.student_data.phone_number = phone;
                user.student_data.date_of_birth = dob;
                user.student_data.residential_address = address;
            }

            store.setCurrentUser(user);

            const briefName = document.getElementById("brief-name");
            if (briefName) briefName.innerText = name;

            const students = store.get("students") || [];
            const st = students.find(s => s.student_id === (user.student_data ? user.student_data.student_id : null) || s.email === email);
            if (st) {
                st.first_name = name.split(' ')[0] || name;
                st.surname = name.split(' ').slice(1).join(' ') || '';
                st.email = email;
                st.phone_number = phone;
                st.date_of_birth = dob;
                st.residential_address = address;
                store.set("students", students);
            }

            const profiles = store.get("profiles") || [];
            const pr = profiles.find(p => p.id === user.id || p.email === email);
            if (pr) {
                pr.full_name = name;
                pr.email = email;
                pr.phone_number = phone;
                pr.date_of_birth = dob;
                pr.residential_address = address;
                store.set("profiles", profiles);
            }

            store.logAudit(`Student (${name}) updated account profile details`, "User Management");
            app.showToast("Student profile updated successfully!", "success");
        }
    },

    async handlePasswordUpdate(event) {
        event.preventDefault();
        const curr = document.getElementById("curr-pass").value;
        const newP = document.getElementById("new-pass").value;
        const rep = document.getElementById("repeat-new-pass").value;

        if (newP !== rep) {
            app.showToast("New passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(newP)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }

        const user = store.getCurrentUser();
        const student = user.student_data;
        const students = store.get("students") || [];
        const target = students.find(s => s.student_id === (student ? student.student_id : null) || s.email === user.email);

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
            store.set("students", students);
        }

        user.password = hashedNew;
        if (user.student_data) user.student_data.password = hashedNew;
        store.setCurrentUser(user);
        app.showToast("Password updated successfully!", "success");
        event.target.reset();
    },

    deleteSingleAlert(alertId) {
        if (!confirm("Are you sure you want to delete this alert from your dashboard?")) return;
        const student = store.getCurrentUser()?.student_data || (store.get("students") || [])[0];
        if (!student) return;

        const key = `deleted_alerts_${student.student_id}`;
        const deletedAlertIds = store.get(key) || [];
        if (!deletedAlertIds.includes(alertId)) {
            deletedAlertIds.push(alertId);
            store.set(key, deletedAlertIds);
        }
        app.showToast("Alert removed from dashboard.", "info");
        app.navigateTo("notifications");
    },

    deleteSelectedAlerts() {
        const checkboxes = document.querySelectorAll(".st-alert-cb:checked");
        if (checkboxes.length === 0) {
            app.showToast("Please check at least one alert to delete.", "warning");
            return;
        }
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected alert(s)?`)) return;

        const student = store.getCurrentUser()?.student_data || (store.get("students") || [])[0];
        if (!student) return;

        const key = `deleted_alerts_${student.student_id}`;
        const deletedAlertIds = store.get(key) || [];

        checkboxes.forEach(cb => {
            const id = cb.getAttribute("data-id");
            if (id && !deletedAlertIds.includes(id)) {
                deletedAlertIds.push(id);
            }
        });

        store.set(key, deletedAlertIds);
        app.showToast(`Successfully deleted ${checkboxes.length} alert(s) from dashboard.`, "success");
        app.navigateTo("notifications");
    }
};
