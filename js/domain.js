/* ============================================================================
 * KSSV Prototype — domain.js
 * Toàn bộ quy tắc nghiệp vụ, mã hoá từ URD v1.1 (luồng + quy tắc) và URD v4
 * (đặc tả trường). Đây cũng chính là "ma trận hiển thị 4 chiều":
 *   vai trò × bước hiện tại × luồng phê duyệt × cờ rủi ro  →  thấy gì / làm gì
 * Sửa file này là sửa hành vi nghiệp vụ của toàn bộ prototype.
 * ==========================================================================*/

/* ---------------------------------------------------------------- VAI TRÒ */
const ROLES = {
  R1:  { ma: 'R1',  ten: 'Tác nghiệp tín dụng',        tat: 'TNTD',            donVi: 'ĐVKD' },
  R2:  { ma: 'R2',  ten: 'Cán bộ bán hàng',            tat: 'CBBH',            donVi: 'ĐVKD' },
  R3:  { ma: 'R3',  ten: 'GĐ/PGĐ phòng KD/DVKH',       tat: 'GĐ/PGĐ phòng',    donVi: 'ĐVKD' },
  R4:  { ma: 'R4',  ten: 'GĐ/PGĐ chi nhánh',           tat: 'GĐ chi nhánh',    donVi: 'ĐVKD' },
  R5:  { ma: 'R5',  ten: 'Trưởng bộ phận KSSV',        tat: 'Trưởng BP KSSV',  donVi: 'HO'   },
  R6:  { ma: 'R6',  ten: 'Cán bộ Phòng KSSV',          tat: 'CB KSSV',         donVi: 'HO'   },
  R7:  { ma: 'R7',  ten: 'Lãnh đạo Phòng KSSV',        tat: 'TL KSSV',         donVi: 'HO'   },
  R8:  { ma: 'R8',  ten: 'Quản trị hệ thống',          tat: 'Admin',           donVi: 'HO',   chiXem: true },
  R10: { ma: 'R10', ten: 'Vai trò xem toàn hệ thống',  tat: 'Viewer HO',       donVi: 'HO',   chiXem: true },
  R11: { ma: 'R11', ten: 'Vai trò xem theo đơn vị',    tat: 'Viewer ĐVKD',     donVi: 'ĐVKD', chiXem: true },
};

/* ------------------------------------------------- BƯỚC XỬ LÝ (ST-01..99) */
/* URD v1.1 — Danh mục trạng thái/bước xử lý. ST-90 đã bị loại khỏi danh mục
 * bước và chuyển thành cờ song song theo AMB-08 / BR-214.                   */
const STEPS = {
  'ST-01':  { stt: 1,  ten: 'Bước TNTD xử lý',                       vaiTro: 'R1' },
  'ST-02':  { stt: 2,  ten: 'Bước CBBH xử lý',                       vaiTro: 'R2' },
  'ST-03':  { stt: 3,  ten: 'Bước GĐ/PGĐ phòng KD/DVKH',             vaiTro: 'R3' },
  'ST-04':  { stt: 4,  ten: 'Bước GĐ/PGĐ chi nhánh',                 vaiTro: 'R4' },
  'ST-05H': { stt: 5,  ten: 'Bước tiếp nhận/phân công KSSV',         vaiTro: 'R5' },
  'ST-06':  { stt: 6,  ten: 'Bước CB KSSV xử lý',                    vaiTro: 'R6' },
  'ST-07':  { stt: 7,  ten: 'Bước kiểm soát Lãnh đạo Phòng KSSV',    vaiTro: 'R7' },
  'ST-08':  { stt: 8,  ten: 'Bước thư ký ghi nhận phương án',        vaiTro: 'R6' },
  'ST-05':  { stt: 9,  ten: 'Bước CBBH thực hiện phương án',         vaiTro: 'R2' },
  'ST-99':  { stt: 10, ten: 'Hoàn thành',                            vaiTro: null, ketThuc: true },
};

