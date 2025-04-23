const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

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

        // Get the base URL from environment or use ngrok URL if available
        const baseUrl = process.env.NGROK_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        console.log('Using base URL:', baseUrl);

        // Generate location sharing link
        const shareLink = `${baseUrl}/share-location/${user.trackingId}`;
        console.log('Generated share link:', shareLink);
        
        // Format the message
        const message = `Click here to share your location: ${shareLink}`;
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

// Get shared location page
router.get('/share-location/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const user = await User.findOne({ trackingId });
        
        if (!user) {
            return res.status(404).send('Invalid tracking ID');
        }

        // Send the HTML page for location sharing
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Share Your Location</title>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    #map {
                        height: 400px;
                        width: 100%;
                        margin-top: 20px;
                    }
                    .location-info {
                        margin-top: 20px;
                        padding: 10px;
                        background: #f5f5f5;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>Share Your Location</h1>
                <div id="map"></div>
                <div class="location-info">
                    <p>Latitude: <span id="latitude">-</span></p>
                    <p>Longitude: <span id="longitude">-</span></p>
                    <p>Accuracy: <span id="accuracy">-</span> meters</p>
                </div>
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                <script>
                    const trackingId = '${trackingId}';
                    let map = null;
                    let marker = null;
                    let watchId = null;

                    function initializeMap() {
                        map = L.map('map').setView([0, 0], 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(map);
                    }

                    function startLocationTracking() {
                        if (navigator.geolocation) {
                            watchId = navigator.geolocation.watchPosition(
                                (position) => {
                                    const { latitude, longitude, accuracy } = position.coords;
                                    updateLocationDisplay(latitude, longitude, accuracy);
                                    updateMap(latitude, longitude);
                                    sendLocationToServer(latitude, longitude);
                                },
                                handleLocationError,
                                {
                                    enableHighAccuracy: true,
                                    timeout: 5000,
                                    maximumAge: 0
                                }
                            );
                        } else {
                            handleLocationError(new Error('Geolocation is not supported by your browser'));
                        }
                    }

                    function updateLocationDisplay(latitude, longitude, accuracy) {
                        document.getElementById('latitude').textContent = latitude.toFixed(6);
                        document.getElementById('longitude').textContent = longitude.toFixed(6);
                        document.getElementById('accuracy').textContent = accuracy.toFixed(2);
                    }

                    function updateMap(latitude, longitude) {
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        marker = L.marker([latitude, longitude]).addTo(map);
                        map.setView([latitude, longitude], 13);
                    }

                    async function sendLocationToServer(latitude, longitude) {
                        try {
                            const response = await fetch('/api/auth/location/' + trackingId, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ latitude, longitude })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to update location');
                            }
                        } catch (error) {
                            console.error('Error sending location:', error);
                        }
                    }

                    function handleLocationError(error) {
                        console.error('Error getting location:', error);
                        document.getElementById('latitude').textContent = 'Error';
                        document.getElementById('longitude').textContent = 'Error';
                        document.getElementById('accuracy').textContent = 'Error';
                    }

                    // Initialize when the page loads
                    initializeMap();
                    startLocationTracking();
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error serving share location page:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router; 