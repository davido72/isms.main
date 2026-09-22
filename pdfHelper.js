const pdfHelper = {
    generateCourseRegistrationSlip(student, enrollments) {
        const totalCredits = enrollments.reduce((acc, curr) => acc + Number(curr.credit_hours || 3), 0);
        const rows = enrollments.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.course_code}</strong></td>
                <td>${item.course_title}</td>
                <td>${item.credit_hours || 3}</td>
                <td><span class="badge badge-success">Registered</span></td>
            </tr>
        `).join('');

        return `
            <div class="printable-header">
                <div>
                    <h2>OFFICIAL COURSE REGISTRATION SLIP</h2>
                    <p>Integrated Student Management System (ISMS)</p>
                </div>
                <div>
                    <p><strong>Academic Year:</strong> 2025/2026</p>
                    <p><strong>Semester:</strong> Semester 1</p>
                    <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div class="printable-info-grid">
                <div>
                    <p><strong>Student Name:</strong> ${student.first_name} ${student.surname} ${student.other_names || ''}</p>
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Programme:</strong> ${student.programme}</p>
                </div>
                <div>
                    <p><strong>Level:</strong> Level ${student.level}</p>
                    <p><strong>Session:</strong> ${student.session}</p>
                    <p><strong>Total Registered Credit Hours:</strong> <strong style="color: #2563eb; font-size: 1.1rem;">${totalCredits} Hours</strong></p>
                </div>
            </div>

            <div class="printable-table-scroll-hint">
                <i class="fa-solid fa-arrows-left-right"></i> Scroll table horizontally to view all columns
            </div>
            <div class="printable-table-container">
                <table class="table" style="width: 100%; border: 1px solid #e2e8f0; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">#</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Course Code</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Course Title</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Credits</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>

            <div class="printable-signatures">
                <div class="printable-sig-box">
                    <div class="printable-sig-line"></div>
                    <p style="font-size: 0.8rem; margin-top: 4px;">Student Signature</p>
                </div>
                <div class="printable-sig-box">
                    <div class="printable-sig-line"></div>
                    <p style="font-size: 0.8rem; margin-top: 4px;">Head of Department Stamp</p>
                </div>
            </div>
        `;
    },

    generateResultsTranscript(student, grades) {
        let totalPoints = 0;
        let totalCredits = 0;

        const rows = grades.map((g, idx) => {
            const credits = 3;
            const pts = Number(g.grade_point || 4.0) * credits;
            totalPoints += pts;
            totalCredits += credits;

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${g.course_code}</strong></td>
                    <td>${g.course_title}</td>
                    <td>${g.assessment_score || 0} / 30</td>
                    <td>${g.exam_score || 0} / 70</td>
                    <td><strong>${g.total_score || 0}%</strong></td>
                    <td><span class="badge badge-success">${g.letter_grade || 'A'}</span></td>
                </tr>
            `;
        }).join('');

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "4.00";

        return `
            <div class="printable-header">
                <div>
                    <h2>OFFICIAL ACADEMIC TRANSCRIPT & STATEMENT OF RESULTS</h2>
                    <p>Integrated Student Management System (ISMS)</p>
                </div>
                <div>
                    <p><strong>CUMULATIVE GPA:</strong> <strong style="font-size: 1.3rem; color: #10b981;">${gpa}</strong></p>
                    <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div class="printable-info-grid">
                <div>
                    <p><strong>Student Name:</strong> ${student.first_name} ${student.surname} ${student.other_names || ''}</p>
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Programme:</strong> ${student.programme}</p>
                </div>
                <div>
                    <p><strong>Level:</strong> Level ${student.level}</p>
                    <p><strong>Academic Session:</strong> ${student.session}</p>
                    <p><strong>Academic Standing:</strong> <span class="badge badge-success">Good Standing</span></p>
                </div>
            </div>

            <div class="printable-table-scroll-hint">
                <i class="fa-solid fa-arrows-left-right"></i> Scroll table horizontally to view all columns
            </div>
            <div class="printable-table-container">
                <table class="table" style="width: 100%; border: 1px solid #e2e8f0; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">#</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Course</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Title</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Continuous Assessment</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Exam</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Final Score</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    },

    generateFeeReceipt(student, feeData, paymentItem) {
        return `
            <div class="printable-header">
                <div>
                    <h2>OFFICIAL TUITION FEE PAYMENT RECEIPT</h2>
                    <p>Integrated Student Management System (ISMS)</p>
                </div>
                <div>
                    <p><strong>Receipt No:</strong> ${paymentItem.reference || 'PAY-' + Math.floor(Math.random() * 1000000)}</p>
                    <p><strong>Date:</strong> ${paymentItem.date || new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981; font-size: 0.9rem;">
                <p style="margin-bottom: 4px;"><strong>Received From:</strong> ${student.first_name} ${student.surname} (${student.student_id})</p>
                <p style="margin-bottom: 4px;"><strong>Programme & Level:</strong> ${student.programme} - Level ${student.level}</p>
                <p style="margin-bottom: 0;"><strong>Payment Gateway / Wallet:</strong> ${paymentItem.gateway}</p>
            </div>

            <div class="printable-table-container">
                <table class="table" style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                    <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px;">
                        <td style="padding: 10px;">Total Semester Fees Allocated:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">GHS ${Number(feeData.total_amount).toFixed(2)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px; background: #f1f5f9;">
                        <td style="padding: 10px; font-weight: bold; color: #10b981;">Current Amount Paid:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 1.15rem;">GHS ${Number(paymentItem.amount).toFixed(2)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px;">
                        <td style="padding: 10px;">Total Cumulative Paid:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">GHS ${Number(feeData.paid_amount).toFixed(2)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0; padding: 10px; background: #fff1f2;">
                        <td style="padding: 10px; font-weight: bold; color: #ef4444;">Balance Due:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; color: #ef4444;">GHS ${Number(feeData.balance_due).toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <span class="badge badge-success" style="font-size: 0.95rem; padding: 8px 18px;">STATUS: PAYMENT VERIFIED & CONFIRMED</span>
            </div>
        `;
    },

    generateReceipt(studentName, studentId, amount, refNo, semester) {
        const student = (store.get("students") || []).find(s => s.student_id === studentId) || {
            first_name: studentName.split(" ")[0] || studentName,
            surname: studentName.split(" ").slice(1).join(" ") || "",
            student_id: studentId,
            programme: "BSc Computer Science",
            level: "300"
        };
        const feeData = (store.get("fees") || []).find(f => f.student_id === studentId) || {
            total_amount: (amount || 1500) + 1000,
            paid_amount: amount || 1500,
            balance_due: 1000
        };
        const paymentItem = {
            reference: refNo || "PAY-" + Date.now(),
            date: new Date().toLocaleDateString(),
            gateway: "Paystack / Bank Transfer",
            amount: amount || 1500
        };
        const html = this.generateFeeReceipt(student, feeData, paymentItem);
        this.openPrintModal(html, `Fee Receipt - ${paymentItem.reference}`);
    },

    downloadStudentTranscript(studentId) {
        const students = store.get("students") || [];
        const student = students.find(s => s.student_id === studentId || s.id === studentId) || students[0];
        const grades = store.get("grades") || [];
        const studentGrades = grades.filter(g => g.student_id === student.student_id || g.student_id === student.id);
        const displayGrades = studentGrades.length > 0 ? studentGrades : [
            { course_code: "CS301", course_title: "Database Systems", assessment_score: 28, exam_score: 62, total_score: 90, letter_grade: "A", grade_point: 4.0 },
            { course_code: "CS303", course_title: "Web Technologies", assessment_score: 26, exam_score: 59, total_score: 85, letter_grade: "A", grade_point: 4.0 },
            { course_code: "CS305", course_title: "Software Engineering", assessment_score: 24, exam_score: 54, total_score: 78, letter_grade: "B+", grade_point: 3.5 }
        ];

        const html = this.generateResultsTranscript(student, displayGrades);
        this.openPrintModal(html, "Official Academic Transcript & Results Statement");
    },

    generateClassRosterReport(courseCode) {
        const courses = store.get("courses") || [];
        const course = courses.find(c => c.course_code === courseCode) || courses[0] || { course_code: courseCode, title: "Course Roster" };
        const students = store.get("students") || [];
        const enrollments = store.get("enrollments") || [];
        const courseEnrollments = enrollments.filter(e => e.course_code === course.course_code);

        const enrolledStudents = students.filter(s => courseEnrollments.some(e => e.student_id === s.student_id));
        const list = enrolledStudents.length > 0 ? enrolledStudents : students;

        const rows = list.map((s, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${s.student_id}</strong></td>
                <td>${s.first_name} ${s.surname} ${s.other_names || ''}</td>
                <td>${s.programme}</td>
                <td>Level ${s.level}</td>
                <td>${s.session}</td>
                <td><span class="badge badge-success">Active Roster</span></td>
            </tr>
        `).join('');

        const html = `
            <div class="printable-header">
                <div>
                    <h2>OFFICIAL CLASS ENROLLMENT & ATTENDANCE ROSTER</h2>
                    <p>Integrated Student Management System (ISMS)</p>
                </div>
                <div>
                    <p><strong>Course:</strong> ${course.course_code} - ${course.title || course.name}</p>
                    <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Total Roster Count:</strong> ${list.length} Students</p>
                </div>
            </div>

            <div class="printable-table-scroll-hint">
                <i class="fa-solid fa-arrows-left-right"></i> Scroll table horizontally to view all columns
            </div>
            <div class="printable-table-container">
                <table class="table" style="width: 100%; border: 1px solid #e2e8f0; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">#</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Student ID</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Full Name</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Programme</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Level</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Session</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
        this.openPrintModal(html, `Class Roster - ${course.course_code}`);
    },

    generateResitRegistrationSlip(student, resitEnrollments) {
        const rows = resitEnrollments.map((item, idx) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${idx + 1}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong style="color: #ef4444;">${item.course_code}</strong></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.course_title}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">3 Hours</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">GH₵ 150.00</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;"><span class="badge badge-warning">Re-sit Registered</span></td>
            </tr>
        `).join('');

        return `
            <div class="printable-header">
                <div>
                    <h2>OFFICIAL RE-SIT / RE-TAKE COURSE REGISTRATION SLIP</h2>
                    <p>Integrated Student Management System (ISMS)</p>
                </div>
                <div>
                    <p><strong>Academic Semester:</strong> Semester 1 Re-sit</p>
                    <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div class="printable-info-grid">
                <div>
                    <p><strong>Student Name:</strong> ${student.first_name} ${student.surname} ${student.other_names || ''}</p>
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Programme:</strong> ${student.programme}</p>
                </div>
                <div>
                    <p><strong>Level:</strong> Level ${student.level}</p>
                    <p><strong>Total Re-sit Papers:</strong> <strong>${resitEnrollments.length} Paper(s)</strong></p>
                    <p><strong>Total Re-sit Paper Fee:</strong> <strong style="color: #d97706;">GH₵ ${(resitEnrollments.length * 150).toFixed(2)}</strong></p>
                </div>
            </div>

            <div class="printable-table-scroll-hint">
                <i class="fa-solid fa-arrows-left-right"></i> Scroll table horizontally to view all columns
            </div>
            <div class="printable-table-container">
                <table class="table" style="width: 100%; border: 1px solid #e2e8f0; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr style="background: #fff7ed; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">#</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Course Code</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Course Title</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Credits</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Paper Fee</th>
                            <th style="padding: 10px; border: 1px solid #cbd5e1;">Registration Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>

            <div class="printable-signatures">
                <div class="printable-sig-box">
                    <div class="printable-sig-line"></div>
                    <p style="font-size: 0.8rem; margin-top: 4px;">Student Signature</p>
                </div>
                <div class="printable-sig-box">
                    <div class="printable-sig-line"></div>
                    <p style="font-size: 0.8rem; margin-top: 4px;">Examinations Officer Stamp</p>
                </div>
            </div>
        `;
    },

    openPrintModal(htmlContent, title = "Official Document PDF Preview") {
        const modal = document.getElementById("printable-modal");
        if (!modal) return;

        const titleEl = modal.querySelector(".modal-header h3");
        if (titleEl) {
            titleEl.innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--brand-primary);"></i> ${title}`;
        }

        const container = document.getElementById("printable-document-content");
        if (container) {
            container.innerHTML = htmlContent;

            // Ensure every table in printable document is wrapped in a responsive scroll container
            container.querySelectorAll("table").forEach(tbl => {
                const parent = tbl.parentElement;
                if (!parent.classList.contains("printable-table-container") && !parent.classList.contains("table-responsive")) {
                    const wrapper = document.createElement("div");
                    wrapper.className = "table-responsive printable-table-container";
                    tbl.parentNode.insertBefore(wrapper, tbl);
                    wrapper.appendChild(tbl);

                    // Add scroll hint if not present
                    if (!wrapper.previousElementSibling || !wrapper.previousElementSibling.classList.contains("printable-table-scroll-hint")) {
                        const hint = document.createElement("div");
                        hint.className = "printable-table-scroll-hint";
                        hint.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i> Scroll table horizontally to view all columns`;
                        wrapper.parentNode.insertBefore(hint, wrapper);
                    }
                }
            });
        }

        modal.classList.remove("hidden");

        const bodyEl = modal.querySelector(".modal-body");
        if (bodyEl) bodyEl.scrollTop = 0;
    },

    printCurrentDocument() {
        window.print();
    }
};
