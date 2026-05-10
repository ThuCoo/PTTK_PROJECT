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
  role           VARCHAR(20)  NOT NULL CHECK (role IN ('nhan_vien', 'quan_ly', 'nv_sale', 'nv_phu_trach', 'nv_ke_toan', 'admin')),
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
    trang_thai_xem_xet VARCHAR(100) DEFAULT 'Chờ duyệt',
    phong_id_confirmed VARCHAR(50),
    ngay_xem_xet TIMESTAMP,
    ghi_chu_xem_xet TEXT,
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_nv_sale) REFERENCES nv_sale(ma_nhan_vien),
    FOREIGN KEY (phong_id_confirmed) REFERENCES phong(ma_phong) ON DELETE SET NULL
);

-- Quan hệ M:N giữa PhieuDangKy và Phong
CREATE TABLE phieu_dang_ky_phong (
    ma_phieu_dk VARCHAR(50),
    ma_phong VARCHAR(50),
    PRIMARY KEY (ma_phieu_dk, ma_phong),
    FOREIGN KEY (ma_phieu_dk) REFERENCES phieu_dang_ky(ma_phieu_dk),
    FOREIGN KEY (ma_phong) REFERENCES phong(ma_phong)
);

CREATE TABLE khach_hang_dieu_kien (
    id SERIAL PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL,
    khach_hang_id VARCHAR(50) NOT NULL,
    dieu_kien_id VARCHAR(50) NOT NULL,
    trang_thai VARCHAR(100) DEFAULT 'Đã duyệt',
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (ma_khach_hang, dieu_kien_id),
    UNIQUE (khach_hang_id, dieu_kien_id),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang) ON DELETE CASCADE,
    FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(ma_khach_hang) ON DELETE CASCADE,
    FOREIGN KEY (dieu_kien_id) REFERENCES dieu_kien_thue(ma_dieu_kien) ON DELETE CASCADE
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
('DK02', 'Giờ giới nghiêm', 'Ký túc xá đóng cửa lúc 23h00 mỗi ngày'),
('DK03', 'CCCD / hộ chiếu hợp lệ', 'Khách hàng có giấy tờ tùy thân hợp lệ'),
('DK04', 'Đủ sức chứa', 'Số người dự kiến phù hợp với sức chứa của phòng');

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

INSERT INTO khach_hang_dieu_kien (ma_khach_hang, khach_hang_id, dieu_kien_id, trang_thai, ghi_chu) VALUES
('KH01', 'KH01', 'DK03', 'Đã duyệt', NULL),
('KH01', 'KH01', 'DK04', 'Đã duyệt', NULL),
('KH02', 'KH02', 'DK03', 'Đã duyệt', NULL),
('KH02', 'KH02', 'DK04', 'Đã duyệt', NULL);

INSERT INTO giuong VALUES 
('G101_1', 1500000, 'Trống', 'P101'),
('G101_2', 1500000, 'Trống', 'P101'),
('G101_3', 1500000, 'Trống', 'P101'),
('G101_4', 1500000, 'Trống', 'P101'),
('G102_1', 2000000, 'Đã thuê', 'P102'),
('G102_2', 2000000, 'Đã thuê', 'P102');

-- 3. Dữ liệu Quy trình Đăng ký & Đặt Cọc (Khách KH01 muốn thuê phòng P102)
INSERT INTO phieu_dang_ky (
    ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai,
    hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, ma_nv_sale
) VALUES 
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

-- 5. Dữ liệu bổ sung cho màn hình rà soát điều kiện & tình trạng phòng
INSERT INTO khach_hang VALUES 
('KH_DK01', 'Nguyễn Văn An', '0901000001', '079100000001', 'Nam', 'an.nguyen@example.com'),
('KH_DK02', 'Trần Thị Bình', '0901000002', '079100000002', 'Nữ', 'binh.tran@example.com'),
('KH_DK03', 'Lê Minh Châu', '0901000003', '079100000003', 'Nam', 'chau.le@example.com'),
('KH_DK04', 'Phạm Thị Dung', '0901000004', '079100000004', 'Nữ', 'dung.pham@example.com');

INSERT INTO phong VALUES 
('PRV01', 'Phòng 4 người', 4, 1800000, 'Trống', 'Khu A', 'Nam', 'CN01'),
('PRV02', 'Phòng 2 người', 2, 2500000, 'Đang sử dụng', 'Khu B', 'Nữ', 'CN01'),
('PRV03', 'Phòng 4 người', 4, 2200000, 'Còn giường', 'Khu A', 'Nam', 'CN01'),
('PRV04', 'Phòng 6 người', 6, 3200000, 'Trống', 'Khu C', 'Nữ', 'CN01'),
('PRV05', 'Phòng 4 người', 4, 2100000, 'Còn giường', 'Khu A', 'Nam', 'CN01');

INSERT INTO phong_dieu_kien_thue VALUES 
('PRV01', 'DK03'), ('PRV01', 'DK04'),
('PRV02', 'DK03'),
('PRV03', 'DK03'), ('PRV03', 'DK04'),
('PRV04', 'DK03'),
('PRV05', 'DK03'), ('PRV05', 'DK04');

INSERT INTO khach_hang_dieu_kien (ma_khach_hang, khach_hang_id, dieu_kien_id, trang_thai, ghi_chu) VALUES
('KH_DK01', 'KH_DK01', 'DK03', 'Đã duyệt', NULL),
('KH_DK01', 'KH_DK01', 'DK04', 'Đã duyệt', NULL),
('KH_DK02', 'KH_DK02', 'DK03', 'Đã duyệt', NULL),
('KH_DK02', 'KH_DK02', 'DK04', 'Không hợp lệ', 'Giới tính không phù hợp với phòng'),
('KH_DK03', 'KH_DK03', 'DK03', 'Đã duyệt', NULL),
('KH_DK03', 'KH_DK03', 'DK04', 'Đã duyệt', NULL),
('KH_DK04', 'KH_DK04', 'DK03', 'Đã duyệt', NULL),
('KH_DK04', 'KH_DK04', 'DK04', 'Đã duyệt', NULL);

INSERT INTO phieu_dang_ky VALUES 
('PDK_DK01', 4, '2026-06-01', 'Chờ duyệt', 'Thuê nguyên phòng', '2026-05-10', 'Khu A', 'KH_DK01', 'NV01', 'Chờ duyệt', NULL, NULL, NULL),
('PDK_DK02', 2, '2026-06-05', 'Chờ duyệt', 'Ở ghép', '2026-05-11', 'Khu B', 'KH_DK02', 'NV01', 'Chờ duyệt', NULL, NULL, NULL),
('PDK_DK03', 4, '2026-06-10', 'Đã chọn phòng', 'Thuê nguyên phòng', '2026-05-12', 'Khu A', 'KH_DK03', 'NV01', 'Chờ duyệt', NULL, NULL, NULL),
('PDK_DK04', 6, '2026-06-15', 'Sẵn sàng ký', 'Thuê nguyên phòng', '2026-05-13', 'Khu C', 'KH_DK04', 'NV01', 'Chờ duyệt', NULL, NULL, NULL);

INSERT INTO phieu_dang_ky_phong VALUES 
('PDK_DK01', 'PRV01'),
('PDK_DK02', 'PRV02'),
('PDK_DK03', 'PRV03'),
('PDK_DK04', 'PRV04'),
('PDK_DK04', 'PRV05');

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