import { query } from '../db';
import { KhachHang } from '../types';

// ============================================================
// PHIÊU ĐĂNG KÝ
// ============================================================

export async function getPhieuDangKyAll(search?: string, trang_thai?: string): Promise<any[]> {
  let sql = `
    SELECT 
      pdk.maphieudk, pdk.songuoidukien, pdk.ngaydukenVao, pdk.trangthai, 
      pdk.hinhthucthue, pdk.ngaylap, pdk.khuvucmongmuon,
      kh.makhachhang, kh.hoten, kh.sdt, kh.email, kh.cccd, kh.gioitinh
    FROM phieudangky pdk
    JOIN khachhang kh ON pdk.makhachhang = kh.makhachhang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (kh.hoten ILIKE $${idx} OR kh.sdt ILIKE $${idx} OR kh.email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  if (trang_thai) {
    sql += ` AND pdk.trangthai = $${idx}`;
    params.push(trang_thai);
    idx++;
  }

  sql += ' ORDER BY pdk.ngaylap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getPhieuDangKyById(id: string): Promise<any> {
  const result = await query(
    `SELECT 
      pdk.maphieudk, pdk.songuoidukien, pdk.ngaydukenVao, pdk.trangthai, 
      pdk.hinhthucthue, pdk.ngaylap, pdk.khuvucmongmuon,
      kh.makhachhang, kh.hoten, kh.sdt, kh.email, kh.cccd, kh.gioitinh
    FROM phieudangky pdk
    JOIN khachhang kh ON pdk.makhachhang = kh.makhachhang
    WHERE pdk.maphieudk = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function findKhachHangBySdt(sdt: string): Promise<any> {
  const result = await query(
    'SELECT makhachhang FROM khachhang WHERE sdt = $1',
    [sdt]
  );
  return result.rows[0] || null;
}

export async function createKhachHang(data: {
  makhachhang: string;
  hoten: string;
  sdt: string;
  email?: string | null;
  cccd?: string | null;
  gioitinh: string;
}): Promise<any> {
  await query(
    `INSERT INTO khachhang (makhachhang, hoten, sdt, email, cccd, gioitinh)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.makhachhang, data.hoten, data.sdt, data.email || null, data.cccd || null, data.gioitinh]
  );
}

export async function updateKhachHang(makhachhang: string, data: any): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.hoten !== undefined) {
    updates.push(`hoten = $${idx++}`);
    values.push(data.hoten);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.cccd !== undefined) {
    updates.push(`cccd = $${idx++}`);
    values.push(data.cccd);
  }
  if (data.gioitinh !== undefined) {
    updates.push(`gioitinh = $${idx++}`);
    values.push(data.gioitinh);
  }

  if (updates.length === 0) return;

  values.push(makhachhang);
  await query(
    `UPDATE khachhang SET ${updates.join(', ')} WHERE makhachhang = $${idx}`,
    values
  );
}

export async function createPhieuDangKy(data: any): Promise<any> {
  const result = await query(
    `INSERT INTO phieudangky 
     (maphieudk, songuoidukien, ngaydukenVao, trangthai, hinhthucthue, ngaylap, khuvucmongmuon, makhachhang)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING maphieudk`,
    [
      data.maphieudk,
      data.songuoidukien || 1,
      data.ngaydukenVao || null,
      data.trangthai || 'Đang tư vấn',
      data.hinhthucthue || 'Thuê ở ghép',
      data.ngaylap,
      data.khuvucmongmuon || null,
      data.makhachhang
    ]
  );
  return result.rows[0];
}

export async function updatePhieuDangKy(id: string, data: any): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.songuoidukien !== undefined) {
    updates.push(`songuoidukien = $${idx++}`);
    values.push(data.songuoidukien);
  }
  if (data.ngaydukenVao !== undefined) {
    updates.push(`ngaydukenVao = $${idx++}`);
    values.push(data.ngaydukenVao);
  }
  if (data.hinhthucthue !== undefined) {
    updates.push(`hinhthucthue = $${idx++}`);
    values.push(data.hinhthucthue);
  }
  if (data.khuvucmongmuon !== undefined) {
    updates.push(`khuvucmongmuon = $${idx++}`);
    values.push(data.khuvucmongmuon);
  }
  if (data.trangthai !== undefined) {
    updates.push(`trangthai = $${idx++}`);
    values.push(data.trangthai);
  }

  if (updates.length === 0) return;

  values.push(id);
  await query(
    `UPDATE phieudangky SET ${updates.join(', ')} WHERE maphieudk = $${idx}`,
    values
  );
}

export async function updatePhieuDangKyStatus(id: string, trangthai: string): Promise<void> {
  await query(
    'UPDATE phieudangky SET trangthai = $1 WHERE maphieudk = $2',
    [trangthai, id]
  );
}

// ============================================================
// KHÁCH HÀNG (Cơ bản)
// ============================================================

export async function getAll(search?: string): Promise<KhachHang[]> {
  let sql = `SELECT * FROM khachhang WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hoten ILIKE $${idx} OR sdt ILIKE $${idx} OR email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  sql += ' ORDER BY hoten';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(makhachhang: string): Promise<KhachHang | null> {
  const result = await query('SELECT * FROM khachhang WHERE makhachhang = $1', [makhachhang]);
  return result.rows[0] || null;
}

export async function create(data: {
  makhachhang: string;
  hoten: string;
  sdt: string;
  cccd: string;
  gioitinh: string;
  email: string;
}): Promise<KhachHang> {
  const result = await query(
    `INSERT INTO khachhang (makhachhang, hoten, sdt, cccd, gioitinh, email)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.makhachhang, data.hoten, data.sdt, data.cccd, data.gioitinh, data.email]
  );
  return result.rows[0];
}

export async function update(makhachhang: string, data: Partial<KhachHang>): Promise<KhachHang | null> {
  const fields = Object.keys(data).filter(k => k !== 'makhachhang');
  if (!fields.length) return getById(makhachhang);
  const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map(f => (data as any)[f]);
  const result = await query(
    `UPDATE khachhang SET ${sets} WHERE makhachhang = $1 RETURNING *`,
    [makhachhang, ...values]
  );
  return result.rows[0] || null;
}

export async function countAll(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM khachhang');
  return parseInt(result.rows[0].count, 10);
}
