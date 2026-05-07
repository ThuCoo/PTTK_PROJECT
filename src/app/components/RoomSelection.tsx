import { useState, useEffect } from 'react';
import { CheckCircle, Bed, Users, MapPin, DollarSign, X, Home, Info, Trash2 } from 'lucide-react';
import { phongApi,khachHangApi } from '../../services/api';
// import { useQuery } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Thêm useQueryClient

// const initialRoomsData = [
//   {
//     id: 'P301',
//     name: 'P301',
//     area: 'Khu A',
//     floor: 3,
//     type: 'Phòng 4 người',
//     capacity: 4,
//     occupied: 2,
//     price: 1800000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Tủ lạnh', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Đang sử dụng', occupant: 'Hoàng Văn E' },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Đang sử dụng', occupant: 'Phan Văn F' },
//       { id: 4, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P302',
//     name: 'P302',
//     area: 'Khu A',
//     floor: 3,
//     type: 'Phòng 4 người',
//     capacity: 4,
//     occupied: 1,
//     price: 1800000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Đang sử dụng', occupant: 'Ngô Văn G' },
//       { id: 4, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P303',
//     name: 'P303',
//     area: 'Khu A',
//     floor: 3,
//     type: 'Phòng 3 người',
//     capacity: 3,
//     occupied: 0,
//     price: 2000000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Tủ lạnh', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P405',
//     name: 'P405',
//     area: 'Khu A',
//     floor: 4,
//     type: 'Phòng 5 người',
//     capacity: 5,
//     occupied: 0,
//     price: 1600000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//       { id: 5, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P412',
//     name: 'P412',
//     area: 'Khu A',
//     floor: 4,
//     type: 'Phòng 6 người',
//     capacity: 6,
//     occupied: 0,
//     price: 1500000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//       { id: 5, status: 'Trống', occupant: null },
//       { id: 6, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P501',
//     name: 'P501',
//     area: 'Khu A',
//     floor: 5,
//     type: 'Phòng 7 người',
//     capacity: 7,
//     occupied: 0,
//     price: 1400000,
//     gender: 'Nam',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//       { id: 5, status: 'Trống', occupant: null },
//       { id: 6, status: 'Trống', occupant: null },
//       { id: 7, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P205',
//     name: 'P205',
//     area: 'Khu B',
//     floor: 2,
//     type: 'Phòng 2 người',
//     capacity: 2,
//     occupied: 0,
//     price: 2500000,
//     gender: 'Nữ',
//     amenities: ['Điều hòa', 'Tủ lạnh', 'Wifi', 'Máy giặt'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P206',
//     name: 'P206',
//     area: 'Khu B',
//     floor: 2,
//     type: 'Phòng 4 người',
//     capacity: 4,
//     occupied: 0,
//     price: 2000000,
//     gender: 'Nữ',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P207',
//     name: 'P207',
//     area: 'Khu B',
//     floor: 2,
//     type: 'Phòng 3 người',
//     capacity: 3,
//     occupied: 0,
//     price: 2200000,
//     gender: 'Nữ',
//     amenities: ['Điều hòa', 'Tủ lạnh', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P308',
//     name: 'P308',
//     area: 'Khu B',
//     floor: 3,
//     type: 'Phòng 5 người',
//     capacity: 5,
//     occupied: 0,
//     price: 1800000,
//     gender: 'Nữ',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//       { id: 5, status: 'Trống', occupant: null },
//     ]
//   },
//   {
//     id: 'P409',
//     name: 'P409',
//     area: 'Khu B',
//     floor: 4,
//     type: 'Phòng 7 người',
//     capacity: 7,
//     occupied: 0,
//     price: 1600000,
//     gender: 'Nữ',
//     amenities: ['Điều hòa', 'Wifi'],
//     beds: [
//       { id: 1, status: 'Trống', occupant: null },
//       { id: 2, status: 'Trống', occupant: null },
//       { id: 3, status: 'Trống', occupant: null },
//       { id: 4, status: 'Trống', occupant: null },
//       { id: 5, status: 'Trống', occupant: null },
//       { id: 6, status: 'Trống', occupant: null },
//       { id: 7, status: 'Trống', occupant: null },
//     ]
//   },
// ];

