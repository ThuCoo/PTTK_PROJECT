import { query } from '../db';
import { KhachHang } from '../types';

// ============================================================
// PHIÊU ĐĂNG KÝ
// ============================================================

export async function getPhieuDangKyAll(search?: string, trang_thai?: string): Promise<any[]> {
  let sql = `
    SELECT 
      pdk.ma_phieu_dk as maphieudk, pdk.so_nguoi_du_kien as songuoidukien, pdk.ngay_du_kien_vao as ngaydukenVao, pdk.trang_thai as trangthai, 
      pdk.hinh_thuc_thue as hinhthucthue, pdk.ngay_lap as ngaylap, pdk.khu_vuc_mong_muon as khuvucmongmuon,
      kh.ma_khach_hang as makhachhang, kh.ho_ten as hoten, kh.sdt, kh.email, kh.cccd, kh.gioi_tinh as gioitinh
    FROM phieu_dang_ky pdk
    JOIN khach_hang kh ON pdk.ma_khach_hang = kh.ma_khach_hang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (kh.ho_ten ILIKE $${idx} OR kh.sdt ILIKE $${idx} OR kh.email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  if (trang_thai) {
    sql += ` AND pdk.trang_thai = $${idx}`;
    params.push(trang_thai);
    idx++;
  }

  sql += ' ORDER BY pdk.ngay_lap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getPhieuDangKyById(id: string): Promise<any> {
  const result = await query(
    `SELECT 
      pdk.ma_phieu_dk as maphieudk, pdk.so_nguoi_du_kien as songuoidukien, pdk.ngay_du_kien_vao as ngaydukenVao, pdk.trang_thai as trangthai, 
      pdk.hinh_thuc_thue as hinhthucthue, pdk.ngay_lap as ngaylap, pdk.khu_vuc_mong_muon as khuvucmongmuon,
      kh.ma_khach_hang as makhachhang, kh.ho_ten as hoten, kh.sdt, kh.email, kh.cccd, kh.gioi_tinh as gioitinh
    FROM phieu_dang_ky pdk
    JOIN khach_hang kh ON pdk.ma_khach_hang = kh.ma_khach_hang
    WHERE pdk.ma_phieu_dk = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function findKhachHangBySdt(sdt: string): Promise<any> {
  const result = await query(
    'SELECT ma_khach_hang as makhachhang FROM khach_hang WHERE sdt = $1',
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
    `INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, email, cccd, gioi_tinh)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.makhachhang, data.hoten, data.sdt, data.email || null, data.cccd || null, data.gioitinh]
  );
}

export async function updateKhachHang(makhachhang: string, data: any): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.hoten !== undefined) {
    updates.push(`ho_ten = $${idx++}`);
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
    updates.push(`gioi_tinh = $${idx++}`);
    values.push(data.gioitinh);
  }

  if (updates.length === 0) return;

  values.push(makhachhang);
  await query(
    `UPDATE khach_hang SET ${updates.join(', ')} WHERE ma_khach_hang = $${idx}`,
    values
  );
}

export async function createPhieuDangKy(data: any): Promise<any> {
  const result = await query(
    `INSERT INTO phieu_dang_ky 
     (ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai, hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ma_phieu_dk as maphieudk`,
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
    updates.push(`so_nguoi_du_kien = $${idx++}`);
    values.push(data.songuoidukien);
  }
  if (data.ngaydukenVao !== undefined) {
    updates.push(`ngay_du_kien_vao = $${idx++}`);
    values.push(data.ngaydukenVao);
  }
  if (data.hinhthucthue !== undefined) {
    updates.push(`hinh_thuc_thue = $${idx++}`);
    values.push(data.hinhthucthue);
  }
  if (data.khuvucmongmuon !== undefined) {
    updates.push(`khu_vuc_mong_muon = $${idx++}`);
    values.push(data.khuvucmongmuon);
  }
  if (data.trangthai !== undefined) {
    updates.push(`trang_thai = $${idx++}`);
    values.push(data.trangthai);
  }

  if (updates.length === 0) return;

  values.push(id);
  await query(
    `UPDATE phieu_dang_ky SET ${updates.join(', ')} WHERE ma_phieu_dk = $${idx}`,
    values
  );
}

export async function updatePhieuDangKyStatus(id: string, trangthai: string): Promise<void> {
  await query(
    'UPDATE phieu_dang_ky SET trang_thai = $1 WHERE ma_phieu_dk = $2',
    [trangthai, id]
  );
}

// ============================================================
// KHÁCH HÀNG (Cơ bản)
// ============================================================

export async function getAll(search?: string): Promise<KhachHang[]> {
  let sql = `SELECT ma_khach_hang as makhachhang, ho_ten as hoten, sdt, cccd, gioi_tinh as gioitinh, email, ngay_sinh as ngaysinh, dia_chi as diachi FROM khach_hang WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (ho_ten ILIKE $${idx} OR sdt ILIKE $${idx} OR email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  sql += ' ORDER BY ho_ten';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(makhachhang: string): Promise<KhachHang | null> {
  const result = await query('SELECT ma_khach_hang as makhachhang, ho_ten as hoten, sdt, cccd, gioi_tinh as gioitinh, email, ngay_sinh as ngaysinh, dia_chi as diachi FROM khach_hang WHERE ma_khach_hang = $1', [makhachhang]);
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

export async function update(makhachhang: string, data: Partial<KhachHang>): Promise<KhachHang | null> {
  const fields = Object.keys(data).filter(k => k !== 'makhachhang');
  if (!fields.length) return getById(makhachhang);
  
  // Map camelCase field names to snake_case column names
  const fieldMap: Record<string, string> = {
    'hoten': 'ho_ten',
    'gioitinh': 'gioi_tinh',
    'ngaysinh': 'ngay_sinh',
    'diachi': 'dia_chi'
  };
  
  const sets = fields.map((f, i) => {
    const colName = fieldMap[f] || f;
    return `${colName} = $${i + 2}`;
  }).join(', ');
  
  const values = fields.map(f => (data as any)[f]);
  const result = await query(
    `UPDATE khach_hang SET ${sets} WHERE ma_khach_hang = $1 RETURNING ma_khach_hang as makhachhang, ho_ten as hoten, sdt, cccd, gioi_tinh as gioitinh, email, ngay_sinh as ngaysinh, dia_chi as diachi`,
    [makhachhang, ...values]
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
