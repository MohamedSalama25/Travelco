const mongoose = require("mongoose");

const airCompPaymentSchema = new mongoose.Schema({
    air_comp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AirComp',
        required: [true, "جهة الإصدار مطلوبة"]
    },
    amount: {
        type: Number,
        required: [true, "المبلغ مطلوب"],
        min: [0, "لا يمكن أن يكون المبلغ سلبيًا"]
    },
    payment_date: {
        type: Date,
        required: [true, "تاريخ الدفع مطلوب"],
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
