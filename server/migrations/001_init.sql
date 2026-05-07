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

CREATE TABLE ChiNhanh (
    MaChiNhanh VARCHAR(50) PRIMARY KEY,
    TenChiNhanh VARCHAR(255) NOT NULL,
    DiaChi TEXT
);

CREATE TABLE NhanVien (
    MaNhanVien VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(100),
    MaChiNhanh VARCHAR(50),
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh)
);

-- Bảng kế thừa từ Nhân Viên
CREATE TABLE NV_Sale (
    MaNhanVien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE QuanLy (
    MaNhanVien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE NV_KeToan (
    MaNhanVien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE NV_PhuTrach (
    MaNhanVien VARCHAR(50) PRIMARY KEY,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE DichVu (
    MaDichVu VARCHAR(50) PRIMARY KEY,
    TenDichVu VARCHAR(255),
    DonGia DECIMAL(15,2),
    DonViTinh VARCHAR(50)
);
CREATE TABLE DichVu_ChiNhanh(
    MaDichVu VARCHAR(50), 
    MaChiNhanh VARCHAR(50),
     PRIMARY KEY (MaDichVu, MaChiNhanh),
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh),
    FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu)
);

CREATE TABLE KhachHang (
    MaKhachHang VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(255),
    Sdt VARCHAR(20),
    CCCD VARCHAR(20),
    GioiTinh VARCHAR(20),
    Email VARCHAR(100)
);

CREATE TABLE DieuKienThue (
    MaDieuKien VARCHAR(50) PRIMARY KEY,
    TenDieuKien VARCHAR(255),
    MoTa TEXT
);

CREATE TABLE LoaiThietBi (
    MaLoaiThietBi VARCHAR(50) PRIMARY KEY,
    TenLoaiThietBi VARCHAR(255),
    GiaTriBoiThuong DECIMAL(15,2),
    QuyDinhSuDung TEXT
);

-- =========================================================================
-- 2. TẠO CÁC BẢNG LIÊN QUAN ĐẾN CƠ SỞ VẬT CHẤT (PHÒNG, GIƯỜNG, THIẾT BỊ)
-- =========================================================================

CREATE TABLE Phong (
    MaPhong VARCHAR(50) PRIMARY KEY,
    LoaiPhong VARCHAR(100),
    SucChuaToiDa INT,
    GiaThuePhong DECIMAL(15,2),
    TrangThai VARCHAR(100),
    KhuVuc VARCHAR(100),
    GioiTinhApDung VARCHAR(50),
    MaChiNhanh VARCHAR(50),
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh)
);
CREATE TABLE Phong_DieuKienThue(
    MaPhong VARCHAR(50), 
    MaDieuKien VARCHAR(50),
    PRIMARY KEY (MaPhong, MaDieuKien),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong),
    FOREIGN KEY (MaDieuKien) REFERENCES DieuKienThue(MaDieuKien)  
);

CREATE TABLE Giuong (
    MaGiuong VARCHAR(50) PRIMARY KEY, -- Giữ nguyên thiết kế nhưng bổ sung PK bắt buộc
    GiaThueGiuong DECIMAL(15,2),
    TrangThai VARCHAR(100),
    MaPhong VARCHAR(50),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);

-- =========================================================================
-- 3. QUY TRÌNH 1 & 2: ĐĂNG KÝ VÀ ĐẶT CỌC
-- =========================================================================

CREATE TABLE PhieuDangKy (
    MaPhieuDK VARCHAR(50) PRIMARY KEY,
    SoNguoiDuKien INT,
    NgayDuKienVao DATE,
    TrangThai VARCHAR(100),
    HinhThucThue VARCHAR(100),
    NgayLap DATE,
    KhuVucMongMuon VARCHAR(100),
    MaKhachHang VARCHAR(50), -- Đại diện
    MaNVSale VARCHAR(50),
    LoaiPhong VARCHAR(100),
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaNVSale) REFERENCES NV_Sale(MaNhanVien)
);

-- Quan hệ M:N giữa PhieuDangKy và Phong
CREATE TABLE PhieuDangKy_Giuong (
    MaPhieuDK VARCHAR(50),
    MaGiuong VARCHAR(50),

    PRIMARY KEY (MaPhieuDK, MaGiuong),
    FOREIGN KEY (MaPhieuDK) REFERENCES PhieuDangKy(MaPhieuDK),
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(Magiuong)
);
CREATE TABLE HoaDonCoc (
    MaHoaDon VARCHAR(50) PRIMARY KEY,
    NgayLap DATE,
    SoTienCoc DECIMAL(15,2),
    TrangThai VARCHAR(100),
    ThoiGianCoc TIMESTAMP,
    MaPhieuDK VARCHAR(50),
    MaNVKeToan VARCHAR(50),
    FOREIGN KEY (MaPhieuDK) REFERENCES PhieuDangKy(MaPhieuDK),
    FOREIGN KEY (MaNVKeToan) REFERENCES NV_KeToan(MaNhanVien)
);

