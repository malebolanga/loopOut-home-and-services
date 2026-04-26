import fs from 'fs';

const filePath = 'c:\\loopOut-home-and-services\\client\\src\\pages\\Services.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleEscrowCheckout function
const functionToInject = `  const handleEscrowCheckout = async () => {
    if (!currentUser) {
      window.location.href = '/sign-in';
      return;
    }
    try {
      setIsUploading(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           userId: currentUser._id,
           amount: totalPrice,
           name: currentUser.username,
           email: currentUser.email,
           serviceId: service._id,
           providerName: service.name
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
         setIsUploading(false);
      }
    } catch(err) {
      console.error(err);
      setIsUploading(false);
    }
  };

`;

if (!content.includes('const handleEscrowCheckout')) {
    content = content.replace('if (loading) {', functionToInject + '  if (loading) {');
}

// 2. Update Button
const oldButton = `                <button
                  onClick={() => openBookingModal()}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-4"
                >
                  Check availability
                </button>`;

const newButtons = `                <button
                  onClick={() => openBookingModal()}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-2"
                >
                  Book via WhatsApp
                </button>

                <button
                  onClick={handleEscrowCheckout}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
                >
                  <FaShieldAlt className="w-4 h-4" />
                  Pay with Secure Escrow
                </button>`;

// Use regex to be more flexible with whitespace
const buttonRegex = /<button\s+onClick=\{\(\)\s+=>\s+openBookingModal\(\)\}\s+className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors mb-4"\s*>\s*Check availability\s*<\/button>/;

content = content.replace(buttonRegex, newButtons);

fs.writeFileSync(filePath, content);
console.log('Successfully updated Services.jsx');
