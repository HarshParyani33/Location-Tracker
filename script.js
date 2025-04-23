// DOM Elements
const phoneSection = document.getElementById('phoneSection');
const otpSection = document.getElementById('otpSection');
const locationSection = document.getElementById('locationSection');
const phoneInput = document.getElementById('phoneNumber');
const sendOtpButton = document.getElementById('sendOtp');
const verifyOtpButton = document.getElementById('verifyOtp');
const otpInputs = document.querySelectorAll('.otp-digit');
const phoneError = document.getElementById('phoneError');
const otpError = document.getElementById('otpError');

// Map variables
let map = null;
let marker = null;

// Initialize the application
function init() {
    setupPhoneValidation();
    setupOTPInputs();
    setupButtons();
}

// Phone number validation
function setupPhoneValidation() {
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        const isValid = e.target.value.length === 10;
        sendOtpButton.disabled = !isValid;
        phoneError.textContent = isValid ? '' : 'Please enter a valid 10-digit phone number';
    });
}

// OTP input handling
function setupOTPInputs() {
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
}

// Button event handlers
function setupButtons() {
    sendOtpButton.addEventListener('click', handleSendOTP);
    verifyOtpButton.addEventListener('click', handleVerifyOTP);
}

// Handle sending OTP
function handleSendOTP() {
    const phoneNumber = phoneInput.value;
    if (phoneNumber.length === 10) {
        // In a real application, you would make an API call to send OTP
        // For demo purposes, we'll just show the OTP section
        const demoOTP = generateDemoOTP();
        console.log('Demo OTP:', demoOTP); // For testing purposes
        
        phoneSection.style.display = 'none';
        otpSection.style.display = 'block';
        otpInputs[0].focus();
    }
}

// Handle OTP verification
function handleVerifyOTP() {
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    if (enteredOTP.length === 6) {
        // In a real application, you would verify the OTP with your backend
        // For demo purposes, we'll just show the location section
        otpSection.style.display = 'none';
        locationSection.style.display = 'block';
        initializeMap();
        startLocationTracking();
    } else {
        otpError.textContent = 'Please enter a valid 6-digit OTP';
    }
}

// Generate a random OTP for demo purposes
function generateDemoOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initialize the map
function initializeMap() {
    map = L.map('map').setView([20.5937, 78.9629], 4); // Default view of India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Start tracking location
function startLocationTracking() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                updateLocationDisplay(latitude, longitude);
                if (map) {
                    map.setView([latitude, longitude], 13);
                    if (marker) {
                        marker.setLatLng([latitude, longitude]);
                    } else {
                        marker = L.marker([latitude, longitude]).addTo(map);
                    }
                }
                // Get address using reverse geocoding
                fetchAddress(latitude, longitude);
            },
            error => {
                console.error("Error getting location:", error);
                document.getElementById('latitude').textContent = 'Error getting location';
                document.getElementById('longitude').textContent = 'Error getting location';
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Update location display
function updateLocationDisplay(latitude, longitude) {
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
}

// Fetch address using reverse geocoding
async function fetchAddress(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        document.getElementById('address').textContent = data.display_name;
    } catch (error) {
        console.error("Error fetching address:", error);
        document.getElementById('address').textContent = 'Error fetching address';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 