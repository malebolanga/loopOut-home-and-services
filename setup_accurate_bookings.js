import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addFieldToSchema(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('bookingsCount:')) {
        // Insert right before "timestamps: true" or at the end of the schema definition
        // Just inject into the schema after a known field, e.g., imageUrls or something.
        // Even simpler: replace "{ timestamps: true }" with "bookingsCount: { type: Number, default: 0 } }, { timestamps: true }"
        // Wait, the schema structure is `new mongoose.Schema({ ...fields... }, { timestamps: true })`.
        content = content.replace(/\},\s*\{\s*timestamps:\s*true\s*\}/, "  bookingsCount: { type: Number, default: 0 }\n  },\n  { timestamps: true }");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[UPDATED] ${path.basename(filePath)} schema added bookingsCount`);
    }
}

function removeMockDataFromComponent(filePath, varName) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Instead of the complex inline charCodeAt math, just use item.bookingsCount || 0
    const regex = new RegExp(`\\{${varName}\\.bookingsCount \\|\\| \\(${varName}\\._id \\? \\(${varName}\\._id\\.charCodeAt\\(0\\) \\* ${varName}\\._id\\.charCodeAt\\(${varName}\\._id\\.length-1\\)\\) % 120 \\+ 12 : 10\\)\\}`, 'g');
    
    if (content.match(regex)) {
        content = content.replace(regex, `{${varName}.bookingsCount || 0}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[REMOVED MOCK] cleaned up ${path.basename(filePath)}`);
    } else {
        // Try fallback regex if something slightly changed
        const fallbackRegex = new RegExp(`\\{${varName}\\.bookingsCount \\|\\| [^}]+?\\}`);
        content = content.replace(fallbackRegex, `{${varName}.bookingsCount || 0}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[REMOVED MOCK FALLBACK] cleaned up ${path.basename(filePath)}`);
    }
}

// 1. Add bookingsCount to schemas
addFieldToSchema(path.join(__dirname, 'api/models/listing.model.js'));
addFieldToSchema(path.join(__dirname, 'api/models/helper.model.js'));
addFieldToSchema(path.join(__dirname, 'api/models/service.model.js'));

// 2. Remove mock math from UI
removeMockDataFromComponent(path.join(__dirname, 'client/src/components/ListingItem.jsx'), 'listing');
removeMockDataFromComponent(path.join(__dirname, 'client/src/components/ServiceItem.jsx'), 'service');
removeMockDataFromComponent(path.join(__dirname, 'client/src/components/HelperItem.jsx'), 'helper');
removeMockDataFromComponent(path.join(__dirname, 'client/src/pages/Home.jsx'), 'item');

// 3. Update the booking controller to increment bookingsCount on creation
const controllerPath = path.join(__dirname, 'api/controllers/booking.js');
if (fs.existsSync(controllerPath)) {
    let bContent = fs.readFileSync(controllerPath, 'utf8');

    if (!bContent.includes('Listing.findByIdAndUpdate')) {
        const importAdditions = `
import Listing from '../models/listing.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
`;
        // Put imports after import Booking
        bContent = bContent.replace(/import Booking from '\.\.\/models\/Booking\.js';/, "import Booking from '../models/Booking.js';" + importAdditions);

        // Update counts when booking is saved
        bContent = bContent.replace(/await newBooking\.save\(\);/, `await newBooking.save();\n\n    // Increment bookingsCount for real data tracking\n    if (listingId) await Listing.findByIdAndUpdate(listingId, { $inc: { bookingsCount: 1 } });\n    if (helperId) await Helper.findByIdAndUpdate(helperId, { $inc: { bookingsCount: 1 } });\n    if (serviceId) await Service.findByIdAndUpdate(serviceId, { $inc: { bookingsCount: 1 } });`);
        
        fs.writeFileSync(controllerPath, bContent, 'utf8');
        console.log(`[UPDATED] API controller integrated real tracking`);
    }
}
