const mongoose = require("mongoose");
const Advance = require("../models/Advance.model");
const Users = require("../models/Users.model");
const { updateTreasury } = require("../utils/treasury.helper");
const getPagination = require("../utils/pagination");
const { getCompanyFilter } = require("../utils/companyFilter");

const addAdvance = async (req, res) => {
  try {
    const { user, amount, reason, notes, date } = req.body;
    const companyId = req.user.companyId;

    if (!user || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "الموظف، المبلغ والسبب حقول مطلوبة",
      });
    }

    // Verify user belongs to same company
    const targetUser = await Users.findOne({ _id: user, companyId });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "الموظف غير موجود",
      });
    }

    const newAdvance = await Advance.create({
      companyId,
      user,
      amount,
      reason,
      notes,
      date: date || Date.now(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "تم تقديم طلب السلفة بنجاح",
      data: newAdvance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdvances = async (req, res) => {
  try {
    const { limit, skip } = getPagination(req);
    const { user, status, fromDate, toDate } = req.query;
    const companyId = req.user.companyId;

    const filter = getCompanyFilter(companyId);
    if (user) filter.user = user;
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date.$lte = endOfDay;
      }
    }

    const advances = await Advance.find(filter)
      .populate("user", "user_name email phone")
      .populate("approvedBy", "user_name")
      .limit(limit)
      .skip(skip)
      .sort({ date: -1, createdAt: -1 });

    const total = await Advance.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: advances,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAdvanceStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const advanceId = req.params.id;
    const companyId = req.user.companyId;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة غير صالحة. يجب أن تكون 'معتمد' أو 'مرفوض'",
      });
    }

    const advance = await Advance.findOne({ _id: advanceId, companyId }).populate(
      "user",
      "user_name",
    );
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "السلفة غير موجودة",
      });
    }

    if (advance.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `تم بالفعل ${advance.status === "approved" ? "اعتماد" : "رفض"} هذه السلفة`,
      });
    }

    advance.status = status;
    advance.notes = notes || advance.notes;
    advance.approvedBy = req.user.id;
    advance.approvedAt = Date.now();

    await advance.save();

    // If approved, deduct from treasury
    if (status === "approved") {
      await updateTreasury(
        -advance.amount,
        `سلفة للموظف: ${advance.user.user_name} - ${advance.reason}`,
        {
          companyId,
          relatedModel: "Advance",
          relatedId: advance._id,
          userId: req.user.id,
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: `تم ${status === "approved" ? "اعتماد" : "رفض"} السلفة بنجاح`,
      data: advance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAdvance = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Check permissions
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مسموح لك بحذف السلف",
      });
    }

    const advance = await Advance.findOne({ _id: req.params.id, companyId });
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "السلفة غير موجودة",
      });
    }

    if (advance.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف سلفة معتمدة",
      });
    }

    await advance.deleteOne();

    return res.status(200).json({
      success: true,
      message: "تم حذف السلفة بنجاح",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdvanceStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    
    const stats = await Advance.aggregate([
      { $match: { companyId: companyObjectId } },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
              },
            },
          ],
          totalApproved: [
            { $match: { status: { $in: ["approved", "repaid"] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          totalRepaid: [
            { $match: { status: "repaid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ]);

    const totalApproved = stats[0].totalApproved[0]?.total || 0;
    const totalRepaid = stats[0].totalRepaid[0]?.total || 0;
    const outstanding = totalApproved - totalRepaid;

    const result = {
      totalApproved,
      totalRepaid,
      outstanding,
      byStatus: stats[0].byStatus,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const repayAdvance = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Check permissions
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مسموح لك بالقيام بهذا الإجراء",
      });
    }

    const advanceId = req.params.id;
    const advance = await Advance.findOne({ _id: advanceId, companyId }).populate(
      "user",
      "user_name",
    );

    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "السلفة غير موجودة",
      });
    }

    if (advance.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "يمكن فقط استرداد السلف المعتمدة التي لم يتم استردادها بعد",
      });
    }

    advance.status = "repaid";
    await advance.save();

    // record income in treasury
    await updateTreasury(
      advance.amount,
      `استرداد سلفة من الموظف: ${advance.user.user_name}`,
      {
        companyId,
        relatedModel: "Advance",
        relatedId: advance._id,
        userId: req.user.id,
      },
    );

    return res.status(200).json({
      success: true,
      message: "تم استرداد السلفة بنجاح وإيداع المبلغ في الخزنة",
      data: advance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAdvance,
  getAdvances,
  updateAdvanceStatus,
  deleteAdvance,
  getAdvanceStats,
  repayAdvance,
};
