import { query } from "../db";
import { Phong } from "../types";

/**
 * Get pending rental registration forms for review
 * Returns forms with status "Chờ duyệt" (Pending review)
 */
export async function getPendingForReview() {
  const result = await query(
    `
    SELECT 
      pdk.ma_phieu_dk,
      pdk.ma_khach_hang,
      pdk.ngay_lap as ngay_dang_ky,
      pdk.trang_thai,
      pdk.so_nguoi_du_kien,
      pdk.ngay_du_kien_vao as ngay_vao_du_kien,
      pdk.khu_vuc_mong_muon,
      k.ma_khach_hang as khach_hang_id,
      k.ho_ten as ten_khach,
      k.sdt as phone_khach,
      k.cccd,
      k.gioi_tinh
    FROM phieu_dang_ky pdk
    LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
    WHERE pdk.trang_thai IN ('Chờ duyệt', 'Mới', 'Đã chọn phòng', 'Sẵn sàng ký')
    ORDER BY pdk.ngay_lap DESC
    `,
    [],
  );
  return result.rows;
}

/**
 * Get rental registration form details with all selected rooms
 */
export async function getById(maPhieu: string) {
  const result = await query(
    `
    SELECT 
      pdk.ma_phieu_dk,
      pdk.ma_khach_hang,
      pdk.ngay_lap as ngay_dang_ky,
      pdk.trang_thai,
      pdk.so_nguoi_du_kien,
      pdk.ngay_du_kien_vao as ngay_vao_du_kien,
      pdk.khu_vuc_mong_muon,
      k.ho_ten as ten_khach,
      k.sdt as phone_khach,
      k.cccd,
      k.gioi_tinh
    FROM phieu_dang_ky pdk
    LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
    WHERE pdk.ma_phieu_dk = $1
    `,
    [maPhieu],
  );
  return result.rows[0] || null;
}

/**
 * Get all selected rooms for a rental registration form
 */
export async function getSelectedRooms(maPhieuDangKy: string) {
  const result = await query(
    `
    SELECT 
      p.ma_phong,
      p.loai_phong,
      p.suc_chua_toi_da as suc_chua,
      NULL as dang_o,
      p.gia_thue_phong as gia_thue,
      p.gioi_tinh_ap_dung as gioi_tinh,
      p.trang_thai,
      p.khu_vuc
    FROM phieu_dang_ky_phong pdkp
    LEFT JOIN phong p ON pdkp.ma_phong = p.ma_phong
    WHERE pdkp.ma_phieu_dk = $1
    ORDER BY p.ma_phong
    `,
    [maPhieuDangKy],
  );
  return result.rows;
}

/**
 * Check customer condition eligibility
 * Returns all conditions for the required room and customer's status for each
 */
export async function checkCustomerConditions(
  maKhachHang: string,
  maPhong: string,
) {
  // Get room's required conditions
  const roomConditions = await query(
    `
    SELECT 
      dc.ma_dieu_kien as id,
      dc.ten_dieu_kien,
      dc.mo_ta
    FROM phong_dieu_kien_thue pdk
    JOIN dieu_kien_thue dc ON pdk.ma_dieu_kien = dc.ma_dieu_kien
    WHERE pdk.ma_phong = $1
    ORDER BY dc.ma_dieu_kien
    `,
    [maPhong],
  );

  // Get customer's condition eligibility status
  const customerConditions = await query(
    `
    SELECT 
      khdk.dieu_kien_id,
      khdk.trang_thai,
      khdk.ghi_chu
    FROM khach_hang_dieu_kien khdk
    WHERE khdk.ma_khach_hang = $1 OR khdk.khach_hang_id = $1
    `,
    [maKhachHang],
  );

  // Build combined result: room requirements with customer status
  const conditionMap = new Map();
  customerConditions.rows.forEach((c: any) => {
    conditionMap.set(c.dieu_kien_id, {
      trang_thai: c.trang_thai,
      ghi_chu: c.ghi_chu,
    });
  });

  const results = roomConditions.rows.map((rc: any) => ({
    id: rc.id,
    ten_dieu_kien: rc.ten_dieu_kien,
    mo_ta: rc.mo_ta,
    trang_thai_khach: conditionMap.get(rc.id)?.trang_thai || "Chưa kiểm tra",
    ghi_chu_khach: conditionMap.get(rc.id)?.ghi_chu || null,
  }));

  return {
    room_id: maPhong,
    conditions: results,
    // Check if all conditions passed (all must be "Đã duyệt")
    all_passed: results.every((c: any) => c.trang_thai_khach === "Đã duyệt"),
  };
}

/**
 * Get room availability and status
 */
export async function getRoomStatus(maPhong: string): Promise<Phong | null> {
  const result = await query(
    `
    SELECT 
      ma_phong,
      loai_phong,
      suc_chua_toi_da as suc_chua,
      NULL as dang_o,
      gia_thue_phong as gia_thue,
      gioi_tinh_ap_dung as gioi_tinh,
      trang_thai,
      khu_vuc
    FROM phong
    WHERE ma_phong = $1
    `,
    [maPhong],
  );
  return result.rows[0] || null;
}

/**
 * Confirm pre-rental review and record selected room
 */
export async function confirmReview(
  maPhieuDangKy: string,
  maPhong: string,
  ghiChu?: string,
) {
  const result = await query(
    `
    UPDATE phieu_dang_ky
    SET 
      trang_thai_xem_xet = 'Đã duyệt',
      phong_id_confirmed = $2,
      ngay_xem_xet = CURRENT_TIMESTAMP,
      ghi_chu_xem_xet = $3,
      trang_thai = 'Sẵn sàng ký'
    WHERE ma_phieu_dk = $1
    RETURNING *
    `,
    [maPhieuDangKy, maPhong, ghiChu || null],
  );

  if (!result.rows[0]) {
    throw new Error("Không thể cập nhật phiếu đăng ký");
  }

  return result.rows[0];
}

/**
 * Get customer info for validation
 */
export async function getCustomer(maKhachHang: string) {
  const result = await query(
    `
    SELECT 
      ma_khach_hang,
      ho_ten,
      sdt,
      email,
      cccd,
      gioi_tinh
    FROM khach_hang
    WHERE ma_khach_hang = $1
    `,
    [maKhachHang],
  );
  return result.rows[0] || null;
}

/**
 * Check if room is available (can be assigned to a new rental)
 * Room status must be "Trống" or "Còn giường"
 */
export async function isRoomAvailable(maPhong: string): Promise<boolean> {
  const result = await query(
    `
    SELECT trang_thai
    FROM phong
    WHERE ma_phong = $1
    `,
    [maPhong],
  );

  if (!result.rows[0]) {
    return false;
  }

  const status = result.rows[0].trang_thai;
  return status === "Trống" || status === "Còn giường";
}

/**
 * Update form to "Không hợp lệ" status if conditions fail (A3 error)
 */
export async function markAsInvalid(maPhieuDangKy: string, reason: string) {
  const result = await query(
    `
    UPDATE phieu_dang_ky
    SET 
      trang_thai_xem_xet = 'Không hợp lệ',
      ngay_xem_xet = CURRENT_TIMESTAMP,
      ghi_chu_xem_xet = $2,
      trang_thai = 'Từ chối'
    WHERE ma_phieu_dk = $1
    RETURNING *
    `,
    [maPhieuDangKy, reason],
  );

  return result.rows[0] || null;
}
