# Room Return Process - API Testing Guide

## Prerequisites

1. Supabase project created and the server configured with `DATABASE_URL`
2. Test data loaded from `003_test_data_room_return.sql` in the Supabase SQL Editor
3. Backend server running on `http://localhost:3001`
4. Authentication headers if needed (adjust based on your auth setup)

## Quick Test Commands

### 1. Test: Get Return-Ready Contracts

Endpoint: `GET /api/hop-dong/return-ready`
Expected: Returns all contracts with status "Đang hiệu lực" from Supabase

```bash
curl -X GET "http://localhost:3001/api/hop-dong/return-ready" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "ma_hd": "HD03",
      "khach_hang_id": 3,
      "phong_id": 4,
      "so_giuong": 1,
      "ngay_bat_dau": "2025-05-15",
      "ngay_ket_thuc": "2026-05-15",
      "trang_thai": "Đang hiệu lực",
      "ten_khach": "Lý Thái An",
      "phone_khach": "0912345678",
      "ma_phong": "P104"
    }
    // ... more contracts
  ]
}
```

---

### 2. Test: Get Contract Details

Endpoint: `GET /api/hop-dong/:id`
Expected: Returns full contract info with customer and room details

```bash
curl -X GET "http://localhost:3001/api/hop-dong/3" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "ma_hd": "HD03",
    "khach_hang_id": 3,
    "phong_id": 4,
    "so_giuong": 1,
    "ngay_bat_dau": "2025-05-15",
    "ngay_ket_thuc": "2026-05-15",
    "gia_thue_moi_giuong": 4000000,
    "tong_tien_thue": 4000000,
    "tien_coc": 8000000,
    "trang_thai": "Đang hiệu lực",
    "ngay_ky": "2025-05-15",
    "ngay_tra_thuc_te": null,
    "ten_khach": "Lý Thái An",
    "phone_khach": "0912345678",
    "ma_phong": "P104"
  }
}
```

---

### 3. Test: Check Unpaid Invoices - SUCCESS CASE

Endpoint: `GET /api/thanh-toan/contract/:hopDongId/unpaid`
Expected: Returns empty array (no unpaid invoices - ready to return)

```bash
curl -X GET "http://localhost:3001/api/thanh-toan/contract/3/unpaid" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [],
  "hasUnpaid": false
}
```

---

### 4. Test: Check Unpaid Invoices - FAILURE CASE (A1)

Endpoint: `GET /api/thanh-toan/contract/:hopDongId/unpaid`
Expected: Returns unpaid invoices (cannot return - need payment processing)

```bash
curl -X GET "http://localhost:3001/api/thanh-toan/contract/4/unpaid" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 23,
      "ma_phieu": "PT23",
      "hop_dong_id": 4,
      "thang": "2026-05",
      "tien_thue": 6000000,
      "tien_dien": 70000,
      "tien_nuoc": 50000,
      "phi_xe": 150000,
      "tong_tien": 6270000,
      "han_thanh_toan": "2026-05-31",
      "trang_thai": "Chưa thanh toán"
    },
    {
      "id": 24,
      "ma_phieu": "PT24",
      "hop_dong_id": 4,
      "thang": "2026-06",
      "tien_thue": 6000000,
      "tien_dien": 75000,
      "tien_nuoc": 55000,
      "phi_xe": 150000,
      "tong_tien": 6280000,
      "han_thanh_toan": "2026-06-30",
      "trang_thai": "Chưa thanh toán"
    }
  ],
  "hasUnpaid": true
}
```

---

### 5. Test: Room Return - SUCCESS CASE

Endpoint: `POST /api/hop-dong/:id/room-return`
Expected: Contract finalized, room emptied, checkout time recorded

```bash
curl -X POST "http://localhost:3001/api/hop-dong/3/room-return" \
  -H "Content-Type: application/json" \
  -d '{
    "roomReportNotes": "Phòng sạch sẽ, tài sản đầy đủ, không hư hỏng. Đã thu hồi chìa khóa."
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Hoàn trả phòng thành công",
    "checkoutTime": "2026-05-08T14:30:00.000Z",
    "contractId": 3
  }
}
```

**Database Changes After:**

- Contract HD03: `trang_thai` changed to "Đã thanh lý"
- Room P104: `trang_thai` changed to "Trống", `dang_o` = 0
- Contract HD03: `ngay_tra_thuc_te` = "2026-05-08T14:30:00.000Z"

## Supabase Notes

If you want the app to use Supabase, set `DATABASE_URL` in `server/.env` to your Supabase Postgres connection string. The backend will use that automatically and keep the local `pg` query layer unchanged.

To run the SQL files, open Supabase Dashboard > SQL Editor and paste the content of `003_test_data_room_return.sql` or `003_test_execution_guide.sql`.

---

### 6. Test: Room Return - FAILURE CASE (A1 - Unpaid Invoices)

Endpoint: `POST /api/hop-dong/:id/room-return`
Expected: Error - cannot return due to unpaid invoices

