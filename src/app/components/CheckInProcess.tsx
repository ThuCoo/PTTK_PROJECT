import { useState, useEffect } from 'react';
import { CheckCircle, FileText, CreditCard, Key, Plus, X, AlertCircle, Search } from 'lucide-react';
import { datCocApi, hopDongApi, thanhToanApi } from '../../services/api';
export function CheckInProcess() {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([{
    id: 1,
    fullName: '',
    idCard: '',
    phone: '',
    permanentAddress: '',
    dateOfBirth: '',
    errors: {}
  }]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State cho DB data
  const [mockDeposits, setMockDeposits] = useState<any[]>([]);
  const [pendingConditions, setPendingConditions] = useState<any[]>([]);
  const [pendingContracts, setPendingContracts] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingHandovers, setPendingHandovers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingContract, setLoadingContract] = useState(false);

  // Load dữ liệu từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load Deposits có trạng thái 'Chờ thanh toán' hoặc 'Chờ xác nhận'
        const deposits = await datCocApi.getAll();
        setMockDeposits(deposits || []);
        
        // Load Pending Conditions - những hóa đơn cọc chưa có hợp đồng
        const pendingCond = deposits?.filter((d: any) => d.ma_trang_thai === 'Chờ thanh toán' || d.ma_trang_thai === 'Chờ xác nhận') || [];
        setPendingConditions(pendingCond.map((d: any, idx: number) => ({
          id: idx,
          depositCode: d.ma_hoa_don,
          customerName: d.ten_khach,
          room: d.ma_phong,
          area: d.khu_vuc,
          numBeds: d.so_tien_coc, // Placeholder
          gender: 'Nam',
          status: 'Chờ kiểm tra điều kiện',
          members: []
        })));
        
        // Load Pending Contracts
        const contracts = await hopDongApi.getAllPending();
        setPendingContracts(contracts?.map((c: any, idx: number) => ({
          id: idx,
          depositCode: c.depositCode,
          customerName: c.customerName,
          room: c.room,
          area: 'Khu A',
          numBeds: 2,
          monthlyRent: c.monthlyRent || 0,
          depositAmount: 0,
          status: 'Đủ điều kiện chờ ký hợp đồng',
          members: []
        })) || []);
        
        // Load Pending Payments
        const payments = await thanhToanApi.getAll();
        setPendingPayments(payments?.map((p: any, idx: number) => ({
          id: idx,
          paymentCode: p.ma_phieu_tt,
          contractCode: 'HD001',
          customerName: 'Khách hàng',
          room: 'P303',
          totalAmount: p.so_tien || 0,
          status: p.trang_thai
        })) || []);
        
        // Load Pending Handovers - những hợp đồng đã thanh toán
        const allContracts = await hopDongApi.getAllPending();
        setPendingHandovers(allContracts?.map((c: any, idx: number) => ({
          id: idx,
          contractCode: c.depositCode,
          customerName: c.customerName,
          room: c.room,
          numBeds: 1,
          status: 'Đã thanh toán - Chờ bàn giao'
        })) || []);
        
      } catch (error) {
        console.error('Lỗi load data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  const functions = [
    { id: 'documents', title: 'Kiểm tra giấy tờ', icon: FileText, color: 'bg-blue-500', count: 5, description: 'Tra cứu và xác nhận thông tin' },
    { id: 'conditions', title: 'Kiểm tra điều kiện', icon: CheckCircle, color: 'bg-green-500', count: pendingConditions.length, description: 'Phê duyệt điều kiện lưu trú' },
    { id: 'contract', title: 'Lập hợp đồng', icon: FileText, color: 'bg-purple-500', count: pendingContracts.length, description: 'Tạo và xác nhận hợp đồng' },
    { id: 'payment', title: 'Thanh toán', icon: CreditCard, color: 'bg-orange-500', count: pendingPayments.length, description: 'Thu tiền kỳ đầu' },
    { id: 'handover', title: 'Bàn giao phòng', icon: Key, color: 'bg-pink-500', count: pendingHandovers.length, description: 'Bàn giao tài sản' }
  ];

  // Load contracts khi click vào "Lập hợp đồng"
  useEffect(() => {
    if (activeFunction === 'contract') {
      const loadContracts = async () => {
        try {
          setLoadingContract(true);
          const contracts = await hopDongApi.getAllPending();
          setPendingContracts(contracts?.map((c: any, idx: number) => ({
            id: idx,
            depositCode: c.depositCode,
            customerName: c.customerName,
            room: c.room,
            area: 'Khu A',
            numBeds: 2,
            monthlyRent: c.monthlyRent || 0,
            depositAmount: 0,
            status: 'Đủ điều kiện chờ ký hợp đồng',
            members: []
          })) || []);
        } catch (error) {
          console.error('Lỗi load contracts:', error);
        } finally {
          setLoadingContract(false);
        }
      };
      loadContracts();
    }
  }, [activeFunction]);

  // Handle click vào contract item để load chi tiết
// Handle click vào contract item để load chi tiết
  const handleSelectContract = async (record: any) => {
    try {
      setLoadingContract(true);
      // Gọi API tạo/lấy hợp đồng bằng mã hóa đơn cọc
      const details = await hopDongApi.getOrCreate(record.depositCode);
      
      // Gán thẳng details từ backend trả về (vì BUS đã format chuẩn rồi)
      // Giữ lại record.id để menu bên trái biết đang active cái nào
      setSelectedRecord({
        ...details,
        id: record.id,
        // Đảm bảo members luôn là mảng, tránh React bị crash khi dùng .map()
        members: details.members || [] 
      });
      
    } catch (error: any) {
      console.error('Lỗi load chi tiết contract:', error);
      alert(error.response?.data?.error || 'Lỗi khi tải chi tiết hợp đồng');
    } finally {
      setLoadingContract(false);
    }
  };
   const handleConfirmContract = async () => {
    try {
      // Gọi API confirm (truyền contractId lấy từ selectedRecord)
      console.log('contract ', selectedRecord)
      await hopDongApi.confirm(selectedRecord.contractId);
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedRecord(null); // Đóng panel chi tiết
        
        // Cập nhật lại list bên trái (xóa hợp đồng vừa ký đi)
        setPendingContracts(prev => prev.filter(c => c.id !== selectedRecord.id));
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi xác nhận hợp đồng');
    }
  };

  // Xử lý khi bấm nút "Hủy hợp đồng"
  const handleCancelContract = async () => {
    const isConfirm = window.confirm('Bạn có chắc chắn muốn hủy hợp đồng này không?');
    if (!isConfirm) return;

    try {
      await hopDongApi.cancel(selectedRecord.contractId);
      alert('Đã hủy hợp đồng thành công!');
      
      setSelectedRecord(null);
      // Cập nhật lại list bên trái
      setPendingContracts(prev => prev.filter(c => c.id !== selectedRecord.id));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi hủy hợp đồng');
    }
  };

const handleSearchDeposit = async () => {
    setSearchError('');
    
    try {
      const found = await datCocApi.getByPhone(searchQuery);
      
      if (found) {
        // Gán thông tin hiển thị màu xanh phía trên
        // Đảm bảo found có members và numBeds
        const depositData = {
          ...found,
          members: found.members || [],
          numBeds: found.numBeds || 0
        };
        setDepositInfo(depositData);
        
        // 👉 KIỂM TRA VÀ ĐIỀN DATA VÀO CÁC Ô INPUT
        if (depositData.members && depositData.members.length > 0) {
          setGroupMembers(depositData.members.map((m: any) => ({
            id: m.id || Date.now(),
            fullName: m.fullName || '',
            idCard: m.idCard || '',
            phone: m.phone || '',
            permanentAddress: m.permanentAddress || '',
            dateOfBirth: m.dateOfBirth || '',
            errors: {}
          })));
        } else {
          // Chưa có data -> Hiện 1 ô trống mặc định
          setGroupMembers([{
            id: 1,
            fullName: '',
            idCard: '',
            phone: '',
            permanentAddress: '',
            dateOfBirth: '',
            errors: {}
          }]);
        }

      } else {
        setSearchError('Không tìm thấy dữ liệu đặt cọc phù hợp');
        setDepositInfo(null);
        setGroupMembers([{
          id: 1,
          fullName: '',
          idCard: '',
          phone: '',
          permanentAddress: '',
          dateOfBirth: '',
          errors: {}
        }]);
      }
    } catch (error: any) {
      console.error("Lỗi:", error);
      setSearchError(error.response?.data?.error || 'Lỗi kết nối máy chủ');
      setDepositInfo(null);
      setGroupMembers([{
        id: 1,
        fullName: '',
        idCard: '',
        phone: '',
        permanentAddress: '',
        dateOfBirth: '',
        errors: {}
      }]);
    }
  };

  const addGroupMember = () => {
    if (!depositInfo || groupMembers.length >= depositInfo.numBeds) return;
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

  const validateDocuments = () => {
    let hasError = false;
    const updatedMembers = groupMembers.map(member => {
      const errors: any = {};
      if (!member.fullName?.trim()) { errors.fullName = 'Bắt buộc'; hasError = true; }
      if (!member.idCard?.trim()) { errors.idCard = 'Bắt buộc'; hasError = true; }
      if (!member.phone?.trim()) { errors.phone = 'Bắt buộc'; hasError = true; }
      if (!member.permanentAddress?.trim()) { errors.permanentAddress = 'Bắt buộc'; hasError = true; }
      if (!member.dateOfBirth?.trim()) { errors.dateOfBirth = 'Bắt buộc'; hasError = true; }
      return { ...member, errors };
    });
    setGroupMembers(updatedMembers);
    return !hasError;
  };

  const handleSaveDocuments = async () => {
    // 1. Kiểm tra số lượng
    if (groupMembers.length > depositInfo.numBeds) {
      alert('Số lượng người cư trú vượt quá số lượng giường/phòng đặt cọc');
      return;
    }

    // 2. Validate form trên UI
    if (validateDocuments()) {
      try {
        // 👇 GỌI API LƯU VÀO DATABASE (Truyền đúng mã Đặt Cọc - depositCode)
        await datCocApi.saveMembers(depositInfo.depositCode, groupMembers);

        // 👇 THÀNH CÔNG: Mở modal và reset
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setDepositInfo(null);
          setSearchQuery('');
          setGroupMembers([{
            id: 1,
            fullName: '',
            idCard: '',
            phone: '',
            permanentAddress: '',
            dateOfBirth: '',
            errors: {}
          }]);
        }, 2000);

      } catch (error: any) {
        // Thất bại: báo lỗi
        console.error("Lỗi khi lưu:", error);
        alert(error.response?.data?.error || 'Đã xảy ra lỗi khi lưu. Vui lòng thử lại!');
      }
    }
  };

  const toggleMemberApproval = (memberId: number, approved: boolean) => {
    setGroupMembers(groupMembers.map(m =>
      m.id === memberId ? { ...m, approved } : m
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quy trình nhận phòng</h1>
        <p className="text-slate-600 mt-1">Quản lý các bước trong quy trình check-in</p>
      </div>

      {/* Main Function Cards - Hiển thị khi chưa chọn chức năng */}
      {!activeFunction && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {functions.map(func => {
            const Icon = func.icon;
            return (
              <button
                key={func.id}
                onClick={() => setActiveFunction(func.id)}
                className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${func.color} w-16 h-16 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                    {func.count} hồ sơ
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{func.title}</h3>
                <p className="text-sm text-slate-600">{func.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Kiểm tra giấy tờ - Giao diện tìm kiếm (KHÔNG có list card) */}
      {activeFunction === 'documents' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Bước 1: Kiểm tra giấy tờ và xác nhận thông tin</h2>
            <button
              onClick={() => {
                setActiveFunction(null);
                setDepositInfo(null);
                setSearchQuery('');
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Tra cứu đặt cọc */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tra cứu đặt cọc</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchDeposit()}
                  placeholder="0901234567"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchDeposit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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

            {/* Thông tin đặt cọc */}
            {depositInfo && (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Thông tin đặt cọc</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                      <span className="text-slate-600">Mã đặt cọc:</span>
                      <span className="ml-2 font-semibold text-slate-900">{depositInfo.depositCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Khách hàng:</span>
                      <span className="ml-2 font-semibold text-slate-900">{depositInfo.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Phòng:</span>
                      <span className="ml-2 font-semibold text-slate-900">{depositInfo.room} - {depositInfo.area}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Số giường đã cọc:</span>
                      <span className="ml-2 font-semibold text-blue-600">{depositInfo.numBeds} giường</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Số tiền cọc:</span>
                      <span className="ml-2 font-semibold text-slate-900">{depositInfo.depositAmount.toLocaleString()} VNĐ</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Ngày đặt cọc:</span>
                      <span className="ml-2 font-semibold text-slate-900">{depositInfo.depositDate}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin giấy tờ thành viên */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Thông tin giấy tờ thành viên nhóm ({groupMembers.length}/{depositInfo.numBeds})
                    </h3>
                    <button
                      onClick={addGroupMember}
                      disabled={groupMembers.length >= depositInfo.numBeds}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
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

                  <div className="space-y-6">
                    {groupMembers.map((member, index) => (
                      <div key={member.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-semibold text-slate-900">Thành viên {index + 1}</h4>
                          {groupMembers.length > 1 && (
                            <button
                              onClick={() => removeGroupMember(member.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên *</label>
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
                              <label className="block text-sm font-medium text-slate-700 mb-2">CCCD/CMND *</label>
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
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại *</label>
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
                              <label className="block text-sm font-medium text-slate-700 mb-2">Ngày sinh *</label>
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
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ thường trú *</label>
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

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setDepositInfo(null);
                      setSearchQuery('');
                      setGroupMembers([{
                        id: 1,
                        fullName: '',
                        idCard: '',
                        phone: '',
                        permanentAddress: '',
                        dateOfBirth: '',
                        errors: {}
                      }]);
                    }}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveDocuments}
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

      {/* Kiểm tra điều kiện - CÓ list card bên trái */}
      {activeFunction === 'conditions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">Hồ sơ chờ kiểm tra</h3>
              <button onClick={() => setActiveFunction(null)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            {pendingConditions.map(record => (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedRecord(record);
                  setGroupMembers(record.members.map((m: any) => ({ ...m, approved: null })));
                }}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  selectedRecord?.id === record.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{record.depositCode}</p>
                    <p className="text-sm text-slate-600">{record.customerName}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">{record.status}</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>Phòng: {record.room}</p>
                  <p>Thành viên: {record.members.length}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord ? (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Kiểm tra điều kiện lưu trú</h2>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-600">Mã:</span> <span className="ml-2 font-medium">{selectedRecord.depositCode}</span></div>
                  <div><span className="text-slate-600">Khách:</span> <span className="ml-2 font-medium">{selectedRecord.customerName}</span></div>
                  <div><span className="text-slate-600">Phòng:</span> <span className="ml-2 font-medium">{selectedRecord.room}</span></div>
                  <div><span className="text-slate-600">Khu vực:</span> <span className="ml-2 font-medium">{selectedRecord.gender}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-900 mb-3">Danh sách thành viên - Xác nhận từng người</h3>
                <div className="space-y-3">
                  {groupMembers.map((member: any, index: number) => {
                    const genderMatch = member.gender === selectedRecord.gender;
                    return (
                      <div
                        key={member.id}
                        className={`p-4 border-2 rounded-lg ${
                          member.approved === true ? 'border-green-200 bg-green-50' :
                          member.approved === false ? 'border-red-200 bg-red-50' :
                          genderMatch ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-2">Thành viên {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-slate-600">Họ tên:</span> <span className="ml-2 font-medium">{member.fullName}</span></div>
                              <div><span className="text-slate-600">CCCD:</span> <span className="ml-2 font-medium">{member.idCard}</span></div>
                              <div>
                                <span className="text-slate-600">Giới tính:</span>
                                <span className={`ml-2 font-medium ${genderMatch ? 'text-green-600' : 'text-red-600'}`}>
                                  {member.gender} {genderMatch ? '✓' : '✗ Không phù hợp'}
                                </span>
                              </div>
                              <div><span className="text-slate-600">Ngày sinh:</span> <span className="ml-2 font-medium">{member.dateOfBirth}</span></div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleMemberApproval(member.id, true)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                member.approved === true ? 'bg-green-600 text-white' : 'border border-green-600 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              Đạt
                            </button>
                            <button
                              onClick={() => toggleMemberApproval(member.id, false)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                member.approved === false ? 'bg-red-600 text-white' : 'border border-red-600 text-red-600 hover:bg-red-50'
                              }`}
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setSelectedRecord(null)} className="px-6 py-2 border rounded-lg">Hủy</button>
                <button
                  onClick={() => {
                    setShowSuccessModal(true);
                    setTimeout(() => {
                      setShowSuccessModal(false);
                      setSelectedRecord(null);
                    }, 2000);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  Lưu kết quả
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center h-96 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Chọn hồ sơ để kiểm tra điều kiện</p>
            </div>
          )}
        </div>
      )}

      {/* Lập hợp đồng - CÓ list card bên trái */}
      {activeFunction === 'contract' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">Hồ sơ chờ ký hợp đồng</h3>
              <button onClick={() => setActiveFunction(null)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            {pendingContracts.map(record => (
              <button
                key={record.id}
                onClick={() => handleSelectContract(record)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  selectedRecord?.id === record.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{record.depositCode}</p>
                    <p className="text-sm text-slate-600">{record.customerName}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Đủ điều kiện</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>Phòng: {record.room}</p>
                  <p>Giá thuê: {record.monthlyRent.toLocaleString()} VNĐ/tháng</p>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord ? (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Lập và xác nhận hợp đồng</h2>

              <div className="p-5 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
                <h3 className="font-semibold text-slate-900 mb-3">THÔNG TIN HỢP ĐỒNG THUÊ PHÒNG</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã đặt cọc:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.depositCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.room} - {selectedRecord.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Số giường:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.numBeds} giường</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-200">
                  <h4 className="font-medium text-slate-900 mb-3">Chi phí:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền thuê hàng tháng:</span>
                      <span className="font-semibold">{selectedRecord.monthlyRent.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phí dịch vụ:</span>
                      <span className="font-semibold">{(selectedRecord.serviceFee || 0).toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền điện nước (ước tính):</span>
                      <span className="font-semibold">{(selectedRecord.estimatedUtilityFee || 200000).toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200">
                      <span className="text-slate-900 font-semibold">Tổng tiền kỳ đầu:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {(selectedRecord.totalFirstPeriod || selectedRecord.monthlyRent + (selectedRecord.serviceFee || 0) + (selectedRecord.estimatedUtilityFee || 200000)).toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-200">
                  <h4 className="font-medium text-slate-900 mb-2">Danh sách thành viên:</h4>
                  <div className="space-y-1">
                    {selectedRecord.members.map((member: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <span className="text-slate-600">{idx + 1}. </span>
                        <span className="font-medium">{member.fullName}</span>
                        <span className="text-slate-500 ml-2">({member.idCard})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-200 text-xs text-slate-600 space-y-1">
                  <p>• Kỳ thanh toán: Hàng tháng</p>
                  <p>• Thời hạn hợp đồng: 12 tháng (có thể gia hạn)</p>
                  <p>• Ngày bắt đầu: 07/05/2026</p>
                  <p>• Ngày kết thúc: 07/05/2027</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCancelContract} 
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy hợp đồng
                </button>
                <button
                  onClick={handleConfirmContract}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Xác nhận tạo hợp đồng
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center h-96 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Chọn hồ sơ để tạo hợp đồng</p>
            </div>
          )}
        </div>
      )}

      {/* Thanh toán - CÓ list card bên trái */}
      {activeFunction === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">Phiếu thanh toán chờ</h3>
              <button onClick={() => setActiveFunction(null)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            {pendingPayments.map(record => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  selectedRecord?.id === record.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{record.paymentCode}</p>
                    <p className="text-sm text-slate-600">{record.customerName}</p>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Chờ thanh toán</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>Phòng: {record.room}</p>
                  <p className="font-semibold text-orange-600 mt-1">{record.totalAmount.toLocaleString()} VNĐ</p>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord ? (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Thanh toán kỳ đầu</h2>

              <div className="p-5 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                <h3 className="font-semibold text-slate-900 mb-3">CHI TIẾT THANH TOÁN</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã phiếu:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.paymentCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Mã hợp đồng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.contractCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.room}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-orange-200">
                  <h4 className="font-medium text-slate-900 mb-3">Số tiền phải thu:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền thuê tháng 1:</span>
                      <span className="font-semibold">1,800,000 VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phí dịch vụ:</span>
                      <span className="font-semibold">180,000 VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiền điện nước:</span>
                      <span className="font-semibold">200,000 VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phí vệ sinh:</span>
                      <span className="font-semibold">50,000 VNĐ</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-orange-200">
                      <span className="text-slate-900 font-semibold">Tổng cộng:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {selectedRecord.totalAmount.toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền thực thu *</label>
                  <input
                    type="text"
                    placeholder="2,230,000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức thanh toán *</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản ngân hàng</option>
                    <option>Ví điện tử (Momo, ZaloPay)</option>
                    <option>Thẻ tín dụng/ghi nợ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi chú về giao dịch (nếu có)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(true);
                    setTimeout(() => {
                      setShowSuccessModal(false);
                      setSelectedRecord(null);
                    }, 2000);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center h-96 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Chọn phiếu thanh toán để xử lý</p>
            </div>
          )}
        </div>
      )}

      {/* Bàn giao phòng - CÓ list card bên trái */}
      {activeFunction === 'handover' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">Hồ sơ chờ bàn giao</h3>
              <button onClick={() => setActiveFunction(null)} className="text-slate-600 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            {pendingHandovers.map(record => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  selectedRecord?.id === record.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{record.contractCode}</p>
                    <p className="text-sm text-slate-600">{record.customerName}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Đã thanh toán</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>Phòng: {record.room}</p>
                  <p>Số giường: {record.numBeds}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord ? (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Bàn giao phòng và tài sản</h2>

              <div className="p-5 bg-pink-50 border border-pink-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-3">THÔNG TIN BÀN GIAO</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã hợp đồng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.contractCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng:</span>
                    <span className="ml-2 font-semibold text-slate-900">{selectedRecord.room}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Ngày bàn giao:</span>
                    <span className="ml-2 font-semibold text-slate-900">07/05/2026</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-900 mb-3">Danh mục tài sản/vật dụng</h3>
                <p className="text-sm text-slate-600 mb-4">Kiểm tra và xác nhận trạng thái thực tế của từng vật dụng</p>

                <div className="space-y-2">
                  {[
                    { name: 'Nệm', quantity: selectedRecord.numBeds },
                    { name: 'Tủ quần áo', quantity: 1 },
                    { name: 'Bàn làm việc', quantity: selectedRecord.numBeds },
                    { name: 'Ghế', quantity: selectedRecord.numBeds },
                    { name: 'Chìa khóa phòng', quantity: 2 },
                    { name: 'Điều hòa nhiệt độ', quantity: 1 },
                    { name: 'Quạt trần', quantity: 1 },
                    { name: 'Đèn chiếu sáng', quantity: 2 }
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-pink-600 border-slate-300 rounded focus:ring-pink-500"
                      />
                      <span className="flex-1 text-sm font-medium text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500">x{item.quantity}</span>
                      <select className="px-3 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500">
                        <option>Tốt</option>
                        <option>Khá</option>
                        <option>Trung bình</option>
                        <option>Hỏng</option>
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú thêm</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú về tình trạng tài sản hoặc lưu ý khác..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(true);
                    setTimeout(() => {
                      setShowSuccessModal(false);
                      setSelectedRecord(null);
                      setActiveFunction(null);
                    }, 2000);
                  }}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Hoàn tất bàn giao
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center h-96 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Chọn hồ sơ để thực hiện bàn giao</p>
            </div>
          )}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thành công</h2>
            <p className="text-slate-600">Thao tác đã được thực hiện thành công</p>
          </div>
        </div>
      )}
    </div>
  );
}
