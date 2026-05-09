import { query } from "../db";

// Adapt thanhToan DAO to use existing `phieu_thanh_toan` table in the schema.
// This maps the available fields and joins through phieu_kiem_tra -> phieu_dang_ky_tra -> hop_dong
// to expose customer and room info where possible.

export async function getAll(search?: string, trangThai?: string) {
  let sql = `
        SELECT ptt.ma_phieu_tt as ma_thanh_toan,
          ptt.ma_phieu_tt as ma_phieu,
          ptt.ma_phieu_tt as ma_thanh_toan,
          ptt.ngay_lap as created_at,
          ptt.hinh_thuc as phuong_thuc,
          ptt.trang_thai,
          k.ho_ten as ten_khach,
          hd.ma_hop_dong,
          p.ma_phong,
          NULL::text as thang,
          NULL::text as han_thanh_toan,
          0 as tong_tien,
          NULL::timestamp as ngay_thanh_toan
    FROM phieu_thanh_toan ptt
    LEFT JOIN phieu_kiem_tra pkt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
    LEFT JOIN phieu_dang_ky_tra pdt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
    LEFT JOIN hop_dong hd ON pdt.ma_hop_dong = hd.ma_hop_dong
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN hoa_don_coc hdc ON hd.ma_hoa_don = hdc.ma_hoa_don
    LEFT JOIN phieu_dang_ky dk ON hdc.ma_phieu_dk = dk.ma_phieu_dk
    LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
    LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (ptt.ma_phieu_tt ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND ptt.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ` ORDER BY ptt.ngay_lap DESC`;
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string) {
  const result = await query(
    `SELECT ptt.ma_phieu_tt as ma_thanh_toan,
           ptt.ma_phieu_tt as ma_phieu,
           ptt.ma_phieu_tt as ma_thanh_toan,
           ptt.ngay_lap as created_at,
           ptt.hinh_thuc as phuong_thuc,
           ptt.trang_thai,
           k.ho_ten as ten_khach,
           hd.ma_hop_dong,
           p.ma_phong,
           NULL::text as thang,
           NULL::text as han_thanh_toan,
           0 as tong_tien,
           NULL::timestamp as ngay_thanh_toan
     FROM phieu_thanh_toan ptt
     LEFT JOIN phieu_kiem_tra pkt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
     LEFT JOIN phieu_dang_ky_tra pdt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
    LEFT JOIN hop_dong hd ON pdt.ma_hop_dong = hd.ma_hop_dong
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN hoa_don_coc hdc ON hd.ma_hoa_don = hdc.ma_hoa_don
    LEFT JOIN phieu_dang_ky dk ON hdc.ma_phieu_dk = dk.ma_phieu_dk
    LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
    LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
     WHERE ptt.ma_phieu_tt = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_phieu_tt: string;
  ma_phieu_kt?: string;
  hinh_thuc?: string;
  trang_thai?: string;
  ma_nv_ke_toan?: string;
}) {
  const result = await query(
    `INSERT INTO phieu_thanh_toan (ma_phieu_tt, ma_phieu_kt, ngay_lap, hinh_thuc, trang_thai, ma_nv_ke_toan)
     VALUES ($1, $2, NOW(), $3, $4, $5) RETURNING *`,
    [
      data.ma_phieu_tt,
      data.ma_phieu_kt || null,
      data.hinh_thuc || null,
      data.trang_thai || "Chờ thanh toán",
      data.ma_nv_ke_toan || null,
    ],
  );
  return result.rows[0];
}

export async function markPaid(
  maThanhToan: string,
  phuongThuc: string,
): Promise<void> {
  await query(
    `UPDATE phieu_thanh_toan SET trang_thai='Đã thanh toán', hinh_thuc=$1 WHERE ma_phieu_tt=$2`,
    [phuongThuc, maThanhToan],
  );
}

export async function markOverdue(): Promise<void> {
  await query(
    `UPDATE phieu_thanh_toan SET trang_thai='Quá hạn' WHERE trang_thai='Chưa thanh toán' AND ngay_lap < CURRENT_DATE`,
  );
}

export async function getUnpaidByContract(maHopDong: string) {
  const result = await query(
    `SELECT ptt.ma_phieu_tt as ma_thanh_toan,
           ptt.ma_phieu_tt as ma_phieu,
           ptt.ngay_lap as created_at,
           ptt.hinh_thuc as phuong_thuc,
           ptt.trang_thai,
           k.ho_ten as ten_khach,
           hd.ma_hop_dong,
           p.ma_phong,
           NULL::text as thang,
           NULL::text as han_thanh_toan,
           0 as tong_tien,
           NULL::timestamp as ngay_thanh_toan
     FROM phieu_thanh_toan ptt
     LEFT JOIN phieu_kiem_tra pkt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
     LEFT JOIN phieu_dang_ky_tra pdt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
    LEFT JOIN hop_dong hd ON pdt.ma_hop_dong = hd.ma_hop_dong
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN hoa_don_coc hdc ON hd.ma_hoa_don = hdc.ma_hoa_don
    LEFT JOIN phieu_dang_ky dk ON hdc.ma_phieu_dk = dk.ma_phieu_dk
    LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
    LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
     WHERE hd.ma_hop_dong = $1 AND ptt.trang_thai IN ('Chưa thanh toán', 'Quá hạn')
     ORDER BY ptt.ngay_lap ASC`,
    [maHopDong],
  );
  return result.rows;
}

export async function getStats() {
  const result = await query(
    `SELECT
       COUNT(*) as tong_phai_thu,
       COUNT(*) FILTER (WHERE trang_thai='Đã thanh toán') as da_thu,
       COUNT(*) FILTER (WHERE trang_thai='Chưa thanh toán') as chua_thu,
       COUNT(*) FILTER (WHERE trang_thai='Quá hạn') as qua_han
     FROM phieu_thanh_toan`,
  );
  const r = result.rows[0];
  return {
    tong_phai_thu: parseInt(r.tong_phai_thu || "0", 10),
    da_thu: parseInt(r.da_thu || "0", 10),
    chua_thu: parseInt(r.chua_thu || "0", 10),
    qua_han: parseInt(r.qua_han || "0", 10),
  };
}

export async function getRecentActivity(limit = 4) {
  const result = await query(
    `SELECT 'payment' as type, k.ho_ten as customer, p.ma_phong as room, ptt.ngay_lap as time
     FROM phieu_thanh_toan ptt
     LEFT JOIN phieu_kiem_tra pkt ON ptt.ma_phieu_kt = pkt.ma_phieu_kt
     LEFT JOIN phieu_dang_ky_tra pdt ON pkt.ma_phieu_tra = pdt.ma_phieu_tra
     LEFT JOIN hop_dong hd ON pdt.ma_hop_dong = hd.ma_hop_dong
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN hop_dong_giuong hdg ON hd.ma_hop_dong = hdg.ma_hop_dong
     LEFT JOIN giuong g ON hdg.ma_giuong = g.ma_giuong
     LEFT JOIN phong p ON g.ma_phong = p.ma_phong
     ORDER BY ptt.ngay_lap DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}
