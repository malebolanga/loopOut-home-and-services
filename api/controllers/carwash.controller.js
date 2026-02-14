import Service from '../models/service.model.js';
import { errorHandler } from '../utils/error.js';

// Get single car wash by ID
export const getCarWash = async (req, res, next) => {
  try {
    const carWash = await Service.findById(req.params.id);
    
    if (!carWash) {
      return next(errorHandler(404, 'Car wash not found!'));
    }
    
    // Ensure it's a car wash service type
    if (carWash.type !== 'carwash') {
      return next(errorHandler(400, 'This is not a car wash service'));
    }
    
    res.status(200).json(carWash);
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch car wash details'));
  }
};

// Get all car washes with filters
export const getCarWashes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const query = {
      type: 'carwash',
      ...(searchTerm && {
        name: { $regex: searchTerm, $options: 'i' }
      })
    };

    const carWashes = await Service.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json(carWashes);
  } catch (error) {
    next(errorHandler(500, 'Failed to fetch car washes'));
  }
};