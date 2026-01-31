const mongoose = require("mongoose");
const Expense = require("../models/Expense.model");
const { updateTreasury } = require("../utils/treasury.helper");
const getPagination = require("../utils/pagination");
const { getCompanyFilter } = require("../utils/companyFilter");

/**
 * Get all expenses with filtering and pagination
 */
const getExpenses = async (req, res) => {
  try {
    const { limit, skip } = getPagination(req);
    const { fromDate, toDate, search, date } = req.query;
    const companyId = req.user.companyId;
    
    const filter = getCompanyFilter(companyId);

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date.$lte = endOfDay;
      }
    }

    const expenses = await Expense.find(filter)
      .populate("createdBy", "user_name")
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Expense.countDocuments(filter);

    // Calculate total stats for the requested period/filter
    const stats = await Expense.aggregate([
      { $match: { ...filter, companyId: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount: stats[0]?.total || 0,
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
 * Add new expense
 */
const addExpense = async (req, res) => {
  try {
    const { title, amount, date, description, category } = req.body;
    const companyId = req.user.companyId;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: "العنوان والمبلغ مطلوبان",
      });
    }

    const expense = new Expense({
      companyId,
      title,
      amount,
      date: date || new Date(),
      description,
      category,
      createdBy: req.user?.id,
    });

    await expense.save();

    // Deduct from Treasury
    await updateTreasury(-Math.abs(amount), `مصروف: ${title}`, {
      companyId,
      relatedModel: "Expense",
      relatedId: expense._id,
      userId: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "تم إضافة المصروف بنجاح",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update expense
 */
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date, description, category } = req.body;
    const companyId = req.user.companyId;

    const expense = await Expense.findOne({ _id: id, companyId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "المصروف غير موجود",
      });
    }

    const oldAmount = expense.amount;
    const newAmount = amount !== undefined ? Number(amount) : oldAmount;

    expense.title = title || expense.title;
    expense.amount = newAmount;
    expense.date = date || expense.date;
    expense.description = description || expense.description;
    expense.category = category || expense.category;

    await expense.save();

    // If amount changed, adjust treasury
    if (oldAmount !== newAmount) {
      const difference = oldAmount - newAmount;
      await updateTreasury(difference, `تعديل مصروف: ${title || expense.title}`, {
        companyId,
        relatedModel: "Expense",
        relatedId: expense._id,
        userId: req.user?.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث المصروف بنجاح",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    
    const expense = await Expense.findOne({ _id: id, companyId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "المصروف غير موجود",
      });
    }

    // Refund treasury before deleting
    await updateTreasury(
      expense.amount,
      `حذف مصروف: ${expense.title}`,
      {
        companyId,
        relatedModel: "Expense",
        relatedId: expense._id,
        userId: req.user?.id,
      },
    );

    await expense.deleteOne();

    return res.status(200).json({
      success: true,
      message: "تم حذف المصروف بنجاح",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};
