export const sendSMS = async (to, message) => {
  // SMS is optional. Do not log message contents or verification codes.
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_NUMBER) {
    return { success: false, error: 'SMS delivery is not configured.' };
  }
  return { success: false, error: 'SMS delivery provider is not enabled.' };
};
