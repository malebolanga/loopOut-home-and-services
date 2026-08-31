import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';

const ReservationModal = ({ listing, isOpen, onClose, startDate, endDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing._id,
          hostEmail: listing.userRef.email, // Assuming listing contains owner's email
          ...formData,
          startDate,
          endDate,
          totalPrice: calculateTotalPrice()
        }),
      });

      if (!res.ok) throw new Error('Failed to submit reservation');
      
      setSuccessMessage('Reservation request sent successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    // Your existing price calculation logic
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return days * (listing.offer ? listing.discountPrice : listing.regularPrice);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>

          <Dialog.Title className="text-2xl font-bold mb-6">
            Reserve {listing.name}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full p-2 border rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full p-2 border rounded-lg"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message to Host</label>
              <textarea
                className="w-full p-2 border rounded-lg h-24"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {successMessage && (
              <div className="text-green-600 text-sm">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="text-red-600 text-sm">{errorMessage}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-airbnb-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              {isLoading ? 'Sending...' : 'Submit Reservation'}
            </button>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
