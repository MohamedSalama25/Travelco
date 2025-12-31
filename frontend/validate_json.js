const fs = require('fs');
const path = require('path');

const files = [
    'd:\\FRONT_PROJECTS\\Travelco\\frontend\\messages\\en.json',
    'd:\\FRONT_PROJECTS\\Travelco\\frontend\\messages\\ar.json'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${path.basename(file)} is valid JSON`);
    } catch (e) {
        console.error(`❌ ${path.basename(file)} has syntax error:`, e.message);
    }
});
