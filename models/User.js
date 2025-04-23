const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    trackingId: {
        type: String,
        required: [true, 'Please provide a tracking ID'],
        unique: true,
    },
    location: {
        type: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        },
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema); 