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
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaNVSale) REFERENCES NV_Sale(MaNhanVien)
);

-- Quan hệ M:N giữa PhieuDangKy và Phong
CREATE TABLE PhieuDangKy_Phong (
    MaPhieuDK VARCHAR(50),
    MaPhong VARCHAR(50),
    PRIMARY KEY (MaPhieuDK, MaPhong),
    FOREIGN KEY (MaPhieuDK) REFERENCES PhieuDangKy(MaPhieuDK),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
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
INSERT INTO ChiNhanh VALUES 
('CN01', 'Ký túc xá Cơ sở 1', '227 Nguyễn Văn Cừ, Q5, TP.HCM'),
('CN02', 'Ký túc xá Cơ sở 2', 'Linh Trung, Thủ Đức, TP.HCM');

INSERT INTO NhanVien VALUES 
('NV01', 'Nguyễn Văn Sale', 'Nhân viên Sale', 'CN01'),
('NV02', 'Trần Thị Quản Lý', 'Quản lý', 'CN01'),
('NV03', 'Lê Văn Kế Toán', 'Kế toán', 'CN01'),
('NV04', 'Phạm Phụ Trách', 'Phụ trách cơ sở', 'CN01');

INSERT INTO NV_Sale VALUES ('NV01');
INSERT INTO QuanLy VALUES ('NV02');
INSERT INTO NV_KeToan VALUES ('NV03');
INSERT INTO NV_PhuTrach VALUES ('NV04');

INSERT INTO KhachHang VALUES 
('KH01', 'Nguyễn Thị Sinh Viên', '0901234567', '079123456789', 'Nữ', 'sinhvien1@fit.hcmus.edu.vn'),
('KH02', 'Trần Văn Sinh Viên', '0987654321', '079987654321', 'Nam', 'sinhvien2@fit.hcmus.edu.vn');

INSERT INTO DichVu VALUES 
('DV01', 'Tiền điện', 3500, 'kWh'),
('DV02', 'Tiền nước', 20000, 'Khối'),
('DV03', 'Wifi', 100000, 'Tháng'),
('DV04', 'Giữ xe máy', 150000, 'Tháng');

INSERT INTO DichVu_ChiNhanh VALUES 
('DV01', 'CN01'), ('DV02', 'CN01'), ('DV03', 'CN01'), ('DV04', 'CN01');

INSERT INTO DieuKienThue VALUES 
('DK01', 'Không hút thuốc', 'Tuyệt đối cấm hút thuốc trong phòng và hành lang'),
('DK02', 'Giờ giới nghiêm', 'Ký túc xá đóng cửa lúc 23h00 mỗi ngày');

INSERT INTO LoaiThietBi VALUES 
('LTB01', 'Giường tầng sắt', 1500000, 'Không chạy nhảy trên giường'),
('LTB02', 'Tủ lạnh mini', 3000000, 'Thường xuyên vệ sinh xả đá'),
('LTB03', 'Máy lạnh Daikin 1HP', 8000000, 'Chỉ mở 26 độ trở lên');

-- 2. Dữ liệu Phòng và Giường
INSERT INTO Phong VALUES 
('P101', 'Phòng 4 người', 4, 6000000, 'Còn trống', 'Khu A', 'Nam', 'CN01'),
('P102', 'Phòng 2 người', 2, 4000000, 'Đang thuê', 'Khu B', 'Nữ', 'CN01'),
('P103', 'Phòng 4 người', 4, 6000000, 'Bảo trì', 'Khu A', 'Nam', 'CN01');

INSERT INTO Phong_DieuKienThue VALUES 
('P101', 'DK01'), ('P101', 'DK02'),
('P102', 'DK01');

INSERT INTO Giuong VALUES 
('G101_1', 1500000, 'Trống', 'P101'),
('G101_2', 1500000, 'Trống', 'P101'),
('G101_3', 1500000, 'Trống', 'P101'),
('G101_4', 1500000, 'Trống', 'P101'),
('G102_1', 2000000, 'Đã thuê', 'P102'),
('G102_2', 2000000, 'Đã thuê', 'P102');

-- 3. Dữ liệu Quy trình Đăng ký & Đặt Cọc (Khách KH01 muốn thuê phòng P102)
INSERT INTO PhieuDangKy VALUES 
('PDK01', 1, '2026-05-15', 'Chờ xác nhận', 'Ở ghép', '2026-05-01', 'Khu B', 'KH01', 'NV01');

INSERT INTO PhieuDangKy_Phong VALUES ('PDK01', 'P102');

INSERT INTO HoaDonCoc VALUES 
('HDC01', '2026-05-02', 2000000, 'Đã thanh toán', '2026-05-02 14:30:00', 'PDK01', 'NV03');

INSERT INTO ThongTinGD VALUES 
('GD01', 'CT_MOMO_98765', 2000000, 'Thanh toan coc giuong G102_1', '2026-05-02 14:25:00', 'Chuyển khoản', 'KH01', 'HDC01');

-- 4. Dữ liệu Quy trình Hợp Đồng & Bàn Giao
INSERT INTO HopDong VALUES 
('HD01', '2026-05-15', 'Hàng tháng', 2000000, '2026-05-15', 'Đang hiệu lực', 'KH01', 'HDC01');

INSERT INTO HopDong_DichVu VALUES 
('HD01', 'DV01'), ('HD01', 'DV02'), ('HD01', 'DV03');

INSERT INTO HopDong_Giuong VALUES 
('HD01', 'G102_1');

INSERT INTO BienBanBanGiao VALUES 
('BBBG01', '2026-05-15', 'Đã bàn giao', 'HD01', 'NV02');

INSERT INTO TrangThietBi VALUES 
('TTB01', 'Đang sử dụng tốt', 'LTB01', 'P102'),
('TTB02', 'Hơi cũ', 'LTB02', 'P102'),
('TTB03', 'Mới 100%', 'LTB03', 'P102');

-- 5. Dữ liệu Quy trình Trả Phòng (Giả sử 1 năm sau khách KH01 trả)
INSERT INTO PhieuDangKyTra VALUES 
('PT01', '2027-05-01', '2027-05-15', 'Tốt nghiệp', 'Chờ xử lý', 'HD01');

INSERT INTO PhieuKiemTra VALUES 
('PKT01', '2027-05-15', 'PT01', 'NV02');

INSERT INTO ChiTietKhauTru VALUES 
('PKT01', 'Hư hỏng thiết bị', 200000, 'Làm xước cánh tủ lạnh LTB02'),
('PKT01', 'Tiện ích nợ', 50000, 'Tiền điện tháng cuối');

INSERT INTO PhieuThanhToan VALUES 
('PTT01', '2027-05-16', 'Chuyển khoản', 'Đã hoàn tất', 'PKT01', 'NV03');

INSERT INTO BienBanTraPhong VALUES 
('BBTP01', '2027-05-16', 'PT01');