const aiAssistant = {

    institutionalKnowledge: [
        {
            category: "Grading System & GPA",
            keywords: ["grading", "grade scale", "grading system", "marks", "scores", "letter grade", "grade point", "scale", "cut off"],
            response: `
### 🎓 GCTU / ISMS Official Grading Scale & Point System
Student academic performance is evaluated based on the official university 4.0 grading scale:

| Score Range | Letter Grade | Grade Point (GP) | Description |
| :--- | :--- | :--- | :--- |
| **80% – 100%** | **A** | **4.00** | Excellent |
| **75% – 79%** | **B+** | **3.50** | Very Good |
| **70% – 74%** | **B** | **3.00** | Good |
| **65% – 69%** | **C+** | **2.50** | Fairly Good |
| **60% – 64%** | **C** | **2.00** | Pass |
| **55% – 59%** | **D+** | **1.50** | Weak Pass |
| **50% – 54%** | **D** | **1.00** | Bare Minimum Pass |
| **0% – 49%** | **F** | **0.00** | Fail (Must Re-sit) |

*The pass mark for all undergraduate courses is 50.0% (Grade D).*`
        },
        {
            category: "GPA Calculation Formula",
            keywords: ["calculate gpa", "gpa formula", "cgpa formula", "how gpa is calculated", "how is cgpa calculated", "grade points"],
            response: `
### 📐 GPA & CGPA Calculation Methodology
Your GPA (Grade Point Average) and CGPA (Cumulative GPA) are computed strictly using credit-weighted formulas:

1. **Assessment Breakdown**:
   - **Continuous Assessment (CA)**: 30% (Mid-sem exam, quizzes, coursework, laboratory assignments).
   - **End of Semester Final Examination**: 70%.
   - **Total Final Score**: Assessment (30) + Exam (70) = 100 Marks.

2. **Quality Points (QP)**:
   - For each course: $\\text{Quality Points} = \\text{Credit Hours} \\times \\text{Grade Point (GP)}$.

3. **Semester GPA Formula**:
   - $\\text{GPA} = \\frac{\\sum (\\text{Credit Hours} \\times \\text{Grade Point})}{\\text{Total Registered Credit Hours}}$.

4. **Cumulative GPA (CGPA)**:
   - The weighted average of all courses taken across all semesters from Level 100 to present date.`
        },
        {
            category: "Degree Classifications",
            keywords: ["degree class", "classification", "first class", "second class", "division", "honours", "cgpa requirements"],
            response: `
### 🏆 Degree Classifications & CGPA Thresholds
Undergraduate degrees are awarded according to the cumulative grade point average (CGPA) attained upon graduation:

- **First Class Honours**: CGPA **3.60 – 4.00**
- **Second Class (Upper Division)**: CGPA **3.00 – 3.59**
- **Second Class (Lower Division)**: CGPA **2.00 – 2.99**
- **Third Class**: CGPA **1.50 – 1.99**
- **Pass**: CGPA **1.00 – 1.49**
- **Fail / Remedial**: CGPA **Below 1.00**`
        },
        {
            category: "Class Attendance & 75% Rule",
            keywords: ["attendance", "75", "75%", "attendance policy", "minimum attendance", "eligibility", "exam attendance", "barred", "geo-fence"],
            response: `
### ⏱️ University Attendance Regulations & The 75% Rule
- **Mandatory 75% Rule**: University statutes require students to attain at least **75% lecture and laboratory attendance** in every registered course to be eligible to sit for final semester examinations. Students falling below 75% are automatically barred from examinations and assigned Grade 'F'.
- **Geo-Fenced Verification**: Students mark physical attendance using the **Attendance Portal** on the Student Dashboard. The system checks device GPS against campus boundaries (within 500m radius of GCTU Tesano Main Campus).
- **Attendance History**: You can track your real-time attendance logs and present/absent rates under **Attendance Portal -> Check Attendance History**.`
        },
        {
            category: "Course Registration & Deadlines",
            keywords: ["register course", "course registration", "credit hours", "minimum credits", "maximum credits", "add drop", "registration slip"],
            response: `
### 📝 Course Registration Guidelines & Limits
1. **Registration Window**: All students must complete semester course registration within the official registration window set by Academic Affairs.
2. **Credit Hour Workload**:
   - **Minimum Workload**: 15 Credit Hours per semester.
   - **Standard Workload**: 18 – 21 Credit Hours.
   - **Maximum Allowed**: 24 Credit Hours (requires Dean's approval for overloads).
3. **Registration Process**:
   - Navigate to **Course Registration** in your dashboard.
   - Select your approved cohort courses.
   - Click **Save & Register Courses**.
   - Download and print your official **Course Registration Slip (PDF)** for physical filing at the department.`
        },
        {
            category: "Re-sit & Supplementary Exams",
            keywords: ["resit", "re-sit", "supplementary", "failed course", "repeat", "failed exam", "resit fee"],
            response: `
### 🔄 Re-sit & Supplementary Examination Policy
- **Eligibility**: Any student who scores Grade 'F' (<50%) in a required course is eligible to take a supplementary re-sit examination.
- **Registration**: Eligible students can register failed courses via the **Course Registration -> Re-sit Registration** module.
- **Re-sit Fee**: A standard fee of **GH₵ 150.00 per course module** applies to all re-sit entries.
- **Grade Policy**: A passed re-sit replaces the failing grade point in the semester GPA calculation, allowing students to recover their academic standing.`
        },
        {
            category: "Fees, Payments & Receipts",
            keywords: ["fees", "tuition", "pay fees", "fee balance", "payment", "paystack", "bank", "momo", "receipt", "wallet", "installment"],
            response: `
### 💳 Tuition Fees, Payment Gateways & Receipt Guidelines
1. **Payment Options**:
   - **100% Full Payment**: Pay total semester fees prior to course registration.
   - **Flexible 50% Policy**: Pay at least 50% to obtain course registration clearance; balance must be settled before mid-semester examinations.
2. **Accepted Payment Methods**:
   - **Paystack Online**: Visa, Mastercard, Ghana QR.
   - **Mobile Money (MoMo)**: MTN Mobile Money, Telecel Cash, AT Money.
   - **Bank Wire Transfer**: Ghana Commercial Bank (GCB) or Ecobank Ghana ISMS Collection accounts.
3. **Instant Automated Receipts**: Once payment is completed, go to **Fees -> Payment Receipts** and click **Download PDF Receipt** to obtain a timestamped, cryptographically verified payment receipt.`
        },
        {
            category: "Academic Calendar & Timetable",
            keywords: ["academic calendar", "semester dates", "exam date", "timetable", "schedule", "when are exams", "vacation", "holiday"],
            response: `
### 📅 Academic Calendar & Semester Key Dates (2026/2027)
- **Course Registration Window**: September 1 – September 30, 2026.
- **Lectures Begin**: September 8, 2026.
- **Mid-Semester Assessments & Quizzes**: October 15 – October 25, 2026.
- **End-of-Semester Revision Week**: November 24 – November 30, 2026.
- **Final End-of-Semester Examinations**: December 1 – December 18, 2026.
- **Semester Vacation & Results Processing**: December 19, 2026 – January 10, 2027.
- **Semester 2 Resumption**: January 11, 2027.`
        },
        {
            category: "Remarking & Academic Grievance",
            keywords: ["remarking", "remark", "dispute", "appeal", "grievance", "complaint", "wrong grade", "script check"],
            response: `
### ⚖️ Remarking & Academic Grievance Procedures
1. **Filing a Petition**: Any student dissatisfied with a final grade may apply for an official script remarking through the Examination Directorate within **14 calendar days** of official results publication.
2. **Remarking Fee**: A non-refundable processing deposit of **GH₵ 100.00** per script must be paid into the finance portal.
3. **Independent Assessment**: The Dean of Faculty appoints an independent external examiner to re-evaluate the examination paper.
4. **Resolution**: If the remarking results in an upward grade alteration of 5% or more, the deposit fee is fully refunded to the student's fee wallet and the GPA is updated immediately.`
        },
        {
            category: "Official Transcripts & Attestations",
            keywords: ["transcript", "attestation", "official transcript", "letter", "recommendation", "graduation cert"],
            response: `
### 📜 Official Transcripts & Letters of Attestation
- **Unofficial Statement of Results**: Can be generated and downloaded as PDF anytime under **Results & GPA -> Print Statement of Results (PDF)**.
- **Official Stamped Transcripts**: Applied through the **Academic Affairs Office** or via the portal. Processing time is 3 to 5 business days.
- **Standard Processing Fee**: **GH₵ 150.00** per copy for local requests, **$50.00** for international courier dispatch.`
        },
        {
            category: "E-Library & Academic Resources",
            keywords: ["library", "e-library", "books", "past questions", "slides", "lecture notes", "courseware", "handbook"],
            response: `
### 📚 E-Library & Digital Learning Resources
- Students have 24/7 unlimited access to digital courseware through the **E-Library** item in the sidebar menu.
- Available materials include:
  - Prescribed e-textbooks and reference manuals.
  - Previous 5 years past examination question papers and marking schemes.
  - Faculty lecture slide decks, lab manuals, and supplementary reading notes.
- Use the search bar in the E-Library to filter resources by Course Code (e.g. CS301, CS303) or Subject Category.`
        },
        {
            category: "Campus Contacts & Student Support",
            keywords: ["contact", "support", "help", "email", "phone", "dean of students", "counseling", "it support", "hotline"],
            response: `
### 🏛️ University Contacts & Student Support Services
- **Academic Affairs Directorate**: \`academics@gctu.edu.gh\` | +233 302 123 456
- **Student Affairs & Dean of Students**: \`dean.students@gctu.edu.gh\` | Office: Block B, Room 102
- **Examinations Directorate**: \`exams@gctu.edu.gh\` | +233 302 123 458
- **Student Accounts & Finance**: \`finance@gctu.edu.gh\` | Office: Treasury Hall
- **ISMS IT Support Helpdesk**: \`support@gctu.edu.gh\` | WhatsApp Hotline: +233 241 000 000
- **University Counseling Center**: Confidential student mental health and academic guidance available Monday–Friday 8:00 AM – 5:00 PM.`
        }
    ],


    resolveStudentContextQuery(query, user) {
        const lower = query.toLowerCase();
        const student = user.student_data || (store.get("students") || []).find(s => s.student_id === user.student_id || s.email === user.email) || user;
        const studentId = student.student_id || user.student_id;

        if (!studentId) return null;


        if (lower.includes("my gpa") || lower.includes("my cgpa") || lower.includes("what is my gpa") || lower.includes("current gpa") || lower.includes("my grade point") || lower.includes("my standing")) {
            const grades = (store.get("grades") || []).filter(g => g.student_id === studentId && g.is_published);
            if (grades.length === 0) {
                return `**Hello ${student.first_name || 'Student'}!** No published semester grades were found yet for your account (${studentId}). Once your course lecturers publish continuous assessments and examination scores, your GPA will be computed automatically here.`;
            }

            let totalQualityPoints = 0;
            let totalCredits = 0;
            grades.forEach(g => {
                const credits = Number(g.credit_hours || 3);
                const gp = Number(g.grade_point || (g.letter_grade === 'A' ? 4.0 : g.letter_grade === 'B+' ? 3.5 : g.letter_grade === 'B' ? 3.0 : g.letter_grade === 'C+' ? 2.5 : g.letter_grade === 'C' ? 2.0 : g.letter_grade === 'D+' ? 1.5 : g.letter_grade === 'D' ? 1.0 : 0.0));
                totalQualityPoints += (credits * gp);
                totalCredits += credits;
            });

            const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : "0.00";
            let classification = "Pass";
            if (gpa >= 3.60) classification = "First Class Honours 🌟";
            else if (gpa >= 3.00) classification = "Second Class (Upper Division)";
            else if (gpa >= 2.00) classification = "Second Class (Lower Division)";
            else if (gpa >= 1.50) classification = "Third Class";

            const courseList = grades.map(g => `• **${g.course_code}**: ${g.total_score || (g.assessment_score + g.exam_score)}% (Grade: **${g.letter_grade}**, GP: ${g.grade_point})`).join('\n');

            return `
### 📊 Your Current Academic Standing & GPA
- **Student Name**: ${student.first_name} ${student.surname}
- **Student ID**: \`${studentId}\`
- **Total Published Courses**: ${grades.length}
- **Accumulated Credits**: ${totalCredits} Hours
- **Calculated GPA / CGPA**: **${gpa} / 4.00**
- **Academic Classification**: **${classification}**

**Published Course Breakdown**:
${courseList}

*You can download your full statement of results anytime from the Results & GPA section!*`;
        }


        if ((lower.includes("course") && (lower.includes("register") || lower.includes("enrolled") || lower.includes("taking") || lower.includes("schedule") || lower.includes("roster") || lower.includes("my"))) || lower.includes("my course") || lower.includes("my subject") || lower.includes("what did i register") || lower.includes("list my courses")) {
            const enrollments = (store.get("enrollments") || []).filter(e => e.student_id === studentId);
            if (enrollments.length === 0) {
                return `**Hello ${student.first_name || 'Student'}!** You have not registered for any courses for the active semester yet. Please navigate to the **Course Registration** section in your dashboard, select your courses, and click 'Save & Register Courses'.`;
            }

            const totalCredits = enrollments.reduce((acc, curr) => acc + Number(curr.credit_hours || 3), 0);
            const coursesList = enrollments.map((e, idx) => `${idx + 1}. **${e.course_code}** - ${e.course_title || e.course_code} (${e.credit_hours || 3} Credits) [${e.semester || 'Semester 1'}]`).join('\n');

            return `
### 📚 Your Registered Courses (Active Semester)
- **Student ID**: \`${studentId}\`
- **Total Registered Courses**: ${enrollments.length} Courses
- **Total Credit Hours**: **${totalCredits} Hours**

**Course Roster**:
${coursesList}

*You can download your official signed Course Registration Slip as PDF under Course Registration.*`;
        }


        if (lower.includes("my fee") || lower.includes("how much do i owe") || lower.includes("fee balance") || lower.includes("my balance") || lower.includes("what i owe") || lower.includes("tuition balance") || lower.includes("did my payment")) {
            const feesList = store.get("fees") || [];
            const fee = feesList.find(f => f.student_id === studentId);

            if (!fee) {
                return `**Hello ${student.first_name || 'Student'}!** Standard semester tuition of **GH₵ 4,800.00** is assigned to your level. Please check the **Fees** section to complete your payment or download your receipt.`;
            }

            const total = Number(fee.total_amount || 4800).toFixed(2);
            const paid = Number(fee.paid_amount || 0).toFixed(2);
            const balance = Number(fee.balance_due || 0).toFixed(2);
            const status = fee.status || (Number(balance) <= 0 ? "Fully Paid" : "Pending");

            const historyText = (fee.payment_history && fee.payment_history.length > 0)
                ? fee.payment_history.map(p => `• ${p.date}: Paid **GH₵ ${Number(p.amount).toFixed(2)}** via ${p.gateway} (Ref: \`${p.reference}\`)`).join('\n')
                : "• No recent payment transactions recorded.";

            return `
### 💰 Your Fee & Financial Standing
- **Student ID**: \`${studentId}\`
- **Semester**: ${fee.semester || 'Semester 1, 2026/2027'}
- **Total Semester Tuition**: **GH₵ ${total}**
- **Total Amount Paid**: **GH₵ ${paid}**
- **Outstanding Balance Due**: **GH₵ ${balance}**
- **Payment Status**: **${status}**

**Payment History**:
${historyText}

*You can pay using Mobile Money, Paystack, or Bank Transfer in the Fees section!*`;
        }


        if (lower.includes("my attendance") || lower.includes("attendance rate") || lower.includes("have i attended") || lower.includes("can i write exam") || lower.includes("my absenc")) {
            const attLogs = (store.get("attendance") || []).filter(a => a.student_id === studentId);
            const enrollments = (store.get("enrollments") || []).filter(e => e.student_id === studentId);

            if (attLogs.length === 0) {
                return `**Hello ${student.first_name || 'Student'}!** You currently have **0 recorded attendance entries** for this semester. Remember that the university strictly requires **75% lecture attendance** to sit for final semester examinations. Be sure to mark attendance in class using the **Attendance Portal**!`;
            }

            const presentCount = attLogs.filter(a => a.status === "Present").length;
            const totalLectures = Math.max(attLogs.length, 12);
            const rate = Math.round((presentCount / totalLectures) * 100);
            const statusBadge = rate >= 75 ? "✅ Eligible for Examinations (Above 75%)" : "⚠️ Warning: Below 75% Examination Threshold!";

            return `
### ⏱️ Your Current Attendance Summary
- **Student ID**: \`${studentId}\`
- **Total Registered Modules**: ${enrollments.length}
- **Recorded Attendance Logs**: ${attLogs.length} Sessions
- **Sessions Marked Present**: ${presentCount}
- **Estimated Attendance Rate**: **${rate}%**
- **Exam Eligibility Status**: **${statusBadge}**

*Ensure you mark geo-fenced attendance during each lecture to maintain compliance with the 75% rule.*`;
        }


        if (lower.includes("my grades") || lower.includes("my marks") || lower.includes("my results") || lower.includes("show my scores")) {
            const grades = (store.get("grades") || []).filter(g => g.student_id === studentId);
            if (grades.length === 0) {
                return `**Hello ${student.first_name || 'Student'}!** There are no released grades for your student account (${studentId}) at this moment. You will receive an instant notification as soon as faculty publish approved results.`;
            }

            const rows = grades.map(g => `• **${g.course_code}** (${g.course_title || 'Course'}): CA: ${g.assessment_score}/30 | Exam: ${g.exam_score}/70 | Total: **${g.total_score || (g.assessment_score + g.exam_score)}%** -> Grade **${g.letter_grade}**`).join('\n');

            return `
### 📑 Your Academic Scores & Results
${rows}

*To generate your official signed Statement of Results PDF, open the Results & GPA tab.*`;
        }

        return null;
    },


    getResponse(query) {
        const trimmed = query.trim();
        if (!trimmed) return "Please enter a question or choose from the suggested topics below.";

        const currentUser = store.getCurrentUser() || {};


        const personalResponse = this.resolveStudentContextQuery(trimmed, currentUser);
        if (personalResponse) {
            return personalResponse;
        }


        const lower = trimmed.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        for (const item of this.institutionalKnowledge) {
            let score = 0;
            for (const kw of item.keywords) {
                if (lower.includes(kw)) {
                    score += kw.length;
                }
            }
            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && highestScore > 0) {
            return bestMatch.response;
        }


        return `
### 🤖 ISMS Academic AI Knowledge Base
I am your 24/7 Academic & Institutional Assistant. I have complete knowledge of GCTU and ISMS regulations, including:

1. **Academic Performance**: Ask *"What is my GPA?"*, *"Grading scale"*, or *"How is GPA calculated?"*
2. **Course Enrolment**: Ask *"What courses am I taking?"*, *"Registration deadlines"*, or *"How to register"*
3. **Tuition & Finances**: Ask *"What is my fee balance?"*, *"Payment methods"*, or *"How to pay fees"*
4. **Class Attendance**: Ask *"What is my attendance rate?"*, *"75% attendance rule"*, or *"Geo-fenced check-in"*
5. **Examinations & Appeals**: Ask *"Re-sit policy"*, *"Academic calendar"*, or *"How to request remarking"*
6. **Student Support**: Ask *"Dean of students contact"* or *"E-Library resources"*

*Tip: Type one of the questions above or click any of the quick prompt buttons below!*`;
    },


    renderChatView(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = store.getCurrentUser() || {};
        const isStudent = user.role === "student" || !!user.student_data;

        container.innerHTML = `
            <div class="card ai-assistant-container">
                <div class="card-header" style="flex-wrap: wrap; gap: 10px; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="stat-icon primary" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="fa-solid fa-robot"></i></div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.1rem;">ISMS Academic AI Assistant</h3>
                            <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">Ask about grades, GPA, fees, attendance, and course registration.</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="btn btn-sm btn-outline-primary" onclick="aiAssistant.clearChat()"><i class="fa-solid fa-rotate-right"></i> Reset</button>
                    </div>
                </div>

                <!-- QUICK PROMPT PILLS -->
                <div class="ai-quick-pills" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; background: rgba(59, 130, 246, 0.05); border-bottom: 1px solid var(--border-color);">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); align-self: center;">Quick Queries:</span>
                    ${isStudent ? `
                        <button class="btn-pill" onclick="aiAssistant.askQuick('What is my current GPA and academic standing?')"><i class="fa-solid fa-chart-bar"></i> My GPA</button>
                        <button class="btn-pill" onclick="aiAssistant.askQuick('What courses did I register for this semester?')"><i class="fa-solid fa-book-open"></i> My Courses</button>
                        <button class="btn-pill" onclick="aiAssistant.askQuick('What is my outstanding fee balance?')"><i class="fa-solid fa-wallet"></i> Fee Balance</button>
                        <button class="btn-pill" onclick="aiAssistant.askQuick('What is my class attendance rate and am I eligible for exams?')"><i class="fa-solid fa-clock"></i> Attendance Rate</button>
                    ` : ''}
                    <button class="btn-pill" onclick="aiAssistant.askQuick('Explain the GCTU grading system and GPA scale')"><i class="fa-solid fa-graduation-cap"></i> Grading Scale</button>
                    <button class="btn-pill" onclick="aiAssistant.askQuick('What is the minimum 75% attendance rule for examinations?')"><i class="fa-solid fa-clipboard-list"></i> Attendance Rule</button>
                    <button class="btn-pill" onclick="aiAssistant.askQuick('How do re-sit supplementary exams work and what is the fee?')"><i class="fa-solid fa-rotate"></i> Re-sit Policy</button>
                    <button class="btn-pill" onclick="aiAssistant.askQuick('What are the official academic calendar dates and exam periods?')"><i class="fa-solid fa-calendar-days"></i> Academic Calendar</button>
                </div>

                <div class="chat-container">
                    <div id="chat-messages" class="chat-messages">
                        <div class="chat-bubble bot">
                            <strong><i class="fa-solid fa-robot"></i> AI Academic Assistant:</strong>
                            <p style="margin-top: 6px;">Ask me anything about grading, GPA calculation, attendance rules, course registration, fees, or your live academic standing.</p>
                        </div>
                    </div>
                    <div class="chat-input-bar">
                        <input type="text" id="chat-user-input" class="form-control" placeholder="Ask any academic or university question, e.g. 'What is my GPA?' or 'Grading scale'..." onkeypress="if(event.key==='Enter') aiAssistant.sendMessage()">
                        <button class="btn btn-primary" onclick="aiAssistant.sendMessage()"><i class="fa-solid fa-paper-plane"></i> Send</button>
                    </div>
                </div>
            </div>
        `;
    },

    askQuick(question) {
        const input = document.getElementById("chat-user-input");
        if (input) {
            input.value = question;
            this.sendMessage();
        }
    },

    clearChat() {
        const messagesDiv = document.getElementById("chat-messages");
        if (messagesDiv) {
            messagesDiv.innerHTML = `
                <div class="chat-bubble bot">
                    <strong><i class="fa-solid fa-robot"></i> AI Academic Assistant:</strong>
                    <p style="margin-top: 6px;">Chat reset. Ask me any question regarding your courses, GPA, fees, attendance, or university policies!</p>
                </div>
            `;
        }
    },

    formatMarkdown(text) {
        if (!text) return "";

        let html = text.replace(/^### (.*$)/gim, '<h4 style="margin: 8px 0 4px; color: var(--brand-primary); font-size: 1rem;">$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 10px 0 6px; font-size: 1.1rem;">$1</h3>');


        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');


        html = html.replace(/^\• (.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>');


        html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');


        if (html.includes('|')) {
            const lines = html.split('\n');
            let tableHtml = '<div class="table-responsive" style="margin: 8px 0;"><table class="table table-bordered" style="font-size: 0.85rem; width: 100%; border-collapse: collapse;">';
            let inTable = false;
            let finalLines = [];

            for (let line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                    if (!inTable) {
                        inTable = true;
                    }
                    if (trimmed.includes('---')) continue;
                    const cells = trimmed.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                    tableHtml += '<tr>' + cells.map(c => `<td style="padding: 6px 10px; border: 1px solid var(--border-color);">${c.trim()}</td>`).join('') + '</tr>';
                } else {
                    if (inTable) {
                        tableHtml += '</table></div>';
                        finalLines.push(tableHtml);
                        tableHtml = '<div class="table-responsive" style="margin: 8px 0;"><table class="table table-bordered" style="font-size: 0.85rem; width: 100%; border-collapse: collapse;">';
                        inTable = false;
                    }
                    finalLines.push(line);
                }
            }
            if (inTable) {
                tableHtml += '</table></div>';
                finalLines.push(tableHtml);
            }
            html = finalLines.join('\n');
        }


        html = html.replace(/\n\n/g, '<br><br>');
        return html;
    },

    sendMessage() {
        const input = document.getElementById("chat-user-input");
        const messagesDiv = document.getElementById("chat-messages");
        if (!input || !messagesDiv) return;

        const query = input.value.trim();
        if (!query) return;


        messagesDiv.innerHTML += `
            <div class="chat-bubble user">
                ${query}
            </div>
        `;
        input.value = "";
        messagesDiv.scrollTop = messagesDiv.scrollHeight;


        const typingId = "typing-" + Date.now();
        messagesDiv.innerHTML += `
            <div id="${typingId}" class="chat-bubble bot" style="font-style: italic; color: var(--text-secondary);">
                <i class="fa-solid fa-spinner fa-spin"></i> AI Assistant is searching knowledge base & institutional records...
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;


        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            const answerRaw = this.getResponse(query);
            const formatted = this.formatMarkdown(answerRaw);

            messagesDiv.innerHTML += `
                <div class="chat-bubble bot">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--brand-primary);"><i class="fa-solid fa-robot"></i> AI Academic Assistant:</div>
                    <div>${formatted}</div>
                </div>
            `;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 400);
    }
};

if (typeof window !== "undefined") {
    window.aiAssistant = aiAssistant;
}
