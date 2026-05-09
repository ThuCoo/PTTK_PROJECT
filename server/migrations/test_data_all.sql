-- ============================================================
--  CONSOLIDATED TEST DATA FILE
--  Extends 001_init.sql with additional test customers/contracts
--  Compatible with schema: 001_init.sql
--  ENVIRONMENT: Development/Testing only
-- ============================================================

-- ============================================================
-- SECTION A: ADDITIONAL TEST DATA FOR ROOM RETURN
-- ============================================================

-- Add test customer KH03
INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, cccd, gioi_tinh, email) 
VALUES ('KH03', 'Lý Thái An', '0912345678', '079111111', 'Nữ', 'lythaiain@email.com');

-- Add test room P104 
INSERT INTO phong (ma_phong, loai_phong, suc_chua_toi_da, gia_thue_phong, trang_thai, khu_vuc, gioi_tinh_ap_dung, ma_chi_nhanh)
VALUES ('P104', 'Phòng 2 người', 2, 4000000, 'Đang sử dụng', 'Khu B', 'Nữ', 'CN01');

-- Add contract for KH03 (linked to existing deposit HDC01)
INSERT INTO hop_dong (ma_hop_dong, ngay_nhan_phong, ky_thanh_toan, tien_ban_giao, ngay_lap, trang_thai, ma_khach_hang, ma_hoa_don)
VALUES ('HD03', '2025-05-15', 'Hàng tháng', 2000000, '2025-05-15', 'Đang hiệu lực', 'KH03', 'HDC01');

-- Add test room P105
INSERT INTO phong (ma_phong, loai_phong, suc_chua_toi_da, gia_thue_phong, trang_thai, khu_vuc, gioi_tinh_ap_dung, ma_chi_nhanh)
VALUES ('P105', 'Phòng 4 người', 4, 6000000, 'Đang sử dụng', 'Khu A', 'Nam', 'CN01');

-- Add test room P106
INSERT INTO phong (ma_phong, loai_phong, suc_chua_toi_da, gia_thue_phong, trang_thai, khu_vuc, gioi_tinh_ap_dung, ma_chi_nhanh)
VALUES ('P106', 'Phòng 4 người', 4, 6000000, 'Trống', 'Khu A', 'Nam', 'CN01');

-- Add test giuong for P104
INSERT INTO giuong (ma_giuong, gia_thue_giuong, trang_thai, ma_phong)
VALUES 
  ('G104_1', 2000000, 'Đã thuê', 'P104'),
  ('G104_2', 2000000, 'Trống', 'P104');

-- Add test deposits for test contracts
INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk, ma_nv_ke_toan)
VALUES 
  ('HDC03', '2025-05-10', 4000000, 'Đã thanh toán', '2025-05-10 10:00:00', 'PDK01', 'NV03'),
  ('HDC04', '2024-06-01', 12000000, 'Đã thanh toán', '2024-06-01 10:00:00', 'PDK01', 'NV03');

-- ============================================================
-- NOTES
-- ============================================================
-- The 001_init.sql schema is simplified and doesn't include:
--   - thanh_toan (payment invoices) - for room return process
--   - dieu_kien_luu_tru, khach_hang_dieu_kien - for pre-rental review
--   - phong_dieu_kien (should be phong_dieu_kien_thue)
--
-- These would be added in future migrations (002, 003, 004, etc.)
-- For now, basic test data above uses only 001_init.sql schema.
-- ============================================================

