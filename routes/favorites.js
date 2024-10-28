const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Item = require('../models/Item'); // Adjust the path according to your folder structure
const { body, param, validationResult } = require('express-validator');

// Middleware to sanitize and trim request parameters
const sanitizeParams = (req, res, next) => {
  if (req.params.userId) {
    req.params.userId = req.params.userId.trim(); // Remove leading/trailing whitespace
  }
  next();
};

// Middleware to validate request bodies
const validateFavorite = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('itemId').isMongoId().withMessage('Invalid item ID')
];

// Add item to favorites
router.post('/add', validateFavorite, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId, itemId } = req.body;
    const existingFavorite = await Favorite.findOne({ userId, itemId });
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Item already in favorites' });
    }

    const favorite = new Favorite({ userId, itemId });
    await favorite.save();

    // Increment the favorite count for the item
    await Item.findByIdAndUpdate(itemId, { $inc: { favoriteCount: 1 } });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from favorites
router.post('/remove', validateFavorite, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId, itemId } = req.body;
    const result = await Favorite.findOneAndDelete({ userId, itemId });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Item removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get user's favorites
router.get('/user/:userId', sanitizeParams, [
  param('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId }).populate('itemId');
    
    if (favorites.length === 0) {
      return res.status(404).json({ message: 'No favorites found' });
    }

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Remove all favorites for a user
router.post('/removeAll', [
  body('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;
    const result = await Favorite.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No favorites found to remove' });
    }

    res.status(200).json({ message: 'All favorites removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
