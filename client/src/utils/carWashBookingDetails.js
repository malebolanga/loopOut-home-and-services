const cleanValue = (value) => String(value || '').replace(/[*_`]/g, '').trim();

const readMessageField = (message, label) => {
  if (typeof message !== 'string' || !message.trim()) return '';
  const normalized = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match lines like: • Vehicle Type: Sedan OR 🚗 *Vehicle Type:* Sedan OR Vehicle Type: Sedan
  const match = normalized.match(new RegExp(`^[^\\r\\n]*?\\*?${escapedLabel}\\*?\\s*:\\*?\\s*(.+)$`, 'im'));
  return cleanValue(match?.[1]);
};

const yesNoValue = (value) => {
  if (!value) return '';
  if (/^(?:✅\s*)?yes\b/i.test(value) || value === true || value === 'true') return 'yes';
  if (/^(?:❌\s*)?no\b/i.test(value) || value === false || value === 'false') return 'no';
  return '';
};

export const isCarWashBooking = (booking = {}) => {
  if (!booking) return false;
  const combined = [
    booking.service?.type,
    booking.service?.name,
    booking.service?.title,
    booking.helper?.type,
    booking.helper?.name,
    booking.helper?.title,
    booking.subtype,
    booking.message,
    booking.title,
    booking.name,
    booking.data?.itemType,
    booking.itemType
  ].filter(Boolean).join(' ');

  return /carwash|car\s*wash|auto\s*wash|valet/i.test(combined) ||
    Boolean(booking.vehicleType || booking.vehicleMake || booking.vehicleModel ||
      booking.data?.vehicleType || booking.data?.vehicleMake || booking.data?.vehicleModel);
};

/**
 * Extract car wash & vehicle details from a booking document or notification message.
 * @param {object} booking - The booking or notification object
 * @param {string} [extraMessage] - Additional message text fallback
 */
export const getCarWashBookingDetails = (booking = {}, extraMessage = '') => {
  const message = booking.message || extraMessage || '';
  const data = booking.data || {};

  const resolve = (primaryVal, ...messageLabels) => {
    if (primaryVal && typeof primaryVal === 'string' && primaryVal.trim() && !/not specified/i.test(primaryVal.trim())) {
      return cleanValue(primaryVal);
    }
    for (const label of messageLabels) {
      const v = readMessageField(message, label);
      if (v && !/not specified/i.test(v)) return v;
      if (extraMessage && extraMessage !== message) {
        const v2 = readMessageField(extraMessage, label);
        if (v2 && !/not specified/i.test(v2)) return v2;
      }
    }
    return '';
  };

  let vehicleType = resolve(booking.vehicleType || data.vehicleType, 'Vehicle Type', 'Type', 'Kind of car');
  let vehicleMake = resolve(booking.vehicleMake || data.vehicleMake, 'Vehicle Make', 'Make', 'Vehicle maker');
  let vehicleModel = resolve(booking.vehicleModel || data.vehicleModel, 'Vehicle Model', 'Model', 'Car model');

  // Fallback: extract vehicle type from subtype if formatted like "...; Vehicle: Hatchback / Sedan"
  if (!vehicleType && booking.subtype) {
    const subMatch = String(booking.subtype).match(/Vehicle:\s*([^;]+)/i);
    if (subMatch?.[1]) {
      vehicleType = cleanValue(subMatch[1]);
    }
  }

  // Fallback: extract combined "Vehicle Make/Model" or "Vehicle" lines
  const combinedMakeModel = resolve('', 'Vehicle Make/Model', 'Vehicle Make / Model', 'Vehicle');
  if (combinedMakeModel && (!vehicleMake || !vehicleModel)) {
    // If combined is like "Toyota Fortuner" or "Toyota Fortuner, White, SUV"
    const cleaned = combinedMakeModel.split(/[,;]/)[0].trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      if (!vehicleMake) vehicleMake = parts[0];
      if (!vehicleModel) vehicleModel = parts.slice(1).join(' ');
    } else if (parts.length === 1) {
      if (!vehicleMake) vehicleMake = parts[0];
    }
  }

  const selectedServices = resolve(booking.selectedServices, 'Selected Services', 'Wash Type', 'Services', 'Wash Package');
  const waterSource = resolve(booking.waterSource, 'Water Source');
  const electricityAccess = yesNoValue(resolve(booking.electricityAccess, 'Electricity Access', 'Electricity available'));
  const specialRequirements = resolve(booking.specialRequirements, 'Special Requirements', 'Special request', 'Notes');

  return {
    vehicleType,
    vehicleMake,
    vehicleModel,
    selectedServices,
    waterSource,
    electricityAccess,
    specialRequirements,
  };
};

