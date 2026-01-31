const mongoose = require("mongoose");
const validator = require("validator");

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "اسم الشركة مطلوب"],
        minlength: [2, "يجب أن يكون اسم الشركة حرفين على الأقل"],
        maxlength: [100, "يجب أن يكون اسم الشركة أقل من 100 حرف"],
        trim: true
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
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
