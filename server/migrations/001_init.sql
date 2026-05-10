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
    ma_chung_tu TEXT,
    so_tien_chuyen DECIMAL(15,2),
    noi_dung_tt TEXT,
    thoi_gian_tt TIMESTAMP,
    phuong_thuc_tt VARCHAR(100),
    ma_khach_hang VARCHAR(50),
    ma_hoa_don VARCHAR(50),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_hoa_don) REFERENCES hoa_don_coc(ma_hoa_don)
);
-- ALTER TABLE thong_tin_gd ALTER COLUMN ma_chung_tu TYPE TEXT; ;


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

-- ============================================================
--  HomeStay Dorm — PostgreSQL Schema & Seed Data (FULL TEST DATA)
-- ============================================================

-- BỎ QUA PHẦN CREATE TABLE ĐÃ CÓ (BẠN GIỮ NGUYÊN CODE TẠO BẢNG CỦA BẠN BÊN TRÊN)
-- CHỈ CẦN THÊM BẢNG NÀY VÀO TRƯỚC KHI CHẠY INSERT DATA:

CREATE TABLE IF NOT EXISTS hop_dong_phong (
    ma_hop_dong VARCHAR(50),
    ma_phong VARCHAR(50),
    PRIMARY KEY (ma_hop_dong, ma_phong),
    FOREIGN KEY (ma_hop_dong) REFERENCES hop_dong(ma_hop_dong),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
);

-- BẮT ĐẦU XÓA DATA CŨ ĐỂ KHÔNG BỊ TRÙNG LẶP (Chạy trong môi trường test)
TRUNCATE TABLE chi_tiet_khau_tru, phieu_thanh_toan, bien_ban_tra_phong, phieu_kiem_tra, phieu_dang_ky_tra, trang_thiet_bi, bien_ban_ban_giao, hop_dong_giuong, hop_dong_phong, hop_dong_dich_vu, hop_dong, thong_tin_gd, hoa_don_coc, phieu_dang_ky_giuong, phieu_dang_ky_phong, phieu_dang_ky_khach_hang, phieu_dang_ky, giuong, phong_dieu_kien_thue, phong, loai_thiet_bi, dieu_kien_thue, khach_hang, dich_vu_chi_nhanh, dich_vu, nv_phu_trach, nv_ke_toan, quan_ly, nv_sale, nhan_vien, chi_nhanh CASCADE;

-- =========================================================================
-- 1. DANH MỤC CƠ BẢN (Chi Nhánh, Nhân Viên, Dịch Vụ, Điều kiện)
-- =========================================================================
INSERT INTO chi_nhanh VALUES 
('CN01', 'KTX Cơ sở Quận 5', '227 Nguyễn Văn Cừ, Q5, TP.HCM'),
('CN02', 'KTX Cơ sở Thủ Đức', 'Linh Trung, Thủ Đức, TP.HCM');

INSERT INTO nhan_vien VALUES 
('NV01', 'Nguyễn Văn Sale', 'Nhân viên Sale', 'CN01'),
('NV02', 'Trần Thị Quản Lý', 'Quản lý', 'CN01'),
('NV03', 'Lê Văn Kế Toán', 'Kế toán', 'CN01'),
('NV04', 'Phạm Phụ Trách', 'Phụ trách cơ sở', 'CN02');

INSERT INTO nv_sale VALUES ('NV01');
INSERT INTO quan_ly VALUES ('NV02');
INSERT INTO nv_ke_toan VALUES ('NV03');
INSERT INTO nv_phu_trach VALUES ('NV04');

INSERT INTO dich_vu VALUES 
('DV01', 'Điện sinh hoạt', 3500, 'kWh'),
('DV02', 'Nước sinh hoạt', 100000, 'Người/Tháng'),
('DV03', 'Wifi tốc độ cao', 50000, 'Người/Tháng'),
('DV04', 'Gửi xe máy', 150000, 'Chiếc/Tháng'),
('DV05', 'Dọn phòng 1 lần/tuần', 200000, 'Phòng/Tháng');

-- Add dịch vụ cho cả 2 chi nhánh
INSERT INTO dich_vu_chi_nhanh (ma_dich_vu, ma_chi_nhanh)
SELECT d.ma_dich_vu, c.ma_chi_nhanh FROM dich_vu d CROSS JOIN chi_nhanh c;

