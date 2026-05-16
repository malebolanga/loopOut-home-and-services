import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const PromotionSelection = ({ setPromotionSteps }) => {
  const [promotionPackage, setPromotionPackage] = useState(null);
  const navigate = useNavigate();

  const handlePromoteListing = () => {
    // Save the selected package to state or context if needed
    // Then navigate to payment page
    navigate('/payment', { 
      state: { 
        package: promotionPackage,
        price: promotionPackage === 'standard' ? 40 : 100
      }
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-airbnb-red mb-6">Choose Package</h3>
      <div className="space-y-4 mb-6">
        <div 
          onClick={() => setPromotionPackage('standard')} 
          className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            promotionPackage === 'standard' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Standard</h4>
              <p className="text-sm text-gray-600">25x Click move to normal post</p>
            </div>
            <span className="text-airbnb-red font-bold">R40</span>
          </div>
        </div>
        <div 
          onClick={() => setPromotionPackage('premium')} 
          className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            promotionPackage === 'premium' ? 'border-airbnb-red bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Premium</h4>
              <p className="text-sm text-gray-600">80x Click move to normal post</p>
            </div>
            <span className="text-airbnb-red font-bold">R100</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => setPromotionSteps(0)} 
          className="px-4 py-2 text-gray-600 hover:text-airbnb-red transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handlePromoteListing} 
          disabled={!promotionPackage} 
          className={`px-6 py-2 rounded-full transition-colors ${
            promotionPackage 
              ? 'bg-airbnb-red text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PromotionSelection;
