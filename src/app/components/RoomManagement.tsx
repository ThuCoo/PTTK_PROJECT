import { useState } from "react";
import { Search, Bed, Users, DollarSign, MapPin } from "lucide-react";

export function RoomManagement() {
  const [filterArea, setFilterArea] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const rooms = [
    {
      id: "P301",
      area: "Khu A",
      type: "Phòng 4 người",
      capacity: 4,
      occupied: 4,
      price: "1.800.000",
      status: "Đang sử dụng",
      gender: "Nam",
    },
    {
      id: "P302",
      area: "Khu A",
      type: "Phòng 4 người",
      capacity: 4,
      occupied: 2,
      price: "1.800.000",
      status: "Còn giường",
      gender: "Nam",
    },
    {
      id: "P205",
      area: "Khu B",
      type: "Phòng 2 người",
      capacity: 2,
      occupied: 0,
      price: "2.500.000",
      status: "Trống",
      gender: "Nữ",
    },
    {
      id: "P412",
      area: "Khu A",
      type: "Phòng 6 người",
      capacity: 6,
      occupied: 0,
      price: "1.500.000",
      status: "Đã cọc",
      gender: "Nam",
    },
    {
      id: "P108",
      area: "Khu C",
      type: "Phòng 2 người",
      capacity: 2,
      occupied: 0,
      price: "2.200.000",
      status: "Trống",
      gender: "Nữ",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Trống":
        return "bg-green-100 text-green-700";
      case "Còn giường":
        return "bg-yellow-100 text-yellow-700";
      case "Đang sử dụng":
        return "bg-blue-100 text-blue-700";
      case "Đã cọc":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-6">
        <h1 className="text-[42px] font-extrabold tracking-tight text-[#132238]">
          Quản lý phòng/giường
        </h1>
        <p className="mt-2 text-[20px] text-slate-600">
          Kiểm tra và quản lý tình trạng phòng/giường
        </p>
      </div>

      <div className="mb-8 rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[360px] flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phòng..."
                className="h-[50px] w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
          <div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="h-[50px] rounded-2xl border border-slate-300 bg-white px-5 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Tất cả khu vực</option>
              <option value="A">Khu A</option>
              <option value="B">Khu B</option>
              <option value="C">Khu C</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-[50px] rounded-2xl border border-slate-300 bg-white px-5 text-[17px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Trống</option>
              <option value="partial">Còn giường</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="deposited">Đã cọc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)]"
          >
            <div
              className={`px-5 py-4 ${room.gender === "Nam" ? "bg-[#eaf2ff]" : "bg-[#fdeef6]"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[28px] font-extrabold tracking-tight text-[#132238]">
                  {room.id}
                </h3>
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${getStatusColor(room.status)}`}
                >
                  {room.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[18px] text-slate-600">
                <MapPin className="h-4 w-4" />
                {room.area} • {room.gender}
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 text-[16px] text-slate-700">
                  <Bed className="h-4 w-4" />
                  {room.type}
                </div>
                <div className="flex items-center gap-2 text-[16px] text-slate-700">
                  <Users className="h-4 w-4" />
                  Sức chứa
                </div>
                <span className="text-[17px] font-extrabold text-[#132238]">
                  {room.occupied}/{room.capacity} người
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-[16px] text-slate-700">
                  <DollarSign className="h-4 w-4" />
                  Giá thuê
                </div>
                <span className="text-[18px] font-bold text-[#1f63ff]">
                  {room.price} VNĐ/tháng
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full ${
                    room.occupied === 0
                      ? "bg-green-500"
                      : room.occupied < room.capacity
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                  style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                />
              </div>

              <button className="mt-2 w-full rounded-2xl border border-[#2f6dff] px-4 py-3 text-[18px] font-semibold text-[#2f6dff] transition hover:bg-[#f2f6ff]">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
