import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronDown,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Users,
  X,
} from "lucide-react";
import { khachHangApi } from "../../services/api";

const EMPTY_FORM = {
  ho_ten: "",
  sdt: "",
  email: "",
  cccd: "",
  gioi_tinh: "Nam" as "Nam" | "Nữ",
  so_nguoi: 1,
  khu_vuc: "",
  loai_phong: "",
  khoang_gia: "",
  ngay_vao: "",
  thoi_han_thue: 6,
  ghi_chu: "",
  loai_thue: "Thuê ở ghép",
  trang_thai: "Đang tư vấn",
};

const STATUS_COLORS: Record<string, string> = {
  "Đang tư vấn": "bg-blue-100 text-blue-700",
  "Đã lên lịch xem phòng": "bg-amber-100 text-amber-700",
  "Đồng ý thuê": "bg-emerald-100 text-emerald-700",
  "Chưa quyết định": "bg-slate-100 text-slate-700",
  "Không tiếp tục thuê": "bg-red-100 text-red-700",
};

export function CustomerManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", search, filterStatus],
    queryFn: () =>
      khachHangApi.getAll({
        search: search || undefined,
        trang_thai: filterStatus || undefined,
      }),
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: khachHangApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      closeForm();
    },
    onError: (err: any) =>
      setFormError(err.response?.data?.error || "Lỗi tạo khách hàng"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      khachHangApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      closeForm();
    },
    onError: (err: any) =>
      setFormError(err.response?.data?.error || "Lỗi cập nhật"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, trang_thai }: { id: number; trang_thai: string }) =>
      khachHangApi.updateStatus(id, trang_thai),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };
  const openEdit = (kh: any) => {
    setForm({
      ho_ten: kh.ho_ten,
      sdt: kh.sdt || kh.phone || "",
      email: kh.email ?? "",
      cccd: kh.cccd ?? "",
      gioi_tinh: kh.gioi_tinh,
      so_nguoi: kh.so_nguoi,
      khu_vuc: kh.khu_vuc ?? "",
      loai_phong: kh.loai_phong ?? "",
      khoang_gia: kh.khoang_gia ?? "",
      ngay_vao: kh.ngay_vao?.split("T")[0] ?? "",
      thoi_han_thue: kh.thoi_han_thue ?? 6,
      ghi_chu: kh.ghi_chu ?? "",
      loai_thue: kh.loai_thue ?? "Thuê ở ghép",
      trang_thai: kh.trang_thai,
    });
    setEditingId(kh.id);
    setFormError("");
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.ho_ten.trim() || !form.sdt.trim()) {
      setFormError("Họ tên và số điện thoại là bắt buộc");
      return;
    }
    if (editingId !== null)
      updateMutation.mutate({ id: editingId, data: form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-extrabold tracking-tight text-[#132238]">
            Quản lý khách hàng
          </h1>
          <p className="mt-2 text-[20px] text-slate-600">
            Ghi nhận và quản lý thông tin khách hàng đăng ký thuê
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 bg-white shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw
              className={`h-5 w-5 text-slate-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-2xl bg-[#1f63ff] px-6 py-4 text-[18px] font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-[#1553df]"
          >
            <Plus className="h-5 w-5" /> Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              className="h-[54px] w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="relative w-full lg:w-[300px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-[54px] w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 pr-12 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.keys(STATUS_COLORS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        {error && (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> Không thể tải dữ liệu. Kiểm tra
            kết nối backend.
          </div>
        )}

        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[
                "Họ và tên",
                "Liên hệ",
                "Yêu cầu",
                "Trạng thái",
                "Ngày tạo",
                "Hành động",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-[16px] font-semibold text-slate-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100">
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-5">
                      <div className="h-4 rounded bg-slate-200 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Users className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                  Không tìm thấy khách hàng nào
                </td>
              </tr>
            ) : (
              customers.map((kh: any) => (
                <tr
                  key={kh.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5 align-top">
                    <p className="text-[18px] font-bold text-[#132238]">
                      {kh.ho_ten}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {kh.gioi_tinh}
                    </p>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="space-y-2 text-[15px] text-slate-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        {kh.sdt || kh.phone || "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        {kh.email || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top text-[15px] text-slate-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
                      <div>
                        <p>{kh.khu_vuc || "—"}</p>
                        <p className="mt-1 text-slate-500">
                          {kh.loai_phong || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <select
                      value={kh.trang_thai}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: kh.id,
                          trang_thai: e.target.value,
                        })
                      }
                      className={`min-w-[180px] appearance-none rounded-full border-0 px-4 py-2 text-[14px] font-semibold outline-none ${STATUS_COLORS[kh.trang_thai] || "bg-slate-100 text-slate-700"}`}
                    >
                      {Object.keys(STATUS_COLORS).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5 align-top text-[15px] text-slate-700">
                    {formatDate(kh.ngay_tao ?? kh.created_at ?? kh.ngay_vao)}
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(kh)}
                        className="rounded-xl p-2 text-[#1f63ff] transition hover:bg-blue-50"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEdit(kh)}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
          {isLoading ? "" : `${customers.length} khách hàng`}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-8 py-7">
              <h2 className="text-[34px] font-extrabold tracking-tight text-[#132238]">
                {editingId
                  ? "Cập nhật khách hàng"
                  : "Ghi nhận thông tin khách hàng"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-8 py-8"
            >
              {formError && (
                <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" /> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {[
                  {
                    label: "Họ và tên *",
                    key: "ho_ten",
                    type: "text",
                    colSpan: 2,
                  },
                  { label: "Số điện thoại *", key: "sdt", type: "tel" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "CCCD", key: "cccd", type: "text" },
                  { label: "Số người", key: "so_nguoi", type: "number" },
                  { label: "Khu vực mong muốn", key: "khu_vuc", type: "text" },
                  { label: "Loại phòng", key: "loai_phong", type: "text" },
                  { label: "Ngày vào dự kiến", key: "ngay_vao", type: "date" },
                  {
                    label: "Thời hạn thuê (tháng)",
                    key: "thoi_han_thue",
                    type: "number",
                  },
                ].map(({ label, key, type, colSpan }) => (
                  <div
                    key={key}
                    className={colSpan === 2 ? "lg:col-span-2" : ""}
                  >
                    <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]:
                            type === "number"
                              ? parseInt(e.target.value)
                              : e.target.value,
                        })
                      }
                      className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                ))}

                <div>
                  <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                    Giới tính *
                  </label>
                  <select
                    value={form.gioi_tinh}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gioi_tinh: e.target.value as "Nam" | "Nữ",
                      })
                    }
                    className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                    Loại thuê
                  </label>
                  <select
                    value={form.loai_thue}
                    onChange={(e) =>
                      setForm({ ...form, loai_thue: e.target.value })
                    }
                    className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option>Thuê ở ghép</option>
                    <option>Thuê nguyên phòng</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                    Ghi chú
                  </label>
                  <textarea
                    value={form.ghi_chu}
                    onChange={(e) =>
                      setForm({ ...form, ghi_chu: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">
              <button
                onClick={closeForm}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-[18px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-2 rounded-2xl bg-[#1f63ff] px-6 py-3 text-[18px] font-semibold text-white transition hover:bg-[#1553df] disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
