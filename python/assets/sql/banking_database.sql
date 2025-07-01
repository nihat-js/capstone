-- Fake Banking Database Schema and Data for Honeypot
-- This is simulated data for honeypot purposes only

-- Create bank database
CREATE DATABASE IF NOT EXISTS SecureBank;
USE SecureBank;

-- Users table with fake login credentials
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'suspended', 'closed') DEFAULT 'active'
);

-- Insert fake user data
INSERT INTO users (username, password_hash, email, full_name, account_number) VALUES
('jdoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqY/dBxbL7.jNQy', 'john.doe@email.com', 'John Doe', 'ACC-001-123456'),
('admin', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@securebank.com', 'Bank Administrator', 'ADM-001-000001'),
('msmith', '$2b$12$vGq/4SlS/.jHqK4UJ0EZSeE1xTWlh8O1WYLvAe.6eF3XzJv2HhSj.', 'mary.smith@email.com', 'Mary Smith', 'ACC-002-789012'),
('testuser', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'test@bank.com', 'Test User', 'ACC-003-456789');

-- Accounts table
CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_type ENUM('checking', 'savings', 'credit', 'loan') NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    routing_number VARCHAR(9) NOT NULL DEFAULT '123456789',
    opened_date DATE NOT NULL,
    status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert fake account data
INSERT INTO accounts (user_id, account_type, balance, account_number, opened_date) VALUES
(1, 'checking', 15420.50, 'CHK-123456-001', '2023-01-15'),
(1, 'savings', 45230.75, 'SAV-123456-001', '2023-01-15'),
(2, 'checking', 125000.00, 'CHK-000001-ADM', '2020-01-01'),
(3, 'checking', 8750.25, 'CHK-789012-002', '2023-06-12'),
(3, 'savings', 22100.00, 'SAV-789012-002', '2023-06-12'),
(4, 'checking', 500.00, 'CHK-456789-003', '2024-03-01');

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'fee') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    recipient_account VARCHAR(20),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Insert fake transaction data
INSERT INTO transactions (account_id, transaction_type, amount, description, recipient_account) VALUES
(1, 'deposit', 2500.00, 'Salary Deposit - Acme Corp', NULL),
(1, 'withdrawal', 150.00, 'ATM Withdrawal - Main St', NULL),
(1, 'payment', 1200.00, 'Mortgage Payment', 'MTG-987654321'),
(2, 'deposit', 500.00, 'Transfer from Checking', 'CHK-123456-001'),
(3, 'deposit', 5000.00, 'Initial Deposit', NULL),
(4, 'withdrawal', 100.00, 'ATM Withdrawal', NULL),
(5, 'deposit', 1000.00, 'Birthday Gift', NULL);

-- Credit cards table
CREATE TABLE credit_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    card_number VARCHAR(19) NOT NULL, -- masked: ****-****-****-1234
    card_type ENUM('visa', 'mastercard', 'amex', 'discover') NOT NULL,
    expiry_date DATE NOT NULL,
    credit_limit DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'blocked', 'expired') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert fake credit card data
INSERT INTO credit_cards (user_id, card_number, card_type, expiry_date, credit_limit, current_balance) VALUES
(1, '****-****-****-1234', 'visa', '2026-12-31', 5000.00, 1250.75),
(2, '****-****-****-5678', 'mastercard', '2027-06-30', 25000.00, 3240.50),
(3, '****-****-****-9012', 'visa', '2025-09-30', 3000.00, 875.25);

-- Login attempts table (for security monitoring)
CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);

-- Insert fake login attempt data
INSERT INTO login_attempts (username, ip_address, success, attempted_at, user_agent) VALUES
('jdoe', '192.168.1.100', TRUE, '2024-12-20 09:15:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('admin', '10.0.0.50', TRUE, '2024-12-20 08:30:15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('msmith', '203.45.67.89', TRUE, '2024-12-19 14:22:41', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'),
('hacker123', '185.220.102.8', FALSE, '2024-12-19 03:45:12', 'curl/7.68.0'),
('administrator', '94.102.49.193', FALSE, '2024-12-19 03:45:45', 'python-requests/2.28.1'),
('root', '185.220.102.8', FALSE, '2024-12-19 03:46:18', 'sqlmap/1.6.12');

-- Sample sensitive queries that attackers might try
-- These are just examples of what might be logged in a real attack

-- Common SQL injection attempts that might be captured:
-- SELECT * FROM users WHERE username = 'admin' OR '1'='1' --
-- SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --
-- UNION SELECT username, password_hash FROM users --
-- SELECT @@version
-- SELECT user()
-- SELECT database()
-- SHOW TABLES
-- DESCRIBE users
