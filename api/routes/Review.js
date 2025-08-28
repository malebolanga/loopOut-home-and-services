const express = require("express");
const Review = require("../models/Review");
const router = express.Router();

// Fetch all reviews and calculate average rating
// In routes/reviews.js
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    res.json({ reviews, averageRating });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error });
  }
});

// Submit a new review
router.post("/", async (req, res) => {
  const { userId, content, rating } = req.body;

  if (!userId || !content || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newReview = new Review({ userId, content, rating });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review", error });
  }
});

// Delete a review
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // User ID of the person trying to delete the review

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only allow the user who created the review to delete it
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this review" });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error });
  }
});

module.exports = router;