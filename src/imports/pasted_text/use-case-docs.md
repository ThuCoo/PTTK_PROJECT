Đặc tả hệ thống:

Tên Use Case
Rà soát điều kiện và tình trạng
Actor
Nhân viên sale
Tiền điều kiện
Người dùng đã chọn phòng thành công.
Hậu điều kiện
Rà soát điều kiện và tình trạng thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_DKPhong với danh sách phòng đã chọn.
Người dùng lựa chọn phòng muốn thuê.
Hệ thống đối chiếu thông tin của khách thuê với điều kiện lưu trú.
Hệ thống gửi yêu cầu kiểm tra tình trạng phòng. (UC kiểm tra tình trạng phòng)
Hệ thống ghi nhận thông tin phòng đang đăng ký.
Kết thúc UC
Luồng sự kiện phụ và ngoại lệ
A3: Nếu thông tin không hợp lệ, hệ thống thông báo lỗi và kết thúc UC.
A4: Nếu phòng không khả dụng, hệ thống thông báo lỗi và quay lại bước 2.
A5: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và kết thúc UC.


Tên Use Case
Kiểm tra tình trạng phòng
Actor
Quản lý
Tiền điều kiện
Người dùng đã nhận yêu cầu kiểm tra tình trạng phòng.
Hậu điều kiện
Kiểm tra tình trạng phòng thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_KTPhong với danh sách phòng được yêu cầu kiểm tra.
Người dùng lựa chọn phòng cần kiểm tra.
Người dùng nhập tình trạng phòng.
Hệ thống ghi nhận tình trạng phòng.
Kết thúc UC
Luồng sự kiện phụ và ngoại lệ
A4: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và kết thúc UC.


Tên Use Case
Xác nhận thỏa thuận thuê
Actor
Nhân viên sale
Tiền điều kiện
Người dùng đã xác nhận điều kiện và tình trạng thuê.
Hậu điều kiện
Xác nhận thỏa thuận thuê thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_THOATHUAN với điều kiện thuê và nội quy ký túc xá.
Người dùng xác nhận điều kiện thuê và nội quy ký túc xá.
Hệ thống hiển thị màn hình MH_DATCOC với thông tin đặt cọc.
Người dùng xác nhận thông tin.
Hệ thống ghi nhận thông tin đặt cọc.
Kết thúc UC.
Luồng sự kiện phụ và ngoại lệ
A2: Nếu người dùng không xác nhận điều kiện thuê và nội quy ký túc xá, hệ thống thông báo lỗi và kết thúc UC.
A4: Nếu người dùng cần thay đổi thông tin, thực hiện bước 5 rồi quay lại UC “//”.
A5: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và kết thúc UC.


Tên Use Case
Lập yêu cầu thanh toán cọc
Actor
Nhân viên sale
Tiền điều kiện
Người dùng đã xác nhận thông tin đặt cọc thành công.
Hậu điều kiện
Lập yêu cầu thanh toán cọc thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_HOADONCOC.
Người dùng tính toán và hiện số tiền cọc
Hệ thống ghi nhận số tiền cọc.
Hệ thống lập và hiển thị hóa đơn cọc.
Hệ thống ghi nhận hóa đơn cọc.
Kết thúc UC.
Luồng sự kiện phụ và ngoại lệ
A3: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và kết thúc UC.
A5: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và kết thúc UC.


Tên Use Case
Thanh toán cọc
Actor
Khách hàng, Nhân viên sale
Tiền điều kiện
Hệ thống lập hóa đơn cọc thành công.
Hậu điều kiện
Thanh toán cọc thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_THANHTOANCOC.
Người dùng chọn phương thức thanh toán.
Hệ thống hướng dẫn thông tin cần thiết để thực hiện thanh toán.
Người dùng thực hiện thanh toán.
Người dùng gửi chứng từ/ hình ảnh giao dịch.
Hệ thống ghi nhận thanh toán đang xử lý.
Hệ thống gửi yêu cầu kiểm tra chứng từ/ hình ảnh giao dịch.
Hệ thống cập nhật trạng thái phòng/giường.
Kết thúc UC.
Luồng sự kiện phụ và ngoại lệ
A4: Nếu sau 24 giờ người dùng chưa thanh toán, hệ thống thông báo “Quá hạn thanh toán.” và kết thúc UC.
A6: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống”, thực hiện hoàn tiền và kết thúc UC.
A8: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống” và quay lại bước 7.


