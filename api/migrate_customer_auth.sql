-- ============================================================
-- Divine Interior — Customer Auth Migration
-- Run this in phpMyAdmin → divine_interior database → SQL tab
-- ============================================================
USE `divine_interior`;

-- Add auth columns to existing customers table
ALTER TABLE `customers`
  ADD COLUMN IF NOT EXISTS `password`     VARCHAR(255) DEFAULT NULL AFTER `avatar`,
  ADD COLUMN IF NOT EXISTS `google_id`    VARCHAR(128) DEFAULT NULL AFTER `password`,
  ADD COLUMN IF NOT EXISTS `auth_type`    ENUM('email','google','phone') NOT NULL DEFAULT 'email' AFTER `google_id`,
  ADD COLUMN IF NOT EXISTS `is_verified`  TINYINT(1) NOT NULL DEFAULT 0 AFTER `auth_type`,
  ADD COLUMN IF NOT EXISTS `last_login`   DATETIME DEFAULT NULL AFTER `is_verified`;

-- OTP table for email / phone verification
CREATE TABLE IF NOT EXISTS `customer_otps` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email`      VARCHAR(191) NOT NULL,
  `otp`        VARCHAR(10) NOT NULL,
  `type`       ENUM('verify','login','reset') NOT NULL DEFAULT 'verify',
  `expires_at` DATETIME NOT NULL,
  `used`       TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email_type` (`email`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer JWT tokens (for logout / token revocation)
CREATE TABLE IF NOT EXISTS `customer_tokens` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
