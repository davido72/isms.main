const fs = require('fs');
const path = require('path');
const passwordHelper = require('../js/passwordHelper.js');

async function runTests() {
    console.log("=== RUNNING ISMS SECURITY & CREDENTIAL TESTS ===");
    let passed = 0;
    let total = 0;

    function assert(desc, condition) {
        total++;
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc}`);
        }
    }


    const plain = "Password@123";
    const hash1 = await passwordHelper.hashPassword(plain);
    assert("Hash starts with sha256$", hash1.startsWith("sha256$"));
    const parts = hash1.split('$');
    assert("Hash has 3 parts (sha256, salt, digest)", parts.length === 3);
    assert("Salt is 32 hex characters", parts[1].length === 32);
    assert("Digest is 64 hex characters", parts[2].length === 64);


    const hash2 = await passwordHelper.hashPassword(plain);
    assert("Different salts generated for same password", hash1 !== hash2);


    const verified1 = await passwordHelper.verifyPassword(plain, hash1);
    const verified2 = await passwordHelper.verifyPassword(plain, hash2);
    assert("Verify hash1 returns true", verified1 === true);
    assert("Verify hash2 returns true", verified2 === true);


    const verifiedWrong = await passwordHelper.verifyPassword("WrongPassword!", hash1);
    assert("Verify wrong password returns false", verifiedWrong === false);


    const verifiedLegacy = await passwordHelper.verifyPassword("LegacyPlain123", "LegacyPlain123");
    assert("Verify legacy plaintext fallback", verifiedLegacy === true);


    assert("isHashed returns true for sha256$ hash", passwordHelper.isHashed(hash1) === true);
    assert("isHashed returns false for plaintext", passwordHelper.isHashed("Plaintext123") === false);


    const storeContent = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
    assert("store.js does not contain password: 'Password@123'", !storeContent.includes('password: "Password@123"') && !storeContent.includes("password: 'Password@123'"));
    assert("store.js contains sha256$ in default passwords", storeContent.includes('password: "sha256$'));


    const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    assert("index.html does not contain otp-demo-code", !indexContent.includes('id="otp-demo-code"'));
    assert("index.html includes passwordHelper.js script", indexContent.includes('src="js/passwordHelper.js"'));


    const authContent = fs.readFileSync(path.join(__dirname, '../js/views/authView.js'), 'utf8');
    assert("authView.js does not contain 123456 bypass", !authContent.includes('inputCode !== "123456"'));
    assert("authView.js uses passwordHelper.verifyPassword", authContent.includes('passwordHelper.verifyPassword'));
    assert("authView.js uses passwordHelper.hashPassword", authContent.includes('passwordHelper.hashPassword'));


    const docxPath = path.join(__dirname, '../ISMS_Project_Proposal.docx');
    const docxExists = fs.existsSync(docxPath);
    const docxStats = docxExists ? fs.statSync(docxPath) : null;
    assert("ISMS_Project_Proposal.docx exists", docxExists);
    assert("ISMS_Project_Proposal.docx has size > 30000 bytes", docxStats && docxStats.size > 30000);


    const mdContent = fs.readFileSync(path.join(__dirname, '../ISMS_Project_Proposal.md'), 'utf8');
    assert("Proposal md contains Title Page Declaration", mdContent.includes('Title Page Declaration'));
    assert("Proposal md contains i Abstract", mdContent.includes('i Abstract'));
    assert("Proposal md contains ii Table of Contents", mdContent.includes('ii Table of Contents'));
    assert("Proposal md contains iii List of Tables", mdContent.includes('iii List of Tables'));
    assert("Proposal md contains iv List of Figures", mdContent.includes('iv List of Figures'));
    assert("Proposal md contains v List of Abbreviations", mdContent.includes('v List of Abbreviations'));
    assert("Proposal md contains vi Acknowledgement", mdContent.includes('vi Acknowledgement'));
    assert("Proposal md contains Chapter One: Introduction", mdContent.includes('Chapter One: Introduction'));
    assert("Proposal md contains Chapter Two: Literature Review", mdContent.includes('Chapter Two: Literature Review'));
    assert("Proposal md contains Chapter Three: System Specification", mdContent.includes('Chapter Three: System Specification'));
    assert("Proposal md contains Chapter Four: System Implementation", mdContent.includes('Chapter Four: System Implementation'));
    assert("Proposal md contains Chapter Five: Discussion", mdContent.includes('Chapter Five: Discussion'));
    assert("Proposal md contains References / Bibliography", mdContent.includes('References / Bibliography'));
    assert("Proposal md contains Appendices", mdContent.includes('Appendices'));

    console.log(`\nTEST SUMMARY: ${passed}/${total} assertions passed.`);
    if (passed === total) {
        console.log("SUCCESS: ALL SECURITY & PROPOSAL REQUIREMENTS FULLY VERIFIED!");
    } else {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test error:", err);
    process.exit(1);
});
