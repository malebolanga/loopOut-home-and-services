import Event from '../models/event.model.js';
import Helper from '../models/helper.model.js';
import Listing from '../models/listing.model.js';
import LookingFor from '../models/lookingFor.model.js';
import Service from '../models/service.model.js';
import Shop from '../models/shop.model.js';
import { fuzzItemsLocation } from '../utils/locationFuzzer.js';

const MAX_PAGE_SIZE = 20;
const MAX_PAGE = 250;
const SEARCH_TEXT_LIMIT = 100;
const LOCATION_TEXT_LIMIT = 120;

const HELPER_TYPE_ALIASES = {
  maid: 'domestic',
  nanny: 'domestic',
  hair: 'beauty',
  nail: 'beauty',
};

const SERVICE_TYPE_ALIASES = {
  electrician: 'maintenance',
  transport: 'moving',
  daily: 'other',
};

const SERVICE_TYPES = new Set([
  'cleaning', 'handyman', 'maintenance', 'moving', 'landscaping', 'catering',
  'other', 'daycare', 'schoolTransport', 'carwash', 'storage',
]);

const HELPER_TYPES = new Set([
  'domestic', 'handyman', 'errand', 'tutor', 'chef', 'beauty', 'tattoo',
  'barber', 'photography', 'baker', 'sneaker', 'washingmat', 'animals',
]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const boundedText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const parseBoundedNumber = (value, label) => {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    const error = new Error(`${label} must be a non-negative number.`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const parsePagination = (query) => {
  const page = query.page === undefined ? 0 : Number(query.page);
  const requestedLimit = query.limit === undefined ? 12 : Number(query.limit);
  if (!Number.isSafeInteger(page) || page < 0 || page > MAX_PAGE) {
    const error = new Error(`page must be between 0 and ${MAX_PAGE}.`);
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    const error = new Error('limit must be a positive integer.');
    error.statusCode = 400;
    throw error;
  }
  return { page, limit: Math.min(requestedLimit, MAX_PAGE_SIZE) };
};

const matchesText = (fields, regex) => regex
  ? { $or: fields.map((field) => ({ [field]: regex })) }
  : null;

const makeSource = ({ model, itemType, fields, locationFields, subtypeField, priceField = 'regularPrice' }) => ({
  model,
  itemType,
  fields,
  locationFields,
  subtypeField,
  priceField,
});

const sources = {
  properties: makeSource({ model: Listing, itemType: 'listing', fields: ['name', 'description'], locationFields: ['address', 'near'], subtypeField: 'type' }),
  services: makeSource({ model: Service, itemType: 'service', fields: ['name', 'description', 'kind'], locationFields: ['address', 'near'], subtypeField: 'type' }),
  helpers: makeSource({ model: Helper, itemType: 'helper', fields: ['name', 'description', 'kind'], locationFields: ['address', 'near'], subtypeField: 'type' }),
  events: makeSource({ model: Event, itemType: 'event', fields: ['name', 'description'], locationFields: ['address', 'near'], subtypeField: 'type' }),
  community: makeSource({ model: LookingFor, itemType: 'looking-for', fields: ['title', 'description'], locationFields: ['location', 'requestLocation'], subtypeField: 'category', priceField: 'budget' }),
};

const selectedSources = (type) => {
  if (type === 'all') return [sources.properties, sources.services, sources.helpers, sources.events];
  if (type === 'food') return [];
  if (type === 'looking-for') return [sources.community];
  const source = sources[type];
  if (!source) {
    const error = new Error('Unsupported search type.');
    error.statusCode = 400;
    throw error;
  }
  return [source];
};

const categoryType = (type, subType) => {
  if (!subType || subType === 'all') return undefined;
  if (type === 'services') {
    const mapped = SERVICE_TYPE_ALIASES[subType] || subType;
    return SERVICE_TYPES.has(mapped) ? mapped : undefined;
  }
  if (type === 'helpers') {
    const mapped = HELPER_TYPE_ALIASES[subType] || subType;
    return HELPER_TYPES.has(mapped) ? mapped : undefined;
  }
  return boundedText(subType, 60);
};

const buildSourceQuery = ({ source, type, subType, searchRegex, locationRegex, minPrice, maxPrice, minRating, bedroomsMin, bathroomsMin }) => {
  const query = {};
  const searchMatch = matchesText(source.fields, searchRegex);
  if (searchMatch) query.$or = searchMatch.$or;

  if (locationRegex) {
    query.$and = (query.$and || []).concat({
      $or: source.locationFields.map((field) => ({ [field]: locationRegex })),
    });
  }

  const normalizedSubType = categoryType(type, subType);
  if (normalizedSubType) query[source.subtypeField] = normalizedSubType;

  const price = {};
  if (minPrice !== undefined) price.$gte = minPrice;
  if (maxPrice !== undefined) price.$lte = maxPrice;
  if (Object.keys(price).length) query[source.priceField] = price;

  if (minRating !== undefined && source.model !== LookingFor) query.rating = { $gte: minRating };
  if (source.model === Listing && bedroomsMin !== undefined) query.bedrooms = { $gte: bedroomsMin };
  if (source.model === Listing && bathroomsMin !== undefined) query.bathrooms = { $gte: bathroomsMin };
  if (source.model === LookingFor) {
    query.active = true;
    query.expiresAt = { $gt: new Date() };
  }
  return query;
};

const fieldsForSource = (source) => {
  if (source.model === LookingFor) return 'title description location category urgency budget imageUrls userRef createdAt';
  return 'name title description address near type listingType kind regularPrice pricePeriod discountPrice imageUrls latitude longitude rating userRef creator createdAt bedrooms bathrooms toilets garages parkingSpaces bookingsCount isPromoted verified isVerified';
};

const searchFood = async ({ searchRegex, locationRegex, minPrice, maxPrice, subType, page, limit }) => {
  const match = { 'meals.isAvailable': { $ne: false } };
  const textFields = ['name', 'cuisine', 'address', 'meals.name', 'meals.description', 'meals.tag', 'meals.category'];
  if (searchRegex) match.$or = textFields.map((field) => ({ [field]: searchRegex }));
  if (locationRegex) match.address = locationRegex;

  const price = {};
  if (minPrice !== undefined) price.$gte = minPrice;
  if (maxPrice !== undefined) price.$lte = maxPrice;
  if (Object.keys(price).length) match['meals.price'] = price;

  const foodCategoryPatterns = {
    street_food: /street|kota|fast|chips|snack/i,
    traditional: /traditional|pap|stew|mogodu|chakalaka/i,
    fast_food: /burger|grill|fast/i,
  };
  const categoryPattern = foodCategoryPatterns[subType];
  if (categoryPattern) {
    match.$and = (match.$and || []).concat({
      $or: ['meals.name', 'meals.tag', 'meals.category', 'cuisine'].map((field) => ({ [field]: categoryPattern })),
    });
  }

  const rows = await Shop.aggregate([
    { $match: { ownerId: { $ne: 'guest' } } },
    { $unwind: '$meals' },
    { $match: match },
    { $sort: { createdAt: -1, _id: -1, 'meals.id': 1 } },
    { $skip: page * limit },
    { $limit: limit + 1 },
    { $project: {
      _id: { $concat: [{ $toString: '$_id' }, '_', '$meals.id'] },
      id: { $concat: [{ $toString: '$_id' }, '_', '$meals.id'] },
      name: '$meals.name',
      title: '$meals.name',
      description: { $concat: [{ $ifNull: ['$meals.description', ''] }, ' • ', '$name', ' (', { $ifNull: ['$cuisine', 'Local Food'] }, ')'] },
      regularPrice: '$meals.price',
      discountPrice: { $ifNull: ['$meals.originalPrice', '$meals.price'] },
      price: '$meals.price',
      address: { $ifNull: ['$address', 'Polokwane, Limpopo'] },
      imageUrls: [{ $cond: [{ $regexMatch: { input: { $ifNull: ['$meals.image', ''] }, regex: '^https?://' } }, '$meals.image', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'] }],
      image: { $cond: [{ $regexMatch: { input: { $ifNull: ['$meals.image', ''] }, regex: '^https?://' } }, '$meals.image', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'] },
      itemType: { $literal: 'food' },
      type: { $literal: 'food' },
      subType: { $ifNull: ['$meals.category', { $ifNull: ['$cuisine', 'food'] }] },
      shopId: { $toString: '$_id' },
      shopName: '$name',
      rating: { $convert: { input: '$rating', to: 'double', onError: 0, onNull: 0 } },
      latitude: 1,
      longitude: 1,
      badge: { $ifNull: ['$meals.tag', 'Popular'] },
      route: { $literal: '/food' },
      createdAt: 1,
    } },
  ]);
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
};

export const searchListings = async (req, res, next) => {
  try {
    const type = boundedText(req.query.type || 'all', 30);
    const subType = boundedText(req.query.subType || '', 60);
    const searchTerm = boundedText(req.query.q || '', SEARCH_TEXT_LIMIT);
    const location = boundedText(req.query.location || '', LOCATION_TEXT_LIMIT);
    const minPrice = parseBoundedNumber(req.query.minPrice, 'minPrice');
    const maxPrice = parseBoundedNumber(req.query.maxPrice, 'maxPrice');
    const minRating = parseBoundedNumber(req.query.minRating, 'minRating');
    const bedroomsMin = parseBoundedNumber(req.query.bedroomsMin, 'bedroomsMin');
    const bathroomsMin = parseBoundedNumber(req.query.bathroomsMin, 'bathroomsMin');
    const { page, limit } = parsePagination(req.query);

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ success: false, message: 'minPrice cannot be greater than maxPrice.' });
    }

    const regexOptions = 'i';
    const searchRegex = searchTerm ? new RegExp(escapeRegex(searchTerm), regexOptions) : null;
    const locationRegex = location ? new RegExp(escapeRegex(location), regexOptions) : null;
    const sourcesForRequest = selectedSources(type);
    const includeFood = type === 'all' || type === 'food';

    const sourceResults = await Promise.all(sourcesForRequest.map(async (source) => {
      const query = buildSourceQuery({ source, type, subType, searchRegex, locationRegex, minPrice, maxPrice, minRating, bedroomsMin, bathroomsMin });
      const documents = await source.model.find(query)
        .select(fieldsForSource(source))
        .sort({ createdAt: -1, _id: -1 })
        .skip(page * limit)
        .limit(limit + 1)
        .populate('userRef', 'username avatar')
        .lean();
      const hasMore = documents.length > limit;
      return {
        items: documents.slice(0, limit).map((document) => ({ ...document, itemType: source.itemType })),
        hasMore,
      };
    }));

    if (includeFood) {
      sourceResults.push(await searchFood({ searchRegex, locationRegex, minPrice, maxPrice, subType: type === 'food' ? subType : '', page, limit }));
    }

    const items = sourceResults.flatMap((result) => result.items);
    return res.status(200).json({
      success: true,
      items: fuzzItemsLocation(items),
      hasMore: sourceResults.some((result) => result.hasMore),
      page,
      limit,
      count: items.length,
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};
