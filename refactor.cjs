const fs = require('fs');

const path = 'c:/loopOut-home-and-services/client/src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Remove AirbnbCard and AirbnbCardSkeleton (lines 714 to 876)
// Arrays are 0-indexed, so lines 713 to 875
lines.splice(713, 164); // 876 - 714 + 1 = 163 lines. Wait, let's be careful.

// Better to search for the exact strings to be robust
const startIndex = lines.findIndex(line => line.includes('const AirbnbCard = ({ item'));
const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes('const CategoryFilter = '));

if (startIndex !== -1 && endIndex !== -1) {
    // Delete from startIndex up to (endIndex - 1)
    lines.splice(startIndex, endIndex - startIndex);
} else {
    console.log("Could not find AirbnbCard to remove");
}

// Add import
const importIndex = lines.findIndex(line => line.includes('import ForSale from \'./ForSale\';'));
if (importIndex !== -1) {
    lines.splice(importIndex + 1, 0, 'import { AirbnbCard, AirbnbCardSkeleton } from \'../components/home/AirbnbCard\';');
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Refactoring complete");
