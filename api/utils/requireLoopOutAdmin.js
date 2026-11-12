import User from '../models/user.model.js';

export const LOOP_OUT_ADMIN_EMAILS = Object.freeze([
  'malebolanga3@gmail.com',
  'admin@loopout.co.za',
]);

export const isLoopOutAdminEmail = (email) =>
  LOOP_OUT_ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());

export const requireLoopOutAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('email').lean();
    if (!user || !isLoopOutAdminEmail(user.email)) {
      return res.status(403).json({ success: false, message: 'LoopOut administrator access is required.' });
    }
    req.loopOutAdminEmail = user.email;
    next();
  } catch (error) {
    next(error);
  }
};
