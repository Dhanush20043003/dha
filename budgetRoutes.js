const express = require('express');
const router = express.Router();
const { setBudget, getBudget, getBudgets } = require('../controllers/budgetController');
const auth = require('../middleware/authMiddleware'); // ✅ Correct filename

router.post('/', auth, setBudget);
router.get('/', auth, getBudgets);       // ✅ Get ALL budgets
router.get('/month', auth, getBudget);   // ✅ Get budget for specific month

module.exports = router;
