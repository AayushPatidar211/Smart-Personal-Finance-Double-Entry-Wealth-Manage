-- ============================================================================
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
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(80) NOT NULL,
    `last_name` VARCHAR(80) NOT NULL,
    `role` VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `currency_code` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC',
    `failed_attempt_count` INT NOT NULL DEFAULT 0,
    `locked_until` TIMESTAMP(6) NULL DEFAULT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. USER 2FA (TOTP)
-- Time-based One-Time Password secret storage (Jasypt encrypted at rest)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_2fa` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `secret_key` VARCHAR(255) NOT NULL,
    `backup_codes` TEXT NULL,
    `enabled_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_2fa_user_id` (`user_id`),
    CONSTRAINT `fk_user_2fa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. REFRESH TOKENS
-- State for JWT refresh-token rotation & device tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `device_info` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `expires_at` TIMESTAMP(6) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refresh_token_hash` (`token_hash`),
    KEY `idx_refresh_tokens_user` (`user_id`, `expires_at`),
    CONSTRAINT `fk_refresh_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ACCOUNTS TABLE
-- Financial wallets: Bank, Credit Card, Cash, Investment, Crypto
-- Concurrency: Optimistic lock on balance via version
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `account_name` VARCHAR(100) NOT NULL,
    `account_type` VARCHAR(30) NOT NULL, -- CHECKING, SAVINGS, CREDIT_CARD, CASH, INVESTMENT
    `currency_code` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `opening_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `account_number_masked` VARCHAR(20) NULL,
    `institution_name` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    `updated_by` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_accounts_user_active` (`user_id`, `is_active`),
    CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES TABLE
-- System defaults + user custom hierarchies with parent-child support
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL, -- NULL implies global/system-wide category
    `parent_id` BIGINT NULL,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT 'tag',
    `color_hex` VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    `category_type` VARCHAR(20) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    `is_system` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_category_slug` (`user_id`, `slug`, `is_deleted`),
    KEY `idx_categories_user` (`user_id`, `is_active`),
    KEY `idx_categories_parent` (`parent_id`),
    CONSTRAINT `fk_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
