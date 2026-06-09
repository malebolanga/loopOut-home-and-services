const fs = require('fs');
const files = [
  'client/src/pages/Home.jsx',
  'client/src/components/ListingItem.jsx',
  'client/src/components/ItemCard.jsx',
  'client/src/components/HelperItem.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/<img(?!.*loading=["']lazy["'])/g, '<img loading="lazy"');
    fs.writeFileSync(f, c);
    console.log('Processed', f);
  } else {
    console.log('Not found', f);
  }
});