/* Chuỗi bước hiển thị trên thanh tiến trình, tuỳ nhánh luồng của hồ sơ. */
function chuoiBuoc(hs) {
  if (hs.luongPD === 'Chi nhánh')
    return ['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-99'];
  return ['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05H', 'ST-06', 'ST-07', 'ST-08', 'ST-05', 'ST-99'];
}

/* --------------------------------------------------------- CỜ RỦI RO */
/* ⚠ ĐÃ ĐẢO NGƯỢC BR-506 theo quyết định nghiệp vụ ngày 23/09/2026.
 * URD bản 1.1 (BR-506) quy định hệ thống TỰ XÁC ĐỊNH cờ rủi ro bằng phép OR
 * của 5 điều kiện (Sai mục đích / Vi phạm điều kiện / HĐKD / TSBĐ có dấu
 * hiệu rủi ro / tài liệu không hợp lệ / CBBH tích ô).
 *
 * Nghiệp vụ đã chốt lại: cờ rủi ro CHỈ phụ thuộc ô tích của CBBH. Các kết
 * quả kiểm tra không còn tự suy ra rủi ro. Hệ quả: hồ sơ có kết quả "Sai
 * mục đích" nhưng CBBH không tích ô thì vẫn được coi là KHÔNG rủi ro và
 * GĐ/PGĐ phòng vẫn phê duyệt kết thúc được.
 *
 * → Điểm này cần cập nhật lại BR-506 trong URD trước khi chuyển sang FSD. */
function tinhCoRuiRo(hs) {
  const lyDo = [];
  if (hs.tichCoRuiRo) {
    lyDo.push('CBBH tích ô "Có rủi ro / dấu hiệu cần lưu ý"'
      + (hs.ykienRuiRo ? ' — ' + hs.ykienRuiRo : ''));
  }
  return { coRuiRo: lyDo.length > 0, lyDo };
}

/* Các kết quả kiểm tra vốn từng tự bật cờ rủi ro theo BR-506 cũ. Nay chỉ
 * dùng để hiển thị ghi chú tham khảo cho CBBH, KHÔNG ảnh hưởng định tuyến. */
function dauHieuTuKetQua(hs) {
  const dh = [];
  (hs.dongLD || []).forEach(d => {
    if (d.ketQua === 'Sai mục đích') dh.push(`Khế ước ${d.maLD}: Sai mục đích`);
  });
  (hs.dieuKien || []).forEach((d, i) => {
    if (d.ketQua === 'Vi phạm') dh.push(`Điều kiện #${i + 1}: Vi phạm`);
  });
  if (hs.hdkd && hs.hdkd.ketQua === 'Có dấu hiệu rủi ro') dh.push('Kiểm tra HĐKD: Có dấu hiệu rủi ro');
  if (hs.tsbd && hs.tsbd.ketQua === 'Có dấu hiệu rủi ro') dh.push('Kiểm tra TSBĐ: Có dấu hiệu rủi ro');
  if (hs.hdkd && hs.hdkd.taiLieu === 'Không hợp lệ') dh.push('Tài liệu HĐKD: Không hợp lệ');
  if (hs.tsbd && hs.tsbd.taiLieu === 'Không hợp lệ') dh.push('Tài liệu TSBĐ: Không hợp lệ');
  return dh;
}

/* --------------------------------------- MA TRẬN CHUYỂN BƯỚC — URD v1.1 */
/* Mỗi phần tử: bước nguồn, nhãn nút, vai trò, điều kiện, bước đích, kiểu.
 * dieuKien(hs) trả về true/false. kieu: 'chinh' | 'phu' | 'tralai'.
 * Đã áp dụng: bỏ "Chuyển KSSV" của R2 (AMB-23), bỏ "Trả lại" của R1
 * (AMB-20), bỏ nút "Đồng ý" thứ hai ở ST-06 (AMB-15), đổi nhãn (AMB-14). */
