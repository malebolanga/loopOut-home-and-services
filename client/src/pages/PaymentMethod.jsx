import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';

const PaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { package: selectedPackage, price, listingId, type } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [payfastData, setPayfastData] = useState(null);
  const formRef = useRef(null);

  // Auto-submit the form once payfastData is loaded
  useEffect(() => {
    if (payfastData && formRef.current) {
      formRef.current.submit();
    }
  }, [payfastData]);

  const handleCompletePayment = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    setLoading(true);
    try {
      // Determine which endpoint to call
      const endpoint = type === 'promotion' ? '/api/promotion/payment' : '/api/payment';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
          listingId,
          package: selectedPackage,
          amount: price,
          name: currentUser.username,
          email: currentUser.email
        }),
      });

      const data = await res.json();
      if (data.success && data.payfast) {
        setPayfastData(data.payfast);
        // useEffect will handle the submit redirect
      } else {
        alert(data.message || 'Payment initialization failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="p-10 text-center">
        <p>No package selected. Please go back.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-airbnb-red underline">Go Back</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <h2 className="text-2xl font-bold text-airbnb-red mb-6">Secure Checkout</h2>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="font-semibold mb-2 text-gray-900 border-b pb-2">Order Summary</h3>
        <div className="flex justify-between mb-1 py-1">
          <span className="text-gray-600">Package:</span>
          <span className="capitalize font-medium text-gray-900">{selectedPackage}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
          <span>Total:</span>
          <span className="text-airbnb-red">R{price}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-gray-900">Choose Payment Method</h3>
        <div className="space-y-3">
          <div className="p-4 border-2 border-airbnb-red bg-red-50 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
               <div className="w-4 h-4 rounded-full border-4 border-airbnb-red"></div>
               <div>
                 <h4 className="font-semibold text-gray-900">PayFast (Instant EFT / Card)</h4>
                 <p className="text-xs text-gray-600">Secure South African Payment Gateway</p>
               </div>
            </div>
          </div>
          <div className="p-4 border-2 border-gray-100 rounded-xl cursor-not-allowed opacity-50">
            <h4 className="font-semibold">PayPal</h4>
            <p className="text-xs text-gray-500">Currently unavailable for ZAR</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={handleCompletePayment}
          disabled={loading}
          className="w-full h-14 bg-airbnb-red text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Initializing...
            </>
          ) : (
            `Pay R${price} and Activate`
          )}
        </button>
        <button 
          onClick={() => navigate(-1)}
          disabled={loading}
          className="w-full py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Cancel and go back
        </button>
      </div>

      {/* Hidden PayFast Redirect Form */}
      {payfastData && (
        <form ref={formRef} action={payfastData.url} method="POST" className="hidden">
          {Object.entries(payfastData.fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      <p className="mt-8 text-[10px] text-gray-400 text-center px-6">
        Payments are processed securely via PayFast. We do not store your credit card information. 
        By clicking pay, you agree to loopOut's Terms of Service.
      </p>
    </div>
  );
};

export default PaymentMethod;