-- Financial ledger entry: Income, Expense, or Transfer
-- Strict DECIMAL(15,2), duplicate detection hash, audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `destination_account_id` BIGINT NULL, -- Used only when transaction_type = 'TRANSFER'
    `category_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(20) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    `amount` DECIMAL(15,2) NOT NULL,
    `fee_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `currency_code` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `transaction_date` DATE NOT NULL,
    `value_date` TIMESTAMP(6) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `merchant_name` VARCHAR(120) NULL,
    `notes` TEXT NULL,
    `tags` VARCHAR(255) NULL, -- Comma-separated or JSON array
    `receipt_url` VARCHAR(500) NULL,
    `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
    `checksum_hash` VARCHAR(64) NOT NULL, -- SHA-256 for idempotent duplicate protection
    `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- PENDING, COMPLETED, VOID, RECONCILED
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `created_by` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    `updated_by` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_tx_user_date` (`user_id`, `transaction_date` DESC),
    KEY `idx_tx_user_category` (`user_id`, `category_id`),
    KEY `idx_tx_account` (`account_id`),
    KEY `idx_tx_dest_account` (`destination_account_id`),
    KEY `idx_tx_checksum` (`user_id`, `checksum_hash`),
    CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_tx_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_tx_dest_account` FOREIGN KEY (`destination_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_tx_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. BUDGETS TABLE
-- Category consumption limits with rollover & real-time threshold alert status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budgets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `period` VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- WEEKLY, MONTHLY, QUARTERLY, YEARLY
    `amount_limit` DECIMAL(15,2) NOT NULL,
    `spent_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `rollover_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `rollover_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `alert_threshold_pct` INT NOT NULL DEFAULT 80, -- Trigger alert at 80% / 100%
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_category_period` (`user_id`, `category_id`, `start_date`, `end_date`, `is_deleted`),
    KEY `idx_budgets_user` (`user_id`, `is_active`),
    CONSTRAINT `fk_budgets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_budgets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. RECURRING RULES TABLE
-- Rules for automated recurring transactions executed by Spring Batch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recurring_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `frequency` VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, BI_WEEKLY, MONTHLY, QUARTERLY, YEARLY
    `cron_expression` VARCHAR(60) NULL,
    `next_run_date` DATE NOT NULL,
    `last_run_date` DATE NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_paused` BOOLEAN NOT NULL DEFAULT FALSE,
    `total_executions` INT NOT NULL DEFAULT 0,
    `failure_count` INT NOT NULL DEFAULT 0,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_recurring_batch_eval` (`is_paused`, `is_deleted`, `next_run_date`),
    CONSTRAINT `fk_recurring_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_recurring_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_recurring_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. IMPORT BATCHES TABLE
-- Tracks CSV / statement upload jobs, strategy parser used, duplicate stats
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `import_batches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `account_id` BIGINT NOT NULL,
    `bank_name` VARCHAR(50) NOT NULL, -- HDFC, ICICI, SBI, CHASE, STANDARD_CSV
    `file_name` VARCHAR(255) NOT NULL,
    `file_hash` VARCHAR(64) NOT NULL, -- Hash to prevent accidental double-upload
    `total_records` INT NOT NULL DEFAULT 0,
    `imported_count` INT NOT NULL DEFAULT 0,
    `duplicate_count` INT NOT NULL DEFAULT 0,
    `failed_count` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING, COMPLETED, FAILED, PARTIAL
    `error_details` JSON NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `version` BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_import_user` (`user_id`),
    KEY `idx_import_hash` (`user_id`, `file_hash`),
    CONSTRAINT `fk_import_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_import_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. AI INSIGHTS TABLE
-- Persisted Gemini insights, anomaly logs, token consumption & cache fallback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_insights` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `insight_type` VARCHAR(40) NOT NULL, -- MONTHLY_DIGEST, ANOMALY_ALERT, SAVING_OPPORTUNITY, FORECAST
    `period_month` VARCHAR(7) NOT NULL, -- e.g. '2026-10'
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NOT NULL,
    `full_analysis_json` JSON NOT NULL,
    `prompt_tokens` INT NOT NULL DEFAULT 0,
    `completion_tokens` INT NOT NULL DEFAULT 0,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_bookmarked` BOOLEAN NOT NULL DEFAULT FALSE,
    `expires_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `idx_ai_insights_user` (`user_id`, `created_at` DESC),
    KEY `idx_ai_insights_period` (`user_id`, `period_month`),
    CONSTRAINT `fk_ai_insights_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- Real-time in-app alerts + email delivery status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `notification_type` VARCHAR(40) NOT NULL, -- BUDGET_WARNING_80, BUDGET_BREACH_100, RECURRING_DUE, ANOMALY_FOUND
    `channel` VARCHAR(20) NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, SMS, PUSH
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `reference_id` BIGINT NULL,
    `reference_type` VARCHAR(40) NULL, -- TRANSACTION, BUDGET, RECURRING_RULE
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `is_sent` BOOLEAN NOT NULL DEFAULT FALSE,
    `sent_at` TIMESTAMP(6) NULL DEFAULT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_unread` (`user_id`, `is_read`, `created_at` DESC),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGS TABLE
-- Fintech-grade event audit trail via custom @Auditable aspect
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `entity_name` VARCHAR(80) NOT NULL,
    `entity_id` BIGINT NOT NULL,
    `action` VARCHAR(30) NOT NULL, -- INSERT, UPDATE, DELETE, RECONCILE, TRANSFER
    `changed_by_user_id` BIGINT NULL,
    `ip_address` VARCHAR(45) NULL,
    `old_state_json` JSON NULL,
    `new_state_json` JSON NULL,
    `correlation_id` VARCHAR(64) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `idx_audit_entity` (`entity_name`, `entity_id`),
    KEY `idx_audit_correlation` (`correlation_id`),
    KEY `idx_audit_created` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
