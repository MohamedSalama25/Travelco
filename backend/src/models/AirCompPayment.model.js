const mongoose = require("mongoose");

const airCompPaymentSchema = new mongoose.Schema({
    air_comp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AirComp',
        required: [true, "AirComp reference is required"]
    },
    amount: {
        type: Number,
        required: [true, "Payment amount is required"],
        min: [0, "Amount cannot be negative"]
    },
    payment_date: {
        type: Date,
        required: [true, "Payment date is required"],
        default: Date.now
    },
    payment_method: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'check', 'other'],
        default: 'cash'
    },
    receipt_number: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Transform toJSON to return email string for createdBy
airCompPaymentSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.createdBy && typeof ret.createdBy === 'object' && ret.createdBy.email) {
            ret.createdBy = ret.createdBy.email;
        }
        return ret;
    }
});

module.exports = mongoose.model("AirCompPayment", airCompPaymentSchema);
