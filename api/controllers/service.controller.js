import Service from '../models/service.model.js';
import { errorHandler } from '../utils/error.js';
import { createAreaNotifications } from '../utils/notificationUtils.js';
import { fuzzItemsLocation, fuzzSingleItemLocation } from '../utils/locationFuzzer.js';
import { validateListingText, validateImages } from '../utils/moderationHelper.js';

// Create Service
export const createService = async (req, res, next) => {
  try {

    const imageCheck = await validateImages(req.body.imageUrls);
    if (!imageCheck.valid) {
      return next(errorHandler(400, imageCheck.message));
    }
    const serviceData = {
      ...req.body,
      creator: req.user.id,
      userRef: req.user.id
    };

    // Handle conditional fields based on service type
    if (req.body.type !== 'daycare') {
      delete serviceData.ageGroup;
      delete serviceData.licenseNumber;
      delete serviceData.capacity;
      delete serviceData.meals;
    }

    if (req.body.type !== 'schoolTransport') {
      delete serviceData.vehicleType;
      delete serviceData.routeAreas;
      delete serviceData.childSeats;
    }

    if (req.body.type !== 'carwash') {
      delete serviceData.carWashPackages;
      delete serviceData.vehicleTypes;
      delete serviceData.additionalServices;
      delete serviceData.serviceDuration;
      delete serviceData.mobileService;
      delete serviceData.ecoFriendly;
      delete serviceData.additionalPricing;
    }

    if (req.body.type !== 'moving') {
      delete serviceData.moveCostPerBox;
      delete serviceData.moveCostPerKilo;
      delete serviceData.movePriceVan;
      delete serviceData.movePriceVanTrailer;
      delete serviceData.movePriceMiniTruck;
      delete serviceData.movePriceOtherTruck;
      delete serviceData.movePriceBigTruckTrailer;
    }

    if (req.body.type !== 'storage') {
      delete serviceData.storageSize;
      delete serviceData.storagePriceDay;
      delete serviceData.storagePriceMonth;
      delete serviceData.storageFailurePolicy;
      delete serviceData.storageTerms;
    }

    const service = await Service.create(serviceData);

    // Create notifications for users in the area
    createAreaNotifications(service, 'service');

    return res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

// Delete Service (unchanged)
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }

    if (req.user.id !== service.creator.toString()) {
      return next(errorHandler(401, 'You can only delete your own services!'));
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service has been deleted!'
    });
  } catch (error) {
    next(errorHandler(500, 'Failed to delete service'));
  }
};

export const updateService = async (req, res, next) => {
  try {

    if (req.body.imageUrls) {
      const imageCheck = await validateImages(req.body.imageUrls);
      if (!imageCheck.valid) {
        return next(errorHandler(400, imageCheck.message));
      }
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }
    if (req.user.id !== service.creator.toString()) {
      return next(errorHandler(401, 'You can only update your own services!'));
    }

    // Handle conditional fields based on service type
    const updateData = { ...req.body };

    if (req.body.type !== 'daycare') {
      delete updateData.ageGroup;
      delete updateData.licenseNumber;
      delete updateData.capacity;
      delete updateData.meals;
    }

    if (req.body.type !== 'schoolTransport') {
      delete updateData.vehicleType;
      delete updateData.routeAreas;
      delete updateData.childSeats;
    }

    if (req.body.type !== 'carwash') {
      delete updateData.carWashPackages;
      delete updateData.vehicleTypes;
      delete updateData.additionalServices;
      delete updateData.serviceDuration;
      delete updateData.mobileService;
      delete updateData.ecoFriendly;
      delete updateData.additionalPricing;
    }

    if (req.body.type !== 'moving') {
      delete updateData.moveCostPerBox;
      delete updateData.moveCostPerKilo;
      delete updateData.movePriceVan;
      delete updateData.movePriceVanTrailer;
      delete updateData.movePriceMiniTruck;
      delete updateData.movePriceOtherTruck;
      delete updateData.movePriceBigTruckTrailer;
    }

    if (req.body.type !== 'storage') {
      delete updateData.storageSize;
      delete updateData.storagePriceDay;
      delete updateData.storagePriceMonth;
      delete updateData.storageFailurePolicy;
      delete updateData.storageTerms;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    next(errorHandler(500, 'Failed to update service'));
  }
};

// Get Single Service
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('userRef')
      .populate('creator');

    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }

    // Convert to plain object to allow safe modification for backward compatibility
    const serviceData = service.toObject();

    // Ensure userRef is populated if creator exists (backward compatibility)
    if (!serviceData.userRef && serviceData.creator) {
      serviceData.userRef = serviceData.creator;
    }

    res.status(200).json(fuzzSingleItemLocation(serviceData));
  } catch (error) {
    next(error);
  }
};

