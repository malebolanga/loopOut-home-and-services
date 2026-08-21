import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import { createAreaNotifications } from '../utils/notificationUtils.js';
import { fuzzItemsLocation, fuzzSingleItemLocation } from '../utils/locationFuzzer.js';
import { validateListingText, validateImages } from '../utils/moderationHelper.js';

// Create Listing
export const createListing = async (req, res, next) => {
  try {

    const imageCheck = await validateImages(req.body.imageUrls);
    if (!imageCheck.valid) {
      return next(errorHandler(400, imageCheck.message));
    }

    const textCheck = validateListingText(req.body, req.user?.id);
    if (!textCheck.valid) {
      return next(errorHandler(400, textCheck.message));
    }
    const {
      imageUrls,
      videoUrl,
      name,
      description,
      near,
      rules,
      address,
      contact,
      host,
      kind,
      period,
      cancel,
      type,
      bedrooms,
      bathrooms,
      regularPrice,
      discountPrice,
      parking,
      pool,
      wifi,
      kitchen,
      stove,
      tv,
      storage,
      security,
      furnished,
      offer,
      hot,
      pets,
      prepaid,
      fridge,
      share,
      breakfast,
      party,
      instantConfirmation,
      kidFriendly,
      wheelchairAccessible,
      parkingAvailable,
      environmentallyFriendly,
      numberOfApartments,
      numberOfRooms,
      numberOfGuests,
      totalUnits,
      roomTypes,
    } = req.body;

    // Always assign the authenticated user as the owner — ignore client-supplied userRef
    const userRef = req.user.id;

    const listing = await Listing.create({
      imageUrls,
      videoUrl,
      name,
      description,
      near,
      rules,
      address,
      contact,
      host,
      kind,
      period,
      cancel,
      type,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      regularPrice,
      discountPrice,
      parking,
      pool,
      wifi,
      kitchen,
      stove,
      tv,
      storage,
      security,
      furnished,
      offer,
      userRef,
      hot,
      pets,
      prepaid,
      fridge,
      share,
      breakfast,
      party,
      instantConfirmation,
      kidFriendly,
      wheelchairAccessible,
      parkingAvailable,
      environmentallyFriendly,
      numberOfApartments: Number(numberOfApartments) || 0,
      numberOfRooms: Number(numberOfRooms) || (Number(bedrooms) || 1),
      numberOfGuests: Number(numberOfGuests) || 1,
      totalUnits: Number(totalUnits) || 1,
      roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
    });

    createAreaNotifications(listing, 'listing');

    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// Delete Listing (unchanged)
// Delete Listing (Permanent Delete)
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    // Ensure userRef comparison is done with toString()
    if (req.user.id !== listing.userRef.toString()) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    // Permanent deletion from database
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing has been permanently deleted!'
    });
  } catch (error) {
    next(errorHandler(500, 'Failed to delete listing. Please try again.'));
  }
};

// Update Listing
export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  // Fix: compare string to string (listing.userRef is an ObjectId, req.user.id is a string)
  const ownerId = (listing.userRef?._id || listing.userRef).toString();
  if (req.user.id !== ownerId) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {

    if (req.body.imageUrls) {
      const imageCheck = await validateImages(req.body.imageUrls);
      if (!imageCheck.valid) {
        return next(errorHandler(400, imageCheck.message));
      }
    }

    // Sanitize: only permit known listing fields; never allow overwriting userRef or _id
    const {
      imageUrls, videoUrl, name, description, near, rules, address, contact, host,
      kind, period, cancel, type, bedrooms, bathrooms, regularPrice, discountPrice,
      parking, pool, wifi, kitchen, stove, tv, storage, security, furnished, offer,
      hot, pets, prepaid, fridge, share, breakfast, party,
      instantConfirmation, kidFriendly, wheelchairAccessible, parkingAvailable, environmentallyFriendly,
      operatingHours,
      numberOfApartments, numberOfRooms, numberOfGuests, totalUnits, roomTypes
    } = req.body;

    const allowedUpdate = {
      imageUrls, videoUrl, name, description, near, rules, address, contact, host,
      kind, period, cancel, type, bedrooms, bathrooms, regularPrice, discountPrice,
      parking, pool, wifi, kitchen, stove, tv, storage, security, furnished, offer,
      hot, pets, prepaid, fridge, share, breakfast, party,
      instantConfirmation, kidFriendly, wheelchairAccessible, parkingAvailable, environmentallyFriendly,
      operatingHours,
      numberOfApartments, numberOfRooms, numberOfGuests, totalUnits, roomTypes
    };

    // Strip undefined values to avoid clearing existing fields unintentionally
    Object.keys(allowedUpdate).forEach(k => allowedUpdate[k] === undefined && delete allowedUpdate[k]);

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      allowedUpdate,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// Get Listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('userRef');
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    
    // Check if the user is the owner (if authenticated)
    // For now we fuzz for all public responses to be safe
    res.status(200).json(fuzzSingleItemLocation(listing));

  } catch (error) {
    next(error);
  }
};



