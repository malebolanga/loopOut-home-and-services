import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.join(__dirname, 'client/src/components');
const items = ['ListingItem.jsx', 'ServiceItem.jsx', 'HelperItem.jsx'];

for (const file of items) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the extra closing brace on the comment block
    content = content.replace(/\{\/\* Top Overlays \*\/\}\}/g, "{/* Top Overlays */}");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[FIXED BRACES] ${file}`);
  }
}
