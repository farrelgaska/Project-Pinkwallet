const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budgets");
const reportRoutes = require("./routes/reports");
const settingRoutes = require("./routes/settings");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PinkWallet API is running"
  });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PinkWallet API running on http://localhost:${PORT}`);
});