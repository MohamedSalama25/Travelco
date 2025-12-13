const mongoose = require('mongoose');

const AirCompSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        match: [/^\d{11}$/, "Phone must be 11 digits"]
    },
    address: {
        type: String,
    }
});


const AirComp = mongoose.model('AirComp', AirCompSchema);

module.exports = AirComp;
