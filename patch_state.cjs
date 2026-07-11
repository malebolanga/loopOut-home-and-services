const fs = require('fs');

const pages = [
  'client/src/pages/HelperPage.jsx',
  'client/src/pages/BarberPage.jsx',
  'client/src/pages/BeautyPage.jsx',
  'client/src/pages/ChefPage.jsx',
  'client/src/pages/PhotographyHelperPage.jsx',
  'client/src/pages/PrivateTutor.jsx',
  'client/src/pages/TattooPage.jsx'
];

for (const page of pages) {
  let content = fs.readFileSync(page, 'utf8');

  // Regex to match the component declaration exactly
  const componentMatch = content.match(/export default function \w+\(\) \{\n/);
  
  if (componentMatch && !content.includes('selectedModalService = useState')) {
    content = content.replace(
      componentMatch[0],
      componentMatch[0] + "  const [selectedModalService, setSelectedModalService] = useState(null);\n"
    );
    fs.writeFileSync(page, content, 'utf8');
    console.log('Patched', page);
  } else {
    console.log('Skipped', page);
  }
}
