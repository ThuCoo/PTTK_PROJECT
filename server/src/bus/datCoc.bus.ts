import * as DatCocDAO from '../dao/datCoc.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as KhachHangDAO from '../dao/khachHang.dao';
import { generateNextCode } from '../utils/generateCode';

// export async function getAll(search?: string, trangThai?: string) {
//   return DatCocDAO.getAll(search, trangThai);
// }

// export async function getById(id: string) {
//   const d = await DatCocDAO.getById(id);
//   if (!d) throw new Error('Không tìm thấy phiếu đặt cọc');
//   return d;
// }

// export async function searchByCodeOrPhone(query: string) {
//   const d = await DatCocDAO.getByMaCoc(query);
//   if (!d) throw new Error('Không tìm thấy dữ liệu đặt cọc phù hợp');
//   return d;
// }

export async function create(maKhachHang: string, maPhong: string, soTienCoc: number, maNVKeToan: string) {
  const phong = await PhongDAO.getByMaPhong(maPhong);
  if (!phong) throw new Error('Phòng không tồn tại');
  if (soTienCoc <= 0) throw new Error('Số tiền cọc phải lớn hơn 0');

  const maCoc = await generateNextCode('HDC', 'hoa_doc_coc', 'ma_hoa_don');
  const hoaDon = await DatCocDAO.create({
    MaHoaDon: maCoc,
    NgayLap: new Date(),
    SoTienCoc: soTienCoc,
    MaPhieuDK: '', // Will be generated in PhieuDangKy
    MaNVKeToan: maNVKeToan,
  });

  // Update room status to "Đã cọc"
  await PhongDAO.updateStatus(maPhong, 'Đã cọc');

  return hoaDon;
}

export async function uploadProof(id: string, phuongThuc: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai === 'Đã xác nhận') throw new Error('Phiếu đặt cọc đã được xác nhận rồi');
  await DatCocDAO.uploadProof(id, phuongThuc);
}

export async function confirm(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai !== 'Chờ xác nhận') {
    throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Chờ xác nhận"');
  }
  await DatCocDAO.confirm(id);
}

export async function reject(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  await DatCocDAO.reject(id);
}

export async function cancel(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  await DatCocDAO.cancel(id);
}

export async function getStats() {
  return DatCocDAO.getStats();
}
export async function getDepositInfoByPhone(phone: string) {
  const data = await DatCocDAO.getByPhone(phone);
  if (!data) return null;

  return {
    depositCode: data.ma_hoa_don,
    customerName: data.ten_khach,
    room: data.ma_phong || 'Chưa gán',
    area: data.khu_vuc || 'N/A',
    numBeds: data.so_nguoi_du_kien || 0,
    depositAmount: parseFloat(data.so_tien_coc),
    status: data.trang_thai,
    depositDate: new Date(data.ngay_lap).toLocaleDateString('vi-VN'),
    
    // 👉 ĐƯA MẢNG MEMBERS LÊN FRONTEND
    members: data.members.map((m: any, index: number) => {
      // Chuyển ngày sinh từ DB sang YYYY-MM-DD cho input type="date"
      let formattedDate = '';
      if (m.ngaysinh) {
        const d = new Date(m.ngaysinh);
        formattedDate = d.toISOString().split('T')[0]; // Cắt lấy phần YYYY-MM-DD
      }

      return {
        id: index + 1, // ID tăng dần 1, 2, 3... để UI dùng làm key
        fullName: m.hoten || '',
        idCard: m.cccd || '',
        phone: m.sdt || '',
        dateOfBirth: formattedDate,
        permanentAddress: m.diachi || '',
        errors: {}
      };
    })
  };
}
export async function saveGroupMembers(maHD: string, members: any[]) {
  if (!maHD) throw new Error("Mã hóa đơn không hợp lệ");
  if (!members || members.length === 0) throw new Error("Vui lòng thêm ít nhất 1 thành viên");

  // Validate đảm bảo có CCCD (bắt buộc để tra cứu trùng lặp)
  for (const m of members) {
    if (!m.idCard || m.idCard.trim() === '') {
      throw new Error(`Vui lòng nhập đầy đủ CCCD cho tất cả thành viên để quản lý.`);
    }
  }

  await DatCocDAO.saveGroupMembers(maHD, members);
  return { success: true };
}