const fs = require('fs');

const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v ? v.toString() : ''; },
    removeItem(k) { delete this._data[k]; }
};

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;

global.document = {
    querySelectorAll() { return []; },
    getElementById() { return null; },
    documentElement: { setAttribute() {} },
    addEventListener() {}
};

global.window = global;
global.Chart = class Chart {};
global.PaystackPop = {};

let storeCode = fs.readFileSync('js/store.js', 'utf8').replace('const store = new Store();', 'global.store = new Store();');
let studentViewCode = fs.readFileSync('js/views/studentView.js', 'utf8').replace('const studentView =', 'global.studentView =');

eval(fs.readFileSync('js/config.js', 'utf8'));
eval(storeCode);
eval(fs.readFileSync('js/validators.js', 'utf8'));
eval(fs.readFileSync('js/pdfHelper.js', 'utf8'));
eval(studentViewCode);

console.log("=== TESTING STUDENT VIEW RENDER METHODS ===");

const student = global.store.get("students")[0];
console.log("Testing with Student:", student.student_id, student.full_name);

const views = [
    "renderDashboard",
    "renderCourseRegistration",
    "renderResults",
    "renderAttendance",
    "renderFees",
    "renderNotifications",
    "renderSettings"
];

let allSuccess = true;

views.forEach(v => {
    try {
        const html = global.studentView[v](student);
        console.log(`[SUCCESS] ${v}: rendered ${html ? html.length : 0} characters.`);
        if (!html || html.length < 50) {
            console.error(`[WARNING] ${v} returned short/empty content!`);
            allSuccess = false;
        }
    } catch (e) {
        console.error(`[ERROR] ${v} threw exception:`, e);
        allSuccess = false;
    }
});

if (allSuccess) {
    console.log("ALL 7 STUDENT VIEWS RENDERED WITH RICH CONTENT SUCCESSFULLY!");
} else {
    console.error("SOME STUDENT VIEWS FAILED TO RENDER PROPERLY.");
    process.exit(1);
}
