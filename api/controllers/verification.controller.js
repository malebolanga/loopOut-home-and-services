import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const sendOTP = async (req, res, next) => {
  const { type, value } = req.body;
  const userId = req.user.id;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.findByIdAndUpdate(
      userId,
      { otp, otpExpiry },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    // In a real scenario, you would send the SMS/Email here using a utility
    console.log(`[BACKEND] Sent OTP ${otp} to ${value} via ${type}`);

    res.status(200).json({ success: true, message: `OTP sent successfully to ${value}` });
  } catch (error) {
    next(error);
  }
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

    // Step verification success - we don't mark isVerified yet unless all steps are done
    // But for this simplified flow, we'll mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Identity verified via signal' });
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
          'faceData.verified': true,
          'faceData.detectedAt': new Date(),
          isVerified: true // Mark as fully verified for this demo
        }
      },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(200).json({ success: true, message: 'Neural face scan synced to backend' });
  } catch (error) {
    next(error);
  }
};
