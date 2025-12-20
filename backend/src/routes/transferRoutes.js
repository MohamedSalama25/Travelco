const express = require("express");
const router = express.Router();
const TransferController = require('../controllers/TransferController');

// Get all transfers with filtering
router.get('/', TransferController.getTransfers);

// Get transfer statistics (4 cards)
router.get('/stats', TransferController.getTransferStats);

// Export transfers to Excel
router.get('/export/excel', TransferController.exportTransfersToExcel);

// Get transfer by ID
router.get('/:id', TransferController.getTransferById);

// Add new transfer
router.post('/', TransferController.addTransfer);

// Update transfer
router.put('/:id', TransferController.updateTransfer);

// Cancel transfer
router.put('/:id/cancel', TransferController.cancelTransfer);

// Refund transfer
router.put('/:id/refund', TransferController.refundTransfer);

// Delete transfer
router.delete('/:id', TransferController.deleteTransfer);

module.exports = router;