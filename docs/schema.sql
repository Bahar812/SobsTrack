-- MySQL schema untuk Dealer Motor Dashboard

CREATE TABLE branches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','sales') NOT NULL DEFAULT 'sales',
  branch_id BIGINT UNSIGNED NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE attendances (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_at DATETIME NOT NULL,
  check_out_at DATETIME NULL,
  location_text VARCHAR(150) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  selfie_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_att_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE attendance_cleanliness_photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attendance_id BIGINT UNSIGNED NOT NULL,
  photo_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_att_clean FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE daily_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  activity_date DATE NOT NULL,
  wa_story_count INT UNSIGNED NOT NULL DEFAULT 0,
  fb_marketplace_count INT UNSIGNED NOT NULL DEFAULT 0,
  tiktok_post_count INT UNSIGNED NOT NULL DEFAULT 0,
  new_prospect_count INT UNSIGNED NOT NULL DEFAULT 0,
  fu_prospect_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_act_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE daily_activity_proofs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  daily_activity_id BIGINT UNSIGNED NOT NULL,
  proof_type ENUM('wa_story','fb_marketplace','tiktok') NOT NULL,
  proof_path VARCHAR(255) NULL,
  proof_url VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_act_proof FOREIGN KEY (daily_activity_id) REFERENCES daily_activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sales_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  lead_date DATE NOT NULL,
  name VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  motor_interest VARCHAR(120) NOT NULL,
  status ENUM('new','fu','deal','cancel') NOT NULL DEFAULT 'new',
  note TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_lead_sales FOREIGN KEY (sales_id) REFERENCES users(id),
  CONSTRAINT fk_lead_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE lead_followups (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id BIGINT UNSIGNED NOT NULL,
  followup_at DATETIME NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_follow_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  event_start DATETIME NOT NULL,
  event_end DATETIME NULL,
  location VARCHAR(150) NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_event_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_event_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE spk (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sales_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  spk_no VARCHAR(50) NULL,
  customer_name VARCHAR(120) NOT NULL,
  unit_name VARCHAR(120) NOT NULL,
  spk_date DATE NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_spk_sales FOREIGN KEY (sales_id) REFERENCES users(id),
  CONSTRAINT fk_spk_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

CREATE TABLE sales_targets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sales_id BIGINT UNSIGNED NOT NULL,
  target_month DATE NOT NULL,
  target_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_target_sales FOREIGN KEY (sales_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE document_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_doc_category FOREIGN KEY (category_id) REFERENCES document_categories(id),
  CONSTRAINT fk_doc_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE price_lists (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  unit_type VARCHAR(120) NOT NULL,
  otr_price DECIMAL(14,2) NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  last_updated_at DATETIME NOT NULL,
  updated_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_price_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_price_user FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE stock_units (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  unit_type VARCHAR(120) NOT NULL,
  unit_color VARCHAR(80) NOT NULL,
  frame_no VARCHAR(80) NOT NULL,
  engine_no VARCHAR(80) NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  status ENUM('booking','available') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_stock_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;
