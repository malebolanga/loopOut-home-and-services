const fs = require('fs');

const path = 'c:/loopOut-home-and-services/client/src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// The file might use CRLF or LF, but `indexOf` on exact strings avoids line ending issues if we match a large unique substring.

function removeSection(startString, endString) {
    const startIndex = content.indexOf(startString);
    if (startIndex === -1) {
        console.log(`Could not find start: ${startString.substring(0, 30)}`);
        return;
    }
    const endIndex = content.indexOf(endString, startIndex);
    if (endIndex === -1) {
        console.log(`Could not find end: ${endString.substring(0, 30)}`);
        return;
    }
    
    // endIndex points to the start of the end string.
    content = content.substring(0, startIndex) + content.substring(endIndex);
    console.log(`Successfully removed section starting with ${startString.substring(0, 30)}`);
}

// 1. Remove TOP_CATEGORIES
removeSection('// --- TOP CATEGORIES DATA (Fresha Style) ---', 'const MOCK_PROPERTIES = [');

// 2. Remove TopCategoriesSection
removeSection('// --- FRESHA-STYLE TOP CATEGORIES SECTION ---', '// --- ELITE HELPER CARD ---');

// 3. Remove LoopOutHomeHero
removeSection('// --- PREMIUM LOOP OUT HERO (Redesigned: Sliding Neural Network) ---', '// --- AIRBNB-STYLE DISCOVER SECTION (SIDE-SLIDING & REDUCED SIZE) ---');

// 4. Add imports
const importString = `
import { TOP_CATEGORIES } from '../data/categories';
import { CategoriesSlider } from '../components/home/CategoriesSlider';
import { HomeHero } from '../components/home/HomeHero';
`;

// Insert after the first import block
const insertIndex = content.indexOf('import { AirbnbCard, AirbnbCardSkeleton }');
if (insertIndex !== -1) {
    content = content.substring(0, insertIndex) + importString + content.substring(insertIndex);
} else {
    // fallback
    const fbIndex = content.indexOf('import ForSale');
    content = content.substring(0, fbIndex) + importString + content.substring(fbIndex);
}

// 5. Rename references
// Replace <TopCategoriesSection navigate={navigate} /> with <CategoriesSlider navigate={navigate} TOP_CATEGORIES={TOP_CATEGORIES} />
content = content.replaceAll('<TopCategoriesSection navigate={navigate} />', '<CategoriesSlider navigate={navigate} TOP_CATEGORIES={TOP_CATEGORIES} />');

// Replace <LoopOutHomeHero navigate={navigate} /> with <HomeHero navigate={navigate} />
content = content.replaceAll('<LoopOutHomeHero navigate={navigate} />', '<HomeHero navigate={navigate} />');

fs.writeFileSync(path, content);
console.log("Refactoring complete");
