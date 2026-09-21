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
let teacherViewCode = fs.readFileSync('js/views/teacherView.js', 'utf8').replace('const teacherView =', 'global.teacherView =');

eval(fs.readFileSync('js/config.js', 'utf8'));
eval(storeCode);
eval(fs.readFileSync('js/validators.js', 'utf8'));
eval(fs.readFileSync('js/pdfHelper.js', 'utf8'));
eval(teacherViewCode);

console.log("=== TESTING TEACHER VIEW RENDER METHODS ===");

const teacher = global.store.get("teachers")[0];
console.log("Testing with Teacher:", teacher.staff_id, teacher.full_name);

const views = [
    "renderDashboard",
    "renderCourseEntry",
    "renderStudentList",
    "renderAttendanceManagement",
    "renderGradeEntry",
    "renderAnnouncements",
    "renderSettings"
];

let allSuccess = true;

views.forEach(v => {
    try {
        const html = global.teacherView[v](teacher);
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
    console.log("ALL TEACHER VIEWS RENDERED WITH RICH CONTENT SUCCESSFULLY!");
} else {
    console.error("SOME TEACHER VIEWS FAILED TO RENDER PROPERLY.");
    process.exit(1);
}
