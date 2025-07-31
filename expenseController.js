const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Add a new expense (linked to logged-in user)
exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all expenses (filtered & user-specific)
exports.getExpenses = async (req, res) => {
  try {
    const { category, month, year } = req.query;
    const filter = { user: req.user._id };

    if (category) {
      filter.category = category;
    }

    if (month && year) {
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one expense by ID (check ownership)
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an expense by ID (check ownership)
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an expense by ID (check ownership)
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) return res.status(404).json({ msg: 'Expense not found' });
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get summary: total spent and category breakdown (user-specific)
exports.getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach((item) => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.amount;
    });

    res.json({
      totalSpent,
      categoryBreakdown,
      totalEntries: expenses.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get month-wise total spending (for charts)
exports.getMonthlySummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const monthlySummary = {};

    for (const expense of expenses) {
      const monthKey = expense.date.toISOString().slice(0, 7); // e.g., 2025-08
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { spent: 0 };
      }
      monthlySummary[monthKey].spent += expense.amount;
    }

    // Add budgets
    const budgets = await Budget.find({ user: req.user._id });

    budgets.forEach(b => {
      if (monthlySummary[b.month]) {
        monthlySummary[b.month].limit = b.limit;
        monthlySummary[b.month].overBudget = monthlySummary[b.month].spent > b.limit;
      } else {
        monthlySummary[b.month] = {
          spent: 0,
          limit: b.limit,
          overBudget: false
        };
      }
    });

    res.json(monthlySummary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
