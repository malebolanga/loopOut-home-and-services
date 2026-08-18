import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const SESSION_EXPIRES_IN = '365d';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_MS,
});

const issueSession = (res, user, status = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: SESSION_EXPIRES_IN });
  const { password, otp, ...safeUser } = user.toObject ? user.toObject() : user;
  return res.cookie('access_token', token, cookieOptions()).status(status).json({ ...safeUser, token, access_token: token });
};

const sendVerificationCode = async (user, subject = 'Your LoopOut verification code', purpose = 'verify') => {
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
  user.otp = hashOtp(otp);
  user.otpExpiry = otpExpiry;
  user.otpAttempts = 0;
  user.otpPurpose = purpose;
  await user.save();
  const text = `Your LoopOut verification code is: ${otp}. It expires in 10 minutes.`;
  const html = `<p>Use this code to verify your LoopOut account. It expires in <strong>10 minutes</strong>.</p><p style="font-size:28px;letter-spacing:6px"><strong>${otp}</strong></p>`;
  
  try {
    const emailResult = await sendEmail(user.email, subject, text, html);
    if (!emailResult.success) {
      console.warn(`\n⚠️ [VERIFICATION CODE] Email delivery to ${user.email} failed: ${emailResult.error}`);
      console.warn(`👉 VERIFICATION CODE FOR ${user.email}: [ ${otp} ]\n`);
    }
    if (user.phone) await sendSMS(user.phone, text);
    return { success: emailResult.success, otp };
  } catch (error) {
    console.error('Verification code delivery failed:', error.message);
    console.warn(`👉 FALLBACK VERIFICATION CODE FOR ${user.email}: [ ${otp} ]\n`);
    return { success: false, otp };
  }
};

const firebaseAuth = async () => {
  const { getApps, initializeApp, cert, applicationDefault } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  if (!getApps().length) {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (rawServiceAccount) initializeApp({ credential: cert(JSON.parse(rawServiceAccount)) });
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) initializeApp({ credential: applicationDefault() });
    else throw new Error('Firebase Admin credentials are not configured.');
  }
  return getAuth();
};


const validateSignup = ({ username, email, password, phone, location, acceptedTerms }) => {
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(String(username || '').trim())) return 'Choose a username with 3–30 letters, numbers, or underscores.';
  if (!emailPattern.test(normalizeEmail(email))) return 'Enter a valid email address.';
  if (!isStrongPassword(password)) return 'Use a password of at least 6 characters.';
  if (!String(phone || '').trim() || !String(location || '').trim()) return 'Phone number and location are required.';
  if (acceptedTerms !== true) return 'You must accept the Terms of Service and Privacy Policy.';
  return null;
};

export const signup = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = normalizeEmail(req.body.email);
    const validationError = validateSignup({ ...req.body, username, email });
    if (validationError) return next(errorHandler(400, validationError));

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail?.isVerified) return next(errorHandler(409, 'An account already exists for those details. Please sign in.'));
    if (existingUsername && (!existingEmail || String(existingUsername._id) !== String(existingEmail._id))) return next(errorHandler(409, 'That username is already taken.'));

    const updates = {
      username,
      email,
      password: await bcryptjs.hash(req.body.password, 12),
      phone: String(req.body.phone).trim(),
      location: String(req.body.location).trim(),
      accessContacts: false,
      contacts: [],
      isVerified: false,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    };
    
    let user;
    if (existingEmail) {
      Object.assign(existingEmail, updates);
      user = existingEmail;
    } else {
      user = new User(updates);
    }

    const delivery = await sendVerificationCode(user, existingEmail ? 'Complete your LoopOut registration' : 'Your LoopOut verification code');
    const isDev = process.env.NODE_ENV !== 'production' || !process.env.EMAIL_USER;

    return res.status(existingEmail ? 200 : 201).json({
      success: true,
      requiresVerification: true,
      email,
      message: delivery.success
        ? `A verification code has been sent to ${email}.`
        : `A verification code has been generated for ${email}.`,
      ...(isDev || delivery.simulated || !delivery.success ? { devCode: delivery.otp, emailDeliveryFailed: !delivery.success } : {})
    });
  } catch (error) { return next(error); }
};

export const signin = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const user = emailPattern.test(email) ? await User.findOne({ email }) : null;
    const validPassword = user && await bcryptjs.compare(password || '', user.password);
    if (!validPassword) return next(errorHandler(401, 'Invalid email or password.'));
    if (!user.isVerified) {
      const codeCreatedAt = user.otpExpiry ? user.otpExpiry.getTime() - OTP_TTL_MS : 0;
      if (user.otpPurpose !== 'verify' || Date.now() - codeCreatedAt >= OTP_RESEND_COOLDOWN_MS) await sendVerificationCode(user);
      return res.status(403).json({ success: false, requiresVerification: true, email, message: 'Verify your email before signing in.' });
    }
    return issueSession(res, user);
  } catch (error) { return next(error); }
};