```bash
curl -X POST "http://localhost:3001/api/hop-dong/4/room-return" \
  -H "Content-Type: application/json" \
  -d '{
    "roomReportNotes": "Phòng sạch sẽ, tài sản đầy đủ."
  }'
```

**Expected Error Response:**

```json
{
  "success": false,
  "error": "Chưa hoàn tất thanh toán"
}
```

---

### 7. Test: Room Return - FAILURE CASE (A2 - No Room Report)

Endpoint: `POST /api/hop-dong/:id/room-return`
Expected: Error - room report is required

```bash
curl -X POST "http://localhost:3001/api/hop-dong/3/room-return" \
  -H "Content-Type: application/json" \
  -d '{
    "roomReportNotes": ""
  }'
```

**Expected Error Response:**

```json
{
  "success": false,
  "error": "Chưa có biên bản trả phòng"
}
```

---

### 8. Test: Room Return - FAILURE CASE (Already Returned)

Endpoint: `POST /api/hop-dong/:id/room-return`
Expected: Error - contract not in "Đang hiệu lực" state

```bash
curl -X POST "http://localhost:3001/api/hop-dong/3/room-return" \
  -H "Content-Type: application/json" \
  -d '{
    "roomReportNotes": "Some notes"
  }'
```

**Expected Error Response (after first successful return):**

```json
{
  "success": false,
  "error": "Hợp đồng không ở trạng thái có thể trả phòng"
}
```

---

### 9. Test: Room Return - FAILURE CASE (Non-active Contract)

Endpoint: `POST /api/hop-dong/:id/room-return`
Expected: Error - contract is cancelled or otherwise not active

```bash
curl -X POST "http://localhost:3001/api/hop-dong/8/room-return" \
  -H "Content-Type: application/json" \
  -d '{
    "roomReportNotes": "Some notes"
  }'
```

**Expected Error Response:**

```json
{
  "success": false,
  "error": "Hợp đồng không ở trạng thái có thể trả phòng"
}
```

---

## Testing Workflow

### Scenario 1: Complete Return Flow

1. ✓ Call `GET /api/hop-dong/return-ready` → Find HD03
2. ✓ Call `GET /api/hop-dong/3` → Get contract details
3. ✓ Call `GET /api/thanh-toan/contract/3/unpaid` → Confirm no unpaid invoices
4. ✓ Call `POST /api/hop-dong/3/room-return` → Complete return
5. ✓ Verify database: Contract status = "Đã thanh lý", Room status = "Trống"

### Scenario 2: Blocked Return (Unpaid Invoices)

1. ✓ Call `GET /api/hop-dong/return-ready` → Find HD04
2. ✓ Call `GET /api/hop-dong/4` → Get contract details
3. ✓ Call `GET /api/thanh-toan/contract/4/unpaid` → See unpaid invoices
4. ✗ Cannot proceed with return → Transfer to payment processing
5. ✓ Verify: Contract still in "Đang hiệu lực" state

### Scenario 3: Overdue Payment

1. ✓ Call `GET /api/hop-dong/return-ready` → Find HD06
2. ✓ Call `GET /api/hop-dong/6` → Get contract details
3. ✓ Call `GET /api/thanh-toan/contract/6/unpaid` → See overdue invoice
4. ✗ Cannot return due to overdue payment
5. ✓ Contact customer about overdue amount

### Scenario 4: Excluded Statuses

1. ✓ Call `GET /api/hop-dong/return-ready` → Confirm HD07 and HD08 do not appear
2. ✓ Call `GET /api/hop-dong/7` → Verify returned contract data and checkout timestamp
3. ✓ Call `GET /api/hop-dong/8` → Verify cancelled contract data
4. ✗ Call `POST /api/hop-dong/7/room-return` and `POST /api/hop-dong/8/room-return` → Both must fail

---

## Using Postman

1. Create collection: "Room Return Process"
2. Add requests with these configurations:

**Request: Get Return-Ready**

- Method: GET
- URL: `{{BASE_URL}}/api/hop-dong/return-ready`
- Tests: Check `response.body.success` is true

**Request: Get Contract Detail**

- Method: GET
- URL: `{{BASE_URL}}/api/hop-dong/{{CONTRACT_ID}}`
- Pre-request: Set `CONTRACT_ID` variable

**Request: Check Unpaid**

- Method: GET
- URL: `{{BASE_URL}}/api/thanh-toan/contract/{{CONTRACT_ID}}/unpaid`
- Tests: Validate payment status

**Request: Process Room Return**

- Method: POST
- URL: `{{BASE_URL}}/api/hop-dong/{{CONTRACT_ID}}/room-return`
- Body:
  ```json
  {
    "roomReportNotes": "Phòng sạch sẽ, tài sản đầy đủ, không hư hỏng."
  }
  ```
- Tests: Verify response contains checkoutTime

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Use `2026-05-08` as current date for test data consistency
- Test data includes 4 contracts with different scenarios
- Database changes are permanent unless you run cleanup script
