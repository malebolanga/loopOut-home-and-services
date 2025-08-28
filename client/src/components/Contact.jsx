import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Contact({ helper }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the message to the server
    alert('Message sent!');
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