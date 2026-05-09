import dotenv from "dotenv";
import { createUser } from "../bus/auth.bus";

dotenv.config();

async function run() {
  try {
    console.log("Seeding users...");

    try {
      const admin = await createUser(
        "admin",
        "password123",
        "Quản lý",
        "quan_ly",
        "admin@example.com",
      );
      console.log("Created admin:", admin.username);
    } catch (e: any) {
      console.warn("Admin create skipped:", e.message || e);
    }

    try {
      const staff = await createUser(
        "nhanvien",
        "password123",
        "Nhân viên",
        "nhan_vien",
        "nhanvien@example.com",
      );
      console.log("Created staff:", staff.username);
    } catch (e: any) {
      console.warn("Staff create skipped:", e.message || e);
    }

    console.log("Seeding completed.");
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