// Get Multiple Services
export const getServices = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const offer = req.query.offer === 'true' ? true : false;
    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    let type = req.query.type;

    if (type === undefined || type === 'all') {
      // ✅ UPDATED: Include carwash and storage in default filter
      type = {
        $in: [
          'cleaning', 'handyman', 'maintenance', 'moving', 'landscaping',
          'catering', 'other', 'daycare', 'schoolTransport', 'carwash', 'storage'
        ]
      };
    }

    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } }
      ],
      ...(offer && { offer }),
      ...(type && { type }),
      ...(req.query.security && { security: req.query.security === 'true' }),
      ...(req.query.pets && { pets: req.query.pets === 'true' }),
      ...(req.query.kind && { kind: req.query.kind }),
      ...(req.query.cancel && { cancel: req.query.cancel }),
      ...(req.query.host && { host: req.query.host }),
      ...(req.query.address && { address: { $regex: req.query.address, $options: 'i' } }),
      ...(req.query.period && { period: req.query.period }),
      ...(req.query.near && { near: { $regex: req.query.near, $options: 'i' } }),
      ...(req.query.userRef && { userRef: req.query.userRef }),

      // Daycare filters
      ...(req.query.ageGroup && { ageGroup: req.query.ageGroup }),
      ...(req.query.licenseNumber && { licenseNumber: req.query.licenseNumber }),
      ...(req.query.capacity && { capacity: req.query.capacity }),
      ...(req.query.meals && { meals: req.query.meals === 'true' }),

      // School transport filters
      ...(req.query.vehicleType && { vehicleType: req.query.vehicleType }),
      ...(req.query.routeAreas && { routeAreas: req.query.routeAreas }),
      ...(req.query.childSeats && { childSeats: req.query.childSeats === 'true' }),

      // Car wash filters
      ...(req.query.carWashPackages && { carWashPackages: { $regex: req.query.carWashPackages, $options: 'i' } }),
      ...(req.query.vehicleTypes && { vehicleTypes: req.query.vehicleTypes }),
      ...(req.query.serviceDuration && { serviceDuration: { $regex: req.query.serviceDuration, $options: 'i' } }),
      ...(req.query.mobileService && { mobileService: req.query.mobileService === 'true' }),
      ...(req.query.ecoFriendly && { ecoFriendly: req.query.ecoFriendly === 'true' }),
    };

    const sortOrder = order === 'asc' || order === '1' || order === 1 ? 1 : -1;

    const services = await Service.find(query)
      .sort({ [sort]: sortOrder })
      .limit(limit)
      .skip(startIndex)
      .populate('userRef', 'username avatar');

    return res.status(200).json(fuzzItemsLocation(services));
  } catch (error) {
    next(error);
  }
};

// Get Similar Services
export const getSimilarServices = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }

    const similarServices = await Service.find({
      _id: { $ne: req.params.id },
      type: service.type,
    })
      .limit(4)
      .sort({ createdAt: -1 })
      .populate('userRef', 'username avatar');

    res.status(200).json(fuzzItemsLocation(similarServices));
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch similar services'));
  }
};

// Rate a Performer of a Service
export const rateServicePerformer = async (req, res, next) => {
  try {
    const { id } = req.params; // serviceId
    const { performerName, rating } = req.body;

    if (!performerName || rating === undefined || rating === null) {
      return next(errorHandler(400, 'Performer name and rating are required!'));
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return next(errorHandler(400, 'Rating must be a number between 1 and 5!'));
    }

    const service = await Service.findById(id);
    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }

    const performer = service.performers.find(p => p.name === performerName);
    if (!performer) {
      return next(errorHandler(404, 'Performer not found!'));
    }

    // Set defaults if not present
    if (performer.rating === undefined || performer.rating === null) {
      performer.rating = 5;
    }
    if (performer.ratingsCount === undefined || performer.ratingsCount === null) {
      performer.ratingsCount = 1;
    }

    // Compute new running average rating
    const currentRatingTotal = performer.rating * performer.ratingsCount;
    performer.ratingsCount += 1;
    performer.rating = Number(((currentRatingTotal + numRating) / performer.ratingsCount).toFixed(1));

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Performer rated successfully!',
      performer
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