export const google = async (req, res, next) => {
  try {
    if (!req.body.idToken || typeof req.body.idToken !== 'string') return next(errorHandler(400, 'A Google identity token is required.'));
    let decoded;
    try { decoded = await (await firebaseAuth()).verifyIdToken(req.body.idToken, true); }
    catch (error) {
      if (error.message === 'Firebase Admin credentials are not configured.') return next(errorHandler(503, 'Google sign-in is temporarily unavailable.'));
      return next(errorHandler(401, 'Google sign-in could not be verified.'));
    }
    const email = normalizeEmail(decoded.email);
    if (!email || !decoded.email_verified) return next(errorHandler(401, 'A verified Google email address is required.'));
    let user = await User.findOne({ email });
    if (!user) {
      const base = (decoded.name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'member';
      const username = `${base}${crypto.randomBytes(3).toString('hex')}`;
      user = await User.create({ username, email, password: await bcryptjs.hash(crypto.randomBytes(32).toString('hex'), 12), avatar: decoded.picture || undefined, isVerified: true });
    }
    return issueSession(res, user);
  } catch (error) { return next(error); }
};

export const signOut = async (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: 'Signed out successfully' });
};

export const validateToken = async (req, res, next) => {
  try {
    let token = req.cookies.access_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(200).json({ valid: false });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otp');
    if (!user || !user.isVerified) return res.status(200).json({ valid: false });
    // Renew both the cookie and bearer token while the session is valid.
    const refreshedToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: SESSION_EXPIRES_IN });
    const { password, otp, ...safeUser } = user.toObject ? user.toObject() : user;
    return res.cookie('access_token', refreshedToken, cookieOptions()).status(200).json({
      valid: true,
      user: safeUser,
      token: refreshedToken,
      access_token: refreshedToken,
    });
  } catch (error) { return res.status(200).json({ valid: false }); }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    if (!emailPattern.test(email) || !/^\d{6}$/.test(otp)) return next(errorHandler(400, 'Enter your email and the six-digit verification code.'));
    const user = await User.findOne({ email });
    if (!user || user.isVerified || user.otpPurpose !== 'verify') return next(errorHandler(400, 'That verification code is invalid or has expired.'));
    if (!user.otp || !user.otpExpiry || Date.now() > user.otpExpiry.getTime()) return next(errorHandler(400, 'That verification code is invalid or has expired.'));
    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) return next(errorHandler(429, 'Too many incorrect codes. Request a new code and try again.'));
    if (hashOtp(otp) !== user.otp) { user.otpAttempts = (user.otpAttempts || 0) + 1; await user.save(); return next(errorHandler(400, 'That verification code is invalid or has expired.')); }
    user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined; user.otpAttempts = 0; user.otpPurpose = undefined; await user.save();
    return issueSession(res, user);
  } catch (error) { return next(error); }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = emailPattern.test(email) ? await User.findOne({ email }) : null;
    if (user?.isVerified) {
      const createdAt = user.otpExpiry ? user.otpExpiry.getTime() - OTP_TTL_MS : 0;
      if (user.otpPurpose !== 'reset' || Date.now() - createdAt >= OTP_RESEND_COOLDOWN_MS) await sendVerificationCode(user, 'Your LoopOut password reset code', 'reset');
    }
    return res.status(200).json({ success: true, message: 'If an account matches that email, a reset code has been sent.' });
  } catch (error) { return next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    const password = req.body.password;
    if (!emailPattern.test(email) || !/^\d{6}$/.test(otp) || !isStrongPassword(password)) return next(errorHandler(400, 'Enter a valid email, six-digit code, and a strong password.'));
    const user = await User.findOne({ email });
    if (!user || user.otpPurpose !== 'reset' || !user.otp || !user.otpExpiry || Date.now() > user.otpExpiry.getTime() || (user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS || hashOtp(otp) !== user.otp) {
      if (user?.otp && user.otpPurpose === 'reset') { user.otpAttempts = (user.otpAttempts || 0) + 1; await user.save(); }
      return next(errorHandler(400, 'That reset code is invalid or has expired.'));
    }
    user.password = await bcryptjs.hash(password, 12); user.otp = undefined; user.otpExpiry = undefined; user.otpAttempts = 0; user.otpPurpose = undefined; await user.save();
    return res.status(200).json({ success: true, message: 'Your password has been reset. Please sign in.' });
  } catch (error) { return next(error); }
};

export const resendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = emailPattern.test(email) ? await User.findOne({ email }) : null;
    // The response stays generic so this endpoint cannot reveal registered accounts.
    if (!user || user.isVerified) return res.status(200).json({ success: true, message: 'If an unverified account exists, a code has been sent.' });
    const createdAt = user.otpExpiry ? user.otpExpiry.getTime() - OTP_TTL_MS : 0;
    if (Date.now() - createdAt < OTP_RESEND_COOLDOWN_MS) return next(errorHandler(429, 'Please wait a minute before requesting another code.'));
    const delivery = await sendVerificationCode(user, 'Your new LoopOut verification code');
    const isDev = process.env.NODE_ENV !== 'production' || !process.env.EMAIL_USER;
    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists, a code has been sent.',
      ...(isDev || delivery.simulated || !delivery.success ? { devCode: delivery.otp, emailDeliveryFailed: !delivery.success } : {})
    });
  } catch (error) { return next(error); }
};
