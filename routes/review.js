const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.post('/review/:itemId', async (req, res) => {
    const { itemId } = req.params; // This should now be the itemId
    const { customerName, rating, comment } = req.body;

    console.log(`Received request to add review for item ID: ${itemId}`);

    try {
        const item = await Item.findById(itemId); // Now find by itemId
        if (!item) {
            console.error(`Item not found for ID: ${itemId}`);
            return res.status(404).send('Item not found');
        }

        item.reviews.push({ customerName, rating, comment });
        await item.save();

        res.status(200).send('Review added successfully');
    } catch (err) {
        console.error(`Error submitting review: ${err.message}`);
        res.status(500).send('Error submitting review');
    }
});


module.exports = router;
