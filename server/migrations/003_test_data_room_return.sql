-- ============================================================
--  Room Return Test Data for the current ma_* schema
--  Uses phieu_dang_ky_tra -> phieu_kiem_tra -> phieu_thanh_toan
--  so the room return flow can be tested without old numeric ids.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Seed rooms and customers used by the return scenarios
-- ------------------------------------------------------------

INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, cccd, gioi_tinh, email)
VALUES
  ('KH_RR03', 'Lý Thái An', '0912345678', '079111111', 'Nữ', 'lythaiain@email.com'),
  ('KH_RR04', 'Phạm Minh Quân', '0923456789', '079222222', 'Nam', 'phamquan@email.com'),
  ('KH_RR05', 'Võ Quốc Bảo', '0934567890', '079333333', 'Nam', 'baovo@email.com'),
  ('KH_RR06', 'Trương Thị Hồng', '0945678901', '079444444', 'Nữ', 'truonghong@email.com'),
  ('KH_RR07', 'Nguyễn Thu Hà', '0956789012', '079555555', 'Nữ', 'nguyentha@example.com'),
  ('KH_RR08', 'Lê Minh Khôi', '0967890123', '079666666', 'Nam', 'leminhkhoi@example.com')
ON CONFLICT (ma_khach_hang) DO UPDATE
SET ho_ten = EXCLUDED.ho_ten,
    sdt = EXCLUDED.sdt,
    cccd = EXCLUDED.cccd,
    gioi_tinh = EXCLUDED.gioi_tinh,
    email = EXCLUDED.email;

INSERT INTO phong (
  ma_phong, loai_phong, suc_chua_toi_da, gia_thue_phong, trang_thai,
  khu_vuc, gioi_tinh_ap_dung, ma_chi_nhanh
)
VALUES
  ('RR03', 'Phòng 2 người', 2, 4000000, 'Đang sử dụng', 'Khu B', 'Nữ', 'CN01'),
  ('RR04', 'Phòng 4 người', 4, 6000000, 'Đang sử dụng', 'Khu A', 'Nam', 'CN01'),
  ('RR05', 'Phòng 4 người', 4, 6000000, 'Đang sử dụng', 'Khu A', 'Nam', 'CN01'),
  ('RR06', 'Phòng 2 người', 2, 4000000, 'Đang sử dụng', 'Khu B', 'Nữ', 'CN01'),
  ('RR07', 'Phòng 6 người', 6, 8000000, 'Trống', 'Khu C', 'Nữ', 'CN01'),
  ('RR08', 'Phòng 4 người', 4, 5000000, 'Trống', 'Khu C', 'Nam', 'CN01')
ON CONFLICT (ma_phong) DO UPDATE
SET loai_phong = EXCLUDED.loai_phong,
    suc_chua_toi_da = EXCLUDED.suc_chua_toi_da,
    gia_thue_phong = EXCLUDED.gia_thue_phong,
    trang_thai = EXCLUDED.trang_thai,
    khu_vuc = EXCLUDED.khu_vuc,
    gioi_tinh_ap_dung = EXCLUDED.gioi_tinh_ap_dung,
    ma_chi_nhanh = EXCLUDED.ma_chi_nhanh;

-- ------------------------------------------------------------
-- Test Case 1: Complete return
-- ------------------------------------------------------------

-- Ensure the registration and deposit exist before referencing them
INSERT INTO phieu_dang_ky (
  ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai,
  hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, ma_nv_sale
)
VALUES
  ('PDK_RR03', 1, '2025-05-15', 'Đã chọn phòng', 'Ở ghép', '2025-05-01', 'Khu B', 'KH_RR03', 'NV01')
ON CONFLICT (ma_phieu_dk) DO UPDATE
SET so_nguoi_du_kien = EXCLUDED.so_nguoi_du_kien,
    ngay_du_kien_vao = EXCLUDED.ngay_du_kien_vao,
    trang_thai = EXCLUDED.trang_thai,
    hinh_thuc_thue = EXCLUDED.hinh_thuc_thue,
    ngay_lap = EXCLUDED.ngay_lap,
    khu_vuc_mong_muon = EXCLUDED.khu_vuc_mong_muon,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_nv_sale = EXCLUDED.ma_nv_sale;

INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong)
VALUES ('PDK_RR03', 'RR03')
ON CONFLICT (ma_phieu_dk, ma_phong) DO NOTHING;

INSERT INTO hoa_don_coc (
  ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk, ma_nv_ke_toan
)
VALUES
  ('HDC_RR03', '2025-05-10', 4000000, 'Đã thanh toán', '2025-05-10 10:00:00', 'PDK_RR03', 'NV03')
ON CONFLICT (ma_hoa_don) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    so_tien_coc = EXCLUDED.so_tien_coc,
    trang_thai = EXCLUDED.trang_thai,
    thoi_gian_coc = EXCLUDED.thoi_gian_coc,
    ma_phieu_dk = EXCLUDED.ma_phieu_dk,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

INSERT INTO hop_dong (
  ma_hop_dong, ngay_nhan_phong, ky_thanh_toan, tien_ban_giao, ngay_lap,
  trang_thai, ma_khach_hang, ma_hoa_don
)
VALUES
  ('HD_RR03', '2025-05-15', 'Hàng tháng', 2000000, '2025-05-15', 'Đang hiệu lực', 'KH_RR03', 'HDC_RR03')
ON CONFLICT (ma_hop_dong) DO UPDATE
SET ngay_nhan_phong = EXCLUDED.ngay_nhan_phong,
    ngay_lap = EXCLUDED.ngay_lap,
    trang_thai = EXCLUDED.trang_thai,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_hoa_don = EXCLUDED.ma_hoa_don;

INSERT INTO phieu_dang_ky_tra (
  ma_phieu_tra, ngay_lap, ngay_du_kien_tra, ly_do, trang_thai, ma_hop_dong
)
VALUES
  ('PDT_RR03', '2026-04-01', '2026-05-01', 'Kết thúc hợp đồng', 'Chờ kiểm tra', 'HD_RR03')
ON CONFLICT (ma_phieu_tra) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ngay_du_kien_tra = EXCLUDED.ngay_du_kien_tra,
    ly_do = EXCLUDED.ly_do,
    trang_thai = EXCLUDED.trang_thai,
    ma_hop_dong = EXCLUDED.ma_hop_dong;

INSERT INTO phieu_kiem_tra (
  ma_phieu_kt, ngay_lap, ma_phieu_tra, ma_quan_ly
)
VALUES
  ('PKT_RR03', '2026-04-02', 'PDT_RR03', 'NV02')
