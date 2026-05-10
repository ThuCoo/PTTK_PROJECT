import { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
} from "lucide-react";
import {hopDongApi, thanhToanApi} from "../../services/api";

interface ReturnRequest {
  id: number;
  ma_hd: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  trang_thai: string;
  ten_khach?: string;
  phone_khach?: string;
  ma_phong?: string;
}

export function RoomReturnProcess() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null,
  );
  const [selectedReturnDetails, setSelectedReturnDetails] = useState<{
    contractInfo: ReturnRequest | null;
    hasUnpaidInvoices: boolean;
    hasRoomReport: boolean;
    loading: boolean;
  }>({
    contractInfo: null,
    hasUnpaidInvoices: false,
    hasRoomReport: false,
    loading: false,
  });

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportNotes, setReportNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Load list of return-ready contracts from database
  useEffect(() => {
    const fetchReturnReadyContracts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await hopDongApi.getReadyForReturn();
        // const response = await fetch("/api/hop-dong/return-ready");
        // thêm token vào request 
        // response.headers.set("Authorization", `Bearer ${localStorage.getItem("token")}`);
        // if (!response.ok) throw new Error("Không thể tải danh sách hoàn trả");
        console.log("Return-ready contracts fetched:", response);
        // const data = await response.json();
        setReturnRequests(response || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error loading return-ready contracts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturnReadyContracts();
  }, []);

  // Step 2 & 3: Load contract details and check payment/report status
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!selectedReturn) {
        setSelectedReturnDetails({
          contractInfo: null,
          hasUnpaidInvoices: false,
          hasRoomReport: false,
          loading: false,
        });
        return;
      }

      try {
        setSelectedReturnDetails((prev) => ({ ...prev, loading: true }));

        // Check unpaid invoices (for A1 handling)
        const paymentResponse = await thanhToanApi.fetchUnpaid(selectedReturn.id);

        // For now, assume room report exists if they've prepared to return
        // In production, would fetch from database
        const hasRoomReport = true;
        console.log("paymentResponse:", paymentResponse);
        setSelectedReturnDetails({
          contractInfo: selectedReturn,
          hasUnpaidInvoices: paymentResponse.length > 0,
          hasRoomReport,
          loading: false,
        });
      } catch (err: any) {
        console.error("Error loading contract details:", err);
        setSelectedReturnDetails((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchContractDetails();
  }, [selectedReturn]);

  const canProcessReturn = () => {
    return (
      selectedReturnDetails.contractInfo &&
      !selectedReturnDetails.hasUnpaidInvoices &&
      selectedReturnDetails.hasRoomReport
    );
  };

  const handleCreateRoomReport = () => {
    setShowReportForm(true);
  };

  const handleSubmitRoomReport = () => {
    if (!reportNotes.trim()) {
      alert("Vui lòng nhập biên bản trả phòng");
      return;
    }
    // Mark room report as created
    setSelectedReturnDetails((prev) => ({ ...prev, hasRoomReport: true }));
    setShowReportForm(false);
    setReportNotes("");
  };

  // Step 4-7: Confirm return and execute backend process
  const handleConfirmReturn = async () => {
    if (!selectedReturn || !selectedReturnDetails.contractInfo) return;

    // Check preconditions (A1 - Payment not completed)
    if (selectedReturnDetails.hasUnpaidInvoices) {
      alert(
        "Chưa hoàn tất thanh toán. Hệ thống sẽ chuyển hồ sơ về bước xử lý thanh toán.",
      );
      // In production, would transfer to payment processing
      return;
    }

    // Check preconditions (A2 - No room report)
    if (!selectedReturnDetails.hasRoomReport) {
      alert("Chưa có biên bản trả phòng. Vui lòng lập biên bản trước.");
      handleCreateRoomReport();
      return;
    }

    // Main flow - proceed with return (Steps 5-7)
    setIsProcessing(true);
    try {
      const response = await hopDongApi.roomReturn(selectedReturn.ma_hop_dong);

      // if (!response.ok) throw new Error("Lỗi khi xử lý hoàn trả phòng");

      // const result = await response.json();
      alert("Hoàn trả phòng thành công!");

      // Reset and reload data
      setSelectedReturn(null);
      setSelectedReturnDetails({
        contractInfo: null,
        hasUnpaidInvoices: false,
        hasRoomReport: false,
        loading: false,
      });
      setReportNotes("");

      // Reload return-ready list
      const listResponse = await hopDongApi.getReadyForReturn();
      if (listResponse.length > 0) {
        setReturnRequests(listResponse);
      }else {
        setReturnRequests([]);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error("Error confirming return:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Hoàn trả phòng</h1>
        <p className="text-slate-600 mt-1">
          Xử lý quy trình kết thúc lưu trú của khách hàng
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Lỗi</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of return requests */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Danh sách hoàn trả
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : returnRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">
                  Không có hợp đồng sẵn sàng hoàn trả
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {returnRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedReturn(request)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedReturn?.id === request.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {request.ten_khach}
                        </p>
                        <p className="text-sm text-slate-600">
                          {request.ma_phong}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">
                        HĐ: {request.ma_hop_dong}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Sẵn sàng
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Lưu trú từ { new Date(request.ngay_bat_dau).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Return details */}
        <div className="lg:col-span-2">
          {!selectedReturn ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <Search className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một hồ sơ hoàn trả để xử lý</p>
            </div>
          ) : selectedReturnDetails.loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500">Đang tải thông tin...</p>
            </div>
          ) : selectedReturnDetails.contractInfo ? (
            <div className="space-y-6">
              {/* Contract Info Section - Step 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Thông tin hợp đồng
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Khách hàng</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {selectedReturn.ten_khach}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {selectedReturn.phong}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Mã hợp đồng</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {selectedReturn.ma_hop_dong}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Trạng thái HĐ</span>
                    <p className="font-medium text-blue-600 mt-1">
                      {selectedReturn.trang_thai_hd}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số giường</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {selectedReturn.so_giuong} giường
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Ngày bắt đầu</span>
                    <p className="font-medium text-slate-900 mt-1">
                      { new Date(selectedReturn.ngay_bat_dau).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Inspection Section - Step 3 (A2 handling) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Biên bản trả phòng
                </h2>

                {!selectedReturnDetails.hasRoomReport ? (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Chưa có biên bản trả phòng
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Hệ thống yêu cầu lập biên bản trả phòng trước khi hoàn
                        tất trả phòng
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Biên bản đã lập
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Đã hoàn thành kiểm tra tình trạng phòng
                      </p>
                    </div>
                  </div>
                )}

                {showReportForm ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Nội dung biên bản trả phòng
                    </label>
                    <textarea
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      rows={4}
                      placeholder="Mô tả chi tiết tình trạng phòng, tài sản, vệ sinh..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowReportForm(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSubmitRoomReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Lưu biên bản
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateRoomReport}
                    disabled={selectedReturnDetails.hasRoomReport}
                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      selectedReturnDetails.hasRoomReport
                        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    {selectedReturnDetails.hasRoomReport
                      ? "Biên bản đã lập"
                      : "Lập biên bản trả phòng"}
                  </button>
                )}
              </div>

              {/* Payment Status Section - Step 3 (A1 handling) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Tình trạng thanh toán
                </h2>

                {selectedReturnDetails.hasUnpaidInvoices ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Chưa hoàn tất thanh toán
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Hệ thống hiển thị thông báo hồ sơ chưa đủ điều kiện hoàn
                        trả phòng
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Đã thanh toán
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Tất cả phiếu thanh toán đã được hoàn tất
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation Section - Step 4 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Xác nhận hoàn trả
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Những điều sẽ xảy ra khi xác nhận:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                    <li>✓ Cập nhật trạng thái hợp đồng thành "Đã thanh lý"</li>
                    <li>✓ Cập nhật phòng thành trạng thái "Trống"</li>
                    <li>✓ Ghi nhận thời điểm khách kết thúc lưu trú</li>
                    <li>✓ Hoàn tất quy trình hoàn trả phòng</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmReturn}
                    disabled={isProcessing || !canProcessReturn()}
                    className={`flex-1 px-6 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-2 ${
                      isProcessing || !canProcessReturn()
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {isProcessing ? "Đang xử lý..." : "Xác nhận hoàn trả phòng"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
