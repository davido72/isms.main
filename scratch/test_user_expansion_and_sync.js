const fs = require("fs");
const path = require("path");

console.log("=== RUNNING AUTOMATED VERIFICATION FOR USER REQUESTS ===");

// 1. Verify styles.css contains the desktop expansion media queries
const cssContent = fs.readFileSync(path.join(__dirname, "../styles.css"), "utf-8");
const checks = [
    { name: "@media (min-width: 992px)", regex: /@media\s*\(\s*min-width\s*:\s*992px\s*\)/ },
    { name: "KPI Grid 4 columns", regex: /repeat\s*\(\s*4\s*,\s*1fr\s*\)/ },
    { name: "KPI Stat Card min-height", regex: /min-height\s*:\s*125px/ },
    { name: "Admin Status Grid 2 columns", regex: /grid-template-columns\s*:\s*repeat\s*\(\s*2\s*,\s*1fr\s*\)/ },
    { name: "Analytics Chart height expansion", regex: /#admin-analytics-chart[\s\S]*?height\s*:\s*320px/ },
    { name: "@media (min-width: 1400px)", regex: /@media\s*\(\s*min-width\s*:\s*1400px\s*\)/ }
];

let cssPassed = true;
checks.forEach(c => {
    if (c.regex.test(cssContent)) {
        console.log(`[PASS] CSS Desktop Expansion check: ${c.name}`);
    } else {
        console.error(`[FAIL] CSS Desktop Expansion check missing: ${c.name}`);
        cssPassed = false;
    }
});

// Setup DOM simulation
class DOMElement {
    constructor(tagName = "div", id = "") {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.classList = {
            classes: new Set(),
            add: (c) => this.classList.classes.add(c),
            remove: (c) => this.classList.classes.delete(c),
            toggle: (c, force) => {
                if (force === true) this.classList.classes.add(c);
                else if (force === false) this.classList.classes.delete(c);
                else if (this.classList.classes.has(c)) this.classList.classes.delete(c);
                else this.classList.classes.add(c);
            },
            contains: (c) => this.classList.classes.has(c)
        };
        this.attributes = {};
        this._innerHTML = "";
        this._value = "";
    }
    setAttribute(n, v) { this.attributes[n] = v; }
    getAttribute(n) { return this.attributes[n] || null; }
    removeAttribute(n) { delete this.attributes[n]; }
    get innerHTML() { return this._innerHTML; }
    set innerHTML(v) { this._innerHTML = v; }
    get innerText() { return (this._innerHTML || "").replace(/<[^>]*>/g, ""); }
    set innerText(v) { this._innerHTML = v; }
    get textContent() { return this.innerText; }
    set textContent(v) { this.innerText = v; }
    get value() { return this._value; }
    set value(v) { this._value = v; }
    remove() { }
}

const elementsById = new Map();
function getEl(id) {
    if (!elementsById.has(id)) {
        elementsById.set(id, new DOMElement("div", id));
    }
    return elementsById.get(id);
}

const storageMap = new Map();
const localStorage = {
    getItem: (k) => storageMap.get(k) || null,
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
    clear: () => storageMap.clear()
};

global.window = {
    location: { hash: "" },
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: localStorage,
    sessionStorage: localStorage
};
global.document = {
    getElementById: (id) => getEl(id),
    querySelectorAll: (sel) => {
        if (sel === ".active-academic-session-label") {
            return [getEl("topbar-academic-session")];
        }
        return [];
    },
    querySelector: () => null,
    createElement: (tag) => new DOMElement(tag),
    addEventListener: () => {},
    removeEventListener: () => {}
};
global.localStorage = localStorage;
global.sessionStorage = localStorage;
global.navigator = { userAgent: "node" };

// Load modules
require("../config.js");
require("../passwordHelper.js");
require("../store.js");
require("../validators.js");
require("../supabaseClient.js");
require("../views/authView.js");
require("../views/studentView.js");
require("../views/teacherView.js");
require("../views/parentView.js");
require("../views/adminView.js");
require("../app.js");

global.app = app;
global.authView = authView;
global.adminView = adminView;
global.studentView = studentView;
global.teacherView = teacherView;
global.parentView = parentView;

// Initialize app mocks
app.showToast = (msg, type) => { console.log(`[Toast ${type || 'info'}]: ${msg}`); };
app.closeModal = (id) => { getEl(id).classList.add("hidden"); };
app.initializeMainScreen = () => { console.log("[app.initializeMainScreen] Triggered successfully."); };

console.log("\n--- TEST 1: REGISTRATION WITHOUT OTP ---");
// Test student registration
const testStudentEmail = "testnewstudent@isms.edu.gh";
const testStudentPhone = "+233241112233";
const testStudentId = "STU99001";
const entityData = {
    id: "st-" + Date.now(),
    student_id: testStudentId,
    first_name: "Kwame",
    surname: "Mensah",
    email: testStudentEmail,
    phone_number: testStudentPhone,
    password: "Password123!",
    status: "Active"
};
const profileData = {
    id: "prof-" + Date.now(),
    email: testStudentEmail,
    full_name: "Kwame Mensah",
    role: "student",
    phone_number: testStudentPhone
};

authView.completeRegistrationWithoutOtp('student', entityData, profileData, testStudentId).then(() => {
    const students = store.get("students") || [];
    const saved = students.find(s => s.student_id === testStudentId);
    const currentUser = store.getCurrentUser();

    if (saved && currentUser && currentUser.student_data && currentUser.student_data.student_id === testStudentId) {
        console.log("[PASS] Student registered directly without OTP. Session active.");
    } else {
        console.error("[FAIL] Student registration without OTP failed.");
    }

    console.log("\n--- TEST 2: CURRENT SEMESTER & ACADEMIC YEAR CONFIGURATION ---");
    // Admin configures Academic Year and Current Semester
    getEl("sys-univ-name").value = "Ghana Communication Technology University (GCTU)";
    getEl("sys-acad-year").value = "2027/2028";
    getEl("sys-curr-sem").value = "Semester 2";
    getEl("sys-max-credits").value = "24";

    const fakeEvent = { preventDefault: () => {} };
    adminView.saveSystemSettings(fakeEvent);

    const session = store.getCurrentAcademicSession();
    console.log("Current session in store:", session);

    if (session.academic_year === "2027/2028" && session.current_semester === "Semester 2" && session.full_label === "2027/2028 - Semester 2") {
        console.log("[PASS] store.getCurrentAcademicSession() returns updated session correctly.");
    } else {
        console.error("[FAIL] store.getCurrentAcademicSession() did not update correctly.");
    }

    const kpiSemEl = getEl("kpi-semester");
    console.log("Admin Overview #kpi-semester textContent:", kpiSemEl.textContent);
    if (kpiSemEl.textContent === "2027/2028 - Semester 2") {
        console.log("[PASS] Overview & Summary Current Semester container updated immediately.");
    } else {
        console.error("[FAIL] Overview #kpi-semester did not update.");
    }

    // Polling test
    adminView.currentTab = 'overview';
    adminView._updateOverviewStats();
    if (kpiSemEl.textContent === "2027/2028 - Semester 2") {
        console.log("[PASS] Admin _updateOverviewStats() polling maintains updated session.");
    } else {
        console.error("[FAIL] Admin _updateOverviewStats() polling reverted semester.");
    }

    // Check all dashboards
    const studentHtml = studentView.renderDashboard(saved);
    const teacherHtml = teacherView.renderDashboard({ staff_id: "STF23001", full_name: "Dr. Appiah" });
    const parentHtml = parentView.renderDashboard({ full_name: "Parent User", email: "parent@isms.edu.gh" });

    if (studentHtml.includes("2027/2028 - Semester 2")) {
        console.log("[PASS] Student Dashboard reflects configured Academic Year and Semester.");
    } else {
        console.error("[FAIL] Student Dashboard does NOT reflect configured session.");
    }

    if (teacherHtml.includes("2027/2028 - Semester 2")) {
        console.log("[PASS] Teacher Dashboard reflects configured Academic Year and Semester.");
    } else {
        console.error("[FAIL] Teacher Dashboard does NOT reflect configured session.");
    }

    if (parentHtml.includes("2027/2028 - Semester 2")) {
        console.log("[PASS] Parent Dashboard reflects configured Academic Year and Semester.");
    } else {
        console.error("[FAIL] Parent Dashboard does NOT reflect configured session.");
    }

    console.log("\n=== ALL CHECKS COMPLETED ===");
});
