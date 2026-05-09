# Pre-rental Review (Rà soát Điều kiện & Tình trạng) - Complete Implementation

## Table of Contents

1. [Overview](#overview)
2. [Business Process](#business-process)
3. [Implementation Architecture](#implementation-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Component](#frontend-component)
7. [Test Data](#test-data)
8. [Running Tests](#running-tests)
9. [Error Handling](#error-handling)

---

## Overview

This document describes the complete implementation of "Rà soát điều kiện và tình trạng" (Pre-rental Condition & Status Review) process in the HomeStay Dorm management system.

**Purpose**: Sales staff (Nhân viên sale) review rental registration forms and verify:

- ✓ Customer meets residence condition requirements
- ✓ Selected room is available for assignment
- ✓ Record the selected room assignment

**Compliance**: Implements Vietnamese business process requirements:

- 6 main steps with 3 alternative error flows (A3, A4, A5)
- Data-driven architecture (minimal preconditions at each step)
- Full error tracking and logging

---

## Business Process

### Main Flow (6 Steps)

**Step 1**: System displays screen **MH_DKPhong** with list of rental registration forms awaiting condition review

- Input: None
- Output: List of pending registration forms with selected rooms

**Step 2**: User selects 1 rental registration form (Phiếu đăng ký thuê)

- Input: Form selection
- Output: Form details with customer info and available rooms

**Step 3**: System validates tenant information against residence conditions

- Input: Customer ID, Room ID
- Logic: Check all condition requirements for the room
- Output: Condition validation result
- **Error A3**: Invalid information → Show error, end UC

**Step 4**: System requests room condition/availability check

- Input: Room ID
- Logic: Verify room status is "Trống" or "Còn giường"
- Output: Room status
- **Error A4**: Room unavailable → Show error, return to Step 2

**Step 5**: System records selected room information

- Input: Form ID, Selected Room ID
- Logic: Update form with confirmed room assignment
- Output: Confirmation record
- **Error A5**: System cannot record → Show "Lỗi hệ thống", end UC

**Step 6**: End use case

- Output: Success message with confirmation details

### Alternative Flows

**A3: Invalid Information**

```
If thông tin không hợp lệ (customer doesn't meet conditions):
  → Show error message
  → End UC immediately
  → Form status: "Từ chối"
```

**A4: Room Unavailable**

```
If phòng không khả dụng (room status not available):
  → Show error message
  → Return to Step 2
  → User selects another room
```

**A5: System Error**

```
If hệ thống không ghi nhận được thông tin (system error):
  → Show "Lỗi hệ thống"
  → End UC
  → Form status remains unchanged
```

---

## Implementation Architecture

### Three-Layer Architecture (GUI → BUS → DAO)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React/TypeScript)                                 │
│ PreRentalReview.tsx                                         │
│ - 6-step UI flow                                            │
│ - Error handling (A3, A4, A5)                               │
│ - Form selection and submission                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP API
┌────────────────────▼────────────────────────────────────────┐
│ Backend (Express.js/TypeScript)                             │
├─────────────────────────────────────────────────────────────┤
│ Routes Layer (dangKyThue.routes.ts)                         │
│ - GET /pending                                              │
│ - GET /:id                                                  │
│ - POST /:id/validate-conditions                             │
│ - POST /:id/check-room/:roomId                              │
│ - POST /:id/confirm-review                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ Business Logic Layer (dangKyThue.bus.ts)                    │
│ - getPendingForReview()                                     │
│ - validateCustomerConditions(customerId, roomId)            │
│ - checkRoomAvailability(roomId)                             │
│ - confirmReview(formId, roomId)                             │
│ - completeReview(formId, roomId) - orchestrates 3-5         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ Data Access Layer (dangKyThue.dao.ts)                       │
│ - getPendingForReview()                                     │
│ - getSelectedRooms(formId)                                  │
│ - checkCustomerConditions(customerId, roomId)               │
│ - isRoomAvailable(roomId)                                   │
│ - confirmReview(formId, roomId)                             │
│ - markAsInvalid(formId, reason)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ PostgreSQL/Supabase Database                                │
│ - phieu_dang_ky (rental forms)                              │
│ - khach_hang (customers)                                    │
│ - phong (rooms)                                             │
│ - dieu_kien_luu_tru (conditions)                            │
│ - khach_hang_dieu_kien (customer condition status)          │
│ - phong_dieu_kien (room requirements)                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Data-Driven**: Each step fetches minimal data needed to proceed
2. **Error Isolation**: Each operation has explicit error codes (A3, A4, A5)
3. **Transaction Safety**: Room assignment recorded atomically
4. **Audit Trail**: Timestamps and notes recorded for all operations
5. **Supabase Compatible**: Uses DATABASE_URL environment variable

---

## Database Schema

### Migrations Created

#### `004_add_prerenatal_review.sql`

Adds support tables for condition checking:

**Table: dieu_kien_luu_tru** (Residence Conditions)

```sql
CREATE TABLE dieu_kien_luu_tru (
  id SERIAL PRIMARY KEY,
  ten_dieu_kien VARCHAR(255) NOT NULL,     -- e.g., "Ký quỹ cơ bản"
  mo_ta TEXT,                               -- Description
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: phong_dieu_kien** (Room Requirements - M:N)

```sql
CREATE TABLE phong_dieu_kien (
  phong_id INT NOT NULL,
  dieu_kien_id INT NOT NULL,
  PRIMARY KEY (phong_id, dieu_kien_id),
  FOREIGN KEY (phong_id) REFERENCES phong(id),
  FOREIGN KEY (dieu_kien_id) REFERENCES dieu_kien_luu_tru(id)
);
```

**Table: khach_hang_dieu_kien** (Customer Condition Eligibility)

```sql
CREATE TABLE khach_hang_dieu_kien (
  id SERIAL PRIMARY KEY,
  khach_hang_id INT NOT NULL,
  dieu_kien_id INT NOT NULL,
  trang_thai VARCHAR(100) DEFAULT 'Đã duyệt', -- "Đã duyệt" or "Không hợp lệ"
  ghi_chu TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(khach_hang_id, dieu_kien_id),
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
  FOREIGN KEY (dieu_kien_id) REFERENCES dieu_kien_luu_tru(id)
);
```

**New columns in phieu_dang_ky** (Rental Registration Form)

```sql
ALTER TABLE phieu_dang_ky ADD COLUMN trang_thai_xem_xet VARCHAR(100) DEFAULT 'Chưa duyệt';
ALTER TABLE phieu_dang_ky ADD COLUMN phong_id_confirmed INT;
ALTER TABLE phieu_dang_ky ADD COLUMN ngay_xem_xet TIMESTAMP;
ALTER TABLE phieu_dang_ky ADD COLUMN ghi_chu_xem_xet TEXT;
```

#### `005_test_data_prerenatal_review.sql`

Provides 4 comprehensive test scenarios covering all business flows.

### Condition Status Values

| Status          | Meaning           | Next Action          |
| --------------- | ----------------- | -------------------- |
| "Đã duyệt"      | Condition met     | Proceed to next step |
| "Không hợp lệ"  | Condition not met | Trigger A3 error     |
| "Chưa kiểm tra" | Not yet verified  | Block with error     |

### Form Review Status Values

| Status         | Meaning                               |
| -------------- | ------------------------------------- |
| "Chưa duyệt"   | Awaiting review                       |
| "Đã duyệt"     | Review completed, room assigned       |
| "Không hợp lệ" | Customer doesn't meet conditions (A3) |

---

## API Endpoints

### Base URL

```
POST http://localhost:3001/api/dang-ky-thue
```

### Endpoints

#### Step 1: Get Pending Forms

```
GET /pending

Response (200):
{
  "success": true,
  "message": "Danh sách phiếu đăng ký chờ duyệt",
  "data": [
    {
      "id": 1,
      "ma_phieu_dang_ky": "PDK_DK01",
      "ten_khach": "Nguyễn Văn A",
      "phone_khach": "0901234567",
      "room_count": 1,
      "selected_rooms": [...]
    }
  ],
  "count": 4
}
```

#### Step 2: Get Form Details

```
GET /:id

Response (200):
{
  "success": true,
  "message": "Chi tiết phiếu đăng ký thuê",
  "data": {
    "form": {...},
    "customer": {...},
    "selected_rooms": [...]
  }
}
```

#### Step 3: Validate Conditions

```
POST /:id/validate-conditions
Body: { "room_id": 1, "khach_hang_id": 1 }

Response (200 - Valid):
{
  "success": true,
  "message": "Đối chiếu điều kiện lưu trú thành công",
  "data": {
    "customer_id": 1,
    "conditions_checked": [...],
    "all_conditions_met": true
  }
}

Response (400 - A3 Error):
{
  "success": false,
  "error": "Khách hàng không đạt điều kiện lưu trú (A3): ...",
  "code": "A3"
}
```

#### Step 4: Check Room Status

```
POST /:id/check-room/:roomId

Response (200 - Available):
{
  "success": true,
  "message": "Kiểm tra tình trạng phòng thành công",
  "data": {
    "room_id": 1,
    "ma_phong": "P01",
    "trang_thai": "Trống",
    "available": true
  }
}

Response (400 - A4 Error):
{
  "success": false,
  "error": "Phòng ... không khả dụng (A4: ...)",
  "code": "A4",
  "action": "return_to_step_2"
}
```

#### Step 5: Confirm Review

```
POST /:id/confirm-review
Body: { "room_id": 1, "ghi_chu": "..." }

Response (200 - Success):
{
  "success": true,
  "message": "Đã ghi nhận thông tin phòng thành công",
  "data": {
    "phieu_dang_ky_id": 1,
    "phong_id_confirmed": 1,
    "trang_thai_xem_xet": "Đã duyệt",
    "ngay_xem_xet": "2025-05-09T10:30:45Z"
  }
}

Response (500 - A5 Error):
{
  "success": false,
  "error": "Lỗi hệ thống",
  "code": "A5",
  "message": "Hệ thống không ghi nhận được thông tin"
}
```

#### Complete Workflow (Alternative)

```
POST /:id/complete-review
Body: { "room_id": 1 }

Executes steps 3, 4, and 5 in single request
```

---

## Frontend Component

### File: `src/app/components/PreRentalReview.tsx`

**Component Structure**:

- Step 1: Display pending forms list
- Step 2: Select form and view details
- Step 3: Show condition validation results
- Step 4: Show room status check results
- Step 5: Confirm assignment
- Step 6: Show success message or end with error

**UI Elements**:

- Form list with customer info and room count
- Room selector with availability status
- Condition checklist with pass/fail status
- Room status display
- Success/error message handlers

**State Management**:

```typescript
const [currentStep, setCurrentStep] = useState<number>(1);
const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
const [conditionCheck, setConditionCheck] = useState<...>();
const [roomStatusCheck, setRoomStatusCheck] = useState<...>();
const [error, setError] = useState<string | null>(null);
```

**Navigation Flow**:

```
Step 1 (List) → Step 2 (Form Selected)
                   ↓
Step 3 (Conditions Check)
   ├─ PASS → Step 4 (Room Check)
   │           ├─ PASS → Step 5 (Confirm)
   │           │          └─ SUCCESS → Step 6 (End)
   │           │          └─ A5 ERROR → Step 6 (End)
   │           └─ A4 ERROR → Return to Step 2
   └─ A3 ERROR → Step 6 (End)
```

---

## Test Data

### Test Scenarios

#### Test Case 1: PDK_DK01 (Valid Customer + Available Room)

- **Customer**: KH01 (Nguyễn Văn A)
- **Conditions**: All "Đã duyệt" ✓
- **Room**: P01 (Trống)
- **Expected**: SUCCESS - Form status "Đã duyệt"

#### Test Case 2: PDK_DK02 (Invalid Customer - A3)

- **Customer**: KH02 (has invalid conditions)
- **Conditions**: Some "Không hợp lệ" ✗
- **Expected**: A3 Error - Form status "Từ chối"

#### Test Case 3: PDK_DK03 (Room Unavailable - A4)

- **Customer**: KH03 (all valid)
- **Conditions**: All "Đã duyệt" ✓
- **Room**: P03 (Đang sử dụng) ✗
- **Expected**: A4 Error - Return to Step 2

#### Test Case 4: PDK_DK04 (Multiple Rooms)

- **Customer**: KH01 (valid)
- **Conditions**: All "Đã duyệt" ✓
- **Rooms**: P01, P02 (both available)
- **Expected**: SUCCESS - Can choose either room

### Condition Types

1. **Ký quỹ cơ bản** - Basic deposit requirement
2. **Giấy tờ hợp lệ** - Valid ID documents
3. **Không có tình trạng nợ** - No outstanding debt
4. **Giới tính phù hợp** - Gender compatibility
5. **Năng lực lao động** - Legal age (18+)

---

## Running Tests

### Prerequisites

1. Database migrations have been run (004, 005)
2. Server running on port 3001
3. Authentication token available

### Manual Testing via curl

```bash
# 1. Get pending forms
curl -X GET http://localhost:3001/api/dang-ky-thue/pending \
  -H "Authorization: Bearer $TOKEN"

# 2. Select form PDK_DK01
curl -X GET http://localhost:3001/api/dang-ky-thue/1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Validate conditions (should PASS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/validate-conditions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1, "khach_hang_id": 1}'

# 4. Check room (should PASS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/check-room/1 \
  -H "Authorization: Bearer $TOKEN"

# 5. Confirm review (should SUCCESS)
curl -X POST http://localhost:3001/api/dang-ky-thue/1/confirm-review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1}'
```

### SQL Verification Queries

See `006_prerenatal_review_execution_guide.sql` for:

- Test data verification
- Condition checking
- Form status validation
- Error case verification

---

## Error Handling

### Error Codes

| Code | Type         | Status | Action        | Message                  |
| ---- | ------------ | ------ | ------------- | ------------------------ |
| A3   | Invalid Info | 400    | End UC        | "Thông tin không hợp lệ" |
| A4   | Unavailable  | 400    | Return Step 2 | "Phòng không khả dụng"   |
| A5   | System Error | 500    | End UC        | "Lỗi hệ thống"           |

### Frontend Error Handling

```typescript
if (error.includes("(A3)")) {
  // Invalid information - End UC
  setCurrentStep(6);
  setError("Khách hàng không đạt điều kiện");
}

if (error.includes("(A4)")) {
  // Room unavailable - Return to Step 2
  setCurrentStep(2);
  setSelectedRoom(null);
  setError("Phòng không khả dụng. Chọn phòng khác.");
}

if (error.includes("(A5)")) {
  // System error - End UC
  setCurrentStep(6);
  setError("Lỗi hệ thống. Vui lòng thử lại.");
}
```

### Backend Error Codes

- **400**: Client error (invalid input, A3, A4)
- **404**: Not found (form, customer, room)
- **500**: A5 - Server/system error

---

## Files Modified/Created

### New Files Created:

- `server/migrations/004_add_prerenatal_review.sql`
- `server/migrations/005_test_data_prerenatal_review.sql`
- `server/migrations/006_prerenatal_review_execution_guide.sql`
- `server/migrations/PRERENATAL_REVIEW_API_TESTING_GUIDE.md`
- `server/src/dao/dangKyThue.dao.ts`
- `server/src/bus/dangKyThue.bus.ts`
- `server/src/routes/dangKyThue.routes.ts`
- `src/app/components/PreRentalReview.tsx`

### Files Modified:

- `server/src/app.ts` - Added route registration
- `src/app/App.tsx` - Added component import and routing
- `src/app/components/Sidebar.tsx` - Added menu item

### Database Migrations:

1. `004_add_prerenatal_review.sql` - Schema for conditions
2. `005_test_data_prerenatal_review.sql` - 4 test cases
3. `006_prerenatal_review_execution_guide.sql` - SQL verification queries

---

## Deployment Checklist

- [ ] Run migrations: `004_add_prerenatal_review.sql`
- [ ] Load test data: `005_test_data_prerenatal_review.sql`
- [ ] Build frontend: `npm run build`
- [ ] Start backend: `npm start`
- [ ] Test API endpoints using PRERENATAL_REVIEW_API_TESTING_GUIDE.md
- [ ] Verify database state using verification queries
- [ ] Test frontend component via browser
- [ ] Test all error scenarios (A3, A4, A5)

---

## Metrics

| Metric          | Value                            |
| --------------- | -------------------------------- |
| Steps           | 6 (main) + 3 (alternative flows) |
| Test Cases      | 4 comprehensive scenarios        |
| API Endpoints   | 5 main + 1 combined              |
| Database Tables | 3 new + 1 modified               |
| Error Codes     | 3 (A3, A4, A5)                   |
| Conditions      | 5 types                          |

---

## References

- [Vietnamese Business Process Specification](./guidelines/Guidelines.md)
- [Room Return Process](../migrations/TEST_SUITE_README.md)
- [API Testing Guide](./PRERENATAL_REVIEW_API_TESTING_GUIDE.md)
- [Execution Guide](./006_prerenatal_review_execution_guide.sql)

---
