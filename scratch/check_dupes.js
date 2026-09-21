const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const regex = /id="([^"]+)"/g;
let match;
const counts = {};

while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    counts[id] = (counts[id]) ? counts[id] + 1 : 1;
}

console.log('Duplicate IDs found in index.html:');
for (const [id, count] of Object.entries(counts)) {
    if (count > 1) {
        console.log(`- "${id}": ${count} times`);
    }
}
