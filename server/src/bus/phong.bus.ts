import * as PhongDAO from '../dao/phong.dao';

export async function getAll(khuVuc?: string, trangThai?: string, search?: string) {
  return PhongDAO.getAll(khuVuc, trangThai, search);
}

export async function getById(id: string) {
  const p = await PhongDAO.getById(id);
  if (!p) throw new Error('Không tìm thấy phòng');
  return p;
}

export async function findPhongPhuHop(maPhieuDK: string) {
  return PhongDAO.findPhongPhuHop(maPhieuDK);
}

export async function getStats() {
  return PhongDAO.getStats();
}

// ✅ Cập nhật giường được chọn trong phòng
export async function updateAssignedBeds(
  maPhieu:string,
  maPhong: string, 
  assignedBeds: Array<{ magiuong: string  }>
) {
  const phong = await getById(maPhong);
  
  if (!phong) {
    throw new Error(`Không tìm thấy phòng ${maPhong}`);
  }

  // Update vào database (chỉ update giường, KHÔNG update status phòng)
  const updatedPhong = await PhongDAO.updateAssignedBeds(
    maPhieu,
    maPhong,
    assignedBeds
  );

  return updatedPhong;
}
export async function unassignBed(
  maPhieu:string,
  maGiuong: string, 
) {


  // Update vào database (chỉ update giường, KHÔNG update status phòng)
  const updatedPhong = await PhongDAO.unassignBed(
    maPhieu,
    maGiuong,
  );

  return updatedPhong;
}
// Thêm hàm này vào bus
export async function assignWholeRoom(maPhieuDK: string, maPhong: string) {
  if (!maPhieuDK || !maPhong) {
    throw new Error("Mã phiếu và mã phòng không được để trống");
  }
  return await PhongDAO.assignWholeRoom(maPhieuDK, maPhong);
}