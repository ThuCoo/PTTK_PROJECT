import { Settings as SettingsIcon, Building, Users, DollarSign, Bell, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="text-slate-600 mt-1">Quản lý cấu hình và thiết lập hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'Thông tin chung', icon: Building },
                { id: 'users', label: 'Quản lý người dùng', icon: Users },
                { id: 'pricing', label: 'Cấu hình giá', icon: DollarSign },
                { id: 'notifications', label: 'Thông báo', icon: Bell },
                { id: 'security', label: 'Bảo mật', icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-slate-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin chung</h2>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên ký túc xá</label>
                <input
                  type="text"
                  defaultValue="HomeStay Dorm"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    defaultValue="0901234567"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="contact@homestaydorm.vn"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                <textarea
                  rows={3}
                  defaultValue="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Cấu hình đặt cọc</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Công thức tính tiền cọc
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="2"
                        className="w-20 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">tháng × Số giường thuê</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Thời hạn thanh toán cọc (giờ)
                    </label>
                    <input
                      type="number"
                      defaultValue="24"
                      className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Chính sách hoàn cọc</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Chưa ký hợp đồng/Hủy thuê</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="80"
                        className="w-20 px-3 py-1 border border-slate-300 rounded text-right text-sm"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Lưu trú dưới 6 tháng (chưa hết hạn)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="50"
                        className="w-20 px-3 py-1 border border-slate-300 rounded text-right text-sm"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Lưu trú trên 6 tháng (chưa hết hạn)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="70"
                        className="w-20 px-3 py-1 border border-slate-300 rounded text-right text-sm"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Hết hạn hợp đồng</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="100"
                        className="w-20 px-3 py-1 border border-slate-300 rounded text-right text-sm"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
