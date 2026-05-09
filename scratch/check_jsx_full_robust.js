
import fs from 'fs';

const content = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');
const lines = content.split('\n');

const stack = [];
const regex = /<(\/?[a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;
let match;

const selfClosing = ['img', 'input', 'br', 'hr', 'FormInput', 'AmenityCard', 'ArrowRightIcon', 'MapIcon', 'TagIcon', 'InformationCircleIcon', 'ClockIcon', 'Sparkles', 'CameraIcon', 'CheckCircleIcon', 'XMarkIcon', 'PlusIcon', 'UserIcon', 'PhoneIcon', 'MapPinIcon', 'MutualFriends', 'CategoryCard', 'TypeCard', 'ChevronLeftIcon', 'ChevronRightIcon', 'StarIcon', 'HomeModernIcon', 'BuildingOfficeIcon', 'CurrencyDollarIcon', 'MinusIcon', 'QuestionMarkCircleIcon', 'Users', 'ArrowLeftIcon', 'CreditCardIcon', 'DevicePhoneMobileIcon', 'BuildingLibraryIcon', 'TruckIcon', 'ScissorsIcon', 'CakeIcon', 'PhotoIcon', 'AcademicCapIcon', 'ShieldCheckIcon', 'ExclamationTriangleIcon', 'KeyIcon', 'HeartIcon', 'BeakerIcon', 'BookOpenIcon', 'CustomHeartIcon'];

const trackedTags = ['div', 'SectionCard', 'AnimatePresence', 'motion.div', 'button', 'label', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'form', 'main', 'header', 'footer', 'ul', 'li', 'textarea', 'option', 'select', 'svg', 'motion.button'];

let lineNum = 0;
for (const line of lines) {
    lineNum++;
    while ((match = regex.exec(line)) !== null) {
        const tag = match[1];
        const isSelfClosing = match[3] === '/' || selfClosing.includes(tag);
        
        if (tag.startsWith('/')) {
            const tagName = tag.slice(1);
            if (stack.length === 0) {
                console.log(`Error at line ${lineNum}: Found </${tagName}> but stack is empty`);
                continue;
            }
            const last = stack.pop();
            if (last.tag !== tagName) {
                console.log(`Mismatch at line ${lineNum}: Expected </${last.tag}> (from line ${last.line}) but found <${tag}>`);
            }
        } else if (!isSelfClosing) {
            if (trackedTags.includes(tag)) {
                stack.push({ tag, line: lineNum });
            }
        }
    }
}

console.log('Remaining tags in stack:', stack);
