CREATE DATABASE IF NOT EXISTS pinkwallet_db;
USE pinkwallet_db;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Income', 'Expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('completed', 'pending') DEFAULT 'completed',
  transaction_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL UNIQUE,
  limit_amount DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) DEFAULT 'Farrel',
  initial_balance DECIMAL(12,2) DEFAULT 2450000,
  monthly_budget DECIMAL(12,2) DEFAULT 4000000
);

INSERT INTO transactions (name, type, category, amount, status, transaction_date) VALUES
('Coffee Shop', 'Expense', 'Food', 25000, 'completed', '2026-06-12'),
('Freelance Design', 'Income', 'Income', 500000, 'completed', '2026-06-10'),
('Transport', 'Expense', 'Transport', 15000, 'completed', '2026-06-09'),
('Course Payment', 'Expense', 'Education', 150000, 'pending', '2026-06-08');

INSERT INTO budgets (category, limit_amount) VALUES
('Food', 800000),
('Transport', 400000),
('Shopping', 600000),
('Education', 700000),
('Entertainment', 500000),
('Bills', 500000)
ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount);

INSERT INTO settings (id, username, initial_balance, monthly_budget)
VALUES (1, 'Farrel', 2450000, 4000000)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
initial_balance = VALUES(initial_balance),
monthly_budget = VALUES(monthly_budget);