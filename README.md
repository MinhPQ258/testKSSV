# KSSV — Bản mô phỏng giao diện (front-end prototype)

Mục đích: để đơn vị nghiệp vụ **bấm thử luồng xử lý và trải nghiệm giao diện** trước khi phát triển thật. Không có backend, không có database — mọi dữ liệu là dữ liệu giả sinh tại chỗ, lưu trong trình duyệt.

---

## Cách chạy

> **Không có bước build.** Không cần `npm install`, không có `package.json`, không phụ thuộc thư viện hay CDN nào. Clone về là chạy được ngay.

```bash
git clone https://github.com/MinhPQ258/testKSSV.git
cd testKSSV
```

**Cách 1 — mở thẳng bằng trình duyệt (nhanh nhất):**
double-click `index.html`, hoặc chuột phải → Open with → Chrome/Edge.

> Lưu ý: khi mở bằng `file://`, một số trình duyệt (Chrome) chặn `localStorage` với file cục bộ. Giao diện và luồng vẫn chạy bình thường, nhưng **dữ liệu không lưu được qua lần tải lại trang** — mỗi lần F5 là về dữ liệu mẫu ban đầu. Muốn giữ trạng thái giữa các phiên thì dùng Cách 2.

**Cách 2 — qua máy chủ tĩnh (khuyến nghị, cần Node):**

```bash
node serve.js
```

rồi mở http://localhost:5321 — đây là cách đã được kiểm chứng, `localStorage` hoạt động đầy đủ.

`serve.js` chỉ dùng module có sẵn của Node (`http`, `fs`, `path`), không cài thêm gì.

---

## Phạm vi đã dựng

| Màn hình | Trạng thái |
|---|---|
| Thanh tiêu đề + **thanh bên** (NFR-01) | ✅ 5 nhóm menu, ẩn/hiện theo vai trò |
| Menu **M-02 Xử lý hồ sơ** | ✅ thường trực; hiện mã hồ sơ đang mở; chưa chọn hồ sơ thì hiện danh sách hồ sơ đang chờ mình |
| Đăng nhập giả (chọn tài khoản) | ✅ 13 tài khoản phủ 10 vai trò |
| M-01 Danh sách hồ sơ | ✅ 4 thẻ chỉ số, 2 tab, gom nhóm, tìm kiếm, phân trang, panel chi tiết |
| M-02 Xử lý hồ sơ | ✅ 6 tab, 2 sub-tab, thanh tiến trình, thanh thao tác theo ngữ cảnh |
| M-03 Báo cáo tổng hợp | ✅ 2 biểu mẫu, có áp bảng ánh xạ BR-522 |
| Trung tâm thông báo | ✅ rút gọn (chuông + danh sách) |
| Công cụ thử nghiệm | ✅ tua ngày, đặt lại dữ liệu |

**Chưa dựng (ngoài phạm vi vòng 1):** M-04 Phân quyền, các màn hình tra cứu (M-05→M-07), báo cáo quản trị (M-08, M-09), quản trị hệ thống (M-11→M-13, M-19), tham số (M-14, M-15) và M-16 Quản lý giao dịch — đều thuộc "Định hướng mở rộng giai đoạn tiếp theo".

Các màn hình này **vẫn hiển thị trên thanh bên** (gắn nhãn `SAU`, chữ mờ) và mở ra một trang giải thích, để đơn vị nghiệp vụ rà soát được **sơ đồ điều hướng tổng thể** và xác nhận vai trò nào thấy nhóm menu nào — một điểm URD chưa đặc tả.

### Menu theo vai trò

Thanh bên lọc theo Ma trận vai trò — màn hình của URD (nhóm Tra cứu lấy theo bảng chi tiết từng màn hình):

| Vai trò | Nhóm menu nhìn thấy |
|---|---|
| R1 TNTD | gốc · Tra cứu |
| R2 CBBH | gốc · Báo cáo · Tra cứu |
| R3, R4, R5 | gốc · Báo cáo · Tra cứu |
| R6 CB KSSV | gốc · Báo cáo · Tra cứu · Tham số hệ thống |
| R7 TL KSSV | gốc · Báo cáo · Tra cứu · Quản trị hệ thống · Tham số hệ thống |
| R8 Admin | toàn bộ, trừ "Hồ sơ của tôi" (không tham gia luồng xử lý) |
| R10 Viewer HO | toàn bộ ở chế độ chỉ xem |
| R11 Viewer ĐVKD | gốc · Báo cáo · Tra cứu, phạm vi dữ liệu theo chi nhánh |

