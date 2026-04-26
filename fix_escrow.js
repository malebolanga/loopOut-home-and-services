import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFiles = [
  'HelperPage.jsx', 'BarberPage.jsx', 'BeautyPage.jsx', 
  'ChefPage.jsx', 'PhotographyHelperPage.jsx', 'PrivateTutor.jsx', 
  'TattooPage.jsx', 'CarWashPage.jsx', 'Services.jsx'
];

const basePath = path.join(__dirname, 'client/src/pages');

for (const file of targetFiles) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace("Object.keys(data.payfast).forEach", "Object.keys(data.payfast.fields).forEach");
    content = content.replace("input.value = data.payfast[key];", "input.value = data.payfast.fields[key];");
    content = content.replace("form.action = 'https://www.payfast.co.za/eng/process';", "form.action = data.payfast.url;");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[FIXED]', file);
  }
}
