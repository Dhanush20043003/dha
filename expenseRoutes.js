const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getMonthlySummary    
} = require('../controllers/expenseController');

router.use(auth); // All routes below require auth

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.get('/summary/monthly', getMonthlySummary);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
