const express = require('express');
const router = express.Router();
const Order = require('../models/Order_Mobile');
const Cart = require('../models/Cart'); // Ensure you have a Cart model
const Customer = require('../models/Customer'); // Adjust path as needed

// View Order Details
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('cartItems.itemId');
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('order', { order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send(error.message);
    }
});

// Update Order Status
router.post('/orders/:id/update', async (req, res) => {
    console.log('Received request to update order:', req.params.id); // Debugging line
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        order.status = status;
        await order.save();
        res.redirect(`/orders/${order._id}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send(error.message);
    }
});

// Place New Order
router.post('/orders', async (req, res) => {
    try {
        const { userId, totalAmount, paymentMethod, cartItems, deliveryAddress } = req.body;

        // Basic validation
        if (!userId || !totalAmount || !paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0 || !deliveryAddress) {
            return res.status(400).json({ error: 'Missing required fields or invalid data' });
        }

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Create a new order
        const newOrder = new Order({
            userId, // Include userId in the order
            customerName: customer.name || 'Guest', // Default to 'Guest' if no name
            customerContact: customer.contact || 'N/A', // Default to 'N/A' if no contact
            username: customer.username || 'Unknown', // Default to 'Unknown' if no username
            totalAmount,
            paymentMethod,
            status: 'Pending', // default status
            // Modify cartItems to include item names
            cartItems: cartItems.map(item => ({
                ...item,
                itemName: item.name // Add the name of the item
            })),
            deliveryAddress // Include deliveryAddress in the order
        });

        // Save the new order
        await newOrder.save();

        // Send success response
        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: newOrder._id,
            orderDetails: newOrder
        });

        // Log the successful checkout (print message)
        console.log(`Order with ID: ${newOrder._id} was successfully placed for User ID: ${userId}`);

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
});




// Clear Cart
router.post('/clear-cart', async (req, res) => {
    try {
        const { userId, itemsToRemove } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) {
            return res.status(400).json({ error: 'Items to remove are required' });
        }

        // Loop through each item to remove individually
        for (const item of itemsToRemove) {
            const result = await Cart.updateOne(
                { userId },
                { $pull: { items: { itemId: item.itemId, size: item.size } } }
            );
            console.log(`Removing item: ${JSON.stringify(item)} - Result: ${JSON.stringify(result)}`);
        }

        res.status(200).json({ message: 'Selected items removed from cart successfully' });
    } catch (error) {
        console.error('Error clearing specific items from cart:', error);
        res.status(500).json({ error: 'Failed to clear selected items from cart. Please try again.' });
    }
});

module.exports = router;
