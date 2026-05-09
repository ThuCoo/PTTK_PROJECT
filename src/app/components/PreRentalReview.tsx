import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Home,
  User,
  Clock,
  ChevronRight,
} from "lucide-react";

interface RegistrationForm {
  id: number;
  ma_phieu_dang_ky: string;
  ten_khach: string;
  phone_khach: string;
  so_nguoi_du_kien: number;
  ngay_vao_du_kien: string;
  khu_vuc_mong_muon: string;
  room_count: number;
  selected_rooms: Room[];
}

interface Room {
  id: number;
  ma_phong: string;
  loai_phong: string;
  suc_chua: number;
  dang_o: number;
  gia_thue: number;
  gioi_tinh: string;
  trang_thai: string;
}

interface Condition {
  id: number;
  ten_dieu_kien: string;
  mo_ta: string;
  trang_thai_khach: string;
  ghi_chu_khach?: string;
}

export function PreRentalReview() {
  // ─── UI State ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<number>(1); // 1-6: steps + end
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Data State ─────────────────────────────────────────────────────────
  const [registrationForms, setRegistrationForms] = useState<
    RegistrationForm[]
  >([]);
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(
    null,
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formDetails, setFormDetails] = useState<any>(null);
  const [conditionCheck, setConditionCheck] = useState<{
    conditions: Condition[];
    all_conditions_met: boolean;
  } | null>(null);
  const [roomStatusCheck, setRoomStatusCheck] = useState<any>(null);

  // ─── Step 1: Load pending registration forms ─────────────────────────────
  useEffect(() => {
    const fetchPendingForms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dang-ky-thue/pending", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.success) {
          setRegistrationForms(data.data);
          if (data.data.length === 0) {
            setError("Không có phiếu đăng ký nào chờ duyệt.");
          }
        } else {
          setError(data.error || "Lỗi khi lấy danh sách phiếu đăng ký");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingForms();
  }, []);

  // ─── Handle form selection (Step 2) ──────────────────────────────────────
  const handleSelectForm = async (form: RegistrationForm) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessing(true);

      // Fetch form details
      const response = await fetch(`/api/dang-ky-thue/${form.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedForm(form);
        setFormDetails(data.data);
        setCurrentStep(2); // Move to step 2: form selected
        setSuccessMessage("Đã chọn phiếu đăng ký thuê");
      } else {
        setError(data.error || "Lỗi khi tải chi tiết phiếu");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Handle room selection ───────────────────────────────────────────────
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setError(null);
    setSuccessMessage(null);
  };

  // ─── Step 3: Validate customer conditions ────────────────────────────────
  const handleValidateConditions = async () => {
    if (!selectedForm || !selectedRoom) {
      setError("Vui lòng chọn phòng trước");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessing(true);

      const response = await fetch(
        `/api/dang-ky-thue/${selectedForm.id}/validate-conditions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: selectedRoom.id,
            khach_hang_id: formDetails.customer.id,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setConditionCheck(data.data);
        setCurrentStep(3); // Move to step 3: conditions validated
        setSuccessMessage("Đối chiếu điều kiện lưu trú thành công");
      } else {
        // A3: Invalid information
        if (data.code === "A3") {
          setCurrentStep(6); // End UC
          setError(
            `[A3] Thông tin không hợp lệ: ${data.error || data.message}`,
          );
        } else {
          setError(data.error || "Lỗi khi đối chiếu điều kiện");
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Step 4: Check room availability ─────────────────────────────────────
  const handleCheckRoomStatus = async () => {
    if (!selectedForm || !selectedRoom) {
      setError("Vui lòng chọn phòng");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessing(true);

      const response = await fetch(
        `/api/dang-ky-thue/${selectedForm.id}/check-room/${selectedRoom.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (data.success) {
        setRoomStatusCheck(data.data);
        setCurrentStep(4); // Move to step 4: room checked
        setSuccessMessage("Kiểm tra tình trạng phòng thành công");
      } else {
        // A4: Room unavailable
        if (data.code === "A4") {
          setCurrentStep(2); // Return to step 2
          setError(`[A4] Phòng không khả dụng: ${data.error || data.message}`);
          setSelectedRoom(null);
        } else {
          setError(data.error || "Lỗi khi kiểm tra phòng");
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Step 5: Confirm review and record room assignment ──────────────────
  const handleConfirmReview = async () => {
    if (!selectedForm || !selectedRoom) {
      setError("Thông tin không đủ");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessing(true);

      const response = await fetch(
        `/api/dang-ky-thue/${selectedForm.id}/confirm-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: selectedRoom.id,
            ghi_chu: "Đã duyệt từ quy trình rà soát điều kiện",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setCurrentStep(6); // Move to step 6: End UC
        setSuccessMessage(
          `✓ Đã ghi nhận thành công: Phòng ${selectedRoom.ma_phong} cho ${formDetails.customer.ho_ten}`,
        );
      } else {
        // A5: System error
        if (data.code === "A5") {
          setCurrentStep(6); // End UC
          setError(
            `[A5] Lỗi hệ thống: ${data.error || data.details || "Không ghi nhận được thông tin"}`,
          );
        } else {
          setError(data.error || "Lỗi khi ghi nhận thông tin");
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Reset for next review ───────────────────────────────────────────────
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedForm(null);
    setSelectedRoom(null);
    setFormDetails(null);
    setConditionCheck(null);
    setRoomStatusCheck(null);
    setError(null);
    setSuccessMessage(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center">
          <Clock className="animate-spin mr-2" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900">
        Rà soát Điều kiện & Tình trạng Phòng
      </h1>

      {/* Error Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Lỗi</h3>
            <p className="text-red-700">{error}</p>
            {error.includes("(A4)") && currentStep === 2 && (
              <p className="text-sm text-red-600 mt-2">
                💡 Vui lòng chọn phòng khác từ danh sách
              </p>
            )}
            {error.includes("(A3)") && currentStep === 6 && (
              <p className="text-sm text-red-600 mt-2">
                💡 Khách hàng không đạt điều kiện lưu trú. UC kết thúc.
              </p>
            )}
            {error.includes("(A5)") && currentStep === 6 && (
              <p className="text-sm text-red-600 mt-2">
                💡 Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Bước {currentStep}
          </div>
          <span className="ml-3 text-gray-600">
            {currentStep === 1 && "Danh sách phiếu đăng ký"}
            {currentStep === 2 && "Chọn phòng"}
            {currentStep === 3 && "Kiểm tra điều kiện"}
            {currentStep === 4 && "Kiểm tra tình trạng phòng"}
            {currentStep === 5 && "Ghi nhận thông tin"}
            {currentStep === 6 && "Hoàn tất"}
          </span>
        </div>
      </div>

      {/* Step 1: Display list of pending forms */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            📋 Danh sách Phiếu Đăng Ký Chờ Duyệt
          </h2>

          {registrationForms.length === 0 ? (
            <p className="text-gray-500">
              Không có phiếu đăng ký nào chờ duyệt.
            </p>
          ) : (
            <div className="grid gap-4">
              {registrationForms.map((form) => (
                <div
                  key={form.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleSelectForm(form)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900">
                        <FileText className="inline mr-2" size={18} />
                        {form.ma_phieu_dang_ky}
                      </div>
                      <div className="text-gray-600">
                        <User size={16} className="inline mr-2" />
                        {form.ten_khach} ({form.phone_khach})
                      </div>
                      <div className="text-gray-600">
                        <Home size={16} className="inline mr-2" />
                        {form.room_count} phòng - {form.so_nguoi_du_kien} người
                      </div>
                      <div className="text-sm text-gray-500">
                        Ngày vào:{" "}
                        {new Date(form.ngay_vao_du_kien).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select room from available options */}
      {currentStep === 2 && selectedForm && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            🏠 Chọn Phòng cho {formDetails.customer.ho_ten}
          </h2>

          <div className="grid gap-4">
            {selectedForm.selected_rooms.length === 0 ? (
              <p className="text-gray-500">Không có phòng nào được chọn.</p>
            ) : (
              selectedForm.selected_rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedRoom?.id === room.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                  onClick={() => handleSelectRoom(room)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Phòng: {room.ma_phong} ({room.loai_phong})
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Sức chứa: {room.suc_chua} người | Đang ở: {room.dang_o}
                        người | Giới tính: {room.gioi_tinh}
                      </div>
                      <div className="text-sm text-gray-600">
                        Giá: {room.gia_thue.toLocaleString("vi-VN")}{" "}
                        đ/người/tháng
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            room.trang_thai === "Trống"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {room.trang_thai}
                        </span>
                      </div>
                    </div>
                    {selectedRoom?.id === room.id && (
                      <CheckCircle className="text-blue-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedRoom && (
            <button
              onClick={handleValidateConditions}
              disabled={isProcessing}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isProcessing
                ? "Đang kiểm tra..."
                : "Tiếp tục → Kiểm tra Điều kiện"}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Display condition validation result */}
      {currentStep === 3 && conditionCheck && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            ✓ Đối chiếu Điều kiện Lưu trú
          </h2>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <span className="font-semibold">Khách hàng:</span>{" "}
              {formDetails.customer.ho_ten}
            </p>
            <p className="text-gray-700 mt-1">
              <span className="font-semibold">Phòng:</span>{" "}
              {selectedRoom?.ma_phong}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Điều kiện yêu cầu:</h3>
            {conditionCheck.conditions.map((condition) => (
              <div
                key={condition.id}
                className={`p-3 rounded-lg border ${
                  condition.trang_thai_khach === "Đã duyệt"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {condition.trang_thai_khach === "Đã duyệt" ? (
                    <CheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="text-red-600 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {condition.ten_dieu_kien}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {condition.mo_ta}
                    </p>
                    {condition.ghi_chu_khach && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">Ghi chú:</span>{" "}
                        {condition.ghi_chu_khach}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {conditionCheck.all_conditions_met && (
            <button
              onClick={handleCheckRoomStatus}
              disabled={isProcessing}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isProcessing
                ? "Đang kiểm tra..."
                : "Tiếp tục → Kiểm tra Tình trạng Phòng"}
            </button>
          )}
        </div>
      )}

      {/* Step 4: Display room availability check */}
      {currentStep === 4 && roomStatusCheck && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">✓ Kiểm tra Tình trạng Phòng</h2>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Phòng:</span>{" "}
                {roomStatusCheck.ma_phong}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Loại:</span>{" "}
                {roomStatusCheck.loai_phong}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Giá thuê:</span>{" "}
                {roomStatusCheck.gia_thue.toLocaleString("vi-VN")} đ/người/tháng
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded">
                  ✓ {roomStatusCheck.trang_thai} - Khả dụng
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmReview}
            disabled={isProcessing}
            className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing
              ? "Đang ghi nhận..."
              : "Tiếp tục → Ghi nhận Thông tin"}
          </button>
        </div>
      )}

      {/* Step 6: End of use case */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Hoàn tất Quy trình
            </h2>
            <p className="text-green-700 mb-4">
              Rà soát điều kiện và tình trạng phòng đã hoàn tất.
            </p>
            {successMessage && !error && (
              <p className="text-lg text-green-800 font-semibold">
                {successMessage}
              </p>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Duyệt Phiếu Đăng Ký Tiếp Theo
          </button>
        </div>
      )}
    </div>
  );
}
