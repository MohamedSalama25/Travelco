const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "العنوان مطلوب"],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, "المبلغ مطلوب"],
        min: [0, "لا يمكن أن يكون المبلغ أقل من 0"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
