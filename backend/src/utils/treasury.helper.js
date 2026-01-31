const Treasury = require("../models/Treasury.model");
const TreasuryHistory = require("../models/TreasuryHistory.model");

/**
 * Update treasury balance and log history
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @param {string} description - Description of the transaction
 * @param {object} options - Required: { companyId }, Optional: { relatedModel, relatedId, userId }
 */
const updateTreasury = async (amount, description, options = {}) => {
    const { relatedModel, relatedId, userId, companyId } = options;

    if (!companyId) {
        throw new Error("companyId is required for treasury operations");
    }

    // 1. Get or create the company's treasury
    let treasury = await Treasury.findOne({ companyId, name: "الخزينة الرئيسية" });
    if (!treasury) {
        treasury = new Treasury({ 
            balance: 0, 
            name: "الخزينة الرئيسية",
            companyId 
        });
    }

    // 2. Update balance
    treasury.balance += amount;
    await treasury.save();

    // 3. Log history
    const history = new TreasuryHistory({
        companyId,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'in' : 'out',
        description,
        relatedModel: relatedModel || 'Other',
        relatedId,
        createdBy: userId
    });
    await history.save();

    return treasury;
};

/**
 * Get treasury for a specific company
 * @param {String} companyId - Company ID
 */
const getTreasuryByCompany = async (companyId) => {
    if (!companyId) {
        throw new Error("companyId is required");
    }
    
    return await Treasury.findOne({ companyId });
};

module.exports = { updateTreasury, getTreasuryByCompany };
