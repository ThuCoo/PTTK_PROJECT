# Pre-rental Review (Rà soát Điều kiện & Tình trạng) - API Testing Guide

## Overview

This guide provides curl/Postman commands for testing the complete pre-rental review workflow:

1. **Step 1**: Get list of pending forms for review
2. **Step 2**: Select a form and view details
3. **Step 3**: Validate customer conditions
4. **Step 4**: Check room availability
5. **Step 5**: Confirm review and record room assignment
6. **Step 6**: End use case

## Base URL

```
http://localhost:3001/api/dang-ky-thue
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer {YOUR_JWT_TOKEN}
Content-Type: application/json
```

---

## Step 1: Get Pending Forms for Review

### Endpoint

```
GET /pending
```

### Description

Displays screen MH_DKPhong with list of all rental registration forms awaiting review condition check.

### curl Command

```bash
curl -X GET http://localhost:3001/api/dang-ky-thue/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Danh sách phiếu đăng ký chờ duyệt",
  "data": [
    {
      "id": 1,
      "ma_phieu_dang_ky": "PDK_DK01",
      "ten_khach": "Nguyễn Văn A",
      "phone_khach": "0901234567",
      "so_nguoi_du_kien": 2,
      "ngay_vao_du_kien": "2025-05-16",
      "khu_vuc_mong_muon": "Khu vực 1",
      "room_count": 1,
      "selected_rooms": [
        {
          "id": 1,
          "ma_phong": "P01",
          "loai_phong": "Phòng 6 giường",
          "suc_chua": 6,
          "dang_o": 2,
          "gia_thue": 3000000,
          "gioi_tinh": "Nam",
          "trang_thai": "Trống"
        }
      ]
    },
    ...
  ],
  "count": 4
}
```

### Response Codes

- **200**: Successfully retrieved list
- **500**: Server error

---

## Step 2: Get Form Details

### Endpoint

```
GET /:id
```

### Description

User selects a registration form. Returns form details with selected rooms and customer information.

### curl Command

```bash
# Get details for form ID 1 (PDK_DK01)
curl -X GET http://localhost:3001/api/dang-ky-thue/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Chi tiết phiếu đăng ký thuê",
  "data": {
    "form": {
      "id": 1,
      "ma_phieu_dang_ky": "PDK_DK01",
      "khach_hang_id": 1,
      "ngay_dang_ky": "2025-05-09",
      "trang_thai": "Chờ duyệt",
      "trang_thai_xem_xet": "Chưa duyệt",
      "so_nguoi_du_kien": 2,
      "ngay_vao_du_kien": "2025-05-16",
      "khu_vuc_mong_muon": "Khu vực 1"
    },
    "customer": {
      "id": 1,
      "ho_ten": "Nguyễn Văn A",
      "phone": "0901234567",
      "cccd": "123456789012",
      "gioi_tinh": "Nam",
      "trang_thai": "Chờ duyệt"
    },
    "selected_rooms": [
      {
        "id": 1,
        "ma_phong": "P01",
        "loai_phong": "Phòng 6 giường",
        "suc_chua": 6,
        "dang_o": 2,
        "gia_thue": 3000000,
        "gioi_tinh": "Nam",
        "trang_thai": "Trống"
      }
    ]
  }
}
```

### Response Codes

- **200**: Successfully retrieved details
- **404**: Form not found
- **500**: Server error

---

## Step 3: Validate Customer Conditions

### Endpoint

```
POST /:id/validate-conditions
```

### Description

System validates customer information against residence conditions required by the selected room.

### Request Body

```json
{
  "room_id": 1,
  "khach_hang_id": 1
}
```

### curl Command - Test Case 1 (Valid Customer)

```bash
# PDK_DK01: Valid customer (KH01) + Valid room (P01)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/validate-conditions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "khach_hang_id": 1
  }'
```

### Expected Response (Success - All Conditions Met)

```json
{
  "success": true,
  "message": "Đối chiếu điều kiện lưu trú thành công",
  "data": {
    "customer_id": 1,
    "customer_name": "Nguyễn Văn A",
    "room_id": 1,
    "conditions_checked": [
      {
        "id": 1,
        "ten_dieu_kien": "Ký quỹ cơ bản",
        "mo_ta": "Khách hàng phải có đủ tiền ký quỹ tối thiểu",
        "trang_thai_khach": "Đã duyệt",
        "ghi_chu_khach": "Đã xác nhận đủ ký quỹ"
      },
      {
        "id": 2,
        "ten_dieu_kien": "Giấy tờ hợp lệ",
        "mo_ta": "Phải có CCCD hoặc hộ chiếu hợp lệ",
        "trang_thai_khach": "Đã duyệt",
        "ghi_chu_khach": "Giấy tờ hợp lệ"
      },
      ...
    ],
    "all_conditions_met": true
  },
  "step": 3
}
```

### curl Command - Test Case 2 (Invalid Customer - A3 Error)

```bash
# PDK_DK02: Invalid customer (KH02) - has unpaid debt
curl -X POST http://localhost:3001/api/dang-ky-thue/2/validate-conditions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 2,
    "khach_hang_id": 2
  }'
```

### Expected Response (Failure - A3 Error)

```json
{
  "success": false,
  "error": "Khách hàng không đạt điều kiện lưu trú (A3): Ký quỹ cơ bản: Ký quỹ không đủ; Không có tình trạng nợ: Có nợ tiền quá hạn",
  "code": "A3",
  "message": "Thông tin không hợp lệ"
}
```

### Response Codes

