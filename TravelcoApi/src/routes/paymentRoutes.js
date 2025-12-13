const express = require("express");
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// Get all payments with filtering
router.get('/', PaymentController.getPayments);

// Export payments to Excel
router.get('/export/excel', PaymentController.exportPaymentsToExcel);

// Get payments by transfer ID
router.get('/transfer/:transferId', PaymentController.getPaymentsByTransfer);

// Add new payment
router.post('/', PaymentController.addPayment);

// Delete payment
router.delete('/:id', PaymentController.deletePayment);

module.exports = router;
