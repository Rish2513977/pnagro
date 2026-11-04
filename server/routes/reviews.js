import express from 'express';
import { Review } from '../models/Review.js';
import { Equipment } from '../models/Equipment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews/:equipmentId
// @desc    Get all reviews for an equipment
router.get('/:equipmentId', async (req, res) => {
  try {
    const reviews = await Review.find({ equipment: req.params.equipmentId })
      .populate('user', 'name location avatar')
      .sort({ date: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Add review for an equipment
router.post('/', protect, async (req, res) => {
  try {
    const { equipmentId, rating, comment } = req.body;

    if (!equipmentId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, comment, and equipment ID',
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const review = await Review.create({
      equipment: equipmentId,
      user: req.user._id,
      userName: req.user.name,
      userLocation: `${req.user.location?.district || 'Ludhiana'}, ${req.user.location?.state || 'Punjab'}`,
      rating: Number(rating),
      comment,
    });

    // Update equipment average rating
    const allReviews = await Review.find({ equipment: equipmentId });
    const avgRating =
      allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;

    equipment.rating = Number(avgRating.toFixed(1));
    equipment.totalReviews = allReviews.length;
    await equipment.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
