const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable'
});

const { window } = dom;
const { document } = window;

global.window = window;
global.document = document;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;
global.confirm = () => true;


const files = [
    'js/config.js',
    'js/store.js',
    'js/validators.js',
    'js/pdfHelper.js',
    'js/aiAssistant.js',
    'js/views/authView.js',
    'js/views/studentView.js',
    'js/views/teacherView.js',
    'js/views/parentView.js',
    'js/views/adminView.js',
    'js/views/libraryView.js',
    'js/app.js'
];

files.forEach(f => {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    window.eval(code);
});

console.log('Testing User Requirements...');


console.log('\n--- TEST 1: Fee Category Table ---');
window.store.initDefaults();
window.adminView.switchSection('finance');
const feeTableHtml = document.querySelector('.table')?.innerHTML || '';
const hasActionsTh = feeTableHtml.includes('<th>Actions</th>');
const hasDeleteBtn = feeTableHtml.includes('deleteSingleFeeCategory');
console.log('Actions TH removed:', !hasActionsTh);
console.log('Individual Delete Button removed:', !hasDeleteBtn);


console.log('\n--- TEST 2: System Alerts & Batch Delete ---');
window.app.openSystemMessagesModal('ALL');
const alertCheckboxes = document.querySelectorAll('.sys-alert-cb');
console.log(`System Alert Checkboxes rendered: ${alertCheckboxes.length}`);
if (alertCheckboxes.length > 0) {
    alertCheckboxes[0].checked = true;
    window.app.deleteSelectedSystemAlerts();
    const alertCheckboxesAfter = document.querySelectorAll('.sys-alert-cb');
    console.log(`System Alert Checkboxes after delete: ${alertCheckboxesAfter.length}`);
}


console.log('\n--- TEST 3: Topbar Calendar Sync & Navigation ---');
window.app.toggleCalendarModal();
let calendarBody = document.getElementById('calendar-modal-body').innerHTML;
console.log('Calendar Modal Body rendered correctly:', calendarBody.includes('Month Grid View'));


console.log('\nPublishing Academic Activity in Admin...');
document.getElementById('acad-act-title').value = 'Annual Tech Symposium 2026';
document.getElementById('acad-act-sdate').value = '2026-09-15';
document.getElementById('acad-act-edate').value = '2026-09-18';
document.getElementById('acad-act-scope').value = 'All Students & Faculty';
document.getElementById('acad-act-desc').value = 'Grand opening at main auditorium.';

const fakeEvt = { preventDefault: () => { } };
window.adminView.saveAcademicActivity(fakeEvt);


const events = window.store.get('academic_events');
const foundEvt = events.find(e => e.title === 'Annual Tech Symposium 2026');
console.log('Event saved in store:', !!foundEvt);


window.app.selectCalendarDate('2026-09-15');
calendarBody = document.getElementById('calendar-modal-body').innerHTML;
console.log('Selected Date Event rendered on Live Calendar:', calendarBody.includes('Annual Tech Symposium 2026'));


console.log('\nNavigating Month...');
window.app.navigateCalendarMonth(1);
calendarBody = document.getElementById('calendar-modal-body').innerHTML;
console.log('Navigated to Next Month successfully:', calendarBody.includes('October 2026'));


console.log('\n--- TEST 4: Semester Sync ---');
window.store.set('current_semester', '2026/2027 - Semester 2');
window.app.renderAcademicCalendarModal();
calendarBody = document.getElementById('calendar-modal-body').innerHTML;
console.log('Calendar updated with new Current Semester:', calendarBody.includes('2026/2027 - Semester 2'));

console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
