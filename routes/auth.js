const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const path = require('path');

// Generate tracking ID
function generateTrackingId() {
    return crypto.randomBytes(16).toString('hex');
}

// Send location sharing link
router.post('/send-link', async (req, res) => {
    console.log('Received POST request to /send-link');
    console.log('Request body:', req.body);
    
    try {
        const { phoneNumber } = req.body;

        // Log the received phone number
        console.log('Processing phone number:', phoneNumber);

        // Validate phone number
        if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
            console.log('Invalid phone number format:', phoneNumber);
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        // Find or create user
        console.log('Looking up user in database...');
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            console.log('User not found, creating new user...');
            const trackingId = generateTrackingId();
            user = new User({
                phoneNumber,
                trackingId
            });
            await user.save();
            console.log('New user created with trackingId:', trackingId);
        } else {
            console.log('Existing user found with trackingId:', user.trackingId);
        }

        // Get the base URL from environment or use Vercel URL in production
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        console.log('Using base URL:', baseUrl);

        // Generate location sharing link for the receiver
        const shareLink = `${baseUrl}/track-location/${user.trackingId}`;
        console.log('Generated share link:', shareLink);
        
        // Format the message
        const message = `Click here to share your location with me: ${shareLink}`;
        console.log('Message to be sent:', message);

        // Generate WhatsApp Web link
        const formattedPhone = phoneNumber.replace(/^\+?91/, '');
        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/91${formattedPhone}?text=${encodedMessage}`;
        
        console.log('Generated WhatsApp link:', whatsappLink);
        
        res.json({ 
            message: 'Location sharing link generated successfully',
            trackingId: user.trackingId,
            whatsappLink: whatsappLink,
            shareLink: shareLink
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate location sharing link',
            details: error.message
        });
    }
});

// Get shared location
router.get('/location/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const user = await User.findOne({ trackingId });
        
        if (!user) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({
            location: user.location || null
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Failed to fetch location' });
    }
});

// Update shared location
router.post('/location/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { latitude, longitude } = req.body;

        const user = await User.findOne({ trackingId });
        if (!user) {
            return res.status(404).json({ error: 'Invalid tracking ID' });
        }

        user.location = {
            latitude,
            longitude,
            timestamp: new Date()
        };
        await user.save();

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

module.exports = router; 