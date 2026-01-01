const TreasuryHistory = require("../models/TreasuryHistory.model");
const Treasury = require("../models/Treasury.model");
const Transfer = require("../models/Transfer.model");
const Expense = require("../models/Expense.model");
const Payment = require("../models/Payment.model");
const getPagination = require("../utils/pagination");
const { generateTreasuryExcel } = require("../utils/excelExport");
const { updateTreasury } = require("../utils/treasury.helper");

/**
 * Get Treasury history with filtering and pagination
 */
const getTreasuryHistory = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { fromDate, toDate, type, relatedModel } = req.query;

        const filter = {};

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        if (type) {
            filter.type = type;
        }

        if (relatedModel) {
            filter.relatedModel = relatedModel;
        }

        const history = await TreasuryHistory.find(filter)
            .populate('createdBy', 'user_name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await TreasuryHistory.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page: Math.floor(skip / limit) + 1,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get Treasury statistics
 */
const getTreasuryStats = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const filter = {};

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        // Get total in
        const totalIn = await TreasuryHistory.aggregate([
            { $match: { ...filter, type: 'in' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Get total out
        const totalOut = await TreasuryHistory.aggregate([
            { $match: { ...filter, type: 'out' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Get current balance
        const treasury = await Treasury.findOne({ name: "Main Treasury" });

        return res.status(200).json({
            success: true,
            data: {
                totalIn: totalIn[0]?.total || 0,
                totalOut: totalOut[0]?.total || 0,
                currentBalance: treasury?.balance || 0,
                netChange: (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Export Treasury history to Excel
 */
const exportTreasuryToExcel = async (req, res) => {
    try {
        const { fromDate, toDate, type, relatedModel } = req.query;
        const filter = {};

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        if (type) filter.type = type;
        if (relatedModel) filter.relatedModel = relatedModel;

        const history = await TreasuryHistory.find(filter)
            .populate('createdBy', 'user_name')
            .sort({ createdAt: -1 });

        await generateTreasuryExcel(history, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Add manual transaction (Deposit/Withdraw)
 */
const addTransaction = async (req, res) => {
    try {
        const { type, amount, description } = req.body;

        if (!type || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول مطلوبة'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'يجب أن يكون المبلغ أكبر من 0'
            });
        }

        if (!['in', 'out'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'نوع المعاملة غير صحيح'
            });
        }

        const signedAmount = type === 'in' ? amount : -amount;

        // Perform treasury update
        await updateTreasury(signedAmount, description, {
            relatedModel: 'Other',
            userId: req.user?.id
        });

        // Provide feedback including updated balance
        const treasury = await Treasury.findOne({ name: "Main Treasury" });

        return res.status(200).json({
            success: true,
            message: 'تم إضافة المعاملة بنجاح',
            data: {
                balance: treasury?.balance || 0
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get Inventory (Jard) summary 
 */
const getInventory = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const filter = {};

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        // 1. Calculate Revenue and Profit from Transfers
        const transferStats = await Transfer.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$ticket_price" },
                    totalCost: { $sum: "$ticket_salary" },
                }
            }
        ]);
        const profit = (transferStats[0]?.totalRevenue || 0) - (transferStats[0]?.totalCost || 0);

        // 2. Calculate Expenses from Expense model
        const expenseFilter = {};
        if (fromDate || toDate) {
            expenseFilter.date = {};
            if (fromDate) expenseFilter.date.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                expenseFilter.date.$lte = endOfDay;
            }
        }

        const expenseStats = await Expense.aggregate([
            { $match: expenseFilter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const expenses = expenseStats[0]?.total || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalExpenses: expenses,
                totalProfit: profit,
                netProfit: profit - expenses
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTreasuryHistory,
    getTreasuryStats,
    exportTreasuryToExcel,
    addTransaction,
    getInventory
};
