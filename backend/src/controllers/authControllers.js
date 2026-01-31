const User = require("../models/Users.model");
const Company = require("../models/Company.model");
const Treasury = require("../models/Treasury.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorRes } = require("../utils/handleError");

// REGISTER - Creates new company and sets user as owner
const register = async (req, res) => {
  try {
    const { user_name, phone, email, password, company_name } = req.body;

    if (!user_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة"
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني موجود بالفعل"
      });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "رقم الهاتف موجود بالفعل"
        });
      }
    }

    // Create new company first
    const newCompany = await Company.create({
      name: company_name || `شركة ${user_name}`,
      email: email,
      phone: phone || "",
      status: "active"
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user as company admin
    const newUser = await User.create({
      user_name,
      phone: phone || "",
      email,
      password: hashedPassword,
      companyId: newCompany._id,
      role: "admin"
    });

    // Update company with createdBy
    newCompany.createdBy = newUser._id;
    await newCompany.save();

    // Create default treasury for the company
    await Treasury.create({
      companyId: newCompany._id,
      name: "الخزينة الرئيسية",
      balance: 0
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        role: "admin",
        companyId: newCompany._id
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
        role: "admin",
        email: newUser.email,
        phone: newUser.phone,
        companyId: newCompany._id,
        companyName: newCompany.name
      },
      message: "تم تسجيل المستخدم والشركة بنجاح"
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

    // Get user with password and populate company
    const user = await User.findOne({ email })
      .select("+password")
      .populate("companyId", "name status");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      });
    }

    // Check if user's company is active
    if (user.companyId && user.companyId.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "الشركة غير نشطة. يرجى التواصل مع الإدارة"
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

    // Generate JWT token with companyId
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        companyId: user.companyId._id
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
        phone: user.phone,
        companyId: user.companyId._id,
        companyName: user.companyId.name
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
