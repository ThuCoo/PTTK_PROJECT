import { useState } from 'react';
import { CheckCircle, Circle, FileText, CreditCard, Key, Search, Plus, X, AlertCircle } from 'lucide-react';

export function CheckInProcess() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [groupMembers, setGroupMembers] = useState<any[]>([{
    id: 1,
    fullName: '',
    idCard: '',
    phone: '',
    permanentAddress: '',
    dateOfBirth: '',
    errors: {}
  }]);

  const steps = [
    { id: 1, title: 'Kiểm tra giấy tờ', icon: FileText },
    { id: 2, title: 'Kiểm tra điều kiện', icon: CheckCircle },
    { id: 3, title: 'Ký hợp đồng', icon: FileText },
    { id: 4, title: 'Thanh toán', icon: CreditCard },
    { id: 5, title: 'Bàn giao phòng', icon: Key },
  ];

  const pendingCheckIns = [
    {
      id: 1,
      customer: 'Nguyễn Văn A',
      room: 'P301',
      depositCode: 'DC001',
      date: '01/05/2026',
      time: '14:00',
      status: 'Chờ kiểm tra giấy tờ'
    },
    {
      id: 2,
      customer: 'Trần Thị B',
      room: 'P205',
      depositCode: 'DC002',
      date: '01/05/2026',
      time: '15:30',
      status: 'Đã kiểm tra giấy tờ'
    },
  ];

  const mockDeposits = [
    {
      depositCode: 'DC001',
      phone: '0901234567',
      customerName: 'Nguyễn Văn A',
      room: 'P301',
      area: 'Khu A',
      numBeds: 2,
      numPeople: 2,
      depositAmount: 7200000,
      depositDate: '15/04/2026'
    },
    {
      depositCode: 'DC002',
      phone: '0912345678',
      customerName: 'Trần Thị B',
      room: 'P205',
      area: 'Khu B',
      numBeds: 1,
      numPeople: 1,
      depositAmount: 5000000,
      depositDate: '18/04/2026'
    },
  ];

  const handleSearchDeposit = () => {
    setSearchError('');
    const found = mockDeposits.find(
      d => d.depositCode === searchQuery || d.phone === searchQuery
    );
    if (found) {
      setDepositInfo(found);
      setGroupMembers([{
        id: 1,
        fullName: '',
        idCard: '',
        phone: '',
        permanentAddress: '',
        dateOfBirth: '',
        errors: {}
      }]);
    } else {
      setSearchError('Không tìm thấy dữ liệu đặt cọc phù hợp');
      setDepositInfo(null);
    }
  };

  const addGroupMember = () => {
    if (!depositInfo) return;
    if (groupMembers.length >= depositInfo.numBeds) {
      return;
    }
    setGroupMembers([...groupMembers, {
      id: Date.now(),
      fullName: '',
      idCard: '',
      phone: '',
      permanentAddress: '',
      dateOfBirth: '',
      errors: {}
    }]);
  };

  const removeGroupMember = (id: number) => {
    if (groupMembers.length <= 1) return;
    setGroupMembers(groupMembers.filter(m => m.id !== id));
  };

  const updateGroupMember = (id: number, field: string, value: string) => {
    setGroupMembers(groupMembers.map(m =>
      m.id === id ? { ...m, [field]: value, errors: { ...m.errors, [field]: '' } } : m
    ));
  };

  const validateStep1 = () => {
    let hasError = false;
    const updatedMembers = groupMembers.map(member => {
      const errors: any = {};
      if (!member.fullName.trim()) {
        errors.fullName = 'Bắt buộc';
        hasError = true;
      }
      if (!member.idCard.trim()) {
        errors.idCard = 'Bắt buộc';
        hasError = true;
      }
      if (!member.phone.trim()) {
        errors.phone = 'Bắt buộc';
        hasError = true;
      }
      if (!member.permanentAddress.trim()) {
        errors.permanentAddress = 'Bắt buộc';
        hasError = true;
      }
      if (!member.dateOfBirth.trim()) {
        errors.dateOfBirth = 'Bắt buộc';
        hasError = true;
      }
      return { ...member, errors };
    });
    setGroupMembers(updatedMembers);
    return !hasError;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quy trình nhận phòng</h1>
        <p className="text-slate-600 mt-1">Quản lý quy trình check-in cho khách hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Lịch nhận phòng hôm nay</h2>
            <div className="space-y-3">
              {pendingCheckIns.map((checkin) => (
                <button
                  key={checkin.id}
                  className="w-full text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{checkin.customer}</p>
                      <p className="text-sm text-slate-600">{checkin.room}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{checkin.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Mã cọc: {checkin.depositCode}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      checkin.status === 'Chờ kiểm tra giấy tờ' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {checkin.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className={`text-xs mt-2 text-center ${
                        currentStep >= step.id ? 'text-slate-900 font-medium' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Bước 1: Kiểm tra giấy tờ và xác nhận thông tin</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tra cứu đặt cọc</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchDeposit()}
                      placeholder="Nhập mã đặt cọc hoặc số điện thoại"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSearchDeposit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      Tìm kiếm
                    </button>
                  </div>
                  {searchError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{searchError}</p>
                    </div>
                  )}
                </div>

                {depositInfo && (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-slate-900 mb-3">Thông tin đặt cọc</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">Mã đặt cọc:</span>
                          <span className="ml-2 font-medium text-slate-900">{depositInfo.depositCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Khách hàng:</span>
                          <span className="ml-2 font-medium text-slate-900">{depositInfo.customerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Phòng:</span>
                          <span className="ml-2 font-medium text-slate-900">{depositInfo.room} - {depositInfo.area}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Số giường đã cọc:</span>
                          <span className="ml-2 font-medium text-blue-600">{depositInfo.numBeds} giường</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Số tiền cọc:</span>
                          <span className="ml-2 font-medium text-slate-900">{depositInfo.depositAmount.toLocaleString()} VNĐ</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Ngày đặt cọc:</span>
                          <span className="ml-2 font-medium text-slate-900">{depositInfo.depositDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-slate-900">
                          Thông tin giấy tờ thành viên nhóm ({groupMembers.length}/{depositInfo.numBeds})
                        </h3>
                        <button
                          type="button"
                          onClick={addGroupMember}
                          disabled={groupMembers.length >= depositInfo.numBeds}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm thành viên
                        </button>
                      </div>

                      {groupMembers.length > depositInfo.numBeds && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">
                            Số lượng người cư trú ({groupMembers.length}) vượt quá số lượng giường/phòng đặt cọc ({depositInfo.numBeds})
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {groupMembers.map((member, index) => (
                          <div key={member.id} className="p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-slate-900">Thành viên {index + 1}</h4>
                              {groupMembers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeGroupMember(member.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Họ và tên *
                                </label>
                                <input
                                  type="text"
                                  value={member.fullName}
                                  onChange={(e) => updateGroupMember(member.id, 'fullName', e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    member.errors.fullName ? 'border-red-500' : 'border-slate-300'
                                  }`}
                                />
                                {member.errors.fullName && (
                                  <p className="text-xs text-red-600 mt-1">{member.errors.fullName}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  CCCD/CMND *
                                </label>
                                <input
                                  type="text"
                                  value={member.idCard}
                                  onChange={(e) => updateGroupMember(member.id, 'idCard', e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    member.errors.idCard ? 'border-red-500' : 'border-slate-300'
                                  }`}
                                />
                                {member.errors.idCard && (
                                  <p className="text-xs text-red-600 mt-1">{member.errors.idCard}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Số điện thoại *
                                </label>
                                <input
                                  type="tel"
                                  value={member.phone}
                                  onChange={(e) => updateGroupMember(member.id, 'phone', e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    member.errors.phone ? 'border-red-500' : 'border-slate-300'
                                  }`}
                                />
                                {member.errors.phone && (
                                  <p className="text-xs text-red-600 mt-1">{member.errors.phone}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Ngày sinh *
                                </label>
                                <input
                                  type="date"
                                  value={member.dateOfBirth}
                                  onChange={(e) => updateGroupMember(member.id, 'dateOfBirth', e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    member.errors.dateOfBirth ? 'border-red-500' : 'border-slate-300'
                                  }`}
                                />
                                {member.errors.dateOfBirth && (
                                  <p className="text-xs text-red-600 mt-1">{member.errors.dateOfBirth}</p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Địa chỉ thường trú *
                                </label>
                                <input
                                  type="text"
                                  value={member.permanentAddress}
                                  onChange={(e) => updateGroupMember(member.id, 'permanentAddress', e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    member.errors.permanentAddress ? 'border-red-500' : 'border-slate-300'
                                  }`}
                                />
                                {member.errors.permanentAddress && (
                                  <p className="text-xs text-red-600 mt-1">{member.errors.permanentAddress}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDepositInfo(null);
                          setSearchQuery('');
                          setSearchError('');
                        }}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleStep1Continue}
                        disabled={groupMembers.length > depositInfo.numBeds}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Lưu và tiếp tục
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 2: Kiểm tra điều kiện lưu trú</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Họ tên:</span>
                      <span className="ml-2 font-medium text-slate-900">Nguyễn Văn A</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Giới tính:</span>
                      <span className="ml-2 font-medium text-slate-900">Nam</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Phòng:</span>
                      <span className="ml-2 font-medium text-slate-900">P301 - Khu A</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Số giường:</span>
                      <span className="ml-2 font-medium text-slate-900">2 giường</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Giới tính phù hợp với khu vực</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Số lượng người ở phù hợp</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <span className="text-sm text-slate-700">Giấy tờ hợp lệ</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      Từ chối
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xác nhận đạt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 3: Lập và xác nhận hợp đồng</h2>
              <div className="space-y-4">
                <div className="p-6 border-2 border-slate-300 rounded-lg bg-slate-50">
                  <h3 className="text-center font-bold text-lg mb-4">HỢP ĐỒNG THUÊ PHÒNG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bên cho thuê:</strong> Ký túc xá HomeStay Dorm</p>
                    <p><strong>Bên thuê:</strong> Nguyễn Văn A</p>
                    <p><strong>CCCD:</strong> 001234567890</p>
                    <p><strong>Phòng thuê:</strong> P301 - Khu A</p>
                    <p><strong>Số giường:</strong> 2 giường</p>
                    <p><strong>Giá thuê:</strong> 1.800.000 VNĐ/tháng/giường</p>
                    <p><strong>Thời hạn:</strong> 6 tháng (từ 01/05/2026 đến 01/11/2026)</p>
                    <p><strong>Tiền cọc đã đặt:</strong> 7.200.000 VNĐ</p>
                    <p className="pt-2 border-t border-slate-300 mt-4">
                      <strong>Các khoản phí dịch vụ:</strong>
                    </p>
                    <ul className="ml-4 list-disc">
                      <li>Điện: 3.500 VNĐ/kWh</li>
                      <li>Nước: 80.000 VNĐ/người/tháng</li>
                      <li>Gửi xe: 50.000 VNĐ/xe/tháng</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xác nhận hợp đồng
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 4: Thanh toán kỳ đầu</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Chi tiết thanh toán</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền thuê tháng đầu (2 giường)</span>
                      <span className="font-medium text-slate-900">3.600.000 VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền nước (2 người)</span>
                      <span className="font-medium text-slate-900">160.000 VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phí gửi xe</span>
                      <span className="font-medium text-slate-900">50.000 VNĐ</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-300">
                      <span className="font-bold text-slate-900">Tổng cộng</span>
                      <span className="font-bold text-blue-600 text-lg">3.810.000 VNĐ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức thanh toán</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền thực thu</label>
                  <input
                    type="text"
                    placeholder="3.810.000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 5: Bàn giao phòng và tài sản</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-green-700">✓ Thanh toán thành công! Tiến hành bàn giao phòng.</p>
                </div>

                <h3 className="font-medium text-slate-900">Danh mục tài sản bàn giao</h3>
                <div className="space-y-2">
                  {['Giường ngủ (2 cái)', 'Nệm (2 cái)', 'Tủ quần áo (2 cái)', 'Bàn học (2 cái)', 'Ghế (2 cái)', 'Chìa khóa (2 bộ)', 'Điều hòa'].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú tình trạng tài sản</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập ghi chú về tình trạng tài sản nếu có..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Hoàn tất bàn giao
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
