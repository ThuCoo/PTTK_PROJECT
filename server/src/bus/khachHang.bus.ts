import { query } from '../db';
import { generateNextCode } from '../utils/generateCode';

// Map database fields to frontend fields
const mapPhieuDangKyToFrontend = (row: any) => ({
  id: row.maphieudk,
  ma_phieu: row.maphieudk,
  ho_ten: row.hoten,
  phone: row.sdt,
  email: row.email,
  cccd: row.cccd,
  gioi_tinh: row.gioitinh,
  so_nguoi: row.songuoidukien,
  khu_vuc: row.khuvucmongmuon,
  loai_phong: row.loaiphong, // Could be stored in PhieuDangKy_Phong relation
  khoang_gia: null, // Would need to extract from room prices
  ngay_vao: row.ngaydukienvao,
  thoi_han_thue: null, // Could be calculated or stored separately
  ghi_chu: null, // Không có trong schema hiện tại
  loai_thue: row.hinhthucthue,
  trang_thai: row.trangthai,
  created_at: row.ngaylap,
  assignedRooms:row.assignedRooms,
});

export async function getAll(search?: string, trang_thai?: string) {
  let sql = `
    SELECT 
      pdk.ma_phieu_dk as maphieudk, pdk.so_nguoi_du_kien as songuoidukien, pdk.ngay_du_kien_vao as ngaydukienvao, pdk.trang_thai as trangthai, 
      pdk.hinh_thuc_thue as hinhthucthue, pdk.ngay_lap as ngaylap, pdk.khu_vuc_mong_muon as khuvucmongmuon, pdk.loai_phong as loaiphong,
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
  // console.log('rall ' ,result)
  return result.rows.map(mapPhieuDangKyToFrontend);
}

export async function getById(id: string) {
  const result = await query(
    `SELECT 
      pdk.ma_phieu_dk as maphieudk, pdk.so_nguoi_du_kien as songuoidukien, pdk.ngay_du_kien_vao as ngaydukienvao, pdk.trang_thai as trangthai, 
      pdk.hinh_thuc_thue as hinhthucthue, pdk.ngay_lap as ngaylap, pdk.khu_vuc_mong_muon as khuvucmongmuon, pdk.loai_phong as loaiphong,
      kh.ma_khach_hang as makhachhang, kh.ho_ten as hoten, kh.sdt, kh.email, kh.cccd, kh.gioi_tinh as gioitinh
    FROM phieu_dang_ky pdk
    JOIN khach_hang kh ON pdk.ma_khach_hang = kh.ma_khach_hang
    WHERE pdk.ma_phieu_dk = $1`,
    [id]
  );

  const row = result.rows[0];
  if (!row) throw new Error('Không tìm thấy phiếu đăng ký');
  const bedsResult = await query(
    `SELECT p.ma_phong as room, pg.ma_giuong as magiuong
     FROM phieu_dang_ky_giuong pg
     JOIN giuong g ON pg.ma_giuong = g.ma_giuong
     JOIN phong p ON g.ma_phong = p.ma_phong
     WHERE pg.ma_phieu_dk = $1`, 
    [id]
  );
  const beds2Result = await query(
    `SELECT p.ma_phong as room , g.ma_giuong as magiuong
     FROM phieu_dang_ky_phong pp
     JOIN phong p ON pp.ma_phong = p.ma_phong
     JOIN giuong g ON p.ma_phong = g.ma_phong
     WHERE pp.ma_phieu_dk = $1`, 
    [id]
  );
  console.log('bed da chon ', bedsResult)
  // Đính kèm vào kết quả trả về Frontend
  row.assignedRooms = [...bedsResult.rows, ...beds2Result.rows]; 
  
  return mapPhieuDangKyToFrontend(row);
}

export async function create(data: {
  ho_ten: string;
  phone: string;
  email?: string;
  cccd?: string;
  gioi_tinh?: string;
  so_nguoi?: number;
  khu_vuc?: string;
  loai_phong?: string;
  khoang_gia?: string;
  ngay_vao?: string;
  thoi_han_thue?: number;
  ghi_chu?: string;
  loai_thue?: string;
  trang_thai?: string;
}) {
  // console.log("toi day roi")
  if (!data.ho_ten?.trim()) throw new Error('Họ và tên là bắt buộc');
  if (!data.phone?.trim()) throw new Error('Số điện thoại là bắt buộc');

  // Step 1: Create or find existing customer by phone
  let khQuery = await query(
    'SELECT ma_khach_hang as makhachhang FROM khach_hang WHERE sdt = $1',
    [data.phone]
  );

  let maKhachHang: string;
  if (khQuery.rows.length > 0) {
    maKhachHang = khQuery.rows[0].makhachhang;
    // Update customer info
    await query(
      `UPDATE khach_hang 
       SET ho_ten = $1, email = $2, cccd = $3, gioi_tinh = $4
       WHERE ma_khach_hang = $5`,
      [data.ho_ten, data.email || null, data.cccd || null, data.gioi_tinh || 'Nam', maKhachHang]
    );
  } else {
    // Create new customer
    maKhachHang = await generateNextCode('KH', 'khach_hang', 'ma_khach_hang');
    await query(
      `INSERT INTO khach_hang (ma_khach_hang, ho_ten, sdt, email, cccd, gioi_tinh)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [maKhachHang, data.ho_ten, data.phone, data.email || null, data.cccd || null, data.gioi_tinh || 'Nam']
    );
  }

  // Step 2: Create PhieuDangKy

  const maPhieuDK = await generateNextCode('PDK', 'phieu_dang_ky', 'ma_phieu_dk');
   console.log('ma phieu dk ',maPhieuDK)
  const result = await query(
    `INSERT INTO phieu_dang_ky 
     (ma_phieu_dk, so_nguoi_du_kien, ngay_du_kien_vao, trang_thai, hinh_thuc_thue, ngay_lap, khu_vuc_mong_muon, ma_khach_hang, loai_phong)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ma_phieu_dk as maphieudk`,
    [
      maPhieuDK,
      data.so_nguoi || 1,
      data.ngay_vao || null,
      data.trang_thai || 'Đang tư vấn',
      data.loai_thue || 'Thuê ở ghép',
      new Date().toISOString().split('T')[0],
      data.khu_vuc || null,
      maKhachHang,
      data.loai_phong||'6 người'
    ]

  );
 

  // Fetch and return created data
  return getById(result.rows[0].maphieudk);
}
export async function update(id: string, data: Partial<any>) {
  // 1. Lấy thông tin hiện tại để đảm bảo tồn tại và lấy makhachhang
  const existingResult = await query(
    `SELECT ma_khach_hang as makhachhang FROM phieu_dang_ky WHERE ma_phieu_dk = $1`,
    [id]
  );
  if (existingResult.rows.length === 0) throw new Error('Không tìm thấy phiếu đăng ký');
  
  const maKhachHang = existingResult.rows[0].makhachhang;

  // 2. Xử lý cập nhật bảng KHACHHANG
  const khUpdates: string[] = [];
  const khParams: any[] = [];
  let khIdx = 1;

  if (data.ho_ten !== undefined) {
    khUpdates.push(`ho_ten = $${khIdx++}`);
    khParams.push(data.ho_ten);
  }
  if (data.email !== undefined) {
    khUpdates.push(`email = $${khIdx++}`);
    khParams.push(data.email);
  }
  if (data.cccd !== undefined) {
    khUpdates.push(`cccd = $${khIdx++}`);
    khParams.push(data.cccd);
  }
  if (data.gioi_tinh !== undefined) {
    khUpdates.push(`gioi_tinh = $${khIdx++}`);
    khParams.push(data.gioi_tinh);
  }

  if (khUpdates.length > 0) {
    khParams.push(maKhachHang);
    await query(
      `UPDATE khach_hang SET ${khUpdates.join(', ')} WHERE ma_khach_hang = $${khIdx}`,
      khParams
    );
  }

  // 3. Xử lý cập nhật bảng PHIEUDANGKY
  const pdkUpdates: string[] = [];
  const pdkParams: any[] = [];
  let pdkIdx = 1;

  if (data.so_nguoi !== undefined) {
    pdkUpdates.push(`so_nguoi_du_kien = $${pdkIdx++}`);
    pdkParams.push(data.so_nguoi);
  }
  if (data.ngay_vao !== undefined) {
    pdkUpdates.push(`ngay_du_kien_vao = $${pdkIdx++}`);
    pdkParams.push(data.ngay_vao);
  }
  if (data.loai_thue !== undefined) {
    pdkUpdates.push(`hinh_thuc_thue = $${pdkIdx++}`);
    pdkParams.push(data.loai_thue);
  }
  if (data.khu_vuc !== undefined) {
    pdkUpdates.push(`khu_vuc_mong_muon = $${pdkIdx++}`);
    pdkParams.push(data.khu_vuc);
  }
  if (data.trang_thai !== undefined) {
    pdkUpdates.push(`trang_thai = $${pdkIdx++}`);
    pdkParams.push(data.trang_thai);
  }

  if (pdkUpdates.length > 0) {
    pdkParams.push(id);
    await query(
      `UPDATE phieu_dang_ky SET ${pdkUpdates.join(', ')} WHERE ma_phieu_dk = $${pdkIdx}`,
      pdkParams
    );
  }

  return getById(id);
}

export async function updateStatus(id: string, trang_thai: string) {
  await query(
    'UPDATE phieu_dang_ky SET trang_thai = $1 WHERE ma_phieu_dk = $2',
    [trang_thai, id]
  );
  console.log('toi day roi ne ne ',trang_thai, '- ', id)
  return getById(id);
}
