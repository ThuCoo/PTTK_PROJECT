# Room Return Process - Complete Test Suite

## Overview

This test suite provides comprehensive testing for all functions in the room return process (Hoàn trả phòng).

## Files Included

### 1. **003_test_data_room_return.sql**

SQL script that creates test data for all test scenarios.

**What it creates:**

- **Test Case 1**: Complete Return Flow (KH03 - Lý Thái An)
  - Contract: HD03
  - Room: P104
  - Status: All invoices paid ✓
  - Expected: Can successfully return

- **Test Case 2**: Unpaid Invoices (KH04 - Phạm Minh Quân)
  - Contract: HD04
  - Room: P105
  - Status: 2 unpaid invoices (PT23, PT24)
  - Expected: BLOCKED from returning (Alternative Flow A1)

- **Test Case 3**: Multiple Return-Ready Contracts (KH05 - Võ Quốc Bảo)
  - Contract: HD05
  - Room: P106
  - Status: All invoices paid ✓
  - Expected: Can successfully return

- **Test Case 4**: Overdue Payment (KH06 - Trương Thị Hồng)
  - Contract: HD06
  - Room: P107
  - Status: 1 overdue invoice (over-due date)
  - Expected: BLOCKED (shows as unpaid)

- **Test Case 5**: Already Returned Contract (KH07 - Nguyễn Thu Hà)
  - Contract: HD07
  - Room: P108
  - Status: `Đã thanh lý`
  - Expected: Not returnable and excluded from return-ready list

- **Test Case 6**: Non-active Contract (KH08 - Lê Minh Khôi)
  - Contract: HD08
  - Room: P109
  - Status: `Đã hủy`
  - Expected: Not returnable and excluded from return-ready list

**How to Run:**

Use the Supabase SQL Editor.

---

### 2. **003_test_execution_guide.sql**

SQL verification queries to check test data and verify function behavior.

**Queries Included:**

- Part 1: Verify test data was inserted correctly
- Part 2: Test individual functions
- Part 3: Test alternative flows
- Part 4: Test main room return flow
- Part 5: Error cases
- Part 6: Cleanup script (optional)
- Part 7: Quick summary

**How to Run:**

Use the Supabase SQL Editor.

---

### 3. **API_TESTING_GUIDE.md**

Complete guide for testing all API endpoints with curl examples and Postman instructions.

**Endpoints Tested:**

1. `GET /api/hop-dong/return-ready` - List contracts ready to return
2. `GET /api/hop-dong/:id` - Get contract details
3. `GET /api/thanh-toan/contract/:hopDongId/unpaid` - Check payment status
4. `POST /api/hop-dong/:id/room-return` - Process room return

**Test Scenarios:**

- Success case (all payments complete)
- Failure case (unpaid invoices)
- Failure case (already returned)
- Overdue payments

---

## Quick Start Guide

### Step 1: Insert Test Data

Open the Supabase SQL Editor and run `003_test_data_room_return.sql`.

### Step 2: Verify Data Was Inserted

Run the verification queries in the Supabase SQL Editor.

```sql
SELECT * FROM hop_dong WHERE id IN (3, 4, 5, 6, 7, 8);
SELECT * FROM thanh_toan WHERE hop_dong_id IN (3, 4, 5, 6, 7, 8) ORDER BY hop_dong_id;
```

### Step 3: Start Backend Server

```bash
npm install
npm start
# Server runs on http://localhost:3001
```

### Step 4: Test API Endpoints

Use curl or Postman with commands from `API_TESTING_GUIDE.md`

---

## Test Cases Explained

### Test Case 1: ✓ SUCCESS - Complete Return

**Setup:**

- Customer: Lý Thái An (KH03)
- Contract: HD03
- Room: P104
- All 12 monthly invoices: PAID

**Test Flow:**

1. GET `/api/hop-dong/return-ready` → See HD03 in list
2. GET `/api/hop-dong/3` → Confirm contract details
3. GET `/api/thanh-toan/contract/3/unpaid` → Returns empty (no unpaid)
4. POST `/api/hop-dong/3/room-return` → ✓ Success

**Expected Results:**

- Contract status: "Đang hiệu lực" → "Đã thanh lý"
- Room status: "Đang sử dụng" → "Trống"
- Room occupancy: 1 → 0
- Checkout time: NOW() recorded

**Verification Query:**

```sql
SELECT * FROM hop_dong WHERE id = 3;
SELECT * FROM phong WHERE id = 4;
```

---

### Test Case 2: ✗ BLOCKED - Unpaid Invoices (A1)

**Setup:**

- Customer: Phạm Minh Quân (KH04)
- Contract: HD04
- Room: P105
- Unpaid invoices: PT23 (May), PT24 (June)

**Test Flow:**

1. GET `/api/hop-dong/return-ready` → See HD04 in list
2. GET `/api/hop-dong/4` → Get contract details
3. GET `/api/thanh-toan/contract/4/unpaid` → Returns 2 unpaid invoices
4. POST `/api/hop-dong/4/room-return` → ✗ Error: "Chưa hoàn tất thanh toán"

**Expected Results:**

- Error message displayed
- Employee transfers to payment processing
- Contract remains in "Đang hiệu lực" state

**Verification Query:**

```sql
SELECT * FROM thanh_toan WHERE hop_dong_id = 4 AND trang_thai IN ('Chưa thanh toán', 'Quá hạn');
```

---

### Test Case 3: ✓ Multiple Ready Contracts

**Setup:**

