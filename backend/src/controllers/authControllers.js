const User = require("../models/Users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorRes } = require("../utils/handleError");

// REGISTER
const register = async (req, res) => {
  try {
    const { user_name, phone, email, password } = req.body;

    if (!user_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة"
      });
    }

    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني موجود بالفعل"
      });
    }
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "رقم الهاتف موجود بالفعل"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_name,
      phone,
      email,
      password: hashedPassword
    });
    const token = jwt.sign(
      {
        id: newUser._id,
        role: "accountant"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        user_name: newUser.user_name,
        role: "accountant",
        email: newUser.email,
        phone: newUser.phone
      },
      message: "تم تسجيل المستخدم بنجاح"
    });

  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }

    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبان"
      });
    }

    // Get user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        user_name: user.user_name,
        role: user.role,
        email: user.email,
        phone: user.phone
      },
      message: "تم تسجيل الدخول بنجاح",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};


module.exports = { register, login };
