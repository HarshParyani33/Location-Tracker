require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: false,
            tlsAllowInvalidHostnames: false
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Connect to MongoDB
connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
});

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve tracking page
app.get('/track-location/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const User = require('./models/User');
        const user = await User.findOne({ trackingId });
        
        if (!user) {
            return res.status(404).send('Invalid tracking ID');
        }

        res.sendFile(path.join(__dirname, 'public', 'track.html'));
    } catch (error) {
        console.error('Error serving tracking page:', error);
        res.status(500).send('Internal server error');
    }
});

// Serve view location page
app.get('/view-location/:trackingId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Export the Express API
module.exports = app;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 