
import fs from 'fs';

const content = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');
const lines = content.split('\n');
const step3 = lines.slice(1645, 2054).join('\n');

const tags = [];
const regex = /<(\/?[a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;
let match;

while ((match = regex.exec(step3)) !== null) {
    const tag = match[1];
    const isSelfClosing = match[3] === '/';
    
    if (tag.startsWith('/')) {
        const last = tags.pop();
        if (last !== tag.slice(1)) {
            console.log(`Mismatch: Expected </${last}> but found <${tag}>`);
        }
    } else if (!isSelfClosing) {
        if (!['img', 'input', 'br', 'hr'].includes(tag)) {
            tags.push(tag);
        }
    }
}

console.log('Remaining tags:', tags);
