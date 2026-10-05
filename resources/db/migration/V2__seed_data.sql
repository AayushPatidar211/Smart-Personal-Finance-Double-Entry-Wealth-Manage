-- ============================================================================
-- Flyway Database Migration: V2__seed_data.sql
-- Project: FinWise AI — Smart Personal Finance & Expense Tracker
-- Database: MySQL 8.0
-- Purpose: Realistic seed dataset for immediate demo and testing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SYSTEM CATEGORIES (Global is_system = TRUE, user_id = NULL)
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `user_id`, `parent_id`, `name`, `slug`, `icon`, `color_hex`, `category_type`, `is_system`, `is_active`) VALUES
-- Income
(1, NULL, NULL, 'Salary & Wages', 'salary-wages', 'banknote', '#10B981', 'INCOME', TRUE, TRUE),
(2, NULL, NULL, 'Freelance & Consulting', 'freelance-consulting', 'briefcase', '#34D399', 'INCOME', TRUE, TRUE),
(3, NULL, NULL, 'Investment Dividends', 'investment-dividends', 'trending-up', '#059669', 'INCOME', TRUE, TRUE),

-- Expenses (Needs)
(10, NULL, NULL, 'Housing & Rent', 'housing-rent', 'home', '#EF4444', 'EXPENSE', TRUE, TRUE),
(11, NULL, NULL, 'Groceries & Supermarket', 'groceries', 'shopping-cart', '#F97316', 'EXPENSE', TRUE, TRUE),
(12, NULL, NULL, 'Utilities & Internet', 'utilities-internet', 'zap', '#EAB308', 'EXPENSE', TRUE, TRUE),
(13, NULL, NULL, 'Transportation & Fuel', 'transportation-fuel', 'car', '#84CC16', 'EXPENSE', TRUE, TRUE),
(14, NULL, NULL, 'Healthcare & Medical', 'healthcare-medical', 'activity', '#06B6D4', 'EXPENSE', TRUE, TRUE),

-- Expenses (Wants & Lifestyle)
(20, NULL, NULL, 'Dining Out & Cafes', 'dining-out', 'coffee', '#F43F5E', 'EXPENSE', TRUE, TRUE),
(21, NULL, NULL, 'Subscriptions & Streaming', 'subscriptions', 'tv', '#8B5CF6', 'EXPENSE', TRUE, TRUE),
(22, NULL, NULL, 'Shopping & Electronics', 'shopping-electronics', 'package', '#EC4899', 'EXPENSE', TRUE, TRUE),
(23, NULL, NULL, 'Travel & Vacations', 'travel-vacations', 'plane', '#6366F1', 'EXPENSE', TRUE, TRUE),

-- Transfers
(30, NULL, NULL, 'Internal Transfer', 'internal-transfer', 'arrow-left-right', '#64748B', 'TRANSFER', TRUE, TRUE);

