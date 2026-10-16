import User from '../models/user.model.js';

export const requireOfferingType = (...allowedTypes) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('offeringType idDocumentUrl liveSelfieUrl faceData avatar isVerified kycStatus');
    if (!user) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });

    // Food shop operations strictly require the 'food' offering type selected on sign-up
    if (allowedTypes.includes('food')) {
      if (user.offeringType !== 'food') {
        return res.status(403).json({
          success: false,
          message: 'Only accounts registered as a food shop owner on sign-up can register or manage a shop. Other accounts can only view and order.'
        });
      }
      return next();
    }

    // Accounts created before offering roles were added keep their existing access.
    if (!user.offeringType) return next();
    if (user.offeringType === 'viewer' || !allowedTypes.includes(user.offeringType)) {
      return res.status(403).json({ success: false, message: 'Your account is set up for browsing, booking, and requests. Choose a matching provider account to publish.' });
    }

    // Service providers & helpers must have submitted documents, completed face scan, and uploaded a profile picture
    if (allowedTypes.includes('services') || user.offeringType === 'services') {
      const hasIdDocument = Boolean(user.idDocumentUrl && user.idDocumentUrl.trim() !== '');
      const hasFaceScan = Boolean(
        (user.liveSelfieUrl && user.liveSelfieUrl.trim() !== '') ||
        (user.faceData?.imageUrl && user.faceData.imageUrl.trim() !== '')
      );
      const isDefaultAvatar = !user.avatar || user.avatar.includes('blank-profile-picture') || user.avatar.trim() === '';
      const hasProfilePicture = !isDefaultAvatar;

      if (!hasIdDocument || !hasFaceScan || !hasProfilePicture) {
        const missing = [];
        if (!hasIdDocument) missing.push('ID document or passport');
        if (!hasFaceScan) missing.push('face scan (live selfie)');
        if (!hasProfilePicture) missing.push('profile picture');

        return res.status(403).json({
          success: false,
          requiresVerification: true,
          message: `As a service provider or helper, you must complete verification before posting. Please upload: ${missing.join(', ')}.`,
          missing: {
            idDocument: !hasIdDocument,
            faceScan: !hasFaceScan,
            profilePicture: !hasProfilePicture,
          }
        });
      }
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
