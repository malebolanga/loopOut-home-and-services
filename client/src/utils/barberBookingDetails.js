const cleanValue = (value) => String(value || '').replace(/[*_`]/g, '').trim();

const readMessageField = (message, label) => {
  if (typeof message !== 'string' || !message.trim()) return '';
  const normalized = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match lines like: ✂️ *Haircut Style:* Fade & Taper OR 👑 *Performer:* Joe OR Haircut Style: Fade & Taper
  const match = normalized.match(new RegExp(`^[^\\r\\n]*?\\*?${escapedLabel}\\*?\\s*:\\*?\\s*(.+)$`, 'im'));
  return cleanValue(match?.[1]);
};

const readSpecialRequest = (message) => {
  if (typeof message !== 'string' || !message.trim()) return '';
  const normalized = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');
  const match = normalized.match(/COMMENTS\s*&\s*NOTES[\s\S]*?\n\s*📝\s*(.+?)(?:\n\s*\n|$)/i);
  const value = cleanValue(match?.[1]);
  return /^no special requirements$/i.test(value) ? '' : value;
};

const yesNoValue = (value) => {
  if (!value) return '';
  // Handle ✅ Yes / ❌ No, plain yes/no, and boolean-like values
  if (/^(?:✅\s*)?yes\b/i.test(value) || value === true || value === 'true') return 'yes';
  if (/^(?:❌\s*)?no\b/i.test(value) || value === false || value === 'false') return 'no';
  return '';
};

export const isBarberBooking = (booking = {}) => {
  if (!booking) return false;
  return /barber|barbar/i.test([
    booking.helper?.type,
    booking.helper?.name,
    booking.helper?.title,
    booking.service?.type,
    booking.service?.name,
    booking.subtype,
    booking.message,
    booking.title,
    booking.name,
    booking.data?.itemType,
    booking.itemType
  ].filter(Boolean).join(' '));
};

/**
 * Extract barber-specific booking details from a booking record.
 * Falls back to parsing the stored WhatsApp-style message text if DB fields are missing.
 * @param {object} booking  - The booking document from the API
 * @param {string} [extraMessage] - Optional secondary message source (e.g. notification message)
 */
export const getBarberBookingDetails = (booking = {}, extraMessage = '') => {
  // Primary source: booking.message (WhatsApp template saved at booking time)
  // Secondary source: extraMessage (notification body, which may also contain the booking summary)
  const message = booking.message || extraMessage || '';
  const parsedSpecialRequest = readSpecialRequest(message);
  const isWhatsAppBookingTemplate = /CLIENT DETAILS|QUICK\s+BARBER\s+BOOKING|NEW\s+BARBER\s+BOOKING/i.test(message);

  // Helper to resolve a value: DB field first, then parse message, then parse extraMessage
  const resolve = (dbVal, ...messageLabels) => {
    if (dbVal) return String(dbVal).trim();
    for (const label of messageLabels) {
      const v = readMessageField(message, label);
      if (v) return v;
      if (extraMessage && extraMessage !== message) {
        const v2 = readMessageField(extraMessage, label);
        if (v2) return v2;
      }
    }
    return '';
  };

  const foodRaw = resolve(booking.foodProvided, 'Food provided by client', 'Food provided', 'Food');
  const electricityRaw = resolve(booking.electricityProvided, 'Electricity available', 'Electricity provided', 'Electricity');

  // Fallback haircut style: if not explicitly marked, check if subtype is a haircut style
  const haircutStyle = resolve(booking.selectedHaircut, 'Haircut style', 'Haircut Style', 'Style') ||
    (/cut|fade|taper|trim|shave|crop|afro|pompadour|undercut|buzz/i.test(booking.subtype || '') ? booking.subtype : '');

  return {
    selectedPerformer: resolve(booking.selectedPerformer, 'Performer', 'Selected member', 'Member', 'Barber'),
    serviceDuration: resolve(booking.serviceDuration, 'Selected duration', 'Service Duration', 'Duration'),
    selectedHaircut: haircutStyle,
    beardGrooming: resolve(booking.beardGrooming, 'Beard grooming', 'Beard Grooming', 'Beard & Shave', 'Beard style'),
    foodProvided: yesNoValue(foodRaw) || (booking.foodProvided === 'yes' ? 'yes' : booking.foodProvided === 'no' ? 'no' : ''),
    electricityProvided: yesNoValue(electricityRaw) || (booking.electricityProvided === 'yes' ? 'yes' : booking.electricityProvided === 'no' ? 'no' : ''),
    specialRequirements: booking.specialRequirements || parsedSpecialRequest || (!isWhatsAppBookingTemplate ? cleanValue(message) : ''),
  };
};
