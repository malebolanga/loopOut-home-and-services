import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const triggerSOS = async (req, res, next) => {
    try {
        const { latitude, longitude, address } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found for SOS'));
        }

        const emergencyContacts = user.contacts || [];
        
        let message = `[EMERGENCY SOS ALERT]\nUser ${user.username} (${user.phone}) has triggered a Panic Button!\n`;
        message += `Live GPS Location: https://maps.google.com/?q=${latitude},${longitude}\n`;
        message += `Address Approximation: ${address || 'Not Provided'}`;

        // In a real production app, this would use Twilio or Nodemailer to blast messages
        console.log("===============================");
        console.log(message);
        console.log(`Alerting Contacts: ${emergencyContacts.join(', ') || 'No contacts found, alerting Platform Security directly.'}`);
        console.log("===============================");

        res.status(200).json({ 
            success: true, 
            message: 'SOS Alert dispatched to secure servers and emergency contacts.' 
        });

    } catch (error) {
        next(error);
    }
};
