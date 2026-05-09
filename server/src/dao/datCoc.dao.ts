import { query } from '../db';
import { DatCoc } from '../types';
import { generateNextCode } from '../utils/generateCode';

export async function getAll(search?: string, trangThai?: string): Promise<DatCoc[]> {
  let sql = `
    SELECT 
      h.ma_hoa_don as ma_hoa_don,
      h.ngay_lap as ngay_lap,
      h.so_tien_coc as so_tien_coc,
      h.trang_thai as trang_thai,
      h.thoi_gian_coc as thoi_gian_coc,
      h.ma_phieu_dk as ma_phieu_dk,
      h.ma_nv_ke_toan as ma_nv_ke_toan,
      pdk.ma_khach_hang as ma_khach_hang,
      k.ho_ten as ten_khach,
      k.sdt as phone_khach,
      pdk_p.ma_phong as ma_phong
    FROM hoa_don_coc h
    LEFT JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
    LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (h.ma_hoa_don ILIKE $${idx} OR k.ho_ten ILIKE $${idx} OR k.sdt ILIKE $${idx})`;
    params.push(`%${search}%`); idx++;
  }
  if (trangThai) {
    sql += ` AND h.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += ' ORDER BY h.ngay_lap DESC';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT 
      h.ma_hoa_don as ma_hoa_don,
      h.ngay_lap as ngay_lap,
      h.so_tien_coc as so_tien_coc,
      h.trang_thai as trang_thai,
      h.thoi_gian_coc as thoi_gian_coc,
      h.ma_phieu_dk as ma_phieu_dk,
      h.ma_nv_ke_toan as ma_nv_ke_toan,
      pdk.ma_khach_hang as ma_khach_hang,
      k.ho_ten as ten_khach,
      k.sdt as phone_khach,
      pdk_p.ma_phong as ma_phong
     FROM hoa_don_coc h
     LEFT JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     WHERE h.ma_hoa_don = $1`,
    [id]
  );
  return result.rows[0] || null;
}


export async function getByPhone(phone: string): Promise<any | null> {
  const result = await query(
    `SELECT 
        h.ma_hoa_don as ma_hoa_don, 
        h.so_tien_coc as so_tien_coc, 
        h.ngay_lap as ngay_lap,
        h.trang_thai as trang_thai,
        k.ho_ten as ten_khach, 
        pdk_p.ma_phong as ma_phong,
        p.khu_vuc as khu_vuc,
        pdk.so_nguoi_du_kien as so_nguoi_du_kien,
        pdk.ma_phieu_dk as ma_phieu_dk
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     LEFT JOIN phong p ON pdk_p.ma_phong = p.ma_phong
     WHERE k.sdt = $1
     ORDER BY h.ngay_lap DESC LIMIT 1`,
    [phone]
  );
  
  if (result.rows.length === 0) return null;
  
  const mainData = result.rows[0];
  
  // Lấy danh sách thành viên từ phiếu đăng ký
  const membersResult = await query(
    `SELECT kh.ho_ten as hoten, kh.cccd as cccd, kh.sdt as sdt, kh.ngay_sinh as ngaysinh
     FROM phieu_dang_ky_khach_hang pk
     JOIN khach_hang kh ON pk.ma_khach_hang = kh.ma_khach_hang
     WHERE pk.ma_phieu_dk = $1`,
    [mainData.ma_phieu_dk]
  );
  
  mainData.members = membersResult.rows || [];
  
  return mainData;
}
export async function getByMaCoc(maCoc: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT 
      h.ma_hoa_don as ma_hoa_don,
      h.ngay_lap as ngay_lap,
      h.so_tien_coc as so_tien_coc,
      h.trang_thai as trang_thai,
      h.thoi_gian_coc as thoi_gian_coc,
      h.ma_phieu_dk as ma_phieu_dk,
      h.ma_nv_ke_toan as ma_nv_ke_toan,
      pdk.ma_khach_hang as ma_khach_hang,
      k.ho_ten as ten_khach,
      k.sdt as phone_khach,
      pdk_p.ma_phong as ma_phong
     FROM hoa_don_coc h
     LEFT JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     WHERE h.ma_hoa_don = $1 OR k.sdt = $1`,
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
    `INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk, ma_nv_ke_toan)
     VALUES ($1, $2, $3, 'Chờ thanh toán', NOW(), $4, $5) RETURNING ma_hoa_don as MaHoaDon, ngay_lap as NgayLap, so_tien_coc as SoTienCoc, trang_thai as TrangThai, thoi_gian_coc as ThoiGianCoc, ma_phieu_dk as MaPhieuDK, ma_nv_ke_toan as MaNVKeToan`,
    [data.MaHoaDon, data.NgayLap, data.SoTienCoc, data.MaPhieuDK, data.MaNVKeToan]
  );
  return result.rows[0];
}

export async function uploadProof(id: string, phuongThuc: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Chờ xác nhận' WHERE ma_hoa_don=$1`,
    [id]
  );
}

