import { useLocation } from 'react-router-dom';

const PaymentMethod = () => {
  const location = useLocation();
  const { package: selectedPackage, price } = location.state || {};

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-airbnb-red mb-6">Payment Method</h2>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="flex justify-between mb-1">
          <span>Package:</span>
          <span className="capitalize">{selectedPackage}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span className="text-airbnb-red">R{price}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-airbnb-red">
          <h4 className="font-semibold">Credit/Debit Card</h4>
          <p className="text-sm text-gray-600">Pay with Visa, Mastercard, etc.</p>
        </div>
        <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-airbnb-red">
          <h4 className="font-semibold">PayPal</h4>
          <p className="text-sm text-gray-600">Pay with your PayPal account</p>
        </div>
        <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-airbnb-red">
          <h4 className="font-semibold">Bank Transfer</h4>
          <p className="text-sm text-gray-600">Direct bank transfer</p>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <button className="px-4 py-2 text-gray-600 hover:text-airbnb-red">
          Back
        </button>
        <button className="px-6 py-2 bg-airbnb-red text-white rounded-full hover:bg-red-700">
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;