INSERT INTO dieu_kien_thue VALUES 
('DK01', 'Không nuôi thú cưng', 'Tuyệt đối không mang chó, mèo, bò sát vào khu vực chung và phòng ở.'),
('DK02', 'Giờ giới nghiêm', 'Không làm ồn sau 22h00 đêm để đảm bảo sinh hoạt chung.'),
('DK03', 'Vệ sinh chung', 'Đổ rác đúng nơi quy định mỗi ngày.');

-- =========================================================================
-- 2. KHÁCH HÀNG (Tạo 15 khách để gán vào các phòng)
-- =========================================================================
INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, cccd, gioi_tinh, email, ngay_sinh) VALUES 
('KH001', 'Lê Đại Diện (Phòng P101)', '0901111111', '079111111111', 'Nam', 'kh1@g.com', '2000-01-01'),
('KH002', 'Nguyễn Bạn Cùng Phòng P101', '0902222222', '079222222222', 'Nam', 'kh2@g.com', '2000-02-02'),
('KH003', 'Trần Đại Diện (Giường P102)', '0903333333', '079333333333', 'Nữ', 'kh3@g.com', '2001-03-03'),
('KH004', 'Phạm Bạn Cùng P102', '0904444444', '079444444444', 'Nữ', 'kh4@g.com', '2001-04-04'),
('KH005', 'Hoàng Đại Diện (Phòng P103)', '0905555555', '079555555555', 'Nam', 'kh5@g.com', '1999-05-05'),
('KH006', 'Vũ Bạn Cùng P103', '0906666666', '079666666666', 'Nam', 'kh6@g.com', '1999-06-06'),
('KH007', 'Đặng Đại Diện (Cọc P201)', '0907777777', '079777777777', 'Nữ', 'kh7@g.com', '2002-07-07'),
('KH008', 'Bùi Tư Vấn (Chưa QĐ)', '0908888888', '079888888888', 'Nam', 'kh8@g.com', '2003-08-08'),
('KH009', 'Đỗ Hủy Cọc', '0909999999', '079999999999', 'Nữ', 'kh9@g.com', '2000-09-09'),
('KH010', 'Hồ Mới Tư Vấn', '0910101010', '079010101010', 'Nam', 'kh10@g.com', '2004-10-10');

-- =========================================================================
-- 3. PHÒNG VÀ GIƯỜNG (10 Phòng chia 3 loại, 2 Chi nhánh)
-- =========================================================================
-- CN01: 5 Phòng
INSERT INTO phong VALUES 
('P101', 'Phòng 2 người', 2, 4000000, 'Hết giường', 'Khu A', 'Nam', 'CN01'), -- Nguyên phòng, Đang ở
('P102', 'Phòng 4 người', 4, 6000000, 'Còn giường', 'Khu A', 'Nữ', 'CN01'),  -- Ở ghép, 2 người đang ở
('P103', 'Phòng 2 người', 2, 4000000, 'Hết giường', 'Khu B', 'Nam', 'CN01'), -- Đang ở nhưng đòi Trả phòng
('P104', 'Phòng 4 người', 4, 6000000, 'Còn giường', 'Khu B', 'Nam', 'CN01'), -- Trống
('P105', 'Phòng 6 người', 6, 8000000, 'Còn giường', 'Khu C', 'Nữ', 'CN01');  -- Trống

-- CN02: 5 Phòng
INSERT INTO phong VALUES 
('P201', 'Phòng 2 người', 2, 3500000, 'Còn giường', 'Khu A', 'Nữ', 'CN02'),  -- Đã cọc 1 giường
('P202', 'Phòng 4 người', 4, 5500000, 'Còn giường', 'Khu A', 'Nam', 'CN02'), -- Trống
('P203', 'Phòng 4 người', 4, 5500000, 'Còn giường', 'Khu B', 'Nữ', 'CN02'),  -- Trống
('P204', 'Phòng 6 người', 6, 7500000, 'Còn giường', 'Khu C', 'Nam', 'CN02'), -- Trống
('P205', 'Phòng 6 người', 6, 7500000, 'Còn giường', 'Khu C', 'Nữ', 'CN02');  -- Trống

-- Apply Condition cho tất cả các phòng
INSERT INTO phong_dieu_kien_thue (ma_phong, ma_dieu_kien)
SELECT p.ma_phong, d.ma_dieu_kien FROM phong p CROSS JOIN dieu_kien_thue d;

