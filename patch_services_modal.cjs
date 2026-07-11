const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Services.jsx', 'utf8');

// 1. Inject import
if (!content.includes('ServiceDetailsModal')) {
  content = content.replace(/(import .*?;?\n)/, "$1import ServiceDetailsModal from '../components/ServiceDetailsModal';\n");
}

// 2. Inject state
const componentMatch = content.match(/const ServicePage = \(\) => \{\n/);
if (componentMatch && !content.includes('selectedModalService')) {
  content = content.replace(
    componentMatch[0],
    componentMatch[0] + "  const [selectedModalService, setSelectedModalService] = useState(null);\n"
  );
}

// 3. Replace onClick on service cards
content = content.replace(
  /onClick=\{\(\) => setSelectedService\(option\)\}/g,
  "onClick={() => setSelectedModalService(option)}"
);

// 4. Inject modal at the bottom (just before closing div/return)
if (!content.includes('<ServiceDetailsModal')) {
  content = content.replace(
    /      <\/AnimatePresence>\n    <\/div>\n  \);\n\};/g,
    `      </AnimatePresence>

      <ServiceDetailsModal
        service={selectedModalService}
        isSelected={selectedModalService && selectedService?.id === selectedModalService.id}
        onClose={() => setSelectedModalService(null)}
        onSelect={(id) => {
          setSelectedService(selectedModalService);
        }}
      />
    </div>
  );
};`
  );
}

fs.writeFileSync('client/src/pages/Services.jsx', content, 'utf8');
console.log('Done patching Services.jsx!');
