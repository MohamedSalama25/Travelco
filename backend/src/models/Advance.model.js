const mongoose = require("mongoose");

const advanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [1, "Amount must be at least 1"]
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'repaid'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    approvedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Advance", advanceSchema);
