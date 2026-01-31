const asyncWrapper = require("../middlewares/asyncWarpper");
const AirComp = require("../models/AirComp.model");
const Transfer = require("../models/Transfer.model");
const AirCompPayment = require("../models/AirCompPayment.model");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const mongoose = require("mongoose");
const { updateTreasury } = require("../utils/treasury.helper");
const { getCompanyFilter } = require("../utils/companyFilter");

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
        const { search, hasBalance } = req.query;
        const companyId = req.user.companyId;
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        // Base match stage with company filter
        const matchStage = { companyId: companyObjectId };
        if (search) {
            matchStage.name = { $regex: search, $options: 'i' };
        }

        const pipeline = [
            { $match: matchStage },
            // Lookup to get total costs from transfers
            {
                $lookup: {
                    from: "transfers",
                    let: { airCompId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$air_comp", "$$airCompId"] }, { $eq: ["$companyId", companyObjectId] }] } } },
                        { $group: { _id: null, totalCost: { $sum: "$ticket_salary" } } }
                    ],
                    as: "costs"
                }
            },
            // Lookup to get total payments
            {
                $lookup: {
                    from: "aircomppayments",
                    let: { airCompId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$air_comp", "$$airCompId"] }, { $eq: ["$companyId", companyObjectId] }] } } },
                        { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
                    ],
                    as: "payments"
                }
            },
            {
                $project: {
                    name: 1,
                    phone: 1,
                    address: 1,
                    totalCost: { $ifNull: [{ $arrayElemAt: ["$costs.totalCost", 0] }, 0] },
                    totalPaid: { $ifNull: [{ $arrayElemAt: ["$payments.totalPaid", 0] }, 0] }
                }
            },
            {
                $addFields: {
                    remainingAmount: { $subtract: ["$totalCost", "$totalPaid"] }
                }
            }
        ];

        // Apply hasBalance filter if requested
        if (hasBalance === 'true') {
            pipeline.push({ $match: { remainingAmount: { $gt: 0 } } });
        }

        // Handle total count for pagination
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await AirComp.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Apply pagination and sort
        pipeline.push({ $sort: { name: 1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const airComps = await AirComp.aggregate(pipeline);

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
        const companyId = req.user.companyId;
        const airComp = await AirComp.findOne({ _id: req.params.id, companyId });
        if (!airComp) {
            const error = new AppError("جهة الإصدار غير موجودة", 404);
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
    const companyId = req.user.companyId;

    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: 'الاسم ورقم الهاتف مطلوبان'
        });
    }

    try {
        const newAirComp = new AirComp({
            companyId,
            name: name,
            phone: phone,
            address: address || ''
        });

        await newAirComp.save();

        return res.status(201).json({
            success: true,
            message: 'تم إضافة جهة الإصدار بنجاح',
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
        const companyId = req.user.companyId;
        const airComp = await AirComp.findOne({ _id: req.params.id, companyId });

        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'جهة الإصدار غير موجودة'
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
            message: 'تم تحديث بيانات جهة الإصدار بنجاح',
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
        const companyId = req.user.companyId;
        const airComp = await AirComp.findOne({ _id: req.params.id, companyId });

        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'جهة الإصدار غير موجودة'
            });
        }

        // Check if air company has transfers
        const transferCount = await Transfer.countDocuments({ air_comp: airComp._id, companyId });
        if (transferCount > 0) {
            return res.status(400).json({
                success: false,
                message: `لا يمكن الحذف. جهة الإصدار هذه مرتبطة بعدد (${transferCount}) من التذاكر.`
            });
        }

        await airComp.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'تم حذف جهة الإصدار بنجاح'
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
        const companyId = req.user.companyId;
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(airCompId)) {
            return res.status(400).json({
                success: false,
                message: 'معرف جهة الإصدار غير صحيح'
            });
        }

        const airComp = await AirComp.findOne({ _id: airCompId, companyId });
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'جهة الإصدار غير موجودة'
            });
        }

        let currentStart, currentEnd, prevStart, prevEnd;

        // Determine date ranges
        if (fromDate && toDate) {
            currentStart = new Date(fromDate);
            currentEnd = new Date(toDate);
            currentEnd.setHours(23, 59, 59, 999);
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
                companyId: companyObjectId,
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
                companyId: companyObjectId,
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
        const { fromDate, toDate, search, hasBalance } = req.query;
        const companyId = req.user.companyId;
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        // Match stage for basic fields (search + company)
        const initialMatch = { companyId: companyObjectId };
        if (search) {
            initialMatch.name = { $regex: search, $options: 'i' };
        }

        // Date filters for Transfers
        const transferMatchStage = { 
            "$expr": { 
                "$and": [
                    { "$eq": ["$air_comp", "$$airCompId"] },
                    { "$eq": ["$companyId", companyObjectId] }
                ]
            }
        };
        if (fromDate || toDate) {
            transferMatchStage.createdAt = {};
            if (fromDate) transferMatchStage.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                transferMatchStage.createdAt.$lte = endOfDay;
            }
        }

        // Date filters for Payments
        const paymentMatchStage = { 
            "$expr": { 
                "$and": [
                    { "$eq": ["$air_comp", "$$airCompId"] },
                    { "$eq": ["$companyId", companyObjectId] }
                ]
            }
        };
        if (fromDate || toDate) {
            paymentMatchStage.payment_date = {};
            if (fromDate) paymentMatchStage.payment_date.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                paymentMatchStage.payment_date.$lte = endOfDay;
            }
        }

        const pipeline = [
            { $match: initialMatch },
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
                    totalPaid: "$totalPaidToIssuer",
                    remainingAmount: { $subtract: ["$totalCost", "$totalPaidToIssuer"] }
                }
            }
        ];

        // Apply hasBalance filter
        if (hasBalance === 'true') {
            pipeline.push({ $match: { remainingToIssuer: { $gt: 0 } } });
        }

        pipeline.push({ $sort: { totalProfit: -1 } });

        const stats = await AirComp.aggregate(pipeline);

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
        const companyId = req.user.companyId;
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'مبلغ الدفعة غير صحيح'
            });
        }

        const airComp = await AirComp.findOne({ _id: airCompId, companyId });
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'جهة الإصدار غير موجودة'
            });
        }

        // Calculate current stats to validate remaining amount
        const transferStats = await Transfer.aggregate([
            {
                $match: {
                    companyId: companyObjectId,
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
                    companyId: companyObjectId,
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
                message: `مبلغ الدفعة (${amount}) يتجاوز المبلغ المتبقي (${remainingAmount})`
            });
        }

        const payment = new AirCompPayment({
            companyId,
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
            companyId,
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
        const companyId = req.user.companyId;
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        const airComp = await AirComp.findOne({ _id: airCompId, companyId });
        if (!airComp) {
            return res.status(404).json({
                success: false,
                message: 'جهة الإصدار غير موجودة'
            });
        }

        const filter = { air_comp: airCompId, companyId };
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        const transfers = await Transfer.find(filter)
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const totalTransfers = await Transfer.countDocuments(filter);

        const paymentFilter = { air_comp: airCompId, companyId };
        if (fromDate || toDate) {
            paymentFilter.payment_date = {};
            if (fromDate) paymentFilter.payment_date.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                paymentFilter.payment_date.$lte = endOfDay;
            }
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
                    companyId: companyObjectId,
                    air_comp: new mongoose.Types.ObjectId(airCompId),
                    ...(filter.createdAt && { createdAt: filter.createdAt })
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
                    companyId: companyObjectId,
                    air_comp: new mongoose.Types.ObjectId(airCompId),
                    ...(paymentFilter.payment_date && { payment_date: paymentFilter.payment_date })
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