const TRANSITIONS = [
  { tu: 'ST-01',  nhan: 'Chuyển bước → CBBH',        vaiTro: 'R1', den: 'ST-02',  kieu: 'chinh' },

  { tu: 'ST-02',  nhan: 'Trình phê duyệt',           vaiTro: 'R2', den: 'ST-03',  kieu: 'chinh' },
  { tu: 'ST-02',  nhan: 'Trả về TNTD',               vaiTro: 'R2', den: 'ST-01',  kieu: 'tralai' },

  { tu: 'ST-03',  nhan: 'Phê duyệt kết quả KSSV',    vaiTro: 'R3', den: 'ST-99',  kieu: 'chinh',
    dieuKien: hs => !tinhCoRuiRo(hs).coRuiRo,
    anKhi:    hs =>  tinhCoRuiRo(hs).coRuiRo,          /* BR-301 */
    ghiChu:   'Chỉ dùng được khi hồ sơ không có dấu hiệu rủi ro' },
  { tu: 'ST-03',  nhan: 'Trình cấp PD',              vaiTro: 'R3', den: 'ST-04',  kieu: 'chinh',
    dieuKien: hs => tinhCoRuiRo(hs).coRuiRo },
  { tu: 'ST-03',  nhan: 'Chuyển lại CBBH',           vaiTro: 'R3', den: 'ST-02',  kieu: 'tralai' },

  { tu: 'ST-04',  nhan: 'Đồng ý, chuyển tiếp',       vaiTro: 'R4', den: 'ST-05',  kieu: 'chinh',
    dieuKien: hs => hs.luongPD === 'Chi nhánh',
    voHieuKhi: hs => hs.luongPD === 'Hội sở',          /* BR-302 */
    ghiChu:   'Hồ sơ thuộc luồng phê duyệt Hội sở — phải chuyển Trưởng BP KSSV' },
  { tu: 'ST-04',  nhan: 'Chuyển Trưởng BP KSSV',     vaiTro: 'R4', den: 'ST-05H', kieu: 'chinh',
    dieuKien: hs => hs.luongPD === 'Hội sở' },
  { tu: 'ST-04',  nhan: 'Chuyển lại CBBH',           vaiTro: 'R4', den: 'ST-02',  kieu: 'tralai' },

  { tu: 'ST-05H', nhan: 'Phân công xử lý',           vaiTro: 'R5', den: 'ST-06',  kieu: 'chinh',
    dieuKien: hs => hs.phuongThucXuLy === 'Phân công cho cán bộ' && !!hs.cbKssvPhuTrach,
    anKhi:    hs => hs.phuongThucXuLy === 'Tự xử lý',
    giuKhiThieu: true,
    ghiChu:   'Chọn cán bộ KSSV phụ trách trước khi phân công' },
  { tu: 'ST-05H', nhan: 'Trình duyệt lên Lãnh đạo KSSV', vaiTro: 'R5', den: 'ST-07', kieu: 'chinh',
    dieuKien: hs => hs.phuongThucXuLy === 'Tự xử lý' },
  { tu: 'ST-05H', nhan: 'Chuyển lại CBBH',           vaiTro: 'R5', den: 'ST-02',  kieu: 'tralai' },

  { tu: 'ST-06',  nhan: 'Trình Lãnh đạo KSSV',       vaiTro: 'R6', den: 'ST-07',  kieu: 'chinh',
    moPopup: 'deXuatCapPD' },                          /* BR-326 */
  { tu: 'ST-06',  nhan: 'Chuyển lại CBBH',           vaiTro: 'R6', den: 'ST-02',  kieu: 'tralai' },

  /* OI-05 chốt tạm: Lãnh đạo Phòng KSSV chọn thủ công giữa hai nhánh. */
  { tu: 'ST-07',  nhan: 'Đồng ý (kết thúc nhánh nội bộ)', vaiTro: 'R7', den: 'ST-99', kieu: 'chinh',
    ghiChu: 'Nhánh nội bộ — phương án thuộc thẩm quyền Phòng KSSV' },
  { tu: 'ST-07',  nhan: 'Chuyển thư ký',             vaiTro: 'R7', den: 'ST-08',  kieu: 'chinh',
    ghiChu: 'Nhánh mở rộng — phải trình cấp phê duyệt ngoài hệ thống' },
  { tu: 'ST-07',  nhan: 'Chuyển lại CB KSSV',        vaiTro: 'R7', den: 'ST-06',  kieu: 'tralai' },

  { tu: 'ST-08',  nhan: 'Hoàn tất, chuyển bước',     vaiTro: 'R6', den: 'ST-05',  kieu: 'chinh',
    dieuKien: hs => !!(hs.phuongAnPheDuyet && hs.phuongAnPheDuyet.noiDung),
    giuKhiThieu: true,
    ghiChu:   'Nhập nội dung phương án phê duyệt trước' },                /* BR-328 */

  { tu: 'ST-05',  nhan: 'Ghi nhận thực hiện phương án', vaiTro: 'R2', den: 'ST-99', kieu: 'chinh' },
];