Mục **★ Hồ sơ của tôi** có huy hiệu đếm số hồ sơ đang chờ chính người dùng xử lý — lọc theo đúng ba điều kiện của BR-329 (UC-M01-13).

---

## Cách test luồng

Đăng nhập lần lượt theo đúng thứ tự vai trò để đẩy một hồ sơ đi hết luồng:

**Nhánh A — không có rủi ro (kết thúc sớm)**
1. `Nguyễn Văn An` (TNTD) → mở hồ sơ ở bước 1 → nhập mục đích, điều kiện → **Chuyển bước → CBBH**
2. `Trần Thị Bình` (CBBH) → nhập kết quả kiểm tra **Đúng mục đích** cho mọi khế ước → **Trình phê duyệt**
3. `Lê Minh Cường` (GĐ/PGĐ phòng) → **Phê duyệt kết quả KSSV** → hồ sơ Hoàn thành, hệ thống tự sinh kỳ kiểm tra tiếp theo

**Nhánh B — có rủi ro, thẩm quyền chi nhánh**
Ở bước 2 chọn **Sai mục đích** cho ít nhất một khế ước → hệ thống tự bật cờ rủi ro →
GĐ/PGĐ phòng **không còn nút phê duyệt kết thúc**, chỉ còn *Trình cấp PD* →
`Phạm Thu Dung` (GĐ/PGĐ chi nhánh) **Đồng ý, chuyển tiếp** → CBBH thực hiện phương án.

**Nhánh C — có rủi ro, luồng Hội sở**
Chọn hồ sơ có nhãn `Hội sở`. Ở bước GĐ/PGĐ chi nhánh, nút *Đồng ý* **bị vô hiệu hóa kèm lý do** →
*Chuyển Trưởng BP KSSV* → `Hoàng Văn Em` phân công cán bộ (hoặc tự xử lý) →
`Vũ Thị Giang` (CB KSSV) cho ý kiến → **Trình Lãnh đạo KSSV** (mở popup chọn cấp phê duyệt mở rộng) →
`Bùi Thị Khanh` (Lãnh đạo KSSV) chọn **Đồng ý** (kết thúc nội bộ) hoặc **Chuyển thư ký** (đi tiếp ra ngoài hệ thống).

**Thử nhắc hạn / quá hạn:** dùng nút `+ 7 ngày`, `+ 30 ngày` ở thanh công cụ dưới cùng để tua ngày hệ thống.

---

## Các quy tắc nghiệp vụ đã cài đặt

Toàn bộ nằm trong `js/domain.js` — sửa file đó là sửa hành vi nghiệp vụ.

| Quy tắc | Cài đặt |
|---|---|
| ⚠ Cờ rủi ro | **ĐÃ ĐẢO NGƯỢC BR-506** theo chốt nghiệp vụ 23/09/2026: cờ rủi ro **chỉ phụ thuộc ô tích của CBBH**. Các kết quả kiểm tra (Sai mục đích, Vi phạm, HĐKD/TSBĐ rủi ro) **không còn tự suy ra** rủi ro. Cần cập nhật lại BR-506 trong URD trước khi làm FSD |
| Ô tích rủi ro | Một ô tích duy nhất ở bước CBBH thay cho các trường "Đánh giá rủi ro/không rủi ro" rải rác. Mặc định **không tích**; tích thì **bắt buộc nhập ý kiến**, chặn chuyển bước nếu để trống |
| Bước TNTD | Sửa được: Mục đích vay, Mục đích giải ngân theo từng LD, Nội dung điều kiện, Thời gian yêu cầu kiểm tra, Chế tài, Tần suất kiểm tra |
| BR-201 | Luồng phê duyệt chỉ đọc, kế thừa từ CAR — không sửa được |
| BR-301 | Hồ sơ có rủi ro → **ẩn hẳn** nút phê duyệt kết thúc ở GĐ/PGĐ phòng |
| BR-302 | Hồ sơ luồng Hội sở → **vô hiệu hóa** nút Đồng ý ở GĐ/PGĐ chi nhánh, kèm chú thích lý do |
| BR-329 | Nút chỉ hiện khi thỏa cả ba: đúng vai trò × đúng người phụ trách × đúng bước |
| BR-317 | CB KSSV không được phân công thì không thấy nút nào |
| BR-202 | Hạn kiểm tra tính ở **mức dòng** theo từng LD (+30 ngày) / bảo lãnh (+90 ngày) |
| BR-203 | Tình trạng hồ sơ lấy theo dòng có hạn sớm nhất chưa hoàn thành |
| BR-204 | Ngày dương lịch liên tục, không trừ ngày nghỉ/lễ |
| BR-205 | Sinh kỳ kiểm tra tiếp theo khi hoàn thành, **không phụ thuộc** tình trạng khắc phục |
| BR-214 | Khắc phục là **cờ chạy song song**, không phải một bước của luồng |
| BR-206 | Khoản vay tất toán → trạng thái *Không phải kiểm tra*, loại khỏi chỉ tiêu |
| BR-307/308 | Trả lại bắt buộc lý do ≥ 20 ký tự; dữ liệu các bước sau giữ nguyên |
| BR-320/513 | Chặn chuyển bước khi thiếu kết quả kiểm tra hoặc danh sách tài liệu trống |
| BR-328 | Nút kết thúc ở bước thư ký vô hiệu cho tới khi nhập nội dung phương án |
| BR-330 | Một tài khoản một vai trò — **không có bộ chọn vai trò** trong giao diện (NFR-07) |
| BR-102 | Phạm vi dữ liệu: R1–R3 theo phòng, R4/R11 theo chi nhánh, R5–R7/R10 toàn hệ thống |
| BR-508/522 | Danh mục 4 giá trị khi nhập; ánh xạ "Chưa đến kỳ" → ô trống trên báo cáo |
| OI-05 | Lãnh đạo Phòng KSSV **chọn tay** nhánh nội bộ hay nhánh mở rộng tại ST-07 |

