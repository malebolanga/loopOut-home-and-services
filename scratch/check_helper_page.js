
import fs from 'fs';

const content = fs.readFileSync('client/src/pages/HelperPage.jsx', 'utf8');
const lines = content.split('\n');

const stack = [];
const regex = /<(\/?[a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;
let match;

const selfClosing = ['img', 'input', 'br', 'hr', 'FormInput', 'AmenityCard', 'ArrowRightIcon', 'MapIcon', 'TagIcon', 'InformationCircleIcon', 'ClockIcon', 'Sparkles', 'CameraIcon', 'CheckCircleIcon', 'XMarkIcon', 'PlusIcon', 'UserIcon', 'PhoneIcon', 'MapPinIcon', 'MutualFriends', 'CategoryCard', 'TypeCard', 'ChevronLeftIcon', 'ChevronRightIcon', 'StarIcon', 'HomeModernIcon', 'BuildingOfficeIcon', 'CurrencyDollarIcon', 'MinusIcon', 'QuestionMarkCircleIcon', 'Users', 'ArrowLeftIcon', 'CreditCardIcon', 'DevicePhoneMobileIcon', 'BuildingLibraryIcon', 'TruckIcon', 'ScissorsIcon', 'CakeIcon', 'PhotoIcon', 'AcademicCapIcon', 'ShieldCheckIcon', 'ExclamationTriangleIcon', 'KeyIcon', 'HeartIcon', 'BeakerIcon', 'BookOpenIcon', 'CustomHeartIcon', 'FaMapMarkerAlt', 'FaExternalLinkAlt', 'Marker', 'InfoWindow', 'FaTshirt', 'FaBroom', 'FaFire', 'FaBaby', 'FaGlassCheers', 'FaEllipsisH', 'FaPalette', 'FaSpa', 'FaStar', 'FaCut', 'FaGraduationCap', 'FaChalkboardTeacher', 'FaBook', 'FaLanguage', 'FaPencilAlt', 'FaHandsWash', 'FaToolbox', 'FaWrench', 'FaTools', 'FaScrewdriver', 'FaSnowflake', 'FaPlug', 'FaInstagram', 'FaFacebook', 'FaTwitter', 'FaLinkedin', 'FaTiktok', 'FaCamera', 'FaAward', 'FaBuilding', 'FaFileAlt', 'FaBriefcase', 'FaUserGraduate', 'FaTrophy', 'FaCertificate', 'FaHandSparkles', 'FaClock', 'FaCheckCircle', 'FaTrashAlt', 'FaLeaf', 'FaTruck', 'FaUser', 'FaPhone', 'FaWhatsapp', 'FaInfoCircle', 'FaShieldAlt', 'FaHandHoldingHeart', 'FaRing', 'FaBrush', 'FaSmile', 'FaUtensils', 'FaCookie', 'FaShoppingBasket', 'FaShoePrints', 'FaSoap', 'FaTint', 'FaWater', 'FaCogs', 'FaBath', 'FaSun', 'FaDog', 'FaPaw', 'FaFish', 'FaUserFriends', 'FaHome', 'FaCat', 'FaDove', 'FaHorse', 'FaArrowRight', 'FaSprayCan', 'FaWind', 'FaCar', 'ImageWithFallback', 'GoogleMapComponent', 'HelperComments', 'CommentsSidePanelHelper', 'HelperItem', 'SwiperSlide', 'StarIconSolid', 'HeartIconSolid', 'CheckBadgeIcon'];

const trackedTags = ['div', 'SectionCard', 'AnimatePresence', 'motion.div', 'button', 'label', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'form', 'main', 'header', 'footer', 'ul', 'li', 'textarea', 'option', 'select', 'svg', 'motion.button', 'Swiper', 'Link', 'motion.section', 'motion.span', 'motion.h3', 'motion.p', 'motion.h4'];

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
