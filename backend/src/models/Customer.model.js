const mongoose = require("mongoose");
const validator = require("validator");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "الاسم مطلوب"],
        minlength: [3, "يجب أن يكون الاسم 3 أحرف على الأقل"],
        maxlength: [100, "يجب أن يكون الاسم أقل من 100 حرف"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "رقم الهاتف مطلوب"],
        minlength: [10, "يجب أن يتكون رقم الهاتف من 10 أرقام على الأقل"],
        maxlength: [15, "يجب أن يكون رقم الهاتف أقل من 15 رقمًا"]
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                return !value || validator.isEmail(value);
            },
            message: "تنسيق البريد الإلكتروني غير صحيح"
        }
    },
    national_id: {
        type: String,
        trim: true
    },
    passport_number: {
        type: String,
        trim: true
    },
    nationality: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Update timestamp on save
customerSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Transform toJSON to return email string for createdBy/updatedBy
customerSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.createdBy && typeof ret.createdBy === 'object' && ret.createdBy.email) {
            ret.createdBy = ret.createdBy.email;
        }
        if (ret.updatedBy && typeof ret.updatedBy === 'object' && ret.updatedBy.email) {
            ret.updatedBy = ret.updatedBy.email;
        }
        return ret;
    }
});

module.exports = mongoose.model("Customer", customerSchema);