export function RoomSelection() {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [showRoomList, setShowRoomList] = useState(false);
  const [showBedSelection, setShowBedSelection] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBeds, setSelectedBeds] = useState<any[]>([]);
  const [registrationDataState, setRegistrationDataState] = useState<any[]>([]);
  const [roomsFormatted, setRoomsFormatted] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: registrationData = [] } = useQuery({
    queryKey: ['khachHang'],
    queryFn: () => khachHangApi.getAll(),
  });
   const { data: detailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['khachHangDetail', selectedId],
    queryFn: () => khachHangApi.getById(selectedId!),
    enabled: !!selectedId // Chỉ chạy api này khi selectedId có dữ liệu
  });
  const { data: phongPhuHop = [], isLoading: isLoadingPhong } = useQuery({
    queryKey: ['phong-phu-hop', selectedRegistration?.id],
    queryFn: () => phongApi.findPhuHop(selectedRegistration.id),
    enabled: !!selectedRegistration?.id && showRoomList
  });

  useEffect(() => {
    if (detailData) {
      setSelectedRegistration((prev: any) => ({
        ...prev,
        ...detailData // Ghi đè dữ liệu mới nhất (có assignedRooms) vào state hiện tại
      }));
    }
  }, [detailData]);
  // Initialize state with assignedRooms when data loads

  useEffect(() => {
    const dataWithAssignments = (registrationData as any[]).map(reg => ({
      ...reg,
      assignedRooms: reg.assignedRooms || []
    }));
    setRegistrationDataState(dataWithAssignments);
  }, [registrationData]);

    useEffect(() => {
    if (!phongPhuHop || phongPhuHop.length === 0) {
      setRoomsFormatted([]);
      return;
    }

    const mapped = (phongPhuHop as any[]).map(p => ({
      id: p.maphong,
      name: p.maphong,
      type: p.loaiphong,
      capacity: parseInt(p.succhuatoida),
      area: p.khuvuc,
      gender: p.gioitinhapdung,
      price: parseFloat(p.giathuephong),
      occupied: parseInt(p.tong_giuong) - parseInt(p.giuong_trong),
      floor: parseInt(p.maphong.substring(1, 2)) || 1,
      amenities: [],
      // SỬA TẠI ĐÂY: Dùng trực tiếp p.beds từ API
      beds: p.beds ? p.beds.map((b: any) => ({
        id: b.id,
        magiuong: b.magiuong, // Dữ liệu thật từ DB (G101_1, G101_2...)
        status: b.status,
        occupant: null
      })) : []
    }));
    
    setRoomsFormatted(mapped);
  }, [phongPhuHop]);
 

  // ✅ CẬP NHẬT TRẠNG THÁI GIƯỜNG khi có sự thay đổi assignedRooms
  useEffect(() => {
    setRoomsFormatted(prevRooms =>
      prevRooms.map(room => ({
        ...room,
        beds: room.beds.map((bed: any) => {
          // Kiểm tra xem giường này có được assign cho ai không
          const isAssigned = registrationDataState.some(reg => 
            reg.assignedRooms?.some((assignment: any) => 
              assignment.room === room.name && assignment.bed === bed.id
            )
          );

          return {
            ...bed,
            // Nếu giường được assign → "Đang sử dụng", ngược lại giữ nguyên
            status: isAssigned ? 'Đang sử dụng' : bed.status,
            // Có thể thêm occupant từ khách hàng nếu cần
          };
        })
      }))
    );
  }, [registrationDataState]);

    const handleSelectRoom = async (room: any) => { // Thêm async
    // Các dòng setSelectedRoom(room); setSelectedBeds([]); giữ nguyên
    setSelectedRoom(room);
    setSelectedBeds([]);

    if (selectedRegistration.loai_thue === 'Thuê nguyên phòng') {
      const confirm = window.confirm(
        `Bạn có chắc chắn muốn xếp nguyên phòng ${room.name} cho khách hàng này?`
      );

      if (confirm) {
        try {
          // 👇 GỌI API BACKEND ĐỂ XỬ LÝ
          await phongApi.assignWholeRoom(selectedRegistration.id, room.id);

          // 👇 LÀM MỚI DỮ LIỆU ĐỂ UI CẬP NHẬT CHÍNH XÁC
          await queryClient.invalidateQueries({ queryKey: ['khachHangDetail', selectedRegistration.id] });
          await queryClient.invalidateQueries({ queryKey: ['khachHang'] });
          
          alert(`Đã chọn nguyên phòng ${room.name} cho ${selectedRegistration.so_nguoi} người thành công!`);
          
          // Đóng các màn hình phụ
          setShowRoomList(false);
          setShowBedSelection(false);
          
        } catch (error: any) {
          console.error("Lỗi khi xếp phòng:", error);
          alert(error.response?.data?.error || "Đã xảy ra lỗi, vui lòng thử lại!");
        }
      }
    } else {
      setShowBedSelection(true);
    }
  };

  const handleToggleBed = (bed: any) => {
    if (bed.status !== 'Trống') return;

    const existing = selectedBeds.find((b: any) => b.magiuong === bed.magiuong);
    if (existing) {
      setSelectedBeds(selectedBeds.filter((b: any) => b.magiuong !== bed.magiuong));
    } else {
      const totalSelected = (selectedRegistration.assignedRooms?.length || 0) + selectedBeds.length;
      if (totalSelected >= selectedRegistration.so_nguoi) {
        alert('Đã đủ số lượng giường cho khách hàng');
        return;
      }
      setSelectedBeds([...selectedBeds, { id: bed.id, magiuong: bed.magiuong }]);
    }
  };

  const handleConfirmBeds = async () => {
    if (selectedBeds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 giường');
      return;
    }

    const newAssignments = selectedBeds.map((bed: any) => ({
      room: selectedRoom.name,
      magiuong: bed.magiuong
    }));

    try {
      // ✅ Step 1: Chuẩn bị dữ liệu
      const updatedRooms = [...(selectedRegistration.assignedRooms || []), ...newAssignments];
      const payload = {
        assignedRooms: updatedRooms,
        trang_thai: updatedRooms.length >= selectedRegistration.so_nguoi ? 'Đã chọn phòng' : 'Chờ chọn phòng'
      };
      
      // ✅ Step 2: GỌI API CẬP NHẬT KHÁCH HÀNG
      await khachHangApi.update(selectedRegistration.id, payload);

      // ✅ Step 3: GỌI API CẬP NHẬT PHÒNG/GIƯỜNG
      await phongApi.updateAssignedBeds(selectedRegistration.id,selectedRoom.name, updatedRooms);

      // ✅ Step 4: CẬP NHẬT STATE LOCAL
      setRegistrationDataState(prevData =>
        prevData.map(reg => {
          if (reg.id === selectedRegistration.id) {
            const updatedReg = {
              ...reg,
              assignedRooms: updatedRooms,
              trang_thai: payload.trang_thai
            };
            setSelectedRegistration(updatedReg);
            return updatedReg;
          }
          return reg;
        })
      );

      alert(`Đã chọn ${selectedBeds.length} giường trong phòng ${selectedRoom.name}`);

      // ✅ Step 5: ĐÓNG MODAL
      setShowBedSelection(false);
      setShowRoomList(false);
      setSelectedRoom(null);
      setSelectedBeds([]);
    } catch (error) {
      console.error('Lỗi khi xác nhận giường:', error);
      alert('Xác nhận thất bại. Vui lòng thử lại!');
    }
  };

  const handleRemoveAssignment = async (index: number, assignment: any) => {
    // 1. Xác nhận với người dùng
    const confirmMessage = assignment.magiuong 
      ? `Bạn có chắc chắn muốn hủy chọn giường ${assignment.magiuong} tại phòng ${assignment.room}?`
      : `Bạn có chắc chắn muốn hủy chọn phòng ${assignment.room}?`;
      
    if (!window.confirm(confirmMessage)) return;

    try {
      // 2. Gọi API xóa trong DB
      // Nếu là thuê nguyên phòng (không có magiuong), bạn cần logic xóa theo phòng (tùy DB của bạn)
      if (assignment.magiuong) {
        await phongApi.unassignBed(selectedRegistration.id, assignment.magiuong);
      }
       
      await queryClient.invalidateQueries({ queryKey: ['khachHangDetail', selectedRegistration.id] });
      await queryClient.invalidateQueries({ queryKey: ['khachHang'] }); // Làm tươi cả danh sách bên trái

      // 3. Sau khi DB xóa thành công, tiến hành cập nhật State Local (Code cũ của bạn)
      setRegistrationDataState(prevData =>
        prevData.map(reg => {
          if (reg.id === selectedRegistration.id) {
            // Lọc bỏ phần tử tại index đang xóa  
            const updatedRooms = (reg.assignedRooms || []).filter((_: any, i: number) => i !== index);
            
            const updatedReg = {
              ...reg,
              assignedRooms: updatedRooms,
              trang_thai: updatedRooms.length >= reg.so_nguoi ? 'Đã chọn phòng' : 'Chờ chọn phòng'
            };

            // Cập nhật State khách hàng đang được xem chi tiết
            setSelectedRegistration(updatedReg);

            // 4. (Quan trọng) Cập nhật lại trạng thái Phiếu đăng ký trong DB sang "Chờ chọn phòng" 
            // nếu số giường đã chọn < số người đăng ký
            khachHangApi.update(reg.id, { trang_thai: updatedReg.trang_thai });

            return updatedReg;
          }
          return reg;
        })
      );

      alert('Hủy chọn giường thành công!');
    } catch (error) {
      console.error('Lỗi khi hủy giường:', error);
      alert('Không thể hủy giường. Vui lòng thử lại!');
    }
  };

  const getAvailableBeds = (room: any) => {
    return room.beds.filter((bed: any) => bed.status === 'Trống').length;
  };

  const getRemainingBeds = () => {
    if (!selectedRegistration) return 0;
    return selectedRegistration.so_nguoi - (selectedRegistration.assignedRooms?.length || 0);
  };

  const isRoomSufficient = (room: any) => {
    if (selectedRegistration?.loai_thue === 'Thuê nguyên phòng') {
      return room.capacity >= selectedRegistration.so_nguoi;
    }
    return getAvailableBeds(room) > 0;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Chọn phòng/giường</h1>
        <p className="text-slate-600 mt-1">Chọn phòng và giường phù hợp cho khách hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Phiếu đăng ký chờ chọn phòng</h2>
            <div className="space-y-3">
              {registrationDataState.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                     if (selectedId === reg.id) return; 
                    setSelectedId(reg.id); 
                    setSelectedRegistration(reg);
                    setShowRoomList(false);
                    setShowBedSelection(false);
                  }}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    selectedRegistration?.id === reg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {reg.ma_phieu}
                      </span>
                      <p className="font-medium text-slate-900 mt-1">{reg.ho_ten}</p>
                      <p className="text-sm text-slate-600">{reg.khu_vuc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{reg.so_nguoi} người • {reg.loai_thue}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      reg.trang_thai === 'Đã chọn phòng' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {reg.trang_thai}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedRegistration ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <Home className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một phiếu đăng ký để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin phiếu đăng ký</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã phiếu:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.ma_phieu}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.ho_ten}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">CCCD:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.cccd}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số điện thoại:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số người:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.so_nguoi} người</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Giới tính:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.gioi_tinh}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Loại thuê:</span>
                    <p className="font-medium text-blue-600">{selectedRegistration.loai_thue}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Khu vực:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.khu_vuc}</p>
                  </div>
                </div>

               {selectedRegistration?.assignedRooms?.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-green-900">Đã chọn phòng/giường</h3>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="space-y-2">
                    {selectedRegistration.assignedRooms.map((assignment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-sm font-medium text-green-700">
                          {/* Logic nguyên bản của bạn: Có giường thì hiện Phòng/Giường, không thì hiện tên Phòng */}
                          {assignment.magiuong ? `Phòng ${assignment.room} / ${assignment.magiuong}` : `Phòng ${assignment.room}`}
                        </span>
                        
                        <button
                          // Truyền nguyên object assignment vào để hàm xử lý biết là đang xóa giường nào trong DB
                          onClick={() => handleRemoveAssignment(index, assignment)}  
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa lựa chọn này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {(!selectedRegistration.assignedRooms || selectedRegistration.assignedRooms.length === 0) && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        {selectedRegistration.loai_thue === 'Thuê nguyên phòng'
                          ? `Cần chọn 1 phòng có sức chứa tối thiểu ${selectedRegistration.so_nguoi} người`
                          : `Cần chọn ${selectedRegistration.so_nguoi} giường cho ${selectedRegistration.so_nguoi} người`
                        }
                      </p>
                    </div>
                  </div>
                )}
                {selectedRegistration.loai_thue === 'Thuê ở ghép' && getRemainingBeds() > 0 && selectedRegistration.assignedRooms?.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Còn thiếu {getRemainingBeds()} giường cho {selectedRegistration.numPeople} người
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!showRoomList && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Bắt đầu chọn phòng</h3>
                    <p className="text-slate-600 mb-6">
                      {selectedRegistration.loai_thue === 'Thuê nguyên phòng'
                        ? `Hệ thống sẽ hiển thị các phòng có sức chứa đủ ${selectedRegistration.so_nguoi} người`
                        : 'Hệ thống sẽ hiển thị các phòng có giường trống phù hợp'
                      }
                    </p>
                    <button
                      onClick={() => setShowRoomList(true)}
                      disabled={isLoadingPhong}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-400"
                    >
                      {isLoadingPhong ? 'Đang tải...' : 'Xem danh sách phòng phù hợp'}
                    </button>
                  </div>
                </div>
              )}

              {showRoomList && !showBedSelection && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Danh sách phòng phù hợp</h2>
                      {selectedRegistration.loai_thue === 'Thuê nguyên phòng' && (
                        <p className="text-sm text-slate-600 mt-1">
                          Chọn 1 phòng có sức chứa đủ {selectedRegistration.so_nguoi} người
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowRoomList(false)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Quay lại
                    </button>
                  </div>
                  {isLoadingPhong && <p className="text-slate-600">Đang tải danh sách phòng...</p>}
                  {!isLoadingPhong && roomsFormatted.length === 0 && <p className="text-slate-600">Không có phòng phù hợp</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomsFormatted.map((room: any) => (
                        <button
                          key={room.id}
                          onClick={() => handleSelectRoom(room)}
                          className="text-left p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                              <p className="text-sm text-slate-600">{room.type} • Tầng {room.floor}</p>
                            </div>
                            {selectedRegistration.loai_thue === 'Thuê nguyên phòng' ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                Sức chứa: {room.capacity} người
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {getAvailableBeds(room)} giường trống
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                              <MapPin className="w-4 h-4" />
                              {room.area}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Bed className="w-4 h-4" />
                              {selectedRegistration.loai_thue === 'Thuê nguyên phòng'
                                ? `Phòng ${room.capacity} người`
                                : `${room.occupied}/${room.capacity} giường đã sử dụng`
                              }
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Users className="w-4 h-4" />
                              {room.gender}
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              {room.price.toLocaleString()} VNĐ/tháng
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.amenities.map((amenity: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showBedSelection && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Chọn giường - Phòng {selectedRoom.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedRoom.type} - {selectedRoom.area} - Tầng {selectedRoom.floor}</p>
              </div>
              <button
                onClick={() => {
                  setShowBedSelection(false);
                  setSelectedRoom(null);
                  setSelectedBeds([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Giá thuê:</span>
                    <p className="font-medium text-slate-900">{selectedRoom.price.toLocaleString()} VNĐ/tháng</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Sức chứa:</span>
                    <p className="font-medium text-slate-900">{selectedRoom.capacity} người</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Đang sử dụng:</span>
                    <p className="font-medium text-slate-900">{selectedRoom.occupied}/{selectedRoom.capacity} giường</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Đã chọn:</span>
                    <p className="font-medium text-blue-600">{selectedBeds.length} giường</p>
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-slate-900 mb-4">Chọn giường (Tối đa: {getRemainingBeds()} giường)</h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedRoom.beds.map((bed: any) => (
                  <button
                    key={bed.magiuong}
                    onClick={() => handleToggleBed(bed)}
                    disabled={bed.status !== 'Trống'}
                    className={`p-6 border-2 rounded-lg transition-colors ${
                      bed.status === 'Trống'
                        ? selectedBeds.some((b: any) => b.magiuong === bed.magiuong)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <Bed className={`w-12 h-12 ${
                        bed.status === 'Trống'
                          ? selectedBeds.some((b: any) => b.magiuong === bed.magiuong)
                            ? 'text-blue-600'
                            : 'text-green-600'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 text-center mb-2">
                      {bed.magiuong}
                    </h4>
                    <p className="text-xs text-slate-500 text-center mb-2">(Giường {bed.id})</p>
                    <p className={`text-sm text-center ${
                      bed.status === 'Trống' ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {bed.status}
                    </p>
                    {bed.occupant && (
                      <p className="text-xs text-slate-500 text-center mt-1">{bed.occupant}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Đã chọn: <span className="font-medium text-slate-900">{selectedBeds.length}/{getRemainingBeds()}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBedSelection(false);
                    setSelectedRoom(null);
                    setSelectedBeds([]);
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmBeds}
                  disabled={selectedBeds.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Xác nhận ({selectedBeds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
