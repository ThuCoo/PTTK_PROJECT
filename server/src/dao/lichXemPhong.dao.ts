import { query } from '../db';
import { LichXemPhong } from '../types';

export async function getAll(date?: string): Promise<LichXemPhong[]> {
  let sql = `
    SELECT pdk.ma_phieu_dk as MaPhieuDK, pdk.ma_khach_hang as MaKhachHang, pdk.ngay_du_kien_vao as NgayDuKienVao, pdk.trang_thai as TrangThai, pdk.hinh_thuc_thue as HinhThucThue, k.ho_ten as ten_khach, k.sdt as phone_khach, pdk_p.ma_phong as MaPhong
    FROM phieu_dang_ky pdk
    LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
    WHERE 1=1
  `;
  const params: any[] = [];
  if (date) {
    sql += ` AND DATE(pdk.ngay_lap) = $1`;
    params.push(date);
  }
  sql += ' ORDER BY pdk.ngay_du_kien_vao ASC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<LichXemPhong | null> {
  const result = await query(
    `SELECT pdk.ma_phieu_dk as MaPhieuDK, pdk.ma_khach_hang as MaKhachHang, pdk.ngay_du_kien_vao as NgayDuKienVao, pdk.trang_thai as TrangThai, pdk.hinh_thuc_thue as HinhThucThue, k.ho_ten as ten_khach, k.sdt as phone_khach, pdk_p.ma_phong as MaPhong
     FROM phieu_dang_ky pdk
     LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     WHERE pdk.ma_phieu_dk = $1`,
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
    `INSERT INTO phieu_dang_ky (ma_phieu_dk, ma_khach_hang, ngay_du_kien_vao, khu_vuc_mong_muon, ngay_lap, trang_thai)
     VALUES ($1, $2, $3, $4, NOW(), 'Chờ xác nhận') RETURNING ma_phieu_dk as MaPhieuDK, ma_khach_hang as MaKhachHang, ngay_du_kien_vao as NgayDuKienVao, trang_thai as TrangThai, hinh_thuc_thue as HinhThucThue`,
    [data.MaPhieuDK, data.MaKhachHang, data.NgayDuKienVao, data.KhuVucMongMuon]
  );
  return result.rows[0];
}

export async function updateStatus(id: string, trangThai: string): Promise<void> {
  await query('UPDATE phieu_dang_ky SET trang_thai = $1 WHERE ma_phieu_dk = $2', [trangThai, id]);
}

export async function getTodayAppointments(): Promise<LichXemPhong[]> {
  const result = await query(
    `SELECT pdk.ma_phieu_dk as MaPhieuDK, pdk.ma_khach_hang as MaKhachHang, pdk.ngay_du_kien_vao as NgayDuKienVao, pdk.trang_thai as TrangThai, pdk.hinh_thuc_thue as HinhThucThue, k.ho_ten as ten_khach, k.sdt as phone_khach, pdk_p.ma_phong as MaPhong
     FROM phieu_dang_ky pdk
     LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     WHERE DATE(pdk.ngay_du_kien_vao) = CURRENT_DATE
     ORDER BY pdk.ngay_du_kien_vao ASC`
  );
  return result.rows;
}
