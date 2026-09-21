global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};
global.window = {
    app: { refreshActiveViews() { } }
};

const fs = require('fs');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync('js/store.js', 'utf8'));

console.log("=== 1. Initial State Scoping Test ===");
const student300Morning = { student_id: '4211260001', level: '300', session: 'Morning' };
const student100Evening = { student_id: 'STU1001', level: '100', session: 'Evening' };
const student200Weekend = { student_id: 'STU2001', level: '200', session: 'Weekend' };

const cats300 = store.getFeeCategoriesForStudent(student300Morning);
console.log("Level 300 Morning Categories Count:", cats300.length);

const cats100 = store.getFeeCategoriesForStudent(student100Evening);
console.log("Level 100 Evening Categories Count:", cats100.length);

console.log("\n=== 2. Admin Adds Level 300 Morning Fee Category ===");
const feeCategories = store.get('fee_categories') || [];
const newCat = {
    id: 'fc-cs300-lab',
    name: 'Advanced CS Laboratory & Systems Fee',
    code: 'FEE-CS300-LAB',
    amount: 600.00,
    level: 'Level 300',
    session: 'Morning',
    status: 'Active'
};
feeCategories.push(newCat);
store.set('fee_categories', feeCategories);

const updated300 = store.getFeeCategoriesForStudent(student300Morning);
const updated100 = store.getFeeCategoriesForStudent(student100Evening);
const updated200 = store.getFeeCategoriesForStudent(student200Weekend);

const has300 = updated300.some(c => c.id === 'fc-cs300-lab');
const has100 = updated100.some(c => c.id === 'fc-cs300-lab');
const has200 = updated200.some(c => c.id === 'fc-cs300-lab');

console.log("Visible in Level 300 Morning Student View:", has300 ? "YES (Correct)" : "NO (ERROR)");
console.log("Visible in Level 100 Evening Student View:", has100 ? "YES (ERROR)" : "NO (Correct)");
console.log("Visible in Level 200 Weekend Student View:", has200 ? "YES (ERROR)" : "NO (Correct)");

console.log("\n=== 3. Student Balance Calculation ===");
const balance300 = store.calculateStudentFeeBalance('4211260001');
console.log("Student 4211260001 Total Fee:", balance300.total_amount);
console.log("Student 4211260001 Paid Amount:", balance300.paid_amount);
console.log("Student 4211260001 Balance Due:", balance300.balance_due);
console.log("Student 4211260001 Payment Status:", balance300.status);
console.log("Assigned Categories to Student:", balance300.assigned_categories.map(c => `${c.code} (${c.name}) - GHS ${c.amount}`).join(" | "));

if (has300 && !has100 && !has200) {
    console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! Level & Session Scoping Verified. <<<");
} else {
    console.error("\n>>> FAILED: Scoping test failed! <<<");
    process.exit(1);
}
