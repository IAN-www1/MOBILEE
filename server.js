// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv'); // Import dotenv to load environment variables

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3002;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public')));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message); // Log the error message
    res.status(err.status || 500).json({
        error: {
            message: err.message,
        },
    });
});

// MongoDB Atlas connection setup using .env variable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connected successfully');
});

// Static directories
const imgDirectoryPath = path.join(__dirname, 'public', 'img');
app.use('/img', express.static(imgDirectoryPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const resetPasswordRoute = require('./routes/reset'); // Ensure this path is correct
const resetRequestRoute = require('./routes/reset-request'); // Assuming you have this route file
const itemsRoute = require('./routes/items'); // New items route
const favoritesRoutes = require('./routes/favorites');
const userProfileImageRoutes = require('./routes/userProfileImage'); // Adjust path as needed
const cartRoutes = require('./routes/cart'); // Adjust path if needed
const customerRoutes = require('./routes/customer'); // Adjust path if needed
const orderRoutes = require('./routes/order');
const customersRoutes = require('./routes/customerRoutes'); // Adjust path if needed
const orderMobileRoutes = require('./routes/orderMobile');
const mobileOrdersRouter = require('./routes/mobileOrders'); // Adjust the path as necessary
const reviewRoutes = require('./routes/review'); // Ensure the path to the file is correct
const playerRoutes = require('./routes/player'); // Adjust path as necessary

// Use routes
app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/reset', resetPasswordRoute); // Use resetPasswordRoute for resetting password
app.use('/reset-password', resetRequestRoute); // Use resetRequestRoute for requesting password reset
app.use('/items', itemsRoute); // Mount items route
app.use('/api/favorites', favoritesRoutes);
app.use('/api/userProfileImage', userProfileImageRoutes); // If your routes are prefixed with /api
app.use('/cart', cartRoutes);
app.use('/customer', customerRoutes);
app.use('/api', orderRoutes); // Mount the order routes on `/api`
app.use('/customers', customersRoutes);
app.use('/api/orders/mobile', orderMobileRoutes);
app.use('/api/mobile/orders', mobileOrdersRouter); // Add your mobile orders route
app.use('/reviews', reviewRoutes); // This makes all review routes available at the `/reviews` endpoint
app.use('/player', playerRoutes);

// Start server
// Start the server and listen on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