Tên Use Case
Kiểm tra thanh toán cọc
Actor
Quản lý
Tiền điều kiện
Người dùng nhận yêu cầu kiểm tra thanh toán cọc.
Hậu điều kiện
Kiểm tra thanh toán cọc thành công.
Luồng sự kiện chính
Hệ thống hiển thị màn hình MH_KTTHANHTOANCOC.
Người dùng chọn thanh toán cần kiểm tra.
Người dùng đối chiếu chứng từ/ hình ảnh giao dịch và nhập tình trạng đã cọc.
Hệ thống ghi nhận tình trạng đã cọc.
Kết thúc UC.
Luồng sự kiện phụ và ngoại lệ
A3: Nếu chứng từ/ hình ảnh giao dịch không hợp lệ, ghi nhận tình trạng không hợp lệ ở bước 4.
A4: Nếu hệ thống không ghi nhận được thông tin, hệ thống thông báo “Lỗi hệ thống”, thực hiện hoàn tiền và kết thúc UC.




Tên Use Case
Rà soát và thỏa thuận thuê
Mô tả
Use case giúp đánh giá tính hợp lệ của khách hàng và xác nhận tình trạng phòng trước khi cho phép đặt cọc.
Use case bắt đầu khi khách hàng đã xem phòng và thông báo muốn thuê.
Dòng cơ bản
Nhân viên sale rà soát toàn bộ thông tin của khách thuê để đối chiếu với các điều kiện lưu trú.
Nhân viên sale liên hệ với quản lý để kiểm tra tình trạng phòng.
Quản lý phản hồi phòng/giường vẫn còn trống và khả dụng.
Xác nhận đồng ý tuân thủ các điều kiện thuê và nội quy ký túc xá của khách hàng
Nhân viên sale thông báo cho khách hàng kiểm tra thông tin thuê để tiến hành đặt cọc.
Nhân viên sale xác nhận thông tin đặt cọc.
Dòng thay thế
A1. Khách hàng không đủ điều kiện: Tại bước 1, nếu khách không đáp ứng quy định lưu trú, Nhân viên sale từ chối phục vụ. Use case kết thúc.
A3. Phòng đã bị giữ: Tại bước 3, Quản lý báo phòng đã được khách khác cọc/giữ chỗ. Nhân viên sale lên lịch xem phòng khác & thông báo cho khách hàng (quay lại trong nghiệp vụ “Tư vấn xem phòng) 
A4. Khách không đồng ý tuân thủ nội quy: Tại bước 4, nếu khách không đồng ý tuân thủ các điều kiện thuê và nội quy ký túc xá, Nhân viên sale từ chối phục vụ. Use case kết thúc.
A5. Khách đổi thông tin: Tại bước 5, nếu khách thay đổi thông tin so với ban đầu, nhân viên sale cập nhật thông tin đăng ký hợp lệ của khách (quay lại trong nghiệp vụ “Thu thập thông tin”).



Tên Use Case
Xử lí thanh toán cọc
Mô tả
Use case bao gồm thực hiện các nghiệp vụ tính toán tiền cọc, thu tiền, đối chiếu chứng từ và ghi nhận trạng thái đã cọc.
Use case bắt đầu khi khách hàng đã đồng ý nội quy và thông tin thuê đã được chốt (Hoàn thành nghiệp vụ Rà soát và thỏa thuận thuê)
Dòng cơ bản
Nhân viên sale chuyển thông tin xác nhận thuê của khách hàng sang bộ phận kế toán.
Nhân viên kế toán tính toán số tiền cọc dựa trên công thức (Tiền thuê 2 tháng × Số giường thuê).
Nhân viên kế toán lập hoá đơn cọc.
Nhân viên sale thông báo rõ ràng mức tiền cọc tương ứng với lựa chọn thuê của khách hàng.
Nhân viên sale hướng dẫn đầy đủ các thông tin cần thiết để khách thực hiện thanh toán.
Khách hàng thực hiện thanh toán (tiền mặt/chuyển khoản) và gửi chứng từ/hình ảnh giao dịch.
Chứng từ giao dịch được chuyển cho Quản lý. Quản lý đối chiếu và xác nhận khoản tiền cọc hợp lệ.
Nhân viên sale thông báo việc đặt cọc đã hoàn tất cho khách hàng và thống nhất thời gian nhận phòng.
Thông tin cọc (khách cọc, phòng, thời điểm, chi nhánh) được ghi nhận thành công lên hoá đơn cọc trên hệ thống. Phòng/giường chuyển sang trạng thái "Đã cọc".
Kết thúc Use case.
Dòng thay thế
A6. Quá hạn thanh toán 24h: Tại bước 6, nếu sau 24 giờ kể từ lúc xuất yêu cầu (bước 4) mà khách hàng chưa hoàn tất thanh toán, yêu cầu đặt cọc sẽ tự động bị hủy. Use case kết thúc.
A7. Giao dịch không hợp lệ: Tại bước 7, nếu Quản lý đối chiếu thấy chứng từ không hợp lệ (giả mạo, chuyển thiếu tiền hoặc chưa nhận được tiền…), Quản lý báo lại Nhân viên Sale để thông báo lại cho khách hàng và yêu cầu khách hàng kiểm tra và thanh toán lại (Quay lại bước 5).


