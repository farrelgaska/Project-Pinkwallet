const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type, category, search } = req.query;

    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (type && type !== "All") {
      sql += " AND type = ?";
      params.push(type);
    }

    if (category && category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }

    if (search) {
      sql += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    sql += " ORDER BY transaction_date DESC, id DESC";

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      category,
      amount,
      status = "completed",
      transaction_date
    } = req.body;

    if (!name || !type || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: "Name, type, category, dan amount wajib diisi"
      });
    }

    if (!["Income", "Expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type harus Income atau Expense"
      });
    }

    const [result] = await db.query(
      `INSERT INTO transactions 
      (name, type, category, amount, status, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        type,
        category,
        amount,
        status,
        transaction_date || new Date().toISOString().split("T")[0]
      ]
    );

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil ditambahkan",
      data: {
        id: result.insertId,
        name,
        type,
        category,
        amount,
        status,
        transaction_date
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan transaksi",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      category,
      amount,
      status,
      transaction_date
    } = req.body;

    const [result] = await db.query(
      `UPDATE transactions
       SET name = ?, type = ?, category = ?, amount = ?, status = ?, transaction_date = ?
       WHERE id = ?`,
      [name, type, category, amount, status, transaction_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "Transaksi berhasil diperbarui"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui transaksi",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM transactions WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "Transaksi berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus transaksi",
      error: error.message
    });
  }
});

module.exports = router;