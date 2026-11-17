import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';
import { notifyLoopOutAdmins } from '../utils/notifyLoopOutAdmins.js';

const isValidKycPdf = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-4' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return false;
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > 10 * 1024 * 1024) return false;
    const bytes = new Uint8Array(await response.arrayBuffer());
    return bytes.length <= 10 * 1024 * 1024
      && new TextDecoder().decode(bytes.subarray(0, 5)) === '%PDF-';
  } catch {
    return false;
  }
};

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
        }
      },
      { new: true }
    );

    if (!user) return next(errorHandler(404, 'User not found'));

    res.status(202).json({ success: true, message: 'Face scan saved. Submit your ID or passport PDF and document number to send a complete identity review.' });
  } catch (error) {
    next(error);
  }
};

export const submitKyc = async (req, res, next) => {
  const { idDocumentUrl, liveSelfieUrl, idDocumentNumber } = req.body;
  const userId = req.user.id;

  try {
    const normalizedNumber = String(idDocumentNumber || '').replace(/[\s-]/g, '').toUpperCase();
    if (!/^([A-Z0-9]){5,25}$/.test(normalizedNumber)) {
      return res.status(400).json({ success: false, message: 'Enter the ID or passport number shown on your document (5–25 letters or numbers).' });
    }

    const isKycStorageUrl = (value, folder) => {
      try {
        const parsed = new URL(value);
        const path = decodeURIComponent(parsed.pathname);
        return parsed.protocol === 'https:'
          && ['firebasestorage.googleapis.com', 'storage.googleapis.com'].includes(parsed.hostname)
          && path.includes(`kyc/${folder}/`);
      } catch {
        return false;
      }
    };
    if (!isKycStorageUrl(idDocumentUrl, 'idDocuments') || !isKycStorageUrl(liveSelfieUrl, 'selfies')) {
      return res.status(400).json({ success: false, message: 'Upload a PDF identity document and complete the live selfie before submitting.' });
    }
    if (!(await isValidKycPdf(idDocumentUrl))) {
      return res.status(400).json({ success: false, message: 'The uploaded identity document is not a valid PDF under 10 MB. Please upload it again.' });
    }

    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        idDocumentUrl,
        liveSelfieUrl,
        idDocumentNumber: normalizedNumber,
        kycStatus: 'pending',
        kycSubmittedAt: new Date(),
        kycReviewedAt: null,
        kycReviewedBy: null,
        kycReviewNote: '',
        kycReviewChecks: { numberMatches: false, documentHasFace: false, faceMatchesSelfie: false },
        'faceData.imageUrl': liveSelfieUrl,
        'faceData.verified': false,
        'faceData.detectedAt': new Date(),
      }
    }, { new: true });

    if (!user) return next(errorHandler(404, 'User not found'));

    await notifyLoopOutAdmins({
      title: 'Identity verification needs review',
      message: `${user.username || 'A user'} submitted identity documents for manual review.`,
      data: { adminAlertType: 'identity_pending', targetUserId: String(user._id) },
    });

    res.status(202).json({ success: true, message: 'Your PDF and live selfie were submitted. An administrator must check the document number and compare the ID photo with your selfie before identity verification is complete.' });
  } catch (error) {
    next(error);
  }
};

