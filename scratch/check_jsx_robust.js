
import fs from 'fs';

const content = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');
const lines = content.split('\n');
const step3 = lines.slice(1645, 2054).join('\n');

const stack = [];
const regex = /<(\/?[a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;
let match;

const selfClosing = ['img', 'input', 'br', 'hr', 'FormInput', 'AmenityCard', 'ArrowRightIcon', 'MapIcon', 'TagIcon', 'InformationCircleIcon', 'ClockIcon', 'Sparkles', 'CameraIcon', 'CheckCircleIcon', 'XMarkIcon', 'PlusIcon', 'UserIcon', 'PhoneIcon', 'MapPinIcon', 'MutualFriends'];

while ((match = regex.exec(step3)) !== null) {
    const tag = match[1];
    const isSelfClosing = match[3] === '/' || selfClosing.includes(tag);
    
    if (tag.startsWith('/')) {
        const tagName = tag.slice(1);
        if (stack.length === 0) {
            console.log(`Error: Found </${tagName}> but stack is empty`);
            continue;
        }
        const last = stack.pop();
        if (last !== tagName) {
            console.log(`Mismatch: Expected </${last}> but found <${tag}>`);
        }
    } else if (!isSelfClosing) {
        stack.push(tag);
    }
}

console.log('Remaining tags in stack:', stack);
