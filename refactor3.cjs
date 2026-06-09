const fs = require('fs');

const path = 'c:/loopOut-home-and-services/client/src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

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
    content = content.substring(0, startIndex) + content.substring(endIndex);
    console.log(`Successfully removed section starting with ${startString.substring(0, 30)}`);
}

// Remove the contiguous block from NeuralPicksSection down to WeeklySpecialsSection
// It starts at "const NeuralPicksSection =" and ends right before "const MobileAppHomepage ="

removeSection('const NeuralPicksSection = ({ navigate }) => {', 'const MobileAppHomepage = ({');

// Add imports
const importString = `
import { 
  NeuralPicksSection, 
  SellItemsSection, 
  SmartRecommendations, 
  ServicesToYourDoor, 
  WeeklySpecialsSection 
} from '../components/home/HomeSections';
`;

// Insert after the first import block
const insertIndex = content.indexOf('import { TOP_CATEGORIES }');
if (insertIndex !== -1) {
    content = content.substring(0, insertIndex) + importString + content.substring(insertIndex);
}

fs.writeFileSync(path, content);
console.log("Refactoring complete");
