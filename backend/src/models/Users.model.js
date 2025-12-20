const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, "User name is required"],
    minlength: [3, "User name must be at least 3 characters"],
    maxlength: [50, "User name must be less than 50 characters"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true, // مهم لتفادي التكرار
    trim: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: "Invalid email format"
    }
  },

  role: {
    type: String,
    enum: ['accountant', 'admin', 'manager'],
    default: 'accountant'

  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
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
      message: "Weak password. Must contain at least one number."
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