/* --------------------------------------------- BR-329: ba điều kiện hiển thị nút */
/* Nút chỉ hiện khi: (1) đúng vai trò phụ trách bước hiện tại,
 * (2) là người được phân công xử lý hồ sơ, (3) có quyền tương ứng.        */
function laNguoiPhuTrach(hs, user) {
  if (user.vaiTro !== STEPS[hs.buocHienTai]?.vaiTro) return false;
  if (hs.buocHienTai === 'ST-06' || hs.buocHienTai === 'ST-08')
    return !hs.cbKssvPhuTrach || hs.cbKssvPhuTrach === user.id;   /* BR-317 */
  if (hs.buocHienTai === 'ST-02' || hs.buocHienTai === 'ST-05')
    return hs.cbbhPhuTrach === user.id;
  return true;
}

function nutKhaDung(hs, user) {
  if (ROLES[user.vaiTro]?.chiXem) return [];
  if (hs.buocHienTai === 'ST-99') return [];
  if (!laNguoiPhuTrach(hs, user)) return [];
  return TRANSITIONS
    .filter(t => t.tu === hs.buocHienTai && t.vaiTro === user.vaiTro)
    .filter(t => !(t.anKhi && t.anKhi(hs)))                        /* BR-301: ẨN hẳn */
    /* Điều kiện dữ liệu chưa đủ: mặc định ẨN, trừ khi quy tắc yêu cầu giữ lại
     * ở trạng thái vô hiệu kèm chú thích (BR-302, BR-328, panel phân công).  */
    .filter(t => t.giuKhiThieu || t.voHieuKhi || !t.dieuKien || t.dieuKien(hs))
    .map(t => ({
      ...t,
      voHieu: !!((t.voHieuKhi && t.voHieuKhi(hs)) ||               /* VÔ HIỆU kèm lý do */
                 (t.dieuKien && !t.dieuKien(hs))),
    }));
}

/* ------------------------------------------- CHẾ ĐỘ HIỂN THỊ TAB (URD v4) */
/* 'nhap' = nhập liệu | 'xem' = chỉ đọc | 'an' = không thấy tab             */
function cheDoTab(tab, hs, user) {
  const vt = user.vaiTro;
  const buoc = hs.buocHienTai;
  const phuTrach = laNguoiPhuTrach(hs, user) && buoc !== 'ST-99';

  if (ROLES[vt]?.chiXem) return tab === 'hoiSo' && hs.luongPD !== 'Hội sở' ? 'an' : 'xem';

  switch (tab) {
    case 'khachHang':
      if (vt === 'R1' && buoc === 'ST-01' && phuTrach) return 'nhap';
      return 'xem';

    case 'dvkd':
      if (vt === 'R1' && buoc === 'ST-01' && phuTrach) return 'nhap';   /* chế độ nhập điều kiện */
      if (vt === 'R2' && (buoc === 'ST-02' || buoc === 'ST-05') && phuTrach) return 'nhap';
      return 'xem';

    case 'hoiSo':                                                        /* BR-504 */
      if (hs.luongPD !== 'Hội sở') return 'an';
      if (vt === 'R1') return 'an';
      if ((vt === 'R5' || vt === 'R6' || vt === 'R7') && phuTrach) return 'nhap';
      return 'xem';

    case 'taiLieu':
      if (vt === 'R2' && phuTrach) return 'nhap';
      if (vt === 'R6' && phuTrach) return 'nhap';
      return 'xem';

    case 'lichSu':
    case 'luongXuLy':
      return 'xem';
  }
  return 'xem';
}