-- Tạo Giường (Trống, Đã cọc, Đang sử dụng tương ứng với trạng thái phòng)
INSERT INTO giuong (ma_giuong, gia_thue_giuong, trang_thai, ma_phong) VALUES 
-- P101 (Sức chứa 2 - Đã thuê nguyên phòng)
('G101_1', 2000000, 'Đang sử dụng', 'P101'), 
('G101_2', 2000000, 'Đang sử dụng', 'P101'),

-- P102 (Sức chứa 4 - Đang ở ghép 2 người, trống 2)
('G102_1', 1500000, 'Đang sử dụng', 'P102'), 
('G102_2', 1500000, 'Đang sử dụng', 'P102'),
('G102_3', 1500000, 'Trống', 'P102'), 
('G102_4', 1500000, 'Trống', 'P102'),

-- P103 (Sức chứa 2 - Đang ở đầy, sắp trả phòng)
('G103_1', 2000000, 'Đang sử dụng', 'P103'), 
('G103_2', 2000000, 'Đang sử dụng', 'P103'),

-- P104 (Sức chứa 4 - Phòng Nam trống hoàn toàn)
('G104_1', 1500000, 'Trống', 'P104'), 
('G104_2', 1500000, 'Trống', 'P104'), 
('G104_3', 1500000, 'Trống', 'P104'), 
('G104_4', 1500000, 'Trống', 'P104'),

-- P105 (Sức chứa 6 - Phòng Nữ trống hoàn toàn)
('G105_1', 1350000, 'Trống', 'P105'), 
('G105_2', 1350000, 'Trống', 'P105'), 
('G105_3', 1350000, 'Trống', 'P105'), 
('G105_4', 1350000, 'Trống', 'P105'),
('G105_5', 1350000, 'Trống', 'P105'),
('G105_6', 1350000, 'Trống', 'P105'),

-- P201 (Sức chứa 2 - Đã cọc 1 chỗ)
('G201_1', 1750000, 'Đã cọc', 'P201'), 
('G201_2', 1750000, 'Trống', 'P201'),

-- P202 (Sức chứa 4 - Trống)
('G202_1', 1375000, 'Trống', 'P202'), 
('G202_2', 1375000, 'Trống', 'P202'), 
('G202_3', 1375000, 'Trống', 'P202'), 
('G202_4', 1375000, 'Trống', 'P202'),

-- P203 (Sức chứa 4 - Trống)
('G203_1', 1375000, 'Trống', 'P203'), 
('G203_2', 1375000, 'Trống', 'P203'), 
('G203_3', 1375000, 'Trống', 'P203'), 
('G203_4', 1375000, 'Trống', 'P203'),

-- P204 (Sức chứa 6 - Trống)
('G204_1', 1250000, 'Trống', 'P204'), 
('G204_2', 1250000, 'Trống', 'P204'), 
('G204_3', 1250000, 'Trống', 'P204'), 
('G204_4', 1250000, 'Trống', 'P204'),
('G204_5', 1250000, 'Trống', 'P204'),
('G204_6', 1250000, 'Trống', 'P204'),

-- P205 (Sức chứa 6 - Trống)
('G205_1', 1250000, 'Trống', 'P205'), 
('G205_2', 1250000, 'Trống', 'P205'), 
('G205_3', 1250000, 'Trống', 'P205'), 
('G205_4', 1250000, 'Trống', 'P205'),
('G205_5', 1250000, 'Trống', 'P205'),
('G205_6', 1250000, 'Trống', 'P205')
ON CONFLICT (ma_giuong) DO NOTHING;

-- =========================================================================
-- 4. KỊCH BẢN NGHIỆP VỤ (PHIẾU ĐK -> HÓA ĐƠN -> HỢP ĐỒNG)
-- =========================================================================

