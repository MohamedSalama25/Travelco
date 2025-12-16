const Users = require("../models/Users.model");
const Transfer = require("../models/Transfer.model");
const Payment = require("../models/Payment.model");
const Customer = require("../models/Customer.model");
const getPagination = require("../utils/pagination");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { name, email, role } = req.query;

        const filter = {};

        if (name) {
            filter.user_name = { $regex: name, $options: "i" };
        }
        if (email) {
            filter.email = { $regex: email, $options: "i" };
        }
        if (role) {
            filter.role = role;
        }

        const users = await Users.find(filter, { "__v": false, "password": false })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Users.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: users,
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

const addUser = async (req, res) => {
    try {
        const { user_name, email, password, role } = req.body;

        if (!user_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "User name, email and password are required"
            });
        }

        const emailExists = await Users.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email is already exist"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await Users.create({
            user_name,
            email,
            password: hashedPassword,
            role: role || "accountant"
        });

        const userSafe = newUser.toObject();
        delete userSafe.password;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userSafe
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)[0].message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { user_name, email, password, role } = req.body;

        const user = await Users.findById(req.params.id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (email && email !== user.email) {
            const emailExists = await Users.findOne({ email });
            if (emailExists && String(emailExists._id) !== String(user._id)) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already exist"
                });
            }
        }

        if (user_name !== undefined) user.user_name = user_name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;

        if (password !== undefined && password !== "") {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        const userSafe = user.toObject();
        delete userSafe.password;

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: userSafe
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)[0].message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const userId = req.params.id;

        const user = await Users.findById(userId, { "__v": false, "password": false });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const transfers = await Transfer.find({ createdBy: user._id }, { "__v": false })
            .populate("customer", "name phone")
            .populate("air_comp", "name")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const totalTransfers = await Transfer.countDocuments({ createdBy: user._id });

        const transferStatsAgg = await Transfer.aggregate([
            { $match: { createdBy: user._id } },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    totalSales: { $sum: "$ticket_price" },
                    totalCost: { $sum: "$ticket_salary" },
                    totalPaid: { $sum: "$total_paid" },
                    totalRemaining: { $sum: "$remaining_amount" }
                }
            }
        ]);

        const transferStatusCounts = await Transfer.aggregate([
            { $match: { createdBy: user._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const transferStatsBase = transferStatsAgg[0] || {
            totalTickets: 0,
            totalSales: 0,
            totalCost: 0,
            totalPaid: 0,
            totalRemaining: 0
        };

        const transferStats = {
            ...transferStatsBase,
            totalProfit: transferStatsBase.totalSales - transferStatsBase.totalCost,
            ticketsByStatus: {
                paid: transferStatusCounts.find(s => s._id === "paid")?.count || 0,
                partial: transferStatusCounts.find(s => s._id === "partial")?.count || 0,
                unpaid: transferStatusCounts.find(s => s._id === "unpaid")?.count || 0
            }
        };

        const paymentStatsAgg = await Payment.aggregate([
            { $match: { createdBy: user._id } },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalPaymentAmount: { $sum: "$amount" }
                }
            }
        ]);

        const paymentStats = paymentStatsAgg[0] || {
            totalPayments: 0,
            totalPaymentAmount: 0
        };

        const totalCustomersCreated = await Customer.countDocuments({ createdBy: user._id });

        return res.status(200).json({
            success: true,
            data: {
                user,
                transfers,
                stats: {
                    transfers: transferStats,
                    payments: paymentStats,
                    customers: {
                        totalCustomersCreated
                    }
                }
            },
            pagination: {
                total: totalTransfers,
                page: Math.floor(skip / limit) + 1,
                limit,
                pages: Math.ceil(totalTransfers / limit)
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
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById
};
