const mongoose = require('mongoose');

const mongoUri = "mongodb+srv://Malebo_langa:malebo@loupeout-home.a9ccjpo.mongodb.net/?retryWrites=true&w=majority&appName=loupeOut-home";
const targetServiceId = "698f158bbbe483f3538d156b";
const targetUserId = "6642006cc627b0f1530eb8c3";

async function test() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const schema = new mongoose.Schema({}, { strict: false });
    
    // Check Service
    const Service = mongoose.model('ServiceTest', schema, 'services');
    const service = await Service.findById(targetServiceId);
    console.log('Service result:', service ? 'Found' : 'NOT found');
    if (service) console.log('Service creator field:', service.creator);

    // Check User
    const User = mongoose.model('UserTest', schema, 'users');
    const user = await User.findById(targetUserId);
    console.log('User result:', user ? 'Found' : 'NOT found');
    if (user) console.log('User username:', user.username);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

test();
