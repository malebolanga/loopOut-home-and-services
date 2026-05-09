import fs from 'fs';

let rawContent = fs.readFileSync('client/src/pages/CreateListing.jsx');
let isUTF16 = false;

// Check for BOM
if (rawContent[0] === 0xFF && rawContent[1] === 0xFE) {
  isUTF16 = true;
} else if (rawContent[0] === 0xFE && rawContent[1] === 0xFF) {
  isUTF16 = true;
}

let content = fs.readFileSync('client/src/pages/CreateListing.jsx', isUTF16 ? 'utf16le' : 'utf8');

// Normalize line endings to \n for easier regex
content = content.replace(/\r\n/g, '\n');

console.log("File length before edits: " + content.split('\n').length);

// 1. Remove errand and washingmat
content = content.replace(/.*\{ id: "errand".*\n/g, '');
content = content.replace(/.*\{ id: "washingmat".*\n/g, '');

// 2. Remove Mat Washer specific fields logic
// Replace placeholders
content = content.replace(/.*selectedType === 'washingmat'.*\n/g, '');

// Remove the Mat Washer Specific Fields block (from {/* Mat Washer Specific Fields */} to the closing )})
// The block is around 1883 and 2574
const matWasherComment = '{/* Mat Washer Specific Fields */}';
let matIndex = content.indexOf(matWasherComment);
while (matIndex !== -1) {
  let endIndex = content.indexOf(')}', matIndex + 100);
  if (endIndex !== -1) {
    content = content.slice(0, matIndex) + content.slice(endIndex + 2);
  }
  matIndex = content.indexOf(matWasherComment);
}

// Also remove the second block if it didn't have the comment
// It's like {selectedCategory === 'online' && selectedType === 'washingmat' && (
const matBlock2 = "{selectedCategory === 'online' && selectedType === 'washingmat' && (";
let matIndex2 = content.indexOf(matBlock2);
while (matIndex2 !== -1) {
  let endIndex = content.indexOf(')}', matIndex2 + 100);
  if (endIndex !== -1) {
    content = content.slice(0, matIndex2) + content.slice(endIndex + 2);
  }
  matIndex2 = content.indexOf(matBlock2);
}

console.log("File length after removing categories: " + content.split('\n').length);

// 3. Update the Steps Array
const oldStepsArray = `  const steps = [
    { label: "Category", icon: MapIcon },
    { label: "Type", icon: TagIcon },
    { label: "Details", icon: InformationCircleIcon },
    { label: "Hours", icon: ClockIcon },
    { label: "Features", icon: Sparkles },
    { label: "Media", icon: CameraIcon },
    { label: "Review", icon: CheckCircleIcon }
  ];`;

const newStepsArray = `  const steps = [
    { label: "Category", icon: MapIcon },
    { label: "Type", icon: TagIcon },
    { label: "Details", icon: InformationCircleIcon },
    { label: "Hours", icon: ClockIcon },
    { label: "Services", icon: UserGroupIcon },
    { label: "Features", icon: Sparkles },
    { label: "Media", icon: CameraIcon },
    { label: "Review", icon: CheckCircleIcon }
  ];`;

content = content.replace(oldStepsArray, newStepsArray);

// 4. Update the step numbers
content = content.replace(/\{currentStep === 7 && \(/g, '{currentStep === 8 && (');
content = content.replace(/\{currentStep === 6 && \(/g, '{currentStep === 7 && (');
content = content.replace(/\{currentStep === 5 && \(/g, '{currentStep === 6 && (');

// 5. Separate out Services & Performers
const teamIndex = content.indexOf('{/* Service Team / Performers */}');
if (teamIndex !== -1) {
  const injection = `
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Step 5: Services & Performers */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <SectionCard title="Services & Performers">
                  <div className="space-y-10">
`;
  content = content.slice(0, teamIndex) + injection + content.slice(teamIndex);
}

// Convert back to \r\n if on Windows
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync('client/src/pages/CreateListing.jsx', content, isUTF16 ? 'utf16le' : 'utf8');
console.log("File length after all edits: " + content.split('\r\n').length);

