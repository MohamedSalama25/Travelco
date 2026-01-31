const mongoose = require("mongoose");

const advanceSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, "الشركة مطلوبة"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "الموظف مطلوب"]
    },
    amount: {
        type: Number,
        required: [true, "المبلغ مطلوب"],
        min: [1, "يجب أن يكون المبلغ 1 على الأقل"]
    },
    reason: {
        type: String,
        required: [true, "السبب مطلوب"],
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
