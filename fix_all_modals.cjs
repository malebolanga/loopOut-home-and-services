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

  // 1. Ensure import
  if (!content.includes('import ServiceDetailsModal')) {
    content = content.replace(/(import .*?;?\r?\n)/, "$1import ServiceDetailsModal from '../components/ServiceDetailsModal';\n");
  }

  // 2. Revert the second onClick (in the booking form)
  // We can find the second occurrence of `onClick={() => setSelectedModalService(service)}`
  // and replace it with `onClick={() => handleServiceSelection(service.id)}`.
  let parts = content.split('onClick={() => setSelectedModalService(service)}');
  if (parts.length === 3) {
    // 2 occurrences
    content = parts[0] + 'onClick={() => setSelectedModalService(service)}' + parts[1] + 'onClick={() => handleServiceSelection(service.id)}' + parts[2];
  }

  // 3. Inject the modal if not present
  if (!content.includes('<ServiceDetailsModal')) {
    const modalJSX = `
      <ServiceDetailsModal
        service={selectedModalService}
        isSelected={selectedModalService && bookingData.selectedServices.includes(selectedModalService.id)}
        onClose={() => setSelectedModalService(null)}
        onSelect={(id) => handleServiceSelection(id)}
      />
      </AnimatePresence>`;
    
    // Replace the LAST </AnimatePresence> with our modal + </AnimatePresence>
    const lastIndex = content.lastIndexOf('</AnimatePresence>');
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + modalJSX + content.substring(lastIndex + '</AnimatePresence>'.length);
    }
  }

  fs.writeFileSync(page, content, 'utf8');
  console.log('Fixed', page);
}
