class Store {
    constructor() {
        this.initDefaultData();
    }

    initDefaultData() {
        if (!localStorage.getItem("isms_initialized_v10")) {
            const defaultProfiles = [
                {
                    id: "prof-superadmin-1",
                    email: "systemadmin@gctu.edu.gh",
                    full_name: "System Administrator",
                    phone_number: "+233241000000",
                    role: "admin",
                    admin_role_title: "System Admin",
                    staff_id: "SUPER-001",
                    permissions: ["ALL"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-admin-reg",
                    email: "registrar.admin@isms.edu.gh",
                    full_name: "Mrs. Deborah Osei (Registrar Admin)",
                    phone_number: "+233241000011",
                    role: "admin",
                    admin_role_title: "Registrar Admin",
                    staff_id: "ADM-REG-01",
                    permissions: ["users", "reg_control"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-admin-aca",
                    email: "academic.admin@isms.edu.gh",
                    full_name: "Dr. Kwame Mensah (Academic Admin)",
                    phone_number: "+233241000012",
                    role: "admin",
                    admin_role_title: "Academic Admin",
                    staff_id: "ADM-ACA-01",
                    permissions: ["academic", "e-library", "reg_control"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-admin-exa",
                    email: "exam.admin@isms.edu.gh",
                    full_name: "Prof. Albert Kwarteng (Exam Admin)",
                    phone_number: "+233241000013",
                    role: "admin",
                    admin_role_title: "Examination Admin",
                    staff_id: "ADM-EXA-01",
                    permissions: ["results", "attendance"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-admin-fin",
                    email: "finance.admin@isms.edu.gh",
                    full_name: "Mrs. Sarah Addo (Finance Admin)",
                    phone_number: "+233241000014",
                    role: "admin",
                    admin_role_title: "Finance Admin",
                    staff_id: "ADM-FIN-01",
                    permissions: ["finance"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-admin-ict",
                    email: "ict.admin@isms.edu.gh",
                    full_name: "Mr. Eric Ansah (ICT System Admin)",
                    phone_number: "+233241000015",
                    role: "admin",
                    admin_role_title: "ICT / System Admin",
                    staff_id: "ADM-ICT-01",
                    permissions: ["audit", "settings", "rbac", "backup"],
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                },
                {
                    id: "prof-teacher-1",
                    email: "teacher.boakye@isms.edu.gh",
                    full_name: "Prof. Emanuel Boakye",
                    phone_number: "+233241000002",
                    role: "teacher",
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                },
                {
                    id: "prof-student-1",
                    email: "student.abena@isms.edu.gh",
                    full_name: "Abena Osei Appiah",
                    phone_number: "+233241000003",
                    role: "student",
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                },
                {
                    id: "prof-parent-1",
                    email: "parent.appiah@isms.edu.gh",
                    full_name: "Mr. Kwabena Appiah",
                    phone_number: "+233241000004",
                    role: "parent",
                    status: "Active",
                    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                }
            ];

            const defaultStudents = [
                {
                    id: "stu-1",
                    profile_id: "prof-student-1",
                    student_id: "4211260001",
                    first_name: "Abena",
                    surname: "Appiah",
                    other_names: "Osei",
                    full_name: "Abena Osei Appiah",
                    email: "student.abena@isms.edu.gh",
                    phone_number: "+233241000003",
                    programme: "BSc Computer Science",
                    level: "300",
                    session: "Morning",
                    status: "Active",
                    gpa: 3.85,
                    cgpa: 3.78,
                    academic_status: "Active",
                    password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74",
                    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                }
            ];

            const defaultTeachers = [
                {
                    id: "tch-1",
                    profile_id: "prof-teacher-1",
                    staff_id: "STF23001",
                    full_name: "Prof. Emanuel Boakye",
                    email: "teacher.boakye@isms.edu.gh",
                    phone_number: "+233241000002",
                    department: "Computer Science",
                    qualification: "Ph.D. Computer Science",
                    session: "Morning",
                    status: "Active",
                    courses_assigned: ["CS301", "CS303"],
                    password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74"
                }
            ];

            const defaultParents = [
                {
                    id: "prnt-1",
                    profile_id: "prof-parent-1",
                    full_name: "Mr. Kwabena Appiah",
                    email: "parent.appiah@isms.edu.gh",
                    phone_number: "+233241000004",
                    status: "Active",
                    password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74",
                    linked_student_ids: ["4211260001"]
                }
            ];

            const defaultAdmins = [
                { id: "adm-sub-1", staff_id: "ADM-REG-01", full_name: "Mrs. Deborah Osei", email: "registrar.admin@isms.edu.gh", phone_number: "+233241000011", role_title: "Registrar Admin", permissions: ["users", "reg_control"], status: "Active", password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74" },
                { id: "adm-sub-2", staff_id: "ADM-ACA-01", full_name: "Dr. Kwame Mensah", email: "academic.admin@isms.edu.gh", phone_number: "+233241000012", role_title: "Academic Admin", permissions: ["academic", "e-library", "reg_control"], status: "Active", password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74" },
                { id: "adm-sub-3", staff_id: "ADM-EXA-01", full_name: "Prof. Albert Kwarteng", email: "exam.admin@isms.edu.gh", phone_number: "+233241000013", role_title: "Examination Admin", permissions: ["results", "attendance"], status: "Active", password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74" },
                { id: "adm-sub-4", staff_id: "ADM-FIN-01", full_name: "Mrs. Sarah Addo", email: "finance.admin@isms.edu.gh", phone_number: "+233241000014", role_title: "Finance Admin", permissions: ["finance"], status: "Active", password: "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74" }
            ];

            const defaultCourses = [
                { id: "c-1", course_code: "CS301", title: "Software Engineering & Systems Architecture", credit_hours: 3, level: "300", department: "Computer Science", programme: "BSc Computer Science", session: "Morning", teacher_id: "tch-1", enrolled_count: 142 },
                { id: "c-2", course_code: "CS303", title: "Database Systems & Supabase Backend", credit_hours: 4, level: "300", department: "Computer Science", programme: "BSc Computer Science", session: "Morning", teacher_id: "tch-1", enrolled_count: 118 },
                { id: "c-3", course_code: "CS305", title: "Mobile & Responsive Web Development", credit_hours: 3, level: "300", department: "Information Technology", programme: "BSc Information Technology", session: "Morning", teacher_id: null, enrolled_count: 95 },
                { id: "c-4", course_code: "CS307", title: "Computer Networks & Cybersecurity", credit_hours: 3, level: "300", department: "Computer Science", programme: "BSc Computer Science", session: "Morning", teacher_id: null, enrolled_count: 88 }
            ];

            const defaultEnrollments = [
                { id: "e-1", student_id: "4211260001", course_code: "CS301", course_title: "Software Engineering & Systems Architecture", credit_hours: 3, semester: "Semester 1", date: "2026-08-01" },
                { id: "e-2", student_id: "4211260001", course_code: "CS303", course_title: "Database Systems & Supabase Backend", credit_hours: 4, semester: "Semester 1", date: "2026-08-01" }
            ];

            const defaultGrades = [
                { id: "g-1", student_id: "4211260001", student_name: "Abena Osei Appiah", course_code: "CS301", course_title: "Software Engineering", assessment_score: 28, exam_score: 58, total_score: 86, letter_grade: "A", grade_point: 4.0, is_published: true, status: "Approved & Published" },
                { id: "g-2", student_id: "4211260001", student_name: "Abena Osei Appiah", course_code: "CS303", course_title: "Database Systems", assessment_score: 26, exam_score: 54, total_score: 80, letter_grade: "A", grade_point: 4.0, is_published: true, status: "Approved & Published" }
            ];

            const defaultGradeChangeLogs = [
                { id: "gcl-1", changed_by: "Prof. Albert Kwarteng (Exam Admin)", student_id: "4211260001", course_code: "CS301", previous_grade: "C+", new_grade: "A", reason: "Official remarking approval after script verification", date: "2026-08-04 14:30:00" }
            ];

            const defaultAttendance = [
                { id: "att-1", student_id: "4211260001", student_name: "Abena Osei Appiah", course_code: "CS301", department: "Computer Science", date: "2026-08-01", status: "Present" },
                { id: "att-2", student_id: "4211260001", student_name: "Abena Osei Appiah", course_code: "CS303", department: "Computer Science", date: "2026-08-02", status: "Present" }
            ];

            const defaultFees = [
                {
                    id: "fee-1",
                    student_id: "4211260001",
                    student_name: "Abena Osei Appiah",
                    semester: "Semester 1, 2026/2027",
                    total_amount: 4800.00,
                    paid_amount: 4800.00,
                    balance_due: 0.00,
                    status: "Fully Paid",
                    payment_history: [
                        { date: "2026-01-15", amount: 4800.00, gateway: "Paystack Wallet", reference: "PAY-9923182" }
                    ]
                }
            ];

            const defaultFeeCategories = [
                { id: "fc-1", name: "BSc Tuition & Academic Fee", code: "TUI-BSC", amount: 4800.00, level: "All Levels", session: "Regular", status: "Active" },
                { id: "fc-2", name: "Late Registration Penalty Fee", code: "PEN-LATE", amount: 350.00, level: "All Levels", session: "All", status: "Active" },
                { id: "fc-3", name: "Official Transcript Request Fee", code: "FEE-TRN", amount: 150.00, level: "Graduated/Alumni", session: "All", status: "Active" }
            ];

            const defaultTranscripts = [
                { id: "trn-1", student_id: "4211260001", student_name: "Abena Osei Appiah", programme: "BSc Computer Science", request_date: "2026-08-04", status: "Approved & Issued", reference_no: "TRN-2026-9912" }
            ];

            const defaultPaymentTransactions = [
                { id: "tx-1", reference: "PAY-9923182", student_id: "4211260001", student_name: "Abena Osei Appiah", amount: 4800.00, channel: "Paystack Online Gateway", status: "Successful", timestamp: "2026-01-15 11:24:00" },
                { id: "tx-2", reference: "TXN-8812391", student_id: "4211260001", student_name: "Abena Osei Appiah", amount: 150.00, channel: "Bank Wire Transfer (GCB)", status: "Successful", timestamp: "2026-08-04 15:10:00" }
            ];

            const defaultAnnouncements = [
                { id: "ann-1", title: "End of Semester Examination Timetable Published", content: "The semester examination timetable is now accessible via student portals.", date: "2026-07-25", author: "Academic Affairs Office", target_audience: "ALL" }
            ];

            const defaultELibrary = [
                {
                    id: "elib-1",
                    title: "Database Management Systems Handbook",
                    category: "E-Book",
                    course_code: "CS303",
                    course_title: "Database Systems & Supabase Backend",
                    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    description: "Comprehensive guide to SQL, normalization, relational algebra, and Supabase integration.",
                    date: "2026-07-28",
                    uploaded_by: "Prof. Emanuel Boakye"
                }
            ];

            const defaultAdminRoles = [
                { id: "adm-r-1", name: "Registrar Admin", permissions: ["users", "reg_control"], description: "Manages student profiles, enrollment status, directories, and course registration records." },
                { id: "adm-r-2", name: "Academic Admin", permissions: ["academic", "e-library", "reg_control"], description: "Oversees faculties, departments, courses, academic calendars, course registration control, and E-Library." },
                { id: "adm-r-3", name: "Examination Admin", permissions: ["results", "attendance"], description: "Manages exam submissions, grade approvals, non-silent remarking, and attendance eligibility oversight." },
                { id: "adm-r-4", name: "Finance Admin", permissions: ["finance"], description: "Manages student fee balances, receipts, payments, and financial transaction reports." },
                { id: "adm-r-5", name: "ICT / System Admin", permissions: ["settings", "backup", "audit"], description: "Manages system settings, database backups, and audit logs." }
            ];

            const defaultDbBackups = [
                { id: "bak-1", filename: "isms_prod_backup_20260806_020000.sql", size: "14.2 MB", timestamp: "2026-08-06 02:00:00", type: "Automated Daily", status: "Successful" },
                { id: "bak-2", filename: "isms_prod_backup_20260805_020000.sql", size: "13.9 MB", timestamp: "2026-08-05 02:00:00", type: "Automated Daily", status: "Successful" },
                { id: "bak-3", filename: "isms_manual_snapshot_20260804_164510.sql", size: "13.8 MB", timestamp: "2026-08-04 16:45:10", type: "Manual Trigger", status: "Successful" }
            ];

            const defaultAuditLogs = [
                { id: "audit-1", date: "2026-08-05 10:14:22", actor: "SystemAdmin (SUPER-001)", action: "Configured Granted Permission Scope for Finance Admin", category: "User Management" },
                { id: "audit-2", date: "2026-08-05 09:30:11", actor: "AcademicAdmin (ADM-ACA-01)", action: "Updated CS301 Course Module Credit Limit to 3 Hours", category: "Academic" },
                { id: "audit-3", date: "2026-08-04 14:30:00", actor: "ExaminationAdmin (ADM-EXA-01)", action: "Recorded Non-Silent Grade Change for 4211260001 (C+ -> A, Reason: Remarking)", category: "Results" },
                { id: "audit-4", date: "2026-08-03 16:20:10", actor: "SystemAdmin (SUPER-001)", action: "Configured Course Registration Window: OPEN (01/09/2026 - 30/09/2026)", category: "System" }
            ];

            const defaultSystemAlerts = [
                { id: "alt-1", category: "Security Alert", message: "Failed Login Attempts: 18 attempts logged in last 24h from unknown IP addresses. Review audit logs.", date: "2026-08-05 11:00:00", level: "danger", target_audience: "ALL" },
                { id: "alt-2", category: "System Health", message: "Database Backup Completed Successfully at 02:00 AM (Snapshot saved). All data intact.", date: "2026-08-05 02:00:00", level: "success", target_audience: "ICT / System Admin" },
                { id: "alt-3", category: "User Action", message: "New Student Registration: Abena Osei Appiah registered under BSc Computer Science (Level 300, Morning).", date: "2026-08-04 18:30:00", level: "info", target_audience: "Registrar Admin" },
                { id: "alt-4", category: "Compliance Notice", message: "Course Registration Window is OPEN for Semester 1 (Max Credit Limit: 24 hours). Deadline: 30/09/2026.", date: "2026-08-03 09:00:00", level: "warning", target_audience: "ALL" },
                { id: "alt-5", category: "Academic Notice", message: "Academic Calendar published for 2026/2027 Semester 1. All departments required to confirm faculty assignments.", date: "2026-08-02 08:00:00", level: "info", target_audience: "Academic Admin" },
                { id: "alt-6", category: "Finance Alert", message: "Outstanding fee balance reminder sent to 342 students with unpaid balances exceeding 30 days.", date: "2026-08-01 10:00:00", level: "warning", target_audience: "Finance Admin" },
                { id: "alt-7", category: "Results Notice", message: "Grade submission deadline is approaching: 12 courses have pending results for Semester 1 examination board.", date: "2026-07-30 15:00:00", level: "warning", target_audience: "Examination Admin" },
                { id: "alt-8", category: "Security Alert", message: "Super Admin Master Account accessed from new IP range. If unrecognized, please revoke sessions immediately.", date: "2026-08-06 07:22:00", level: "danger", target_audience: "Super Admin" }
            ];

            const defaultRegControl = {
                current_semester: "2026/2027 - Semester 1",
                status: "OPEN",
                opening_date: "2026-09-01",
                closing_date: "2026-09-30",
                max_credit_hours: 24
            };

            const defaultSystemSettings = {
                general: {
                    university_name: "Ghana Communication Technology University (GCTU)",
                    logo_url: "gctu_logo.png",
                    contact_email: "info@gctu.edu.gh",
                    contact_phone: "+233302221412",
                    academic_year: "2026/2027",
                    current_semester: "Semester 1"
                },
                academic: {
                    max_credit_limit: 24,
                    min_credit_limit: 12,
                    grading_scale_type: "Standard 4.0 GPA",
                    registration_period: "01/09/2026 - 30/09/2026",
                    academic_calendar_status: "Active"
                },
                security: {
                    min_password_length: 6,
                    super_admin_min_password_length: 12,
                    session_timeout_mins: 30,
                    mfa_required: true,
                    account_lockout_attempts: 5
                },
                notifications: {
                    email_notifications: true,
                    announcement_alerts: true,
                    registration_reminders: true,
                    results_publishing_alerts: true
                }
            };

            const defaultAcademicEvents = [
                { id: "cal-1", title: "Semester 1 Course Registration Window", start_date: "2026-09-01", end_date: "2026-09-30", scope: "All Students & Faculty", description: "Official online course registration period for 2026/2027 Semester 1. All students must complete registration.", status: "Published" },
                { id: "cal-2", title: "Mid-Semester Examinations Window", start_date: "2026-10-15", end_date: "2026-10-25", scope: "All Students & Faculty", description: "Continuous assessment and mid-semester exams for all departments.", status: "Published" },
                { id: "cal-3", title: "End of Semester Final Examinations", start_date: "2026-12-01", end_date: "2026-12-18", scope: "All Students & Faculty", description: "Final end-of-semester examination period across all faculties.", status: "Published" },
                { id: "cal-4", title: "Semester Break & Results Processing", start_date: "2026-12-19", end_date: "2027-01-10", scope: "All Students & Faculty", description: "Inter-semester vacation for students and official grade submission by faculty.", status: "Published" }
            ];

            this.set("profiles", defaultProfiles);
            this.set("students", defaultStudents);
            this.set("teachers", defaultTeachers);
            this.set("parents", defaultParents);
            this.set("admins", defaultAdmins);
            this.set("courses", defaultCourses);
            this.set("enrollments", defaultEnrollments);
            this.set("grades", defaultGrades);
            this.set("grade_change_logs", defaultGradeChangeLogs);
            this.set("attendance", defaultAttendance);
            this.set("fees", defaultFees);
            this.set("fee_categories", defaultFeeCategories);
            this.set("transcripts", defaultTranscripts);
            this.set("payment_transactions", defaultPaymentTransactions);
            this.set("announcements", defaultAnnouncements);
            this.set("elibrary", defaultELibrary);
            this.set("admin_roles", defaultAdminRoles);
            this.set("db_backups", defaultDbBackups);
            this.set("audit_logs", defaultAuditLogs);
            this.set("system_alerts", defaultSystemAlerts);
            this.set("reg_control", defaultRegControl);
            this.set("system_settings", defaultSystemSettings);
            this.set("academic_events", defaultAcademicEvents);

            localStorage.setItem("isms_initialized_v10", "true");
            localStorage.removeItem("isms_initialized_v9");
        }


        const defaultHashedPassword = "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74";
        ['students', 'teachers', 'parents', 'admins', 'profiles'].forEach(entityKey => {
            const list = this.get(entityKey);
            if (Array.isArray(list) && list.length > 0) {
                let modified = false;
                list.forEach(item => {
                    if (item && item.password && !item.password.startsWith('sha256$')) {
                        item.password = defaultHashedPassword;
                        modified = true;
                    }
                });
                if (modified) {
                    this.set(entityKey, list);
                }
            }
        });


        const existingCourses = this.get("courses");
        if (Array.isArray(existingCourses) && existingCourses.length > 0) {
            let needsUpdate = false;
            existingCourses.forEach(c => {
                if (!c.programme) {
                    c.programme = (c.department === "Information Technology") ? "BSc Information Technology" : "BSc Computer Science";
                    needsUpdate = true;
                }
            });
            if (needsUpdate) {
                this.set("courses", existingCourses);
            }
        }
    }

    get(key) {
        const item = localStorage.getItem(`isms_${key}`);
        return item ? JSON.parse(item) : [];
    }

    set(key, value) {
        localStorage.setItem(`isms_${key}`, JSON.stringify(value));
        if (["system_alerts", "audit_logs", "courses", "reg_control", "announcements"].includes(key)) {
            if (window.app && typeof window.app.updateNotificationBadge === "function") {
                window.app.updateNotificationBadge();
            }
        }
        if (["courses", "enrollments", "grades", "attendance", "fees", "fee_categories",
            "parents", "students", "reg_control", "announcements", "quizzes", "system_settings"].includes(key)) {
            if (window.app && typeof window.app.refreshActiveViews === "function") {
                window.app.refreshActiveViews();
            }
        }

        const overviewKeys = ["students", "teachers", "parents", "admins", "courses", "enrollments",
            "grade_change_logs", "db_backups", "system_alerts",
            "reg_control", "system_settings"];
        if (overviewKeys.includes(key)) {
            if (window.adminView && typeof window.adminView._updateOverviewStats === "function") {

                setTimeout(() => window.adminView._updateOverviewStats(), 100);
            }
        }

        if (["fees", "fee_categories", "payment_transactions"].includes(key)) {
            if (window.adminView && typeof window.adminView._updateFinanceStats === "function") {
                setTimeout(() => window.adminView._updateFinanceStats(), 50);
            }
        }

        if (key === "attendance") {
            if (window.adminView && typeof window.adminView._updateAttendanceStats === "function") {
                setTimeout(() => window.adminView._updateAttendanceStats(), 50);
            }
        }
    }

    getCurrentUser() {
        const user = localStorage.getItem("isms_current_user");
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem("isms_current_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("isms_current_user");
        }
    }

    logAudit(action, category = "General") {
        const currentUser = this.getCurrentUser();
        const actor = currentUser ? `${currentUser.full_name || currentUser.email} (${currentUser.admin_role_title || currentUser.role})` : "SuperAdmin";
        const logs = this.get("audit_logs") || [];
        const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
        logs.unshift({
            id: "audit-" + Date.now(),
            date: nowStr,
            actor: actor,
            action: action,
            category: category
        });
        this.set("audit_logs", logs);


        if (["Security", "System Security", "System Configuration", "RBAC Management", "User Management"].includes(category)) {
            const alerts = this.get("system_alerts") || [];
            alerts.unshift({
                id: "alt-" + Date.now(),
                category: category === "Security" ? "Security Alert" : "System Notification",
                message: `${action} (By: ${actor})`,
                date: nowStr,
                level: category === "Security" ? "danger" : "info",
                target_audience: "ALL"
            });
            this.set("system_alerts", alerts);
        }

        if (window.app && typeof window.app.updateNotificationBadge === "function") {
            window.app.updateNotificationBadge();
        }
    }

    logGradeChange(changedBy, studentId, courseCode, prevGrade, newGrade, reason) {
        const logs = this.get("grade_change_logs") || [];
        const entry = {
            id: "gcl-" + Date.now(),
            changed_by: changedBy,
            student_id: studentId,
            course_code: courseCode,
            previous_grade: prevGrade,
            new_grade: newGrade,
            reason: reason,
            date: new Date().toISOString().replace("T", " ").substring(0, 19)
        };
        logs.unshift(entry);
        this.set("grade_change_logs", logs);
        this.logAudit(`Grade Change recorded for ${studentId}: ${prevGrade} -> ${newGrade} (Reason: ${reason})`, "Results");
    }


    getFeeCategoriesForStudent(student) {
        if (!student) return [];
        const allCategories = this.get("fee_categories") || [];

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

        const studentLvl = normalizeLvl(student.level);
        const studentSess = normalizeSess(student.session);

        return allCategories.filter(cat => {
            if (cat.status && cat.status.toLowerCase() === "inactive") return false;
            const catLvl = normalizeLvl(cat.level);
            const catSess = normalizeSess(cat.session);

            const levelMatches = (catLvl === "all" || catLvl === studentLvl);
            const sessionMatches = (catSess === "all" || catSess === studentSess);

            return levelMatches && sessionMatches;
        });
    }


    calculateStudentFeeBalance(studentId) {
        const students = this.get("students") || [];
        const student = students.find(s => s.student_id === studentId);
        const feesList = this.get("fees") || [];
        const existingRecord = feesList.find(f => f.student_id === studentId);

        const assignedCats = student ? this.getFeeCategoriesForStudent(student) : [];
        const computedTotal = assignedCats.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);


        const paidAmount = Number(existingRecord?.paid_amount || 0);

        const totalAmount = assignedCats.length > 0 ? computedTotal : Number(existingRecord?.total_amount || 0);
        const balanceDue = Math.max(0, totalAmount - paidAmount);
        const status = balanceDue <= 0 && totalAmount > 0 ? "Fully Paid" : (paidAmount > 0 ? "Partially Paid" : "Pending");

        return {
            student_id: studentId,
            assigned_categories: assignedCats,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            balance_due: balanceDue,
            status: status,
            payment_history: existingRecord?.payment_history || []
        };
    }

    calculateStudentAttendance(studentId, courseCode = null) {
        const attendance = this.get("attendance") || [];
        const studentLogs = attendance.filter(a => {
            if (a.student_id !== studentId) return false;
            if (courseCode && courseCode !== 'ALL' && a.course_code !== courseCode) return false;
            return true;
        });

        const total = studentLogs.length;
        const present = studentLogs.filter(a => a.status === "Present").length;
        const late = studentLogs.filter(a => a.status === "Late").length;
        const absent = studentLogs.filter(a => a.status === "Absent").length;
        const attended = present + late;
        const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

        return {
            student_id: studentId,
            course_code: courseCode,
            total,
            present,
            late,
            absent,
            attended,
            rate
        };
    }

    calculateCourseAttendance(courseCode) {
        const attendance = this.get("attendance") || [];
        const courseLogs = attendance.filter(a => a.course_code === courseCode);
        const total = courseLogs.length;
        const present = courseLogs.filter(a => a.status === "Present").length;
        const late = courseLogs.filter(a => a.status === "Late").length;
        const absent = courseLogs.filter(a => a.status === "Absent").length;
        const attended = present + late;
        const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

        return {
            course_code: courseCode,
            total,
            present,
            late,
            absent,
            attended,
            rate
        };
    }

    calculateOverallAttendance(filters = {}) {
        const attendance = this.get("attendance") || [];
        const students = this.get("students") || [];

        const dept = filters.dept || 'ALL';
        const crs = filters.course || 'ALL';
        const lvl = filters.level || 'ALL';
        const query = (filters.search || '').toLowerCase().trim();

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

        const total = filtered.length;
        const present = filtered.filter(a => a.status === "Present").length;
        const late = filtered.filter(a => a.status === "Late").length;
        const absent = filtered.filter(a => a.status === "Absent").length;
        const attended = present + late;
        const rate = total > 0 ? ((attended / total) * 100).toFixed(1) : "100.0";

        // CS department average
        const csLogs = attendance.filter(a => {
            const student = students.find(s => s.student_id === a.student_id);
            const aDept = a.department || (student ? student.department : 'Computer Science');
            return aDept === 'Computer Science';
        });
        const csTotal = csLogs.length;
        const csAttended = csLogs.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const csRate = csTotal > 0 ? ((csAttended / csTotal) * 100).toFixed(1) : "100.0";

        // Today's stats
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLogs = attendance.filter(a => a.date === todayStr);
        const absentToday = todayLogs.filter(a => a.status === "Absent").length || absent;
        const lateToday = todayLogs.filter(a => a.status === "Late").length || late;

        return {
            total,
            present,
            late,
            absent,
            attended,
            rate: Number(rate),
            csRate: Number(csRate),
            absentToday,
            lateToday,
            filteredCount: filtered.length
        };
    }

    getCurrentAcademicSession() {
        const sys = this.get("system_settings") || {};
        const general = sys.general || {};
        const regControl = this.get("reg_control") || {};
        const standaloneSem = this.get("current_semester");

        let acadYear = (general.academic_year || "").trim();
        let currSem = (general.current_semester || "").trim();

        if (!acadYear || !currSem) {
            const raw = regControl.current_semester || standaloneSem || "2026/2027 - Semester 1";
            if (raw.includes("-")) {
                const parts = raw.split("-");
                if (!acadYear) acadYear = parts[0].trim();
                if (!currSem) currSem = parts.slice(1).join("-").trim();
            } else {
                if (!acadYear) acadYear = "2026/2027";
                if (!currSem) currSem = raw;
            }
        }

        if (!acadYear) acadYear = "2026/2027";
        if (!currSem) currSem = "Semester 1";

        let fullLabel = currSem.includes(acadYear) ? currSem : `${acadYear} - ${currSem}`;

        return {
            academic_year: acadYear,
            current_semester: currSem,
            full_label: fullLabel
        };
    }
}

const store = new Store();
