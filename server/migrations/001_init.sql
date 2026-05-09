DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Loop through all tables in the 'public' schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Execute DROP TABLE with CASCADE to handle foreign key dependencies
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

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
    email VARCHAR(100)
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
    ma_khach_hang VARCHAR(50),
    ma_nv_sale VARCHAR(50),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_nv_sale) REFERENCES nv_sale(ma_nhan_vien)
);

-- Quan hệ M:N giữa PhieuDangKy và Phong
CREATE TABLE phieu_dang_ky_phong (
    ma_phieu_dk VARCHAR(50),
    ma_phong VARCHAR(50),
    PRIMARY KEY (ma_phieu_dk, ma_phong),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
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
INSERT INTO chi_nhanh VALUES 
('CN01', 'Ký túc xá Cơ sở 1', '227 Nguyễn Văn Cừ, Q5, TP.HCM'),
('CN02', 'Ký túc xá Cơ sở 2', 'Linh Trung, Thủ Đức, TP.HCM');

INSERT INTO nhan_vien VALUES 
('NV01', 'Nguyễn Văn Sale', 'Nhân viên Sale', 'CN01'),
('NV02', 'Trần Thị Quản Lý', 'Quản lý', 'CN01'),
('NV03', 'Lê Văn Kế Toán', 'Kế toán', 'CN01'),
('NV04', 'Phạm Phụ Trách', 'Phụ trách cơ sở', 'CN01');

INSERT INTO nv_sale VALUES ('NV01');
INSERT INTO quan_ly VALUES ('NV02');
INSERT INTO nv_ke_toan VALUES ('NV03');
INSERT INTO nv_phu_trach VALUES ('NV04');

INSERT INTO khach_hang VALUES 
('KH01', 'Nguyễn Thị Sinh Viên', '0901234567', '079123456789', 'Nữ', 'sinhvien1@fit.hcmus.edu.vn'),
('KH02', 'Trần Văn Sinh Viên', '0987654321', '079987654321', 'Nam', 'sinhvien2@fit.hcmus.edu.vn');

INSERT INTO dich_vu VALUES 
('DV01', 'Tiền điện', 3500, 'kWh'),
('DV02', 'Tiền nước', 20000, 'Khối'),
('DV03', 'Wifi', 100000, 'Tháng'),
('DV04', 'Giữ xe máy', 150000, 'Tháng');

INSERT INTO dich_vu_chi_nhanh VALUES 
('DV01', 'CN01'), ('DV02', 'CN01'), ('DV03', 'CN01'), ('DV04', 'CN01');

INSERT INTO dieu_kien_thue VALUES 
('DK01', 'Không hút thuốc', 'Tuyệt đối cấm hút thuốc trong phòng và hành lang'),
('DK02', 'Giờ giới nghiêm', 'Ký túc xá đóng cửa lúc 23h00 mỗi ngày');

INSERT INTO loai_thiet_bi VALUES 
('LTB01', 'Giường tầng sắt', 1500000, 'Không chạy nhảy trên giường'),
('LTB02', 'Tủ lạnh mini', 3000000, 'Thường xuyên vệ sinh xả đá'),
('LTB03', 'Máy lạnh Daikin 1HP', 8000000, 'Chỉ mở 26 độ trở lên');

-- 2. Dữ liệu Phòng và Giường
INSERT INTO phong VALUES 
('P101', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu A', 'Nam', 'CN01'),
('P102', 'Phòng 2 người', 2, 4000000, 'Đang thuê', 'Khu B', 'Nữ', 'CN01'),
('P103', 'Phòng 4 người', 4, 6000000, 'Bảo trì', 'Khu A', 'Nam', 'CN01');

INSERT INTO phong_dieu_kien_thue VALUES 
('P101', 'DK01'), ('P101', 'DK02'),
('P102', 'DK01');

INSERT INTO giuong VALUES 
('G101_1', 1500000, 'Trống', 'P101'),
('G101_2', 1500000, 'Trống', 'P101'),
('G101_3', 1500000, 'Trống', 'P101'),
('G101_4', 1500000, 'Trống', 'P101'),
('G102_1', 2000000, 'Đã thuê', 'P102'),
('G102_2', 2000000, 'Đã thuê', 'P102');

-- 3. Dữ liệu Quy trình Đăng ký & Đặt Cọc (Khách KH01 muốn thuê phòng P102)
INSERT INTO phieu_dang_ky VALUES 
('PDK01', 1, '2026-05-15', 'Chờ xác nhận', 'Ở ghép', '2026-05-01', 'Khu B', 'KH01', 'NV01');

INSERT INTO phieu_dang_ky_phong VALUES ('PDK01', 'P102');

INSERT INTO hoa_don_coc VALUES 
('HDC01', '2026-05-02', 2000000, 'Đã thanh toán', '2026-05-02 14:30:00', 'PDK01', 'NV03');

INSERT INTO thong_tin_gd VALUES 
('GD01', 'CT_MOMO_98765', 2000000, 'Thanh toan coc giuong G102_1', '2026-05-02 14:25:00', 'Chuyển khoản', 'KH01', 'HDC01');

-- 4. Dữ liệu Quy trình Hợp Đồng & Bàn Giao
INSERT INTO hop_dong VALUES 
('HD01', '2026-05-15', 'Hàng tháng', 2000000, '2026-05-15', 'Đang hiệu lực', 'KH01', 'HDC01');

INSERT INTO hop_dong_dich_vu VALUES 
('HD01', 'DV01'), ('HD01', 'DV02'), ('HD01', 'DV03');

INSERT INTO hop_dong_giuong VALUES 
('HD01', 'G102_1');

INSERT INTO bien_ban_ban_giao VALUES 
('BBBG01', '2026-05-15', 'Đã bàn giao', 'HD01', 'NV02');

INSERT INTO trang_thiet_bi VALUES 
('TTB01', 'Đang sử dụng tốt', 'LTB01', 'P102'),
('TTB02', 'Hơi cũ', 'LTB02', 'P102'),
('TTB03', 'Mới 100%', 'LTB03', 'P102');

-- 5. Dữ liệu Quy trình Trả Phòng (Giả sử 1 năm sau khách KH01 trả)
INSERT INTO phieu_dang_ky_tra VALUES 
('PT01', '2027-05-01', '2027-05-15', 'Tốt nghiệp', 'Chờ xử lý', 'HD01');

INSERT INTO phieu_kiem_tra VALUES 
('PKT01', '2027-05-15', 'PT01', 'NV02');

INSERT INTO chi_tiet_khau_tru VALUES 
('PKT01', 'Hư hỏng thiết bị', 200000, 'Làm xước cánh tủ lạnh LTB02'),
('PKT01', 'Tiện ích nợ', 50000, 'Tiền điện tháng cuối');

INSERT INTO phieu_thanh_toan VALUES 
('PTT01', '2027-05-16', 'Chuyển khoản', 'Đã hoàn tất', 'PKT01', 'NV03');

INSERT INTO bien_ban_tra_phong VALUES 
('BBTP01', '2027-05-16', 'PT01');