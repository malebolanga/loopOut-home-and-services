import fs from 'fs';

const filePath = 'c:\\loopOut-home-and-services\\client\\src\\pages\\EventPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleEscrowCheckout function
const functionToInject = `
  const handleEscrowCheckout = async () => {
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
           amount: (event.regularPrice || 0) * registrationData.quantity,
           name: currentUser.username,
           email: currentUser.email,
           serviceId: event._id,
           providerName: event.name
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
    content = content.replace('const handleRegistrationSubmit', functionToInject + '\n  const handleRegistrationSubmit');
}

// 2. Add Button to the registration overlay
const newButton = `
              <button 
                onClick={handleEscrowCheckout}
                disabled={isUploading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 mb-3"
              >
                {isUploading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    Pay via Secure Escrow
                  </>
                )}
              </button>
`;

if (!content.includes('Pay via Secure Escrow')) {
    // Insert before the WhatsApp button in the overlay
    const overlaySubmitButtonRegex = /<button\s+onClick=\{handleRegistrationSubmit\}[\s\S]*?<\/button>/;
    content = content.replace(overlaySubmitButtonRegex, (match) => newButton + '\n              ' + match);
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated EventPage.jsx');
