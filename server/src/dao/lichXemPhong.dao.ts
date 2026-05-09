import { query } from "../db";
import { LichXemPhong } from "../types";

export async function getAll(date?: string): Promise<LichXemPhong[]> {
  // Note: lich_xem_phong table does not exist in the canonical schema (001_init.sql)
  // This feature is not currently implemented. Returning empty array.
  return [];
}

export async function getById(id: number): Promise<LichXemPhong | null> {
  // Table does not exist in schema
  return null;
}

export async function create(data: {
  ma_khach_hang: string;
  ma_phong?: string;
  thoi_gian: string;
  ghi_chu?: string;
}): Promise<LichXemPhong> {
  // Table does not exist in schema
  throw new Error("Room viewing appointments feature is not implemented");
}

export async function updateStatus(
  maLich: string,
  trangThai: string,
): Promise<void> {
  await query("UPDATE lich_xem_phong SET trang_thai = $1 WHERE ma_lich = $2", [
    trangThai,
    maLich,
  ]);
}

export async function getTodayAppointments(): Promise<LichXemPhong[]> {
  // Table does not exist in schema
  return [];
  return result.rows;
}
