import * as DangKyThueDAO from "../dao/dangKyThue.dao";

/**
 * Step 1: Get list of pending rental registration forms for review
 * System displays screen MH_DKPhong with list of selected rooms
 */
export async function getPendingForReview() {
  const pending = await DangKyThueDAO.getPendingForReview();
  if (!pending || pending.length === 0) {
    return [];
  }

  // Enhance with room info for each form and normalize field names for frontend
  const formsWithRooms = await Promise.all(
    pending.map(async (form: any) => {
      // DAO returns ma_phieu_dk as the form identifier
      const maPhieu = form.ma_phieu_dk || form.ma_phieu_dang_ky || form.id;
      const rooms = await DangKyThueDAO.getSelectedRooms(maPhieu);
      return {
        // keep original fields
        ...form,
        // normalized fields expected by frontend
        ma_phieu_dang_ky: maPhieu,
        ten_khach: form.ten_khach || form.ho_ten,
        phone_khach: form.phone_khach || form.sdt,
        selected_rooms: rooms,
        room_count: rooms.length,
      };
    }),
  );

  return formsWithRooms;
}

/**
 * Step 2: Get form details when user selects a registration form
 */
export async function getFormDetails(maPhieuDangKy: string) {
  const form = await DangKyThueDAO.getById(maPhieuDangKy);
  if (!form) {
    throw new Error("Không tìm thấy phiếu đăng ký thuê");
  }

  const rooms = await DangKyThueDAO.getSelectedRooms(maPhieuDangKy);
  const customerInfo = await DangKyThueDAO.getCustomer(
    form.ma_khach_hang || form.khach_hang_id,
  );

  // normalize object for frontend
  return {
    form: {
      ...form,
      ma_phieu_dang_ky: form.ma_phieu_dk || form.ma_phieu_dang_ky,
    },
    customer: customerInfo,
    selected_rooms: rooms,
  };
}

/**
 * Step 3: Validate tenant information against residence conditions
 * Checks if customer meets all conditions required by the selected room
 * Returns validation result with detailed condition checks
 *
 * Alternative Flow A3: Invalid information → throws error
 */
export async function validateCustomerConditions(
  customerId: string,
  roomId: string,
) {
  // Get customer info
  const customer = await DangKyThueDAO.getCustomer(customerId);
  if (!customer) {
    throw new Error("Không tìm thấy thông tin khách hàng (A3)");
  }

  // Check basic required info
  if (!customer.cccd) {
    throw new Error(
      "Khách hàng chưa cung cấp CCCD/Hộ chiếu hợp lệ (A3: Thông tin không hợp lệ)",
    );
  }

  // Check all conditions for this room
  const conditionCheck = await DangKyThueDAO.checkCustomerConditions(
    customerId,
    roomId,
  );

  // Find any failed conditions
  const failedConditions = conditionCheck.conditions.filter(
    (c: any) => c.trang_thai_khach === "Không hợp lệ",
  );

  if (failedConditions.length > 0) {
    const failureReasons = failedConditions
      .map((c: any) => `${c.ten_dieu_kien}: ${c.ghi_chu_khach}`)
      .join("; ");

    throw new Error(
      `Khách hàng không đạt điều kiện lưu trú (A3): ${failureReasons}`,
    );
  }

  // Check if all conditions are reviewed/passed
  const unCheckedConditions = conditionCheck.conditions.filter(
    (c: any) => c.trang_thai_khach === "Chưa kiểm tra",
  );

  if (unCheckedConditions.length > 0) {
    throw new Error(
      `Chưa kiểm tra hết điều kiện: ${unCheckedConditions.map((c: any) => c.ten_dieu_kien).join(", ")} (A3)`,
    );
  }

  return {
    customer_id: customerId,
    customer_name: customer.ho_ten,
    room_id: roomId,
    conditions_checked: conditionCheck.conditions,
    all_conditions_met: conditionCheck.all_passed,
  };
}

/**
 * Step 4: Check room availability and status
 * System requests room condition check
 *
 * Alternative Flow A4: Room unavailable → throws error
 */
export async function checkRoomAvailability(roomId: string) {
  const roomStatus = await DangKyThueDAO.getRoomStatus(roomId);

  if (!roomStatus) {
    throw new Error("Không tìm thấy thông tin phòng");
  }

  // Check availability
  const isAvailable = await DangKyThueDAO.isRoomAvailable(roomId);

  if (!isAvailable) {
    throw new Error(
      `Phòng ${roomStatus.ma_phong} không khả dụng (A4: Trạng thái = ${roomStatus.trang_thai}). Vui lòng chọn phòng khác.`,
    );
  }

  return {
    room_id: roomId,
    ma_phong: roomStatus.ma_phong,
    loai_phong: roomStatus.loai_phong,
    suc_chua: roomStatus.suc_chua,
    dang_o: roomStatus.dang_o,
    gia_thue: roomStatus.gia_thue,
    trang_thai: roomStatus.trang_thai,
    available: true,
  };
}