// Get Listings (unchanged)
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let pool = req.query.pool;

    if (pool === undefined || pool === 'false') {
      pool = { $in: [false, true] };
    }

    let wifi = req.query.wifi;

    if (wifi === undefined || wifi === 'false') {
      wifi = { $in: [false, true] };
    }

    let kitchen = req.query.kitchen;

    if (kitchen === undefined || kitchen === 'false') {
      kitchen = { $in: [false, true] };
    }

    let stove = req.query.stove;

    if (stove === undefined || stove === 'false') {
      stove = { $in: [false, true] };
    }

    let tv = req.query.tv;

    if (tv === undefined || tv === 'false') {
      tv = { $in: [false, true] };
    }

    let storage = req.query.storage;

    if (storage === undefined || storage === 'false') {
      storage = { $in: [false, true] };
    }

    let security = req.query.security;

    if (security === undefined || security === 'false') {
      security = { $in: [false, true] };
    }

    let hot = req.query.hot;

    if (hot === undefined || hot === 'false') {
      hot = { $in: [false, true] };
    }

    let pets = req.query.pets;

    if (pets === undefined || pets === 'false') {
      pets = { $in: [false, true] };
    }

    let prepaid = req.query.prepaid;

    if (prepaid === undefined || prepaid === 'false') {
      prepaid = { $in: [false, true] };
    }

    let fridge = req.query.fridge;

    if (fridge === undefined || fridge === 'false') {
      fridge = { $in: [false, true] };
    }

    let share = req.query.share;

    if (share === undefined || share === 'false') {
      share = { $in: [false, true] };
    }

    let breakfast = req.query.breakfast;
    if (breakfast === undefined || breakfast === 'false') {
      breakfast = { $in: [false, true] };
    }

    let party = req.query.party;
    if (party === undefined || party === 'false') {
      party = { $in: [false, true] };
    }


    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent', 'over', 'office', 'land', 'resort', 'guest_house', 'hotel', 'apartment', 'guesthouse'] };
    }

    const searchTerm = req.query.searchTerm || '';
    const address = req.query.address || '';
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const price = {};
    if (Number.isFinite(minPrice)) price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) price.$lte = maxPrice;

    let bedrooms = req.query.bedrooms;
    if (bedrooms === undefined || bedrooms === '0') {
      bedrooms = { $gte: 0 };
    } else {
      bedrooms = Number(bedrooms);
    }

    let bathrooms = req.query.bathrooms;
    if (bathrooms === undefined || bathrooms === '0') {
      bathrooms = { $gte: 0 };
    } else {
      bathrooms = Number(bathrooms);
    }

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } }
      ],
      address: { $regex: address, $options: 'i' },
      offer,
      furnished,
      parking,
      pool,
      wifi,
      kitchen,
      stove,
      tv,
      storage,
      security,
      hot,
      pets,
      prepaid,
      fridge,
      share,
      breakfast,
      party,
      type,
      bedrooms,
      bathrooms,
      ...(Object.keys(price).length && { regularPrice: price }),
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex)
      .populate('userRef', 'username avatar');

    return res.status(200).json(fuzzItemsLocation(listings));
  } catch (error) {
    next(error);
  }
};

// Get Similar Listings
export const getSimilarListings = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    const similarListings = await Listing.find({
      _id: { $ne: req.params.id },
      type: listing.type,
      // Optional: try to match address/city if possible
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.status(200).json(fuzzItemsLocation(similarListings));
  } catch (error) {
    next(error);
  }
};

// Get distinct property kinds for a given type
export const getKinds = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const kinds = await Listing.distinct('kind', query);
    res.status(200).json(kinds);
  } catch (error) {
    next(error);
  }
};


