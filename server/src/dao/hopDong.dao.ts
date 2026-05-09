import { query } from "../db";
import { HopDong, ThanhVienNhom } from "../types";

export async function getAll(
  search?: string,
  trangThai?: string,
): Promise<HopDong[]> {
  let sql = `
    SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hd.ma_hd ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND hd.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY hd.created_at DESC";
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(maHopDong: string | number): Promise<HopDong | null> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     WHERE hd.ma_hop_dong = $1`,
    [String(maHopDong)],
  );
  return result.rows[0] || null;
}

export async function create(data: any): Promise<HopDong> {
  const result = await query(
    `INSERT INTO hop_dong
     (ma_hop_dong, ma_khach_hang, ma_phong, so_giuong, ngay_nhan_phong, ngay_lap, ky_thanh_toan, tien_ban_giao, trang_thai)
     VALUES ($1,$2,$3,$4,CURRENT_DATE,CURRENT_DATE,$5,$6,'Chờ ký') RETURNING *`,
    [
      data.ma_hop_dong || data.ma_hd,
      data.ma_khach_hang || data.khach_hang_id,
      data.ma_phong || data.phong_id,
      data.so_giuong,
      data.ky_thanh_toan || 'Hàng tháng',
      data.tien_ban_giao || 0,
    ],
  );
  return result.rows[0];
}

export async function sign(maHopDong: string | number): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đang hiệu lực', ngay_ky=CURRENT_DATE WHERE ma_hop_dong=$1`,
    [String(maHopDong)],
  );
}

export async function terminate(maHopDong: string | number): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã kết thúc' WHERE ma_hop_dong=$1`, [String(maHopDong)]);
}

export async function finalize(id: number): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã thanh lý' WHERE ma_hop_dong=$1`, [id]);
}

export async function recordCheckoutTime(
  id: number,
  checkoutTime: string,
): Promise<void> {
  await query(`UPDATE hop_dong SET ngay_tra_thuc_te=$1 WHERE ma_hop_dong=$2`, [
    checkoutTime,
    id,
  ]);
}

export async function getByStatus(trangThai: string): Promise<HopDong[]> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     WHERE hd.trang_thai = $1
     ORDER BY hd.created_at DESC`,
    [trangThai],
  );
  return result.rows;
}

export async function addGroupMembers(
  hopDongId: number,
  members: ThanhVienNhom[],
): Promise<void> {
  for (const m of members) {
    await query(
      `INSERT INTO thanh_vien_nhom (hop_dong_id, ho_ten, cccd, phone, ngay_sinh, dia_chi_thuong_tru)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [hopDongId, m.ho_ten, m.cccd, m.phone, m.ngay_sinh, m.dia_chi_thuong_tru],
    );
  }
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực') as hieu_luc,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ ký') as cho_ky,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực' AND ngay_ket_thuc <= CURRENT_DATE + 30) as sap_het_han
     FROM hop_dong`,
  );
  const r = result.rows[0];
  return {
    tong: parseInt(r.tong, 10),
    hieu_luc: parseInt(r.hieu_luc, 10),
    cho_ky: parseInt(r.cho_ky, 10),
    sap_het_han: parseInt(r.sap_het_han, 10),
  };
}
