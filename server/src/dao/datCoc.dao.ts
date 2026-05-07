import { query } from '../db';
import { DatCoc } from '../types';
import { generateNextCode } from '../utils/generateCode';

export async function getAll(search?: string, trangThai?: string): Promise<DatCoc[]> {
  let sql = `
    SELECT 
      h.MaHoaDon as ma_hoa_don,
      h.NgayLap as ngay_lap,
      h.SoTienCoc as so_tien_coc,
      h.TrangThai as trang_thai,
      h.ThoiGianCoc as thoi_gian_coc,
      h.MaPhieuDK as ma_phieu_dk,
      h.MaNVKeToan as ma_nv_ke_toan,
      pdk.MaKhachHang as ma_khach_hang,
      k.HoTen as ten_khach,
      k.Sdt as phone_khach,
      pdk_p.MaPhong as ma_phong
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
    `SELECT 
      h.MaHoaDon as ma_hoa_don,
      h.NgayLap as ngay_lap,
      h.SoTienCoc as so_tien_coc,
      h.TrangThai as trang_thai,
      h.ThoiGianCoc as thoi_gian_coc,
      h.MaPhieuDK as ma_phieu_dk,
      h.MaNVKeToan as ma_nv_ke_toan,
      pdk.MaKhachHang as ma_khach_hang,
      k.HoTen as ten_khach,
      k.Sdt as phone_khach,
      pdk_p.MaPhong as ma_phong
     FROM HoaDonCoc h
     LEFT JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     WHERE h.MaHoaDon = $1`,
    [id]
  );
  return result.rows[0] || null;
}


export async function getByPhone(phone: string): Promise<any | null> {
  const result = await query(
    `SELECT 
        h.MaHoaDon as ma_hoa_don, 
        h.SoTienCoc as so_tien_coc, 
        h.NgayLap as ngay_lap,
        h.TrangThai as trang_thai,
        k.HoTen as ten_khach, 
        pdk_p.MaPhong as ma_phong,
        p.KhuVuc as khu_vuc,
        pdk.SoNguoiDuKien as so_nguoi_du_kien,
        pdk.MaPhieuDK as ma_phieu_dk
     FROM HoaDonCoc h
     JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     LEFT JOIN Phong p ON pdk_p.MaPhong = p.MaPhong
     WHERE k.Sdt = $1
     ORDER BY h.NgayLap DESC LIMIT 1`,
    [phone]
  );
  
  if (result.rows.length === 0) return null;
  
  const mainData = result.rows[0];
  
  // Lấy danh sách thành viên từ phiếu đăng ký
  const membersResult = await query(
    `SELECT kh.HoTen as hoten, kh.CCCD as cccd, kh.Sdt as sdt, kh.NgaySinh as ngaysinh
     FROM PhieuDangKy_KhachHang pk
     JOIN KhachHang kh ON pk.MaKhachHang = kh.MaKhachHang
     WHERE pk.MaPhieuDK = $1`,
    [mainData.ma_phieu_dk]
  );
  
  mainData.members = membersResult.rows || [];
  
  return mainData;
}
export async function getByMaCoc(maCoc: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT 
      h.MaHoaDon as ma_hoa_don,
      h.NgayLap as ngay_lap,
      h.SoTienCoc as so_tien_coc,
      h.TrangThai as trang_thai,
      h.ThoiGianCoc as thoi_gian_coc,
      h.MaPhieuDK as ma_phieu_dk,
      h.MaNVKeToan as ma_nv_ke_toan,
      pdk.MaKhachHang as ma_khach_hang,
      k.HoTen as ten_khach,
      k.Sdt as phone_khach,
      pdk_p.MaPhong as ma_phong
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
export async function saveGroupMembers(maHD: string, members: any[]) {
  try {
    await query('BEGIN', []);

    // 1. Lấy MaPhieuDK từ Mã Hóa Đơn Cọc
    // maPhieuDK
    const hdResult = await query(`SELECT maphieudk FROM hoadoncoc WHERE mahoadon = $1`, [maHD]);
    if (hdResult.rows.length === 0) throw new Error("Không tìm thấy hóa đơn cọc");
    const maPhieuDK = hdResult.rows[0].maphieudk;

    // 2. Xóa liên kết cũ của phiếu này (để tránh rác nếu user bấm lưu lại nhiều lần)
    await query(`DELETE FROM phieudangky_khachhang WHERE maphieudk = $1`, [maPhieuDK]);

    // 3. Xử lý từng thành viên
    for (const member of members) {
      let maKH = '';

      // Kiểm tra Khách hàng đã tồn tại trong DB chưa (dựa vào CCCD)
      const khResult = await query(`SELECT makhachhang FROM khachhang WHERE cccd = $1`, [member.idCard]);

      if (khResult.rows.length > 0) {
        // CẬP NHẬT thông tin nếu khách đã tồn tại
        maKH = khResult.rows[0].makhachhang;
        await query(
          `UPDATE KhachHang SET hoten = $1, sdt = $2, ngaysinh = $3, diachi = $4 WHERE makhachhang = $5`,
          [member.fullName, member.phone, member.dateOfBirth, member.permanentAddress, maKH]
        );
      } else {
        // THÊM MỚI khách hàng (Tạo mã KH ngẫu nhiên: KH_168... )
         maKH = await generateNextCode('kh','khachhang','makhachhang')
        await query(
          `INSERT INTO khachhang (makhachhang, hoten, cccd, Sdt, NgaySinh, DiaChi) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [maKH, member.fullName, member.idCard, member.phone, member.dateOfBirth, member.permanentAddress]
        );
      }

      // 4. Liên kết Khách hàng này với Phiếu đăng ký
      await query(
        `INSERT INTO PhieuDangKy_KhachHang (MaPhieuDK, MaKhachHang) VALUES ($1, $2)`,
        [maPhieuDK, maKH]
      );
    }

    await query('COMMIT', []);
    return true;
  } catch (error) {
    await query('ROLLBACK', []);
    throw error;
  }
  
}
// Lấy danh sách hồ sơ đủ điều kiện
export async function getAllPending() {
  const result = await query(
    `SELECT 
        h.MaHoaDon, 
        k.HoTen, 
        pdk_p.MaPhong,
        p.GiaThuePhong
     FROM HoaDonCoc h
     JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     JOIN Phong p ON pdk_p.MaPhong = p.MaPhong
     WHERE h.TrangThai = 'Đã thanh toán' 
       AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaHoaDon = h.MaHoaDon)`
  );
  return result.rows;
}

