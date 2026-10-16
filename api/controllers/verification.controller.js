import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const sendOTP = async (req, res, next) => {
  return next(errorHandler(503, 'Identity OTP delivery is not configured. Use the account email-verification flow instead.'));
};

export const verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, 'User not found'));

    if (user.otp !== otp) {
      return next(errorHandler(400, 'Invalid OTP signal'));
    }

    if (new Date() > user.otpExpiry) {
      return next(errorHandler(400, 'OTP signal expired'));
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Verification signal confirmed. Identity verification remains subject to review.' });
  } catch (error) {
    next(error);
  }
};

export const verifyFace = async (req, res, next) => {
  const { imageUrl } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'faceData.imageUrl': imageUrl,
          'faceData.verified': false,
          'faceData.detectedAt': new Date(),
          kycStatus: 'pending'
        }
      },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(202).json({ success: true, message: 'Face scan submitted for review.' });
  } catch (error) {
    next(error);
  }
};

export const submitKyc = async (req, res, next) => {
  const { idDocumentUrl, liveSelfieUrl } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          idDocumentUrl,
          liveSelfieUrl,
          kycStatus: 'pending', // Pending review by admin
          'faceData.imageUrl': liveSelfieUrl,
          'faceData.verified': false,
          'faceData.detectedAt': new Date(),
          kycStatus: 'pending'
        }
      },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(202).json({ success: true, message: 'KYC documents submitted for review.', user });
  } catch (error) {
    next(error);
  }
};

export const getVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('offeringType idDocumentUrl liveSelfieUrl faceData avatar isVerified kycStatus');
    if (!user) return next(errorHandler(404, 'User not found'));

    const hasIdDocument = Boolean(user.idDocumentUrl && user.idDocumentUrl.trim() !== '');
    const hasFaceScan = Boolean(
      (user.liveSelfieUrl && user.liveSelfieUrl.trim() !== '') ||
      (user.faceData?.imageUrl && user.faceData.imageUrl.trim() !== '')
    );
    const isDefaultAvatar = !user.avatar || user.avatar.includes('blank-profile-picture') || user.avatar.trim() === '';
    const hasProfilePicture = !isDefaultAvatar;
    const isCompliant = hasIdDocument && hasFaceScan && hasProfilePicture;

    const missing = [];
    if (!hasIdDocument) missing.push('ID document or passport');
    if (!hasFaceScan) missing.push('Face scan / live selfie');
    if (!hasProfilePicture) missing.push('Profile picture');

    res.status(200).json({
      success: true,
      isCompliant,
      hasIdDocument,
      hasFaceScan,
      hasProfilePicture,
      missing,
      idDocumentUrl: user.idDocumentUrl || '',
      liveSelfieUrl: user.liveSelfieUrl || '',
      faceData: user.faceData || null,
      avatar: user.avatar || '',
      kycStatus: user.kycStatus || 'unverified',
      isVerified: user.isVerified || false,
    });
  } catch (error) {
    next(error);
  }
};
