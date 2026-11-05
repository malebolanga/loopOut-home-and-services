const HOURLY_LISTING_TYPES = ['office', 'hourly_room', 'room_hourly'];
const MONTHLY_LISTING_TYPES = ['rent', 'apartment'];

export const getPropertyRatePeriod = (listing) => {
  if (['hour', 'day', 'night', 'month'].includes(listing?.pricePeriod)) {
    return listing.pricePeriod;
  }
  if (HOURLY_LISTING_TYPES.includes(listing?.type)) return 'hour';
  if (listing?.type === 'over') return 'night';
  if (['house', 'apartment'].includes(listing?.kind)) return 'day';
  if (MONTHLY_LISTING_TYPES.includes(listing?.type)) return 'month';
  return 'day';
};

const knownTitleCorrections = [
  [/\bdumbling\b/gi, (word) => (word[0] === word[0].toUpperCase() ? 'Dumpling' : 'dumpling')],
  [/\bapartmet\b/gi, (word) => (word[0] === word[0].toUpperCase() ? 'Apartment' : 'apartment')],
];

export const formatListingTitle = (value) => {
  if (typeof value !== 'string') return value || '';
  return knownTitleCorrections.reduce((title, [pattern, replacement]) => title.replace(pattern, replacement), value);
};
