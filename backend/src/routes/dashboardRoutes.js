const express = require("express");
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

// Get dashboard main stats (4 cards)
router.get('/stats', DashboardController.getDashboardStats);

// Get stats by air company (issuer profits)
router.get('/stats/aircomp', DashboardController.getStatsByAirComp);

// Export air company stats to Excel
router.get('/stats/aircomp/export', DashboardController.exportAirCompStatsToExcel);

// Get monthly stats
router.get('/stats/monthly', DashboardController.getMonthlyStats);

// Get inventory summary (Jard)
router.get('/inventory', DashboardController.getInventorySummary);

module.exports = router;
