-- ======================================================================
-- VibeNoww Clean Production MySQL Relational Database Schema
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- ZERO DUMMY DATA — Fresh Production Application Architecture
-- ======================================================================

-- 1. Users Table (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'PHOTOGRAPHER', 'CLIENT') NOT NULL DEFAULT 'PHOTOGRAPHER',
  status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Photographers / Creators Table
CREATE TABLE IF NOT EXISTS photographers (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  studio_name VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  location VARCHAR(255) NULL,
  specialization TEXT NULL,
  profile_image VARCHAR(500) NULL,
  starting_price DECIMAL(12,2) DEFAULT 0,
  price_unit VARCHAR(50) DEFAULT 'per day',
  experience_years INT DEFAULT 1,
  bio TEXT NULL,
  service_areas TEXT NULL,
  languages TEXT NULL,
  equipment TEXT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_photographers_status (status, approval_status),
  INDEX idx_photographers_email (email),
  INDEX idx_photographers_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Shoot Requests / Orders Table (Customer Leads & Assigned Shoots)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_code VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NULL,
  shoot_type VARCHAR(255) NOT NULL,
  shoot_date DATE NOT NULL,
  shoot_end_date DATE NULL,
  shoot_dates_json TEXT NULL,
  shoot_time VARCHAR(100) NULL,
  location VARCHAR(255) NOT NULL,
  requirements TEXT NULL,
  status ENUM('NEW', 'PENDING', 'ASSIGNED', 'QUOTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'INCOMPLETE', 'CANCELLED') NOT NULL DEFAULT 'NEW',
  estimated_budget DECIMAL(12,2) DEFAULT 0,
  assigned_photographer_id VARCHAR(64) NULL,
  assigned_photographer_name VARCHAR(255) NULL,
  duration_days INT DEFAULT 1,
  duration_hours VARCHAR(50) NULL,
  number_of_people VARCHAR(50) NULL,
  customer_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_photographer_id) REFERENCES photographers(id) ON DELETE SET NULL,
  INDEX idx_orders_work_code (work_code),
  INDEX idx_orders_shoot_date (shoot_date),
  INDEX idx_orders_status (status),
  INDEX idx_orders_phone (customer_phone),
  INDEX idx_orders_photographer (assigned_photographer_id),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
  work_id INT NULL,
  work_code VARCHAR(20) NULL,
  block_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE,
  FOREIGN KEY (work_id) REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE KEY uk_photographer_date (photographer_id, date),
  INDEX idx_avail_date (date),
  INDEX idx_avail_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_code VARCHAR(20) NOT NULL,
  photographer_id VARCHAR(64) NULL,
  photographer_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  customer_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  studio_margin DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED') DEFAULT 'DRAFT',
  deliverables TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE SET NULL,
  INDEX idx_quotations_work (work_id),
  INDEX idx_quotations_code (work_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_code VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_type ENUM('ADVANCE', 'INTERIM', 'FINAL', 'SETTLEMENT', 'FULL') NOT NULL DEFAULT 'ADVANCE',
  payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PAID',
  transaction_reference VARCHAR(100) NULL,
  payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
  notes TEXT NULL,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_payments_work (work_id),
  INDEX idx_payments_code (work_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'ORDER',
  work_code VARCHAR(20) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_read (is_read),
  INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_code VARCHAR(20) NULL,
  actor VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_code (work_code),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Inquiries Table (Contact & Concierge Form)
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  event_type VARCHAR(100) NULL,
  budget VARCHAR(100) NULL,
  preferred_date VARCHAR(100) NULL,
  message TEXT NOT NULL,
  status ENUM('NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED') DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 10. Audit Logs Table (Permanent Immutable Deletion & Action Log)
-- ======================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(100) NULL,
  admin_email VARCHAR(255) NULL,
  admin_name VARCHAR(255) NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  target_details TEXT NULL,
  deletion_reason TEXT NOT NULL,
  result ENUM('SUCCESS', 'CANCELLED', 'FAILED', 'BLOCKED') NOT NULL DEFAULT 'SUCCESS',
  ip_address VARCHAR(100) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_target (target_type, target_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 11. Deletion Approvals Table (Server-Side 3-Step Approval Tokens)
-- ======================================================================
CREATE TABLE IF NOT EXISTS deletion_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(128) NOT NULL UNIQUE,
  admin_email VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  target_name VARCHAR(255) NULL,
  target_details TEXT NULL,
  reason TEXT NOT NULL,
  action_type VARCHAR(100) DEFAULT 'PERMANENT_DELETE',
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_approval_token (token),
  INDEX idx_approval_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 12. Password Resets Table (Secure Single-Use OTPs and Reset Tokens)
-- ======================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL UNIQUE,
  user_id INT NULL,
  photographer_id VARCHAR(64) NULL,
  identifier VARCHAR(255) NOT NULL,
  target_type ENUM('EMAIL', 'PHONE') NOT NULL DEFAULT 'EMAIL',
  target_destination VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  status ENUM('PENDING', 'VERIFIED', 'COMPLETED', 'EXPIRED', 'FAILED') DEFAULT 'PENDING',
  reset_token VARCHAR(128) NULL UNIQUE,
  token_expires_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_req (request_id),
  INDEX idx_reset_token (reset_token),
  INDEX idx_reset_identifier (identifier),
  INDEX idx_reset_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================================
-- 13. Initial Required System Admin Account Only (Zero Dummy Data)
-- Password is encrypted with bcrypt for '123Hema!@#'
-- ======================================================================
INSERT INTO users (name, email, phone, password_hash, role, status)
SELECT 'VibeNoww Admin', 'admin@vibenoww.com', '+91 98401 55667', '$2b$10$F.TjPD4ri9ieEDAZwED4quUMm47Dev9VLeqVFDa77NbPQkHwO2eFK', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@vibenoww.com');


