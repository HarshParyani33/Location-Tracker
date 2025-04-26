console.log('Script loaded!');

// DOM Elements
const form = document.getElementById('shareForm');
const phoneInput = document.getElementById('phoneNumber');
const submitButton = document.getElementById('submitButton');
const statusMessage = document.getElementById('statusMessage');
const testMessage = document.getElementById('testMessage');

// Map variables
let map = null;
let marker = null;
let watchId = null;

// API endpoints
const API_URL = window.location.origin + '/api';

// Initialize the application
function init() {
    console.log('Initializing application...');
    
    // Add phone number validation
    phoneInput.addEventListener('input', (e) => {
        console.log('Phone input changed:', e.target.value);
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        // Limit to 10 digits
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
    });

    // Add form submission handler
    form.addEventListener('submit', async (e) => {
        console.log('Form submitted');
        e.preventDefault();
        
        const phoneNumber = phoneInput.value;
        console.log('Phone number:', phoneNumber);
        
        // Validate phone number
        if (phoneNumber.length !== 10) {
            console.log('Invalid phone number length');
            statusMessage.textContent = 'Please enter a valid 10-digit phone number';
            return;
        }
        
        try {
            // Disable the submit button
            submitButton.disabled = true;
            statusMessage.textContent = 'Generating sharing link...';
            console.log('Sending request to server...');
            
            // Send request to server
            const response = await fetch('/api/auth/send-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber })
            });
            
            console.log('Server response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.whatsappLink) {
                statusMessage.innerHTML = `
                    Link generated! <br>
                    <a href="${data.whatsappLink}" target="_blank" class="whatsapp-link">
                        Click here to open WhatsApp
                    </a>
                `;
                
                // Try to open WhatsApp
                window.open(data.whatsappLink, '_blank');
            } else {
                throw new Error('No WhatsApp link received from server');
            }
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = error.message || 'An error occurred. Please try again.';
        } finally {
            // Re-enable the submit button
            submitButton.disabled = false;
        }
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    init();
});

// Initialize map
function initializeMap() {
    if (!map) {
        map = L.map('map').setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

// Start location tracking
function startLocationTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                updateLocationDisplay(latitude, longitude, accuracy);
                updateMap(latitude, longitude);
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

// Update location display
function updateLocationDisplay(latitude, longitude, accuracy) {
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    document.getElementById('accuracy').textContent = `${accuracy.toFixed(2)} meters`;
}

// Update map
function updateMap(latitude, longitude) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([latitude, longitude]).addTo(map);
    map.setView([latitude, longitude], 13);
}

// Handle location error
function handleLocationError(error) {
    console.error('Error getting location:', error);
    document.getElementById('locationError').textContent = error.message;
} 