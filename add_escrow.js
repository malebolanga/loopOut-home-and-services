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

const escrowCheckoutFn = `
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
           amount: totalPrice,
           name: currentUser.username,
           email: currentUser.email,
           serviceId: helper ? helper._id : (service ? service._id : ''),
           providerName: helper ? helper.name : (service ? service.name : '')
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = 'https://www.payfast.co.za/eng/process';
         Object.keys(data.payfast).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.payfast[key];
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

  const handleBookingSubmit =`;

const escrowUI = `
             <div className="flex flex-col gap-4">
              <button
                onClick={handleBookingSubmit}
                disabled={isUploading}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Initializing Secure Link...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="text-lg" />
                    Finalize via WhatsApp
                  </>
                )}
              </button>
              
              <button
                onClick={handleEscrowCheckout}
                disabled={isUploading}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 mt-2"
              >
                <FaShieldAlt className="text-lg" /> Secure Escrow Checkout
              </button>
              
              <p className="text-[10px] text-gray-500 font-bold text-center italic px-4 shadow-sm border border-rose-100 bg-rose-50 rounded-xl py-3 mt-2">
                 ⚠️ Never send money over WhatsApp before the job is completed. Avoid scams by using loopOut Secure Escrow!
              </p>
             </div>`;

for (const file of targetFiles) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add handleEscrowCheckout logic right before handleBookingSubmit
    if (!content.includes('handleEscrowCheckout')) {
       // Find 'const handleBookingSubmit ='
       content = content.replace(/const handleBookingSubmit\s*=\s*/g, escrowCheckoutFn);
    }

    // 2. Import FaShieldAlt if not exists
    if (!content.includes('FaShieldAlt')) {
       content = content.replace(/import\s*\{\s*([^}]+)\}\s*from\s*'react-icons\/fa';/, (match, p1) => {
          return "import { " + p1 + "FaShieldAlt } from 'react-icons/fa';";
       });
    }

    // 3. Replace the WhatsApp button with the new wrapper
    // The button usually starts with <button\s+onClick={handleBookingSubmit}
    // We will find the button up to </button>
    // Since regex matching a full HTML block can be risky due to nested tags,
    // let's match the specific WhatsApp button structure roughly.
    const buttonRegex = /<button\s+onClick=\{handleBookingSubmit\}[\s\S]*?Finalize via WhatsApp[\s\S]*?<\/button>/;
    
    // Also, handle cases where 'Finalize via WhatsApp' might be slightly different in some files, like 'Confirm Booking'
    // Actually, in HelperPage.jsx it is 'Finalize via WhatsApp'.
    // Let's use a more generic regex for the handleBookingSubmit button:
    const genericButtonRegex = /<button[^>]*onClick=\{handleBookingSubmit\}[^>]*>[\s\S]*?<\/button>/;
    
    if (content.match(buttonRegex)) {
        content = content.replace(buttonRegex, escrowUI);
    } else if (content.match(genericButtonRegex)) {
        content = content.replace(genericButtonRegex, escrowUI);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[SUCCESS] Added Escrow to', file);
  } else {
    console.log('[ERROR] Not found:', file);
  }
}
