// utils.js – helper utilities (e.g., OTP placeholder)
// In a real system you would integrate an SMS/email OTP service.

function sendOTP(userId) {
  // Stub: generate a 6‑digit code and log it (replace with real service)
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log(`Sending OTP ${code} to user ${userId}`);
  // Return the code for verification (in production store securely)
  return code;
}

module.exports = { sendOTP };
