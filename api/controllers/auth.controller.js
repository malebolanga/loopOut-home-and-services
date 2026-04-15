import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const buildOtpEmailHtml = (otp) => `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;padding:40px 20px;">
    <div style="max-width:480px;margin:auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <h2 style="margin-top:0;font-size:24px;color:#111;">Verify your email</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Use the code below to complete your LoopOut sign-up. It expires in <strong>10 minutes</strong>.
      </p>
      <div style="margin:32px 0;text-align:center;">
        <span style="display:inline-block;font-size:40px;font-weight:700;letter-spacing:12px;color:#E31C5F;background:#fff0f3;padding:18px 32px;border-radius:12px;border:2px dashed #E31C5F;">
          ${otp}
        </span>
      </div>
      <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#bbb;font-size:12px;margin:0;">LoopOut &mdash; Home &amp; Services</p>
    </div>
  </div>
`;

// ─── Controllers ────────────────────────────────────────────────────────────

export const signup = async (req, res, next) => {
  const { username, email, password, phone, location, accessContacts, contacts } = req.body;
  try {
    // Check for existing user
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    
    // Case 1: Email exists
    if (existingEmail) {
      if (existingEmail.isVerified) {
        return next(errorHandler(409, 'An account with this email already exists and is already verified. Please sign in.'));
      }
      
      // If email exists but unverified, we check if the requested username is taken by ELSEWHERE
      if (existingUsername && existingUsername.email !== email && existingUsername.isVerified) {
          return next(errorHandler(409, 'That username is already taken by another verified user.'));
      }

      // If unverified email, we "resume" registration for them
      const hashedPassword = bcryptjs.hashSync(password, 10);
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      
      await User.findByIdAndUpdate(existingEmail._id, {
        username, // Allow updating username if it was a mistake
        password: hashedPassword,
        phone,
        location,
        accessContacts,
        contacts,
        otp,
        otpExpiry,
      });

      // Send fresh OTP
      sendEmail(
        email,
        'Resume your LoopOut registration',
        `Your verification code is: ${otp}. It expires in 10 minutes.`,
        buildOtpEmailHtml(otp)
      ).catch((err) => console.error('OTP email error:', err));

      if (phone) {
        sendSMS(
          phone,
          `Your LoopOut verification code is: ${otp}. It expires in 10 minutes.`
        ).catch((err) => console.error('OTP SMS error:', err));
      }

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email,
        phone,
        message: 'Account exists but was unverified. A fresh verification code has been sent.',
        devHint: process.env.NODE_ENV !== 'production' ? 'Check server console for code' : null
      });
    }

    // Case 2: Brand new email, but username taken
    if (existingUsername && existingUsername.isVerified) {
        return next(errorHandler(409, 'That username is already taken.'));
    }

    // New User Path
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      accessContacts,
      contacts,
      otp,
      otpExpiry,
      isVerified: false,
    });
    await newUser.save();

    // Send OTP email (non-blocking)
    sendEmail(
      email,
      'Your LoopOut verification code',
      `Your verification code is: ${otp}. It expires in 10 minutes.`,
      buildOtpEmailHtml(otp)
    ).catch((err) => console.error('OTP email error:', err));

    // Send OTP SMS (simulated/real - non-blocking)
    if (phone) {
      sendSMS(
        phone,
        `Your LoopOut verification code is: ${otp}. It expires in 10 minutes.`
      ).catch((err) => console.error('OTP SMS error:', err));
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email,
      phone,
      message: 'Account created. Please check your email and phone for the verification code.',
      // In development, we can help by showing where the logs are
      devHint: process.env.NODE_ENV !== 'production' ? 'Check server console for code' : null
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    // Block sign-in for unverified email accounts
    if (!validUser.isVerified) {
      // Re-send a fresh OTP so the user can complete verification
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      await User.findByIdAndUpdate(validUser._id, { otp, otpExpiry });
      sendEmail(
        email,
        'Your LoopOut verification code',
        `Your verification code is: ${otp}. It expires in 10 minutes.`,
        buildOtpEmailHtml(otp)
      ).catch((err) => console.error('OTP email error:', err));

      if (validUser.phone) {
        sendSMS(
            validUser.phone,
            `Your LoopOut verification code is: ${otp}. It expires in 10 minutes.`
        ).catch((err) => console.error('OTP SMS error:', err));
      }

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email,
        message: 'Please verify your account. A new code has been sent to your email and phone.',
        devHint: process.env.NODE_ENV !== 'production' ? 'Check server console for code' : null
      });
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: '365d'
    });
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie('access_token', token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '365d' // 1 year expiration
      });
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
        isVerified: true, // Google OAuth emails are pre-verified
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '365d'
      });
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};

// Add token validation endpoint
export const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(200).json({ valid: false });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) return res.status(200).json({ valid: false });

      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(200).json({ valid: false });

      // Auto-refresh the cookie to keep the session alive
      res.cookie('access_token', token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000, // Refresh to 1 year
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      res.status(200).json({
        valid: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (jwtError) {
      // If it's a JWT error, it's just invalid
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    next(error);
  }
};

// ─── OTP Verification ───────────────────────────────────────────────────────

export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp)
      return next(errorHandler(400, 'Email and OTP are required.'));

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found.'));
    if (user.isVerified)
      return res.status(200).json({ success: true, alreadyVerified: true, message: 'Email already verified.' });

    if (!user.otp || !user.otpExpiry)
      return next(errorHandler(400, 'No OTP on record. Please request a new code.'));

    if (new Date() > user.otpExpiry)
      return next(errorHandler(410, 'Your verification code has expired. Please request a new one.'));

    if (user.otp !== otp.trim())
      return next(errorHandler(400, 'Incorrect verification code. Please try again.'));

    // Mark verified, clear OTP fields, then sign the user in
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      otp: null,
      otpExpiry: null,
    });

    const freshUser = await User.findById(user._id).select('-password');
    const token = jwt.sign({ id: freshUser._id }, process.env.JWT_SECRET, {
      expiresIn: '365d',
    });

    const { password: _p, ...rest } = freshUser._doc;
    res
      .cookie('access_token', token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .status(200)
      .json({ success: true, user: rest });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) return next(errorHandler(400, 'Email is required.'));

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found.'));
    if (user.isVerified)
      return res.status(200).json({ success: true, message: 'Email is already verified.' });

    // Rate-limit: only allow resend if previous OTP is older than 60 s
    const secondsSinceLast = user.otpExpiry
      ? (OTP_TTL_MS - (user.otpExpiry - Date.now())) / 1000
      : Infinity;
    if (secondsSinceLast < 60) {
      const remaining = Math.ceil(60 - secondsSinceLast);
      return next(errorHandler(429, `Please wait ${remaining}s before requesting a new code.`));
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    sendEmail(
      email,
      'Your new LoopOut verification code',
      `Your new verification code is: ${otp}. It expires in 10 minutes.`,
      buildOtpEmailHtml(otp)
    ).catch((err) => console.error('OTP resend email error:', err));

    if (user.phone) {
      sendSMS(
        user.phone,
        `Your LoopOut verification code is: ${otp}. It expires in 10 minutes.`
      ).catch((err) => console.error('OTP SMS error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email and phone.',
      devHint: process.env.NODE_ENV !== 'production' ? 'Check server console for code' : null
    });
  } catch (error) {
    next(error);
  }
};