-- KỊCH BẢN 1: Thuê NGUYÊN PHÒNG (P101 - 2 người) -> Đang hiệu lực
INSERT INTO phieu_dang_ky VALUES ('PDK001', 2, '2023-01-01', 'Đã chọn phòng', 'Thuê nguyên phòng', '2022-12-25', 'Khu A', 'KH001', 'NV01', 'Phòng 2 người');
INSERT INTO phieu_dang_ky_phong VALUES ('PDK001', 'P101');
INSERT INTO phieu_dang_ky_khach_hang VALUES ('PDK001', 'KH001'), ('PDK001', 'KH002');
INSERT INTO hoa_don_coc VALUES ('HDC001', '2022-12-26', 4000000, 'Đã xác nhận', '2022-12-26 10:00:00', 'PDK001', 'NV03');
INSERT INTO hop_dong VALUES ('HD001', '2023-01-01', 'Hàng tháng', 500000, '2022-12-28', 'Đang hiệu lực', 'KH001', 'HDC001');
INSERT INTO hop_dong_phong VALUES ('HD001', 'P101'); -- <=== SỰ NHẤT QUÁN
INSERT INTO hop_dong_dich_vu VALUES ('HD001', 'DV01'), ('HD001', 'DV02'), ('HD001', 'DV03');
INSERT INTO bien_ban_ban_giao VALUES ('BB001', '2023-01-01', 'Đã bàn giao', 'HD001', 'NV02');


-- KỊCH BẢN 2: THUÊ Ở GHÉP (P102 - Thuê 2 giường) -> Đang hiệu lực
INSERT INTO phieu_dang_ky VALUES ('PDK002', 2, '2023-02-01', 'Đã chọn phòng', 'Ở ghép', '2023-01-20', 'Khu A', 'KH003', 'NV01', 'Phòng 4 người');
INSERT INTO phieu_dang_ky_giuong VALUES ('PDK002', 'G102_1'), ('PDK002', 'G102_2');
INSERT INTO phieu_dang_ky_khach_hang VALUES ('PDK002', 'KH003'), ('PDK002', 'KH004');
INSERT INTO hoa_don_coc VALUES ('HDC002', '2023-01-21', 3000000, 'Đã xác nhận', '2023-01-21 14:00:00', 'PDK002', 'NV03');
INSERT INTO hop_dong VALUES ('HD002', '2023-02-01', 'Hàng quý', 1000000, '2023-01-25', 'Đang hiệu lực', 'KH003', 'HDC002');
INSERT INTO hop_dong_giuong VALUES ('HD002', 'G102_1'), ('HD002', 'G102_2'); -- <=== SỰ NHẤT QUÁN
INSERT INTO hop_dong_dich_vu VALUES ('HD002', 'DV01'), ('HD002', 'DV02'), ('HD002', 'DV04');
INSERT INTO bien_ban_ban_giao VALUES ('BB002', '2023-02-01', 'Đã bàn giao', 'HD002', 'NV02');


-- KỊCH BẢN 3: ĐANG HIỆU LỰC NHƯNG CÓ "PHIẾU ĐĂNG KÝ TRẢ PHÒNG" (P103)
INSERT INTO phieu_dang_ky VALUES ('PDK003', 2, '2023-03-01', 'Đã chọn phòng', 'Thuê nguyên phòng', '2023-02-15', 'Khu B', 'KH005', 'NV01', 'Phòng 2 người');
INSERT INTO phieu_dang_ky_phong VALUES ('PDK003', 'P103');
INSERT INTO phieu_dang_ky_khach_hang VALUES ('PDK003', 'KH005'), ('PDK003', 'KH006');
INSERT INTO hoa_don_coc VALUES ('HDC003', '2023-02-16', 4000000, 'Đã xác nhận', '2023-02-16 09:00:00', 'PDK003', 'NV03');
INSERT INTO hop_dong VALUES ('HD003', '2023-03-01', 'Hàng tháng', 500000, '2023-02-20', 'Đang hiệu lực', 'KH005', 'HDC003');
INSERT INTO hop_dong_phong VALUES ('HD003', 'P103');
INSERT INTO hop_dong_dich_vu VALUES ('HD003', 'DV01'), ('HD003', 'DV02');
INSERT INTO bien_ban_ban_giao VALUES ('BB003', '2023-03-01', 'Đã bàn giao', 'HD003', 'NV02');
-- Khách tạo yêu cầu Trả phòng:
INSERT INTO phieu_dang_ky_tra VALUES ('PT001', '2023-10-01', '2023-10-15', 'Chuyển chỗ làm', 'Chờ kiểm tra', 'HD003');


