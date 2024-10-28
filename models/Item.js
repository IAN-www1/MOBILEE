const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerName: String,
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  }, // Rating out of 5
  comment: String,
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: Number,
  description: String,
  sizes: [{
    size: String,
    price: Number,
    _id: mongoose.Schema.Types.ObjectId
  }],
  reviews: [reviewSchema], // Array of reviews
  favoriteCount: {          // New field for favorite count
    type: Number,
    default: 0              // Default value set to 0
  }
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
