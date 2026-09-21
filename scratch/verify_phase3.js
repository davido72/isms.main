const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, val) => { store[key] = String(val); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;
global.window = {
    addEventListener: () => { },
    location: { hash: "" }
};
global.document = {
    getElementById: (id) => ({
        id,
        value: "",
        innerHTML: "",
        innerText: "",
        classList: { add: () => { }, remove: () => { }, toggle: () => { } },
        querySelectorAll: () => [],
        setAttribute: () => { },
        getAttribute: () => null
    })
};


const fs = require("fs");
const vm = require("vm");

let refreshCalled = false;
global.app = {
    refreshActiveViews: () => { refreshCalled = true; },
    showToast: (msg, type) => { },
    updateNotificationBadge: () => { }
};
global.window.app = global.app;

vm.runInThisContext(fs.readFileSync("./js/store.js", "utf8"));
vm.runInThisContext(fs.readFileSync("./js/aiAssistant.js", "utf8"));
vm.runInThisContext(fs.readFileSync("./js/views/studentView.js", "utf8"));
vm.runInThisContext(fs.readFileSync("./js/views/parentView.js", "utf8"));
vm.runInThisContext(fs.readFileSync("./js/views/adminView.js", "utf8"));

console.log("=== RUNNING TESTS ===");


console.log("\n[TEST 1] Attendance Course Dropdown Filtering...");
const testStudent = (store.get("students") || [])[0];
const htmlAttendance = studentView.renderAttendance(testStudent);

if (!htmlAttendance.includes("att-semester-select")) {
    throw new Error("Attendance view does not contain semester selector!");
}
if (!htmlAttendance.includes("CS301") || !htmlAttendance.includes("CS303")) {
    throw new Error("Attendance view does not contain student's registered courses (CS301, CS303)!");
}

if (htmlAttendance.includes("CS305")) {
    throw new Error("FAIL: Unregistered course CS305 found in student's registered courses dropdown!");
}
console.log("✅ PASS: Attendance course dropdown strictly displays registered courses for the individual student.");


let selectInnerHtml = "";
global.document.getElementById = (id) => {
    if (id === "att-course-select") {
        return {
            set innerHTML(val) { selectInnerHtml = val; },
            get innerHTML() { return selectInnerHtml; }
        };
    }
    return { value: "", innerHTML: "", classList: { toggle: () => { } } };
};

studentView.onAttendanceSemesterChange("Semester 2");
if (!selectInnerHtml.includes("No registered courses found for Semester 2")) {
    throw new Error("FAIL: onAttendanceSemesterChange did not display clean empty message for unregistered semester!");
}
console.log("✅ PASS: onAttendanceSemesterChange accurately handles empty semesters.");


console.log("\n[TEST 2] AI Academic Assistant Knowledge Base...");


const gpaAnswer = aiAssistant.getResponse("What is the official grading scale and cut off marks?");
if (!gpaAnswer.includes("GCTU / ISMS Official Grading Scale") || !gpaAnswer.includes("80% – 100%") || !gpaAnswer.includes("Grade D")) {
    throw new Error("FAIL: AI Assistant did not provide complete grading scale!");
}
console.log("✅ PASS: AI Knowledge base answers grading scale with official 4.0 system.");

const attAnswer = aiAssistant.getResponse("Explain the 75% attendance rule and geo-fencing");
if (!attAnswer.includes("Mandatory 75% Rule") || !attAnswer.includes("Geo-Fenced Verification")) {
    throw new Error("FAIL: AI Assistant did not explain 75% attendance rule!");
}
console.log("✅ PASS: AI Knowledge base answers 75% attendance policy & geo-fencing.");

const resitAnswer = aiAssistant.getResponse("How much is the re-sit exam fee?");
if (!resitAnswer.includes("GH₵ 150.00")) {
    throw new Error("FAIL: AI Assistant did not return re-sit fee of GH₵ 150!");
}
console.log("✅ PASS: AI Knowledge base answers re-sit exam fees & policy.");


store.setCurrentUser({
    id: "prof-student-1",
    email: "abena.appiah@isms.edu.gh",
    role: "student",
    student_data: testStudent
});

const myGpaAnswer = aiAssistant.getResponse("What is my current GPA?");
if (!myGpaAnswer.includes("Your Current Academic Standing & GPA") || !myGpaAnswer.includes("4.00") || !myGpaAnswer.includes("First Class")) {
    throw new Error("FAIL: AI Assistant did not calculate live GPA for logged-in student: " + myGpaAnswer);
}
console.log("✅ PASS: AI dynamically calculated and answered live student GPA.");

const myCoursesAnswer = aiAssistant.getResponse("What courses did I register for this semester?");
if (!myCoursesAnswer.includes("CS301") || !myCoursesAnswer.includes("CS303")) {
    throw new Error("FAIL: AI did not retrieve student registered courses: " + myCoursesAnswer);
}
console.log("✅ PASS: AI dynamically retrieved and listed student's registered courses.");

const myFeesAnswer = aiAssistant.getResponse("How much is my fee balance?");
if (!myFeesAnswer.includes("Your Fee & Financial Standing") || !myFeesAnswer.includes("GH₵")) {
    throw new Error("FAIL: AI did not retrieve student fee standing: " + myFeesAnswer);
}
console.log("✅ PASS: AI dynamically retrieved student fee and payment status.");


console.log("\n[TEST 3] Parent-Ward Dynamic Fee Synchronization...");

const parentUser = (store.get("parents") || [])[0];
store.setCurrentUser({
    id: parentUser.id,
    email: parentUser.email,
    role: "parent",
    parent_data: parentUser
});


const initialParentHtml = parentView.renderDashboard(parentUser);
if (initialParentHtml.includes("GHS 2,500.00")) {
    throw new Error("FAIL: Hardcoded GHS 2,500.00 still found in parent dashboard!");
}
console.log("✅ PASS: Hardcoded GHS 2,500.00 removed from Parent Dashboard.");


const newStudent = {
    id: "stu-test-99",
    student_id: "4211999999",
    first_name: "Kofi",
    surname: "Mensah",
    level: "200",
    programme: "BSc Computer Science",
    email: "kofi.mensah@isms.edu.gh"
};
const students = store.get("students") || [];
students.push(newStudent);
store.set("students", students);


const fees = store.get("fees") || [];
fees.push({
    id: "fee-test-99",
    student_id: newStudent.student_id,
    student_name: `${newStudent.first_name} ${newStudent.surname}`,
    total_amount: 5000.00,
    paid_amount: 2000.00,
    balance_due: 3000.00,
    status: "Pending",
    payment_history: [{ date: "2026-08-10", amount: 2000, gateway: "MTN MoMo", reference: "REF-TEST-99" }]
});
store.set("fees", fees);


const parents = store.get("parents") || [];
const targetParent = parents.find(p => p.id === parentUser.id);
targetParent.linked_student_ids = [newStudent.student_id];
store.set("parents", parents);


const updatedParentHtml = parentView.renderDashboard(parentUser);
if (!updatedParentHtml.includes("3,000.00")) {
    throw new Error("FAIL: Parent dashboard did not reflect linked student's 3,000.00 balance due! Output: " + updatedParentHtml);
}
console.log("✅ PASS: Parent Dashboard dynamically reflects linked ward's fees (GHS 3,000.00 balance due).");


const childFeesHtml = parentView.renderChildFees();
if (!childFeesHtml.includes("5,000.00") || !childFeesHtml.includes("2,000.00") || !childFeesHtml.includes("REF-TEST-99")) {
    throw new Error("FAIL: Child fees view did not render correct fee breakdown or receipt ref!");
}
console.log("✅ PASS: Parent Child Fees view accurately displays breakdown and verified payment receipts.");


console.log("\n[TEST 4] Real-Time Updates Synchronization...");
refreshCalled = false;
store.set("fees", fees);
if (!refreshCalled) {
    throw new Error("FAIL: store.set('fees') did not trigger refreshActiveViews!");
}

refreshCalled = false;
store.set("enrollments", []);
if (!refreshCalled) {
    throw new Error("FAIL: store.set('enrollments') did not trigger refreshActiveViews!");
}
console.log("✅ PASS: store.set triggers real-time updates across system views.");

console.log("\n🎉 ALL UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!");
