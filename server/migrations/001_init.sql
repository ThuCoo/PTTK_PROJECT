-- ============================================================
--  HomeStay Dorm — PostgreSQL Schema & Seed Data
--  Run this file to initialize the database (snake_case version)
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

INSERT INTO users (username, password_hash, ho_ten, role, email)
VALUES
(
  'admin',
  '$2b$10$4JspCUXYgMerCRWa1s8t/uCerFqiKUOMB61RA7B3ZPtfaCoot8/c2',
  'Admin',
  'quan_ly',
  'admin@gmail.com'
),
(
  'nhanvien',
  '$2b$10$4JspCUXYgMerCRWa1s8t/uCerFqiKUOMB61RA7B3ZPtfaCoot8/c2',
  'Nhan Vien',
  'nhan_vien',
  'nv@gmail.com'
);

-- =========================================================================
-- 1. TẠO CÁC BẢNG DANH MỤC & THỰC THỂ ĐỘC LẬP
-- =========================================================================

CREATE TABLE chi_nhanh (
    ma_chi_nhanh VARCHAR(50) PRIMARY KEY,
    ten_chi_nhanh VARCHAR(255) NOT NULL,
    dia_chi TEXT
);

CREATE TABLE nhan_vien (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(100),
    ma_chi_nhanh VARCHAR(50),
    FOREIGN KEY (ma_chi_nhanh) REFERENCES chi_nhanh(ma_chi_nhanh)
);

-- Bảng kế thừa từ Nhân Viên
CREATE TABLE nv_sale (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien)
);

CREATE TABLE quan_ly (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien)
);

CREATE TABLE nv_ke_toan (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien)
);

CREATE TABLE nv_phu_trach (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien)
);

CREATE TABLE dich_vu (
    ma_dich_vu VARCHAR(50) PRIMARY KEY,
    ten_dich_vu VARCHAR(255),
    don_gia DECIMAL(15,2),
    don_vi_tinh VARCHAR(50)
);

CREATE TABLE dich_vu_chi_nhanh(
    ma_dich_vu VARCHAR(50), 
    ma_chi_nhanh VARCHAR(50),
    PRIMARY KEY (ma_dich_vu, ma_chi_nhanh),
    FOREIGN KEY (ma_chi_nhanh) REFERENCES chi_nhanh(ma_chi_nhanh),
    FOREIGN KEY (ma_dich_vu) REFERENCES dich_vu(ma_dich_vu)
);

CREATE TABLE khach_hang (
    ma_khach_hang VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(255),
    sdt VARCHAR(20),
    cccd VARCHAR(20),
    gioi_tinh VARCHAR(20),
    email VARCHAR(100),
    ngay_sinh DATE,
    dia_chi TEXT
);

CREATE TABLE dieu_kien_thue (
    ma_dieu_kien VARCHAR(50) PRIMARY KEY,
    ten_dieu_kien VARCHAR(255),
    mo_ta TEXT
);

CREATE TABLE loai_thiet_bi (
    ma_loai_thiet_bi VARCHAR(50) PRIMARY KEY,
    ten_loai_thiet_bi VARCHAR(255),
    gia_tri_boi_thuong DECIMAL(15,2),
    quy_dinh_su_dung TEXT
);

-- =========================================================================
-- 2. TẠO CÁC BẢNG LIÊN QUAN ĐẾN CƠ SỞ VẬT CHẤT (PHÒNG, GIƯỜNG, THIẾT BỊ)
-- =========================================================================

CREATE TABLE phong (
    ma_phong VARCHAR(50) PRIMARY KEY,
    loai_phong VARCHAR(100),
    suc_chua_toi_da INT,
    gia_thue_phong DECIMAL(15,2),
    trang_thai VARCHAR(100),
    khu_vuc VARCHAR(100),
    gioi_tinh_ap_dung VARCHAR(50),
    ma_chi_nhanh VARCHAR(50),
    FOREIGN KEY (ma_chi_nhanh) REFERENCES chi_nhanh(ma_chi_nhanh)
);

CREATE TABLE phong_dieu_kien_thue(
    ma_phong VARCHAR(50), 
    ma_dieu_kien VARCHAR(50),
    PRIMARY KEY (ma_phong, ma_dieu_kien),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong),
    FOREIGN KEY (ma_dieu_kien) REFERENCES dieu_kien_thue(ma_dieu_kien)  
);

CREATE TABLE giuong (
    ma_giuong VARCHAR(50) PRIMARY KEY,
    gia_thue_giuong DECIMAL(15,2),
    trang_thai VARCHAR(100),
    ma_phong VARCHAR(50),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
);

-- =========================================================================
-- 3. QUY TRÌNH 1 & 2: ĐĂNG KÝ VÀ ĐẶT CỌC
-- =========================================================================

