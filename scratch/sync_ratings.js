import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../api/models/listing.model.js';
import Comment from '../api/models/comment.model.js';

dotenv.config();

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

async function syncRatingsAndComments() {
  try {
    const listings = await Listing.find({});
    console.log(`Checking ${listings.length} listings...`);

    let updatedCount = 0;
    for (let listing of listings) {
      let needsSave = false;
      const allComments = await Comment.find({ listingId: listing._id.toString() });
      
      // Update comments array
      const commentIds = allComments.map(c => c._id);
      if (listing.comments?.length !== commentIds.length) {
        listing.comments = commentIds;
        needsSave = true;
      }

      // Update rating
      const ratedComments = allComments.filter(c => c.rating != null);
      if (ratedComments.length > 0) {
        const sum = ratedComments.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = sum / ratedComments.length;
        if (listing.rating !== avg) {
          listing.rating = avg;
          needsSave = true;
        }
      } else if (listing.rating !== 0) {
        listing.rating = 0;
        needsSave = true;
      }

      if (needsSave) {
        await listing.save();
        updatedCount++;
        console.log(`Updated listing ${listing._id} to average rating ${listing.rating} and ${commentIds.length} comments.`);
      }
    }

    console.log(`Finished syncing. Updated ${updatedCount} listings.`);
  } catch (error) {
    console.error('Error syncing:', error);
  } finally {
    mongoose.disconnect();
  }
}

syncRatingsAndComments();
