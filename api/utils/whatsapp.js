const toE164 = (value) => {
  const input = String(value || '').trim();
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (input.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0')) return `+${process.env.TWILIO_WHATSAPP_COUNTRY_CODE || '27'}${digits.slice(1)}`;
  return `+${digits}`;
};

export const sendFoodOrderWhatsAppReady = async (order) => {
  const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_WHATSAPP_READY_CONTENT_SID } = process.env;
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !TWILIO_WHATSAPP_READY_CONTENT_SID) {
    return { sent: false, reason: 'WhatsApp order alerts are not configured.' };
  }

  const recipient = toE164(order.customerPhone);
  if (!recipient || recipient.length < 9 || recipient.length > 16) {
    return { sent: false, reason: 'The order has no valid WhatsApp number.' };
  }

  const form = new URLSearchParams({
    To: `whatsapp:${recipient}`,
    From: TWILIO_WHATSAPP_FROM.startsWith('whatsapp:') ? TWILIO_WHATSAPP_FROM : `whatsapp:${TWILIO_WHATSAPP_FROM}`,
    ContentSid: TWILIO_WHATSAPP_READY_CONTENT_SID,
    ContentVariables: JSON.stringify({
      1: String(order.orderCode || ''),
      2: String(order.shopName || 'the shop'),
    }),
  });
  const credentials = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(TWILIO_SID)}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(`Twilio WhatsApp request failed (${response.status}${result.code ? `, code ${result.code}` : ''}).`);
  }
  return { sent: true };
};