/* Khối "Phương án khắc phục" — BR-510: chỉ hiện khi hồ sơ có rủi ro.
 * R2 nhập lần đầu; R3..R7 chỉnh sửa theo thẩm quyền (UC-M02-11).         */
function cheDoKhoiKhacPhuc(hs, user) {
  if (!tinhCoRuiRo(hs).coRuiRo) return 'an';
  if (ROLES[user.vaiTro]?.chiXem) return 'xem';
  if (!laNguoiPhuTrach(hs, user) || hs.buocHienTai === 'ST-99') return 'xem';
  return ['R2', 'R3', 'R4', 'R5', 'R6', 'R7'].includes(user.vaiTro) ? 'nhap' : 'xem';
}

/* ------------------------------------------------ PHẠM VI DỮ LIỆU — BR-102 */
function trongPhamVi(hs, user) {
  switch (user.vaiTro) {
    case 'R1':
    case 'R2':  return hs.maPhong === user.maPhong;
    case 'R3':  return hs.maPhong === user.maPhong;
    case 'R4':
    case 'R11': return hs.maChiNhanh === user.maChiNhanh;
    default:    return true;                       /* R5, R6, R7, R10 toàn hệ thống */
  }
}

/* -------------------------------------------- HẠN KIỂM TRA — BR-202/203 */
/* Hạn tính ở MỨC DÒNG. Hạn cấp hồ sơ = dòng có hạn sớm nhất chưa xong.   */
const THAM_SO = { hanLD: 30, hanBaoLanh: 90, nguongSapDenHan: 30 };

function hanCuaDong(dong) {
  const soNgay = dong.loai === 'Bảo lãnh/LC' ? THAM_SO.hanBaoLanh : THAM_SO.hanLD;
  return themNgay(dong.ngayNhanNo, soNgay);
}

function hanGanNhat(hs) {
  const chuaXong = (hs.dongLD || []).filter(d => !d.ngayThucHienKT);
  if (!chuaXong.length) return null;
  return chuaXong.map(hanCuaDong).sort()[0];
}

function tinhTinhTrang(hs, homNay) {
  if (hs.khongPhaiKiemTra) return 'Không phải kiểm tra';     /* BR-206 */
  if (hs.buocHienTai === 'ST-99') return 'Hoàn thành';
  const han = hanGanNhat(hs);
  if (!han) return 'Chưa đến hạn';
  const conLai = soNgayGiua(homNay, han);
  if (conLai < 0) return 'Quá hạn';
  if (conLai < THAM_SO.nguongSapDenHan) return 'Sắp đến hạn';
  return 'Chưa đến hạn';
}

