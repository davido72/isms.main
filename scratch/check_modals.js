const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*>/g;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
    count++;
    if (!match[0].includes('hidden')) {
        console.warn('MODAL MISSING HIDDEN CLASS:', match[0]);
    }
}
console.log('Total modals checked:', count);
