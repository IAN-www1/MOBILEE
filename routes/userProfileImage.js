const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imgur = require('imgur');
const UserProfileImage = require('../models/UserProfileImage');
require('dotenv').config();

const router = express.Router();

// Set up multer for file uploads (storing files locally temporarily)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR || 'uploads/'); // Temporary storage
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Rename the file to avoid conflicts
  },
});

const upload = multer({ storage });

// Handle image upload
router.post('/upload-profile-image', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Upload image to Imgur
    const imgurResponse = await imgur.uploadFile(req.file.path);
    const profileImageUrl = imgurResponse.link;

    // Clean up the local file after uploading to Imgur
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Failed to delete local file:', err);
      }
    });

    // Save the image URL to MongoDB
    await _saveImageUrlToMongoDB(userId, profileImageUrl);

    res.status(200).json({ filePath: profileImageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image', error });
  }
});

// PATCH route to update profile image URL
router.patch('/upload-profile-image', async (req, res) => {
  try {
    const { userId, profileImageUrl } = req.body; // Destructure userId and profileImageUrl from request body
    if (!userId || !profileImageUrl) {
      return res.status(400).json({ message: 'User ID and profile image URL are required' });
    }

    // Find the user profile image document
    let userProfileImage = await UserProfileImage.findOne({ userId });
    if (userProfileImage) {
      // Update the existing profile image URL
      userProfileImage.profileImageUrl = profileImageUrl;
    } else {
      // Create a new user profile image document
      userProfileImage = new UserProfileImage({
        userId,
        profileImageUrl,
      });
    }

    // Save the document to MongoDB
    await userProfileImage.save();
    console.log('Image URL saved to MongoDB successfully.');

    // Send a success response
    res.status(200).json({ message: 'Profile image URL updated successfully.' });
  } catch (error) {
    console.error('Error updating profile image URL:', error);
    res.status(500).json({ message: 'Failed to update profile image URL', error: error.message });
  }
});


// Get profile image for a specific user
router.get('/profile-image/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfileImage = await UserProfileImage.findOne({ userId });

    if (!userProfileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    res.status(200).json({ profileImageUrl: userProfileImage.profileImageUrl });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: 'Failed to retrieve image', error });
  }
});



module.exports = router;
