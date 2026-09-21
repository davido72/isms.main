const CONFIG = {
    APP_NAME: "Integrated Student Management System (ISMS)",
    VERSION: "2.5.0 Super Admin Master Workspace",


    SUPABASE_URL: "https://cfwwmqbhqgytypypkyce.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw",


    FACULTIES: [
        "Faculty of Computing & Information Systems",
        "Faculty of Engineering",
        "Faculty of Business Administration",
        "Faculty of Humanities"
    ],
    DEPARTMENTS: [
        "Computer Science",
        "Information Technology",
        "Electrical Engineering",
        "Accounting & Finance",
        "Media & Communication Studies"
    ],
    PROGRAMMES: [
        "BSc Computer Science",
        "BSc Information Technology",
        "BSc Business Administration",
        "BA Communication Studies",
        "BSc Electrical Engineering",
        "Diploma in IT Systems"
    ],
    LEVELS: ["100", "200", "300", "400"],
    SESSIONS: ["Morning", "Afternoon", "Evening", "Weekend"],
    QUALIFICATIONS: ["Diploma", "Degree", "Masters", "PhD"],


    ADMIN_SUB_ROLES: [
        "Registrar Admin",
        "Academic Admin",
        "Examination Admin",
        "Finance Admin",
        "ICT / System Admin"
    ],


    INSTITUTION_EMAIL_DOMAIN: "gctu.edu.gh",


    GRADING_SCALE: [
        { mark: "80-100", grade: "A", point: 4.0, remark: "Excellent" },
        { mark: "75-79", grade: "B+", point: 3.5, remark: "Very Good" },
        { mark: "70-74", grade: "B", point: 3.0, remark: "Good" },
        { mark: "65-69", grade: "C+", point: 2.5, remark: "Fairly Good" },
        { mark: "60-64", grade: "C", point: 2.0, remark: "Average" },
        { mark: "55-59", grade: "D+", point: 1.5, remark: "Pass" },
        { mark: "50-54", grade: "D", point: 1.0, remark: "Weak Pass" },
        { mark: "0-49", grade: "F", point: 0.0, remark: "Fail" }
    ],


    MIN_PASSWORD_LENGTH: 6,
    SUPER_ADMIN_MIN_PASSWORD_LENGTH: 12,
    PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/,


    PAYSTACK_PUBLIC_KEY: "pk_test_78dc3dd19d1611cac1ec97b054956d5e05795121"
};
