const mongoose = require("mongoose");
const validator = require("validator");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [100, "Name must be less than 100 characters"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        minlength: [10, "Phone must be at least 10 digits"],
        maxlength: [15, "Phone must be less than 15 digits"]
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                return !value || validator.isEmail(value);
            },
            message: "Invalid email format"
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
