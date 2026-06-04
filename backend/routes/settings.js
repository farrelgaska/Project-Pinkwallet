const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM settings WHERE id = 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil settings",
      error: error.message
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const {
      username,
      initial_balance,
      monthly_budget
    } = req.body;

    await db.query(
      `UPDATE settings
       SET username = ?, initial_balance = ?, monthly_budget = ?
       WHERE id = 1`,
      [username, initial_balance, monthly_budget]
    );

    res.json({
      success: true,
      message: "Settings berhasil diperbarui"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui settings",
      error: error.message
    });
  }
});

module.exports = router;