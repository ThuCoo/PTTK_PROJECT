import { query } from '../db';
import { LichXemPhong } from '../types';

export async function getAll(date?: string): Promise<LichXemPhong[]> {
  let sql = `
    SELECT pdk.*, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
    FROM PhieuDangKy pdk
    LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
    LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
    WHERE 1=1
  `;
  const params: any[] = [];
  if (date) {
    sql += ` AND DATE(pdk.NgayLap) = $1`;
    params.push(date);
  }
  sql += ' ORDER BY pdk.NgayDuKienVao ASC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<LichXemPhong | null> {
  const result = await query(
    `SELECT pdk.*, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
     FROM PhieuDangKy pdk
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     WHERE pdk.MaPhieuDK = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  MaPhieuDK: string;
  MaKhachHang: string;
  NgayDuKienVao: Date;
  KhuVucMongMuon: string;
}): Promise<LichXemPhong> {
  const result = await query(
    `INSERT INTO PhieuDangKy (MaPhieuDK, MaKhachHang, NgayDuKienVao, KhuVucMongMuon, NgayLap, TrangThai)
     VALUES ($1, $2, $3, $4, NOW(), 'Chờ xác nhận') RETURNING *`,
    [data.MaPhieuDK, data.MaKhachHang, data.NgayDuKienVao, data.KhuVucMongMuon]
  );
  return result.rows[0];
}

export async function updateStatus(id: string, trangThai: string): Promise<void> {
  await query('UPDATE PhieuDangKy SET TrangThai = $1 WHERE MaPhieuDK = $2', [trangThai, id]);
}

export async function getTodayAppointments(): Promise<LichXemPhong[]> {
  const result = await query(
    `SELECT pdk.*, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
     FROM PhieuDangKy pdk
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     WHERE DATE(pdk.NgayDuKienVao) = CURRENT_DATE
     ORDER BY pdk.NgayDuKienVao ASC`
  );
  return result.rows;
}
