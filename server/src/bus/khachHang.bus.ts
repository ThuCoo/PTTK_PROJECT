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
      pdk.maphieudk, pdk.songuoidukien, pdk.ngaydukienvao, pdk.trangthai, 
      pdk.hinhthucthue, pdk.ngaylap, pdk.khuvucmongmuon,pdk.loaiphong,
      kh.makhachhang, kh.hoten, kh.sdt, kh.email, kh.cccd, kh.gioitinh
    FROM phieudangky pdk
    JOIN khachhang kh ON pdk.makhachhang = kh.makhachhang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
 

  if (search) {
    sql += ` AND (kh.hoten ILIKE $${idx} OR kh.sdt ILIKE $${idx} OR kh.email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  if (trang_thai) {
    sql += ` AND pdk.trangthai = $${idx}`;
    params.push(trang_thai);
    idx++;
  }

  sql += ' ORDER BY pdk.ngaylap DESC';
  const result = await query(sql, params);
  // console.log('rall ' ,result)
  return result.rows.map(mapPhieuDangKyToFrontend);
}

export async function getById(id: string) {
  const result = await query(
    `SELECT 
      pdk.maphieudk, pdk.songuoidukien, pdk.ngaydukienvao, pdk.trangthai, 
      pdk.hinhthucthue, pdk.ngaylap, pdk.khuvucmongmuon,pdk.loaiphong,
      kh.makhachhang, kh.hoten, kh.sdt, kh.email, kh.cccd, kh.gioitinh
    FROM phieudangky pdk
    JOIN khachhang kh ON pdk.makhachhang = kh.makhachhang
    WHERE pdk.maphieudk = $1`,
    [id]
  );

  const row = result.rows[0];
  if (!row) throw new Error('Không tìm thấy phiếu đăng ký');
  const bedsResult = await query(
    `SELECT p.maphong as room, pg.magiuong
     FROM PhieuDangKy_Giuong pg
     JOIN Giuong g ON pg.magiuong = g.magiuong
     JOIN Phong p ON g.maphong = p.maphong
     WHERE pg.maphieudk = $1`, 
    [id]
  );
  console.log('bed da chon ', bedsResult)
  // Đính kèm vào kết quả trả về Frontend
  row.assignedRooms = bedsResult.rows; 
  
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
    'SELECT makhachhang FROM khachhang WHERE sdt = $1',
    [data.phone]
  );

  let maKhachHang: string;
  if (khQuery.rows.length > 0) {
    maKhachHang = khQuery.rows[0].makhachhang;
    // Update customer info
    await query(
      `UPDATE khachhang 
       SET hoten = $1, email = $2, cccd = $3, gioitinh = $4
       WHERE makhachhang = $5`,
      [data.ho_ten, data.email || null, data.cccd || null, data.gioi_tinh || 'Nam', maKhachHang]
    );
  } else {
    // Create new customer
    maKhachHang = await generateNextCode('KH', 'khachhang', 'makhachhang');
    await query(
      `INSERT INTO khachhang (makhachhang, hoten, sdt, email, cccd, gioitinh)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [maKhachHang, data.ho_ten, data.phone, data.email || null, data.cccd || null, data.gioi_tinh || 'Nam']
    );
  }

  // Step 2: Create PhieuDangKy

  const maPhieuDK = await generateNextCode('PDK', 'phieudangky', 'maphieudk');
   console.log('ma phieu dk ',maPhieuDK)
  const result = await query(
    `INSERT INTO phieudangky 
     (maphieudk, songuoidukien, ngaydukienvao, trangthai, hinhthucthue, ngaylap, khuvucmongmuon, makhachhang,loaiphong)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
     RETURNING maphieudk`,
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
    `SELECT makhachhang FROM phieudangky WHERE maphieudk = $1`,
    [id]
  );
  if (existingResult.rows.length === 0) throw new Error('Không tìm thấy phiếu đăng ký');
  
  const maKhachHang = existingResult.rows[0].makhachhang;

  // 2. Xử lý cập nhật bảng KHACHHANG
  const khUpdates: string[] = [];
  const khParams: any[] = [];
  let khIdx = 1;

  if (data.ho_ten !== undefined) {
    khUpdates.push(`hoten = $${khIdx++}`);
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
    khUpdates.push(`gioitinh = $${khIdx++}`);
    khParams.push(data.gioi_tinh);
  }

  if (khUpdates.length > 0) {
    khParams.push(maKhachHang);
    await query(
      `UPDATE khachhang SET ${khUpdates.join(', ')} WHERE makhachhang = $${khIdx}`,
      khParams
    );
  }

  // 3. Xử lý cập nhật bảng PHIEUDANGKY
  const pdkUpdates: string[] = [];
  const pdkParams: any[] = [];
  let pdkIdx = 1;

  if (data.so_nguoi !== undefined) {
    pdkUpdates.push(`songuoidukien = $${pdkIdx++}`);
    pdkParams.push(data.so_nguoi);
  }
  if (data.ngay_vao !== undefined) {
    pdkUpdates.push(`ngaydukenVao = $${pdkIdx++}`);
    pdkParams.push(data.ngay_vao);
  }
  if (data.loai_thue !== undefined) {
    pdkUpdates.push(`hinhthucthue = $${pdkIdx++}`);
    pdkParams.push(data.loai_thue);
  }
  if (data.khu_vuc !== undefined) {
    pdkUpdates.push(`khuvucmongmuon = $${pdkIdx++}`);
    pdkParams.push(data.khu_vuc);
  }
  if (data.trang_thai !== undefined) {
    pdkUpdates.push(`trangthai = $${pdkIdx++}`);
    pdkParams.push(data.trang_thai);
  }

  if (pdkUpdates.length > 0) {
    pdkParams.push(id);
    await query(
      `UPDATE phieudangky SET ${pdkUpdates.join(', ')} WHERE maphieudk = $${pdkIdx}`,
      pdkParams
    );
  }

  return getById(id);
}

export async function updateStatus(id: string, trang_thai: string) {
  await query(
    'UPDATE phieudangky SET trangthai = $1 WHERE maphieudk = $2',
    [trang_thai, id]
  );
  console.log('toi day roi ne ne ',trang_thai, '- ', id)
  return getById(id);
}
