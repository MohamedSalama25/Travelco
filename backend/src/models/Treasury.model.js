const mongoose = require("mongoose");

const treasurySchema = new mongoose.Schema({
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