// Lấy hoặc tạo mới hợp đồng
export async function getOrCreate(maHoaDonCoc: string) {
  // 1. Kiểm tra xem hợp đồng đã tồn tại chưa
  const existResult = await query(
    `SELECT * FROM HopDong WHERE MaHoaDon = $1`, 
    [maHoaDonCoc]
  );
  if (existResult.rows.length > 0) return existResult.rows[0];

  // 2. Nếu chưa, tạo mới hợp đồng
  const maHopDong = `HD_${Date.now()}`;
  const newContract = {
    MaHopDong: maHopDong,                                                        
    NgayLap: new Date(),
    TrangThai: 'Chờ ký',
    MaHoaDon: maHoaDonCoc,
    // Lấy thông tin khách từ phiếu đăng ký để gán
    MaKhachHang: (await query(`
        SELECT pdk.MaKhachHang FROM HoaDonCoc h 
        JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK 
        WHERE h.MaHoaDon = $1`, [maHoaDonCoc])).rows[0].makhachhang
  };

  await query(
    `INSERT INTO HopDong (MaHopDong, NgayLap, TrangThai, MaHoaDon, MaKhachHang) 
     VALUES ($1, $2, $3, $4, $5)`,
    [newContract.MaHopDong, newContract.NgayLap, newContract.TrangThai, newContract.MaHoaDon, newContract.MaKhachHang]
  );
  return newContract;
}

// Cập nhật trạng thái
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  await query(
    `UPDATE HopDong SET TrangThai = $1, NgayNhanPhong = CASE WHEN $1 = 'Đang hiệu lực' THEN NOW() ELSE NgayNhanPhong END WHERE MaHopDong = $2`, 
    [trangThai, maHopDong]
  );
  return { success: true };
}