const Budget = require('../models/Budget');

// Add or update monthly budget
const setBudget = async (req, res) => {
  try {
    const { month, limit } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { limit },
      { new: true, upsert: true }
    );

    res.status(200).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all budgets for the user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    if (!budgets.length) {
      return res.status(404).json({ msg: 'No budgets found' });
    }

    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific month's budget
const getBudget = async (req, res) => {
  try {
    const { month } = req.query;
    const budget = await Budget.findOne({ user: req.user._id, month });

    if (!budget) return res.status(404).json({ msg: 'No budget set for this month' });

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Export all functions correctly
module.exports = {
  setBudget,
  getBudgets,
  getBudget,
};
