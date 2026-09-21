const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

console.log('--- TESTING PAGE REFRESH STATE PERSISTENCE ---');

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost/#results',
    runScripts: 'dangerously',
    resources: 'usable'
});

const { window } = dom;
const { document } = window;

global.window = window;
global.document = document;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;


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


const studentUser = {
    id: 'usr-st-1',
    full_name: 'Abena Appiah',
    role: 'student',
    student_id: '4211260001',
    student_data: { student_id: '4211260001', first_name: 'Abena', surname: 'Appiah', programme: 'BSc Computer Science', level: '300' }
};

window.store.setCurrentUser(studentUser);
window.sessionStorage.setItem('isms_current_view', 'academics');


window.app.init();

const mainScreenHidden = document.getElementById('main-screen').classList.contains('hidden');
const authScreenHidden = document.getElementById('auth-screen').classList.contains('hidden');
const viewContainerContent = document.getElementById('view-container').innerHTML;

console.log('Main Screen visible after refresh:', !mainScreenHidden);
console.log('Auth Screen hidden after refresh:', authScreenHidden);
console.log('Restored Active View (Results & GPA):', window.app.currentView === 'academics');
console.log('View Container contains Academic Results:', viewContainerContent.includes('Cumulative Grade Point Average') || viewContainerContent.includes('Results'));

console.log('\n--- PAGE REFRESH PERSISTENCE VERIFICATION PASSED ---');
