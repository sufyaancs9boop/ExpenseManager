const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { requireAuth } = require("../middleware/auth");

// Protect all routes with authentication
router.use(requireAuth);

// Add expense
router.post("/", async (req, res) => {
  const expense = new Expense({
    ...req.body,
    userId: req.session.userId
  });
  await expense.save();
  res.json(expense);
});

// Get all expenses for logged-in user
router.get("/", async (req, res) => {
  const expenses = await Expense.find({ userId: req.session.userId }).sort({ date: -1 });
  res.json(expenses);
});

// Delete expense
router.delete("/:id", async (req, res) => {
  await Expense.findOneAndDelete({ 
    _id: req.params.id, 
    userId: req.session.userId 
  });
  res.json({ message: "Deleted" });
});

module.exports = router;