-- ----------------------------------------------------------------------------
-- 2. USERS (Pass: FinWise@2026! -> BCrypt strength 12: $2a$12$Vp7qL4a26oT6zHw5... mock)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `status`, `currency_code`, `timezone`) VALUES
(1, 'demo.user@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'Alex', 'Morgan', 'ROLE_USER', 'ACTIVE', 'USD', 'America/New_York'),
(2, 'sarah.premium@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'Sarah', 'Chen', 'ROLE_PREMIUM_USER', 'ACTIVE', 'USD', 'America/Los_Angeles'),
(3, 'admin@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'System', 'Administrator', 'ROLE_ADMIN', 'ACTIVE', 'USD', 'UTC');

-- ----------------------------------------------------------------------------
-- 3. USER 2FA (Mock TOTP Secret)
-- ----------------------------------------------------------------------------
INSERT INTO `user_2fa` (`user_id`, `is_enabled`, `secret_key`, `backup_codes`, `enabled_at`) VALUES
(1, TRUE, 'JBSWY3DPEHPK3PXP', '["84920194","39102948","58291039","91029384"]', '2026-01-15 10:00:00');

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS (For Alex Morgan - user_id 1)
-- Strict DECIMAL(15,2)
-- ----------------------------------------------------------------------------
INSERT INTO `accounts` (`id`, `user_id`, `account_name`, `account_type`, `currency_code`, `balance`, `opening_balance`, `account_number_masked`, `institution_name`) VALUES
(101, 1, 'Chase Total Checking', 'CHECKING', 'USD', 4325.50, 2500.00, '**** 4821', 'Chase Bank'),
(102, 1, 'Marcus High-Yield Savings (4.4% APY)', 'SAVINGS', 'USD', 18450.00, 15000.00, '**** 9302', 'Goldman Sachs'),
(103, 1, 'Amex Blue Cash Preferred', 'CREDIT_CARD', 'USD', 874.20, 0.00, '**** 1004', 'American Express'),
(104, 1, 'Physical Cash Wallet', 'CASH', 'USD', 180.00, 180.00, NULL, 'Cash on Hand');

-- ----------------------------------------------------------------------------
-- 5. BUDGETS (For Alex Morgan - user_id 1)
-- ----------------------------------------------------------------------------
INSERT INTO `budgets` (`id`, `user_id`, `category_id`, `name`, `period`, `amount_limit`, `spent_amount`, `start_date`, `end_date`, `rollover_enabled`, `rollover_amount`, `alert_threshold_pct`) VALUES
(201, 1, 11, 'Monthly Groceries Budget', 'MONTHLY', 650.00, 512.40, '2026-10-01', '2026-10-31', TRUE, 45.00, 80),
(202, 1, 20, 'Dining & Coffee Limit', 'MONTHLY', 400.00, 385.60, '2026-10-01', '2026-10-31', FALSE, 0.00, 80),
(203, 1, 21, 'Entertainment & Subscriptions', 'MONTHLY', 120.00, 84.97, '2026-10-01', '2026-10-31', FALSE, 0.00, 80),
(204, 1, 13, 'Commute & Fuel Budget', 'MONTHLY', 250.00, 142.10, '2026-10-01', '2026-10-31', TRUE, 20.00, 80);

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONS (Realistic recent financial ledger entries)
-- ----------------------------------------------------------------------------
INSERT INTO `transactions` (`id`, `user_id`, `account_id`, `destination_account_id`, `category_id`, `transaction_type`, `amount`, `currency_code`, `transaction_date`, `value_date`, `description`, `merchant_name`, `is_recurring`, `checksum_hash`, `status`) VALUES
-- Income
(1001, 1, 101, NULL, 1, 'INCOME', 3750.00, 'USD', '2026-10-01', '2026-10-01 09:00:00', 'Bi-weekly Direct Deposit Payroll', 'TechCorp Inc', TRUE, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'COMPLETED'),
(1002, 1, 101, NULL, 2, 'INCOME', 850.00, 'USD', '2026-10-03', '2026-10-03 14:30:00', 'Stripe Consulting Retainer', 'Client Apex Labs', FALSE, 'a4b1c2d3e4f50123456789abcdef0123456789abcdef0123456789abcdef0123', 'COMPLETED'),

-- Expenses - Needs
(1003, 1, 101, NULL, 10, 'EXPENSE', 1750.00, 'USD', '2026-10-01', '2026-10-01 10:15:00', 'October Apartment Rent Transfer', 'Skyline Residences', TRUE, 'f1e2d3c4b5a69876543210fedcba9876543210fedcba9876543210fedcba9876', 'COMPLETED'),
(1004, 1, 103, NULL, 11, 'EXPENSE', 145.80, 'USD', '2026-10-02', '2026-10-02 17:40:00', 'Weekly Organic Grocery Run', 'Whole Foods Market', FALSE, '55b3d92ec178044719028abfcf98b16c8024227c94fae902c4b8b6e22f28b76a', 'COMPLETED'),
(1005, 1, 103, NULL, 11, 'EXPENSE', 88.50, 'USD', '2026-10-04', '2026-10-04 12:10:00', 'Trader Joe Supermarket Stockup', 'Trader Joe', FALSE, '77c2e81ba289155829139bceae09c27d9135338da5abf013d5c9c7f33a39c87b', 'COMPLETED'),
(1006, 1, 101, NULL, 12, 'EXPENSE', 115.30, 'USD', '2026-10-02', '2026-10-02 08:00:00', 'Electric & Gas Utility Bill', 'ConEdison', TRUE, '88d3f92cb39026693a240cdfae10d38ea246449eb6bcf124e6dad8a44b40d98c', 'COMPLETED'),
(1007, 1, 103, NULL, 13, 'EXPENSE', 52.40, 'USD', '2026-10-03', '2026-10-03 18:20:00', 'Shell Gasoline Refill', 'Shell Oil', FALSE, '99e4a03dc4a137704b351deabf21e49fb357550fc7cde235f7ebe9b55c51ea9d', 'COMPLETED'),

-- Expenses - Wants & Anomalies
(1008, 1, 103, NULL, 20, 'EXPENSE', 165.20, 'USD', '2026-10-03', '2026-10-03 20:30:00', 'Omakase Sushi Dinner with Friends', 'Nobu Downtown', FALSE, '11f5b14ed5b248815c462efbcd32f50ac468661ad8def346a8fcfa066d62fb0e', 'COMPLETED'),
(1009, 1, 103, NULL, 20, 'EXPENSE', 74.80, 'USD', '2026-10-04', '2026-10-04 13:15:00', 'Bistro Lunch & Drinks', 'Blue Bottle & Bistro', FALSE, '22a6c25fe6c359926d573fbcde43a61bd579772be9ef0457b9adb1177e73ac1f', 'COMPLETED'),
(1010, 1, 103, NULL, 21, 'EXPENSE', 22.99, 'USD', '2026-10-02', '2026-10-02 02:00:00', 'Netflix Premium 4K Plan', 'Netflix', TRUE, '33b7d360f7d460037e684acdef54b72ce68a883cf0fa1568caaec2288f84bd2a', 'COMPLETED'),
(1011, 1, 103, NULL, 21, 'EXPENSE', 16.99, 'USD', '2026-10-02', '2026-10-02 02:00:00', 'Spotify Family Plan', 'Spotify', TRUE, '44c8e471a8e571148f795bdefa65c83df79b994d01ab2679dbbfd3399a95ce3b', 'COMPLETED'),

-- Transfer (Savings Goal Allocation)
(1012, 1, 101, 102, 30, 'TRANSFER', 500.00, 'USD', '2026-10-02', '2026-10-02 11:00:00', 'Monthly Automated Emergency Fund Savings', 'Internal Transfer', TRUE, '55d9f582b9f682259a806cefba76d94ea8ac005e12bc378aeccee44aa0a6df4c', 'COMPLETED');

-- ----------------------------------------------------------------------------
-- 7. RECURRING RULES (For Spring Batch scheduler)
-- ----------------------------------------------------------------------------
INSERT INTO `recurring_rules` (`id`, `user_id`, `account_id`, `category_id`, `transaction_type`, `amount`, `description`, `frequency`, `cron_expression`, `next_run_date`, `start_date`) VALUES
(301, 1, 101, 10, 'EXPENSE', 1750.00, 'Apartment Rent Transfer', 'MONTHLY', '0 0 10 1 * ?', '2026-11-01', '2026-01-01'),
(302, 1, 103, 21, 'EXPENSE', 22.99, 'Netflix Subscription', 'MONTHLY', '0 0 2 2 * ?', '2026-11-02', '2026-01-02'),
(303, 1, 101, 1, 'INCOME', 3750.00, 'Bi-weekly Salary TechCorp', 'BI_WEEKLY', '0 0 9 ? * FRI#1,FRI#3', '2026-10-15', '2026-01-01');

-- ----------------------------------------------------------------------------
-- 8. AI INSIGHTS (Initial Gemini output cached)
-- ----------------------------------------------------------------------------
INSERT INTO `ai_insights` (`id`, `user_id`, `insight_type`, `period_month`, `title`, `summary`, `full_analysis_json`, `prompt_tokens`, `completion_tokens`) VALUES
(401, 1, 'ANOMALY_ALERT', '2026-10', 'Dining & Cafes spending is at 96% of monthly limit in first 5 days', 'You have spent $385.60 of your $400.00 dining budget (96.4%) within the first 5 days of October, primarily driven by a $165.20 dinner at Nobu.', '{"anomalies":[{"category":"Dining Out","ratio":0.964,"keyTransaction":"Nobu Downtown $165.20","recommendation":"Cap dining out for next 14 days and use prepared meals to avoid budget breach."}]}', 340, 112);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `notification_type`, `channel`, `title`, `message`, `reference_id`, `reference_type`, `is_read`) VALUES
(501, 1, 'BUDGET_WARNING_80', 'IN_APP', 'Budget Alert: Dining & Coffee', 'Your Dining & Coffee budget has exceeded 80% ($385.60 spent of $400.00).', 202, 'BUDGET', FALSE),
(502, 1, 'RECURRING_DUE', 'IN_APP', 'Upcoming Payroll Deposit', 'Recurring salary deposit of $3,750.00 scheduled for Oct 15, 2026.', 303, 'RECURRING_RULE', TRUE);

-- ----------------------------------------------------------------------------
-- 10. AUDIT LOG (Sample event)
-- ----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `entity_name`, `entity_id`, `action`, `changed_by_user_id`, `ip_address`, `old_state_json`, `new_state_json`, `correlation_id`) VALUES
(601, 'TRANSACTION', 1012, 'TRANSFER', 1, '192.168.1.42', '{"account_101_bal":4825.50,"account_102_bal":17950.00}', '{"account_101_bal":4325.50,"account_102_bal":18450.00}', 'tx-corr-48f8a920-1002-4b31-897c-48201948ba12');
