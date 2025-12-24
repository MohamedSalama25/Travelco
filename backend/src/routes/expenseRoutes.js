const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', ExpenseController.getExpenses);
router.post('/', ExpenseController.addExpense);
router.put('/:id', ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
