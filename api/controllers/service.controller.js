import Service from '../models/service.model.js';
import { errorHandler } from '../utils/error.js';

// Create Service
export const createService = async (req, res, next) => {
  try {
    const serviceData = {
      ...req.body,
      creator: req.user.id,
      userRef: req.user.id
    };

    // Handle conditional fields based on service type
    if (req.body.type !== 'daycare') {
      serviceData.ageGroup = undefined;
      serviceData.licenseNumber = undefined;
      serviceData.capacity = undefined;
      serviceData.meals = undefined;
    }

    if (req.body.type !== 'schoolTransport') {
      serviceData.vehicleType = undefined;
      serviceData.routeAreas = undefined;
      serviceData.childSeats = undefined;
    }

    const service = await Service.create(serviceData);
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

// Update Service
export const updateService = async (req, res, next) => {
  try {
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
      updateData.ageGroup = undefined;
      updateData.licenseNumber = undefined;
      updateData.capacity = undefined;
      updateData.meals = undefined;
    }

    if (req.body.type !== 'schoolTransport') {
      updateData.vehicleType = undefined;
      updateData.routeAreas = undefined;
      updateData.childSeats = undefined;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json(updatedService);
  } catch (error) {
    next(errorHandler(500, 'Failed to update service'));
  }
};

// Get Single Service (unchanged)
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(errorHandler(404, 'Service not found!'));
    }
    res.status(200).json(service);
  } catch (error) {
    next(errorHandler(500, 'Failed to get service'));
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
      // Include new service types in default filter
      type = { $in: [
        'cleaning', 'maintenance', 'moving', 'landscaping', 
        'catering', 'other', 'daycare', 'schoolTransport'
      ] };
    }

    const query = {
      name: { $regex: searchTerm, $options: 'i' },
      ...(offer && { offer }),
      ...(type && { type }),
      ...(req.query.security && { security: req.query.security === 'true' }),
      ...(req.query.pets && { pets: req.query.pets === 'true' }),
      ...(req.query.kind && { kind: req.query.kind }),
      ...(req.query.cancel && { cancel: req.query.cancel }),
      ...(req.query.host && { host: req.query.host }),
      ...(req.query.address && { address: req.query.address }),
      ...(req.query.period && { period: req.query.period }),
      ...(req.query.near && { near: req.query.near }),
      ...(req.query.userRef && { userRef: req.query.userRef }),
      
      // Add filters for new daycare fields
      ...(req.query.ageGroup && { ageGroup: req.query.ageGroup }),
      ...(req.query.licenseNumber && { licenseNumber: req.query.licenseNumber }),
      ...(req.query.capacity && { capacity: req.query.capacity }),
      ...(req.query.meals && { meals: req.query.meals === 'true' }),
      
      // Add filters for new transport fields
      ...(req.query.vehicleType && { vehicleType: req.query.vehicleType }),
      ...(req.query.routeAreas && { routeAreas: req.query.routeAreas }),
      ...(req.query.childSeats && { childSeats: req.query.childSeats === 'true' }),
    };

    const services = await Service.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(services);
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch services'));
  }
};