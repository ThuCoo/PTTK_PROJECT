import { query } from '../db';
import { ThanhToan } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<ThanhToan[]> {
  let sql = `
    SELECT pt.ma_phieu_tt as MaPhieuTT, pt.ngay_lap as NgayLap, pt.hinh_thuc as HinhThuc, pt.trang_thai as TrangThai, pt.ma_phieu_kt as MaPhieuKT, pt.ma_nv_ke_toan as MaNVKeToan, pkt.ma_phieu_kt as MaPhieuKT, pdk_tra.ma_hop_dong as MaHopDong, hd.ma_khach_hang as MaKhachHang, k.ho_ten as ten_khach, gg.ma_phong as MaPhong
    FROM phieu_thanh_toan pt
    LEFT JOIN phieu_kiem_tra pkt ON pt.ma_phieu_kt = pkt.ma_phieu_kt
    LEFT JOIN phieu_dang_ky_tra pdk_tra ON pkt.ma_phieu_tra = pdk_tra.ma_phieu_tra
    LEFT JOIN hop_dong hd ON pdk_tra.ma_hop_dong = hd.ma_hop_dong
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN hop_dong_giuong hdg ON hd.ma_hop_dong = hdg.ma_hop_dong
    LEFT JOIN giuong gg ON hdg.ma_giuong = gg.ma_giuong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (pt.ma_phieu_tt ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND pt.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY pt.ngay_lap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<ThanhToan | null> {
  const result = await query(
    `SELECT pt.ma_phieu_tt as MaPhieuTT, pt.ngay_lap as NgayLap, pt.hinh_thuc as HinhThuc, pt.trang_thai as TrangThai, pt.ma_phieu_kt as MaPhieuKT, pt.ma_nv_ke_toan as MaNVKeToan, pkt.ma_phieu_kt as MaPhieuKT, pdk_tra.ma_hop_dong as MaHopDong, hd.ma_khach_hang as MaKhachHang, k.ho_ten as ten_khach, gg.ma_phong as MaPhong
     FROM phieu_thanh_toan pt
     LEFT JOIN phieu_kiem_tra pkt ON pt.ma_phieu_kt = pkt.ma_phieu_kt
     LEFT JOIN phieu_dang_ky_tra pdk_tra ON pkt.ma_phieu_tra = pdk_tra.ma_phieu_tra
     LEFT JOIN hop_dong hd ON pdk_tra.ma_hop_dong = hd.ma_hop_dong
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN hop_dong_giuong hdg ON hd.ma_hop_dong = hdg.ma_hop_dong
     LEFT JOIN giuong gg ON hdg.ma_giuong = gg.ma_giuong
     WHERE pt.ma_phieu_tt = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  MaPhieuTT: string;
  MaPhieuKT: string;
  MaNVKeToan: string;
  HinhThuc: string;
}): Promise<ThanhToan> {
  const result = await query(
    `INSERT INTO phieu_thanh_toan (ma_phieu_tt, ngay_lap, hinh_thuc, trang_thai, ma_phieu_kt, ma_nv_ke_toan)
     VALUES ($1, NOW(), $2, 'Chờ thanh toán', $3, $4) RETURNING ma_phieu_tt as MaPhieuTT, ngay_lap as NgayLap, hinh_thuc as HinhThuc, trang_thai as TrangThai, ma_phieu_kt as MaPhieuKT, ma_nv_ke_toan as MaNVKeToan`,
    [data.MaPhieuTT, data.HinhThuc, data.MaPhieuKT, data.MaNVKeToan]
  );
  return result.rows[0];
}

export async function markPaid(id: string, phuongThuc: string): Promise<void> {
  await query(
    `UPDATE phieu_thanh_toan SET trang_thai='Đã thanh toán', hinh_thuc=$1 WHERE ma_phieu_tt=$2`,
    [phuongThuc, id]
  );
}

export async function markOverdue(): Promise<void> {
  await query(
    `UPDATE phieu_thanh_toan
     SET trang_thai='Quá hạn'
     WHERE trang_thai='Chờ thanh toán'`
  );
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COALESCE(SUM(0), 0) as tong_phai_thu,
       COALESCE(COUNT(*) FILTER (WHERE trang_thai='Đã thanh toán'), 0) as da_thu,
       COALESCE(COUNT(*) FILTER (WHERE trang_thai='Chờ thanh toán'), 0) as chua_thu,
       COALESCE(COUNT(*) FILTER (WHERE trang_thai='Quá hạn'), 0) as qua_han
     FROM phieu_thanh_toan`
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
    `SELECT 'payment' as type, k.ho_ten as customer, gg.ma_phong as room, pt.ngay_lap as time
     FROM phieu_thanh_toan pt
     JOIN phieu_kiem_tra pkt ON pt.ma_phieu_kt = pkt.ma_phieu_kt
     JOIN phieu_dang_ky_tra pdk_tra ON pkt.ma_phieu_tra = pdk_tra.ma_phieu_tra
     JOIN hop_dong hd ON pdk_tra.ma_hop_dong = hd.ma_hop_dong
     JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     JOIN hop_dong_giuong hdg ON hd.ma_hop_dong = hdg.ma_hop_dong
     JOIN giuong gg ON hdg.ma_giuong = gg.ma_giuong
     ORDER BY pt.ngay_lap DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}
