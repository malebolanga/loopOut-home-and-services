import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { LOOP_OUT_ADMIN_EMAILS } from './requireLoopOutAdmin.js';

export const notifyLoopOutAdmins = async ({ title, message, data = {} }) => {
  try {
    const admins = await User.find({ email: { $in: LOOP_OUT_ADMIN_EMAILS } }).select('_id').lean();
    if (!admins.length) return;
    await Notification.insertMany(admins.map((admin) => ({
      userId: admin._id,
      type: 'system',
      title,
      message,
      data: { ...data, route: '/admin/verification' },
    })));
  } catch (error) {
    // Alerts must not block the provider's KYC or panic-alert flow.
    console.error('[ADMIN NOTIFICATION] Could not notify LoopOut admins:', error.message);
  }
};
