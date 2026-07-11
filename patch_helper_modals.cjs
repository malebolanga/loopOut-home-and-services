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

  // 1. Inject import
  if (!content.includes('ServiceDetailsModal')) {
    content = content.replace(/(import .*?;?\n)/, "$1import ServiceDetailsModal from '../components/ServiceDetailsModal';\n");
  }

  // 2. Inject state
  // Look for the component declaration
  const componentMatch = content.match(/const (HelperPage|BarberPage|BeautyPage|ChefPage|PhotographyHelperPage|PrivateTutor|TattooPage) = \([^\)]*\) => \{\n/);
  if (componentMatch && !content.includes('selectedModalService')) {
    content = content.replace(
      componentMatch[0],
      componentMatch[0] + "  const [selectedModalService, setSelectedModalService] = useState(null);\n"
    );
  }

  // 3. Replace onClick on service cards
  content = content.replace(
    /onClick=\{\(\) => handleServiceSelection\(service\.id\)\}/g,
    "onClick={() => setSelectedModalService(service)}"
  );

  // 4. Inject modal at the bottom (just before closing div/return)
  // These files end with:
  //         )}
  //       </AnimatePresence>
  //     </div>
  //   );
  // };
  if (!content.includes('<ServiceDetailsModal')) {
    content = content.replace(
      /      <\/AnimatePresence>\n    <\/div>\n  \);\n\};/g,
      `      </AnimatePresence>

      <ServiceDetailsModal
        service={selectedModalService}
        isSelected={selectedModalService && bookingData.selectedServices.includes(selectedModalService.id)}
        onClose={() => setSelectedModalService(null)}
        onSelect={(id) => handleServiceSelection(id)}
      />
    </div>
  );
};`
    );
  }

  fs.writeFileSync(page, content, 'utf8');
}
console.log('Done patching 7 Helper pages!');