/* ---------------------------------------------------- TIỆN ÍCH NGÀY THÁNG */
/* BR-204: ngày dương lịch liên tục, KHÔNG trừ ngày nghỉ/lễ.              */
function themNgay(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function soNgayGiua(tu, den) {
  return Math.round((new Date(den + 'T00:00:00') - new Date(tu + 'T00:00:00')) / 86400000);
}
function dinhDangNgay(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function nhanHanTuongDoi(hs, homNay) {
  const han = hanGanNhat(hs);
  if (!han) return hs.buocHienTai === 'ST-99' ? 'Đã kiểm tra' : '—';
  const n = soNgayGiua(homNay, han);
  if (n < 0) return `Quá hạn ${Math.abs(n)} ngày`;
  if (n === 0) return 'Đến hạn hôm nay';
  return `Còn ${n} ngày`;
}

/* --------------------------------------------- DANH MỤC GIÁ TRỊ (BR-508/522) */
const DANH_MUC = {
  ketQuaSDV:      ['Đúng mục đích', 'Sai mục đích', 'Chưa tới kỳ', 'Không kiểm tra'],
  ketQuaDieuKien: ['Tuân thủ', 'Vi phạm', 'Không quy định', 'Chưa đến kỳ'],
  ketQuaHDKD:     ['Bình thường', 'Có dấu hiệu rủi ro', 'Chưa đến kỳ', 'Không kiểm tra'],
  taiLieuHopLe:   ['Hợp lệ', 'Không hợp lệ'],
  /* Danh mục "Đánh giá rủi ro / Không rủi ro" ở từng khối đã được bỏ khỏi
   * giao diện theo yêu cầu nghiệp vụ 23/09/2026; thay bằng một ô tích duy
   * nhất ở bước CBBH kèm ý kiến bắt buộc — xem khoiTichRuiRo().           */
  trangThaiPA:    ['Đang trình', 'Đã được duyệt, đang thực hiện', 'Đã khắc phục xong'],
  trangThaiCheTai:['Đang áp dụng', 'Hủy bỏ chế tài'],
  tinhTrangKP:    ['Toàn bộ', '1 phần', 'Chưa'],
  loaiTaiLieu:    ['Biên bản kiểm tra sau vay', 'Bảng theo dõi tiến độ thi công dự án',
                   'Bảng theo dõi tiến độ thu mua', 'Bảng theo dõi tiến độ khai thác dự án',
                   'Báo cáo quản lý khách hàng sau vay', 'Báo cáo sử dụng vốn sau giải ngân',
                   'Quyết định/Nghị quyết phê duyệt', 'Hồ sơ khác'],
  capPDMoRong:    { 'Cấp Lãnh đạo điều hành': ['Giám đốc Khối', 'Phó Giám đốc Khối', 'Phó Tổng Giám đốc', 'Tổng Giám đốc'],
                    'Cấp Hội đồng':           ['Hội đồng tín dụng', 'Hội đồng rủi ro', 'Hội đồng quản trị'] },
};

/* Bảng ánh xạ giá trị nhập liệu → giá trị trên báo cáo (BR-522). */
const ANH_XA_BAO_CAO = {
  ketQuaDieuKien: { 'Tuân thủ': 'Tuân thủ', 'Vi phạm': 'Vi phạm',
                    'Không quy định': 'Không quy định', 'Chưa đến kỳ': '' },
  ketQuaSDV:      { 'Đúng mục đích': 'Đúng', 'Sai mục đích': 'Sai mục đích',
                    'Chưa tới kỳ': 'Chưa tới kỳ', 'Không kiểm tra': 'Không kiểm tra' },
};

/* ------------------------------------------------ MENU THANH BÊN (NFR-01) */
/* Cấu trúc menu theo cột "Nhóm menu" của Danh mục màn hình trong URD.
 * vaiTro = danh sách vai trò được thấy mục này, lấy theo Ma trận vai trò —
 * màn hình; với nhóm Tra cứu lấy theo bảng chi tiết từng màn hình (AMB-21).
 * daDung = đã dựng trong bản mô phỏng; còn lại hiển thị mờ để nghiệp vụ rà
 * soát sơ đồ điều hướng tổng thể.                                          */
const MENU = [
  { nhom: null, items: [
    { ma: 'M-01', ten: 'Danh sách hồ sơ',      vaiTro: ['R1','R2','R3','R4','R5','R6','R7','R8','R10','R11'], daDung: true },
    { ma: 'MY',   ten: 'Hồ sơ của tôi',        vaiTro: ['R1','R2','R3','R4','R5','R6','R7'],                   daDung: true, dem: true },
    { ma: 'M-02', ten: 'Xử lý hồ sơ',          vaiTro: ['R1','R2','R3','R4','R5','R6','R7','R10','R11'],       daDung: true },
    { ma: 'M-16', ten: 'Quản lý giao dịch',    vaiTro: ['R6','R7','R8','R10'],
      moTa: 'Đối soát dữ liệu giao dịch nhận từ LOS/Core, xử lý lại giao dịch lỗi' },
  ]},
  { nhom: 'Báo cáo', items: [
    { ma: 'M-03', ten: 'Báo cáo tổng hợp KSSV', vaiTro: ['R2','R3','R4','R5','R6','R7','R8','R10','R11'], daDung: true },
    { ma: 'M-08', ten: 'Báo cáo hồ sơ quá hạn', vaiTro: ['R3','R4','R5','R6','R7','R8','R10','R11'],
      moTa: 'Theo dõi và đôn đốc hồ sơ quá hạn kiểm tra, quá hạn khắc phục' },
    { ma: 'M-09', ten: 'Báo cáo theo chi nhánh', vaiTro: ['R4','R5','R6','R7','R8','R10'],
      moTa: 'Chỉ tiêu KSSV theo từng chi nhánh phục vụ đánh giá chất lượng' },
  ]},
  { nhom: 'Tra cứu', items: [
    { ma: 'M-05', ten: 'Tra cứu hồ sơ',         vaiTro: ['R1','R2','R3','R4','R5','R6','R7','R8','R10','R11'],
      moTa: 'Tra cứu theo nhiều tiêu chí kết hợp, gồm cả hồ sơ đã hoàn thành' },
    { ma: 'M-06', ten: 'Tra cứu khách hàng',    vaiTro: ['R2','R3','R4','R5','R6','R7','R10','R11'],
      moTa: 'Toàn bộ lịch sử kiểm soát sau vay của một khách hàng theo CIF' },
    { ma: 'M-07', ten: 'Tra cứu lịch sử xử lý', vaiTro: ['R3','R4','R5','R6','R7','R8','R10'],
      moTa: 'Nhật ký xử lý theo người dùng, theo bước, theo khoảng thời gian' },
  ]},
  { nhom: 'Quản trị hệ thống', items: [
    { ma: 'M-04', ten: 'Phân quyền hệ thống',   vaiTro: ['R8','R10'],
      moTa: 'Cấu hình quyền theo chức năng kết hợp phạm vi dữ liệu (BR-101)' },
    { ma: 'M-11', ten: 'Quản lý người dùng',    vaiTro: ['R8','R10'],
      moTa: 'Tài khoản, gán vai trò, phạm vi đơn vị, trạng thái tài khoản' },
    { ma: 'M-12', ten: 'Cấu hình luồng xử lý',  vaiTro: ['R7','R8','R10'],
      moTa: 'Chỉ hiển thị cấu hình đang hiệu lực, không sửa trên giao diện (BR-551)' },
    { ma: 'M-13', ten: 'Nhật ký hệ thống',      vaiTro: ['R8','R10'],
      moTa: 'Truy vết thao tác phục vụ kiểm toán nội bộ và xử lý sự cố' },
    { ma: 'M-19', ten: 'Cấu hình thông báo',    vaiTro: ['R7','R8','R10'],
      moTa: 'Mốc nhắc hạn, ngưỡng leo thang, kênh gửi, mẫu nội dung' },
  ]},
  { nhom: 'Tham số hệ thống', items: [
    { ma: 'M-14', ten: 'Danh mục loại tài liệu', vaiTro: ['R6','R7','R8','R10'],
      moTa: 'Loại tài liệu đính kèm, số tệp tối đa theo từng loại (BR-507)' },
    { ma: 'M-15', ten: 'Danh mục sản phẩm vay',  vaiTro: ['R6','R7','R8','R10'],
      moTa: 'Danh mục dùng chung, đồng bộ từ LOS/Core (BR-570)' },
  ]},
];

/* Menu đã lọc theo vai trò; bỏ nhóm không còn mục nào. */
function menuTheoVaiTro(vaiTro) {
  return MENU
    .map(g => ({ nhom: g.nhom, items: g.items.filter(i => i.vaiTro.includes(vaiTro)) }))
    .filter(g => g.items.length);
}

const LOAI_HO_SO = {
  L1: 'Kiểm tra tuân thủ điều kiện PD/sản phẩm',
  L2: 'Kiểm tra định kỳ',
  L3: 'Kiểm tra mục đích sử dụng vốn',
  L4: 'Kiểm tra sau bảo lãnh/LC',
};
