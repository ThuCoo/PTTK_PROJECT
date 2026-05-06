import {
  Home, Users, Bed, Calendar, DollarSign, FileText,
  LogIn, LogOut as LogOutIcon, ClipboardList, Settings,
  BarChart3, Filter, Layers, Building2, Power
} from 'lucide-react';

interface SidebarUser {
  username: string;
  ho_ten: string;
  role: 'nhan_vien' | 'quan_ly';
  email?: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: SidebarUser | null;
  onLogout?: () => void;
}

export function Sidebar({ activeSection, onSectionChange, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard',    label: 'Tổng quan',           icon: Home },
    { id: 'customers',    label: 'Quản lý khách hàng',  icon: Users },
    { id: 'rooms',        label: 'Quản lý phòng/giường',icon: Bed },
    { id: 'roomSelection',label: 'Chọn phòng/giường',   icon: Layers },
    { id: 'appointments', label: 'Lịch xem phòng',      icon: Calendar },
    { id: 'availability', label: 'Kiểm tra tình trạng', icon: Filter },
    { id: 'deposits',     label: 'Đặt cọc',             icon: DollarSign },
    { id: 'checkin',      label: 'Nhận phòng',          icon: LogIn },
    { id: 'checkout',     label: 'Trả phòng',           icon: LogOutIcon },
    { id: 'contracts',    label: 'Hợp đồng',            icon: FileText },
    { id: 'payments',     label: 'Thanh toán',          icon: ClipboardList },
    { id: 'reports',      label: 'Báo cáo',             icon: BarChart3 },
    { id: 'settings',     label: 'Cài đặt',             icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">HomeStay Dorm</h1>
        <p className="text-xs text-slate-400 mt-1">Hệ thống quản lý ký túc xá</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">
              {user?.ho_ten?.charAt(0) ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.ho_ten ?? 'Người dùng'}</p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role === 'quan_ly' ? '🔑 Quản lý' : '👤 Nhân viên'}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Power className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
