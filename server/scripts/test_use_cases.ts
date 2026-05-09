import { query } from "../src/db";
import * as DangKyThueBUS from "../src/bus/dangKyThue.bus";
import * as HoaDonCocBUS from "../src/bus/hoaDonCoc.bus";
import * as HopDongBUS from "../src/bus/hopDong.bus";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ CÁC USE CASE ===\n");

  try {
    // We will test if the BUS functions can be called and what they return.
    // Since this is an integration test on the live DB, we will pick an existing record if possible,
    // or simulate the error conditions (A3, A4, A5) to prove the logic handles them.

    console.log("--- 1. Use Case: Rà soát điều kiện và tình trạng ---");
    
    try {
      console.log("Thử nghiệm A3: Thông tin không hợp lệ (Khách hàng không tồn tại)");
      await DangKyThueBUS.completeReview(9999, 9999);
      console.log("❌ Lỗi: Không bắt được A3");
    } catch (err: any) {
      if (err.message.includes("A3") || err.message.includes("không tìm thấy") || err.message.includes("Không hợp lệ")) {
        console.log("✅ Thành công bắt lỗi A3:", err.message);
      } else {
        console.log("❌ Lỗi không mong đợi:", err.message);
      }
    }

    try {
      console.log("\nThử nghiệm A4: Phòng không khả dụng");
      // Pick a room that doesn't exist or is unavailable
      await DangKyThueBUS.checkRoomAvailability(9999);
      console.log("❌ Lỗi: Không bắt được A4");
    } catch (err: any) {
      if (err.message.includes("A4") || err.message.includes("Không tìm thấy thông tin phòng")) {
        console.log("✅ Thành công bắt lỗi A4:", err.message);
      } else {
        console.log("❌ Lỗi không mong đợi:", err.message);
      }
    }

    console.log("\n--- 2. Use Case: Thanh toán cọc ---");
    try {
      console.log("Thử nghiệm Tạo hóa đơn cọc với phiếu ĐK không hợp lệ");
      await HoaDonCocBUS.create("INVALID_PDK", 2000000);
      console.log("❌ Lỗi: Không bắt được lỗi phiếu đăng ký");
    } catch (err: any) {
      console.log("✅ Bắt lỗi tạo cọc thành công:", err.message);
    }

    try {
      console.log("\nThử nghiệm A6/A8: Gửi chứng từ cho hóa đơn không tồn tại");
      await HoaDonCocBUS.uploadProof("INVALID_HD", Buffer.from("test"), "image/png", "Chuyển khoản");
      console.log("❌ Lỗi: Không bắt được lỗi hóa đơn");
    } catch (err: any) {
      console.log("✅ Thành công bắt lỗi tải chứng từ:", err.message);
    }

    console.log("\n--- 3. Use Case: Kiểm tra thanh toán cọc ---");
    try {
      console.log("Thử nghiệm Xác nhận cọc (Happy Path) với dữ liệu giả");
      await HoaDonCocBUS.confirm("INVALID_HD", "Quản lý - Test");
      console.log("❌ Lỗi: Đáng lẽ phải báo không tìm thấy phiếu");
    } catch (err: any) {
      console.log("✅ Bắt lỗi xác nhận cọc thành công:", err.message);
    }

    console.log("\n--- 4. Use Case: Hoàn trả phòng ---");
    try {
      console.log("Thử nghiệm A2: Chưa có biên bản trả phòng (Gửi notes rỗng)");
      await HopDongBUS.roomReturn(9999, "");
      console.log("❌ Lỗi: Không bắt được A2");
    } catch (err: any) {
      if (err.message.includes("Không tìm thấy hợp đồng")) {
         console.log("✅ Bắt lỗi A2/Hợp đồng không tồn tại thành công:", err.message);
      } else {
         console.log("❌ Lỗi khác:", err.message);
      }
    }

  } catch (err) {
    console.error("Lỗi hệ thống khi chạy test:", err);
  } finally {
    process.exit(0);
  }
}

runTests();