- Customer: Võ Quốc Bảo (KH05)
- Contract: HD05
- Room: P106
- All 16 monthly invoices: PAID

**Test Flow:**
Same as Test Case 1 but with different contract ID

**Purpose:**

- Verify system handles multiple return-ready contracts
- Confirm filtering works correctly

---

### Test Case 4: ✗ BLOCKED - Overdue Payment

**Setup:**

- Customer: Trương Thị Hồng (KH06)
- Contract: HD06
- Room: P107
- Status: 1 invoice overdue (due date: 2024-11-30, no payment)

**Test Flow:**

1. GET `/api/hop-dong/return-ready` → See HD06 in list
2. GET `/api/hop-dong/6` → Get contract details
3. GET `/api/thanh-toan/contract/6/unpaid` → Returns 1 overdue invoice
4. POST `/api/hop-dong/6/room-return` → ✗ Error: "Chưa hoàn tất thanh toán"

**Expected Results:**

- Overdue invoice flagged
- Cannot process return
- Contract remains active

**Verification Query:**

```sql
SELECT * FROM thanh_toan WHERE hop_dong_id = 6
  AND trang_thai IN ('Chưa thanh toán', 'Quá hạn');
```

---

### Test Case 5: ✓ EXCLUDED - Already Returned Contract

**Setup:**

- Customer: Nguyễn Thu Hà (KH07)
- Contract: HD07
- Room: P108
- Status: `Đã thanh lý`

**Test Flow:**

1. GET `/api/hop-dong/return-ready` → HD07 must not appear
2. GET `/api/hop-dong/7` → Confirms returned status and checkout time
3. POST `/api/hop-dong/7/room-return` → ✗ Error because contract is not active

**Expected Results:**

- Excluded from return-ready list
- Return endpoint rejects it
- Useful for validating the final-state branch

---

### Test Case 6: ✓ EXCLUDED - Non-active Contract

**Setup:**

- Customer: Lê Minh Khôi (KH08)
- Contract: HD08
- Room: P109
- Status: `Đã hủy`

**Test Flow:**

1. GET `/api/hop-dong/return-ready` → HD08 must not appear
2. GET `/api/hop-dong/8` → Confirms cancelled status
3. POST `/api/hop-dong/8/room-return` → ✗ Error because contract is not active

**Expected Results:**

- Excluded from return-ready list
- Return endpoint rejects it
- Validates cancelled/closed contract handling

---

## Function Coverage

| Function                             | Test                                    | Status         |
| ------------------------------------ | --------------------------------------- | -------------- |
| `HopDongDAO.getByStatus()`           | GET /api/hop-dong/return-ready          | Cases 1-6      |
| `HopDongDAO.getById()`               | GET /api/hop-dong/:id                   | All Test Cases |
| `ThanhToanDAO.getUnpaidByContract()` | GET /api/thanh-toan/contract/:id/unpaid | All Test Cases |
| `HopDongDAO.finalize()`              | POST /api/hop-dong/:id/room-return      | Test Case 1, 3 |
| `PhongDAO.incrementOccupied()`       | POST /api/hop-dong/:id/room-return      | Test Case 1, 3 |
| `PhongDAO.updateStatus()`            | POST /api/hop-dong/:id/room-return      | Test Case 1, 3 |
| `HopDongDAO.recordCheckoutTime()`    | POST /api/hop-dong/:id/room-return      | Test Case 1, 3 |

---

## Common Testing Workflows

### Workflow A: Happy Path (Success)

1. Run: `003_test_data_room_return.sql`
2. Verify: `003_test_execution_guide.sql`
3. Test: Case 1 or 3 using API_TESTING_GUIDE.md
4. Expected: All operations succeed

### Workflow B: Edge Cases

1. Run: `003_test_data_room_return.sql`
2. Test: Case 2 (unpaid) or Case 4 (overdue)
3. Expected: Operations blocked with appropriate error

### Workflow C: Full Integration

1. Run all test data
2. Use Postman to test all endpoints
3. Verify database state matches expectations
4. Check error handling

---

## Cleanup

To reset test data and start fresh:

```sql
DELETE FROM thanh_toan WHERE hop_dong_id IN (3, 4, 5, 6);
DELETE FROM hop_dong WHERE id IN (3, 4, 5, 6);
DELETE FROM phong WHERE id IN (4, 5, 6, 7);
DELETE FROM khach_hang WHERE id IN (3, 4, 5, 6);
```

Or use the cleanup section in `003_test_execution_guide.sql`

---

## Troubleshooting

### Issue: Test data won't insert

**Solution:** Ensure the Supabase project has both `001_init.sql` and `002_add_checkout_time.sql` applied first

### Issue: Foreign key errors

**Solution:** Check that customer, room, and payment records exist before inserting contracts

### Issue: Unpaid query returns no results

**Solution:** Verify payment status is exactly "Chưa thanh toán" or "Quá hạn" (case-sensitive)

### Issue: Room return fails with "contract not found"

**Solution:** Check contract ID exists and status is "Đang hiệu lực"

---

## Best Practices

1. **Always run verification queries first** to understand the data
2. **Test happy path (Case 1) before edge cases** (Cases 2-4)
3. **Use Postman for API testing** - easier to debug responses
4. **Check database state after each operation** to verify changes
5. **Keep test data separate** from production data
6. **Document any custom test cases** added to the suite

---

## Contact & Support

For issues or improvements to the test suite, refer to:

- API_TESTING_GUIDE.md for endpoint documentation
- Backend code in `server/src/` for implementation details
- Database schema in `server/migrations/` for table structures