CREATE TABLE ThongTinGD (
    MaGiaoDich VARCHAR(50) PRIMARY KEY,
    MaChungTu VARCHAR(100),
    SoTienChuyen DECIMAL(15,2),
    NoiDungTT TEXT,
    ThoiGianTT TIMESTAMP,
    PhuongThucTT VARCHAR(100),
    MaKhachHang VARCHAR(50),
    MaHoaDon VARCHAR(50),
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDonCoc(MaHoaDon)
);


-- =========================================================================
-- 4. QUY TRÌNH 3: HỢP ĐỒNG VÀ BÀN GIAO
-- =========================================================================

CREATE TABLE HopDong (
    MaHopDong VARCHAR(50) PRIMARY KEY,
    NgayNhanPhong DATE,
    KyThanhToan VARCHAR(100),
    TienBanGiao DECIMAL(15,2),
    NgayLap DATE,
    TrangThai VARCHAR(100),
    MaKhachHang VARCHAR(50),
    MaHoaDon VARCHAR(50),
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDonCoc(MaHoaDon)
);

-- Quan hệ M:N giữa HopDong và DichVu
CREATE TABLE HopDong_DichVu (
    MaHopDong VARCHAR(50),
    MaDichVu VARCHAR(50),
    PRIMARY KEY (MaHopDong, MaDichVu),
    FOREIGN KEY (MaHopDong) REFERENCES HopDong(MaHopDong),
    FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu)
);

-- Quan hệ M:N giữa HopDong và Giuong
CREATE TABLE HopDong_Giuong (
    MaHopDong VARCHAR(50),
    MaGiuong VARCHAR(50),
    PRIMARY KEY (MaHopDong, MaGiuong),
    FOREIGN KEY (MaHopDong) REFERENCES HopDong(MaHopDong),
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong)
);

CREATE TABLE BienBanBanGiao (
    MaBienBan VARCHAR(50) PRIMARY KEY,
    NgayBanGiao DATE,
    TrangThai VARCHAR(100),
    MaHopDong VARCHAR(50),
    MaQuanLy VARCHAR(50),
    FOREIGN KEY (MaHopDong) REFERENCES HopDong(MaHopDong),
    FOREIGN KEY (MaQuanLy) REFERENCES QuanLy(MaNhanVien)
);

CREATE TABLE TrangThietBi (
    MaTrangThietBi VARCHAR(50) PRIMARY KEY,
    TinhTrang VARCHAR(100),
    MaLoaiThietBi VARCHAR(50),
    MaPhong VARCHAR(50),
    FOREIGN KEY (MaLoaiThietBi) REFERENCES LoaiThietBi(MaLoaiThietBi),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);

-- =========================================================================
-- 5. QUY TRÌNH 4: TRẢ PHÒNG VÀ THANH TOÁN
-- =========================================================================

CREATE TABLE PhieuDangKyTra (
    MaPhieuTra VARCHAR(50) PRIMARY KEY,
    NgayLap DATE,
    NgayDuKienTra DATE,
    LyDo TEXT,
    TrangThai VARCHAR(100),
    MaHopDong VARCHAR(50),
    FOREIGN KEY (MaHopDong) REFERENCES HopDong(MaHopDong)
);

CREATE TABLE PhieuKiemTra (
    MaPhieuKT VARCHAR(50) PRIMARY KEY,
    NgayLap DATE,
    MaPhieuTra VARCHAR(50),
    MaQuanLy VARCHAR(50),
    FOREIGN KEY (MaPhieuTra) REFERENCES PhieuDangKyTra(MaPhieuTra),
    FOREIGN KEY (MaQuanLy) REFERENCES QuanLy(MaNhanVien)
);

CREATE TABLE ChiTietKhauTru (
    MaPhieuKT VARCHAR(50),
    LoaiKhauTru VARCHAR(100),
    SoTienPhaiTra DECIMAL(15,2),
    MoTa TEXT,
    PRIMARY KEY (MaPhieuKT, LoaiKhauTru), -- Composite Primary Key
    FOREIGN KEY (MaPhieuKT) REFERENCES PhieuKiemTra(MaPhieuKT)
);

CREATE TABLE PhieuThanhToan (
    MaPhieuTT VARCHAR(50) PRIMARY KEY,
    NgayLap DATE,
    HinhThuc VARCHAR(100),
    TrangThai VARCHAR(100),
    MaPhieuKT VARCHAR(50),
    MaNVKeToan VARCHAR(50),
    FOREIGN KEY (MaPhieuKT) REFERENCES PhieuKiemTra(MaPhieuKT),
    FOREIGN KEY (MaNVKeToan) REFERENCES NV_KeToan(MaNhanVien)
);

