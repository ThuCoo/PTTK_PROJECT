import { query } from '../db';
import { HopDong, ThanhVienNhom } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<HopDong[]> {
  let sql = `
    SELECT hd.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id
    LEFT JOIN phong p ON hd.phong_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hd.ma_hd ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND hd.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY hd.created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: number): Promise<HopDong | null> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.phone as phone_khach, p.ma_phong
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id
     LEFT JOIN phong p ON hd.phong_id = p.id
     WHERE hd.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_hd: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  gia_thue_moi_giuong: number;
  tong_tien_thue: number;
  tien_coc: number;
}): Promise<HopDong> {
  const result = await query(
    `INSERT INTO hop_dong
     (ma_hd, khach_hang_id, phong_id, so_giuong, ngay_bat_dau, ngay_ket_thuc,
      gia_thue_moi_giuong, tong_tien_thue, tien_coc)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.ma_hd, data.khach_hang_id, data.phong_id, data.so_giuong,
     data.ngay_bat_dau, data.ngay_ket_thuc, data.gia_thue_moi_giuong,
     data.tong_tien_thue, data.tien_coc]
  );
  return result.rows[0];
}

export async function sign(id: number): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đang hiệu lực', ngay_ky=CURRENT_DATE WHERE id=$1`,
    [id]
  );
}

export async function terminate(id: number): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã kết thúc' WHERE id=$1`, [id]);
}

export async function addGroupMembers(hopDongId: number, members: ThanhVienNhom[]): Promise<void> {
  for (const m of members) {
    await query(
      `INSERT INTO thanh_vien_nhom (hop_dong_id, ho_ten, cccd, phone, ngay_sinh, dia_chi_thuong_tru)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [hopDongId, m.ho_ten, m.cccd, m.phone, m.ngay_sinh, m.dia_chi_thuong_tru]
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
     FROM hop_dong`
  );
  const r = result.rows[0];
  return {
    tong:         parseInt(r.tong, 10),
    hieu_luc:     parseInt(r.hieu_luc, 10),
    cho_ky:       parseInt(r.cho_ky, 10),
    sap_het_han:  parseInt(r.sap_het_han, 10),
  };
}
