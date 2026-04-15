/**
 * Mock SMS utility for Masterpiece Platform
 */
export const sendSMS = async (to, message) => {
  // Extract OTP if present for the cinematic log
  const otpMatch = message.match(/\d{6}/);
  const otp = otpMatch ? otpMatch[0] : 'UNKNOWN';

  console.log('\n' + '📱'.repeat(25));
  console.log('✨  LOOP-OUT SMS GATEWAY (SIMULATED)');
  console.log('📱'.repeat(25));
  console.log(`TO:      ${to}`);
  console.log(`MSG:     ${message}`);
  console.log(`OTP:     ${otp}`);
  console.log('📱'.repeat(25) + '\n');

  // In a real implementation, you would use Twilio, Vonage, etc. here:
  /*
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({ body: message, to, from: process.env.TWILIO_NUMBER });
  */

  return { success: true, simulated: true };
};
