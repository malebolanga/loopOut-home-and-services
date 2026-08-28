import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Service from '../models/service.model.js';
import Helper from '../models/helper.model.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// Cities we actively track — must line up with the coverage used by search
// (see controllers/searchController.js CITY_ALIASES) so the numbers we show
// on the homepage reflect areas the platform actually serves.
const TRACKED_CITIES = [
  { key: 'JHB', label: 'Johannesburg', match: /johannesburg|sandton|randburg|midrand|soweto|roodepoort/i },
  { key: 'PTA', label: 'Pretoria', match: /pretoria|centurion|soshanguve|mamelodi/i },
  { key: 'CPT', label: 'Cape Town', match: /cape town|bellville|stellenbosch|somerset west/i },
  { key: 'PLK', label: 'Polokwane', match: /polokwane|seshego|mankweng|mokopane/i },
];

const round1 = (n) => Math.round(n * 10) / 10;

// Turns a raw count into a rounded, human-friendly label like "1.2k+" or "48".
const formatCount = (n) => {
  if (n >= 1000) return `${round1(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
};

export const getHomeStats = async (req, res, next) => {
  try {
    const [
      verifiedHostCount,
      listingCount,
      serviceCount,
      helperCount,
      completedBookingCount,
      ratingAgg,
      listingAddresses,
      serviceAddresses,
      helperAddresses,
    ] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Listing.countDocuments(),
      Service.countDocuments(),
      Helper.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Listing.find({}, 'address').lean(),
      Service.find({}, 'address').lean(),
      Helper.find({}, 'address').lean(),
    ]);

    const avgRating = ratingAgg?.[0]?.avg ? round1(ratingAgg[0].avg) : null;
    const totalListedItems = listingCount + serviceCount + helperCount;

    const allAddresses = [
      ...listingAddresses.map((l) => l.address),
      ...serviceAddresses.map((s) => s.address),
      ...helperAddresses.map((h) => h.address),
    ].filter(Boolean);

    const cities = TRACKED_CITIES.map(({ key, label, match }) => {
      const count = allAddresses.filter((addr) => match.test(addr)).length;
      return {
        city: key,
        label,
        status: count > 0 ? 'Live' : 'Coming soon',
        count: formatCount(count),
        rawCount: count,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        verifiedHosts: { value: formatCount(verifiedHostCount), raw: verifiedHostCount },
        avgRating: { value: avgRating ? `${avgRating}★` : 'New', raw: avgRating },
        completedBookings: { value: formatCount(completedBookingCount), raw: completedBookingCount },
        totalListings: { value: formatCount(totalListedItems), raw: totalListedItems },
        cities,
      },
    });
  } catch (error) {
    next(error);
  }
};
