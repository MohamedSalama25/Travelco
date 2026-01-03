const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, "اسم الشركة مطلوب"],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true
    },
    coordinates: {
        lat: {
            type: Number,
            default: 30.0444 // Default to Cairo
        },
        lng: {
            type: Number,
            default: 31.2357
        }
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
