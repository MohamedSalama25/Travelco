const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, "اسم المستخدم مطلوب"],
    minlength: [3, "يجب أن يكون اسم المستخدم 3 أحرف على الأقل"],
    maxlength: [50, "يجب أن يكون اسم المستخدم أقل من 50 حرفًا"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "البريد الإلكتروني مطلوب"],
    unique: true, // مهم لتفادي التكرار
    trim: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: "تنسيق البريد الإلكتروني غير صحيح"
    }
  },

  role: {
    type: String,
    enum: ['accountant', 'admin'],
    default: 'accountant'

  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "الشركة مطلوبة"]
  },

  password: {
    type: String,
    required: [true, "كلمة المرور مطلوبة"],
    minlength: [6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل"],
    select: false,
    validate: {
      validator: function (value) {
        return validator.isStrongPassword(value, {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0
        });
      },
      message: "كلمة المرور ضعيفة. يجب أن تحتوي على رقم واحد على الأقل."
    }
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
