const Expense = require("../models/Expense.model");
const { updateTreasury } = require("../utils/treasury.helper");
const getPagination = require("../utils/pagination");

/**
 * Get all expenses with filtering and pagination
 */
const getExpenses = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { fromDate, toDate, search } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) filter.date.$gte = new Date(fromDate);
            if (toDate) filter.date.$lte = new Date(toDate);
        }

        const expenses = await Expense.find(filter)
            .populate('createdBy', 'user_name')
            .sort({ date: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Expense.countDocuments(filter);

        // Calculate total stats for the requested period/filter
        const stats = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        return res.status(200).json({
            success: true,
            data: expenses,
            pagination: {
                total,
                page: Math.floor(skip / limit) + 1,
                limit,
                pages: Math.ceil(total / limit)
            },
            stats: {
                totalAmount: stats[0]?.total || 0
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
 * Add new expense
 */
const addExpense = async (req, res) => {
    try {
        const { title, amount, date, description, category } = req.body;

        if (!title || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Title and Amount are required'
            });
        }

        const expense = new Expense({
            title,
            amount,
            date: date || new Date(),
            description,
            category,
            createdBy: req.user?.id
        });

        await expense.save();

        // Deduct from Treasury
        await updateTreasury(-Math.abs(amount), `Expense: ${title}`, {
            relatedModel: 'Expense',
            relatedId: expense._id,
            userId: req.user?.id
        });

        return res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            data: expense
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update expense
 * Note: Handling amount change requires complex Treasury adjustment (difference).
 * For simplicity in this iteration, we will implement basic update but warn/restrict amount updates or handle diff.
 * Let's handle amount diff.
 */
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, date, description, category } = req.body;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
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
            const difference = oldAmount - newAmount; // If (100 -> 120), diff is -20. We need to deduct 20 more.
            // updateTreasury adds the amount.
            // Expense reduces treasury.
            // If expense increases (100 -> 120), we need to reduce treasury by 20 more (-20).
            // If expense decreases (100 -> 80), we need to refund treasury by 20 (+20).
            // Logic:
            // Previous deduction: -100
            // New deduction: -120
            // Adjustment: -20
            // Formula: -(New - Old) = Old - New.
            
            await updateTreasury(difference, `Update Expense Adjustment: ${title}`, {
                relatedModel: 'Expense',
                relatedId: expense._id,
                userId: req.user?.id
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Refund treasury before deleting
        await updateTreasury(expense.amount, `Refund Deleted Expense: ${expense.title}`, {
            relatedModel: 'Expense',
            relatedId: expense._id,
            userId: req.user?.id
        });

        await Expense.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense
};
