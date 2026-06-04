const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const [[incomeResult]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_income
      FROM transactions
      WHERE type = 'Income'
    `);

    const [[expenseResult]] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_expense
      FROM transactions
      WHERE type = 'Expense'
    `);

    const [[countResult]] = await db.query(`
      SELECT COUNT(*) AS total_transactions
      FROM transactions
    `);

    const totalIncome = Number(incomeResult.total_income);
    const totalExpense = Number(expenseResult.total_expense);

    res.json({
      success: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: totalIncome - totalExpense,
        total_transactions: countResult.total_transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil summary report",
      error: error.message
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        category,
        SUM(amount) AS total_amount,
        COUNT(*) AS total_transactions
      FROM transactions
      WHERE type = 'Expense'
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil report kategori",
      error: error.message
    });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS expense
      FROM transactions
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil report bulanan",
      error: error.message
    });
  }
});

module.exports = router;