- **200**: Conditions validated successfully
- **400**: A3 - Invalid information (customer doesn't meet conditions)
- **404**: Form or customer not found
- **500**: Server error

---

## Step 4: Check Room Availability

### Endpoint

```
POST /:id/check-room/:roomId
```

### Description

System checks room availability and condition status.

### curl Command - Test Case 1 (Room Available)

```bash
# PDK_DK01: Room 1 is available
curl -X POST http://localhost:3001/api/dang-ky-thue/1/check-room/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response (Success - Room Available)

```json
{
  "success": true,
  "message": "Kiểm tra tình trạng phòng thành công",
  "data": {
    "room_id": 1,
    "ma_phong": "P01",
    "loai_phong": "Phòng 6 giường",
    "suc_chua": 6,
    "dang_o": 2,
    "gia_thue": 3000000,
    "trang_thai": "Trống",
    "available": true
  },
  "step": 4
}
```

### curl Command - Test Case 2 (Room Unavailable - A4 Error)

```bash
# PDK_DK03: Room 3 is unavailable (status = "Đang sử dụng")
curl -X POST http://localhost:3001/api/dang-ky-thue/3/check-room/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response (Failure - A4 Error)

```json
{
  "success": false,
  "error": "Phòng P03 không khả dụng (A4: Trạng thái = Đang sử dụng). Vui lòng chọn phòng khác.",
  "code": "A4",
  "message": "Phòng không khả dụng",
  "action": "return_to_step_2"
}
```

### Response Codes

- **200**: Room is available
- **400**: A4 - Room unavailable (return to step 2 and select another room)
- **404**: Room not found
- **500**: Server error

---

## Step 5: Confirm Review and Record Room Assignment

### Endpoint

```
POST /:id/confirm-review
```

### Description

System records the selected room information for this rental registration form.

### Request Body

```json
{
  "room_id": 1,
  "ghi_chu": "Optional note about the review"
}
```

### curl Command

```bash
# PDK_DK01: Confirm room assignment
curl -X POST http://localhost:3001/api/dang-ky-thue/1/confirm-review \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "ghi_chu": "Đã duyệt từ quy trình rà soát điều kiện"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Đã ghi nhận thông tin phòng thành công",
  "data": {
    "success": true,
    "message": "Đã ghi nhận thông tin phòng thành công",
    "phieu_dang_ky_id": 1,
    "phong_id_confirmed": 1,
    "trang_thai_xem_xet": "Đã duyệt",
    "ngay_xem_xet": "2025-05-09T10:30:45.123Z"
  },
  "step": "6 - Kết thúc UC"
}
```

### Expected Response (Failure - A5 System Error)

```json
{
  "success": false,
  "error": "Lỗi hệ thống",
  "details": "Lỗi hệ thống: Không ghi nhận được thông tin (A5)",
  "code": "A5",
  "message": "Hệ thống không ghi nhận được thông tin, vui lòng thử lại"
}
```

### Response Codes

- **200**: Room assignment recorded successfully
- **400**: Missing required fields or invalid data
- **500**: A5 - System error (cannot record information)

---

## Step 6: Complete Full Workflow (Alternative)

### Endpoint

```
POST /:id/complete-review
```

### Description

Execute the complete workflow: Validate conditions → Check room → Confirm review in a single request.

### Request Body

```json
{
  "room_id": 1
}
```

### curl Command

```bash
curl -X POST http://localhost:3001/api/dang-ky-thue/1/complete-review \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Hoàn tất quy trình rà soát điều kiện",
  "data": {
    "success": true,
    "form": { ... },
    "customer": { ... },
    "conditions_validation": { ... },
    "room_check": { ... },
    "confirmation": { ... }
  }
}
```

---

## Test Scenarios Summary

### Test Case 1: PDK_DK01 (Valid Customer + Available Room)

```bash
# Step 1: List pending
curl -X GET http://localhost:3001/api/dang-ky-thue/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Step 2: Get form details
curl -X GET http://localhost:3001/api/dang-ky-thue/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Step 3: Validate conditions (should PASS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/validate-conditions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1, "khach_hang_id": 1}'

# Step 4: Check room (should PASS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/check-room/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Step 5: Confirm review (should SUCCESS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/confirm-review \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1}'
```

**Expected Result**: ✅ All steps pass, form status = "Đã duyệt"

### Test Case 2: PDK_DK02 (Invalid Customer - A3)

```bash
# Step 3: Validate conditions (should FAIL with A3)
curl -X POST http://localhost:3001/api/dang-ky-thue/2/validate-conditions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 2, "khach_hang_id": 2}'
```

**Expected Result**: ❌ A3 Error - "Thông tin không hợp lệ", form status = "Từ chối"

### Test Case 3: PDK_DK03 (Room Unavailable - A4)

```bash
# Step 4: Check room (should FAIL with A4)
curl -X POST http://localhost:3001/api/dang-ky-thue/3/check-room/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result**: ❌ A4 Error - "Phòng không khả dụng", return to Step 2

### Test Case 4: PDK_DK04 (Multiple Room Options)

```bash
# User can complete with either Room 1 or Room 2
# Steps same as Test Case 1
```

**Expected Result**: ✅ All steps pass with selected room, form status = "Đã duyệt"

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Room status must be "Trống" or "Còn giường" to be considered available
- Customer must have ALL conditions marked as "Đã duyệt" to pass validation
- A3 Error ends the use case immediately
- A4 Error allows user to return to Step 2 and select another room
- A5 Error indicates a system/database issue

---
