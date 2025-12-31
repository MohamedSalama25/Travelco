const express = require('express');
const router = express.Router();
const TreasuryController = require('../controllers/TreasuryController');
const auth = require('../middlewares/auth');

// All treasury routes require authentication
router.use(auth);

// Get treasury history
router.get('/history', TreasuryController.getTreasuryHistory);

// Get treasury stats
router.get('/stats', TreasuryController.getTreasuryStats);

// Get inventory (Jard) summary
router.get('/inventory', TreasuryController.getInventory);

// Add manual transaction
router.post('/transactions', TreasuryController.addTransaction);

// Export treasury history to Excel
router.get('/export/excel', TreasuryController.exportTreasuryToExcel);

module.exports = router;
