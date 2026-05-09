
import fs from 'fs';

const content = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');
const lines = content.split('\n');

const tags = [];
const regex = /<(\/?[a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;
let match;

let lineNum = 0;
for (const line of lines) {
    lineNum++;
    while ((match = regex.exec(line)) !== null) {
        const tag = match[1];
        const isSelfClosing = match[3] === '/' || ['img', 'input', 'br', 'hr', 'FormInput', 'AmenityCard', 'ArrowRightIcon', 'MapIcon', 'TagIcon', 'InformationCircleIcon', 'ClockIcon', 'Sparkles', 'CameraIcon', 'CheckCircleIcon', 'XMarkIcon', 'PlusIcon', 'UserIcon', 'PhoneIcon', 'MapPinIcon', 'MutualFriends', 'SectionCard', 'FormInput'].includes(tag);
        // Wait, SectionCard and FormInput are components I defined, I should check if they are self-closing or not.
        // In this file, SectionCard is NOT self-closing. FormInput IS self-closing.
        
        const actualSelfClosing = match[3] === '/';
        
        if (tag.startsWith('/')) {
            const last = tags.pop();
            if (last && last.tag !== tag.slice(1)) {
                console.log(`Mismatch at line ${lineNum}: Expected </${last.tag}> (from line ${last.line}) but found <${tag}>`);
            }
        } else if (!actualSelfClosing) {
            // Only push tags that have closing tags
            if (['div', 'SectionCard', 'AnimatePresence', 'motion.div', 'button', 'label', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'form', 'main', 'header', 'footer', 'ul', 'li', 'textarea'].includes(tag)) {
                tags.push({ tag, line: lineNum });
            }
        }
    }
}

console.log('Remaining tags:', tags);
