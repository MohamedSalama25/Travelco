const mongoose = require('mongoose');

const AirCompSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "الاسم مطلوب"],
        minlength: [3, "يجب أن يكون الاسم 3 أحرف على الأقل"]
    },
    phone: {
        type: String,
        required: [true, "رقم الهاتف مطلوب"],
        minlength: [11, "يجب أن يتكون رقم الهاتف من 11 رقمًا"]
    },
    address: {
        type: String,
    }
});


const AirComp = mongoose.model('AirComp', AirCompSchema);

module.exports = AirComp;