CREATE TABLE phieu_dang_ky (
    ma_phieu_dk VARCHAR(50) PRIMARY KEY,
    so_nguoi_du_kien INT,
    ngay_du_kien_vao DATE,
    trang_thai VARCHAR(100),
    hinh_thuc_thue VARCHAR(100),
    ngay_lap DATE,
    khu_vuc_mong_muon VARCHAR(100),
    ma_khach_hang VARCHAR(50), -- Đại diện
    ma_nv_sale VARCHAR(50),
    loai_phong VARCHAR(100),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_nv_sale) REFERENCES nv_sale(ma_nhan_vien)
);

-- Quan hệ M:N giữa PhieuDangKy và Giuong
CREATE TABLE phieu_dang_ky_giuong (
    ma_phieu_dk VARCHAR(50),
    ma_giuong VARCHAR(50),
    PRIMARY KEY (ma_phieu_dk, ma_giuong),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk),
    FOREIGN KEY (ma_giuong) REFERENCES giuong(ma_giuong)
);

CREATE TABLE hoa_don_coc (
    ma_hoa_don VARCHAR(50) PRIMARY KEY,
    ngay_lap DATE,
    so_tien_coc DECIMAL(15,2),
    trang_thai VARCHAR(100),
    thoi_gian_coc TIMESTAMP,
    ma_phieu_dk VARCHAR(50),
    ma_nv_ke_toan VARCHAR(50),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk),
    FOREIGN KEY (ma_nv_ke_toan) REFERENCES nv_ke_toan(ma_nhan_vien)
);

CREATE TABLE thong_tin_gd (
    ma_giao_dich VARCHAR(50) PRIMARY KEY,
    ma_chung_tu VARCHAR(100),
    so_tien_chuyen DECIMAL(15,2),
    noi_dung_tt TEXT,
    thoi_gian_tt TIMESTAMP,
    phuong_thuc_tt VARCHAR(100),
    ma_khach_hang VARCHAR(50),
    ma_hoa_don VARCHAR(50),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_hoa_don) REFERENCES hoa_don_coc(ma_hoa_don)
);


-- =========================================================================
-- 4. QUY TRÌNH 3: HỢP ĐỒNG VÀ BÀN GIAO
-- =========================================================================

CREATE TABLE hop_dong (
    ma_hop_dong VARCHAR(50) PRIMARY KEY,
    ngay_nhan_phong DATE,
    ky_thanh_toan VARCHAR(100),
    tien_ban_giao DECIMAL(15,2),
    ngay_lap DATE,
    trang_thai VARCHAR(100),
    ma_khach_hang VARCHAR(50),
    ma_hoa_don VARCHAR(50),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_hoa_don) REFERENCES hoa_don_coc(ma_hoa_don)
);

-- Quan hệ M:N giữa HopDong và DichVu
CREATE TABLE hop_dong_dich_vu (
    ma_hop_dong VARCHAR(50),
    ma_dich_vu VARCHAR(50),
    PRIMARY KEY (ma_hop_dong, ma_dich_vu),
    FOREIGN KEY (ma_hop_dong) REFERENCES hop_dong(ma_hop_dong),
    FOREIGN KEY (ma_dich_vu) REFERENCES dich_vu(ma_dich_vu)
);

-- Quan hệ M:N giữa HopDong và Giuong
CREATE TABLE hop_dong_giuong (
    ma_hop_dong VARCHAR(50),
    ma_giuong VARCHAR(50),
    PRIMARY KEY (ma_hop_dong, ma_giuong),
    FOREIGN KEY (ma_hop_dong) REFERENCES hop_dong(ma_hop_dong),
    FOREIGN KEY (ma_giuong) REFERENCES giuong(ma_giuong)
);

CREATE TABLE bien_ban_ban_giao (
    ma_bien_ban VARCHAR(50) PRIMARY KEY,
    ngay_ban_giao DATE,
    trang_thai VARCHAR(100),
    ma_hop_dong VARCHAR(50),
    ma_quan_ly VARCHAR(50),
    FOREIGN KEY (ma_hop_dong) REFERENCES hop_dong(ma_hop_dong),
    FOREIGN KEY (ma_quan_ly) REFERENCES quan_ly(ma_nhan_vien)
);

CREATE TABLE trang_thiet_bi (
    ma_trang_thiet_bi VARCHAR(50) PRIMARY KEY,
    tinh_trang VARCHAR(100),
    ma_loai_thiet_bi VARCHAR(50),
    ma_phong VARCHAR(50),
    FOREIGN KEY (ma_loai_thiet_bi) REFERENCES loai_thiet_bi(ma_loai_thiet_bi),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
);

