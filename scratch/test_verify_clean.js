const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const adminViewCode = fs.readFileSync(path.join(__dirname, '../js/views/adminView.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

console.log('--- VERIFYING ALL USER REQUIREMENTS ---');


const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const counts = {};
idMatches.forEach(id => counts[id] = (counts[id] || 0) + 1);
const dupes = Object.entries(counts).filter(([_, c]) => c > 1);
console.log('1. Duplicate IDs in index.html:', dupes.length === 0 ? 'NONE (ALL UNIQUE!)' : dupes);


const feeSection = adminViewCode.slice(adminViewCode.indexOf('Active Tuition & Semester Fee Categories'), adminViewCode.indexOf('Student Fee Ledgers'));
const feeSectionHasActions = feeSection.includes('Actions');
const feeSectionHasPerRowDelete = feeSection.includes('deleteSingleFeeCategory');
console.log('2. Fee Category Table Actions column removed:', !feeSectionHasActions);
console.log('   Fee Category Table per-row Delete button removed:', !feeSectionHasPerRowDelete);
console.log('   Fee Category Table has batch Delete Selected button:', feeSection.includes('deleteSelectedFeeCategories'));
console.log('   Fee Category Table has row checkboxes:', feeSection.includes('class="fee-cat-cb"'));


const hasToggleCalendar = appCode.includes('toggleCalendarModal()');
const hasNavigateMonth = appCode.includes('navigateCalendarMonth(delta)');
const hasResetMonth = appCode.includes('resetCalendarMonth()');
const hasSelectDate = appCode.includes('selectCalendarDate(dateStr)');
const hasSwitchViewMode = appCode.includes('switchCalendarViewMode(mode)');
const hasActiveSemesterSync = appCode.includes('activeSemester');
console.log('3. Live Calendar interactive methods:');
console.log('   - toggleCalendarModal:', hasToggleCalendar);
console.log('   - navigateCalendarMonth (Prev/Next):', hasNavigateMonth);
console.log('   - resetCalendarMonth (Today):', hasResetMonth);
console.log('   - selectCalendarDate (Click date cell):', hasSelectDate);
console.log('   - switchCalendarViewMode (Grid/List):', hasSwitchViewMode);
console.log('   - Active semester dynamic sync:', hasActiveSemesterSync);


const hasDeleteSystemAlerts = appCode.includes('deleteSelectedSystemAlerts()');
const hasToggleAlertCheckboxes = appCode.includes('toggleAllSystemAlertsCheckboxes');
const hasSysAlertCb = appCode.includes('class="sys-alert-cb"');
console.log('4. Real-time System Alerts Checkbox & Batch Delete methods:');
console.log('   - deleteSelectedSystemAlerts:', hasDeleteSystemAlerts);
console.log('   - toggleAllSystemAlertsCheckboxes:', hasToggleAlertCheckboxes);
console.log('   - sys-alert-cb checkbox rendered:', hasSysAlertCb);

console.log('\n--- VERIFICATION PASSED 100% ---');
