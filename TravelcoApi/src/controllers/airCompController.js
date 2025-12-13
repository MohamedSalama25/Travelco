const asyncWrapper = require("../middlewares/asyncWarpper");
const AirComp = require("../models/AirComp.model");
const Transfer = require("../models/Transfer.model");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const mongoose = require("mongoose");

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
                        totalPaid: { $sum: "$total_paid" },
                        remainingAmount: { $sum: "$remaining_amount" }
                    }
                }
            ]);

            const result = stats[0] || {
                ticketsCount: 0,
                totalSales: 0,
                totalCost: 0,
                totalPaid: 0,
                remainingAmount: 0
            };

            return {
                ...result,
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
                remainingAmount: {
                    value: currentStats.remainingAmount,
                    previous: prevStats.remainingAmount,
                    change: currentStats.remainingAmount - prevStats.remainingAmount,
                    percentage: calculateChange(currentStats.remainingAmount, prevStats.remainingAmount).toFixed(1),
                    trend: currentStats.remainingAmount >= prevStats.remainingAmount ? 'increase' : 'decrease'
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

        const matchStage = {};
        if (fromDate || toDate) {
            matchStage.createdAt = {};
            if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
            if (toDate) matchStage.createdAt.$lte = new Date(toDate);
        }

        const stats = await Transfer.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$air_comp",
                    ticketsCount: { $sum: 1 },
                    totalSales: { $sum: "$ticket_price" },
                    totalCost: { $sum: "$ticket_salary" },
                    totalPaid: { $sum: "$total_paid" },
                    remainingAmount: { $sum: "$remaining_amount" }
                }
            },
            {
                $lookup: {
                    from: "aircomps",
                    localField: "_id",
                    foreignField: "_id",
                    as: "airCompInfo"
                }
            },
            {
                $unwind: {
                    path: "$airCompInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: { $ifNull: ["$airCompInfo.name", "Unknown"] },
                    phone: "$airCompInfo.phone",
                    ticketsCount: 1,
                    totalSales: 1,
                    totalCost: 1,
                    totalProfit: { $subtract: ["$totalSales", "$totalCost"] },
                    totalPaid: 1,
                    remainingAmount: 1
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

module.exports = {
    addAirComp,
    getAirComp,
    getAirCompById,
    updateAirComp,
    deleteAirComp,
    getAirCompStats,
    getAllAirCompWithStats
};