export const getVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('offeringType idDocumentUrl liveSelfieUrl faceData avatar isVerified kycStatus kycReviewNote');
    if (!user) return next(errorHandler(404, 'User not found'));

    const hasIdDocument = Boolean(user.idDocumentUrl && user.idDocumentUrl.trim() !== '');
    const hasFaceScan = Boolean(
      (user.liveSelfieUrl && user.liveSelfieUrl.trim() !== '') ||
      (user.faceData?.imageUrl && user.faceData.imageUrl.trim() !== '')
    );
    const isDefaultAvatar = !user.avatar || user.avatar.includes('blank-profile-picture') || user.avatar.trim() === '';
    const hasProfilePicture = !isDefaultAvatar;
    const isIdentityReviewed = user.kycStatus === 'verified';
    const isCompliant = hasIdDocument && hasFaceScan && hasProfilePicture && isIdentityReviewed;

    const missing = [];
    if (!hasIdDocument) missing.push('ID document or passport');
    if (!hasFaceScan) missing.push('Face scan / live selfie');
    if (!hasProfilePicture) missing.push('Profile picture');
    if (!isIdentityReviewed) missing.push(user.kycStatus === 'rejected' ? 'resubmit identity documents' : 'administrator identity review');

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
      kycReviewNote: user.kycReviewNote || '',
      isVerified: user.isVerified || false,
    });
  } catch (error) {
    next(error);
  }
};

const isSecureDocumentUrl = (value) => {
  if (typeof value !== 'string' || value.trim().length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname));
  } catch {
    return false;
  }
};