export async function confirm(id: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Đã xác nhận' WHERE ma_hoa_don=$1`,
    [id]
  );
}

export async function reject(id: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Chờ thanh toán' WHERE ma_hoa_don=$1`,
    [id]
  );
}

export async function cancel(id: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Đã hủy' WHERE ma_hoa_don=$1`,
    [id]
  );
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ thanh toán') as cho_thanh_toan,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ xác nhận') as cho_xac_nhan,
       COUNT(*) FILTER (WHERE trang_thai = 'Đã xác nhận') as da_xac_nhan
     FROM hoa_don_coc`
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
    const hdResult = await query(`SELECT ma_phieu_dk as maphieudk FROM hoa_don_coc WHERE ma_hoa_don = $1`, [maHD]);
    if (hdResult.rows.length === 0) throw new Error("Không tìm thấy hóa đơn cọc");
    const maPhieuDK = hdResult.rows[0].maphieudk;

    // 2. Xóa liên kết cũ của phiếu này (để tránh rác nếu user bấm lưu lại nhiều lần)
    await query(`DELETE FROM phieu_dang_ky_khach_hang WHERE ma_phieu_dk = $1`, [maPhieuDK]);

    // 3. Xử lý từng thành viên
    for (const member of members) {
      let maKH = '';

      // Kiểm tra Khách hàng đã tồn tại trong DB chưa (dựa vào CCCD)
      const khResult = await query(`SELECT ma_khach_hang as makhachhang FROM khach_hang WHERE cccd = $1`, [member.idCard]);

      if (khResult.rows.length > 0) {
        // CẬP NHẬT thông tin nếu khách đã tồn tại
        maKH = khResult.rows[0].makhachhang;
        await query(
          `UPDATE khach_hang SET ho_ten = $1, sdt = $2, ngay_sinh = $3, dia_chi = $4 WHERE ma_khach_hang = $5`,
          [member.fullName, member.phone, member.dateOfBirth, member.permanentAddress, maKH]
        );
      } else {
        // THÊM MỚI khách hàng (Tạo mã KH ngẫu nhiên: KH_168... )
         maKH = await generateNextCode('kh','khach_hang','ma_khach_hang')
        await query(
          `INSERT INTO khach_hang (ma_khach_hang, ho_ten, cccd, sdt, ngay_sinh, dia_chi) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [maKH, member.fullName, member.idCard, member.phone, member.dateOfBirth, member.permanentAddress]
        );
      }

      // 4. Liên kết Khách hàng này với Phiếu đăng ký
      await query(
        `INSERT INTO phieu_dang_ky_khach_hang (ma_phieu_dk, ma_khach_hang) VALUES ($1, $2)`,
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
        h.ma_hoa_don, 
        k.ho_ten, 
        pdk_p.ma_phong,
        p.gia_thue_phong
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     JOIN phong p ON pdk_p.ma_phong = p.ma_phong
     WHERE h.trang_thai = 'Đã thanh toán' 
       AND NOT EXISTS (SELECT 1 FROM hop_dong hd WHERE hd.ma_hoa_don = h.ma_hoa_don)`
  );
  return result.rows;
}

// Lấy hoặc tạo mới hợp đồng
export async function getOrCreate(maHoaDonCoc: string) {
  // 1. Kiểm tra xem hợp đồng đã tồn tại chưa
  const existResult = await query(
    `SELECT * FROM hop_dong WHERE ma_hoa_don = $1`, 
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
        SELECT pdk.ma_khach_hang as makhachhang FROM hoa_don_coc h 
        JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk 
        WHERE h.ma_hoa_don = $1`, [maHoaDonCoc])).rows[0].makhachhang
  };

  await query(
    `INSERT INTO hop_dong (ma_hop_dong, ngay_lap, trang_thai, ma_hoa_don, ma_khach_hang) 
     VALUES ($1, $2, $3, $4, $5)`,
    [newContract.MaHopDong, newContract.NgayLap, newContract.TrangThai, newContract.MaHoaDon, newContract.MaKhachHang]
  );
  return newContract;
}

// Cập nhật trạng thái
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  await query(
    `UPDATE hop_dong SET trang_thai = $1, ngay_nhan_phong = CASE WHEN $1 = 'Đang hiệu lực' THEN NOW() ELSE ngay_nhan_phong END WHERE ma_hop_dong = $2`, 
    [trangThai, maHopDong]
  );
  return { success: true };
}