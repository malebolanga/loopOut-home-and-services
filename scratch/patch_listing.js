import fs from 'fs';

const filePath = 'c:\\loopOut-home-and-services\\client\\src\\pages\\Listing.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleEscrowCheckout function
// Find a good place to inject. After handleContactHost maybe?
const functionToInject = `
  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
      return;
    }
    try {
      setIsContacting(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           userId: currentUser._id,
           amount: listing.regularPrice, // Simple price for now
           name: currentUser.username,
           email: currentUser.email,
           serviceId: listing._id,
           providerName: listing.name
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = data.payfast.url;
         Object.keys(data.payfast.fields).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.payfast.fields[key];
            form.appendChild(input);
         });
         document.body.appendChild(form);
         form.submit();
      } else {
         console.error(data.message);
         setIsContacting(false);
      }
    } catch(err) {
      console.error(err);
      setIsContacting(false);
    }
  };
`;

if (!content.includes('const handleEscrowCheckout')) {
    // Inject at the end of the script part or near other handlers
    content = content.replace('const handleContactHost', functionToInject + '\n  const handleContactHost');
}

// 2. Add Button
const newButton = `
                <button
                  onClick={handleEscrowCheckout}
                  className="w-full mt-2 py-2 lg:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm lg:text-base shadow-sm"
                >
                  <FaShieldAlt className="text-base lg:text-xl" />
                  Pay Securely via Escrow
                </button>
`;

// Insert after the WhatsApp button
if (!content.includes('Pay Securely via Escrow')) {
    const wsButtonRegex = /<button\s+onClick=\{\(\)\s+=>\s+setShowBookingModal\(true\)\}[\s\S]*?<\/button>/;
    content = content.replace(wsButtonRegex, (match) => match + '\n' + newButton);
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated Listing.jsx');