-- =========================================================================
-- 5. QUY TRÌNH 4: TRẢ PHÒNG VÀ THANH TOÁN
-- =========================================================================

CREATE TABLE phieu_dang_ky_tra (
    ma_phieu_tra VARCHAR(50) PRIMARY KEY,
    ngay_lap DATE,
    ngay_du_kien_tra DATE,
    ly_do TEXT,
    trang_thai VARCHAR(100),
    ma_hop_dong VARCHAR(50),
    FOREIGN KEY (ma_hop_dong) REFERENCES hop_dong(ma_hop_dong)
);

CREATE TABLE phieu_kiem_tra (
    ma_phieu_kt VARCHAR(50) PRIMARY KEY,
    ngay_lap DATE,
    ma_phieu_tra VARCHAR(50),
    ma_quan_ly VARCHAR(50),
    FOREIGN KEY (ma_phieu_tra) REFERENCES phieu_dang_ky_tra(ma_phieu_tra),
    FOREIGN KEY (ma_quan_ly) REFERENCES quan_ly(ma_nhan_vien)
);

CREATE TABLE chi_tiet_khau_tru (
    ma_phieu_kt VARCHAR(50),
    loai_khau_tru VARCHAR(100),
    so_tien_phai_tra DECIMAL(15,2),
    mo_ta TEXT,
    PRIMARY KEY (ma_phieu_kt, loai_khau_tru),
    FOREIGN KEY (ma_phieu_kt) REFERENCES phieu_kiem_tra(ma_phieu_kt)
);

CREATE TABLE phieu_thanh_toan (
    ma_phieu_tt VARCHAR(50) PRIMARY KEY,
    ngay_lap DATE,
    hinh_thuc VARCHAR(100),
    trang_thai VARCHAR(100),
    ma_phieu_kt VARCHAR(50),
    ma_nv_ke_toan VARCHAR(50),
    FOREIGN KEY (ma_phieu_kt) REFERENCES phieu_kiem_tra(ma_phieu_kt),
    FOREIGN KEY (ma_nv_ke_toan) REFERENCES nv_ke_toan(ma_nhan_vien)
);

CREATE TABLE bien_ban_tra_phong (
    ma_bien_ban VARCHAR(50) PRIMARY KEY,
    ngay_lap DATE,
    ma_phieu_tra VARCHAR(50),
    FOREIGN KEY (ma_phieu_tra) REFERENCES phieu_dang_ky_tra(ma_phieu_tra)
);

-- =========================================================================
-- CHÚ Ý: BẢNG LIÊN KẾT NHIỀU-NHIỀU
-- =========================================================================
CREATE TABLE IF NOT EXISTS phieu_dang_ky_phong (
    ma_phieu_dk VARCHAR(50),
    ma_phong VARCHAR(50),
    PRIMARY KEY (ma_phieu_dk, ma_phong),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
);

CREATE TABLE IF NOT EXISTS phieu_dang_ky_khach_hang (
    ma_phieu_dk VARCHAR(50),
    ma_khach_hang VARCHAR(50),
    PRIMARY KEY (ma_phieu_dk, ma_khach_hang),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk) ON DELETE CASCADE,
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang) ON DELETE CASCADE
);

-- =========================================================================
-- 1. DỮ LIỆU DANH MỤC CƠ BẢN (Chi Nhánh, Nhân Viên, Dịch Vụ)
-- =========================================================================
INSERT INTO chi_nhanh VALUES 
('CN01', 'Ký túc xá Cơ sở 1', '227 Nguyễn Văn Cừ, Q5, TP.HCM'),
('CN02', 'Ký túc xá Cơ sở 2', 'Linh Trung, Thủ Đức, TP.HCM')
ON CONFLICT DO NOTHING;

INSERT INTO nhan_vien VALUES 
('NV01', 'Nguyễn Văn Sale', 'Nhân viên Sale', 'CN01'),
('NV02', 'Trần Thị Quản Lý', 'Quản lý', 'CN01'),
('NV03', 'Lê Văn Kế Toán', 'Kế toán', 'CN01'),
('NV04', 'Phạm Phụ Trách', 'Phụ trách cơ sở', 'CN01')
ON CONFLICT DO NOTHING;

INSERT INTO nv_sale VALUES ('NV01') ON CONFLICT DO NOTHING;
INSERT INTO quan_ly VALUES ('NV02') ON CONFLICT DO NOTHING;
INSERT INTO nv_ke_toan VALUES ('NV03') ON CONFLICT DO NOTHING;
INSERT INTO nv_phu_trach VALUES ('NV04') ON CONFLICT DO NOTHING;

