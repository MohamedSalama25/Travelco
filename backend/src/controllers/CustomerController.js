const Customer = require("../models/Customer.model");
const Transfer = require("../models/Transfer.model");
const getPagination = require("../utils/pagination");
const { generateCustomersExcel } = require("../utils/excelExport");

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

        // Build filter object
        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (phone) {
            filter.phone = { $regex: phone, $options: 'i' };
        }
        if (nationality) {
            filter.nationality = { $regex: nationality, $options: 'i' };
        }

        const customers = await Customer.find(filter, { "__v": false })
            .populate('createdBy', 'user_name email')
            .populate('updatedBy', 'user_name email')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: customers,
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
 * Get customer statistics with comparison
 */
const getCustomerStats = async (req, res) => {
    try {
        const now = new Date();
        const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Helper to get stats for a specific range
        const getStatsForRange = async (start, end) => {
            const newCustomers = await Customer.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });

            const transfers = await Transfer.aggregate([
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer",
                        foreignField: "_id",
                        as: "customerInfo"
                    }
                },
                {
                    $match: {
                        "customerInfo.createdAt": { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: 1 },
                        totalRevenue: { $sum: "$ticket_price" }
                    }
                }
            ]);

            return {
                newCustomers,
                totalTickets: transfers[0]?.totalTickets || 0,
                totalRevenue: transfers[0]?.totalRevenue || 0
            };
        };

        const [currentStats, prevStats] = await Promise.all([
            getStatsForRange(currentStart, currentEnd),
            getStatsForRange(prevStart, prevEnd)
        ]);

        const totalCustomers = await Customer.countDocuments();

        return res.status(200).json({
            success: true,
            data: {
                totalCustomers: {
                    value: totalCustomers,
                    trend: 'neutral'
                },
                newCustomers: {
                    value: currentStats.newCustomers,
                    previous: prevStats.newCustomers,
                    change: currentStats.newCustomers - prevStats.newCustomers,
                    percentage: calculateChange(currentStats.newCustomers, prevStats.newCustomers).toFixed(1),
                    trend: currentStats.newCustomers >= prevStats.newCustomers ? 'increase' : 'decrease'
                },
                totalTickets: {
                    value: currentStats.totalTickets,
                    previous: prevStats.totalTickets,
                    change: currentStats.totalTickets - prevStats.totalTickets,
                    percentage: calculateChange(currentStats.totalTickets, prevStats.totalTickets).toFixed(1),
                    trend: currentStats.totalTickets >= prevStats.totalTickets ? 'increase' : 'decrease'
                },
                totalRevenue: {
                    value: currentStats.totalRevenue,
                    previous: prevStats.totalRevenue,
                    change: currentStats.totalRevenue - prevStats.totalRevenue,
                    percentage: calculateChange(currentStats.totalRevenue, prevStats.totalRevenue).toFixed(1),
                    trend: currentStats.totalRevenue >= prevStats.totalRevenue ? 'increase' : 'decrease'
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
 * Get customer by ID
 */
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const transfers = await Transfer.find({ customer: customerId })
            .populate('air_comp', 'name phone')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Transfer.countDocuments({ customer: customerId });

        // Calculate customer stats
        const stats = await Transfer.aggregate([
            { $match: { customer: customer._id } },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    totalAmount: { $sum: "$ticket_price" },
                    totalPaid: { $sum: "$total_paid" },
                    totalRemaining: { $sum: "$remaining_amount" }
                }
            }
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
                    totalRemaining: 0
                }
            },
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
            notes
        } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required"
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
            updatedBy: req.user?.id || null
        });

        await newCustomer.save();

        return res.status(201).json({
            success: true,
            message: "Customer added successfully",
            data: newCustomer
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update customer
 */
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
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
            notes
        } = req.body;

        // Update only provided fields
        if (name !== undefined) customer.name = name;
        if (phone !== undefined) customer.phone = phone;
        if (email !== undefined) customer.email = email;
        if (national_id !== undefined) customer.national_id = national_id;
        if (passport_number !== undefined) customer.passport_number = passport_number;
        if (nationality !== undefined) customer.nationality = nationality;
        if (address !== undefined) customer.address = address;
        if (notes !== undefined) customer.notes = notes;
        customer.updatedBy = req.user?.id || customer.updatedBy;

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete customer
 */
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Check if customer has transfers
        const transferCount = await Transfer.countDocuments({ customer: customer._id });
        if (transferCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete customer. They have ${transferCount} ticket(s) linked.`
            });
        }

        await customer.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Export customers to Excel
 */
const exportCustomersToExcel = async (req, res) => {
    try {
        const { name, phone, nationality } = req.query;

        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (phone) filter.phone = { $regex: phone, $options: 'i' };
        if (nationality) filter.nationality = { $regex: nationality, $options: 'i' };

        const customers = await Customer.find(filter).sort({ createdAt: -1 });

        await generateCustomersExcel(customers, res, 'customers');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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
    exportCustomersToExcel
};
