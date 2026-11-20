const formatContactForWhatsApp = (contact) => {
  if (!contact) return '';
  const digits = String(contact).replace(/\D/g, '');
  if (digits.startsWith('0')) return `27${digits.slice(1)}`;
  return digits;
};

export const openShuttleRequestWhatsApp = ({ driverPhone, driverName, passengerName, passengerPhone, originCity, destinationCity, carType, plateNumber, seatsBooked, pickupLocation, dropoffLocation, totalPrice, departureDate, departureTime, ticketCode }, popupWindow) => {
  const phone = formatContactForWhatsApp(driverPhone);
  if (!phone) {
    popupWindow?.close();
    return false;
  }

  const localDepartureDate = departureDate
    ? new Date(new Date(departureDate).getTime() + 2 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Johannesburg',
    })
    : 'See LoopOut schedule';
  const message = [
    '*🚐 LOOP OUT SHUTTLE REQUEST*',
    `Booking code: ${ticketCode || 'Pending'}`,
    '',
    '*Passenger*',
    `Name: ${passengerName || 'Passenger'}`,
    `Contact: ${passengerPhone || 'See LoopOut booking'}`,
    '',
    '*Trip*',
    `Route: ${originCity || 'Origin'} → ${destinationCity || 'Destination'}`,
    `Vehicle: ${carType || 'Shuttle'}${plateNumber ? ` (${plateNumber})` : ''}`,
    `Seats: ${seatsBooked || 1}`,
    `Pickup: ${pickupLocation || 'See LoopOut request'}`,
    `Drop-off: ${dropoffLocation || 'See LoopOut request'}`,
    `Departure: ${localDepartureDate}${departureTime ? ` at ${departureTime}` : ''}`,
    `Estimated fare: R${Number(totalPrice || 0).toFixed(2)}`,
    '',
    `Hi ${driverName || 'Driver'}, I have sent this request through LoopOut. Please review and accept or decline it in your LoopOut Driver Request Desk.`,
    '_Sent via LoopOut_',
  ].join('\n');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (popupWindow && !popupWindow.closed) popupWindow.location.href = whatsappUrl;
  else window.open(whatsappUrl, '_blank');
  return true;
};

export const openWhatsAppWindowForRequest = (phone) => (
  formatContactForWhatsApp(phone) ? window.open('about:blank', '_blank') : null
);
