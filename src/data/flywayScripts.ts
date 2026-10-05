export const V1_INIT_SCHEMA_SQL = `-- ============================================================================
-- Flyway Database Migration: V1__init_schema.sql
-- Project: FinWise AI — Smart Personal Finance & Expense Tracker
-- Database: MySQL 8.0 (InnoDB, utf8mb4)
-- Standard: Fintech-grade 3NF, DECIMAL(15,2), JPA Optimistic Locking, Soft Delete
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Core identity with RBAC, security lockouts, currency & timezone preference
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`email\` VARCHAR(150) NOT NULL,
    \`password_hash\` VARCHAR(255) NOT NULL,
    \`first_name\` VARCHAR(80) NOT NULL,
    \`last_name\` VARCHAR(80) NOT NULL,
    \`role\` VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    \`status\` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    \`currency_code\` VARCHAR(3) NOT NULL DEFAULT 'USD',
    \`timezone\` VARCHAR(50) NOT NULL DEFAULT 'UTC',
    \`failed_attempt_count\` INT NOT NULL DEFAULT 0,
    \`locked_until\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`deleted_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_users_email\` (\`email\`),
    KEY \`idx_users_role_status\` (\`role\`, \`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. USER 2FA (TOTP)
-- Time-based One-Time Password secret storage (Jasypt encrypted at rest)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`user_2fa\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`is_enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`secret_key\` VARCHAR(255) NOT NULL,
    \`backup_codes\` TEXT NULL,
    \`enabled_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_2fa_user_id\` (\`user_id\`),
    CONSTRAINT \`fk_user_2fa_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. REFRESH TOKENS
-- State for JWT refresh-token rotation & device tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`refresh_tokens\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`token_hash\` VARCHAR(64) NOT NULL,
    \`device_info\` VARCHAR(255) NULL,
    \`ip_address\` VARCHAR(45) NULL,
    \`expires_at\` TIMESTAMP(6) NOT NULL,
    \`is_revoked\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_refresh_token_hash\` (\`token_hash\`),
    KEY \`idx_refresh_tokens_user\` (\`user_id\`, \`expires_at\`),
    CONSTRAINT \`fk_refresh_token_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS TABLE
-- Financial wallets: Bank, Credit Card, Cash, Investment, Crypto
-- Concurrency: Optimistic lock on balance via version
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`accounts\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`account_name\` VARCHAR(100) NOT NULL,
    \`account_type\` VARCHAR(30) NOT NULL,
    \`currency_code\` VARCHAR(3) NOT NULL DEFAULT 'USD',
    \`balance\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    \`opening_balance\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    \`account_number_masked\` VARCHAR(20) NULL,
    \`institution_name\` VARCHAR(100) NULL,
    \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_by\` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    \`updated_by\` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    KEY \`idx_accounts_user_active\` (\`user_id\`, \`is_active\`),
    CONSTRAINT \`fk_accounts_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES TABLE
-- System defaults + user custom hierarchies with parent-child support
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`categories\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NULL,
    \`parent_id\` BIGINT NULL,
    \`name\` VARCHAR(80) NOT NULL,
    \`slug\` VARCHAR(80) NOT NULL,
    \`icon\` VARCHAR(50) NOT NULL DEFAULT 'tag',
    \`color_hex\` VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    \`category_type\` VARCHAR(20) NOT NULL,
    \`is_system\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_category_slug\` (\`user_id\`, \`slug\`, \`is_deleted\`),
    KEY \`idx_categories_user\` (\`user_id\`, \`is_active\`),
    KEY \`idx_categories_parent\` (\`parent_id\`),
    CONSTRAINT \`fk_categories_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
    CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
-- Financial ledger entry: Income, Expense, or Transfer
-- Strict DECIMAL(15,2), duplicate detection hash, audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`transactions\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`account_id\` BIGINT NOT NULL,
    \`destination_account_id\` BIGINT NULL,
    \`category_id\` BIGINT NOT NULL,
    \`transaction_type\` VARCHAR(20) NOT NULL,
    \`amount\` DECIMAL(15,2) NOT NULL,
    \`fee_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    \`currency_code\` VARCHAR(3) NOT NULL DEFAULT 'USD',
    \`transaction_date\` DATE NOT NULL,
    \`value_date\` TIMESTAMP(6) NOT NULL,
    \`description\` VARCHAR(255) NOT NULL,
    \`merchant_name\` VARCHAR(120) NULL,
    \`notes\` TEXT NULL,
    \`tags\` VARCHAR(255) NULL,
    \`receipt_url\` VARCHAR(500) NULL,
    \`is_recurring\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`checksum_hash\` VARCHAR(64) NOT NULL,
    \`status\` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`deleted_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`created_by\` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    \`updated_by\` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    KEY \`idx_tx_user_date\` (\`user_id\`, \`transaction_date\` DESC),
    KEY \`idx_tx_user_category\` (\`user_id\`, \`category_id\`),
    KEY \`idx_tx_account\` (\`account_id\`),
    KEY \`idx_tx_dest_account\` (\`destination_account_id\`),
    KEY \`idx_tx_checksum\` (\`user_id\`, \`checksum_hash\`),
    CONSTRAINT \`fk_tx_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT,
    CONSTRAINT \`fk_tx_account\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE RESTRICT,
    CONSTRAINT \`fk_tx_dest_account\` FOREIGN KEY (\`destination_account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE RESTRICT,
    CONSTRAINT \`fk_tx_category\` FOREIGN KEY (\`category_id\` ) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. BUDGETS TABLE
-- Category consumption limits with rollover & real-time threshold alert status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`budgets\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`category_id\` BIGINT NOT NULL,
    \`name\` VARCHAR(100) NOT NULL,
    \`period\` VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    \`amount_limit\` DECIMAL(15,2) NOT NULL,
    \`spent_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    \`start_date\` DATE NOT NULL,
    \`end_date\` DATE NOT NULL,
    \`rollover_enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`rollover_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    \`alert_threshold_pct\` INT NOT NULL DEFAULT 80,
    \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_user_category_period\` (\`user_id\`, \`category_id\`, \`start_date\`, \`end_date\`, \`is_deleted\`),
    KEY \`idx_budgets_user\` (\`user_id\`, \`is_active\`),
    CONSTRAINT \`fk_budgets_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
    CONSTRAINT \`fk_budgets_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. RECURRING RULES TABLE
-- Rules for automated recurring transactions executed by Spring Batch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`recurring_rules\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`account_id\` BIGINT NOT NULL,
    \`category_id\` BIGINT NOT NULL,
    \`transaction_type\` VARCHAR(20) NOT NULL,
    \`amount\` DECIMAL(15,2) NOT NULL,
    \`description\` VARCHAR(255) NOT NULL,
    \`frequency\` VARCHAR(20) NOT NULL,
    \`cron_expression\` VARCHAR(60) NULL,
    \`next_run_date\` DATE NOT NULL,
    \`last_run_date\` DATE NULL,
    \`start_date\` DATE NOT NULL,
    \`end_date\` DATE NULL,
    \`is_paused\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`total_executions\` INT NOT NULL DEFAULT 0,
    \`failure_count\` INT NOT NULL DEFAULT 0,
    \`is_deleted\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    KEY \`idx_recurring_batch_eval\` (\`is_paused\`, \`is_deleted\`, \`next_run_date\`),
    CONSTRAINT \`fk_recurring_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
    CONSTRAINT \`fk_recurring_account\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE RESTRICT,
    CONSTRAINT \`fk_recurring_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. IMPORT BATCHES TABLE
-- Tracks CSV / statement upload jobs, strategy parser used, duplicate stats
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`import_batches\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`account_id\` BIGINT NOT NULL,
    \`bank_name\` VARCHAR(50) NOT NULL,
    \`file_name\` VARCHAR(255) NOT NULL,
    \`file_hash\` VARCHAR(64) NOT NULL,
    \`total_records\` INT NOT NULL DEFAULT 0,
    \`imported_count\` INT NOT NULL DEFAULT 0,
    \`duplicate_count\` INT NOT NULL DEFAULT 0,
    \`failed_count\` INT NOT NULL DEFAULT 0,
    \`status\` VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    \`error_details\` JSON NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`version\` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (\`id\`),
    KEY \`idx_import_user\` (\`user_id\`),
    KEY \`idx_import_hash\` (\`user_id\`, \`file_hash\`),
    CONSTRAINT \`fk_import_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
    CONSTRAINT \`fk_import_account\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. AI INSIGHTS TABLE
-- Persisted Gemini insights, anomaly logs, token consumption & cache fallback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`ai_insights\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`insight_type\` VARCHAR(40) NOT NULL,
    \`period_month\` VARCHAR(7) NOT NULL,
    \`title\` VARCHAR(200) NOT NULL,
    \`summary\` TEXT NOT NULL,
    \`full_analysis_json\` JSON NOT NULL,
    \`prompt_tokens\` INT NOT NULL DEFAULT 0,
    \`completion_tokens\` INT NOT NULL DEFAULT 0,
    \`is_read\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`is_bookmarked\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`expires_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (\`id\`),
    KEY \`idx_ai_insights_user\` (\`user_id\`, \`created_at\` DESC),
    KEY \`idx_ai_insights_period\` (\`user_id\`, \`period_month\`),
    CONSTRAINT \`fk_ai_insights_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- Real-time in-app alerts + email delivery status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`notifications\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`notification_type\` VARCHAR(40) NOT NULL,
    \`channel\` VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    \`title\` VARCHAR(150) NOT NULL,
    \`message\` TEXT NOT NULL,
    \`reference_id\` BIGINT NULL,
    \`reference_type\` VARCHAR(40) NULL,
    \`is_read\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`read_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`is_sent\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`sent_at\` TIMESTAMP(6) NULL DEFAULT NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (\`id\`),
    KEY \`idx_notifications_user_unread\` (\`user_id\`, \`is_read\`, \`created_at\` DESC),
    CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGS TABLE
-- Fintech-grade event audit trail via custom @Auditable aspect
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`entity_name\` VARCHAR(80) NOT NULL,
    \`entity_id\` BIGINT NOT NULL,
    \`action\` VARCHAR(30) NOT NULL,
    \`changed_by_user_id\` BIGINT NULL,
    \`ip_address\` VARCHAR(45) NULL,
    \`old_state_json\` JSON NULL,
    \`new_state_json\` JSON NULL,
    \`correlation_id\` VARCHAR(64) NOT NULL,
    \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (\`id\`),
    KEY \`idx_audit_entity\` (\`entity_name\`, \`entity_id\`),
    KEY \`idx_audit_correlation\` (\`correlation_id\`),
    KEY \`idx_audit_created\` (\`created_at\` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;`;