---

## Điểm khác biệt có chủ ý so với bản thật

| Trong prototype | Lý do |
|---|---|
| Màn hình đăng nhập chọn tài khoản | Thay cho bộ chọn vai trò mà NFR-07 cấm. Đây là công cụ test, bản thật dùng SSO/AD |
| Thanh "Công cụ thử nghiệm" (tua ngày, đặt lại) | Không có job chạy nền trong prototype; cần tua ngày để thử nhắc hạn và quá hạn |
| Nút Xuất Excel / In PDF chỉ hiện thông báo | Kết xuất thật thuộc phần backend |
| Tải tài liệu là mô phỏng, không có tệp thật | Lưu trữ tệp là quyết định kiến trúc chưa chốt (IF-07) |
| Dữ liệu lưu trong trình duyệt (localStorage) | Không có database. Bấm *Đặt lại dữ liệu* để về trạng thái ban đầu |

---

## Cấu trúc mã nguồn

```
testKSSV/
├── index.html          vỏ trang
├── serve.js            máy chủ tĩnh tùy chọn (node serve.js)
├── css/style.css       toàn bộ giao diện
└── js/
    ├── domain.js       ★ vai trò, bước, ma trận chuyển bước, quy tắc nghiệp vụ
    ├── mock.js         sinh dữ liệu giả phủ ma trận kịch bản
    ├── store.js        trạng thái + localStorage + hành động chuyển bước
    ├── screens.js      M-01, M-02, M-03
    └── app.js          vỏ, đăng nhập, thanh công cụ, điều hướng
```

Muốn sửa hành vi nghiệp vụ (thêm bước, đổi điều kiện hiện nút, đổi quy tắc tính hạn) thì sửa `js/domain.js` — không cần đụng vào các file khác.

`domain.js` chính là **ma trận hiển thị 4 chiều** (vai trò × bước × luồng PD × cờ rủi ro) ở dạng chạy được — dùng làm đầu vào cho FSD thay vì phải viết tay một bảng riêng.

---

## Đã kiểm chứng

Các kịch bản sau đã chạy và cho kết quả đúng:

- TNTD ở bước đầu không có nút trả lại
- Hồ sơ có rủi ro: nút phê duyệt kết thúc bị ẩn ở GĐ/PGĐ phòng
- Hồ sơ luồng Hội sở: nút Đồng ý của GĐ/PGĐ chi nhánh bị vô hiệu kèm lý do
- CB KSSV không được phân công: không thấy nút nào
- Bước CB KSSV chỉ còn đúng một nút trình
- Lãnh đạo KSSV thấy cả hai nhánh (nội bộ / mở rộng)
- Phê duyệt kết thúc → sinh kỳ kiểm tra tiếp theo, bước ST-01
- Duyệt phương án → bật cờ khắc phục, hồ sơ vẫn kết thúc luồng chính
- Trả lại → giữ nguyên dữ liệu, lưu lý do vào lịch sử
- Tua ngày → tình trạng hạn đổi đúng
- Phạm vi dữ liệu theo vai trò: phòng / chi nhánh / toàn hệ thống
- Vai trò chỉ xem: không có thao tác nào
