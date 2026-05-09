-- ============================================================
--  Test Data for Room Return Process (Hoàn trả phòng)
--  Supabase-ready: run in the Supabase SQL Editor.
--  Tests all functions:
--  1. GET /api/hop-dong/return-ready (getReturnReady)
--  2. GET /api/hop-dong/:id (getById)
--  3. GET /api/thanh-toan/contract/:hopDongId/unpaid (getUnpaidByContract)
--  4. POST /api/hop-dong/:id/room-return (roomReturn)
-- ============================================================

-- ============================================================
-- TEST CASE 1: Complete Return (All payments done, room report ready)
-- Expected: Should successfully process room return
-- ============================================================

-- Create customer KH03
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (3, 'KH03', 'Lý Thái An', '0912345678', 'lythaiain@email.com', '079111111', 'Nữ', 1, 'Khu B', 'Phòng 2 người', '2-4 triệu', '2025-05-15', 12, 'Sinh viên', 'Dài hạn', 'Đang ở', NOW());

-- Create room P104 
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (4, 'P104', 'Khu B', 'Phòng 2 người', 2, 1, 4000000, 'Nữ', 'Đang sử dụng', NOW());

-- Create contract for KH03 (Status: Đang hiệu lực - ready to return)
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, created_at)
VALUES (3, 'HD03', 3, 4, 1, '2025-05-15', '2026-05-15', 4000000, 4000000, 8000000, 'Đang hiệu lực', '2025-05-15', NOW());

