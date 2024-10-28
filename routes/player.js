const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer'); // Adjust path as necessary
const Order = require('../models/Order_Mobile');

// Update or clear Player ID for a customer
router.patch('/updatePlayerId', async (req, res) => {
  const { userId, playerId } = req.body;
  
  // Log the request data
  console.log('Received request to update Player ID:', { userId, playerId });

  try {
    // Determine whether to update the playerId or set it to null
    const updateData = playerId ? { playerId: playerId } : { playerId: null };

    const customer = await Customer.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // Return the updated document
    );

    // Check if the user was found
    if (!customer) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Log success and respond
    console.log(`Player ID ${playerId ? 'updated' : 'cleared'} successfully for user: ${customer.username}`);
    res.status(200).json({ message: `Player ID ${playerId ? 'updated' : 'cleared'} successfully` });
  } catch (error) {
    console.error('Error updating Player ID:', error.message);
    res.status(500).json({ message: 'Error updating Player ID', error: error.message });
  }
});
// Route to retrieve playerId based on the userId associated with an order
router.get('/orders/:orderId/playerId', async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order to get the associated userId
    const order = await Order.findById(orderId).select('userId');
    if (!order || !order.userId) {
      console.log(`Order or userId not found for order ID: ${orderId}`);
      return res.status(404).json({ message: 'Order or user not found' });
    }

    // Now, find the customer using the userId from the order
    const customer = await Customer.findById(order.userId).select('playerId');
    if (!customer || !customer.playerId) {
      console.log(`Player ID not found for user ID: ${order.userId}`);
      return res.status(404).json({ message: 'Player ID not found for user' });
    }

    console.log(`Player ID retrieved successfully for order ID: ${orderId}`);
    res.status(200).json({ playerId: customer.playerId });
  } catch (error) {
    console.error(`Error retrieving Player ID for order ID ${orderId}:`, error.message);
    res.status(500).json({ message: 'Error retrieving Player ID', error: error.message });
  }
});



module.exports = router;
