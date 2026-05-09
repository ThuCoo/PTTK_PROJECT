import {
  Home,
  Users,
  Bed,
  Calendar,
  DollarSign,
  FileText,
  LogIn,
  LogOut as LogOutIcon,
  ClipboardList,
  Settings,
  BarChart3,
  Filter,
  Layers,
  Building2,
  CheckSquare,
} from "lucide-react";

interface SidebarUser {
  username: string;
  ho_ten: string;
  role: "nhan_vien" | "quan_ly";
  email?: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: SidebarUser | null;
  onLogout?: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  user,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: Home },
    { id: "customers", label: "Quản lý khách hàng", icon: Users },
    { id: "rooms", label: "Quản lý phòng/giường", icon: Bed },
    { id: "roomSelection", label: "Chọn phòng/giường", icon: Layers },
    { id: "appointments", label: "Lịch xem phòng", icon: Calendar },
    { id: "availability", label: "Kiểm tra tình trạng", icon: Filter },
    { id: "deposits", label: "Đặt cọc", icon: DollarSign },
    { id: "checkin", label: "Nhận phòng", icon: LogIn },
    { id: "checkout", label: "Trả phòng", icon: LogOutIcon },
    { id: "roomReturn", label: "Hoàn trả phòng", icon: Building2 },
    {
      id: "preRentalReview",
      label: "Rà soát điều kiện & tình trạng",
      icon: CheckSquare,
    },
    { id: "contracts", label: "Hợp đồng", icon: FileText },
    { id: "payments", label: "Thanh toán", icon: ClipboardList },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="flex h-screen w-[322px] flex-col overflow-hidden border-r border-white/10 bg-[#0f172a] text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
      <div className="border-b border-white/10 px-8 py-7">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white">
          HomeStay Dorm
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Hệ thống quản lý ký túc xá
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-[#1f63ff] text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span className="text-[17px] font-semibold leading-tight">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-6">
        <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-4 py-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1f63ff] text-lg font-bold text-white">
            <span>{user?.ho_ten?.charAt(0) ?? "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {user?.ho_ten ?? "Người dùng"}
            </p>
            <p className="truncate text-sm text-slate-400">
              {user?.email ??
                (user?.role === "quan_ly" ? "Quản lý" : "Nhân viên")}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="flex-shrink-0 text-slate-400 transition-colors hover:text-white"
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