-- =========================================================================
-- 2. DỮ LIỆU KHÁCH HÀNG
-- =========================================================================
INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, cccd, gioi_tinh, email) VALUES 
('KH001', 'Nguyễn Văn An', '0901111111', '079111111111', 'Nam', 'an@gmail.com'),
('KH002', 'Trần Thị Bình', '0902222222', '079222222222', 'Nữ', 'binh@gmail.com'),
('KH003', 'Lê Văn Cường', '0903333333', '079333333333', 'Nam', 'cuong@gmail.com'),
('KH004', 'Phạm Thị Dung', '0904444444', '079444444444', 'Nữ', 'dung@gmail.com'),
('KH005', 'Hoàng Văn Em', '0905555555', '079555555555', 'Nam', 'em@gmail.com')
ON CONFLICT (ma_khach_hang) DO UPDATE SET sdt = EXCLUDED.sdt, ho_ten = EXCLUDED.ho_ten;

-- =========================================================================
-- 3. DỮ LIỆU PHÒNG & GIƯỜNG
-- =========================================================================
INSERT INTO phong (ma_phong, loai_phong, suc_chua_toi_da, gia_thue_phong, trang_thai, khu_vuc, gioi_tinh_ap_dung, ma_chi_nhanh) VALUES 
('P101', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu A', 'Nam', 'CN01'), 
('P102', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu B', 'Nữ', 'CN01'),  
('P103', 'Phòng 2 người', 2, 4000000, 'Hết chỗ', 'Khu A', 'Nam', 'CN01'),   
('P201', 'Phòng 6 người', 6, 8000000, 'Còn trống', 'Khu C', 'Nữ', 'CN02')  
ON CONFLICT DO NOTHING;

INSERT INTO giuong (ma_giuong, gia_thue_giuong, trang_thai, ma_phong) VALUES 
('G101_1', 1500000, 'Trống', 'P101'),
('G101_2', 1500000, 'Trống', 'P101'),
('G101_3', 1500000, 'Trống', 'P101'),
('G101_4', 1500000, 'Trống', 'P101'),

('G102_1', 1500000, 'Đang sử dụng', 'P102'),
('G102_2', 1500000, 'Đang sử dụng', 'P102'),
('G102_3', 1500000, 'Trống', 'P102'),
('G102_4', 1500000, 'Trống', 'P102'),

('G103_1', 2000000, 'Đang sử dụng', 'P103'),
('G103_2', 2000000, 'Đang sử dụng', 'P103'),

('G201_1', 1500000, 'Trống', 'P201'),
('G201_2', 1500000, 'Trống', 'P201'),
('G201_3', 1500000, 'Trống', 'P201'),
('G201_4', 1500000, 'Trống', 'P201'),
('G201_5', 1500000, 'Trống', 'P201'),
('G201_6', 1500000, 'Trống', 'P201')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 4. DỮ LIỆU PHIẾU ĐĂNG KÝ
-- =========================================================================
INSERT INTO phieu_dang_ky (ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai, hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, ma_nv_sale) VALUES 
('PDK001', 1, '2026-06-01', 'Chờ chọn phòng', 'Ở ghép', '2026-05-10', 'Khu A', 'KH001', 'NV01'),
('PDK002', 2, '2026-05-15', 'Đã chọn phòng', 'Ở ghép', '2026-05-01', 'Khu B', 'KH002', 'NV01'),
('PDK003', 2, '2026-05-05', 'Đã chọn phòng', 'Thuê nguyên phòng', '2026-05-02', 'Khu A', 'KH003', 'NV01'),
('PDK004', 6, '2026-06-15', 'Chờ chọn phòng', 'Thuê nguyên phòng', '2026-05-12', 'Khu C', 'KH004', 'NV01')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 5. DỮ LIỆU LIÊN KẾT PHÒNG/GIƯỜNG VỚI PHIẾU ĐĂNG KÝ
-- =========================================================================
INSERT INTO phieu_dang_ky_giuong (ma_phieu_dk, ma_giuong) VALUES 
('PDK002', 'G102_1'),
('PDK002', 'G102_2')
ON CONFLICT DO NOTHING;

INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong) VALUES 
('PDK003', 'P103')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 6. DỮ LIỆU HÓA ĐƠN CỌC
-- =========================================================================
INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, ma_phieu_dk, ma_nv_ke_toan) VALUES 
('HDC001', '2026-05-10', 1000000, 'Đã thanh toán', 'PDK001', 'NV03'),
('HDC002', '2026-05-02', 3000000, 'Đã thanh toán', 'PDK002', 'NV03'),
('HDC003', '2026-05-03', 4000000, 'Đã thanh toán', 'PDK003', 'NV03'),
('HDC004', '2026-05-12', 5000000, 'Chờ xác nhận', 'PDK004', NULL)
ON CONFLICT DO NOTHING;