CREATE TABLE BienBanTraPhong (
    MaBienBan VARCHAR(50) PRIMARY KEY,
    NgayLap DATE,
    MaPhieuTra VARCHAR(50),
    FOREIGN KEY (MaPhieuTra) REFERENCES PhieuDangKyTra(MaPhieuTra)
);
-- =========================================================================
-- CHÚ Ý: NẾU BẠN CHƯA CÓ BẢNG PhieuDangKy_Phong, HÃY CHẠY LỆNH DƯỚI ĐÂY
CREATE TABLE IF NOT EXISTS PhieuDangKy_Phong (
    MaPhieuDK VARCHAR(50),
    MaPhong VARCHAR(50),
    PRIMARY KEY (MaPhieuDK, MaPhong),
    FOREIGN KEY (MaPhieuDK) REFERENCES PhieuDangKy(MaPhieuDK),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);
ALTER TABLE KhachHang ADD COLUMN IF NOT EXISTS NgaySinh DATE;
ALTER TABLE KhachHang ADD COLUMN IF NOT EXISTS DiaChi TEXT;

-- 2. Tạo bảng liên kết Nhiều-Nhiều giữa Phiếu Đăng Ký và Khách Hàng
CREATE TABLE IF NOT EXISTS PhieuDangKy_KhachHang (
    MaPhieuDK VARCHAR(50),
    MaKhachHang VARCHAR(50),
    PRIMARY KEY (MaPhieuDK, MaKhachHang),
    FOREIGN KEY (MaPhieuDK) REFERENCES PhieuDangKy(MaPhieuDK) ON DELETE CASCADE,
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang) ON DELETE CASCADE
);
-- =========================================================================

-- =========================================================================
-- 1. DỮ LIỆU DANH MỤC CƠ BẢN (Chi Nhánh, Nhân Viên, Dịch Vụ)
-- =========================================================================
INSERT INTO ChiNhanh VALUES 
('CN01', 'Ký túc xá Cơ sở 1', '227 Nguyễn Văn Cừ, Q5, TP.HCM'),
('CN02', 'Ký túc xá Cơ sở 2', 'Linh Trung, Thủ Đức, TP.HCM')
ON CONFLICT DO NOTHING;

INSERT INTO NhanVien VALUES 
('NV01', 'Nguyễn Văn Sale', 'Nhân viên Sale', 'CN01'),
('NV02', 'Trần Thị Quản Lý', 'Quản lý', 'CN01'),
('NV03', 'Lê Văn Kế Toán', 'Kế toán', 'CN01'),
('NV04', 'Phạm Phụ Trách', 'Phụ trách cơ sở', 'CN01')
ON CONFLICT DO NOTHING;

INSERT INTO NV_Sale VALUES ('NV01') ON CONFLICT DO NOTHING;
INSERT INTO QuanLy VALUES ('NV02') ON CONFLICT DO NOTHING;
INSERT INTO NV_KeToan VALUES ('NV03') ON CONFLICT DO NOTHING;
INSERT INTO NV_PhuTrach VALUES ('NV04') ON CONFLICT DO NOTHING;

-- =========================================================================
-- 2. DỮ LIỆU KHÁCH HÀNG (Đa dạng SĐT để test tìm kiếm Cọc)
-- =========================================================================
INSERT INTO KhachHang (MaKhachHang, HoTen, Sdt, CCCD, GioiTinh, Email) VALUES 
('KH001', 'Nguyễn Văn An', '0901111111', '079111111111', 'Nam', 'an@gmail.com'),
('KH002', 'Trần Thị Bình', '0902222222', '079222222222', 'Nữ', 'binh@gmail.com'),
('KH003', 'Lê Văn Cường', '0903333333', '079333333333', 'Nam', 'cuong@gmail.com'),
('KH004', 'Phạm Thị Dung', '0904444444', '079444444444', 'Nữ', 'dung@gmail.com'),
('KH005', 'Hoàng Văn Em', '0905555555', '079555555555', 'Nam', 'em@gmail.com')
ON CONFLICT (MaKhachHang) DO UPDATE SET Sdt = EXCLUDED.Sdt, HoTen = EXCLUDED.HoTen;

