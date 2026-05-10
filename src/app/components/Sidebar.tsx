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
  role: "nhan_vien" | "quan_ly" | "nv_sale" | "nv_phu_trach" | "nv_ke_toan" | "sale" | "phu_trach" | "ke_toan" | "admin";
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
    { id: "dashboard", label: "Tổng quan", icon: Home, roles: ['*'] },
    { id: "customers", label: "Quản lý khách hàng", icon: Users, roles: ['quan_ly', 'nv_sale', 'sale'] },
    { id: "rooms", label: "Quản lý phòng/giường", icon: Bed, roles: ['quan_ly'] },
    { id: "roomSelection", label: "Chọn phòng/giường", icon: Layers, roles: ['nv_sale', 'sale'] },
    { id: "appointments", label: "Lịch xem phòng", icon: Calendar, roles: ['nv_sale', 'sale'] },
    { id: "preRentalReview", label: "Rà soát điều kiện & tình trạng", icon: CheckSquare, roles: ['quan_ly', 'nv_sale', 'sale'] },
    { id: "availability", label: "Kiểm tra tình trạng", icon: Filter, roles: ['quan_ly', 'nv_sale', 'sale'] },
    { id: "contracts", label: "Hợp đồng", icon: FileText, roles: ['quan_ly', 'nv_phu_trach', 'phu_trach'] },
    { id: "deposits", label: "Đặt cọc", icon: DollarSign, roles: ['nv_sale', 'sale'] },
    { id: "checkin", label: "Nhận phòng", icon: LogIn, roles: ['quan_ly'] },
    { id: "checkout", label: "Trả phòng", icon: LogOutIcon, roles: ['quan_ly', 'nv_sale', 'sale'] },
    { id: "roomReturn", label: "Hoàn trả phòng", icon: Building2, roles: ['quan_ly'] },
    { id: "payments", label: "Thanh toán", icon: ClipboardList, roles: ['quan_ly', 'nv_ke_toan', 'ke_toan'] },
    { id: "reports", label: "Báo cáo", icon: BarChart3, roles: ['quan_ly'] },
    { id: "settings", label: "Cài đặt", icon: Settings, roles: ['quan_ly'] },
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes('*') || user?.role === 'admin' || (user?.role && item.roles.includes(user.role))
  );

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
          {visibleItems.map((item) => {
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
                (user?.role === "quan_ly" ? "Quản lý" : user?.role === "admin" ? "Quản trị viên" : "Nhân viên")}
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
