const fs = require('fs');

const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v ? v.toString() : ''; },
    removeItem(k) { delete this._data[k]; }
};

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;

const formInputs = {
    "acad-act-title": { value: "Test Mid-Sem Exam Window 2026", trim() { return this.value; } },
    "acad-act-sdate": { value: "2026-10-15" },
    "acad-act-edate": { value: "2026-10-25" },
    "acad-act-scope": { value: "All Students & Faculty" },
    "acad-act-desc": { value: "Mid-semester examination timetable released.", trim() { return this.value; } }
};

global.document = {
    querySelectorAll() { return []; },
    getElementById(id) { return formInputs[id] || null; },
    documentElement: { setAttribute() {} },
    addEventListener() {}
};

global.window = global;
global.Chart = class Chart {};
global.PaystackPop = {};

let storeCode = fs.readFileSync('js/store.js', 'utf8').replace('const store = new Store();', 'global.store = new Store();');
let adminViewCode = fs.readFileSync('js/views/adminView.js', 'utf8').replace('const adminView =', 'global.adminView =');
let appCode = fs.readFileSync('js/app.js', 'utf8').replace('const app = new App();', 'global.app = new App();');

eval(fs.readFileSync('js/config.js', 'utf8'));
eval(storeCode);
eval(fs.readFileSync('js/validators.js', 'utf8'));
eval(fs.readFileSync('js/pdfHelper.js', 'utf8'));
eval(adminViewCode);
eval(appCode);

global.app.closeModal = () => {};
global.app.showToast = (msg) => console.log("[TOAST]", msg);

console.log("=== TESTING ACADEMIC CALENDAR PUBLISHING & LIVE SYNC ===");

const initialEvents = global.store.get("academic_events");
console.log("Initial Live Events Count:", initialEvents.length);

// Simulate Admin publishing new activity
const fakeEvent = { preventDefault() {} };
global.adminView.saveAcademicActivity(fakeEvent);

const updatedEvents = global.store.get("academic_events");
console.log("Updated Live Events Count after Publish:", updatedEvents.length);
console.log("Latest Published Event:", updatedEvents[0]);

if (updatedEvents.length > initialEvents.length && updatedEvents[0].title === "Test Mid-Sem Exam Window 2026") {
    console.log("SUCCESS: NEW ACADEMIC ACTIVITY REFLECTS ON LIVE CALENDAR!");
} else {
    console.error("FAILURE: NEW ACADEMIC ACTIVITY WAS NOT REFLECTED ON LIVE CALENDAR.");
    process.exit(1);
}
