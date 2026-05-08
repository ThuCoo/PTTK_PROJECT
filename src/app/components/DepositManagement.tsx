import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { datCocApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const STATUS_COLOR: Record<string, string> = {
  "Đã xác nhận": "bg-green-100 text-green-700",
  "Chờ xác nhận": "bg-yellow-100 text-yellow-700",
  "Chờ thanh toán": "bg-blue-100 text-blue-700",
  "Đã hủy (quá hạn)": "bg-red-100 text-red-700",
};

export function DepositManagement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);

  const {
    data: deposits = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deposits", search],
    queryFn: () => datCocApi.getAll({ search: search || undefined }),
    staleTime: 10_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["deposit-stats"],
    queryFn: datCocApi.getStats,
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      id,
      file,
      method,
    }: {
      id: number;
      file: File;
      method: string;
    }) => {
      const fd = new FormData();
      fd.append("proof", file);
      fd.append("phuong_thuc", method);
      return datCocApi.uploadProof(id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["deposit-stats"] });
      setShowPayForm(false);
      setPayMethod("");
      setProofFile(null);
      setProofPreview(null);
      alert("Đã gửi chứng từ! Quản lý sẽ xác nhận sớm.");
    },
    onError: (err: any) => alert(err.response?.data?.error || "Lỗi tải lên"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => datCocApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["deposit-stats"] });
    },
    onError: (err: any) => alert(err.response?.data?.error || "Lỗi xác nhận"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, ghi_chu }: { id: number; ghi_chu: string }) =>
      datCocApi.reject(id, ghi_chu),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
  });

  const handleSelectDeposit = async (d: any) => {
    setSelected(d);
    setProofImage(null);
    if (d.trang_thai === "Chờ xác nhận") {
      try {
        const img = await datCocApi.getProof(d.id);
        setProofImage(img?.dataUrl ?? null);
      } catch {
        setProofImage(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmitPayment = () => {
    if (!payMethod || !proofFile) {
      alert("Vui lòng chọn phương thức và tải lên chứng từ");
      return;
    }
    uploadMutation.mutate({
      id: selected.id,
      file: proofFile,
      method: payMethod,
    });
  };

  const statCards = [
    { label: "Tổng đặt cọc", value: stats?.tong ?? "—", color: "bg-blue-500" },
    {
      label: "Chờ thanh toán",
      value: stats?.cho_thanh_toan ?? "—",
      color: "bg-yellow-500",
    },
    {
      label: "Chờ xác nhận",
      value: stats?.cho_xac_nhan ?? "—",
      color: "bg-orange-500",
    },
    {
      label: "Đã xác nhận",
      value: stats?.da_xac_nhan ?? "—",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý đặt cọc</h1>
          <p className="text-slate-600 mt-1">
            Theo dõi và xác nhận các giao dịch đặt cọc
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw
            className={`w-5 h-5 text-slate-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
              <div
                className={`${s.color} w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã cọc, tên, SĐT..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      "Mã cọc",
                      "Khách hàng",
                      "Phòng",
                      "Số tiền",
                      "Trạng thái",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-sm font-medium text-slate-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={j} className="py-4 px-4">
                              <div className="h-4 bg-slate-200 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : deposits.map((d: any) => (
                        <tr
                          key={d.id}
                          onClick={() => handleSelectDeposit(d)}
                          className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${selected?.id === d.id ? "bg-blue-50" : ""}`}
                        >
                          <td className="py-4 px-4">
                            <p className="font-medium text-blue-600">
                              {d.ma_coc}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(d.ngay_tao).toLocaleDateString("vi-VN")}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-900">
                              {d.ten_khach}
                            </p>
                            <p className="text-xs text-slate-600">
                              {d.phone_khach}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{d.ma_phong}</p>
                            <p className="text-xs text-slate-600">
                              {d.so_giuong} giường
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold">
                              {Number(d.so_tien).toLocaleString()} VNĐ
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${STATUS_COLOR[d.trang_thai] || "bg-slate-100 text-slate-700"}`}
                            >
                              {d.trang_thai}
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {!selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">
                Chọn một phiếu cọc để xem chi tiết
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Chi tiết đặt cọc
                </h2>
                {selected.trang_thai === "Đã xác nhận" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {selected.trang_thai === "Chờ xác nhận" && (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                {selected.trang_thai === "Chờ thanh toán" && (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
                {selected.trang_thai === "Đã hủy (quá hạn)" && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="pb-4 border-b border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Mã đặt cọc</p>
                <p className="font-bold text-lg text-blue-600">
                  {selected.ma_coc}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Khách hàng</p>
                <p className="font-medium">{selected.ten_khach}</p>
                <p className="text-sm text-slate-600">{selected.phone_khach}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Phòng</p>
                <p className="font-medium">
                  {selected.ma_phong} — {selected.so_giuong} giường
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Số tiền cọc</p>
                <p className="font-bold text-2xl">
                  {Number(selected.so_tien).toLocaleString()} VNĐ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Công thức: 2 tháng × {selected.so_giuong} giường
                </p>
              </div>

              {selected.han_thanh_toan && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Hạn thanh toán</p>
                  <p className="font-medium text-red-600">
                    {new Date(selected.han_thanh_toan).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}

              {selected.phuong_thuc && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phương thức</p>
                  <p className="font-medium">{selected.phuong_thuc}</p>
                </div>
              )}

              {selected.nguoi_xac_nhan && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Người xác nhận</p>
                  <p className="font-medium">{selected.nguoi_xac_nhan}</p>
                </div>
              )}

              {/* Show encrypted proof image (decrypted by backend) */}
              {selected.trang_thai === "Chờ xác nhận" && proofImage && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Chứng từ thanh toán
                  </p>
                  <img
                    src={proofImage}
                    alt="Chứng từ"
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {/* Action buttons */}
              {selected.trang_thai === "Chờ thanh toán" && (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setShowPayForm(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thực hiện thanh toán
                  </button>
                </div>
              )}

              {selected.trang_thai === "Chờ xác nhận" &&
                user?.role === "quan_ly" && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => confirmMutation.mutate(selected.id)}
                      disabled={confirmMutation.isPending}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {confirmMutation.isPending
                        ? "Đang xử lý..."
                        : "Kiểm tra và xác nhận"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Từ chối chứng từ này?"))
                          rejectMutation.mutate({
                            id: selected.id,
                            ghi_chu: "Chứng từ không hợp lệ",
                          });
                      }}
                      className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Từ chối chứng từ
                    </button>
                  </div>
                )}

              {selected.trang_thai === "Chờ xác nhận" &&
                user?.role !== "quan_ly" && (
                  <p className="text-xs text-slate-500 text-center italic">
                    Chờ quản lý xác nhận chứng từ
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {showPayForm && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Thanh toán đặt cọc — {selected.ma_coc}
              </h2>
              <button onClick={() => setShowPayForm(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600">Số tiền cần thanh toán</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Number(selected.so_tien).toLocaleString()} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phương thức thanh toán *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn --</option>
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="MoMo">Ví MoMo</option>
                  <option value="ZaloPay">ZaloPay</option>
                </select>
              </div>

              {payMethod === "Chuyển khoản" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                  <h3 className="font-medium text-slate-900 mb-3">
                    Thông tin chuyển khoản
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ngân hàng:</span>
                      <span className="font-medium text-slate-900">
                        Vietcombank
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số tài khoản:</span>
                      <span className="font-medium text-slate-900">
                        0123456789
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Chủ tài khoản:</span>
                      <span className="font-medium text-slate-900">
                        HomeStay Dorm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nội dung CK:</span>
                      <span className="font-medium text-blue-600">
                        {selected.ma_coc} {selected.ten_khach}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chứng từ thanh toán *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-up"
                  />
                  <label htmlFor="proof-up" className="cursor-pointer">
                    {proofPreview ? (
                      <div>
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="max-h-40 mx-auto mb-2 rounded"
                        />
                        <p className="text-sm text-green-600 font-medium">
                          Đã chọn: {proofFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Click để tải lên ảnh chụp giao dịch
                        </p>
                        <p className="text-xs text-slate-500">
                          JPG, PNG (tối đa 5MB) — Sẽ được mã hóa AES-256
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPayForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={!payMethod || !proofFile || uploadMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploadMutation.isPending ? "Đang gửi..." : "Gửi chứng từ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
