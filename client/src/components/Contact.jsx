import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Contact({ listing }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPerformer, setSelectedPerformer] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build WhatsApp Message
    const whatsappNumber = listing.contact || '';
    if (!whatsappNumber) {
      alert("Provider contact is missing.");
      return;
    }

    let text = `*🛎️ NEW HELPER BOOKING* 🛎️\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Name:* ${name}\n`;
    text += `📞 *Phone:* ${phone}\n`;
    text += `📧 *Email:* ${email}\n\n`;
    
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `⚒️ *Service:* ${listing.name}\n`;
    
    if (selectedPerformer) {
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*👤 SELECTED PERFORMER*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      text += `👤 *Name:* ${selectedPerformer.name}\n`;
      text += `📜 *Experience:* ${selectedPerformer.experience}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📝 *Message:* ${message}\n\n`;
    text += `_Sent via loopOut_`;

    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Contact {helper.host}</h2>
          <button onClick={() => setContact(false)} className='text-gray-500 hover:text-gray-700'>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700'>Name</label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb-red focus:border-airbnb-red'
              required
            />
          </div>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb-red focus:border-airbnb-red'
              required
            />
          </div>
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>Phone</label>
            <input
              type='tel'
              id='phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb-red focus:border-airbnb-red'
            />
          </div>
          <div>
            <label htmlFor='message' className='block text-sm font-medium text-gray-700'>Message</label>
            <textarea
              id='message'
              rows='4'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-airbnb-red focus:border-airbnb-red'
              required
            ></textarea>
          </div>

          {listing.performers && listing.performers.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Select Performer (Optional)</label>
              <div className="grid grid-cols-1 gap-2">
                {listing.performers.map((performer, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPerformer(selectedPerformer?.name === performer.name ? null : performer)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPerformer?.name === performer.name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <img 
                      src={performer.image} 
                      alt={performer.name} 
                      className="w-10 h-10 rounded-lg object-cover shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${selectedPerformer?.name === performer.name ? 'text-red-600' : 'text-gray-900'}`}>
                        {performer.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">{performer.experience}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-airbnb-red text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-airbnb-red'
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}