-- KỊCH BẢN 4: ĐANG CỌC, CHỜ KÝ HỢP ĐỒNG (P201 - Thuê 1 giường)
INSERT INTO phieu_dang_ky VALUES ('PDK004', 1, '2024-06-01', 'Đã chọn phòng', 'Ở ghép', '2024-05-01', 'Khu A', 'KH007', 'NV01', 'Phòng 2 người');
INSERT INTO phieu_dang_ky_giuong VALUES ('PDK004', 'G201_1');
INSERT INTO phieu_dang_ky_khach_hang VALUES ('PDK004', 'KH007');
INSERT INTO hoa_don_coc VALUES ('HDC004', '2024-05-02', 1750000, 'Đang xử lý', '2024-05-02 16:30:00', 'PDK004', NULL); -- Kế toán chưa duyệt
INSERT INTO hop_dong VALUES ('HD004', '2024-06-01', 'Hàng tháng', 0, '2024-05-05', 'Chờ ký', 'KH007', 'HDC004');
INSERT INTO hop_dong_giuong VALUES ('HD004', 'G201_1');


-- KỊCH BẢN 5: ĐA DẠNG TRẠNG THÁI PHIẾU ĐĂNG KÝ (Consulting flow)
-- Chờ thanh toán cọc (Đã chọn giường nhưng chưa nạp tiền)
INSERT INTO phieu_dang_ky VALUES ('PDK005', 1, '2024-07-01', 'Đồng ý thuê', 'Ở ghép', '2024-05-08', 'Khu B', 'KH008', 'NV01', 'Phòng 4 người');
INSERT INTO hoa_don_coc VALUES ('HDC005', '2024-05-08', 1500000, 'Chờ thanh toán', NULL, 'PDK005', NULL);

-- Đang tư vấn
INSERT INTO phieu_dang_ky VALUES ('PDK006', 1, '2024-08-01', 'Đang tư vấn', 'Ở ghép', '2024-05-09', 'Khu C', 'KH010', 'NV01', 'Phòng 6 người');

-- Đã lên lịch xem phòng
INSERT INTO phieu_dang_ky VALUES ('PDK007', 2, '2024-08-15', 'Đã lên lịch xem phòng', 'Thuê nguyên phòng', '2024-05-10', 'Khu C', 'KH008', 'NV01', 'Phòng 2 người');

-- Hủy cọc (Không hợp lệ)
INSERT INTO phieu_dang_ky VALUES ('PDK008', 1, '2024-05-01', 'Không tiếp tục thuê', 'Ở ghép', '2024-04-01', 'Khu A', 'KH009', 'NV01', 'Phòng 4 người');
INSERT INTO hoa_don_coc VALUES ('HDC006', '2024-04-02', 1500000, 'Không hợp lệ', '2024-04-02 11:00:00', 'PDK008', 'NV03');

-- Chưa quyết định
INSERT INTO phieu_dang_ky VALUES ('PDK009', 1, '2024-09-01', 'Chưa quyết định', 'Ở ghép', '2024-05-11', 'Khu A', 'KH010', 'NV01', 'Phòng 4 người');
-- 1. TẠO BẢNG LỊCH XEM PHÒNG
CREATE TABLE IF NOT EXISTS lich_xem_phong (
    id SERIAL PRIMARY KEY,
    ngay_xem DATE NOT NULL,
    gio_xem TIME NOT NULL,
    trang_thai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    ghi_chu TEXT,
    ma_phieu_dk VARCHAR(50),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk)
);

-- 2. INSERT DỮ LIỆU LỊCH XEM CHO HÔM NAY (Dùng CURRENT_DATE)
INSERT INTO lich_xem_phong (ngay_xem, gio_xem, trang_thai, ma_phieu_dk) VALUES
(CURRENT_DATE, '09:00', 'Đã xác nhận', 'PDK001'), 
(CURRENT_DATE, '14:30', 'Chờ xác nhận', 'PDK003')
ON CONFLICT DO NOTHING;

-- 3. INSERT DỮ LIỆU GIAO DỊCH (Để tính doanh thu tháng hiện tại)
INSERT INTO thong_tin_gd (ma_giao_dich, ma_chung_tu, so_tien_chuyen, noi_dung_tt, thoi_gian_tt, phuong_thuc_tt, ma_khach_hang, ma_hoa_don) VALUES
('GD001', 'CK_001', 4000000, 'Thanh toán cọc phòng P101', CURRENT_TIMESTAMP, 'Chuyển khoản', 'KH001', 'HDC001'),
('GD002', 'CK_002', 3000000, 'Thanh toán cọc phòng P102', CURRENT_TIMESTAMP, 'Tiền mặt', 'KH003', 'HDC002')
ON CONFLICT DO NOTHING;