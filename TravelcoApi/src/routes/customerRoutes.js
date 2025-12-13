const express = require("express");
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');

// Get all customers with filtering
router.get('/', CustomerController.getCustomers);

// Get customer statistics (4 cards with comparison)
router.get('/stats', CustomerController.getCustomerStats);

// Export customers to Excel
router.get('/export/excel', CustomerController.exportCustomersToExcel);

// Get customer by ID
router.get('/:id', CustomerController.getCustomerById);

// Get customer's transfers (tickets)
router.get('/:id/transfers', CustomerController.getCustomerTransfers);

// Add new customer
router.post('/', CustomerController.addCustomer);

// Update customer
router.put('/:id', CustomerController.updateCustomer);

// Delete customer
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
