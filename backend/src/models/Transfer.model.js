const mongoose = require("mongoose");
const validator = require("validator");

const transferSchema = mongoose.Schema({
    booking_number: {
        type: String,
        required: [true, "Booking number is required"],
        trim: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, "Customer is required"]
    },
    air_comp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AirComp',
        required: [true, "Air Company is required"],
    },
    airPort: {
        type: String,
        required: [true, "AirPort is required"],
        minlength: [3, "AirPort must be at least 3 characters"],
        maxlength: [35, "AirPort must be less than 35 characters"],
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        minlength: [3, "Country must be at least 3 characters"],
        maxlength: [35, "Country must be less than 35 characters"],
    },
    take_off_date: {
        type: Date,
        required: [true, "Take Off Date is required"],
    },
    ticket_salary: {
        type: Number,
        required: [true, "Ticket Salary is required"],
    },
    ticket_price: {
        type: Number,
        required: [true, "Ticket Price is required"],
    },
    transfer_pay: {
        type: Number,
        required: [true, "Transfer Pay is required"],
    },
    total_paid: {
        type: Number,
        default: 0
    },
    remaining_amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['paid', 'partial', 'unpaid', 'cancel'],
        default: 'unpaid'
    },
    cancel_reason: {
        type: String
    },
    transfer_pay_before_cancel: {
        type: Number
    },
    transfer_salary_before_cancel: {
        type: Number
    },
    transfer_price_before_cancel: {
        type: Number
    },
    cancel_tax: {
        type: Number,
        default: 0
    },
    cancel_commission: {
        type: Number,
        default: 0
    },
    cancel_at: {
        type: Date
    },
    refund_amount: {
        type: Number,
        default: 0
    },
    refund_at: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true  // This automatically adds createdAt and updatedAt
});

// Calculate remaining amount on save
// Calculate remaining amount on save
transferSchema.pre('save', function (next) {

    // لو التذكرة ملغية، ما نغيرش الحالة ولا الحسابات
    if (this.status === 'cancel') {
        return next();
    }

    this.remaining_amount = this.ticket_price - this.total_paid;

    if (this.remaining_amount <= 0) {
        this.status = 'paid';
        this.remaining_amount = 0;
    } else if (this.total_paid > 0) {
        this.status = 'partial';
    } else {
        this.status = 'unpaid';
    }

    next();
});


// Transform toJSON to return email string for createdBy/updatedBy
transferSchema.set('toJSON', {
    virtuals: false,
    versionKey: false,
    transform: function (doc, ret) {
        // Convert createdBy to email if it's populated
        if (ret.createdBy) {
            if (typeof ret.createdBy === 'object' && ret.createdBy.email) {
                ret.createdBy = ret.createdBy.email;
            }
        }

        // Convert updatedBy to email if it's populated  
        if (ret.updatedBy) {
            if (typeof ret.updatedBy === 'object' && ret.updatedBy.email) {
                ret.updatedBy = ret.updatedBy.email;
            }
        }

        return ret;
    }
});

module.exports = mongoose.model("Transfer", transferSchema);