-- Internal Enterprise CRM Platform Database Schema (MySQL / PostgreSQL compatible)
-- Database Creation
CREATE DATABASE IF NOT EXISTS enterprise_crm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enterprise_crm;

-- 1. EduPulse: Subscription Plans
CREATE TABLE IF NOT EXISTS edupulse_subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'Monthly',
    features JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. EduPulse: Message Templates
CREATE TABLE IF NOT EXISTS edupulse_message_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'Email',
    configuration JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_name (name),
    INDEX idx_template_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CloudMetric: Client Sites
CREATE TABLE IF NOT EXISTS cloudmetric_client_sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    daily_quota INT NOT NULL DEFAULT 10000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain_name (domain_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Unified Audit Log for Governance & Extensibility
CREATE TABLE IF NOT EXISTS crm_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    changes JSON NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_product (product_id),
    INDEX idx_audit_entity (entity_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
