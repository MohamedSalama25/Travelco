const mongoose = require("mongoose");
const validator = require("validator");

const transferSchema = mongoose.Schema({
    booking_number: {
        type: String,
        required: [true, "رقم الحجز مطلوب"],
        trim: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, "العميل مطلوب"]
    },
    air_comp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AirComp',
        required: [true, "جهة الإصدار مطلوبة"],
    },
    airPort: {
        type: String,
        required: [true, "المطار مطلوب"],
        minlength: [3, "يجب أن يكون اسم المطار 3 أحرف على الأقل"],
        maxlength: [35, "يجب أن يكون اسم المطار أقل من 35 حرفًا"],
    },
    country: {
        type: String,
        required: [true, "الدولة مطلوبة"],
        minlength: [3, "يجب أن يكون اسم الدولة 3 أحرف على الأقل"],
        maxlength: [35, "يجب أن يكون اسم الدولة أقل من 35 حرفًا"],
    },
    take_off_date: {
        type: Date,
        required: [true, "تاريخ الإقلاع مطلوب"],
    },
    ticket_salary: {
        type: Number,
        required: [true, "صافي سعر التذكرة مطلوب"],
    },
    ticket_price: {
        type: Number,
        required: [true, "سعر التذكرة مطلوب"],
    },
    transfer_pay: {
        type: Number,
        required: [true, "سعر البيع مطلوب"],
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
transferSchema.pre('save', function (next) {
    this.remaining_amount = this.ticket_price - this.total_paid;
    if (this.remaining_amount < 0) this.remaining_amount = 0;

    if (this.status !== 'cancel') {
        if (this.remaining_amount <= 0) {
            this.status = 'paid';
        } else if (this.total_paid > 0) {
            this.status = 'partial';
        } else {
            this.status = 'unpaid';
        }
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