import { query } from '../db';
import { HopDong, ThanhVienNhom } from '../types';

export async function getAll(search?: string, trangThai?: string): Promise<HopDong[]> {
  let sql = `
    SELECT hd.*, pdk.MaKhachHang, k.HoTen as ten_khach, k.Sdt as phone_khach, gg.MaPhong
    FROM HopDong hd
    LEFT JOIN HoaDonCoc hdc ON hd.MaHoaDon = hdc.MaHoaDon
    LEFT JOIN PhieuDangKy pdk ON hdc.MaPhieuDK = pdk.MaPhieuDK
    LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
    LEFT JOIN HopDong_Giuong hdg ON hd.MaHopDong = hdg.MaHopDong
    LEFT JOIN Giuong gg ON hdg.MaGiuong = gg.MaGiuong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hd.MaHopDong ILIKE $${idx} OR k.HoTen ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND hd.TrangThai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY hd.NgayLap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<HopDong | null> {
  const result = await query(
    `SELECT hd.*, pdk.MaKhachHang, k.HoTen as ten_khach, k.Sdt as phone_khach, gg.MaPhong
     FROM HopDong hd
     LEFT JOIN HoaDonCoc hdc ON hd.MaHoaDon = hdc.MaHoaDon
     LEFT JOIN PhieuDangKy pdk ON hdc.MaPhieuDK = pdk.MaPhieuDK
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN HopDong_Giuong hdg ON hd.MaHopDong = hdg.MaHopDong
     LEFT JOIN Giuong gg ON hdg.MaGiuong = gg.MaGiuong
     WHERE hd.MaHopDong = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: {
  MaHopDong: string;
  NgayNhanPhong: Date;
  KyThanhToan: string;
  TienBanGiao: number;
  MaKhachHang: string;
  MaHoaDon: string;
}): Promise<HopDong> {
  const result = await query(
    `INSERT INTO HopDong (MaHopDong, NgayNhanPhong, KyThanhToan, TienBanGiao, NgayLap, TrangThai, MaKhachHang, MaHoaDon)
     VALUES ($1, $2, $3, $4, NOW(), 'Chờ ký', $5, $6) RETURNING *`,
    [data.MaHopDong, data.NgayNhanPhong, data.KyThanhToan, data.TienBanGiao, data.MaKhachHang, data.MaHoaDon]
  );
  return result.rows[0];
}

export async function sign(id: string): Promise<void> {
  await query(
    `UPDATE HopDong SET TrangThai='Đang hiệu lực', NgayLap=CURRENT_DATE WHERE MaHopDong=$1`,
    [id]
  );
}

export async function terminate(id: string): Promise<void> {
  await query(`UPDATE HopDong SET TrangThai='Đã kết thúc' WHERE MaHopDong=$1`, [id]);
}

export async function addGroupMembers(hopDongId: string, members: ThanhVienNhom[]): Promise<void> {
  // Note: ThanhVienNhom table not present in new schema
  for (const m of members) {
    await query(
      `INSERT INTO ThanhVienNhom (MaHopDong, HoTen, CCCD, Sdt, NgaySinh, DiaChiThuongTru)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [hopDongId, m.ho_ten, m.cccd, m.phone, m.ngay_sinh, m.dia_chi_thuong_tru]
    );
  }
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE TrangThai = 'Đang hiệu lực') as hieu_luc,
       COUNT(*) FILTER (WHERE TrangThai = 'Chờ ký') as cho_ky,
       COUNT(*) FILTER (WHERE TrangThai = 'Đang hiệu lực') as sap_het_han
     FROM HopDong`
  );
  const r = result.rows[0];
  return {
    tong:         parseInt(r.tong, 10),
    hieu_luc:     parseInt(r.hieu_luc, 10),
    cho_ky:       parseInt(r.cho_ky, 10),
    sap_het_han:  parseInt(r.sap_het_han, 10),
  };
}
