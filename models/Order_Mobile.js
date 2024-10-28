const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Assuming you have a Customer model
        required: true 
    },
    customerName: { 
        type: String, 
        required: false // Ensure this is required
    },
    customerContact: { 
        type: String, 
        required: false // Ensure this is required
    },
    username: { // New field to store username
        type: String,
        required: true // Ensure this is required
    },
    billingDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    cartItems: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
            name: { type: String, required: true }, // Add name field
            quantity: { type: Number, required: true },
            size: { type: String, required: false }, // Size field is optional
            price: { type: Number, required: false } // Price field is now optional
        }
    ],
    deliveryAddress: {
        building: { type: String, required: true }, // Assuming building is required
        floor: { type: String, required: false }, // Floor can be optional
        room: { type: String, required: false } // Room can be optional
    },
    proofOfDelivery: { type: String, required: false } // New field for proof of delivery
});


// Pre-save middleware to set the price based on itemId if not provided
orderSchema.pre('save', async function(next) {
    const cartItems = this.cartItems;
    for (const item of cartItems) {
        if (!item.price) {
            const foundItem = await mongoose.model('Item').findById(item.itemId);
            if (foundItem) {
                item.price = foundItem.price; // Set the price from the Item model
            }
        }
    }
    next();
});

// Pre-save middleware to fetch customer details
orderSchema.pre('save', async function(next) {
    if (this.isNew) { // Only run for new orders
        const customer = await mongoose.model('Customer').findById(this.userId);
        if (customer) {
            this.customerName = customer.name; // Set customer's name
            this.customerContact = customer.contact; // Set customer's contact
            this.username = customer.username; // Set customer's username
        }
    }
    next();
});

module.exports = mongoose.model('Mobile_Order', orderSchema);
