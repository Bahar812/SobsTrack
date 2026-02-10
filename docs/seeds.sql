-- Sample seed data

INSERT INTO branches (name, address, created_at, updated_at) VALUES
('Cabang Pusat', 'Jl. Merdeka No. 1', NOW(), NOW()),
('Cabang Utara', 'Jl. Melati No. 10', NOW(), NOW());

INSERT INTO users (name, email, password, role, branch_id, phone, created_at, updated_at) VALUES
('Admin Owner', 'admin@dealer.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '081200000001', NOW(), NOW()),
('Sales Andi', 'andi@dealer.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales', 1, '081200000002', NOW(), NOW()),
('Sales Rina', 'rina@dealer.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales', 2, '081200000003', NOW(), NOW());

INSERT INTO document_categories (name, created_at, updated_at) VALUES
('Brosur Motor', NOW(), NOW()),
('Pricelist', NOW(), NOW()),
('Form SPK', NOW(), NOW()),
('SOP Sales', NOW(), NOW());

INSERT INTO price_lists (brand, unit_type, otr_price, branch_id, last_updated_at, updated_by, created_at, updated_at) VALUES
('Yamaha', 'NMAX 155', 32000000, 1, NOW(), 1, NOW(), NOW()),
('Honda', 'PCX 160', 34000000, 1, NOW(), 1, NOW(), NOW());

INSERT INTO stock_units (unit_type, unit_color, frame_no, engine_no, branch_id, status, created_at, updated_at) VALUES
('NMAX 155', 'Hitam', 'FRM-001', 'ENG-001', 1, 'available', NOW(), NOW()),
('PCX 160', 'Putih', 'FRM-002', 'ENG-002', 1, 'booking', NOW(), NOW());

INSERT INTO spk (sales_id, branch_id, spk_no, customer_name, unit_name, spk_date, created_at, updated_at) VALUES
(2, 1, 'SPK-001', 'Budi Santoso', 'NMAX 155', CURDATE(), NOW(), NOW()),
(3, 2, 'SPK-002', 'Siti Aminah', 'PCX 160', CURDATE(), NOW(), NOW());

INSERT INTO sales_targets (sales_id, target_month, target_count, created_at, updated_at) VALUES
(2, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 10, NOW(), NOW()),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 8, NOW(), NOW());
