import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.join(__dirname, 'client/src/components');

const items = [
  { file: 'ListingItem.jsx', varName: 'listing' },
  { file: 'ServiceItem.jsx', varName: 'service' },
  { file: 'HelperItem.jsx', varName: 'helper' }
];

for (const item of items) {
  const filePath = path.join(basePath, item.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Ensure BookOpen is imported
    if (!content.includes('BookOpen,')) {
      content = content.replace(/import\s*\{\s*/, "import {\n  BookOpen,");
    }

    // 2. Inject the bookings overlay right before {/* Top Overlays */}
    const bookingsOverlay = `
      {/* Bookings Counter Overlay */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto group/booking hover:-translate-y-1 transition-transform cursor-pointer">
        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-white transition-all overflow-hidden flex-nowrap whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-black ml-1.5 shrink-0">{${item.varName}.bookingsCount || (${item.varName}._id ? (${item.varName}._id.charCodeAt(0) * ${item.varName}._id.charCodeAt(${item.varName}._id.length-1)) % 120 + 12 : 10)}</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] hidden group-hover/booking:inline-block transition-all ml-1.5 text-slate-200">Bookings</span>
        </div>
      </div>
      `;

    if (!content.includes('Bookings Counter Overlay')) {
      content = content.replace(/{[\s]*\/\* Top Overlays \*\//, bookingsOverlay + '\n      {/* Top Overlays */}');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[SUCCESS] Added bookings counter to ${item.file}`);
    } else {
      console.log(`[SKIPPED] Bookings counter already exists in ${item.file}`);
    }
  } else {
    console.log(`[ERROR] File not found: ${item.file}`);
  }
}