-- =========================================================================
-- 3. DỮ LIỆU PHÒNG & GIƯỜNG (Các kịch bản phòng khác nhau)
-- =========================================================================
INSERT INTO Phong (MaPhong, LoaiPhong, SucChuaToiDa, GiaThuePhong, TrangThai, KhuVuc, GioiTinhApDung, MaChiNhanh) VALUES 
('P101', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu A', 'Nam', 'CN01'), -- Phòng trống hoàn toàn
('P102', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu B', 'Nữ', 'CN01'),  -- Phòng Nữ, đang có 2 người ở (còn dư 2 giường)
('P103', 'Phòng 2 người', 2, 4000000, 'Hết chỗ', 'Khu A', 'Nam', 'CN01'),   -- Phòng đã Full
('P201', 'Phòng 6 người', 6, 8000000, 'Còn trống', 'Khu C', 'Nữ', 'CN02')  -- Phòng rộng cho nhóm
ON CONFLICT DO NOTHING;

INSERT INTO Giuong (MaGiuong, GiaThueGiuong, TrangThai, MaPhong) VALUES 
-- Giường P101 (Nam - Trống hết)
('G101_1', 1500000, 'Trống', 'P101'),
('G101_2', 1500000, 'Trống', 'P101'),
('G101_3', 1500000, 'Trống', 'P101'),
('G101_4', 1500000, 'Trống', 'P101'),

-- Giường P102 (Nữ - Có 2 người đang ở, dư 2 chỗ)
('G102_1', 1500000, 'Đang sử dụng', 'P102'),
('G102_2', 1500000, 'Đang sử dụng', 'P102'),
('G102_3', 1500000, 'Trống', 'P102'),
('G102_4', 1500000, 'Trống', 'P102'),

-- Giường P103 (Nam - Full)
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
-- 4. DỮ LIỆU PHIẾU ĐĂNG KÝ (Test UI Xếp Phòng/Giường)
-- =========================================================================
INSERT INTO PhieuDangKy (MaPhieuDK, SoNguoiDuKien, NgayDuKienVao, TrangThai, HinhThucThue, NgayLap, KhuVucMongMuon, MaKhachHang, MaNVSale) VALUES 
-- Test case 1: Nam, muốn ở ghép -> Cần xếp vào P101
('PDK001', 1, '2026-06-01', 'Chờ chọn phòng', 'Ở ghép', '2026-05-10', 'Khu A', 'KH001', 'NV01'),

-- Test case 2: Nữ, đã được xếp vào P102 (Đang sử dụng G102_1 và G102_2)
('PDK002', 2, '2026-05-15', 'Đã chọn phòng', 'Ở ghép', '2026-05-01', 'Khu B', 'KH002', 'NV01'),

-- Test case 3: Nam, đã thuê nguyên phòng P103
('PDK003', 2, '2026-05-05', 'Đã chọn phòng', 'Thuê nguyên phòng', '2026-05-02', 'Khu A', 'KH003', 'NV01'),

-- Test case 4: Nữ, đăng ký nguyên phòng 6 người (P201) -> Chờ chọn
('PDK004', 6, '2026-06-15', 'Chờ chọn phòng', 'Thuê nguyên phòng', '2026-05-12', 'Khu C', 'KH004', 'NV01')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 5. DỮ LIỆU LIÊN KẾT PHÒNG/GIƯỜNG VỚI PHIẾU ĐĂNG KÝ
-- =========================================================================
-- Liên kết cho PDK002 (Nữ ở ghép P102)
INSERT INTO PhieuDangKy_Giuong (MaPhieuDK, MaGiuong) VALUES 
('PDK002', 'G102_1'),
('PDK002', 'G102_2')
ON CONFLICT DO NOTHING;

-- Liên kết cho PDK003 (Thuê nguyên phòng P103)
INSERT INTO PhieuDangKy_Phong (MaPhieuDK, MaPhong) VALUES 
('PDK003', 'P103')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 6. DỮ LIỆU HÓA ĐƠN CỌC (Để test màn hình tra cứu cọc qua SĐT)
-- =========================================================================
INSERT INTO HoaDonCoc (MaHoaDon, NgayLap, SoTienCoc, TrangThai, MaPhieuDK, MaNVKeToan) VALUES 
-- HDC001: Khách KH001 (0901111111) - Chờ chọn phòng, nhưng đã cọc giữ chỗ
('HDC001', '2026-05-10', 1000000, 'Đã thanh toán', 'PDK001', 'NV03'),

-- HDC002: Khách KH002 (0902222222) - Đã có phòng P102, cọc 2 giường
('HDC002', '2026-05-02', 3000000, 'Đã thanh toán', 'PDK002', 'NV03'),

-- HDC003: Khách KH003 (0903333333) - Thuê nguyên phòng P103
('HDC003', '2026-05-03', 4000000, 'Đã thanh toán', 'PDK003', 'NV03'),

-- HDC004: Khách KH004 (0904444444) - Mới đăng ký, chưa cọc xong
('HDC004', '2026-05-12', 5000000, 'Chờ xác nhận', 'PDK004', NULL)
ON CONFLICT DO NOTHING;