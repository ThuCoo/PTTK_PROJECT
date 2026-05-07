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
  maphong: string;
  loaiphong: string;
  succhuatoida: number;
  giathuephong: number;
  trangthai: string;
  khuvuc: string;
  gioitinhapdung: string;
  machinhang?: string;
  tong_giuong?: number;
  giuong_trong?: number;
}

export interface Giuong {
  magiuong: string;
  giathueggiuong: number;
  trangthai: string;
  maphong: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface KhachHang {
  makhachhang: string;
  hoten: string;
  sdt: string;
  cccd?: string;
  gioitinh: string;
  email?: string;
  assignedRooms?: Array<{ room: string; bed: number | null }>;
  trang_thai?: string;
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

// ─── Registration ────────────────────────────────────────────────────────
export interface PhieuDangKy {
  maphieudk: string;
  songuoidukien: number;
  ngaydukenVao: string;
  trangthai: string;
  hinhthucthue: string;
  ngaylap: string;
  khuvucmongmuon?: string;
  makhachhang: string;
  manvsale?: string;
  loaiphong?: string;
}

// ─── Deposit ─────────────────────────────────────────────────────────────────
export interface HoaDonCoc {
  mahoadon: string;
  ngaylap: string;
  sotienCoc: number;
  trangthai: string;
  thoigian_coc: string;
  maphieudk: string;
  manvkeToan?: string;
}

// ─── Contract ────────────────────────────────────────────────────────────────
export interface HopDong {
  mahopdong: string;
  ngaynhanphong: string;
  kythanhtoan: string;
  tienbangiao: number;
  ngaylap: string;
  trangthai: string;
  makhachhang: string;
  mahoadon: string;
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
export interface PhieuThanhToan {
  maphieutt: string;
  ngaylap: string;
  hinhthuc: string;
  trangthai: string;
  maphieukt: string;
  manvkeToan?: string;
}

// ─── API Response helpers ────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
