import { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  X as XIcon,
} from "lucide-react";

export function AppointmentManagement() {
  const [showAddForm, setShowAddForm] = useState(false);

  const appointments = [
    {
      id: 1,
      registrationCode: "PDK001",
      customer: "Hoàng Văn E",
      phone: "0901234567",
      email: "hoangvane@email.com",
      numPeople: 2,
      room: "P501",
      area: "Khu A",
      date: "02/05/2026",
      time: "14:00",
      status: "Đã xác nhận",
      note: "Khách muốn xem điều kiện vệ sinh",
    },
    {
      id: 2,
      registrationCode: "PDK002",
      customer: "Đỗ Thị F",
      phone: "0912345678",
      email: "dothif@email.com",
      numPeople: 1,
      room: "P302",
      area: "Khu A",
      date: "02/05/2026",
      time: "15:30",
      status: "Chờ xác nhận",
      note: "",
    },
    {
      id: 3,
      registrationCode: "PDK003",
      customer: "Vũ Văn G",
      phone: "0923456789",
      email: "vuvang@email.com",
      numPeople: 4,
      room: "P215",
      area: "Khu B",
      date: "03/05/2026",
      time: "10:00",
      status: "Đã xác nhận",
      note: "Xem nhóm 4 người",
    },
    {
      id: 4,
      registrationCode: "PDK004",
      customer: "Nguyễn Thị H",
      phone: "0934567890",
      email: "nguyenthih@email.com",
      numPeople: 1,
      room: "P108",
      area: "Khu C",
      date: "03/05/2026",
      time: "16:00",
      status: "Đã hoàn thành",
      note: "Khách đã xem và đồng ý thuê",
    },
  ];

  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-extrabold tracking-tight text-[#132238]">
            Lịch xem phòng
          </h1>
          <p className="mt-2 text-[20px] text-slate-600">
            Sắp xếp và theo dõi lịch hẹn xem phòng với khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#1f63ff] px-6 py-4 text-[18px] font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-[#1553df]"
        >
          <Plus className="h-5 w-5" />
          Tạo lịch hẹn
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "Tổng lịch hẹn", value: "24", color: "bg-[#1f63ff]" },
          { label: "Hôm nay", value: "6", color: "bg-emerald-500" },
          { label: "Chờ xác nhận", value: "3", color: "bg-amber-500" },
          { label: "Đã hoàn thành", value: "15", color: "bg-violet-500" },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-slate-600">{stat.label}</p>
                <p className="text-[38px] font-extrabold tracking-tight text-[#132238]">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
              >
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <select className="h-[50px] rounded-2xl border border-slate-300 px-4 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option>Tất cả trạng thái</option>
            <option>Chờ xác nhận</option>
            <option>Đã xác nhận</option>
            <option>Đã hoàn thành</option>
            <option>Đã hủy</option>
          </select>
          <select className="h-[50px] rounded-2xl border border-slate-300 px-4 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option>Tất cả khu vực</option>
            <option>Khu A</option>
            <option>Khu B</option>
            <option>Khu C</option>
          </select>
          <input
            type="date"
            className="h-[50px] rounded-2xl border border-slate-300 px-4 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Thời gian
                </th>
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Khách hàng
                </th>
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Phòng
                </th>
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Ghi chú
                </th>
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Trạng thái
                </th>
                <th className="px-4 py-4 text-left text-[16px] font-semibold text-slate-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-5 align-top">
                    <div className="space-y-1 text-[15px]">
                      <div className="flex items-center gap-2 font-medium text-[#132238]">
                        <Calendar className="h-4 w-4" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        {apt.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="space-y-1">
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {apt.registrationCode}
                      </span>
                      <p className="text-[17px] font-bold text-[#132238]">
                        {apt.customer}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        {apt.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" />
                        {apt.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <p className="text-[17px] font-bold text-[#132238]">
                      {apt.room}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {apt.area}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {apt.numPeople} người
                    </p>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <p className="max-w-xs text-sm text-slate-600">
                      {apt.note || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        apt.status === "Đã xác nhận"
                          ? "bg-emerald-100 text-emerald-700"
                          : apt.status === "Chờ xác nhận"
                            ? "bg-amber-100 text-amber-700"
                            : apt.status === "Đã hoàn thành"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <div className="flex items-center gap-2">
                      <button className="rounded-xl p-2 text-[#1f63ff] transition hover:bg-blue-50">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="rounded-xl p-2 text-red-500 transition hover:bg-red-50">
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-8 py-7">
              <h2 className="text-[34px] font-extrabold tracking-tight text-[#132238]">
                Tạo lịch hẹn xem phòng
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-7 w-7" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                      Chọn phiếu đăng ký thuê *
                    </label>
                    <select className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                      <option>-- Chọn phiếu đăng ký thuê --</option>
                      <option>PDK001 - Nguyễn Văn A - 2 người - Khu A</option>
                      <option>PDK002 - Trần Thị B - 1 người - Khu B</option>
                      <option>PDK003 - Lê Văn C - 4 người - Khu A</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                      Chọn phòng dự kiến *
                    </label>
                    <select className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                      <option>-- Chọn phòng --</option>
                      <option>P301 - Phòng 4 người - Khu A - 1.800.000đ</option>
                      <option>P205 - Phòng 2 người - Khu B - 2.500.000đ</option>
                      <option>P412 - Phòng 6 người - Khu A - 1.500.000đ</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                      Ngày hẹn *
                    </label>
                    <input
                      type="date"
                      className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                      Giờ hẹn *
                    </label>
                    <input
                      type="time"
                      className="h-[56px] w-full rounded-2xl border border-slate-300 px-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
                    Ghi chú về lịch hẹn
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Ví dụ: Khách muốn xem điều kiện vệ sinh, muốn xem cả phòng bên cạnh..."
                    className="w-full rounded-2xl border border-slate-300 px-4 py-4 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-[18px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button className="rounded-2xl bg-[#1f63ff] px-6 py-3 text-[18px] font-semibold text-white transition hover:bg-[#1553df]">
                Tạo lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
