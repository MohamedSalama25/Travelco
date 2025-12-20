const Payment = require("../models/Payment.model");
const Transfer = require("../models/Transfer.model");
const getPagination = require("../utils/pagination");
const { generatePaymentsExcel } = require("../utils/excelExport");
const { updateTreasury } = require("../utils/treasury.helper");

/**
 * Get all payments with filtering and pagination
 */
const getPayments = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { fromDate, toDate, payment_method } = req.query;

        const dateFilter = {};

        if (fromDate || toDate) {
            dateFilter.payment_date = {};
            if (fromDate) dateFilter.payment_date.$gte = new Date(fromDate);
            if (toDate) dateFilter.payment_date.$lte = new Date(toDate);
        }

        if (payment_method) {
            dateFilter.payment_method = payment_method;
        }

        const payments = await Payment.find(dateFilter, { "__v": false })
            .populate({
                path: 'transfer',
                select: 'booking_number ticket_price status',
                populate: {
                    path: 'customer',
                    select: 'name phone'
                }
            })
            .populate('createdBy', 'user_name email')
            .limit(limit)
            .skip(skip)
            .sort({ payment_date: -1 });

        const total = await Payment.countDocuments(dateFilter);

        // Calculate total amount
        const totalAmount = await Payment.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        return res.status(200).json({
            success: true,
            data: payments,
            totalAmount: totalAmount[0]?.total || 0,
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
 * Get payments by transfer ID
 */
const getPaymentsByTransfer = async (req, res) => {
    try {
        const transferId = req.params.transferId;

        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: "Transfer not found"
            });
        }

        const payments = await Payment.find({ transfer: transferId })
            .populate('createdBy', 'user_name email')
            .sort({ payment_date: -1 });

        return res.status(200).json({
            success: true,
            data: {
                transfer: {
                    booking_number: transfer.booking_number,
                    name: transfer.name,
                    ticket_price: transfer.ticket_price,
                    total_paid: transfer.total_paid,
                    remaining_amount: transfer.remaining_amount,
                    status: transfer.status
                },
                payments
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
 * Add new payment
 */
const addPayment = async (req, res) => {
    try {
        const {
            transfer: transferId,
            amount,
            payment_date,
            payment_method,
            receipt_number,
            notes
        } = req.body;

        if (!transferId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Transfer ID and amount are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            });
        }

        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: "Transfer not found"
            });
        }

        // Check if payment exceeds remaining amount
        if (amount > transfer.remaining_amount && transfer.remaining_amount > 0) {
            return res.status(400).json({
                success: false,
                message: `Payment amount exceeds remaining amount (${transfer.remaining_amount})`
            });
        }

        // Create payment
        const newPayment = new Payment({
            transfer: transferId,
            amount,
            payment_date: payment_date || new Date(),
            payment_method: payment_method || 'cash',
            receipt_number: receipt_number || "",
            notes: notes || "",
            createdBy: req.user?.id || null
        });

        await newPayment.save();

        // Update transfer payment status
        transfer.total_paid = (transfer.total_paid || 0) + amount;
        await transfer.save(); // This will trigger pre-save hook to update remaining_amount and status

        // Update Treasury
        await updateTreasury(amount, `دفعة للحجز رقم ${transfer.booking_number}`, {
            relatedModel: 'Transfer',
            relatedId: transfer._id,
            userId: req.user?.id || null
        });

        return res.status(201).json({
            success: true,
            message: "Payment added successfully",
            data: {
                payment: newPayment,
                transfer: {
                    total_paid: transfer.total_paid,
                    remaining_amount: transfer.remaining_amount,
                    status: transfer.status
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
 * Delete payment
 */
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const transfer = await Transfer.findById(payment.transfer);

        if (transfer) {
            // Revert payment from transfer
            transfer.total_paid = Math.max(0, (transfer.total_paid || 0) - payment.amount);
            await transfer.save();

            // Update Treasury (subtract amount)
            await updateTreasury(-payment.amount, `حذف دفعة للحجز رقم ${transfer.booking_number}`, {
                relatedModel: 'Transfer',
                relatedId: transfer._id,
                userId: req.user?.id || null
            });
        }

        await payment.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Payment deleted successfully",
            data: transfer ? {
                transfer: {
                    total_paid: transfer.total_paid,
                    remaining_amount: transfer.remaining_amount,
                    status: transfer.status
                }
            } : null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Export payments to Excel
 */
const exportPaymentsToExcel = async (req, res) => {
    try {
        const { fromDate, toDate, payment_method } = req.query;

        const filter = {};
        if (fromDate || toDate) {
            filter.payment_date = {};
            if (fromDate) filter.payment_date.$gte = new Date(fromDate);
            if (toDate) filter.payment_date.$lte = new Date(toDate);
        }
        if (payment_method) filter.payment_method = payment_method;

        const payments = await Payment.find(filter)
            .populate({
                path: 'transfer',
                select: 'booking_number',
                populate: {
                    path: 'customer',
                    select: 'name'
                }
            })
            .populate('createdBy', 'user_name')
            .sort({ payment_date: -1 });

        await generatePaymentsExcel(payments, res, 'payments');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPayments,
    getPaymentsByTransfer,
    addPayment,
    deletePayment,
    exportPaymentsToExcel
};
