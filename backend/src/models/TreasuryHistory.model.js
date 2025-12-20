const mongoose = require("mongoose");

const treasuryHistorySchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedModel: {
        type: String,
        enum: ['Transfer', 'Payment', 'Expense', 'Advance', 'Other'],
        default: 'Other'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model("TreasuryHistory", treasuryHistorySchema);
