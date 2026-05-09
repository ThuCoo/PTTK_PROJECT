-- ============================================================
--  Pre-rental Review (Rà soát điều kiện) - Execution Guide
--  SQL verification queries for all test scenarios
-- ============================================================

-- ============================================================
-- PART 1: Verify Test Data Setup
-- ============================================================

-- 1.1: Verify conditions exist
SELECT 'Conditions' as check_item, COUNT(*) as count FROM dieu_kien_luu_tru;

-- 1.2: Verify room-condition relationships
SELECT 'Room-Condition Links' as check_item, COUNT(*) as count FROM phong_dieu_kien;

-- 1.3: Verify customer-condition eligibility
SELECT 'Customer-Condition Status' as check_item, COUNT(*) as count FROM khach_hang_dieu_kien;

-- 1.4: Verify pending rental registration forms
SELECT 'Pending Forms' as check_item, COUNT(*) as count 
FROM phieu_dang_ky 
WHERE trang_thai_xem_xet = 'Chưa duyệt' AND trang_thai = 'Chờ duyệt';

-- ============================================================
-- PART 2: Test Case 1 - Valid Customer + Valid Conditions + Room Available
-- ============================================================

-- 2.1: Get PDK_DK01 details
SELECT 
  pdk.id,
  pdk.ma_phieu_dang_ky,
  pdk.trang_thai_xem_xet,
  k.ho_ten as khach_hang,
  k.cccd,
  COUNT(pdkp.phong_id) as room_count
FROM phieu_dang_ky pdk
LEFT JOIN khach_hang k ON pdk.khach_hang_id = k.id
LEFT JOIN phieu_dang_ky_phong pdkp ON pdk.id = pdkp.phieu_dang_ky_id
WHERE pdk.ma_phieu_dang_ky = 'PDK_DK01'
GROUP BY pdk.id, pdk.ma_phieu_dang_ky, pdk.trang_thai_xem_xet, k.ho_ten, k.cccd;

-- 2.2: Verify PDK_DK01's selected rooms
SELECT 
  p.id,
  p.ma_phong,
  p.loai_phong,
  p.trang_thai,
  p.suc_chua,
  p.dang_o,
  p.gia_thue
