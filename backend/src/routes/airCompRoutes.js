const express = require('express');
const router = express.Router();
const airCompController = require('../controllers/airCompController');

// Get all air companies
router.get('/', airCompController.getAirComp);

// Get all air companies with stats
router.get('/stats', airCompController.getAllAirCompWithStats);

// Get air company statistics
router.get('/:id/stats', airCompController.getAirCompStats);

// Get air company details (tickets + payments)
router.get('/:id/details', airCompController.getAirCompDetails);

// Add payment to air company
router.post('/:id/payments', airCompController.addAirCompPayment);

// Get air company by ID
router.get('/:id', airCompController.getAirCompById);

// Add new air company
router.post('/', airCompController.addAirComp);

// Update air company
router.put('/:id', airCompController.updateAirComp);

// Delete air company
router.delete('/:id', airCompController.deleteAirComp);

module.exports = router;