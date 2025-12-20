const Advance = require("../models/Advance.model");
const Users = require("../models/Users.model");
const { updateTreasury } = require("../utils/treasury.helper");
const getPagination = require("../utils/pagination");

const addAdvance = async (req, res) => {
    try {
        const { user, amount, reason, notes, date } = req.body;

        if (!user || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: "الموظف، المبلغ والسبب حقول مطلوبة"
            });
        }

        const newAdvance = await Advance.create({
            user,
            amount,
            reason,
            notes,
            date: date || Date.now(),
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: "تم تقديم طلب السلفة بنجاح",
            data: newAdvance
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAdvances = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const { user, status, fromDate, toDate } = req.query;

        const filter = {};
        if (user) filter.user = user;
        if (status) filter.status = status;
        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) filter.date.$gte = new Date(fromDate);
            if (toDate) filter.date.$lte = new Date(toDate);
        }

        const advances = await Advance.find(filter)
            .populate("user", "user_name email phone")
            .populate("approvedBy", "user_name")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Advance.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: advances,
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

const updateAdvanceStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const advanceId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "حالة غير صالحة. يجب أن تكون 'معتمد' أو 'مرفوض'"
            });
        }

        const advance = await Advance.findById(advanceId).populate("user", "user_name");
        if (!advance) {
            return res.status(404).json({
                success: false,
                message: "السلفة غير موجودة"
            });
        }

        if (advance.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `تم بالفعل ${advance.status === 'approved' ? 'اعتماد' : 'رفض'} هذه السلفة`
            });
        }

        advance.status = status;
        advance.notes = notes || advance.notes;
        advance.approvedBy = req.user.id;
        advance.approvedAt = Date.now();

        await advance.save();

        // If approved, deduct from treasury
        if (status === 'approved') {
            await updateTreasury(
                -advance.amount,
                `سلفة للموظف: ${advance.user.user_name} - ${advance.reason}`,
                {
                    relatedModel: 'Advance',
                    relatedId: advance._id,
                    userId: req.user.id
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: `تم ${status === 'approved' ? 'اعتماد' : 'رفض'} السلفة بنجاح`,
            data: advance
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteAdvance = async (req, res) => {
    try {
        const advance = await Advance.findById(req.params.id);
        if (!advance) {
            return res.status(404).json({
                success: false,
                message: "السلفة غير موجودة"
            });
        }

        if (advance.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: "لا يمكن حذف سلفة معتمدة"
            });
        }

        await advance.deleteOne();

        return res.status(200).json({
            success: true,
            message: "تم حذف السلفة بنجاح"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addAdvance,
    getAdvances,
    updateAdvanceStatus,
    deleteAdvance
};
