import { useMemo, useState } from "react";
import {
  Bed,
  ChevronDown,
  CheckCircle2,
  CircleAlert,
  DollarSign,
  MapPin,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";

type Registration = {
  code: string;
  customer: string;
  people: number;
  gender: "Nam" | "Nữ";
  area: string;
  roomType: string;
  priceRange: string;
  startDate: string;
  duration: string;
  note: string;
  selectedRooms: string[];
};

type Room = {
  code: string;
  area: string;
  gender: "Nam" | "Nữ";
  roomType: string;
  capacity: number;
  occupied: number;
  price: string;
  status: "Đang sử dụng" | "Còn giường" | "Trống" | "Đã cọc";
};

const registrations: Registration[] = [
  {
    code: "PDK001",
    customer: "Nguyễn Văn A",
    people: 2,
    gender: "Nam",
    area: "Khu A",
    roomType: "Phòng 4 người",
    priceRange: "1.500.000 - 2.000.000",
    startDate: "01/06/2026",
    duration: "6 tháng",
    note: "Yên tĩnh, có điều hòa",
    selectedRooms: ["P301"],
  },
  {
    code: "PDK002",
    customer: "Trần Thị B",
    people: 1,
    gender: "Nữ",
    area: "Khu B",
    roomType: "Phòng 2 người",
    priceRange: "2.000.000 - 3.000.000",
    startDate: "05/06/2026",
    duration: "12 tháng",
    note: "Gần cầu thang, dễ di chuyển",
    selectedRooms: ["P205/1"],
  },
  {
    code: "PDK003",
    customer: "Lê Văn C",
    people: 4,
    gender: "Nam",
    area: "Khu A",
    roomType: "Thuê nguyên phòng",
    priceRange: "1.200.000 - 1.800.000",
    startDate: "10/06/2026",
    duration: "6 tháng",
    note: "Cần phòng 4 giường, thoáng, có cửa sổ",
    selectedRooms: ["P412", "P301", "P302"],
  },
];

const rooms: Room[] = [
  {
    code: "P301",
    area: "Khu A",
    gender: "Nam",
    roomType: "Phòng 4 người",
    capacity: 4,
    occupied: 4,
    price: "1.800.000 VNĐ/tháng",
    status: "Đang sử dụng",
  },
  {
    code: "P302",
    area: "Khu A",
    gender: "Nam",
    roomType: "Phòng 4 người",
    capacity: 4,
    occupied: 2,
    price: "1.800.000 VNĐ/tháng",
    status: "Còn giường",
  },
  {
    code: "P205",
    area: "Khu B",
    gender: "Nữ",
    roomType: "Phòng 2 người",
    capacity: 2,
    occupied: 0,
    price: "2.500.000 VNĐ/tháng",
    status: "Trống",
  },
  {
    code: "P412",
    area: "Khu A",
    gender: "Nam",
    roomType: "Phòng 6 người",
    capacity: 6,
    occupied: 0,
    price: "1.500.000 VNĐ/tháng",
    status: "Đã cọc",
  },
  {
    code: "P108",
    area: "Khu C",
    gender: "Nữ",
    roomType: "Phòng 2 người",
    capacity: 2,
    occupied: 0,
    price: "2.500.000 VNĐ/tháng",
    status: "Trống",
  },
  {
    code: "P303",
    area: "Khu A",
    gender: "Nam",
    roomType: "Phòng 4 người",
    capacity: 4,
    occupied: 1,
    price: "1.700.000 VNĐ/tháng",
    status: "Còn giường",
  },
];

function statusStyles(status: Room["status"]) {
  switch (status) {
    case "Đang sử dụng":
      return "bg-[#ddebff] text-[#2f6dff]";
    case "Còn giường":
      return "bg-[#fff0b8] text-[#b47a00]";
    case "Trống":
      return "bg-[#dff9df] text-[#159a3f]";
    case "Đã cọc":
      return "bg-[#f1ddff] text-[#8c3be8]";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function AvailabilityVerification() {
  const [selectedCode, setSelectedCode] = useState("PDK003");

  const selectedRegistration = useMemo(
    () =>
      registrations.find((item) => item.code === selectedCode) ??
      registrations[0],
    [selectedCode],
  );

  const matchingRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.gender === selectedRegistration.gender &&
          room.area === selectedRegistration.area,
      ),
    [selectedRegistration],
  );

  const compatibleCount = matchingRooms.length;
  const incompatibleCount = rooms.length - matchingRooms.length;

  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[42px] font-extrabold tracking-tight text-[#132238]">
          Kiểm tra tình trạng và điều kiện
        </h1>
        <p className="mt-2 text-[20px] text-slate-600">
          Tìm kiếm phòng/giường phù hợp với yêu cầu của khách hàng
        </p>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[420px] flex-1">
            <label className="mb-2 block text-[18px] font-semibold text-[#384b66]">
              Chọn phiếu đăng ký thuê *
            </label>
            <div className="relative">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="h-[56px] w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 pr-12 text-[18px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {registrations.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.customer} - {item.people} người -{" "}
                    {item.gender} - {item.area}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <button className="h-[56px] rounded-2xl border border-slate-300 bg-white px-8 text-[18px] font-semibold text-slate-700 transition hover:bg-slate-50">
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-[22px] border border-slate-200 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <h2 className="mb-6 text-[28px] font-extrabold tracking-tight text-[#132238]">
          Thông tin yêu cầu của khách hàng
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <InfoItem label="Khách hàng" value={selectedRegistration.customer} />
          <InfoItem
            label="Số người"
            value={`${selectedRegistration.people} người`}
          />
          <InfoItem label="Giới tính" value={selectedRegistration.gender} />
          <InfoItem label="Khu vực" value={selectedRegistration.area} />
          <InfoItem label="Loại phòng" value={selectedRegistration.roomType} />
          <InfoItem label="Mức giá" value={selectedRegistration.priceRange} />
          <InfoItem
            label="Thời gian vào"
            value={selectedRegistration.startDate}
          />
          <InfoItem label="Thời hạn" value={selectedRegistration.duration} />
        </div>

        <div className="mt-6 rounded-[18px] border border-[#b6d4ff] bg-[#edf4ff] px-6 py-5">
          <p className="mb-2 text-[17px] text-slate-600">Yêu cầu khác:</p>
          <p className="text-[19px] font-semibold text-[#132238]">
            {selectedRegistration.note}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatCard
          icon={CheckCircle2}
          label="Phòng phù hợp"
          value={compatibleCount}
          tone="bg-[#dcf8df] text-[#169a3f]"
        />
        <StatCard
          icon={XCircle}
          label="Không phù hợp"
          value={incompatibleCount}
          tone="bg-[#ffdcdc] text-[#e11b22]"
        />
        <StatCard
          icon={Bed}
          label="Tổng số phòng"
          value={rooms.length}
          tone="bg-[#d8e5ff] text-[#1f63ff]"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {matchingRooms.map((room) => {
          const selected = selectedRegistration.selectedRooms.some((value) =>
            value.includes(room.code),
          );
          return (
            <RoomCard
              key={room.code}
              room={room}
              selected={selected}
              matching
            />
          );
        })}
        {rooms
          .filter(
            (room) => !matchingRooms.some((match) => match.code === room.code),
          )
          .map((room) => (
            <RoomCard key={room.code} room={room} selected={false} />
          ))}
      </div>

      <div className="mt-8 rounded-[22px] border border-slate-200 bg-white px-10 py-14 text-center shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <h2 className="text-[28px] font-extrabold tracking-tight text-[#132238]">
          Bắt đầu chọn phòng
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[20px] leading-relaxed text-slate-600">
          Hệ thống sẽ hiển thị các phòng phù hợp với yêu cầu của khách hàng
        </p>
        <button className="mt-8 rounded-2xl bg-[#1f63ff] px-8 py-4 text-[18px] font-semibold text-white transition hover:bg-[#1553df]">
          Xem danh sách phòng phù hợp
        </button>
      </div>

      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:text-[#1f63ff]">
        <CircleAlert className="h-6 w-6" />
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[18px] text-slate-600">{label}:</p>
      <p className="mt-1 text-[20px] font-semibold text-[#132238]">{value}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-[18px] text-slate-600">{label}</p>
          <p className="text-[40px] font-extrabold tracking-tight text-[#132238]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  selected,
  matching,
}: {
  room: Room;
  selected: boolean;
  matching?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border ${selected ? "border-[#1f63ff]" : matching ? "border-emerald-400" : "border-slate-200"} bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)]`}
    >
      <div
        className={`rounded-t-[22px] px-5 py-4 ${room.gender === "Nam" ? "bg-[#eaf2ff]" : "bg-[#fdeef6]"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[30px] font-extrabold tracking-tight text-[#132238]">
            {room.code}
          </h3>
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusStyles(room.status)}`}
          >
            {room.status}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[18px] text-slate-600">
          <MapPin className="h-4 w-4" />
          {room.area} • {room.gender}
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-2 text-[16px] text-slate-700">
          <Bed className="h-4 w-4" />
          {room.roomType}
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-[16px] text-slate-700">
            <Users className="h-4 w-4" />
            Sức chứa
          </div>
          <span className="text-[18px] font-bold text-[#132238]">
            {room.occupied}/{room.capacity} người
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[16px] text-slate-700">
            <DollarSign className="h-4 w-4" />
            Giá thuê
          </div>
          <span className="text-[18px] font-bold text-[#1f63ff]">
            {room.price}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${room.status === "Trống" ? "bg-emerald-500" : room.status === "Còn giường" ? "bg-amber-500" : room.status === "Đã cọc" ? "bg-purple-500" : "bg-[#1f63ff]"}`}
            style={{
              width: `${Math.min((room.occupied / room.capacity) * 100, 100)}%`,
            }}
          />
        </div>
        <button className="mt-1 w-full rounded-2xl border border-[#2f6dff] px-4 py-3 text-[18px] font-semibold text-[#2f6dff] transition hover:bg-[#f2f6ff]">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
