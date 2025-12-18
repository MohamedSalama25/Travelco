// utils/transferStats.helper.js
const Transfer = require("../models/Transfer.model");

const calculateChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
};

const buildTransferStats = async ({ fromDate, toDate, air_comp }) => {
    let currentStart, currentEnd, prevStart, prevEnd;

    if (fromDate && toDate) {
        currentStart = new Date(fromDate);
        currentEnd = new Date(toDate);
        const duration = currentEnd - currentStart;
        prevEnd = new Date(currentStart);
        prevStart = new Date(prevEnd - duration);
    } else {
        const now = new Date();
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    const getStatsForRange = async (start, end) => {
        const filter = { createdAt: { $gte: start, $lte: end } };
        if (air_comp) filter.air_comp = air_comp;

        const stats = await Transfer.aggregate([
            { $match: filter },
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

        const statusCounts = await Transfer.aggregate([
            { $match: filter },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

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
            overdueTickets: statusCounts
                .filter(s => s._id !== 'paid')
                .reduce((acc, s) => acc + s.count, 0)
        };
    };

    const [currentStats, prevStats] = await Promise.all([
        getStatsForRange(currentStart, currentEnd),
        getStatsForRange(prevStart, prevEnd)
    ]);

    return {
        totalPassengers: {
            value: currentStats.totalPassengers,
            previous: prevStats.totalPassengers,
            change: currentStats.totalPassengers - prevStats.totalPassengers,
            percentage: calculateChange(
                currentStats.totalPassengers,
                prevStats.totalPassengers
            ).toFixed(1),
            trend:
                currentStats.totalPassengers >= prevStats.totalPassengers
                    ? "increase"
                    : "decrease"
        },
        totalPayments: {
            value: currentStats.totalPaid,
            previous: prevStats.totalPaid,
            change: currentStats.totalPaid - prevStats.totalPaid,
            percentage: calculateChange(
                currentStats.totalPaid,
                prevStats.totalPaid
            ).toFixed(1),
            trend:
                currentStats.totalPaid >= prevStats.totalPaid
                    ? "increase"
                    : "decrease"
        },
        totalProfit: {
            value: currentStats.totalProfit,
            previous: prevStats.totalProfit,
            change: currentStats.totalProfit - prevStats.totalProfit,
            percentage: calculateChange(
                currentStats.totalProfit,
                prevStats.totalProfit
            ).toFixed(1),
            trend:
                currentStats.totalProfit >= prevStats.totalProfit
                    ? "increase"
                    : "decrease"
        },
        overdueTickets: {
            value: currentStats.overdueTickets,
            previous: prevStats.overdueTickets,
            change: currentStats.overdueTickets - prevStats.overdueTickets,
            percentage: calculateChange(
                currentStats.overdueTickets,
                prevStats.overdueTickets
            ).toFixed(1),
            trend:
                currentStats.overdueTickets >= prevStats.overdueTickets
                    ? "increase"
                    : "decrease"
        }
    };
};

module.exports = buildTransferStats;
