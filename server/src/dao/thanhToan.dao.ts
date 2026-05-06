import { query } from '../db';
import { ThanhToan } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<ThanhToan[]> {
  let sql = `
    SELECT tt.*, k.ho_ten as ten_khach, p.ma_phong
    FROM thanh_toan tt
    LEFT JOIN hop_dong hd ON tt.hop_dong_id = hd.id
    LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id
    LEFT JOIN phong p ON hd.phong_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (tt.ma_phieu ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND tt.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY tt.created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: number): Promise<ThanhToan | null> {
  const result = await query(
    `SELECT tt.*, k.ho_ten as ten_khach, p.ma_phong
     FROM thanh_toan tt
     LEFT JOIN hop_dong hd ON tt.hop_dong_id = hd.id
     LEFT JOIN khach_hang k ON hd.khach_hang_id = k.id
     LEFT JOIN phong p ON hd.phong_id = p.id
     WHERE tt.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_phieu: string;
  hop_dong_id: number;
  thang: string;
  tien_thue: number;
  tien_dien: number;
  tien_nuoc: number;
  phi_xe: number;
  tong_tien: number;
  han_thanh_toan?: string;
}): Promise<ThanhToan> {
  const result = await query(
    `INSERT INTO thanh_toan (ma_phieu, hop_dong_id, thang, tien_thue, tien_dien, tien_nuoc, phi_xe, tong_tien, han_thanh_toan)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.ma_phieu, data.hop_dong_id, data.thang, data.tien_thue, data.tien_dien,
     data.tien_nuoc, data.phi_xe, data.tong_tien, data.han_thanh_toan]
  );
  return result.rows[0];
}

export async function markPaid(id: number, phuongThuc: string): Promise<void> {
  await query(
    `UPDATE thanh_toan SET trang_thai='Đã thanh toán', ngay_thanh_toan=NOW(), phuong_thuc=$1 WHERE id=$2`,
    [phuongThuc, id]
  );
}

export async function markOverdue(): Promise<void> {
  await query(
    `UPDATE thanh_toan
     SET trang_thai='Quá hạn'
     WHERE trang_thai='Chưa thanh toán' AND han_thanh_toan < CURRENT_DATE`
  );
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COALESCE(SUM(tong_tien), 0) as tong_phai_thu,
       COALESCE(SUM(tong_tien) FILTER (WHERE trang_thai='Đã thanh toán'), 0) as da_thu,
       COALESCE(SUM(tong_tien) FILTER (WHERE trang_thai='Chưa thanh toán'), 0) as chua_thu,
       COALESCE(SUM(tong_tien) FILTER (WHERE trang_thai='Quá hạn'), 0) as qua_han
     FROM thanh_toan`
  );
  const r = result.rows[0];
  return {
    tong_phai_thu: parseInt(r.tong_phai_thu, 10),
    da_thu:        parseInt(r.da_thu, 10),
    chua_thu:      parseInt(r.chua_thu, 10),
    qua_han:       parseInt(r.qua_han, 10),
  };
}

export async function getRecentActivity(limit = 4): Promise<any[]> {
  const result = await query(
    `SELECT 'payment' as type, k.ho_ten as customer, p.ma_phong as room, tt.created_at as time
     FROM thanh_toan tt
     JOIN hop_dong hd ON tt.hop_dong_id = hd.id
     JOIN khach_hang k ON hd.khach_hang_id = k.id
     JOIN phong p ON hd.phong_id = p.id
     ORDER BY tt.created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}