ON CONFLICT (ma_phieu_kt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ma_phieu_tra = EXCLUDED.ma_phieu_tra,
    ma_quan_ly = EXCLUDED.ma_quan_ly;

INSERT INTO phieu_thanh_toan (
  ma_phieu_tt, ngay_lap, hinh_thuc, trang_thai, ma_phieu_kt, ma_nv_ke_toan
)
VALUES
  ('PT_RR03_01', '2026-04-03', 'Chuyển khoản', 'Đã thanh toán', 'PKT_RR03', 'NV03'),
  ('PT_RR03_02', '2026-04-10', 'Tiền mặt', 'Đã thanh toán', 'PKT_RR03', 'NV03')
ON CONFLICT (ma_phieu_tt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    hinh_thuc = EXCLUDED.hinh_thuc,
    trang_thai = EXCLUDED.trang_thai,
    ma_phieu_kt = EXCLUDED.ma_phieu_kt,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

-- ------------------------------------------------------------
-- Test Case 2: Unpaid invoices should block return
-- ------------------------------------------------------------


-- Ensure registration and deposit entries exist first for HD_RR04
INSERT INTO phieu_dang_ky (
  ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai,
  hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, ma_nv_sale
)
VALUES
  ('PDK_RR04', 1, '2024-06-01', 'Đã chọn phòng', 'Thuê nguyên phòng', '2024-05-20', 'Khu A', 'KH_RR04', 'NV01')
ON CONFLICT (ma_phieu_dk) DO UPDATE
SET so_nguoi_du_kien = EXCLUDED.so_nguoi_du_kien,
    ngay_du_kien_vao = EXCLUDED.ngay_du_kien_vao,
    trang_thai = EXCLUDED.trang_thai,
    hinh_thuc_thue = EXCLUDED.hinh_thuc_thue,
    ngay_lap = EXCLUDED.ngay_lap,
    khu_vuc_mong_muon = EXCLUDED.khu_vuc_mong_muon,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_nv_sale = EXCLUDED.ma_nv_sale;

INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong)
VALUES ('PDK_RR04', 'RR04')
ON CONFLICT (ma_phieu_dk, ma_phong) DO NOTHING;

INSERT INTO hoa_don_coc (
  ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk, ma_nv_ke_toan
)
VALUES
  ('HDC_RR04', '2024-06-01', 12000000, 'Đã thanh toán', '2024-06-01 10:00:00', 'PDK_RR04', 'NV03')
ON CONFLICT (ma_hoa_don) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    so_tien_coc = EXCLUDED.so_tien_coc,
    trang_thai = EXCLUDED.trang_thai,
    thoi_gian_coc = EXCLUDED.thoi_gian_coc,
    ma_phieu_dk = EXCLUDED.ma_phieu_dk,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

INSERT INTO hop_dong (
  ma_hop_dong, ngay_nhan_phong, ky_thanh_toan, tien_ban_giao, ngay_lap,
  trang_thai, ma_khach_hang, ma_hoa_don
)
VALUES
  ('HD_RR04', '2024-06-01', 'Hàng tháng', 2000000, '2024-06-01', 'Đang hiệu lực', 'KH_RR04', 'HDC_RR04')
ON CONFLICT (ma_hop_dong) DO UPDATE
SET ngay_nhan_phong = EXCLUDED.ngay_nhan_phong,
    ngay_lap = EXCLUDED.ngay_lap,
    trang_thai = EXCLUDED.trang_thai,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_hoa_don = EXCLUDED.ma_hoa_don;

INSERT INTO phieu_dang_ky_tra (
  ma_phieu_tra, ngay_lap, ngay_du_kien_tra, ly_do, trang_thai, ma_hop_dong
)
VALUES
  ('PDT_RR04', '2026-05-01', '2026-05-31', 'Kết thúc hợp đồng', 'Chờ kiểm tra', 'HD_RR04')
ON CONFLICT (ma_phieu_tra) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ngay_du_kien_tra = EXCLUDED.ngay_du_kien_tra,
    ly_do = EXCLUDED.ly_do,
    trang_thai = EXCLUDED.trang_thai,
    ma_hop_dong = EXCLUDED.ma_hop_dong;

INSERT INTO phieu_kiem_tra (
  ma_phieu_kt, ngay_lap, ma_phieu_tra, ma_quan_ly
)
VALUES
  ('PKT_RR04', '2026-05-02', 'PDT_RR04', 'NV02')
ON CONFLICT (ma_phieu_kt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ma_phieu_tra = EXCLUDED.ma_phieu_tra,
    ma_quan_ly = EXCLUDED.ma_quan_ly;

INSERT INTO phieu_thanh_toan (
  ma_phieu_tt, ngay_lap, hinh_thuc, trang_thai, ma_phieu_kt, ma_nv_ke_toan
)
VALUES
  ('PT_RR04_01', '2026-05-03', 'Chuyển khoản', 'Đã thanh toán', 'PKT_RR04', 'NV03'),
  ('PT_RR04_02', '2026-05-10', 'Chuyển khoản', 'Chưa thanh toán', 'PKT_RR04', 'NV03')
ON CONFLICT (ma_phieu_tt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    hinh_thuc = EXCLUDED.hinh_thuc,
    trang_thai = EXCLUDED.trang_thai,
    ma_phieu_kt = EXCLUDED.ma_phieu_kt,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

-- ------------------------------------------------------------
-- Test Case 3: Active contracts ready for return
-- ------------------------------------------------------------
-- Insert registrations first
INSERT INTO phieu_dang_ky (
  ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai,
  hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, ma_nv_sale
)
VALUES
  ('PDK_RR05', 1, '2024-12-01', 'Đã chọn phòng', 'Thuê nguyên phòng', '2024-11-20', 'Khu A', 'KH_RR05', 'NV01'),
  ('PDK_RR06', 1, '2024-08-15', 'Đã chọn phòng', 'Thuê nguyên phòng', '2024-08-01', 'Khu B', 'KH_RR06', 'NV01')
ON CONFLICT (ma_phieu_dk) DO UPDATE
SET so_nguoi_du_kien = EXCLUDED.so_nguoi_du_kien,
    ngay_du_kien_vao = EXCLUDED.ngay_du_kien_vao,
    trang_thai = EXCLUDED.trang_thai,
    hinh_thuc_thue = EXCLUDED.hinh_thuc_thue,
    ngay_lap = EXCLUDED.ngay_lap,
    khu_vuc_mong_muon = EXCLUDED.khu_vuc_mong_muon,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_nv_sale = EXCLUDED.ma_nv_sale;

INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong)
VALUES
  ('PDK_RR05', 'RR05'),
  ('PDK_RR06', 'RR06')
ON CONFLICT (ma_phieu_dk, ma_phong) DO NOTHING;

-- Insert deposit records that reference the registrations
INSERT INTO hoa_don_coc (
  ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk, ma_nv_ke_toan
)
VALUES
  ('HDC_RR05', '2024-12-01', 12000000, 'Đã thanh toán', '2024-12-01 10:00:00', 'PDK_RR05', 'NV03'),
  ('HDC_RR06', '2024-08-15', 8000000, 'Đã thanh toán', '2024-08-15 10:00:00', 'PDK_RR06', 'NV03')
ON CONFLICT (ma_hoa_don) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    so_tien_coc = EXCLUDED.so_tien_coc,
    trang_thai = EXCLUDED.trang_thai,
    thoi_gian_coc = EXCLUDED.thoi_gian_coc,
    ma_phieu_dk = EXCLUDED.ma_phieu_dk,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

-- Now create the contracts that reference the deposit records
INSERT INTO hop_dong (
  ma_hop_dong, ngay_nhan_phong, ky_thanh_toan, tien_ban_giao, ngay_lap,
  trang_thai, ma_khach_hang, ma_hoa_don
)
VALUES
  ('HD_RR05', '2024-12-01', 'Hàng tháng', 2000000, '2024-12-01', 'Đang hiệu lực', 'KH_RR05', 'HDC_RR05'),
  ('HD_RR06', '2024-08-15', 'Hàng tháng', 2000000, '2024-08-15', 'Đang hiệu lực', 'KH_RR06', 'HDC_RR06')
ON CONFLICT (ma_hop_dong) DO UPDATE
SET ngay_nhan_phong = EXCLUDED.ngay_nhan_phong,
    ngay_lap = EXCLUDED.ngay_lap,
    trang_thai = EXCLUDED.trang_thai,
    ma_khach_hang = EXCLUDED.ma_khach_hang,
    ma_hoa_don = EXCLUDED.ma_hoa_don;

INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong)
VALUES
  ('PDK_RR05', 'RR05'),
  ('PDK_RR06', 'RR06')
ON CONFLICT (ma_phieu_dk, ma_phong) DO NOTHING;

INSERT INTO phieu_dang_ky_tra (
  ma_phieu_tra, ngay_lap, ngay_du_kien_tra, ly_do, trang_thai, ma_hop_dong
)
VALUES
  ('PDT_RR05', '2026-04-10', '2026-05-10', 'Kết thúc hợp đồng', 'Chờ kiểm tra', 'HD_RR05'),
  ('PDT_RR06', '2025-07-20', '2025-08-20', 'Kết thúc hợp đồng', 'Đã hủy', 'HD_RR06')
ON CONFLICT (ma_phieu_tra) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ngay_du_kien_tra = EXCLUDED.ngay_du_kien_tra,
    ly_do = EXCLUDED.ly_do,
    trang_thai = EXCLUDED.trang_thai,
    ma_hop_dong = EXCLUDED.ma_hop_dong;

INSERT INTO phieu_kiem_tra (
  ma_phieu_kt, ngay_lap, ma_phieu_tra, ma_quan_ly
)
VALUES
  ('PKT_RR05', '2026-04-11', 'PDT_RR05', 'NV02'),
  ('PKT_RR06', '2025-07-21', 'PDT_RR06', 'NV02')
ON CONFLICT (ma_phieu_kt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    ma_phieu_tra = EXCLUDED.ma_phieu_tra,
    ma_quan_ly = EXCLUDED.ma_quan_ly;

INSERT INTO phieu_thanh_toan (
  ma_phieu_tt, ngay_lap, hinh_thuc, trang_thai, ma_phieu_kt, ma_nv_ke_toan
)
VALUES
  ('PT_RR05_01', '2026-04-12', 'Chuyển khoản', 'Đã thanh toán', 'PKT_RR05', 'NV03'),
  ('PT_RR06_01', '2025-07-22', 'Chuyển khoản', 'Đã thanh toán', 'PKT_RR06', 'NV03')
ON CONFLICT (ma_phieu_tt) DO UPDATE
SET ngay_lap = EXCLUDED.ngay_lap,
    hinh_thuc = EXCLUDED.hinh_thuc,
    trang_thai = EXCLUDED.trang_thai,
    ma_phieu_kt = EXCLUDED.ma_phieu_kt,
    ma_nv_ke_toan = EXCLUDED.ma_nv_ke_toan;

-- ------------------------------------------------------------
-- Verification queries
-- ------------------------------------------------------------

SELECT 'RETURN DATA SUMMARY' AS test_label;
SELECT ma_hop_dong, ma_khach_hang, trang_thai
FROM hop_dong
WHERE ma_hop_dong IN ('HD_RR03', 'HD_RR04', 'HD_RR05', 'HD_RR06')
ORDER BY ma_hop_dong;
SELECT '---' AS separator;

SELECT 'RETURN READY CONTRACTS' AS summary;
SELECT hd.ma_hop_dong, hd.trang_thai, k.ho_ten AS khach_hang, p.ma_phong
FROM hop_dong hd
LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
LEFT JOIN hoa_don_coc hdc ON hd.ma_hoa_don = hdc.ma_hoa_don
LEFT JOIN phieu_dang_ky dk ON hdc.ma_phieu_dk = dk.ma_phieu_dk
LEFT JOIN phieu_dang_ky_phong pdkp ON dk.ma_phieu_dk = pdkp.ma_phieu_dk
LEFT JOIN phong p ON pdkp.ma_phong = p.ma_phong
WHERE hd.trang_thai = 'Đang hiệu lực'
ORDER BY hd.ngay_lap DESC;

SELECT 'UNPAID INVOICES BY CONTRACT' AS summary;
SELECT hd.ma_hop_dong, ptt.ma_phieu_tt, ptt.trang_thai, ptt.ngay_lap
FROM hop_dong hd
JOIN phieu_dang_ky_tra pdt ON pdt.ma_hop_dong = hd.ma_hop_dong
JOIN phieu_kiem_tra pkt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
JOIN phieu_thanh_toan ptt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
WHERE hd.ma_hop_dong IN ('HD_RR03', 'HD_RR04', 'HD_RR05', 'HD_RR06')
  AND ptt.trang_thai IN ('Chưa thanh toán', 'Quá hạn')
ORDER BY hd.ma_hop_dong, ptt.ngay_lap;

SELECT 'PAYMENT STATUS BY CONTRACT' AS payment_summary;
SELECT
  hd.ma_hop_dong AS contract,
  COUNT(*) AS total_invoices,
  COUNT(*) FILTER (WHERE ptt.trang_thai = 'Đã thanh toán') AS paid,
  COUNT(*) FILTER (WHERE ptt.trang_thai IN ('Chưa thanh toán', 'Quá hạn')) AS unpaid
FROM hop_dong hd
LEFT JOIN phieu_dang_ky_tra pdt ON pdt.ma_hop_dong = hd.ma_hop_dong
LEFT JOIN phieu_kiem_tra pkt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
LEFT JOIN phieu_thanh_toan ptt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
WHERE hd.ma_hop_dong IN ('HD_RR03', 'HD_RR04', 'HD_RR05', 'HD_RR06')
GROUP BY hd.ma_hop_dong
ORDER BY hd.ma_hop_dong;

COMMIT;