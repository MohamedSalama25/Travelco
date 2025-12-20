const Treasury = require("../models/Treasury.model");
const TreasuryHistory = require("../models/TreasuryHistory.model");

/**
 * Update treasury balance and log history
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @param {string} description - Description of the transaction
 * @param {object} options - Optional parameters: { relatedModel, relatedId, userId }
 */
const updateTreasury = async (amount, description, options = {}) => {
    const { relatedModel, relatedId, userId } = options;

    // 1. Get or create the main treasury
    let treasury = await Treasury.findOne({ name: "Main Treasury" });
    if (!treasury) {
        treasury = new Treasury({ balance: 0, name: "Main Treasury" });
    }

    // 2. Update balance
    treasury.balance += amount;
    await treasury.save();

    // 3. Log history
    const history = new TreasuryHistory({
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

module.exports = { updateTreasury };
