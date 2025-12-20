const asyncWrapper = require("../middlewares/asyncWarpper");
const Transfer = require("../models/Transfer.model");
const Payment = require("../models/Payment.model");
const Customer = require("../models/Customer.model");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const { generateTransfersExcel } = require("../utils/excelExport");
const buildTransferStats = require("../utils/transferStats.helper");
const buildTransferFilter = require("../utils/buildTransferFilter");
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
 * Get all transfers with advanced filtering and pagination
 */
const getTransfers = async (req, res) => {
  const { limit, skip } = getPagination(req);

  const filter = await buildTransferFilter(req.query);

  const transfers = await Transfer.find(filter)
    .populate("customer", "name phone")
    .populate("air_comp", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Transfer.countDocuments(filter);

  const stats = await buildTransferStats({
    filter,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate
  });

  res.status(200).json({
    success: true,
    data: transfers,
    stats,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Get transfer by ID with payment history
 */
const getTransferById = asyncWrapper(
  async (req, res, next) => {
    const transfer = await Transfer.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('air_comp', 'name')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    if (!transfer) {
      const error = new AppError("Transfer not found", 404);
      return next(error);
    }

    // Get all payments for this transfer
    const payments = await Payment.find({ transfer: req.params.id })
      .populate('createdBy', 'user_name email')
      .sort({ payment_date: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...transfer.toJSON(),
        payments: payments
      }
    });
  }
);

/**
 * Add new transfer with automatic payment creation
 */
const addTransfer = async (req, res) => {
  try {
    const {
      booking_number,
      customer,
      air_comp,
      airPort,
      country,
      take_off_date,
      ticket_salary,
      ticket_price,
      transfer_pay
    } = req.body;

    // Validate Required Fields
    if (!booking_number || !customer || !air_comp) {
      return res.status(400).json({
        success: false,
        message: "Booking number, Customer, and air company are required"
      });
    }

    const initialPayment = transfer_pay || 0;

    // Create new Transfer object
    const newTransfer = new Transfer({
      booking_number,
      customer,
      air_comp,
      airPort: airPort || "",
      country: country || "",
      take_off_date: take_off_date || null,
      ticket_salary: ticket_salary || 0,
      ticket_price: ticket_price || 0,
      transfer_pay: initialPayment,
      total_paid: initialPayment,  // Set initial payment
      remaining_amount: (ticket_price || 0) - initialPayment,
      status: 'unpaid',  // Will be updated by pre-save hook
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null
    });

    await newTransfer.save();

    // Create payment record if initial payment was made
    let paymentRecord = null;
    if (initialPayment > 0) {
      paymentRecord = new Payment({
        transfer: newTransfer._id,
        amount: initialPayment,
        payment_date: new Date(),
        payment_method: 'cash',
        receipt_number: '',
        notes: 'دفعة مقدمة عند إنشاء التذكرة',
        createdBy: req.user?.id || null
      });
      await paymentRecord.save();

      // Update Treasury
      await updateTreasury(initialPayment, `دفعة مقدمة للحجز رقم ${newTransfer.booking_number}`, {
        relatedModel: 'Transfer',
        relatedId: newTransfer._id,
        userId: req.user?.id || null
      });
    }

    return res.status(201).json({
      success: true,
      message: "Transfer added successfully",
      data: {
        transfer: newTransfer,
        initialPayment: paymentRecord
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
 * Update transfer
 */
const updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    const {
      customer,
      air_comp,
      airPort,
      country,
      take_off_date,
      ticket_salary,
      ticket_price,
      transfer_pay
    } = req.body;

    // Prevent modification of transfer_pay after creation
    if (transfer_pay !== undefined && transfer_pay !== transfer.transfer_pay) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify initial payment (transfer_pay). Please add/delete payments instead."
      });
    }

    // Update only provided fields

    if (customer !== undefined) transfer.customer = customer;
    if (air_comp !== undefined) transfer.air_comp = air_comp;
    if (airPort !== undefined) transfer.airPort = airPort;
    if (country !== undefined) transfer.country = country;
    if (take_off_date !== undefined) transfer.take_off_date = take_off_date;
    if (ticket_salary !== undefined) transfer.ticket_salary = ticket_salary;

    // If ticket_price changed, recalculate remaining_amount
    if (ticket_price !== undefined && ticket_price !== transfer.ticket_price) {
      transfer.ticket_price = ticket_price;
      // remaining_amount will be recalculated in pre-save hook
    }

    transfer.updatedBy = req.user?.id || transfer.updatedBy;

    await transfer.save();

    return res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: transfer
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete transfer
 */
const deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Check if transfer has payments
    const paymentCount = await Payment.countDocuments({ transfer: req.params.id });
    if (paymentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete transfer. It has ${paymentCount} payment(s) linked. Please delete payments first.`
      });
    }

    await transfer.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Transfer deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get transfer statistics with comparison
 */
const getTransferStats = async (req, res) => {
  try {
    const { fromDate, toDate, air_comp } = req.query;

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
      const filter = {
        createdAt: { $gte: start, $lte: end }
      };
      if (air_comp) {
        filter.air_comp = air_comp;
      }

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
        overdueTickets: statusCounts.filter(s => s._id !== 'paid' && s._id !== 'cancel').reduce((acc, s) => acc + s.count, 0)
      };
    };

    const [currentStats, prevStats] = await Promise.all([
      getStatsForRange(currentStart, currentEnd),
      getStatsForRange(prevStart, prevEnd)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPassengers: {
          value: currentStats.totalPassengers,
          previous: prevStats.totalPassengers,
          change: currentStats.totalPassengers - prevStats.totalPassengers,
          percentage: calculateChange(currentStats.totalPassengers, prevStats.totalPassengers).toFixed(1),
          trend: currentStats.totalPassengers >= prevStats.totalPassengers ? 'increase' : 'decrease'
        },
        totalPayments: {
          value: currentStats.totalPaid,
          previous: prevStats.totalPaid,
          change: currentStats.totalPaid - prevStats.totalPaid,
          percentage: calculateChange(currentStats.totalPaid, prevStats.totalPaid).toFixed(1),
          trend: currentStats.totalPaid >= prevStats.totalPaid ? 'increase' : 'decrease'
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

const cancelTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cancel_reason,
      cancel_tax,
      cancel_commission
    } = req.body;

    // تحقق من البيانات
    if (!cancel_reason) {
      return res.status(400).json({
        success: false,
        message: 'سبب الإلغاء مطلوب'
      });
    }

    if (cancel_tax < 0 || cancel_commission < 0) {
      return res.status(400).json({
        success: false,
        message: 'الضريبة أو العمولة غير صحيحة'
      });
    }

    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    if (transfer.status === 'cancel') {
      return res.status(400).json({
        success: false,
        message: 'تم إلغاء التذكرة بالفعل'
      });
    }

    /* =====================
       حفظ القيم القديمة
    ====================== */
    transfer.transfer_pay_before_cancel = transfer.transfer_pay;
    transfer.transfer_salary_before_cancel = transfer.ticket_salary;
    transfer.transfer_price_before_cancel = transfer.ticket_price;

    /* =====================
       بيانات الإلغاء
    ====================== */
    transfer.cancel_reason = cancel_reason;
    transfer.cancel_tax = Number(cancel_tax);
    transfer.cancel_commission = Number(cancel_commission);

    /* =====================
       إعادة التسعير
    ====================== */
    // تكلفة التذكرة = الضريبة
    transfer.ticket_salary = transfer.cancel_tax;

    // سعر البيع الجديد = الضريبة + العمولة
    transfer.ticket_price =
      transfer.cancel_tax + transfer.cancel_commission;

    /* =====================
       إعادة الحسابات
    ====================== */
    if (transfer.total_paid > transfer.ticket_price) {
      transfer.total_paid = transfer.ticket_price;
    }

    transfer.remaining_amount =
      transfer.ticket_price - transfer.total_paid;

    /* =====================
       حساب الاسترداد (Refund)
    ====================== */
    if (transfer.total_paid > transfer.ticket_price) {
      transfer.refund_amount = transfer.total_paid - transfer.ticket_price;
      // لا يتم خصمها من الخزنة هنا، بل عند تأكيد الاسترداد من الفرونت اند
    } else {
      transfer.refund_amount = 0;
    }

    transfer.status = 'cancel';
    transfer.updatedBy = req.user.id;

    await transfer.save();

    return res.status(200).json({
      success: true,
      message: 'تم إلغاء التذكرة بنجاح',
      data: transfer
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const refundTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    if (transfer.status !== 'cancel') {
      return res.status(400).json({
        success: false,
        message: 'يجب إلغاء التذكرة أولاً لتنفيذ عملية الاسترداد'
      });
    }

    if (transfer.refund_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يوجد مبلغ مستحق للاسترداد لهذه التذكرة'
      });
    }

    if (transfer.refund_at) {
      return res.status(400).json({
        success: false,
        message: 'تم تنفيذ عملية الاسترداد مسبقاً'
      });
    }

    // خصم المبلغ من الخزنة
    await updateTreasury(-transfer.refund_amount, `استرداد مبلغ للعميل بعد إلغاء التذكرة رقم ${transfer.booking_number}`, {
      relatedModel: 'Transfer',
      relatedId: transfer._id,
      userId: req.user.id
    });

    transfer.refund_at = new Date();
    await transfer.save();

    return res.status(200).json({
      success: true,
      message: 'تم تنفيذ عملية الاسترداد من الخزنة بنجاح',
      data: transfer
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/**
 * Export transfers to Excel
 */
const exportTransfersToExcel = async (req, res) => {
  try {
    const filter = await buildTransferFilter(req.query);

    const transfers = await Transfer.find(filter)
      .populate('air_comp', 'name')
      .populate('customer', 'name phone')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email')
      .sort({ createdAt: -1 })
      .lean();

    await generateTransfersExcel(transfers, res, 'transfers');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addTransfer,
  getTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  getTransferStats,
  cancelTransfer,
  refundTransfer,
  exportTransfersToExcel
};
