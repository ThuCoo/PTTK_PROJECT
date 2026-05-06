// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  ho_ten: string;
  role: 'nhan_vien' | 'quan_ly';
  email?: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: 'nhan_vien' | 'quan_ly';
}

// ─── Room ────────────────────────────────────────────────────────────────────
export interface Phong {
  id: number;
  ma_phong: string;
  khu_vuc: string;
  loai_phong: string;
  suc_chua: number;
  dang_o: number;
  gia_thue: number;
  gioi_tinh: 'Nam' | 'Nữ';
  trang_thai: 'Trống' | 'Còn giường' | 'Đang sử dụng' | 'Đã cọc';
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface KhachHang {
  id: number;
  ma_phieu: string;
  ho_ten: string;
  phone: string;
  email?: string;
  cccd?: string;
  gioi_tinh: 'Nam' | 'Nữ';
  so_nguoi: number;
  khu_vuc?: string;
  loai_phong?: string;
  khoang_gia?: string;
  ngay_vao?: string;
  thoi_han_thue?: number;
  ghi_chu?: string;
  loai_thue?: string;
  trang_thai: string;
  created_at: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────
export interface LichXemPhong {
  id: number;
  khach_hang_id: number;
  phong_id?: number;
  thoi_gian: string;
  trang_thai: string;
  ghi_chu?: string;
  // Joined fields
  ten_khach?: string;
  phone_khach?: string;
  ma_phong?: string;
}

// ─── Deposit ─────────────────────────────────────────────────────────────────
export interface DatCoc {
  id: number;
  ma_coc: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  so_tien: number;
  ngay_tao: string;
  han_thanh_toan?: string;
  trang_thai: 'Chờ thanh toán' | 'Chờ xác nhận' | 'Đã xác nhận' | 'Đã hủy (quá hạn)';
  phuong_thuc?: string;
  anh_chung_tu_encrypted?: string;
  nguoi_xac_nhan?: string;
  ngay_xac_nhan?: string;
  ghi_chu?: string;
  // Joined fields
  ten_khach?: string;
  phone_khach?: string;
  ma_phong?: string;
}

// ─── Contract ────────────────────────────────────────────────────────────────
export interface HopDong {
  id: number;
  ma_hd: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  gia_thue_moi_giuong: number;
  tong_tien_thue: number;
  tien_coc: number;
  trang_thai: 'Chờ ký' | 'Đang hiệu lực' | 'Đã kết thúc' | 'Đã hủy';
  ngay_ky?: string;
  // Joined fields
  ten_khach?: string;
  phone_khach?: string;
  ma_phong?: string;
}

// ─── Check-in group member ────────────────────────────────────────────────────
export interface ThanhVienNhom {
  id?: number;
  hop_dong_id?: number;
  ho_ten: string;
  cccd: string;
  phone?: string;
  ngay_sinh?: string;
  dia_chi_thuong_tru?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export interface ThanhToan {
  id: number;
  ma_phieu: string;
  hop_dong_id: number;
  thang: string;
  tien_thue: number;
  tien_dien: number;
  tien_nuoc: number;
  phi_xe: number;
  tong_tien: number;
  han_thanh_toan?: string;
  ngay_thanh_toan?: string;
  phuong_thuc?: string;
  trang_thai: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn';
  // Joined fields
  ten_khach?: string;
  ma_phong?: string;
}

// ─── API Response helpers ────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
