
import fs from 'fs';
const content = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');
const lines = content.split('\n');
lines.splice(2049, 1); // Remove line 2050 (0-indexed 2049)
fs.writeFileSync('client/src/pages/CreateListing.jsx', lines.join('\n'));
