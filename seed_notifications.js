import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/loopOut-home-and-services/.env' });

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    data: { type: Object }
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const userSchema = new mongoose.Schema({
    username: String,
    email: String
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedNotifications() {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('✅ Connected to MongoDB');

        const users = await User.find().limit(5);
        if (users.length === 0) {
            console.log('No users found to seed notifications.');
            return;
        }

        console.log(`Found ${users.length} users. Seeding 3 test notifications for each...`);

        for (const user of users) {
            const mockNotifs = [
                {
                    userId: user._id,
                    type: 'booking',
                    title: 'New Service Booking!',
                    message: 'You have a new booking for Home Cleaning tomorrow at 10:00 AM.',
                    read: false,
                    data: { itemType: 'booking', itemId: 'dummy-123' }
                },
                {
                    userId: user._id,
                    type: 'system',
                    title: 'Welcome to the New Update',
                    message: 'We have updated the LoopOut platform with a brand new premium design and faster performance. Click here to read the release notes and explore the new features we added for you!',
                    read: false
                },
                {
                    userId: user._id,
                    type: 'review',
                    title: 'You Received a 5-Star Rating',
                    message: 'John Barber has given you a 5-star rating for your recent service.',
                    read: true,
                    data: { itemType: 'review' }
                }
            ];

            await Notification.insertMany(mockNotifs);
        }

        console.log('✅ Successfully seeded test notifications!');
    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

seedNotifications();
