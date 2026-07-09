import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import { createAreaNotifications } from '../utils/notificationUtils.js';
import { fuzzItemsLocation, fuzzSingleItemLocation } from '../utils/locationFuzzer.js';

// Create Listing
export const createListing = async (req, res, next) => {
  try {
    const {
      imageUrls,
      videoUrl, // Ensure this is included
      name,
      description,
      near,
      rules,
      address,
      contact,
      host,
      kind,
      period, // Fixed typo from 'peroid' to 'period'
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
      userRef,
      hot,      // Added missing fields
      pets,     // Added missing fields
      prepaid,  // Added missing fields
      fridge,   // Added missing fields
      share,    // Added missing fields
      breakfast,
      party,
      instantConfirmation,
      kidFriendly,
      wheelchairAccessible,
      parkingAvailable,
      environmentallyFriendly,
    } = req.body;

    // Create a new listing with videoUrl
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
    });

    // Create notifications for users in the area
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
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body, // Include videoUrl if provided in the request
      },
      { new: true }
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
      type = { $in: ['sale', 'rent', 'over', 'office', 'land', 'resort'] };
    }

    const searchTerm = req.query.searchTerm || '';
    const address = req.query.address || '';

    let bedrooms = req.query.bedrooms;
    if (bedrooms === undefined || bedrooms === '0') {
      bedrooms = { $in: [1, 2, 3, 4, 5, 6, 10] }; // Allowing all common bedroom counts
    }

    let bathrooms = req.query.bathrooms;
    if (bathrooms === undefined || bathrooms === '0') {
      bathrooms = { $in: [1, 2, 3, 4, 5, 6, 10] };
    }

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
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