FROM phieu_dang_ky_phong pdkp
JOIN phong p ON pdkp.phong_id = p.id
WHERE pdkp.phieu_dang_ky_id = (SELECT id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK01');

-- 2.3: Verify PDK_DK01's customer (KH01) conditions - all should be "Đã duyệt"
SELECT 
  dc.ten_dieu_kien,
  khdk.trang_thai,
  khdk.ghi_chu
FROM khach_hang_dieu_kien khdk
JOIN dieu_kien_luu_tru dc ON khdk.dieu_kien_id = dc.id
WHERE khdk.khach_hang_id = (SELECT khach_hang_id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK01')
ORDER BY dc.id;

-- 2.4: Verify room 1 requirements for PDK_DK01
SELECT 
  dc.ten_dieu_kien,
  dc.mo_ta
FROM phong_dieu_kien pdk
JOIN dieu_kien_luu_tru dc ON pdk.dieu_kien_id = dc.id
WHERE pdk.phong_id = 1
ORDER BY dc.id;

-- 2.5: Expected Result - Step 3 validation: PASS (all conditions "Đã duyệt")
-- 2.6: Expected Result - Step 4 room check: PASS (room 1 status = "Trống" or "Còn giường")
-- 2.7: Expected Result - Step 5 confirmation: SUCCESS

-- ============================================================
-- PART 3: Test Case 2 - Invalid Customer (A3 Error)
-- ============================================================

-- 3.1: Get PDK_DK02 details
SELECT 
  pdk.id,
  pdk.ma_phieu_dang_ky,
  pdk.trang_thai_xem_xet,
  k.ho_ten as khach_hang,
  k.cccd
FROM phieu_dang_ky pdk
LEFT JOIN khach_hang k ON pdk.khach_hang_id = k.id
WHERE pdk.ma_phieu_dang_ky = 'PDK_DK02';

-- 3.2: Check PDK_DK02's customer (KH02) invalid conditions
SELECT 
  dc.ten_dieu_kien,
  khdk.trang_thai,
  khdk.ghi_chu
FROM khach_hang_dieu_kien khdk
JOIN dieu_kien_luu_tru dc ON khdk.dieu_kien_id = dc.id
WHERE khdk.khach_hang_id = (SELECT khach_hang_id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK02')
ORDER BY dc.id;

-- 3.3: Count invalid conditions for KH02
SELECT 
  COUNT(*) as invalid_condition_count
FROM khach_hang_dieu_kien
WHERE khach_hang_id = (SELECT khach_hang_id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK02')
  AND trang_thai = 'Không hợp lệ';

-- 3.4: Expected Result - Step 3 validation: FAIL (has "Không hợp lệ" conditions)
-- 3.5: Expected Result - A3 Error: "Thông tin không hợp lệ" - End UC
-- 3.6: Expected Result - Form status updates to "Từ chối"

-- ============================================================
-- PART 4: Test Case 3 - Valid Customer + Room Unavailable (A4 Error)
-- ============================================================

-- 4.1: Get PDK_DK03 details
SELECT 
  pdk.id,
  pdk.ma_phieu_dang_ky,
  pdk.trang_thai_xem_xet,
  k.ho_ten as khach_hang,
  k.cccd
FROM phieu_dang_ky pdk
LEFT JOIN khach_hang k ON pdk.khach_hang_id = k.id
WHERE pdk.ma_phieu_dang_ky = 'PDK_DK03';

-- 4.2: Check PDK_DK03's selected room status
SELECT 
  p.id,
  p.ma_phong,
  p.trang_thai,
  p.dang_o,
  p.suc_chua
FROM phieu_dang_ky_phong pdkp
JOIN phong p ON pdkp.phong_id = p.id
WHERE pdkp.phieu_dang_ky_id = (SELECT id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK03');

-- 4.3: Verify KH03 all conditions are "Đã duyệt"
SELECT 
  COUNT(*) as valid_conditions,
  SUM(CASE WHEN trang_thai = 'Đã duyệt' THEN 1 ELSE 0 END) as passed_conditions,
  SUM(CASE WHEN trang_thai = 'Không hợp lệ' THEN 1 ELSE 0 END) as failed_conditions
FROM khach_hang_dieu_kien
WHERE khach_hang_id = (SELECT khach_hang_id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK03');

-- 4.4: Expected Result - Step 3 validation: PASS (all conditions met)
-- 4.5: Expected Result - Step 4 room check: FAIL (room 3 status = "Đang sử dụng" - NOT available)
-- 4.6: Expected Result - A4 Error: "Phòng không khả dụng" - Return to Step 2
-- 4.7: Expected Result - User must select another room

-- ============================================================
-- PART 5: Test Case 4 - Valid Customer + Multiple Room Options
-- ============================================================

-- 5.1: Get PDK_DK04 details
SELECT 
  pdk.id,
  pdk.ma_phieu_dang_ky,
  pdk.trang_thai_xem_xet,
  k.ho_ten as khach_hang
FROM phieu_dang_ky pdk
LEFT JOIN khach_hang k ON pdk.khach_hang_id = k.id
WHERE pdk.ma_phieu_dang_ky = 'PDK_DK04';

-- 5.2: Get PDK_DK04's available room options
SELECT 
  p.id,
  p.ma_phong,
  p.loai_phong,
  p.trang_thai,
  p.suc_chua,
  p.dang_o,
  p.gia_thue
FROM phieu_dang_ky_phong pdkp
JOIN phong p ON pdkp.phong_id = p.id
WHERE pdkp.phieu_dang_ky_id = (SELECT id FROM phieu_dang_ky WHERE ma_phieu_dang_ky = 'PDK_DK04')
ORDER BY p.ma_phong;

-- 5.3: Verify both rooms (1 and 2) have available status
SELECT 
  COUNT(*) as available_rooms
FROM phong
WHERE id IN (1, 2) AND trang_thai IN ('Trống', 'Còn giường');

-- 5.4: Expected Result - Step 2: User can select Room 1 or Room 2
-- 5.5: Expected Result - Steps 3-5: Can successfully complete for either room

-- ============================================================
-- PART 6: Workflow Completion Verification
-- ============================================================

-- 6.1: Check form review status after completion
SELECT 
  pdk.ma_phieu_dang_ky,
  pdk.trang_thai_xem_xet,
  pdk.trang_thai,
  pdk.phong_id_confirmed,
  p.ma_phong as confirmed_room,
  pdk.ngay_xem_xet,
  pdk.ghi_chu_xem_xet
FROM phieu_dang_ky pdk
LEFT JOIN phong p ON pdk.phong_id_confirmed = p.id
WHERE pdk.ma_phieu_dang_ky LIKE 'PDK_DK%'
ORDER BY pdk.ma_phieu_dang_ky;

-- 6.2: Count forms by review status
SELECT 
  trang_thai_xem_xet,
  COUNT(*) as form_count
FROM phieu_dang_ky
WHERE ma_phieu_dang_ky LIKE 'PDK_DK%'
GROUP BY trang_thai_xem_xet;

-- ============================================================
-- PART 7: Error Handling Verification (A5 - System Error)
-- ============================================================

-- 7.1: Verify no orphaned form records
SELECT 
  COUNT(*) as orphaned_forms
FROM phieu_dang_ky pdk
WHERE khach_hang_id NOT IN (SELECT id FROM khach_hang)
  AND ma_phieu_dang_ky LIKE 'PDK_DK%';

-- 7.2: Verify no invalid room assignments
SELECT 
  COUNT(*) as invalid_room_links
FROM phieu_dang_ky pdk
WHERE phong_id_confirmed IS NOT NULL
  AND phong_id_confirmed NOT IN (
    SELECT phong_id FROM phieu_dang_ky_phong 
    WHERE phieu_dang_ky_id = pdk.id
  );

-- ============================================================
-- TEST EXECUTION SUMMARY
-- ============================================================
-- 
-- Test Case 1 (PDK_DK01): Valid Customer + Valid Conditions + Available Room
--   ✓ Step 1: List pending forms - Form appears in list
--   ✓ Step 2: Select form - Form selected successfully
--   ✓ Step 3: Validate conditions - All conditions "Đã duyệt" → PASS
--   ✓ Step 4: Check room status - Room available → PASS
--   ✓ Step 5: Confirm review - Room assignment recorded
--   ✓ Step 6: End UC - Success message displayed
--   Expected: trang_thai_xem_xet = "Đã duyệt", phong_id_confirmed = 1
--
-- Test Case 2 (PDK_DK02): Invalid Customer
--   ✓ Step 1: List pending forms - Form appears in list
--   ✓ Step 2: Select form - Form selected successfully
--   ✓ Step 3: Validate conditions - Some conditions "Không hợp lệ" → FAIL
--   ✗ A3 Error: "Thông tin không hợp lệ" - End UC
--   Expected: trang_thai_xem_xet = "Không hợp lệ", trang_thai = "Từ chối"
--
-- Test Case 3 (PDK_DK03): Room Unavailable
--   ✓ Step 1: List pending forms - Form appears in list
--   ✓ Step 2: Select form - Form selected successfully
--   ✓ Step 3: Validate conditions - All conditions passed → PASS
--   ✗ Step 4: Check room status - Room unavailable → FAIL
--   ✗ A4 Error: "Phòng không khả dụng" - Return to Step 2
--   Expected: User must select another room
--
-- Test Case 4 (PDK_DK04): Multiple Room Options
--   ✓ Step 1: List pending forms - Form appears in list
--   ✓ Step 2: Select form - Form selected successfully
--   → User can choose: Room 1 or Room 2
--   ✓ Step 3: Validate conditions - All conditions passed
--   ✓ Step 4: Check room status - Room available
--   ✓ Step 5: Confirm review - Room assignment recorded
--   ✓ Step 6: End UC - Success message displayed
--
-- A5 Error (System Error) - Not directly testable via SQL
--   → Tested via API when database operations fail
--   → Expected: "Lỗi hệ thống: Không ghi nhận được thông tin (A5)"
--
-- ============================================================
