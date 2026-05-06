import { query } from '../db';
import { DatCoc } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<DatCoc[]> {
  let sql = `
    SELECT h.*, pdk.MaPhieuDK, pdk.MaKhachHang, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
    FROM HoaDonCoc h
    LEFT JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
    LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
    LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (h.MaHoaDon ILIKE $${idx} OR k.HoTen ILIKE $${idx} OR k.Sdt ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND h.TrangThai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY h.NgayLap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT h.*, pdk.MaPhieuDK, pdk.MaKhachHang, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
     FROM HoaDonCoc h
     LEFT JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     WHERE h.MaHoaDon = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getByMaCoc(maCoc: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT h.*, pdk.MaPhieuDK, pdk.MaKhachHang, k.HoTen as ten_khach, k.Sdt as phone_khach, pdk_p.MaPhong
     FROM HoaDonCoc h
     LEFT JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     WHERE h.MaHoaDon = $1 OR k.Sdt = $1`,
    [maCoc]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  MaHoaDon: string;
  NgayLap: Date;
  SoTienCoc: number;
  MaPhieuDK: string;
  MaNVKeToan: string;
}): Promise<DatCoc> {
  const result = await query(
    `INSERT INTO HoaDonCoc (MaHoaDon, NgayLap, SoTienCoc, TrangThai, ThoiGianCoc, MaPhieuDK, MaNVKeToan)
     VALUES ($1, $2, $3, 'Chờ thanh toán', NOW(), $4, $5) RETURNING *`,
    [data.MaHoaDon, data.NgayLap, data.SoTienCoc, data.MaPhieuDK, data.MaNVKeToan]
  );
  return result.rows[0];
}

export async function uploadProof(id: string, phuongThuc: string): Promise<void> {
  await query(
    `UPDATE HoaDonCoc SET TrangThai='Chờ xác nhận', PhuongThucTT=$1 WHERE MaHoaDon=$2`,
    [phuongThuc, id]
  );
}

export async function confirm(id: string): Promise<void> {
  await query(
    `UPDATE HoaDonCoc SET TrangThai='Đã xác nhận' WHERE MaHoaDon=$1`,
    [id]
  );
}

export async function reject(id: string): Promise<void> {
  await query(
    `UPDATE HoaDonCoc SET TrangThai='Chờ thanh toán' WHERE MaHoaDon=$1`,
    [id]
  );
}

export async function cancel(id: string): Promise<void> {
  await query(
    `UPDATE HoaDonCoc SET TrangThai='Đã hủy' WHERE MaHoaDon=$1`,
    [id]
  );
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE TrangThai = 'Chờ thanh toán') as cho_thanh_toan,
       COUNT(*) FILTER (WHERE TrangThai = 'Chờ xác nhận') as cho_xac_nhan,
       COUNT(*) FILTER (WHERE TrangThai = 'Đã xác nhận') as da_xac_nhan
     FROM HoaDonCoc`
  );
  const r = result.rows[0];
  return {
    tong:             parseInt(r.tong, 10),
    cho_thanh_toan:   parseInt(r.cho_thanh_toan, 10),
    cho_xac_nhan:     parseInt(r.cho_xac_nhan, 10),
    da_xac_nhan:      parseInt(r.da_xac_nhan, 10),
  };
}
