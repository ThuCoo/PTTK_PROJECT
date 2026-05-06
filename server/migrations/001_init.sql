-- ============================================================
--  HomeStay Dorm — PostgreSQL Schema & Seed Data
--  Run this file to initialize the database
-- ============================================================

-- Users (login system)
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(50)  UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  ho_ten         VARCHAR(100) NOT NULL,
  role           VARCHAR(20)  NOT NULL CHECK (role IN ('nhan_vien', 'quan_ly')),
  email          VARCHAR(100),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS phong (
  id          SERIAL PRIMARY KEY,
  ma_phong    VARCHAR(10)  UNIQUE NOT NULL,
  khu_vuc     VARCHAR(10)  NOT NULL,
  loai_phong  VARCHAR(50)  NOT NULL,
  suc_chua    INT          NOT NULL,
  dang_o      INT          NOT NULL DEFAULT 0,
  gia_thue    BIGINT       NOT NULL,
  gioi_tinh   VARCHAR(5)   NOT NULL CHECK (gioi_tinh IN ('Nam', 'Nữ')),
  trang_thai  VARCHAR(30)  NOT NULL DEFAULT 'Trống',
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- Customers / Registration forms
CREATE TABLE IF NOT EXISTS khach_hang (
  id              SERIAL PRIMARY KEY,
  ma_phieu        VARCHAR(20)  UNIQUE NOT NULL,
  ho_ten          VARCHAR(100) NOT NULL,
  phone           VARCHAR(15)  NOT NULL,
  email           VARCHAR(100),
  cccd            VARCHAR(20),
  gioi_tinh       VARCHAR(5)   NOT NULL CHECK (gioi_tinh IN ('Nam', 'Nữ')),
  so_nguoi        INT          NOT NULL DEFAULT 1,
  khu_vuc         VARCHAR(10),
  loai_phong      VARCHAR(50),
  khoang_gia      VARCHAR(100),
  ngay_vao        DATE,
  thoi_han_thue   INT,
  ghi_chu         TEXT,
  loai_thue       VARCHAR(50),
  trang_thai      VARCHAR(50)  NOT NULL DEFAULT 'Đang tư vấn',
  created_at      TIMESTAMP    DEFAULT NOW()
);

-- Appointments (room viewing schedule)
CREATE TABLE IF NOT EXISTS lich_xem_phong (
  id              SERIAL PRIMARY KEY,
  khach_hang_id   INT          REFERENCES khach_hang(id) ON DELETE SET NULL,
  phong_id        INT          REFERENCES phong(id) ON DELETE SET NULL,
  thoi_gian       TIMESTAMP    NOT NULL,
  trang_thai      VARCHAR(30)  NOT NULL DEFAULT 'Chờ xác nhận',
  ghi_chu         TEXT,
  created_at      TIMESTAMP    DEFAULT NOW()
);

-- Deposits
CREATE TABLE IF NOT EXISTS dat_coc (
  id                    SERIAL PRIMARY KEY,
  ma_coc                VARCHAR(20)  UNIQUE NOT NULL,
  khach_hang_id         INT          REFERENCES khach_hang(id) ON DELETE SET NULL,
  phong_id              INT          REFERENCES phong(id) ON DELETE SET NULL,
  so_giuong             INT          NOT NULL,
  so_tien               BIGINT       NOT NULL,
  ngay_tao              TIMESTAMP    DEFAULT NOW(),
  han_thanh_toan        TIMESTAMP,
  trang_thai            VARCHAR(40)  NOT NULL DEFAULT 'Chờ thanh toán',
  phuong_thuc           VARCHAR(50),
  anh_chung_tu_encrypted TEXT,         -- AES-256-CBC encrypted image data
  mime_type             VARCHAR(50),   -- original MIME type for serving
  nguoi_xac_nhan        VARCHAR(100),
  ngay_xac_nhan         TIMESTAMP,
  ghi_chu               TEXT
);

-- Contracts
CREATE TABLE IF NOT EXISTS hop_dong (
  id                    SERIAL PRIMARY KEY,
  ma_hd                 VARCHAR(20)  UNIQUE NOT NULL,
  khach_hang_id         INT          REFERENCES khach_hang(id) ON DELETE SET NULL,
  phong_id              INT          REFERENCES phong(id) ON DELETE SET NULL,
  so_giuong             INT          NOT NULL,
  ngay_bat_dau          DATE         NOT NULL,
  ngay_ket_thuc         DATE         NOT NULL,
  gia_thue_moi_giuong   BIGINT       NOT NULL,
  tong_tien_thue        BIGINT       NOT NULL,
  tien_coc              BIGINT       NOT NULL,
  trang_thai            VARCHAR(30)  NOT NULL DEFAULT 'Chờ ký',
  ngay_ky               DATE,
  created_at            TIMESTAMP    DEFAULT NOW()
);

-- Group members (for check-in)
CREATE TABLE IF NOT EXISTS thanh_vien_nhom (
  id                    SERIAL PRIMARY KEY,
  hop_dong_id           INT          REFERENCES hop_dong(id) ON DELETE CASCADE,
  ho_ten                VARCHAR(100) NOT NULL,
  cccd                  VARCHAR(20)  NOT NULL,
  phone                 VARCHAR(15),
  ngay_sinh             DATE,
  dia_chi_thuong_tru    TEXT
);

-- Check-in records
CREATE TABLE IF NOT EXISTS nhan_phong (
  id              SERIAL PRIMARY KEY,
  hop_dong_id     INT          REFERENCES hop_dong(id) ON DELETE SET NULL,
  ngay_nhan       TIMESTAMP    DEFAULT NOW(),
  ghi_chu_tai_san TEXT,
  da_hoan_tat     BOOLEAN      DEFAULT FALSE,
  created_by      INT          REFERENCES users(id) ON DELETE SET NULL
);

-- Check-out records
CREATE TABLE IF NOT EXISTS tra_phong (
  id                SERIAL PRIMARY KEY,
  hop_dong_id       INT          REFERENCES hop_dong(id) ON DELETE SET NULL,
  ngay_tra          TIMESTAMP    DEFAULT NOW(),
  ly_do             TEXT,
  tien_boi_thuong   BIGINT       DEFAULT 0,
  tien_hoan_coc     BIGINT       DEFAULT 0,
  ghi_chu           TEXT,
  created_by        INT          REFERENCES users(id) ON DELETE SET NULL
);

-- Monthly payment invoices
CREATE TABLE IF NOT EXISTS thanh_toan (
  id                SERIAL PRIMARY KEY,
  ma_phieu          VARCHAR(20)  UNIQUE NOT NULL,
  hop_dong_id       INT          REFERENCES hop_dong(id) ON DELETE SET NULL,
  thang             VARCHAR(20)  NOT NULL,
  tien_thue         BIGINT       NOT NULL,
  tien_dien         BIGINT       NOT NULL DEFAULT 0,
  tien_nuoc         BIGINT       NOT NULL DEFAULT 0,
  phi_xe            BIGINT       NOT NULL DEFAULT 0,
  tong_tien         BIGINT       NOT NULL,
  han_thanh_toan    DATE,
  ngay_thanh_toan   TIMESTAMP,
  phuong_thuc       VARCHAR(50),
  trang_thai        VARCHAR(30)  NOT NULL DEFAULT 'Chưa thanh toán',
  created_at        TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Seed users (passwords are bcrypt hashes of 'password123')
-- quan_ly: admin / password123
-- nhan_vien: nhanvien / password123
INSERT INTO users (username, password_hash, ho_ten, role, email) VALUES
  ('admin',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn X',  'quan_ly',   'admin@homestay.com'),
  ('nhanvien',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nhân viên Sale','nhan_vien', 'sale@homestay.com')
ON CONFLICT (username) DO NOTHING;

-- Seed rooms
INSERT INTO phong (ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai) VALUES
  ('P301', 'Khu A', 'Phòng 4 người', 4, 4, 1800000, 'Nam', 'Đang sử dụng'),
  ('P302', 'Khu A', 'Phòng 4 người', 4, 2, 1800000, 'Nam', 'Còn giường'),
  ('P205', 'Khu B', 'Phòng 2 người', 2, 0, 2500000, 'Nữ', 'Trống'),
  ('P412', 'Khu A', 'Phòng 6 người', 6, 0, 1500000, 'Nam', 'Đã cọc'),
  ('P108', 'Khu C', 'Phòng 2 người', 2, 0, 2200000, 'Nữ', 'Trống')
ON CONFLICT (ma_phong) DO NOTHING;

-- Seed customers
INSERT INTO khach_hang (ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai) VALUES
  ('PDK001','Nguyễn Văn A','0901234567','nguyenvana@email.com','001234567890','Nam',2,'Khu A','Phòng 4 người','1.500.000 - 2.000.000','2026-05-15',6,'Cần gần trường đại học','Thuê ở ghép','Đang tư vấn'),
  ('PDK002','Trần Thị B',  '0912345678','tranthib@email.com',  '002345678901','Nữ',1,'Khu B','Phòng 2 người','2.000.000 - 2.500.000','2026-05-10',12,'Cần phòng yên tĩnh','Thuê ở ghép','Đã lên lịch xem phòng'),
  ('PDK003','Lê Văn C',    '0923456789','levanc@email.com',    '003456789012','Nam',4,'Khu A','Phòng 6 người','1.200.000 - 1.500.000','2026-06-01',6,'Thuê cho nhóm 4 bạn','Thuê nguyên phòng','Đồng ý thuê')
ON CONFLICT (ma_phieu) DO NOTHING;

-- Seed appointments
INSERT INTO lich_xem_phong (khach_hang_id, phong_id, thoi_gian, trang_thai, ghi_chu) VALUES
  (2, 3, '2026-05-05 14:00:00', 'Chờ xác nhận', 'Khách muốn xem phòng P205'),
  (3, 4, '2026-05-06 09:00:00', 'Chờ xác nhận', 'Xem phòng P412 cho nhóm')
ON CONFLICT DO NOTHING;

-- Seed deposits
INSERT INTO dat_coc (ma_coc, khach_hang_id, phong_id, so_giuong, so_tien, han_thanh_toan, trang_thai, phuong_thuc, nguoi_xac_nhan, ngay_xac_nhan) VALUES
  ('DC001', 1, 1, 2, 7200000,  NOW() + INTERVAL '24 hours', 'Đã xác nhận',   'Chuyển khoản', 'Quản lý - Nguyễn Văn X', NOW() - INTERVAL '2 hours'),
  ('DC002', 2, 3, 1, 5000000,  NOW() + INTERVAL '24 hours', 'Chờ xác nhận',  'Chuyển khoản', NULL, NULL),
  ('DC003', 3, 4, 3, 9000000,  NOW() + INTERVAL '24 hours', 'Chờ thanh toán', NULL,           NULL, NULL)
ON CONFLICT (ma_coc) DO NOTHING;

-- Seed contracts
INSERT INTO hop_dong (ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky) VALUES
  ('HD001', 1, 1, 2, '2026-05-01', '2026-11-01', 1800000, 3600000, 7200000, 'Đang hiệu lực', '2026-04-28'),
  ('HD002', 2, 3, 1, '2026-05-05', '2026-11-05', 2500000, 2500000, 5000000, 'Chờ ký',        NULL),
  ('HD003', 3, 4, 3, '2026-04-15', '2026-10-15', 1500000, 4500000, 9000000, 'Đang hiệu lực', '2026-04-10')
ON CONFLICT (ma_hd) DO NOTHING;

-- Seed payments
INSERT INTO thanh_toan (ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai) VALUES
  ('PT001', 1, 'Tháng 5/2026', 3600000, 250000, 160000, 50000, 4060000, '2026-05-05', '2026-05-03', 'Chuyển khoản', 'Đã thanh toán'),
  ('PT002', 2, 'Tháng 5/2026', 2500000, 180000,  80000,     0, 2760000, '2026-05-05', NULL,          NULL,           'Chưa thanh toán'),
  ('PT003', 3, 'Tháng 5/2026', 4500000, 320000, 240000, 100000, 5160000, '2026-05-05', NULL,          NULL,           'Chưa thanh toán')
ON CONFLICT (ma_phieu) DO NOTHING;
