import { query } from '../db';
import { ThanhToan } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<ThanhToan[]> {
  let sql = `
    SELECT pt.*, pkt.MaPhieuKT, pdk_tra.MaHopDong, hd.MaKhachHang, k.HoTen as ten_khach, gg.MaPhong
    FROM PhieuThanhToan pt
    LEFT JOIN PhieuKiemTra pkt ON pt.MaPhieuKT = pkt.MaPhieuKT
    LEFT JOIN PhieuDangKyTra pdk_tra ON pkt.MaPhieuTra = pdk_tra.MaPhieuTra
    LEFT JOIN HopDong hd ON pdk_tra.MaHopDong = hd.MaHopDong
    LEFT JOIN KhachHang k ON hd.MaKhachHang = k.MaKhachHang
    LEFT JOIN HopDong_Giuong hdg ON hd.MaHopDong = hdg.MaHopDong
    LEFT JOIN Giuong gg ON hdg.MaGiuong = gg.MaGiuong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (pt.MaPhieuTT ILIKE $${idx} OR k.HoTen ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND pt.TrangThai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY pt.NgayLap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<ThanhToan | null> {
  const result = await query(
    `SELECT pt.*, pkt.MaPhieuKT, pdk_tra.MaHopDong, hd.MaKhachHang, k.HoTen as ten_khach, gg.MaPhong
     FROM PhieuThanhToan pt
     LEFT JOIN PhieuKiemTra pkt ON pt.MaPhieuKT = pkt.MaPhieuKT
     LEFT JOIN PhieuDangKyTra pdk_tra ON pkt.MaPhieuTra = pdk_tra.MaPhieuTra
     LEFT JOIN HopDong hd ON pdk_tra.MaHopDong = hd.MaHopDong
     LEFT JOIN KhachHang k ON hd.MaKhachHang = k.MaKhachHang
     LEFT JOIN HopDong_Giuong hdg ON hd.MaHopDong = hdg.MaHopDong
     LEFT JOIN Giuong gg ON hdg.MaGiuong = gg.MaGiuong
     WHERE pt.MaPhieuTT = $1`,
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
    `INSERT INTO PhieuThanhToan (MaPhieuTT, NgayLap, HinhThuc, TrangThai, MaPhieuKT, MaNVKeToan)
     VALUES ($1, NOW(), $2, 'Chờ thanh toán', $3, $4) RETURNING *`,
    [data.MaPhieuTT, data.HinhThuc, data.MaPhieuKT, data.MaNVKeToan]
  );
  return result.rows[0];
}

export async function markPaid(id: string, phuongThuc: string): Promise<void> {
  await query(
    `UPDATE PhieuThanhToan SET TrangThai='Đã thanh toán', HinhThuc=$1 WHERE MaPhieuTT=$2`,
    [phuongThuc, id]
  );
}

export async function markOverdue(): Promise<void> {
  await query(
    `UPDATE PhieuThanhToan
     SET TrangThai='Quá hạn'
     WHERE TrangThai='Chờ thanh toán'`
  );
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COALESCE(SUM(0), 0) as tong_phai_thu,
       COALESCE(COUNT(*) FILTER (WHERE TrangThai='Đã thanh toán'), 0) as da_thu,
       COALESCE(COUNT(*) FILTER (WHERE TrangThai='Chờ thanh toán'), 0) as chua_thu,
       COALESCE(COUNT(*) FILTER (WHERE TrangThai='Quá hạn'), 0) as qua_han
     FROM PhieuThanhToan`
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
    `SELECT 'payment' as type, k.HoTen as customer, gg.MaPhong as room, pt.NgayLap as time
     FROM PhieuThanhToan pt
     JOIN PhieuKiemTra pkt ON pt.MaPhieuKT = pkt.MaPhieuKT
     JOIN PhieuDangKyTra pdk_tra ON pkt.MaPhieuTra = pdk_tra.MaPhieuTra
     JOIN HopDong hd ON pdk_tra.MaHopDong = hd.MaHopDong
     JOIN KhachHang k ON hd.MaKhachHang = k.MaKhachHang
     JOIN HopDong_Giuong hdg ON hd.MaHopDong = hdg.MaHopDong
     JOIN Giuong gg ON hdg.MaGiuong = gg.MaGiuong
     ORDER BY pt.NgayLap DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}
