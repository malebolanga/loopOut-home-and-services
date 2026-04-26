import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  'api/models/listing.model.js',
  'api/models/helper.model.js',
  'api/models/service.model.js'
];

for (const model of models) {
   const fPath = path.join(__dirname, model);
   if (fs.existsSync(fPath)) {
      let content = fs.readFileSync(fPath, 'utf8');
      
      // Fix syntax error of missing comma
      content = content.replace(/\n\s*bookingsCount: \{ type: Number, default: 0 \}/g, ",\n    bookingsCount: { type: Number, default: 0 }");
      
      // Fix double comma if it happened somehow
      content = content.replace(/,(\s*),(\s*)bookingsCount/g, ",$2bookingsCount");
      
      fs.writeFileSync(fPath, content, 'utf8');
   }
}
console.log("Fixed missing commas");