export const getDriverVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User not found.'));
    const verification = user.driverVerification || {};
    return res.json({
      success: true,
      status: verification.status || 'unverified',
      submittedAt: verification.submittedAt || null,
      reviewedAt: verification.reviewedAt || null,
      reviewNote: verification.reviewNote || '',
      documents: {
        idDocumentUrl: verification.idDocumentUrl || '',
        facePhotoUrl: verification.facePhotoUrl || '',
        licenceDocumentUrl: verification.licenceDocumentUrl || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitDriverVerification = async (req, res, next) => {
  try {
    const { idDocumentUrl, facePhotoUrl, licenceDocumentUrl } = req.body;
    if (![idDocumentUrl, facePhotoUrl, licenceDocumentUrl].every(isSecureDocumentUrl)) {
      return res.status(400).json({ success: false, message: 'Upload an ID document, a clear face photo, and a driving licence before submitting.' });
    }

    const user = await User.findById(req.user.id).select('+driverVerification');
    if (!user) return next(errorHandler(404, 'User not found.'));
    if (user.driverVerification?.status === 'verified') {
      return res.status(200).json({ success: true, status: 'verified', message: 'Your driver documents are already approved.' });
    }
    if (user.driverVerification?.status === 'pending') {
      return res.status(409).json({ success: false, message: 'Your driver documents are already waiting for administrator review.' });
    }

    user.driverVerification = {
      status: 'pending',
      idDocumentUrl: idDocumentUrl.trim(),
      facePhotoUrl: facePhotoUrl.trim(),
      licenceDocumentUrl: licenceDocumentUrl.trim(),
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: '',
      reviewChecks: { idIsReadable: false, faceMatchesId: false, licenceIsValid: false },
    };
    await user.save();

    await notifyLoopOutAdmins({
      title: 'Shuttle driver documents need review',
      message: `${user.username || 'A driver'} submitted an ID, face photo, and driving licence for shuttle approval.`,
      data: { adminAlertType: 'shuttle_driver_verification_pending', targetUserId: String(user._id), route: '/admin/verification' },
    });

    return res.status(202).json({ success: true, status: 'pending', message: 'Documents submitted. A LoopOut administrator must review and approve them before you can add a shuttle.' });
  } catch (error) {
    next(error);
  }
};

export const getPendingDriverReviews = async (req, res, next) => {
  try {
    const submissions = await User.find({ 'driverVerification.status': 'pending' })
      .select('username email +driverVerification')
      .sort({ 'driverVerification.submittedAt': 1, _id: 1 })
      .lean();
    return res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
};

export const reviewDriverVerification = async (req, res, next) => {
  try {
    const { status, checks = {}, note = '' } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Choose approve or reject.' });
    }
    const reviewChecks = {
      idIsReadable: checks.idIsReadable === true,
      faceMatchesId: checks.faceMatchesId === true,
      licenceIsValid: checks.licenceIsValid === true,
    };
    if (status === 'verified' && !Object.values(reviewChecks).every(Boolean)) {
      return res.status(400).json({ success: false, message: 'Confirm the ID is readable, the face matches, and the driving licence is valid before approving.' });
    }
    if (status === 'rejected' && !String(note).trim()) {
      return res.status(400).json({ success: false, message: 'Add a reason so the driver knows what to correct.' });
    }

    const user = await User.findOne({ _id: req.params.userId, 'driverVerification.status': 'pending' }).select('+driverVerification');
    if (!user) return res.status(404).json({ success: false, message: 'Pending driver document application not found.' });
    const docs = user.driverVerification || {};
    if (![docs.idDocumentUrl, docs.facePhotoUrl, docs.licenceDocumentUrl].every(isSecureDocumentUrl)) {
      return res.status(400).json({ success: false, message: 'This application is missing a required document. Ask the driver to resubmit.' });
    }

    user.driverVerification.status = status;
    user.driverVerification.reviewedAt = new Date();
    user.driverVerification.reviewedBy = req.user.id;
    user.driverVerification.reviewNote = String(note).trim().slice(0, 500);
    user.driverVerification.reviewChecks = reviewChecks;
    await user.save();

    try {
      await Notification.create({
        userId: user._id,
        type: 'shuttle',
        title: status === 'verified' ? 'Shuttle driver documents approved' : 'Shuttle driver documents need changes',
        message: status === 'verified'
          ? 'Your ID, face photo, and driving licence were approved. You can now add your shuttle vehicle.'
          : `Your driver application needs changes: ${user.driverVerification.reviewNote}`,
        data: { driverVerificationStatus: status, route: '/shuttles?register=true' },
      });
    } catch (notificationError) {
      console.warn('Driver verification notification failed:', notificationError.message);
    }

    return res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
};

export const getPendingKycReviews = async (req, res, next) => {
  try {
    const submissions = await User.find({
      kycStatus: 'pending',
      idDocumentUrl: { $type: 'string', $ne: '' },
      liveSelfieUrl: { $type: 'string', $ne: '' },
    })
      .select('username email offeringType idDocumentUrl liveSelfieUrl kycStatus kycSubmittedAt +idDocumentNumber')
      .sort({ kycSubmittedAt: 1, _id: 1 })
      .lean();
    res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
};

export const reviewKyc = async (req, res, next) => {
  try {
    const { status, checks = {}, note = '' } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Choose approve or reject.' });
    }
    const reviewChecks = {
      numberMatches: checks.numberMatches === true,
      documentHasFace: checks.documentHasFace === true,
      faceMatchesSelfie: checks.faceMatchesSelfie === true,
    };
    if (status === 'verified' && !Object.values(reviewChecks).every(Boolean)) {
      return res.status(400).json({ success: false, message: 'Confirm the document number, ID photo, and face match before approving.' });
    }
    if (status === 'rejected' && !String(note).trim()) {
      return res.status(400).json({ success: false, message: 'Add a reason so the applicant knows what to correct.' });
    }

    const user = await User.findOne({ _id: req.params.userId, kycStatus: 'pending' }).select('+idDocumentNumber');
    if (!user) return res.status(404).json({ success: false, message: 'Pending identity submission not found.' });
    if (status === 'verified' && (!user.idDocumentNumber || !(await isValidKycPdf(user.idDocumentUrl)))) {
      return res.status(400).json({ success: false, message: 'This submission is missing a valid PDF or document number. Ask the applicant to resubmit it.' });
    }
    user.kycStatus = status;
    user.kycReviewedAt = new Date();
    user.kycReviewedBy = req.user.id;
    user.kycReviewNote = String(note).trim().slice(0, 500);
    user.kycReviewChecks = reviewChecks;
    user.faceData = { ...(user.faceData?.toObject?.() || user.faceData || {}), verified: status === 'verified' };
    user.idDocumentNumber = '';
    await user.save();
    res.json({ success: true, kycStatus: user.kycStatus });
  } catch (error) {
    next(error);
  }
};
