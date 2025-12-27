const Transfer = require("../models/Transfer.model");
const Payment = require("../models/Payment.model");
const Customer = require("../models/Customer.model");
const AirComp = require("../models/AirComp.model");
const mongoose = require("mongoose");
const { generateReportExcel } = require("../utils/excelExport");

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
 * Get dashboard statistics (4 main cards) with comparison
 */
const getDashboardStats = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

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
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of current month

            prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // End of last month
        }

        // Helper to get stats for a specific range
        const getStatsForRange = async (start, end) => {
            const dateFilter = {
                createdAt: { $gte: start, $lte: end }
            };

            const stats = await Transfer.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalPassengers: { $sum: 1 },
                        totalSales: { $sum: "$ticket_price" },
                        totalCost: { $sum: "$ticket_salary" },
                        totalPaid: { $sum: "$total_paid" },
                        totalRemaining: { $sum: "$remaining_amount" }
                    }
                }
            ]);

            const paymentsStats = await Payment.aggregate([
                {
                    $match: {
                        payment_date: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: "$amount" }
                    }
                }
            ]);

            // Overdue tickets counts (tickets created in this period that are currently unpaid/partial)
            // Note: True historical overdue status is hard to reconstruct without complex audit logs
            const overdue = await Transfer.countDocuments({
                ...dateFilter,
                status: { $in: ['unpaid', 'partial'] }
            });

            const result = stats[0] || {
                totalPassengers: 0,
                totalSales: 0,
                totalCost: 0,
                totalPaid: 0,
                totalRemaining: 0
            };

            return {
                ...result,
                totalProfit: result.totalSales - result.totalCost,
                totalPayments: paymentsStats[0]?.totalPayments || 0,
                overdueTickets: overdue
            };
        };

        const [currentStats, prevStats] = await Promise.all([
            getStatsForRange(currentStart, currentEnd),
            getStatsForRange(prevStart, prevEnd)
        ]);

        // Get total customers (cumulative)
        const totalCustomers = await Customer.countDocuments();
        const newCustomers = await Customer.countDocuments({
            createdAt: { $gte: currentStart, $lte: currentEnd }
        });

        // Get latest transfers (tickets)
        const latestTransfers = await Transfer.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name phone')
            .populate('air_comp', 'name');

        // Get monthly stats for the current year
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Transfer.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    ticketsCount: { $sum: 1 },
                    totalSales: { $sum: "$ticket_price" },
                    totalCost: { $sum: "$ticket_salary" },
                    totalPaid: { $sum: "$total_paid" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get daily stats for the last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const dailyStats = await Transfer.aggregate([
            {
                $match: {
                    createdAt: { $gte: ninetyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    ticketsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyData = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = monthlyStats.find(s => s._id === i);
            monthlyData.push({
                month: i,
                ticketsCount: monthData?.ticketsCount || 0,
                totalSales: monthData?.totalSales || 0,
                totalCost: monthData?.totalCost || 0,
                totalProfit: (monthData?.totalSales || 0) - (monthData?.totalCost || 0),
                totalPaid: monthData?.totalPaid || 0
            });
        }

        // Calculate changes
        const data = {
            totalTickets: {
                value: currentStats.totalPassengers,
                previous: prevStats.totalPassengers,
                change: currentStats.totalPassengers - prevStats.totalPassengers,
                percentage: calculateChange(currentStats.totalPassengers, prevStats.totalPassengers).toFixed(1),
                trend: currentStats.totalPassengers >= prevStats.totalPassengers ? 'increase' : 'decrease'
            },
            totalPayments: {
                value: currentStats.totalPayments,
                previous: prevStats.totalPayments,
                change: currentStats.totalPayments - prevStats.totalPayments,
                percentage: calculateChange(currentStats.totalPayments, prevStats.totalPayments).toFixed(1),
                trend: currentStats.totalPayments >= prevStats.totalPayments ? 'increase' : 'decrease'
            },
            totalProfit: {
                value: currentStats.totalProfit,
                previous: prevStats.totalProfit,
                change: currentStats.totalProfit - prevStats.totalProfit,
                percentage: calculateChange(currentStats.totalProfit, prevStats.totalProfit).toFixed(1),
                trend: currentStats.totalProfit >= prevStats.totalProfit ? 'increase' : 'decrease'
            },
            overdueTickets: {
                value: currentStats.overdueTickets,
                previous: prevStats.overdueTickets,
                change: currentStats.overdueTickets - prevStats.overdueTickets,
                percentage: calculateChange(currentStats.overdueTickets, prevStats.overdueTickets).toFixed(1),
                trend: currentStats.overdueTickets >= prevStats.overdueTickets ? 'increase' : 'decrease'
            },
            latestTransfers,
            latestTransfers,
            monthlyStats: monthlyData,
            dailyStats
        };

        return res.status(200).json({
            success: true,
            data: data,
            meta: {
                customers: {
                    total: totalCustomers,
                    newThisPeriod: newCustomers
                },
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
 * Get statistics by Air Company (issuer)
 */
const getStatsByAirComp = async (req, res) => {
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

/**
 * Get monthly statistics
 */
const getMonthlyStats = async (req, res) => {
    try {
        const { year } = req.query;
        const selectedYear = parseInt(year) || new Date().getFullYear();

        const stats = await Transfer.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lt: new Date(`${selectedYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    ticketsCount: { $sum: 1 },
                    totalSales: { $sum: "$ticket_price" },
                    totalCost: { $sum: "$ticket_salary" },
                    totalPaid: { $sum: "$total_paid" }
                }
            },
            {
                $project: {
                    month: "$_id",
                    ticketsCount: 1,
                    totalSales: 1,
                    totalCost: 1,
                    totalProfit: { $subtract: ["$totalSales", "$totalCost"] },
                    totalPaid: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        // Fill missing months with zero values
        const monthlyData = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = stats.find(s => s.month === i);
            monthlyData.push({
                month: i,
                ticketsCount: monthData?.ticketsCount || 0,
                totalSales: monthData?.totalSales || 0,
                totalCost: monthData?.totalCost || 0,
                totalProfit: monthData?.totalProfit || 0,
                totalPaid: monthData?.totalPaid || 0
            });
        }

        return res.status(200).json({
            success: true,
            year: selectedYear,
            data: monthlyData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get inventory/stock summary (Jard)
 */
const getInventorySummary = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        const matchStage = {};
        if (fromDate || toDate) {
            matchStage.createdAt = {};
            if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
            if (toDate) matchStage.createdAt.$lte = new Date(toDate);
        }

        // Get all tickets summary
        const ticketsSummary = await Transfer.aggregate([
            { $match: matchStage },
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

        // Get payments summary
        const paymentsSummary = await Payment.aggregate([
            {
                $match: fromDate || toDate ? {
                    payment_date: {
                        ...(fromDate && { $gte: new Date(fromDate) }),
                        ...(toDate && { $lte: new Date(toDate) })
                    }
                } : {}
            },
            {
                $group: {
                    _id: "$payment_method",
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get status breakdown
        const statusBreakdown = await Transfer.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    amount: { $sum: "$ticket_price" },
                    remaining: { $sum: "$remaining_amount" }
                }
            }
        ]);

        const tickets = ticketsSummary[0] || {
            totalTickets: 0,
            totalSales: 0,
            totalCost: 0,
            totalPaid: 0,
            totalRemaining: 0
        };

        return res.status(200).json({
            success: true,
            data: {
                // Overall Summary
                summary: {
                    totalTickets: tickets.totalTickets,
                    totalSales: tickets.totalSales,
                    totalCost: tickets.totalCost,
                    grossProfit: tickets.totalSales - tickets.totalCost,
                    totalReceived: tickets.totalPaid,
                    totalPending: tickets.totalRemaining,
                    netProfit: tickets.totalPaid - tickets.totalCost
                },
                // Payment Methods Breakdown
                paymentsByMethod: paymentsSummary,
                // Status Breakdown
                ticketsByStatus: statusBreakdown,
                // Date Range
                dateRange: {
                    from: fromDate || 'All time',
                    to: toDate || 'Now'
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
 * Export Air Company stats to Excel
 */
const exportAirCompStatsToExcel = async (req, res) => {
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
                    name: { $ifNull: ["$airCompInfo.name", "Unknown"] },
                    ticketsCount: 1,
                    totalSales: 1,
                    totalCost: 1,
                    totalProfit: { $subtract: ["$totalSales", "$totalCost"] },
                    remainingAmount: 1
                }
            }
        ]);

        await generateReportExcel(stats, 'aircomp_stats', res, 'aircomp_report');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getStatsByAirComp,
    getMonthlyStats,
    getInventorySummary,
    exportAirCompStatsToExcel
};
