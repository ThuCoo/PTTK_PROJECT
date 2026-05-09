-- ============================================================
--  Add Pre-rental Review (Rà soát điều kiện) Support
--  Tracks review status of rental registration forms
-- ============================================================

-- Add columns to PhieuDangKy for review tracking
ALTER TABLE phieu_dang_ky ADD COLUMN IF NOT EXISTS trang_thai_xem_xet VARCHAR(100) DEFAULT 'Chưa duyệt';
ALTER TABLE phieu_dang_ky ADD COLUMN IF NOT EXISTS phong_id_confirmed INT;
ALTER TABLE phieu_dang_ky ADD COLUMN IF NOT EXISTS ngay_xem_xet TIMESTAMP;
ALTER TABLE phieu_dang_ky ADD COLUMN IF NOT EXISTS ghi_chu_xem_xet TEXT;

-- Add foreign key for confirmed room
ALTER TABLE phieu_dang_ky
ADD CONSTRAINT fk_phieu_dang_ky_phong_confirmed
FOREIGN KEY (phong_id_confirmed) REFERENCES phong(id) ON DELETE SET NULL;

-- Create table for room conditions if not exists
CREATE TABLE IF NOT EXISTS dieu_kien_luu_tru (
  id SERIAL PRIMARY KEY,
  ten_dieu_kien VARCHAR(255) NOT NULL,
  mo_ta TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create M:N relationship between rooms and conditions
CREATE TABLE IF NOT EXISTS phong_dieu_kien (
  phong_id INT NOT NULL,
  dieu_kien_id INT NOT NULL,
  PRIMARY KEY (phong_id, dieu_kien_id),
  FOREIGN KEY (phong_id) REFERENCES phong(id) ON DELETE CASCADE,
  FOREIGN KEY (dieu_kien_id) REFERENCES dieu_kien_luu_tru(id) ON DELETE CASCADE
);

-- Create table for customer condition eligibility
CREATE TABLE IF NOT EXISTS khach_hang_dieu_kien (
  id SERIAL PRIMARY KEY,
  khach_hang_id INT NOT NULL,
  dieu_kien_id INT NOT NULL,
  trang_thai VARCHAR(100) DEFAULT 'Đã duyệt', -- Đã duyệt, Không hợp lệ
  ghi_chu TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(khach_hang_id, dieu_kien_id),
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
  FOREIGN KEY (dieu_kien_id) REFERENCES dieu_kien_luu_tru(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_phieu_dang_ky_trang_thai_xem_xet ON phieu_dang_ky(trang_thai_xem_xet);
CREATE INDEX IF NOT EXISTS idx_phieu_dang_ky_khach_hang_id ON phieu_dang_ky(khach_hang_id);