/**
 * Step 5: Record selected room assignment for this rental registration
 * Marks form as reviewed and stores the confirmed room
 *
 * Alternative Flow A5: System error → throws error (system will catch and show error message)
 */
export async function confirmReview(
  maPhieuDangKy: string,
  maPhong: string,
  ghiChu?: string,
) {
  // Validate inputs
  if (!maPhieuDangKy || !maPhong) {
    throw new Error("Lỗi hệ thống: Thông tin không hợp lệ (A5)");
  }

  try {
    // Final validation: ensure selected room is in the form's room list
    const form = await DangKyThueDAO.getById(maPhieuDangKy);
    if (!form) {
      throw new Error("Lỗi hệ thống: Không tìm thấy phiếu đăng ký (A5)");
    }

    const selectedRooms = await DangKyThueDAO.getSelectedRooms(maPhieuDangKy);
    const roomExists = selectedRooms.some(
      (r: any) => r.ma_phong === maPhong || r.id === maPhong,
    );

    if (!roomExists) {
      throw new Error(
        "Lỗi hệ thống: Phòng được chọn không thuộc danh sách (A5)",
      );
    }

    // Record the confirmation
    const result = await DangKyThueDAO.confirmReview(
      maPhieuDangKy,
      maPhong,
      ghiChu,
    );

    if (!result) {
      throw new Error("Lỗi hệ thống: Không ghi nhận được thông tin (A5)");
    }

    // Step 6: End UC - return success with recorded data
    return {
      success: true,
      message: "Đã ghi nhận thông tin phòng thành công",
      phieu_dang_ky_id: result.ma_phieu_dk || result.id,
      phong_id_confirmed: result.phong_id_confirmed || result.ma_phong,
      trang_thai_xem_xet: result.trang_thai_xem_xet,
      ngay_xem_xet: result.ngay_xem_xet,
    };
  } catch (error: any) {
    // A5: System error handling
    throw new Error(`Lỗi hệ thống: ${error.message} (A5)`);
  }
}

/**
 * Handle condition validation failure (A3)
 * Mark form as invalid and record reason
 */
export async function handleValidationFailure(
  phieuDangKyId: number,
  reason: string,
) {
  try {
    const result = await DangKyThueDAO.markAsInvalid(phieuDangKyId, reason);
    return {
      success: true,
      message: `Đã ghi nhận lỗi: ${reason}`,
      phieu_dang_ky_id: result.id,
      trang_thai: result.trang_thai,
      trang_thai_xem_xet: result.trang_thai_xem_xet,
    };
  } catch (error: any) {
    throw new Error(`Không thể xử lý lỗi: ${error.message}`);
  }
}

/**
 * Complete pre-rental review workflow
 * Orchestrates all 6 steps + error handling
 */
export async function completeReview(
  phieuDangKyId: number,
  selectedRoomId: number,
) {
  try {
    // Step 2: Get form details
    const formDetails = await getFormDetails(phieuDangKyId);

    // Step 3: Validate customer conditions
    const conditionValidation = await validateCustomerConditions(
      formDetails.customer.id,
      selectedRoomId,
    );

    // Step 4: Check room availability
    const roomCheck = await checkRoomAvailability(selectedRoomId);

    // Step 5: Record selection
    const confirmation = await confirmReview(
      phieuDangKyId,
      selectedRoomId,
      "Duyệt từ quy trình rà soát điều kiện",
    );

    return {
      success: true,
      form: formDetails.form,
      customer: formDetails.customer,
      conditions_validation: conditionValidation,
      room_check: roomCheck,
      confirmation: confirmation,
    };
  } catch (error: any) {
    const errorMessage = error.message;

    // Determine error type and handle accordingly
    if (errorMessage.includes("(A3)")) {
      // A3: Invalid information
      await handleValidationFailure(phieuDangKyId, errorMessage);
      throw new Error(
        `A3 - Thông tin không hợp lệ: ${errorMessage.split("(A3)")[0].trim()}`,
      );
    } else if (errorMessage.includes("(A4)")) {
      // A4: Room unavailable - return to step 2
      throw new Error(
        `A4 - Phòng không khả dụng: ${errorMessage.split("(A4)")[0].trim()} Vui lòng chọn phòng khác.`,
      );
    } else if (errorMessage.includes("(A5)")) {
      // A5: System error
      throw new Error(`A5 - Lỗi hệ thống: ${errorMessage}`);
    }

    throw error;
  }
}
