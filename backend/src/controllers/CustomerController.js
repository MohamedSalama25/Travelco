const mongoose = require("mongoose");
const Customer = require("../models/Customer.model");
const Transfer = require("../models/Transfer.model");
const getPagination = require("../utils/pagination");
const { generateCustomersExcel } = require("../utils/excelExport");
const { getCompanyFilter, addCompanyFilter } = require("../utils/companyFilter");

/**
 * Helper to calculate percentage change
 */
const calculateChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Get all customers with filtering and pagination
 */
const getCustomers = async (req, res) => {
  try {
    const { limit, skip } = getPagination(req);
    const { name, phone, nationality } = req.query;
    const companyId = req.user.companyId;

    // Build filter object with company
    const filter = getCompanyFilter(companyId);

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: "i" };
    }
    if (nationality) {
      filter.nationality = { $regex: nationality, $options: "i" };
    }

    const customers = await Customer.find(filter, { __v: false })
      .populate("createdBy", "user_name email")
      .populate("updatedBy", "user_name email")
      .limit(limit)
      .skip(skip)
      .sort({ date: -1, createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get customer statistics with comparison
 */
const getCustomerStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Helper to get stats for a specific range
    const getStatsForRange = async (start, end) => {
      const newCustomers = await Customer.countDocuments({
        companyId,
        createdAt: { $gte: start, $lte: end },
      });

      const transfers = await Transfer.aggregate([
        { $match: { companyId: companyObjectId } },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        {
          $match: {
            "customerInfo.createdAt": { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            totalRevenue: { $sum: "$ticket_price" },
          },
        },
      ]);

      return {
        newCustomers,
        totalTickets: transfers[0]?.totalTickets || 0,
        totalRevenue: transfers[0]?.totalRevenue || 0,
      };
    };

    const [currentStats, prevStats] = await Promise.all([
      getStatsForRange(currentStart, currentEnd),
      getStatsForRange(prevStart, prevEnd),
    ]);

    const totalCustomers = await Customer.countDocuments({ companyId });

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers: {
          value: totalCustomers,
          trend: "neutral",
        },
        newCustomers: {
          value: currentStats.newCustomers,
          previous: prevStats.newCustomers,
          change: currentStats.newCustomers - prevStats.newCustomers,
          percentage: calculateChange(
            currentStats.newCustomers,
            prevStats.newCustomers,
          ).toFixed(1),
          trend:
            currentStats.newCustomers >= prevStats.newCustomers
              ? "increase"
              : "decrease",
        },
        totalTickets: {
          value: currentStats.totalTickets,
          previous: prevStats.totalTickets,
          change: currentStats.totalTickets - prevStats.totalTickets,
          percentage: calculateChange(
            currentStats.totalTickets,
            prevStats.totalTickets,
          ).toFixed(1),
          trend:
            currentStats.totalTickets >= prevStats.totalTickets
              ? "increase"
              : "decrease",
        },
        totalRevenue: {
          value: currentStats.totalRevenue,
          previous: prevStats.totalRevenue,
          change: currentStats.totalRevenue - prevStats.totalRevenue,
          percentage: calculateChange(
            currentStats.totalRevenue,
            prevStats.totalRevenue,
          ).toFixed(1),
          trend:
            currentStats.totalRevenue >= prevStats.totalRevenue
              ? "increase"
              : "decrease",
        },
      },
      meta: {
        period: {
          current: { start: currentStart, end: currentEnd },
          previous: { start: prevStart, end: prevEnd },
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get customer by ID
 */
const getCustomerById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customer = await Customer.findOne({ _id: req.params.id, companyId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get customer transfers (tickets)
 */
const getCustomerTransfers = async (req, res) => {
  try {
    const { limit, skip } = getPagination(req);
    const customerId = req.params.id;
    const companyId = req.user.companyId;

    const customer = await Customer.findOne({ _id: customerId, companyId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    const transferFilter = { customer: customerId, companyId };
    const transfers = await Transfer.find(transferFilter)
      .populate("air_comp", "name phone")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Transfer.countDocuments(transferFilter);

    // Calculate customer stats
    const stats = await Transfer.aggregate([
      { $match: { customer: customer._id, companyId: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          totalAmount: { $sum: "$ticket_price" },
          totalPaid: { $sum: "$total_paid" },
          totalRemaining: { $sum: "$remaining_amount" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customer,
        transfers,
        stats: stats[0] || {
          totalTickets: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
        },
      },
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add new customer
 */
const addCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      national_id,
      passport_number,
      nationality,
      address,
      notes,
    } = req.body;
    const companyId = req.user.companyId;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "الاسم ورقم الهاتف مطلوبان",
      });
    }

    const newCustomer = new Customer({
      name,
      phone,
      email: email || "",
      national_id: national_id || "",
      passport_number: passport_number || "",
      nationality: nationality || "",
      address: address || "",
      notes: notes || "",
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null,
      companyId: companyId,
    });

    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: "تم إضافة العميل بنجاح",
      data: newCustomer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update customer
 */
const updateCustomer = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customer = await Customer.findOne({ _id: req.params.id, companyId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    const {
      name,
      phone,
      email,
      national_id,
      passport_number,
      nationality,
      address,
      notes,
    } = req.body;

    // Update only provided fields
    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (national_id !== undefined) customer.national_id = national_id;
    if (passport_number !== undefined)
      customer.passport_number = passport_number;
    if (nationality !== undefined) customer.nationality = nationality;
    if (address !== undefined) customer.address = address;
    if (notes !== undefined) customer.notes = notes;
    customer.updatedBy = req.user?.id || customer.updatedBy;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات العميل بنجاح",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete customer
 */
const deleteCustomer = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const customer = await Customer.findOne({ _id: req.params.id, companyId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    // Check if customer has transfers
    const transferCount = await Transfer.countDocuments({
      customer: customer._id,
      companyId,
    });
    if (transferCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف العميل لوجود عدد (${transferCount}) من التذاكر المرتبطة به.`,
      });
    }

    await customer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "تم حذف العميل بنجاح",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Export customers to Excel
 */
const exportCustomersToExcel = async (req, res) => {
  try {
    const { name, phone, nationality } = req.query;
    const companyId = req.user.companyId;

    const filter = getCompanyFilter(companyId);
    if (name) filter.name = { $regex: name, $options: "i" };
    if (phone) filter.phone = { $regex: phone, $options: "i" };
    if (nationality)
      filter.nationality = { $regex: nationality, $options: "i" };

    const customers = await Customer.find(filter).sort({ createdAt: -1 });

    await generateCustomersExcel(customers, res, "customers");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerStats,
  getCustomerById,
  getCustomerTransfers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomersToExcel,
};
