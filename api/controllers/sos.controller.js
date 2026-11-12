import User from '../models/user.model.js';
import SOSAlert from '../models/sosAlert.model.js';
import { errorHandler } from '../utils/error.js';
import crypto from 'crypto';
import { notifyLoopOutAdmins } from '../utils/notifyLoopOutAdmins.js';

export const triggerSOS = async (req, res, next) => {
    try {
        const latitude = Number(req.body?.latitude);
        const longitude = Number(req.body?.longitude);
        const userId = req.user.id;

        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            return res.status(400).json({ success: false, message: 'A valid GPS position is required to create a panic alert.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found for SOS'));
        }
        if (user.offeringType !== 'services') {
            return res.status(403).json({ success: false, message: 'The provider panic alert is available only to service-provider accounts.' });
        }

        const alertCode = `LOOP-SOS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const alert = await SOSAlert.create({ user: user._id, alertCode, latitude, longitude, mapUrl });
        await notifyLoopOutAdmins({
            title: 'Provider panic alert',
            message: `${user.username || 'A service provider'} triggered panic alert ${alert.alertCode}. Open the admin dashboard to view its map pin.`,
            data: { adminAlertType: 'panic_alert', alertCode: alert.alertCode, sosAlertId: String(alert._id) },
        });
        const contacts = (user.contacts || []).map((contact) => ({
            name: typeof contact === 'string' ? 'Trusted contact' : String(contact?.name || 'Trusted contact').trim(),
            phone: String(typeof contact === 'string' ? contact : contact?.phone || '').trim(),
        })).filter((contact) => contact.phone);

        return res.status(201).json({
            success: true,
            alert: { id: alert._id, code: alert.alertCode, status: alert.status, triggeredAt: alert.triggeredAt },
            mapUrl,
            contacts,
            message: contacts.length
                ? 'Panic alert recorded. Your trusted contacts have not been texted yet; choose Share by text to send your code and location.'
                : 'Panic alert recorded, but no trusted contacts are saved. Add a trusted contact in Settings and contact local emergency services if needed.',
        });

    } catch (error) {
        next(error);
    }
};

export const closeSOSAlert = async (req, res, next) => {
    try {
        const alert = await SOSAlert.findOneAndUpdate(
            { _id: req.params.alertId, user: req.user.id, status: 'active' },
            { $set: { status: 'closed', closedAt: new Date() } },
            { new: true }
        ).select('alertCode status closedAt');
        if (!alert) return res.status(404).json({ success: false, message: 'Active panic alert not found.' });
        return res.json({ success: true, alert });
    } catch (error) {
        return next(error);
    }
};
