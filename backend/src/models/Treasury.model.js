const mongoose = require("mongoose");

const treasurySchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, "الشركة مطلوبة"]
    },
    balance: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: "Main Treasury"
    }
}, { timestamps: true });

module.exports = mongoose.model("Treasury", treasurySchema);
