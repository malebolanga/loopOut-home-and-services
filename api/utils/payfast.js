import crypto from 'crypto';

/**
 * PayFast Payment Configuration
 * This utility generates the necessary data for a PayFast payment.
 * In production, you MUST use your own Merchant ID and Key from PayFast dashboard.
 */
export const generatePayfastData = (paymentConfig) => {
  const {
    merchant_id = process.env.PAYFAST_MERCHANT_ID || '10000100', // Default Sandbox ID
    merchant_key = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a', // Default Sandbox Key
    return_url = `${process.env.APP_URL || 'http://localhost:5173'}/payment-success`,
    cancel_url = `${process.env.APP_URL || 'http://localhost:5173'}/payment-cancelled`,
    notify_url = `${process.env.BACKEND_URL}/api/payment/itn`,
    name_first = 'LoopOut',
    name_last = 'User',
    email_address = 'user@example.com',
    m_payment_id = Date.now().toString(),
    amount = '35.00',
    item_name = 'Standard Listing Upgrade',
  } = paymentConfig;

  // PayFast ITN Data
  const data = {
    merchant_id,
    merchant_key,
    return_url,
    cancel_url,
    notify_url,
    name_first,
    name_last,
    email_address,
    m_payment_id,
    amount,
    item_name,
  };

  // Generate Signature (optional but HIGHLY recommended for security)
  // signature = md5( merchant_id=...&merchant_key=...&return_url=... )
  let signatureString = '';
  Object.keys(data).forEach((key) => {
    signatureString += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}&`;
  });
  
  // Cut the trailing '&'
  signatureString = signatureString.slice(0, -1);
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');

  // PayFast Base URL (Sandbox or Live)
  const baseUrl = process.env.PAYFAST_MODE === 'live' 
    ? 'https://www.payfast.co.za/eng/process' 
    : 'https://sandbox.payfast.co.za/eng/process';

  return {
    url: baseUrl,
    fields: { ...data, signature }
  };
};
