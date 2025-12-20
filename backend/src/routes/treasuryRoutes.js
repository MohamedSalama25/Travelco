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

// Export treasury history to Excel
router.get('/export/excel', TreasuryController.exportTreasuryToExcel);

module.exports = router;
