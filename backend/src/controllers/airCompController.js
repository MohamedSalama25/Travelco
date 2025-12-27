const asyncWrapper = require("../middlewares/asyncWarpper");
const AirComp = require("../models/AirComp.model");
const Transfer = require("../models/Transfer.model");
const AirCompPayment = require("../models/AirCompPayment.model");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const mongoose = require("mongoose");
const { updateTreasury } = require("../utils/treasury.helper");

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
 * Get all air companies with filtering and pagination
 */
const getAirComp = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { name } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        const airComps = await AirComp.find(filter, { "__v": false })
            .limit(limit)
            .skip(skip)
            .sort({ name: 1 });

        const total = await AirComp.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: airComps,
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
 * Get air company by ID
 */
const getAirCompById = asyncWrapper(
    async (req, res, next) => {
        const airComp = await AirComp.findById(req.params.id);
        if (!airComp) {
            const error = new AppError("AirComp not found", 404);
            return next(error);
        }
        return res.status(200).json({
            success: true,
            data: airComp
        });
    }
);

/**
 * Add new air company
 */
const addAirComp = async (req, res) => {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Name and phone are required'
        });
    }

    try {
        const newAirComp = new AirComp({
            name: name,
            phone: phone,
            address: address || ''
        });

        await newAirComp.save();

        return res.status(201).json({
            success: true,
            message: 'AirComp added successfully',
            data: newAirComp
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update air company
 */
const updateAirComp = async (req, res) => {
    try {
        const airComp = await AirComp.findById(req.params.id);

        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'AirCompany not found'
            });
        }

        const { name, phone, address } = req.body;

        // Update only provided fields
        if (name !== undefined) airComp.name = name;
        if (phone !== undefined) airComp.phone = phone;
        if (address !== undefined) airComp.address = address;

        await airComp.save();

        return res.status(200).json({
            success: true,
            message: 'AirCompany updated successfully',
            data: airComp
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete air company
 */
const deleteAirComp = async (req, res) => {
    try {
        const airComp = await AirComp.findById(req.params.id);

        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'AirCompany not found'
            });
        }

        // Check if air company has transfers
        const transferCount = await Transfer.countDocuments({ air_comp: airComp._id });
        if (transferCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete. This issuer has ${transferCount} ticket(s) linked.`
            });
        }

        await airComp.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'AirCompany deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get air company statistics with comparison
 */
const getAirCompStats = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const airCompId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(airCompId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid air company ID'
            });
        }

        const airComp = await AirComp.findById(airCompId);
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'AirCompany not found'
            });
        }

        let currentStart, currentEnd, prevStart, prevEnd;

        // Determine date ranges
        if (fromDate && toDate) {
            currentStart = new Date(fromDate);
            currentEnd = new Date(toDate);
            const duration = currentEnd - currentStart;
            prevEnd = new Date(currentStart);
            prevStart = new Date(prevEnd - duration);
        } else {
            // Default: Current Month vs Last Month
            const now = new Date();
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        }

        // Helper to get stats for a specific range
        const getStatsForRange = async (start, end) => {
            const matchStage = {
                air_comp: new mongoose.Types.ObjectId(airCompId),
                createdAt: { $gte: start, $lte: end }
            };

            const stats = await Transfer.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        ticketsCount: { $sum: 1 },
                        totalSales: { $sum: "$ticket_price" },
                        totalCost: { $sum: "$ticket_salary" },
                        totalCustomerPaid: { $sum: "$total_paid" },
                        customerRemaining: { $sum: "$remaining_amount" }
                    }
                }
            ]);

            const paymentMatchStage = {
                air_comp: new mongoose.Types.ObjectId(airCompId),
                payment_date: { $gte: start, $lte: end }
            };

            const payments = await AirCompPayment.aggregate([
                { $match: paymentMatchStage },
                {
                    $group: {
                        _id: null,
                        totalPaidToIssuer: { $sum: "$amount" }
                    }
                }
            ]);

            const result = stats[0] || {
                ticketsCount: 0,
                totalSales: 0,
                totalCost: 0,
                totalCustomerPaid: 0,
                customerRemaining: 0
            };

            const totalPaidToIssuer = payments[0]?.totalPaidToIssuer || 0;

            return {
                ...result,
                totalPaidToIssuer,
                remainingToIssuer: result.totalCost - totalPaidToIssuer,
                totalProfit: result.totalSales - result.totalCost
            };
        };

        const [currentStats, prevStats] = await Promise.all([
            getStatsForRange(currentStart, currentEnd),
            getStatsForRange(prevStart, prevEnd)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                airCompany: airComp,
                ticketsCount: {
                    value: currentStats.ticketsCount,
                    previous: prevStats.ticketsCount,
                    change: currentStats.ticketsCount - prevStats.ticketsCount,
                    percentage: calculateChange(currentStats.ticketsCount, prevStats.ticketsCount).toFixed(1),
                    trend: currentStats.ticketsCount >= prevStats.ticketsCount ? 'increase' : 'decrease'
                },
                totalSales: {
                    value: currentStats.totalSales,
                    previous: prevStats.totalSales,
                    change: currentStats.totalSales - prevStats.totalSales,
                    percentage: calculateChange(currentStats.totalSales, prevStats.totalSales).toFixed(1),
                    trend: currentStats.totalSales >= prevStats.totalSales ? 'increase' : 'decrease'
                },
                totalProfit: {
                    value: currentStats.totalProfit,
                    previous: prevStats.totalProfit,
                    change: currentStats.totalProfit - prevStats.totalProfit,
                    percentage: calculateChange(currentStats.totalProfit, prevStats.totalProfit).toFixed(1),
                    trend: currentStats.totalProfit >= prevStats.totalProfit ? 'increase' : 'decrease'
                },
                totalPurchases: {
                    value: currentStats.totalCost,
                    previous: prevStats.totalCost,
                    change: currentStats.totalCost - prevStats.totalCost,
                    percentage: calculateChange(currentStats.totalCost, prevStats.totalCost).toFixed(1),
                    trend: currentStats.totalCost >= prevStats.totalCost ? 'increase' : 'decrease'
                },
                totalPaidToIssuer: {
                    value: currentStats.totalPaidToIssuer,
                    previous: prevStats.totalPaidToIssuer,
                    change: currentStats.totalPaidToIssuer - prevStats.totalPaidToIssuer,
                    percentage: calculateChange(currentStats.totalPaidToIssuer, prevStats.totalPaidToIssuer).toFixed(1),
                    trend: currentStats.totalPaidToIssuer >= prevStats.totalPaidToIssuer ? 'increase' : 'decrease'
                },
                remainingToIssuer: {
                    value: currentStats.remainingToIssuer,
                    previous: prevStats.remainingToIssuer,
                    change: currentStats.remainingToIssuer - prevStats.remainingToIssuer,
                    percentage: calculateChange(currentStats.remainingToIssuer, prevStats.remainingToIssuer).toFixed(1),
                    trend: currentStats.remainingToIssuer >= prevStats.remainingToIssuer ? 'increase' : 'decrease'
                }
            },
            meta: {
                period: {
                    current: { start: currentStart, end: currentEnd },
                    previous: { start: prevStart, end: prevEnd }
                }
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
 * Get all air companies with their statistics
 */
const getAllAirCompWithStats = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        // Date filters for Transfers
        const transferMatchStage = { "$expr": { "$eq": ["$air_comp", "$$airCompId"] } };
        if (fromDate || toDate) {
            transferMatchStage.createdAt = {};
            if (fromDate) transferMatchStage.createdAt.$gte = new Date(fromDate);
            if (toDate) transferMatchStage.createdAt.$lte = new Date(toDate);
        }

        // Date filters for Payments
        const paymentMatchStage = { "$expr": { "$eq": ["$air_comp", "$$airCompId"] } };
        if (fromDate || toDate) {
            paymentMatchStage.payment_date = {};
            if (fromDate) paymentMatchStage.payment_date.$gte = new Date(fromDate);
            if (toDate) paymentMatchStage.payment_date.$lte = new Date(toDate);
        }

        const stats = await AirComp.aggregate([
            {
                $lookup: {
                    from: "transfers",
                    let: { airCompId: "$_id" },
                    pipeline: [
                        { $match: transferMatchStage },
                        {
                            $group: {
                                _id: null,
                                ticketsCount: { $sum: 1 },
                                totalSales: { $sum: "$ticket_price" },
                                totalCost: { $sum: "$ticket_salary" },
                            }
                        }
                    ],
                    as: "transferStats"
                }
            },
            {
                $lookup: {
                    from: "aircomppayments",
                    let: { airCompId: "$_id" },
                    pipeline: [
                        { $match: paymentMatchStage },
                        {
                            $group: {
                                _id: null,
                                totalPaid: { $sum: "$amount" }
                            }
                        }
                    ],
                    as: "paymentStats"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phone: 1,
                    transferStats: { $arrayElemAt: ["$transferStats", 0] },
                    paymentStats: { $arrayElemAt: ["$paymentStats", 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phone: 1,
                    ticketsCount: { $ifNull: ["$transferStats.ticketsCount", 0] },
                    totalSales: { $ifNull: ["$transferStats.totalSales", 0] },
                    totalCost: { $ifNull: ["$transferStats.totalCost", 0] },
                    totalPaidToIssuer: { $ifNull: ["$paymentStats.totalPaid", 0] }
                }
            },
            {
                $addFields: {
                    totalProfit: { $subtract: ["$totalSales", "$totalCost"] },
                    remainingToIssuer: { $subtract: ["$totalCost", "$totalPaidToIssuer"] },
                    // Map logical fields to legacy fields if needed, or just standard ones
                    totalPaid: "$totalPaidToIssuer",
                    remainingAmount: { $subtract: ["$totalCost", "$totalPaidToIssuer"] }
                }
            },
            { $sort: { totalProfit: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Add new payment to air company
 */
const addAirCompPayment = async (req, res) => {
    try {
        const { id: airCompId } = req.params;
        const { amount, payment_date, payment_method, notes, receipt_number } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount'
            });
        }

        const airComp = await AirComp.findById(airCompId);
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'Air Company not found'
            });
        }

        // Calculate current stats to validate remaining amount
        const transferStats = await Transfer.aggregate([
            {
                $match: {
                    air_comp: new mongoose.Types.ObjectId(airCompId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: "$ticket_salary" }
                }
            }
        ]);

        const paymentStats = await AirCompPayment.aggregate([
            {
                $match: {
                    air_comp: new mongoose.Types.ObjectId(airCompId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$amount" }
                }
            }
        ]);

        const totalPurchases = transferStats[0]?.totalPurchases || 0;
        const totalPaid = paymentStats[0]?.totalPaid || 0;
        const remainingAmount = totalPurchases - totalPaid;

        if (amount > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Payment amount (${amount}) exceeds remaining amount (${remainingAmount})`
            });
        }

        const payment = new AirCompPayment({
            air_comp: airCompId,
            amount,
            payment_date: payment_date || new Date(),
            payment_method: payment_method || 'cash',
            notes: notes || '',
            receipt_number: receipt_number || '',
            createdBy: req.user?.id
        });

        await payment.save();

        // Deduct from Treasury
        await updateTreasury(-amount, `دفع مبلغ لجهة الإصدار: ${airComp.name}`, {
            relatedModel: 'AirCompPayment',
            relatedId: payment._id,
            userId: req.user?.id
        });

        return res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get air company details including tickets and payments
 */
const getAirCompDetails = async (req, res) => {
    try {
        const tPage = parseInt(req.query.ticketsPage) || parseInt(req.query.page) || 1;
        const pPage = parseInt(req.query.paymentsPage) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (tPage - 1) * limit;
        const paySkip = (pPage - 1) * limit;

        const { id: airCompId } = req.params;
        const { fromDate, toDate } = req.query;

        const airComp = await AirComp.findById(airCompId);
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'Air Company not found'
            });
        }

        const filter = { air_comp: airCompId };
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        const transfers = await Transfer.find(filter)
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const totalTransfers = await Transfer.countDocuments(filter);

        const paymentFilter = { air_comp: airCompId };
        if (fromDate || toDate) {
            paymentFilter.payment_date = {};
            if (fromDate) paymentFilter.payment_date.$gte = new Date(fromDate);
            if (toDate) paymentFilter.payment_date.$lte = new Date(toDate);
        }

        const payments = await AirCompPayment.find(paymentFilter)
            .populate('createdBy', 'user_name email')
            .sort({ payment_date: -1 })
            .limit(limit)
            .skip(paySkip);

        const totalPayments = await AirCompPayment.countDocuments(paymentFilter);

        // Calculate totals for the filtered period
        const totals = await Transfer.aggregate([
            {
                $match: {
                    ...filter,
                    air_comp: new mongoose.Types.ObjectId(airCompId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: "$ticket_salary" },
                    totalSales: { $sum: "$ticket_price" },
                    ticketsCount: { $sum: 1 }
                }
            }
        ]);

        const totalPaidToIssuer = await AirCompPayment.aggregate([
            {
                $match: {
                    ...paymentFilter,
                    air_comp: new mongoose.Types.ObjectId(airCompId)
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const stats = totals[0] || { totalPurchases: 0, totalSales: 0, ticketsCount: 0 };
        const paidAmount = totalPaidToIssuer[0]?.total || 0;

        return res.status(200).json({
            success: true,
            data: {
                airComp,
                transfers,
                payments,
                stats: {
                    ...stats,
                    totalPaid: paidAmount,
                    remainingAmount: stats.totalPurchases - paidAmount
                },
                pagination: {
                    transfers: {
                        total: totalTransfers,
                        page: tPage,
                        limit,
                        pages: Math.ceil(totalTransfers / limit)
                    },
                    payments: {
                        total: totalPayments,
                        page: pPage,
                        limit,
                        pages: Math.ceil(totalPayments / limit)
                    }
                }
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
    addAirComp,
    getAirComp,
    getAirCompById,
    updateAirComp,
    deleteAirComp,
    getAirCompStats,
    getAllAirCompWithStats,
    addAirCompPayment,
    getAirCompDetails
};
