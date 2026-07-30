USE enterprise_crm;

-- Seed EduPulse Subscription Plans
INSERT INTO edupulse_subscription_plans (name, price, billing_cycle, features) VALUES
('Starter Tier', 29.99, 'Monthly', '{"max_students": 100, "email_support": true, "custom_branding": false}'),
('Professional Tier', 89.99, 'Monthly', '{"max_students": 500, "email_support": true, "custom_branding": true, "analytics": "Basic"}'),
('Enterprise Annual Tier', 899.00, 'Yearly', '{"max_students": 5000, "dedicated_account_manager": true, "custom_branding": true, "analytics": "Advanced", "sso_integration": true}');

-- Seed EduPulse Message Templates
INSERT INTO edupulse_message_templates (name, channel, configuration) VALUES
('Student Welcome Email', 'Email', '{"subject": "Welcome to EduPulse!", "html_body": "<h2>Welcome {{student_name}}!</h2><p>Your portal activation link is ready.</p>", "sender_email": "notifications@edupulse.io"}'),
('Payment Due SMS Alert', 'SMS', '{"message_text": "EduPulse Alert: Your monthly invoice of ${{amount}} is due on {{due_date}}.", "sender_id": "EDUPULSE"}'),
('Grade Report WhatsApp', 'WhatsApp', '{"template_name": "term_grade_report_v1", "language": "en_US", "header_text": "Official Semester Report Card"}');

-- Seed CloudMetric Client Sites
INSERT INTO cloudmetric_client_sites (domain_name, api_key, status, daily_quota) VALUES
('analytics.acme-corp.com', 'cm_live_7f8a9b0c1d2e3f4a5b6c', 'Active', 50000),
('dash.fintech-global.io', 'cm_live_1a2b3c4d5e6f7g8h9i0j', 'Active', 150000),
('api.legacy-partner.net', 'cm_live_9z8y7x6w5v4u3t2s1r0q', 'Suspended', 5000);

-- Seed System Audit Logs
INSERT INTO crm_audit_logs (product_id, entity_id, action, record_id, performed_by, changes) VALUES
('edupulse', 'subscription_plans', 'CREATE', '1', 'system.seed@company.com', '{"name": "Starter Tier", "price": 29.99}'),
('cloudmetric', 'client_sites', 'CREATE', '1', 'ops.lead@company.com', '{"domain_name": "analytics.acme-corp.com", "status": "Active"}');