export const V2_SEED_DATA_SQL = `-- ============================================================================
-- Flyway Database Migration: V2__seed_data.sql
-- Project: FinWise AI — Smart Personal Finance & Expense Tracker
-- Database: MySQL 8.0
-- Purpose: Realistic seed dataset for immediate demo and testing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SYSTEM CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO \`categories\` (\`id\`, \`user_id\`, \`parent_id\`, \`name\`, \`slug\`, \`icon\`, \`color_hex\`, \`category_type\`, \`is_system\`, \`is_active\`) VALUES
(1, NULL, NULL, 'Salary & Wages', 'salary-wages', 'banknote', '#10B981', 'INCOME', TRUE, TRUE),
(2, NULL, NULL, 'Freelance & Consulting', 'freelance-consulting', 'briefcase', '#34D399', 'INCOME', TRUE, TRUE),
(3, NULL, NULL, 'Investment Dividends', 'investment-dividends', 'trending-up', '#059669', 'INCOME', TRUE, TRUE),

(10, NULL, NULL, 'Housing & Rent', 'housing-rent', 'home', '#EF4444', 'EXPENSE', TRUE, TRUE),
(11, NULL, NULL, 'Groceries & Supermarket', 'groceries', 'shopping-cart', '#F97316', 'EXPENSE', TRUE, TRUE),
(12, NULL, NULL, 'Utilities & Internet', 'utilities-internet', 'zap', '#EAB308', 'EXPENSE', TRUE, TRUE),
(13, NULL, NULL, 'Transportation & Fuel', 'transportation-fuel', 'car', '#84CC16', 'EXPENSE', TRUE, TRUE),
(14, NULL, NULL, 'Healthcare & Medical', 'healthcare-medical', 'activity', '#06B6D4', 'EXPENSE', TRUE, TRUE),

(20, NULL, NULL, 'Dining Out & Cafes', 'dining-out', 'coffee', '#F43F5E', 'EXPENSE', TRUE, TRUE),
(21, NULL, NULL, 'Subscriptions & Streaming', 'subscriptions', 'tv', '#8B5CF6', 'EXPENSE', TRUE, TRUE),
(22, NULL, NULL, 'Shopping & Electronics', 'shopping-electronics', 'package', '#EC4899', 'EXPENSE', TRUE, TRUE),
(23, NULL, NULL, 'Travel & Vacations', 'travel-vacations', 'plane', '#6366F1', 'EXPENSE', TRUE, TRUE),

(30, NULL, NULL, 'Internal Transfer', 'internal-transfer', 'arrow-left-right', '#64748B', 'TRANSFER', TRUE, TRUE);

-- ----------------------------------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------------------------------
INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`first_name\`, \`last_name\`, \`role\`, \`status\`, \`currency_code\`, \`timezone\`) VALUES
(1, 'demo.user@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'Alex', 'Morgan', 'ROLE_USER', 'ACTIVE', 'USD', 'America/New_York'),
(2, 'sarah.premium@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'Sarah', 'Chen', 'ROLE_PREMIUM_USER', 'ACTIVE', 'USD', 'America/Los_Angeles'),
(3, 'admin@finwise.ai', '$2a$12$e0M2S4z33.V0pA9c5B6kTe3aR5B7O9oP.w2n3X1yZ0.q4W5e6R7tY', 'System', 'Administrator', 'ROLE_ADMIN', 'ACTIVE', 'USD', 'UTC');

-- ----------------------------------------------------------------------------
-- 3. USER 2FA (TOTP)
-- ----------------------------------------------------------------------------
INSERT INTO \`user_2fa\` (\`user_id\`, \`is_enabled\`, \`secret_key\`, \`backup_codes\`, \`enabled_at\`) VALUES
(1, TRUE, 'JBSWY3DPEHPK3PXP', '["84920194","39102948","58291039","91029384"]', '2026-01-15 10:00:00');

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS
-- ----------------------------------------------------------------------------
INSERT INTO \`accounts\` (\`id\`, \`user_id\`, \`account_name\`, \`account_type\`, \`currency_code\`, \`balance\`, \`opening_balance\`, \`account_number_masked\`, \`institution_name\`) VALUES
(101, 1, 'Chase Total Checking', 'CHECKING', 'USD', 4325.50, 2500.00, '**** 4821', 'Chase Bank'),
(102, 1, 'Marcus High-Yield Savings (4.4% APY)', 'SAVINGS', 'USD', 18450.00, 15000.00, '**** 9302', 'Goldman Sachs'),
(103, 1, 'Amex Blue Cash Preferred', 'CREDIT_CARD', 'USD', 874.20, 0.00, '**** 1004', 'American Express'),
(104, 1, 'Physical Cash Wallet', 'CASH', 'USD', 180.00, 180.00, NULL, 'Cash on Hand');

-- ----------------------------------------------------------------------------
-- 5. BUDGETS
-- ----------------------------------------------------------------------------
INSERT INTO \`budgets\` (\`id\`, \`user_id\`, \`category_id\`, \`name\`, \`period\`, \`amount_limit\`, \`spent_amount\`, \`start_date\`, \`end_date\`, \`rollover_enabled\`, \`rollover_amount\`, \`alert_threshold_pct\`) VALUES
(201, 1, 11, 'Monthly Groceries Budget', 'MONTHLY', 650.00, 512.40, '2026-10-01', '2026-10-31', TRUE, 45.00, 80),
(202, 1, 20, 'Dining & Coffee Limit', 'MONTHLY', 400.00, 385.60, '2026-10-01', '2026-10-31', FALSE, 0.00, 80),
(203, 1, 21, 'Entertainment & Subscriptions', 'MONTHLY', 120.00, 84.97, '2026-10-01', '2026-10-31', FALSE, 0.00, 80),
(204, 1, 13, 'Commute & Fuel Budget', 'MONTHLY', 250.00, 142.10, '2026-10-01', '2026-10-31', TRUE, 20.00, 80);

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO \`transactions\` (\`id\`, \`user_id\`, \`account_id\`, \`destination_account_id\`, \`category_id\`, \`transaction_type\`, \`amount\`, \`currency_code\`, \`transaction_date\`, \`value_date\`, \`description\`, \`merchant_name\`, \`is_recurring\`, \`checksum_hash\`, \`status\`) VALUES
(1001, 1, 101, NULL, 1, 'INCOME', 3750.00, 'USD', '2026-10-01', '2026-10-01 09:00:00', 'Bi-weekly Direct Deposit Payroll', 'TechCorp Inc', TRUE, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'COMPLETED'),
(1002, 1, 101, NULL, 2, 'INCOME', 850.00, 'USD', '2026-10-03', '2026-10-03 14:30:00', 'Stripe Consulting Retainer', 'Client Apex Labs', FALSE, 'a4b1c2d3e4f50123456789abcdef0123456789abcdef0123456789abcdef0123', 'COMPLETED'),
(1003, 1, 101, NULL, 10, 'EXPENSE', 1750.00, 'USD', '2026-10-01', '2026-10-01 10:15:00', 'October Apartment Rent Transfer', 'Skyline Residences', TRUE, 'f1e2d3c4b5a69876543210fedcba9876543210fedcba9876543210fedcba9876', 'COMPLETED'),
(1004, 1, 103, NULL, 11, 'EXPENSE', 145.80, 'USD', '2026-10-02', '2026-10-02 17:40:00', 'Weekly Organic Grocery Run', 'Whole Foods Market', FALSE, '55b3d92ec178044719028abfcf98b16c8024227c94fae902c4b8b6e22f28b76a', 'COMPLETED'),
(1005, 1, 103, NULL, 11, 'EXPENSE', 88.50, 'USD', '2026-10-04', '2026-10-04 12:10:00', 'Trader Joe Supermarket Stockup', 'Trader Joe', FALSE, '77c2e81ba289155829139bceae09c27d9135338da5abf013d5c9c7f33a39c87b', 'COMPLETED'),
(1006, 1, 101, NULL, 12, 'EXPENSE', 115.30, 'USD', '2026-10-02', '2026-10-02 08:00:00', 'Electric & Gas Utility Bill', 'ConEdison', TRUE, '88d3f92cb39026693a240cdfae10d38ea246449eb6bcf124e6dad8a44b40d98c', 'COMPLETED'),
(1007, 1, 103, NULL, 13, 'EXPENSE', 52.40, 'USD', '2026-10-03', '2026-10-03 18:20:00', 'Shell Gasoline Refill', 'Shell Oil', FALSE, '99e4a03dc4a137704b351deabf21e49fb357550fc7cde235f7ebe9b55c51ea9d', 'COMPLETED'),
(1008, 1, 103, NULL, 20, 'EXPENSE', 165.20, 'USD', '2026-10-03', '2026-10-03 20:30:00', 'Omakase Sushi Dinner with Friends', 'Nobu Downtown', FALSE, '11f5b14ed5b248815c462efbcd32f50ac468661ad8def346a8fcfa066d62fb0e', 'COMPLETED'),
(1009, 1, 103, NULL, 20, 'EXPENSE', 74.80, 'USD', '2026-10-04', '2026-10-04 13:15:00', 'Bistro Lunch & Drinks', 'Blue Bottle & Bistro', FALSE, '22a6c25fe6c359926d573fbcde43a61bd579772be9ef0457b9adb1177e73ac1f', 'COMPLETED'),
(1010, 1, 103, NULL, 21, 'EXPENSE', 22.99, 'USD', '2026-10-02', '2026-10-02 02:00:00', 'Netflix Premium 4K Plan', 'Netflix', TRUE, '33b7d360f7d460037e684acdef54b72ce68a883cf0fa1568caaec2288f84bd2a', 'COMPLETED'),
(1011, 1, 103, NULL, 21, 'EXPENSE', 16.99, 'USD', '2026-10-02', '2026-10-02 02:00:00', 'Spotify Family Plan', 'Spotify', TRUE, '44c8e471a8e571148f795bdefa65c83df79b994d01ab2679dbbfd3399a95ce3b', 'COMPLETED'),
(1012, 1, 101, 102, 30, 'TRANSFER', 500.00, 'USD', '2026-10-02', '2026-10-02 11:00:00', 'Monthly Automated Emergency Fund Savings', 'Internal Transfer', TRUE, '55d9f582b9f682259a806cefba76d94ea8ac005e12bc378aeccee44aa0a6df4c', 'COMPLETED');

-- ----------------------------------------------------------------------------
-- 7. RECURRING RULES
-- ----------------------------------------------------------------------------
INSERT INTO \`recurring_rules\` (\`id\`, \`user_id\`, \`account_id\`, \`category_id\`, \`transaction_type\`, \`amount\`, \`description\`, \`frequency\`, \`cron_expression\`, \`next_run_date\`, \`start_date\`) VALUES
(301, 1, 101, 10, 'EXPENSE', 1750.00, 'Apartment Rent Transfer', 'MONTHLY', '0 0 10 1 * ?', '2026-11-01', '2026-01-01'),
(302, 1, 103, 21, 'EXPENSE', 22.99, 'Netflix Subscription', 'MONTHLY', '0 0 2 2 * ?', '2026-11-02', '2026-01-02'),
(303, 1, 101, 1, 'INCOME', 3750.00, 'Bi-weekly Salary TechCorp', 'BI_WEEKLY', '0 0 9 ? * FRI#1,FRI#3', '2026-10-15', '2026-01-01');

-- ----------------------------------------------------------------------------
-- 8. AI INSIGHTS
-- ----------------------------------------------------------------------------
INSERT INTO \`ai_insights\` (\`id\`, \`user_id\`, \`insight_type\`, \`period_month\`, \`title\`, \`summary\`, \`full_analysis_json\`, \`prompt_tokens\`, \`completion_tokens\`) VALUES
(401, 1, 'ANOMALY_ALERT', '2026-10', 'Dining & Cafes spending is at 96% of monthly limit in first 5 days', 'You have spent $385.60 of your $400.00 dining budget (96.4%) within the first 5 days of October, primarily driven by a $165.20 dinner at Nobu.', '{"anomalies":[{"category":"Dining Out","ratio":0.964,"keyTransaction":"Nobu Downtown $165.20","recommendation":"Cap dining out for next 14 days and use prepared meals to avoid budget breach."}]}', 340, 112);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO \`notifications\` (\`id\`, \`user_id\`, \`notification_type\`, \`channel\`, \`title\`, \`message\`, \`reference_id\`, \`reference_type\`, \`is_read\`) VALUES
(501, 1, 'BUDGET_WARNING_80', 'IN_APP', 'Budget Alert: Dining & Coffee', 'Your Dining & Coffee budget has exceeded 80% ($385.60 spent of $400.00).', 202, 'BUDGET', FALSE),
(502, 1, 'RECURRING_DUE', 'IN_APP', 'Upcoming Payroll Deposit', 'Recurring salary deposit of $3,750.00 scheduled for Oct 15, 2026.', 303, 'RECURRING_RULE', TRUE);

-- ----------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO \`audit_logs\` (\`id\`, \`entity_name\`, \`entity_id\`, \`action\`, \`changed_by_user_id\`, \`ip_address\`, \`old_state_json\`, \`new_state_json\`, \`correlation_id\`) VALUES
(601, 'TRANSACTION', 1012, 'TRANSFER', 1, '192.168.1.42', '{"account_101_bal":4825.50,"account_102_bal":17950.00}', '{"account_101_bal":4325.50,"account_102_bal":18450.00}', 'tx-corr-48f8a920-1002-4b31-897c-48201948ba12');`;
