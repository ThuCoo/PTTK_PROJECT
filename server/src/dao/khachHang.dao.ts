import { query } from '../db';
import { KhachHang } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<KhachHang[]> {
  let sql = `SELECT * FROM khach_hang WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (ho_ten ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND trang_thai = $${idx}`;
    params.push(trangThai);
    idx++;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: number): Promise<KhachHang | null> {
  const result = await query('SELECT * FROM khach_hang WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function create(data: Omit<KhachHang, 'id' | 'created_at'>): Promise<KhachHang> {
  const result = await query(
    `INSERT INTO khach_hang
     (ma_phieu, ho_ten, phone, email, cccd, gioi_tinh, so_nguoi, khu_vuc, loai_phong,
      khoang_gia, ngay_vao, thoi_han_thue, ghi_chu, loai_thue, trang_thai)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [data.ma_phieu, data.ho_ten, data.phone, data.email, data.cccd, data.gioi_tinh,
     data.so_nguoi, data.khu_vuc, data.loai_phong, data.khoang_gia, data.ngay_vao,
     data.thoi_han_thue, data.ghi_chu, data.loai_thue, data.trang_thai]
  );
  return result.rows[0];
}

export async function update(id: number, data: Partial<KhachHang>): Promise<KhachHang | null> {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  if (!fields.length) return getById(id);
  const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map(f => (data as any)[f]);
  const result = await query(
    `UPDATE khach_hang SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0] || null;
}

export async function updateStatus(id: number, trangThai: string): Promise<void> {
  await query('UPDATE khach_hang SET trang_thai = $1 WHERE id = $2', [trangThai, id]);
}

export async function countAll(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM khach_hang');
  return parseInt(result.rows[0].count, 10);
}