-- Create payment invoices for contract HD03
-- Invoice 1: Thanh toán (Paid)
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES (3, 'PT03', 3, '2025-06', 4000000, 50000, 30000, 100000, 4180000, '2025-06-30', '2025-06-28', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- Invoice 2: Thanh toán (Paid)
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES (4, 'PT04', 3, '2025-07', 4000000, 45000, 25000, 100000, 4170000, '2025-07-31', '2025-07-30', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- Invoice 3: Thanh toán (Paid)
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES (5, 'PT05', 3, '2025-08', 4000000, 55000, 35000, 100000, 4190000, '2025-08-31', '2025-08-29', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- More payment invoices to complete the year
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES 
(6, 'PT06', 3, '2025-09', 4000000, 60000, 40000, 100000, 4200000, '2025-09-30', '2025-09-28', 'Tiền mặt', 'Đã thanh toán', NOW()),
(7, 'PT07', 3, '2025-10', 4000000, 50000, 30000, 100000, 4180000, '2025-10-31', '2025-10-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(8, 'PT08', 3, '2025-11', 4000000, 55000, 35000, 100000, 4190000, '2025-11-30', '2025-11-28', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(9, 'PT09', 3, '2025-12', 4000000, 70000, 45000, 100000, 4215000, '2025-12-31', '2025-12-29', 'Tiền mặt', 'Đã thanh toán', NOW()),
(10, 'PT10', 3, '2026-01', 4000000, 65000, 40000, 100000, 4205000, '2026-01-31', '2026-01-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(11, 'PT11', 3, '2026-02', 4000000, 48000, 28000, 100000, 4176000, '2026-02-28', '2026-02-27', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(12, 'PT12', 3, '2026-03', 4000000, 52000, 32000, 100000, 4184000, '2026-03-31', '2026-03-30', 'Tiền mặt', 'Đã thanh toán', NOW()),
(13, 'PT13', 3, '2026-04', 4000000, 58000, 38000, 100000, 4196000, '2026-04-30', '2026-04-28', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- ============================================================
-- TEST CASE 2: Unpaid Invoices (Should block return - Alternative Flow A1)
-- Expected: getUnpaidByContract should return 2 unpaid invoices
-- ============================================================

-- Create customer KH04
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (4, 'KH04', 'Phạm Minh Quân', '0923456789', 'phamquan@email.com', '079222222', 'Nam', 1, 'Khu A', 'Phòng 4 người', '1-3 triệu', '2024-06-01', 12, 'Sinh viên', 'Dài hạn', 'Đang ở', NOW());

-- Create room P105
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (5, 'P105', 'Khu A', 'Phòng 4 người', 4, 1, 6000000, 'Nam', 'Đang sử dụng', NOW());

-- Create contract for KH04 (Status: Đang hiệu lực)
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, created_at)
VALUES (4, 'HD04', 4, 5, 1, '2024-06-01', '2026-05-31', 6000000, 6000000, 12000000, 'Đang hiệu lực', '2024-06-01', NOW());

-- Create payment invoices with some unpaid (for A1 testing)
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES 
(20, 'PT20', 4, '2026-02', 6000000, 70000, 50000, 150000, 6270000, '2026-02-28', '2026-02-27', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(21, 'PT21', 4, '2026-03', 6000000, 75000, 55000, 150000, 6280000, '2026-03-31', '2026-03-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(22, 'PT22', 4, '2026-04', 6000000, 65000, 45000, 150000, 6260000, '2026-04-30', '2026-04-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
-- These two are UNPAID (for testing A1 - payment not completed)
(23, 'PT23', 4, '2026-05', 6000000, 70000, 50000, 150000, 6270000, '2026-05-31', NULL, NULL, 'Chưa thanh toán', NOW()),
(24, 'PT24', 4, '2026-06', 6000000, 75000, 55000, 150000, 6280000, '2026-06-30', NULL, NULL, 'Chưa thanh toán', NOW());

-- ============================================================
-- TEST CASE 3: Multiple contracts ready for return
-- Expected: getReturnReady should return at least 3 contracts
-- ============================================================

-- Create customer KH05
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (5, 'KH05', 'Võ Quốc Bảo', '0934567890', 'baovo@email.com', '079333333', 'Nam', 1, 'Khu A', 'Phòng 4 người', '1-3 triệu', '2024-12-01', 6, 'Sinh viên', 'Dài hạn', 'Đang ở', NOW());

-- Create room P106
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (6, 'P106', 'Khu A', 'Phòng 4 người', 4, 1, 6000000, 'Nam', 'Đang sử dụng', NOW());

-- Create contract for KH05 (Status: Đang hiệu lực)
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, created_at)
VALUES (5, 'HD05', 5, 6, 1, '2024-12-01', '2026-05-31', 6000000, 6000000, 12000000, 'Đang hiệu lực', '2024-12-01', NOW());

-- Create paid payment invoices for KH05
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES 
(30, 'PT30', 5, '2025-01', 6000000, 70000, 50000, 150000, 6270000, '2025-01-31', '2025-01-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(31, 'PT31', 5, '2025-02', 6000000, 75000, 55000, 150000, 6280000, '2025-02-28', '2025-02-27', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(32, 'PT32', 5, '2025-03', 6000000, 65000, 45000, 150000, 6260000, '2025-03-31', '2025-03-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(33, 'PT33', 5, '2025-04', 6000000, 70000, 50000, 150000, 6270000, '2025-04-30', '2025-04-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(34, 'PT34', 5, '2025-05', 6000000, 75000, 55000, 150000, 6280000, '2025-05-31', '2025-05-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(35, 'PT35', 5, '2025-06', 6000000, 70000, 50000, 150000, 6270000, '2025-06-30', '2025-06-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(36, 'PT36', 5, '2025-07', 6000000, 65000, 45000, 150000, 6260000, '2025-07-31', '2025-07-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(37, 'PT37', 5, '2025-08', 6000000, 70000, 50000, 150000, 6270000, '2025-08-31', '2025-08-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(38, 'PT38', 5, '2025-09', 6000000, 75000, 55000, 150000, 6280000, '2025-09-30', '2025-09-28', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(39, 'PT39', 5, '2025-10', 6000000, 70000, 50000, 150000, 6270000, '2025-10-31', '2025-10-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(40, 'PT40', 5, '2025-11', 6000000, 65000, 45000, 150000, 6260000, '2025-11-30', '2025-11-28', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(41, 'PT41', 5, '2025-12', 6000000, 70000, 50000, 150000, 6270000, '2025-12-31', '2025-12-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(42, 'PT42', 5, '2026-01', 6000000, 75000, 55000, 150000, 6280000, '2026-01-31', '2026-01-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(43, 'PT43', 5, '2026-02', 6000000, 70000, 50000, 150000, 6270000, '2026-02-28', '2026-02-27', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(44, 'PT44', 5, '2026-03', 6000000, 65000, 45000, 150000, 6260000, '2026-03-31', '2026-03-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(45, 'PT45', 5, '2026-04', 6000000, 70000, 50000, 150000, 6270000, '2026-04-30', '2026-04-28', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- ============================================================
-- TEST CASE 4: Contract with overdue payment
-- Expected: Should show as unpaid when checking via API
-- ============================================================

-- Create customer KH06
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (6, 'KH06', 'Trương Thị Hồng', '0945678901', 'truonghong@email.com', '079444444', 'Nữ', 1, 'Khu B', 'Phòng 2 người', '2-4 triệu', '2024-08-15', 12, 'Sinh viên', 'Dài hạn', 'Đang ở', NOW());

-- Create room P107
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (7, 'P107', 'Khu B', 'Phòng 2 người', 2, 1, 4000000, 'Nữ', 'Đang sử dụng', NOW());

-- Create contract for KH06 (Status: Đang hiệu lực)
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, created_at)
VALUES (6, 'HD06', 6, 7, 1, '2024-08-15', '2025-08-15', 4000000, 4000000, 8000000, 'Đang hiệu lực', '2024-08-15', NOW());

-- Create payment invoices with one OVERDUE
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES 
(50, 'PT50', 6, '2024-09', 4000000, 50000, 30000, 100000, 4180000, '2024-09-30', '2024-09-29', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(51, 'PT51', 6, '2024-10', 4000000, 55000, 35000, 100000, 4190000, '2024-10-31', '2024-10-30', 'Chuyển khoản', 'Đã thanh toán', NOW()),
-- OVERDUE invoice (due date is in past, not paid)
(52, 'PT52', 6, '2024-11', 4000000, 60000, 40000, 100000, 4200000, '2024-11-30', NULL, NULL, 'Quá hạn', NOW());

-- ============================================================
-- TEST CASE 5: Already Returned Contract
-- Expected: getReturnReady should NOT include it, roomReturn should block
-- ============================================================

-- Create customer KH07
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (7, 'KH07', 'Nguyễn Thu Hà', '0956789012', 'nguyentha@example.com', '079555555', 'Nữ', 1, 'Khu C', 'Phòng 6 người', '3-5 triệu', '2024-01-10', 12, 'Đã hoàn trả', 'Dài hạn', 'Đã ở', NOW());

-- Create room P108 already vacated
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (8, 'P108', 'Khu C', 'Phòng 6 người', 6, 0, 8000000, 'Nữ', 'Trống', NOW());

-- Create already returned contract for KH07
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, ngay_tra_thuc_te, created_at)
VALUES (7, 'HD07', 7, 8, 1, '2024-01-10', '2025-01-10', 8000000, 8000000, 16000000, 'Đã thanh lý', '2024-01-10', '2025-01-09 10:00:00', NOW());

-- Paid invoices for already returned contract
INSERT INTO thanh_toan (id, ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan, ngay_thanh_toan, phuong_thuc, trang_thai, created_at)
VALUES 
(60, 'PT60', 7, '2024-02', 8000000, 70000, 50000, 200000, 8320000, '2024-02-29', '2024-02-28', 'Chuyển khoản', 'Đã thanh toán', NOW()),
(61, 'PT61', 7, '2024-03', 8000000, 75000, 55000, 200000, 8330000, '2024-03-31', '2024-03-30', 'Chuyển khoản', 'Đã thanh toán', NOW());

-- ============================================================
-- TEST CASE 6: Non-active Contract
-- Expected: getReturnReady should NOT include it, roomReturn should block
-- ============================================================

-- Create customer KH08
INSERT INTO khach_hang (id, ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong, khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai, created_at)
VALUES (8, 'KH08', 'Lê Minh Khôi', '0967890123', 'leminhkhoi@example.com', '079666666', 'Nam', 1, 'Khu C', 'Phòng 4 người', '2-4 triệu', '2025-02-01', 6, 'Hợp đồng đã hủy', 'Ngắn hạn', 'Đã ở', NOW());

-- Create room P109 as available again
INSERT INTO phong (id, ma_phong, khu_vuc, loai_phong, suc_chua, dang_o, gia_thue, gioi_tinh, trang_thai, created_at)
VALUES (9, 'P109', 'Khu C', 'Phòng 4 người', 4, 0, 5000000, 'Nam', 'Trống', NOW());

-- Create non-active contract
INSERT INTO hop_dong (id, ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc, gia_thue_moi_giuong, tong_tien_thue, tien_coc, trang_thai, ngay_ky, ngay_tra_thuc_te, created_at)
VALUES (8, 'HD08', 8, 9, 1, '2025-02-01', '2025-07-31', 5000000, 5000000, 10000000, 'Đã hủy', '2025-02-01', NULL, NOW());

-- ============================================================
-- TEST SUMMARY & TEST QUERIES
-- ============================================================

-- Test 1: Get all contracts ready for return (Đang hiệu lực)
-- Expected Result: Should return 4 active contracts (HD03, HD04, HD05, HD06); HD07 and HD08 are excluded
-- Query: SELECT * FROM hop_dong WHERE trang_thai = 'Đang hiệu lực' ORDER BY created_at DESC;

-- Test 2: Get unpaid invoices for contract HD03 (KH03 - Lý Thái An)
-- Expected Result: Should return 0 unpaid invoices (all paid - should be able to return)
-- Query: SELECT * FROM thanh_toan WHERE hop_dong_id = 3 AND trang_thai IN ('Chưa thanh toán', 'Quá hạn');

-- Test 3: Get unpaid invoices for contract HD04 (KH04 - Phạm Minh Quân)
-- Expected Result: Should return 2 unpaid invoices (PT23, PT24)
-- Query: SELECT * FROM thanh_toan WHERE hop_dong_id = 4 AND trang_thai IN ('Chưa thanh toán', 'Quá hạn');

-- Test 4: Get contract details for HD03 (should have all info for room return)
-- Expected Result: All contract info displayed correctly
-- Query: SELECT hd.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong FROM hop_dong hd LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id LEFT JOIN phong p ON hd.phong_id = p.id WHERE hd.id = 3;

-- Test 5: Check payment completion for contracts
-- Expected: Can see which contracts have complete vs incomplete payments
-- Query: 
-- SELECT hd.ma_hd, k.ho_ten, 
--   COUNT(*) as total_invoices,
--   COUNT(*) FILTER (WHERE tt.trang_thai = 'Đã thanh toán') as paid_invoices,
--   COUNT(*) FILTER (WHERE tt.trang_thai IN ('Chưa thanh toán', 'Quá hạn')) as unpaid_invoices
-- FROM hop_dong hd
-- LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id
-- LEFT JOIN thanh_toan tt ON hd.id = tt.hop_dong_id
-- WHERE hd.trang_thai = 'Đang hiệu lực'
-- GROUP BY hd.id, hd.ma_hd, k.ho_ten;

-- Test 6: Simulate room return for HD03 (should succeed)
-- This will test the POST /api/hop-dong/3/room-return endpoint
-- Expected: Contract status changes to "Đã thanh lý", room status changes to "Trống", checkout time recorded
-- After execution, verify with:
-- Query: SELECT * FROM hop_dong WHERE id = 3;

-- Additional test data verification:
-- Check all test contracts exist
SELECT 'TEST DATA SUMMARY' as test_label;
SELECT id, ma_hd, khach_hang_id, trang_thai FROM hop_dong WHERE id IN (3, 4, 5, 6, 7, 8) ORDER BY id;
SELECT '---' as separator;

-- Check payment status for each test contract
SELECT 'PAYMENT STATUS BY CONTRACT' as payment_summary;
SELECT 
  hd.ma_hd as contract,
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE tt.trang_thai = 'Đã thanh toán') as paid,
  COUNT(*) FILTER (WHERE tt.trang_thai IN ('Chưa thanh toán', 'Quá hạn')) as unpaid
FROM hop_dong hd
LEFT JOIN thanh_toan tt ON hd.id = tt.hop_dong_id
WHERE hd.id IN (3, 4, 5, 6, 7, 8)
GROUP BY hd.id, hd.ma_hd
ORDER BY hd.id;
