import User from '../models/user.model.js';

export const requireOfferingType = (...allowedTypes) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('offeringType');
    if (!user) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    // Accounts created before offering roles were added keep their existing access.
    if (!user.offeringType) return next();
    if (user.offeringType === 'viewer' || !allowedTypes.includes(user.offeringType)) {
      return res.status(403).json({ success: false, message: 'Your account is set up for browsing, booking, and requests. Choose a matching provider account to publish.' });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireProviderAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('offeringType');
    if (!user) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    if (user.offeringType === 'viewer') return res.status(403).json({ success: false, message: 'Browsing accounts cannot publish listings.' });
    return next();
  } catch (error) {
    return next(error);
  }
};
