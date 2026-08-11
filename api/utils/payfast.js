import crypto from 'crypto';

const encodePayfastValue = (value) => encodeURIComponent(String(value).trim()).replace(/%20/g, '+');

export const generatePayfastSignature = (data, passphrase = process.env.PAYFAST_PASSPHRASE) => {
  const parameterString = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodePayfastValue(value)}`)
    .join('&');
  const saltedParameterString = passphrase
    ? `${parameterString}&passphrase=${encodePayfastValue(passphrase)}`
    : parameterString;
  return crypto.createHash('md5').update(saltedParameterString).digest('hex');
};

export const isValidPayfastItn = (payload) => {
  const { signature, ...data } = payload;
  if (!signature || !process.env.PAYFAST_PASSPHRASE) return false;
  const expectedSignature = generatePayfastSignature(data);
  const received = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};

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

  const signature = generatePayfastSignature(data);

  // PayFast Base URL (Sandbox or Live)
  const baseUrl = process.env.PAYFAST_MODE === 'live' 
    ? 'https://www.payfast.co.za/eng/process' 
    : 'https://sandbox.payfast.co.za/eng/process';

  return {
    url: baseUrl,
    fields: { ...data, signature }
  };
};
