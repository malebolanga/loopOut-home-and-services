import fs from 'fs';

const filePath = 'c:\\loopOut-home-and-services\\api\\controllers\\booking.js';
let content = fs.readFileSync(filePath, 'utf8');

const functionToAdd = `
// Get booking summary for a specific event
export const getEventBookingSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const bookings = await Booking.find({ event: eventId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
      
    const count = bookings.length;
    
    const recentBookers = [];
    const seenUsers = new Set();
    
    for (const booking of bookings) {
      if (booking.user && !seenUsers.has(booking.user._id.toString())) {
        recentBookers.push(booking.user);
        seenUsers.add(booking.user._id.toString());
      }
      if (recentBookers.length >= 5) break;
    }

    res.json({
      count,
      recentBookers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
`;

if (!content.includes('export const getEventBookingSummary')) {
    content += functionToAdd;
    fs.writeFileSync(filePath, content);
    console.log('Successfully added getEventBookingSummary to booking.js');
} else {
    console.log('getEventBookingSummary already exists in booking.js');
}
