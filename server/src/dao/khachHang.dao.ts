import { query } from '../db';
import { KhachHang } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<KhachHang[]> {
  let sql = `SELECT * FROM khach_hang WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (ho_ten ILIKE $${idx} OR sdt ILIKE $${idx} OR email ILIKE $${idx})`;
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

export async function getById(maKhachHang: string): Promise<KhachHang | null> {
  const result = await query('SELECT * FROM khach_hang WHERE ma_khach_hang = $1', [maKhachHang]);
  return result.rows[0] || null;
}

export async function create(data: any): Promise<KhachHang> {
  const result = await query(
    `INSERT INTO khach_hang
     (ma_khach_hang, ho_ten, sdt, email, cccd, gioi_tinh)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [data.ma_khach_hang, data.ho_ten, data.sdt, data.email, data.cccd, data.gioi_tinh]
  );
  return result.rows[0];
}

export async function update(maKhachHang: string, data: Partial<KhachHang>): Promise<KhachHang | null> {
  const fields = Object.keys(data).filter(k => k !== 'created_at');
  if (!fields.length) return getById(maKhachHang);
  const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map(f => (data as any)[f]);
  const result = await query(
    `UPDATE khach_hang SET ${sets} WHERE ma_khach_hang = $1 RETURNING *`,
    [maKhachHang, ...values]
  );
  return result.rows[0] || null;
}

export async function updateStatus(maKhachHang: string, trangThai: string): Promise<void> {
  await query('UPDATE khach_hang SET trang_thai = $1 WHERE ma_khach_hang = $2', [trangThai, maKhachHang]);
}

export async function countAll(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM khach_hang');
  return parseInt(result.rows[0].count, 10);
}
