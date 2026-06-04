const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.category,
        b.limit_amount,
        COALESCE(SUM(t.amount), 0) AS used_amount
      FROM budgets b
      LEFT JOIN transactions t 
        ON b.category = t.category 
        AND t.type = 'Expense'
      GROUP BY b.id, b.category, b.limit_amount
      ORDER BY b.category ASC
    `);

    const data = rows.map(row => {
      const used = Number(row.used_amount);
      const limit = Number(row.limit_amount);

      return {
        ...row,
        used_amount: used,
        limit_amount: limit,
        percentage: limit > 0 ? Math.round((used / limit) * 100) : 0
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data budget",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, limit_amount } = req.body;

    if (!category || !limit_amount) {
      return res.status(400).json({
        success: false,
        message: "Category dan limit_amount wajib diisi"
      });
    }

    await db.query(
      `INSERT INTO budgets (category, limit_amount)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount)`,
      [category, limit_amount]
    );

    res.status(201).json({
      success: true,
      message: "Budget berhasil disimpan"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan budget",
      error: error.message
    });
  }
});

router.put("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { limit_amount } = req.body;

    const [result] = await db.query(
      "UPDATE budgets SET limit_amount = ? WHERE category = ?",
      [limit_amount, category]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget kategori tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "Budget berhasil diperbarui"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui budget",
      error: error.message
    });
  }
});

module.exports = router;