import { query } from "../db";
import { DatCoc } from "../types";
import { generateNextCode } from '../utils/generateCode';
export async function getAll(
  search?: string,
  trangThai?: string,
): Promise<DatCoc[]> {
  let sql = `
    SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
    FROM dat_coc d
    LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phong p ON d.ma_phong = p.ma_phong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (d.ma_coc ILIKE $${idx} OR k.ho_ten ILIKE $${idx} OR k.phone ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND d.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY d.ngay_tao DESC";
  // Exclude encrypted image data from list view for performance
  const result = await query(sql, params);
  return result.rows.map((r) => ({ ...r, anh_chung_tu_encrypted: undefined }));
}

export async function getById(id: number): Promise<DatCoc | null> {
  const result = await query(
    `SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON d.ma_phong = p.ma_phong
     WHERE d.ma_coc = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function getByMaCoc(maCoc: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong, k.so_nguoi as num_people
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON d.ma_phong = p.ma_phong
     WHERE d.ma_coc = $1 OR k.sdt = $1`,
    [maCoc],
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_coc: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  so_tien: number;
  han_thanh_toan: Date;
}): Promise<DatCoc> {
  const result = await query(
    `INSERT INTO dat_coc (ma_coc, ma_khach_hang, ma_phong, so_giuong, so_tien, han_thanh_toan)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      data.ma_coc,
      data.ma_khach_hang,
      data.ma_phong,
      data.so_giuong,
      data.so_tien,
      data.han_thanh_toan,
    ],
  );
  return result.rows[0];
}

export async function uploadProof(
  id: number,
  encryptedData: string,
  mimeType: string,
  phuongThuc: string,
): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET anh_chung_tu_encrypted=$1,
         mime_type=$2,
         phuong_thuc=$3,
         trang_thai='Đang xử lý',
         ghi_chu=NULL,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE ma_coc=$4`,
    [encryptedData, mimeType, phuongThuc, id],
  );
}

export async function confirm(id: number, nguoiXacNhan: string): Promise<void> {
  await query(
    `UPDATE dat_coc SET trang_thai='Đã xác nhận', nguoi_xac_nhan=$1, ngay_xac_nhan=NOW() WHERE ma_coc=$2`,
    [nguoiXacNhan, id],
  );
}

export async function reject(id: number, ghiChu: string): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET trang_thai='Không hợp lệ',
         ghi_chu=$1
     WHERE ma_coc=$2`,
    [ghiChu, id],
  );
}

export async function refund(id: number, ghiChu: string): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET trang_thai='Hoàn tiền',
         ghi_chu=$1,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE ma_coc=$2`,
    [ghiChu, id],
  );
}

export async function cancel(id: number): Promise<void> {
  await query(
    `UPDATE dat_coc SET trang_thai='Quá hạn thanh toán' WHERE ma_coc=$1`,
    [id],
  );
}

export async function markOverdue(): Promise<
  Array<{ id: number; phong_id: number }>
> {
  const result = await query(
    `UPDATE dat_coc
     SET trang_thai='Quá hạn thanh toán'
     WHERE trang_thai='Chờ thanh toán'
       AND han_thanh_toan < NOW()
     RETURNING ma_coc as id, ma_phong as phong_id`,
  );
  return result.rows;
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ thanh toán') as cho_thanh_toan,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang xử lý') as dang_xu_ly,
       COUNT(*) FILTER (WHERE trang_thai = 'Không hợp lệ') as khong_hop_le,
       COUNT(*) FILTER (WHERE trang_thai = 'Đã xác nhận') as da_xac_nhan,
       COUNT(*) FILTER (WHERE trang_thai IN ('Quá hạn thanh toán', 'Đã hủy (quá hạn)')) as qua_han,
       COUNT(*) FILTER (WHERE trang_thai = 'Hoàn tiền') as hoan_tien
     FROM dat_coc`,
  );
  const r = result.rows[0];
  return {
    tong: parseInt(r.tong, 10),
    cho_thanh_toan: parseInt(r.cho_thanh_toan, 10),
    dang_xu_ly: parseInt(r.dang_xu_ly, 10),
    khong_hop_le: parseInt(r.khong_hop_le, 10),
    da_xac_nhan: parseInt(r.da_xac_nhan, 10),
    qua_han: parseInt(r.qua_han, 10),
    hoan_tien: parseInt(r.hoan_tien, 10),
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