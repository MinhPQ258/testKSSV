/* ============================================================================
 * KSSV Prototype — mock.js
 * Sinh dữ liệu giả phủ ma trận: loại hồ sơ × luồng PD × bước × tình trạng hạn
 * × có/không rủi ro × có/không khắc phục. Mã số theo Phụ lục F của URD.
 * ==========================================================================*/

const DON_VI = [
  { maChiNhanh: 'VN0010031', tenChiNhanh: 'CN Hà Nội',      maPhong: 'VN0010040', tenPhong: 'PGD Hoàn Kiếm' },
  { maChiNhanh: 'VN0010031', tenChiNhanh: 'CN Hà Nội',      maPhong: 'VN0010041', tenPhong: 'PGD Cầu Giấy' },
  { maChiNhanh: 'VN0020015', tenChiNhanh: 'CN Hồ Chí Minh', maPhong: 'VN0020020', tenPhong: 'PGD Quận 1' },
  { maChiNhanh: 'VN0020015', tenChiNhanh: 'CN Hồ Chí Minh', maPhong: 'VN0020021', tenPhong: 'PGD Thủ Đức' },
  { maChiNhanh: 'VN0030007', tenChiNhanh: 'CN Đà Nẵng',     maPhong: 'VN0030012', tenPhong: 'PGD Hải Châu' },
];

/* Tài khoản đăng nhập giả — thay cho bộ chọn vai trò (NFR-07). */
const USERS = [
  { id: 'u01', hoTen: 'Nguyễn Văn An',   vaiTro: 'R1',  ...DON_VI[0] },
  { id: 'u02', hoTen: 'Trần Thị Bình',   vaiTro: 'R2',  ...DON_VI[0] },
  { id: 'u03', hoTen: 'Lê Minh Cường',   vaiTro: 'R3',  ...DON_VI[0] },
  { id: 'u04', hoTen: 'Phạm Thu Dung',   vaiTro: 'R4',  ...DON_VI[0] },
  { id: 'u05', hoTen: 'Hoàng Văn Em',    vaiTro: 'R5',  maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-KSSV', tenPhong: 'Phòng KSSV' },
  { id: 'u06', hoTen: 'Vũ Thị Giang',    vaiTro: 'R6',  maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-KSSV', tenPhong: 'Phòng KSSV' },
  { id: 'u07', hoTen: 'Đỗ Quang Huy',    vaiTro: 'R6',  maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-KSSV', tenPhong: 'Phòng KSSV' },
  { id: 'u08', hoTen: 'Bùi Thị Khanh',   vaiTro: 'R7',  maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-KSSV', tenPhong: 'Phòng KSSV' },
  { id: 'u09', hoTen: 'Ngô Văn Long',    vaiTro: 'R2',  ...DON_VI[2] },
  { id: 'u10', hoTen: 'Đặng Thị Mai',    vaiTro: 'R3',  ...DON_VI[2] },
  { id: 'u11', hoTen: 'Lý Thanh Nam',    vaiTro: 'R10', maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-KTNB', tenPhong: 'Ban Kiểm toán nội bộ' },
  { id: 'u12', hoTen: 'Trịnh Văn Phúc',  vaiTro: 'R11', ...DON_VI[0] },
  { id: 'u13', hoTen: 'Phan Quốc Đạt',   vaiTro: 'R8',  maChiNhanh: 'HO', tenChiNhanh: 'Hội sở', maPhong: 'HO-CNTT', tenPhong: 'Khối CNTT' },
];

const KHACH_HANG = [
  ['0048120', 'Công ty CP Xây dựng Tiến Phát'], ['0048121', 'Công ty TNHH Thương mại Hải Đăng'],
  ['0048122', 'Công ty CP Thực phẩm Minh Châu'], ['0048123', 'Công ty TNHH Cơ khí Đại Việt'],
  ['0048124', 'Công ty CP Dệt may Hoàng Gia'],  ['0048125', 'Công ty TNHH Vận tải Sao Mai'],
  ['0048126', 'Công ty CP Nông sản Bình An'],   ['0048127', 'Công ty TNHH Điện tử Tân Tiến'],
  ['0048128', 'Công ty CP Dược phẩm Việt Long'],['0048129', 'Công ty TNHH Nhựa Phú Thành'],
  ['0048130', 'Công ty CP Thép Đông Dương'],    ['0048131', 'Công ty TNHH Gỗ Trường Thịnh'],
];

const SAN_PHAM = ['Cho vay bổ sung vốn lưu động', 'Cho vay đầu tư dự án',
                  'Cho vay tài trợ thương mại', 'Bảo lãnh thực hiện hợp đồng', 'Mở LC nhập khẩu'];

const MUC_DICH = ['Bổ sung vốn lưu động phục vụ hoạt động sản xuất kinh doanh',
                  'Thanh toán tiền mua nguyên vật liệu theo hợp đồng',
                  'Đầu tư mua sắm máy móc thiết bị phục vụ dự án mở rộng',
                  'Thanh toán tiền hàng nhập khẩu theo hợp đồng ngoại thương'];

const DIEU_KIEN_MAU = [
  'Khách hàng bổ sung báo cáo tài chính kiểm toán năm gần nhất',
  'Khách hàng duy trì doanh thu chuyển về tài khoản tại PGBank tối thiểu 60% doanh thu',
  'Bổ sung hợp đồng đầu ra đã ký với đối tác trong vòng 30 ngày kể từ ngày giải ngân',
  'Hoàn thiện thủ tục đăng ký giao dịch bảo đảm đối với tài sản thế chấp',
  'Không phát sinh nợ quá hạn tại các tổ chức tín dụng khác',
];

let _seq = 481940;
function maHoSo() { return 'KSSV-' + String(_seq++).padStart(8, '0'); }

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function ngayLui(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/* Sinh một hồ sơ. opts điều khiển kịch bản để phủ hết ma trận. */
function sinhHoSo(opts) {
  const dv = opts.donVi || rnd(DON_VI);
  const [cif, tenKH] = rnd(KHACH_HANG);
  const ngayGN = ngayLui(opts.tuoiNgay ?? rndInt(5, 120));
  const soLD = opts.soLD ?? (opts.loai === 'L3' ? rndInt(1, 3) : rndInt(0, 2));

  const dongLD = [];
  for (let i = 0; i < soLD; i++) {
    const loaiDong = opts.loai === 'L4' ? 'Bảo lãnh/LC' : 'Khế ước nhận nợ';
    dongLD.push({
      maLD: 'LD' + String(rndInt(1000000000, 9999999999)),
      loai: loaiDong,
      ngayNhanNo: ngayLui((opts.tuoiNgay ?? 60) - i * 7),
      soTien: rndInt(500, 8000) * 1000000,
      chiTietMucDich: opts.thieuTNTD && i === 0 ? '' : rnd(MUC_DICH),
      ngayThucHienKT: null,
      ketQua: null,
      danhGiaRuiRo: '',
      taiLieu: [],
    });
  }

  const dieuKien = [];
  const soDK = opts.soDieuKien ?? rndInt(1, 3);
  for (let i = 0; i < soDK; i++) {
    dieuKien.push({
      noiDung: DIEU_KIEN_MAU[i % DIEU_KIEN_MAU.length],
      thoiGianYeuCau: rnd([15, 30, 60, 90]),
      ketQua: null,
      ngayKTGanNhat: null,
      ngayKTTiepTheo: null,
      taiLieu: [],
    });
  }

  const hs = {
    ma: maHoSo(),
    loai: opts.loai,
    tenLoai: LOAI_HO_SO[opts.loai],
    ky: opts.loai === 'L2' ? rndInt(2, 4) : 1,
    ngayTao: ngayLui((opts.tuoiNgay ?? 60) + 1),
    cif, tenKH,
    maChiNhanh: dv.maChiNhanh, tenChiNhanh: dv.tenChiNhanh,
    maPhong: dv.maPhong, tenPhong: dv.tenPhong,
    maCAR: 'CAR.' + ngayGN.split('-').reverse().join('') + '.' + String(rndInt(10000000, 99999999)),
    maFAC: 'FAC' + String(rndInt(100000, 999999)),
    luongPD: opts.luongPD,
    ngayGiaiNganDau: ngayGN,
    sanPham: rnd(SAN_PHAM),
    mucDichVay: opts.thieuTNTD ? '' : rnd(MUC_DICH),
    cbbhPhuTrach: opts.cbbh || (dv.maChiNhanh === 'VN0020015' ? 'u09' : 'u02'),
    cbKssvPhuTrach: opts.cbKssv || null,
    phuongThucXuLy: opts.phuongThucXuLy || 'Phân công cho cán bộ',
    buocHienTai: opts.buoc,
    dongLD, dieuKien,
    hdkd: { ketQua: null, taiLieu: null, ngayKT: null, chiTiet: '' },
    tsbd: { ketQua: null, taiLieu: null, ngayKT: null, chiTiet: '' },
    cheTaiApDung: { noiDung: '', ngayBatDau: '', trangThai: 'Đang áp dụng' },
    dgSDV:     { danhGia: 'Không rủi ro', chiTiet: '' },
    dgTuanThu: { danhGia: 'Không rủi ro', chiTiet: '' },
    dgHDKD:    { danhGia: 'Không rủi ro', chiTiet: '' },
    dgTSBD:    { danhGia: 'Không rủi ro', chiTiet: '' },
    mucDichGiaiNgan: opts.thieuTNTD ? '' : rnd(MUC_DICH),
    phuongAnKhacPhuc: null,
    theoDoiKhacPhuc: [],
    coCoKhacPhuc: false,
    ykienKSSV: null,
    deXuatCapPD: null,
    phuongAnPheDuyet: null,
    taiLieuDVKD: [],
    lichSu: [],
    khongPhaiKiemTra: false,
  };

  hs.lichSu.push({
    buoc: '—', nguoi: 'Hệ thống', vaiTro: '—',
    batDau: hs.ngayTao + ' 06:00', ketThuc: hs.ngayTao + ' 06:00',
    hanhDong: 'Khởi tạo hồ sơ', ketQua: 'Hệ thống khởi tạo hồ sơ từ dữ liệu LOS', lyDo: '',
  });

  /* Điền dữ liệu các bước đã đi qua để hồ sơ nhất quán với bước hiện tại. */
  const thuTu = chuoiBuoc(hs);
  const viTri = thuTu.indexOf(hs.buocHienTai);

  if (viTri > 0 || hs.buocHienTai === 'ST-99') {
    hs.lichSu.push({ buoc: 'ST-01', nguoi: 'Nguyễn Văn An', vaiTro: 'TNTD',
      batDau: hs.ngayTao + ' 08:15', ketThuc: hs.ngayTao + ' 09:40',
      hanhDong: 'Chuyển bước → CBBH', ketQua: 'Đã chuyển bước', lyDo: '' });
  }
  if (viTri > 1 || hs.buocHienTai === 'ST-99') {
    const coRR = opts.coRuiRo;
    hs.dongLD.forEach(d => {
      d.ngayThucHienKT = ngayLui(rndInt(1, 20));
      d.ketQua = coRR && Math.random() < 0.6 ? 'Sai mục đích' : 'Đúng mục đích';
      if (d.ketQua === 'Sai mục đích')
        d.danhGiaRuiRo = 'Khách hàng sử dụng vốn không đúng phương án đã được phê duyệt, số tiền '
                       + (rndInt(200, 900) * 1000000).toLocaleString('vi-VN') + ' đồng.';
      d.taiLieu = [{ ten: 'BB_kiem_tra_' + d.maLD + '.pdf', loai: 'Biên bản kiểm tra sau vay' }];
    });
    hs.dieuKien.forEach(d => {
      d.ketQua = coRR && Math.random() < 0.5 ? 'Vi phạm' : 'Tuân thủ';
      d.ngayKTGanNhat = ngayLui(rndInt(1, 20));
      d.ngayKTTiepTheo = themNgay(d.ngayKTGanNhat, d.thoiGianYeuCau || 30);
    });
    hs.hdkd = { ketQua: coRR && Math.random() < 0.4 ? 'Có dấu hiệu rủi ro' : 'Bình thường',
                taiLieu: 'Hợp lệ', ngayKT: ngayLui(rndInt(1, 20)),
                ngayKTGanNhat: ngayLui(rndInt(1, 20)), ngayKTTiepTheo: themNgay(ngayLui(0), 90) };
    hs.tsbd = { ketQua: 'Bình thường', taiLieu: 'Hợp lệ', chiTiet: '',
                ngayKT: ngayLui(rndInt(1, 20)),
                ngayKTGanNhat: ngayLui(rndInt(1, 20)), ngayKTTiepTheo: themNgay(ngayLui(0), 90) };
    if (hs.hdkd.ketQua === 'Có dấu hiệu rủi ro')
      hs.hdkd.chiTiet = 'Doanh thu quý gần nhất giảm 35% so với cùng kỳ, tồn kho tăng mạnh.';

    /* Cờ rủi ro nay chỉ do CBBH tích (chốt 23/09/2026), nên kịch bản có rủi
     * ro phải tích ô và có ý kiến thì hồ sơ mới đi đúng nhánh. */
    if (coRR) {
      hs.dgSDV     = { danhGia: 'Có rủi ro', chiTiet: 'Khách hàng sử dụng vốn không đúng phương án đã được phê duyệt.' };
      hs.dgTuanThu = { danhGia: 'Có rủi ro', chiTiet: 'Chậm cung cấp chứng từ theo điều kiện phê duyệt.' };
      hs.cheTaiApDung = { noiDung: 'Tăng lãi suất 0,5%/năm cho đến khi khắc phục xong',
                          ngayBatDau: ngayLui(rndInt(1, 15)), trangThai: 'Đang áp dụng' };
    }
    /* Nếu kịch bản KHÔNG rủi ro, dọn sạch mọi dấu hiệu. */
    if (!coRR) {
      hs.dongLD.forEach(d => { d.ketQua = 'Đúng mục đích'; d.danhGiaRuiRo = ''; });
      hs.dieuKien.forEach(d => { d.ketQua = 'Tuân thủ'; });
      hs.hdkd.ketQua = 'Bình thường'; hs.hdkd.chiTiet = '';
      hs.tsbd.ketQua = 'Bình thường';
      hs.dgSDV = { danhGia: 'Không rủi ro', chiTiet: '' };
      hs.dgTuanThu = { danhGia: 'Không rủi ro', chiTiet: '' };
      hs.dgHDKD = { danhGia: 'Không rủi ro', chiTiet: '' };
      hs.dgTSBD = { danhGia: 'Không rủi ro', chiTiet: '' };
    }
    hs.taiLieuDVKD = [
      { ten: 'Bien_ban_kiem_tra_sau_vay.pdf', loai: 'Biên bản kiểm tra sau vay',
        nguoiTai: 'Trần Thị Bình', thoiGian: ngayLui(rndInt(1, 15)) + ' 14:22', dungLuong: '1,2 MB' },
      { ten: 'Bao_cao_su_dung_von.xlsx', loai: 'Báo cáo sử dụng vốn sau giải ngân',
        nguoiTai: 'Trần Thị Bình', thoiGian: ngayLui(rndInt(1, 15)) + ' 14:25', dungLuong: '340 KB' },
    ];
    hs.lichSu.push({ buoc: 'ST-02', nguoi: 'Trần Thị Bình', vaiTro: 'CBBH',
      batDau: ngayLui(rndInt(16, 25)) + ' 10:00', ketThuc: ngayLui(rndInt(1, 15)) + ' 15:30',
      hanhDong: 'Trình phê duyệt', ketQua: 'Đã trình phê duyệt', lyDo: '' });
  }
  if (viTri > 2 || hs.buocHienTai === 'ST-99') {
    hs.lichSu.push({ buoc: 'ST-03', nguoi: 'Lê Minh Cường', vaiTro: 'GĐ/PGĐ phòng',
      batDau: ngayLui(rndInt(8, 14)) + ' 09:00', ketThuc: ngayLui(rndInt(3, 7)) + ' 11:15',
      hanhDong: opts.coRuiRo ? 'Trình cấp PD' : 'Phê duyệt kết quả KSSV',
      ketQua: opts.coRuiRo ? 'Đã trình cấp phê duyệt' : 'Đã phê duyệt kết quả', lyDo: '' });
  }
  if (opts.coRuiRo && (viTri >= 3 || hs.buocHienTai === 'ST-99')) {
    hs.phuongAnKhacPhuc = {
      noiDung: 'Yêu cầu khách hàng bổ sung chứng từ chứng minh mục đích sử dụng vốn và cam kết '
             + 'chuyển doanh thu về tài khoản tại PGBank theo đúng điều kiện phê duyệt.',
      capPheDuyet: hs.luongPD === 'Chi nhánh' ? 'GĐ/PGĐ chi nhánh' : 'Cấp phê duyệt Hội sở',
      ngayCapNhat: ngayLui(rndInt(3, 10)),
      cheTaiTrongKP: 'Tạm dừng giải ngân cho đến khi khắc phục xong',
      thoiGianKhacPhuc: themNgay(ngayLui(rndInt(3, 10)), rndInt(-10, 45)),
      trangThai: opts.daDuyetPA ? 'Đã được duyệt, đang thực hiện' : 'Đang trình',
    };
    if (opts.daDuyetPA) {
      hs.coCoKhacPhuc = true;
      hs.theoDoiKhacPhuc = [{
        ngayCapNhat: ngayLui(rndInt(1, 5)),
        tinhTrang: rnd(['1 phần', 'Chưa']),
        noiDungChua: 'Khách hàng đã bổ sung một phần chứng từ, còn thiếu hợp đồng đầu ra.',
        ngayBaoCaoKSSV: null, taiLieuBaoCao: null,
      }];
    }
  }
  if (viTri > 4 && hs.luongPD === 'Hội sở') {
    hs.ykienKSSV = {
      ketLuan: 'Không đồng ý, đánh giá lại mức độ rủi ro',
      ykien: 'Đề nghị ĐVKD làm rõ dòng tiền của khách hàng trong 6 tháng gần nhất và bổ sung '
           + 'biện pháp bảo đảm trước khi trình cấp phê duyệt.',
      kienNghi: 'Bổ sung tài sản bảo đảm hoặc giảm hạn mức tương ứng phần vốn sử dụng sai mục đích.',
    };
  }
  if (hs.buocHienTai === 'ST-08' || hs.buocHienTai === 'ST-05' || hs.buocHienTai === 'ST-99') {
    if (hs.luongPD === 'Hội sở')
      hs.deXuatCapPD = { capDaChon: ['Giám đốc Khối', 'Hội đồng tín dụng'],
                         lyDo: 'Mức dư nợ vượt thẩm quyền Phòng KSSV và có dấu hiệu sai mục đích.' };
  }
  if (hs.buocHienTai === 'ST-99') {
    hs.lichSu.push({ buoc: 'ST-99', nguoi: 'Hệ thống', vaiTro: '—',
      batDau: ngayLui(1) + ' 16:00', ketThuc: ngayLui(1) + ' 16:00',
      hanhDong: 'Kết thúc luồng', ketQua: 'Hồ sơ hoàn thành', lyDo: '' });
  }
  if (opts.khongPhaiKiemTra) hs.khongPhaiKiemTra = true;

  return hs;
}

/* Bộ dữ liệu phủ ma trận kịch bản. */
function sinhBoDuLieu() {
  const ds = [];
  const kichBan = [
    /* Bước TNTD (ST-01) — gán đúng PGD Hoàn Kiếm để tài khoản TNTD nhìn thấy
     * theo phân quyền dữ liệu BR-102, phủ đủ 4 loại hồ sơ và 2 luồng PD.   */
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 5,  soLD: 1, donVi: DON_VI[0] },
    { loai: 'L1', luongPD: 'Hội sở',    buoc: 'ST-01', coRuiRo: false, tuoiNgay: 12, soLD: 2, donVi: DON_VI[0] },
    { loai: 'L2', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 20, soLD: 0, donVi: DON_VI[0] },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 9,  soLD: 2, donVi: DON_VI[0] },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-01', coRuiRo: false, tuoiNgay: 15, soLD: 3, donVi: DON_VI[0] },
    { loai: 'L4', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 40, soLD: 1, donVi: DON_VI[0] },
    /* Hồ sơ dữ liệu nguồn từ LOS chưa đầy đủ — TNTD phải nhập tay (BR-207) */
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 45, soLD: 2, donVi: DON_VI[0], thieuTNTD: true },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 30, soLD: 2, donVi: DON_VI[2], thieuTNTD: true },

    /* Bổ sung 5 hồ sơ ở bước TNTD, đa dạng số dòng điều kiện và số khế ước
     * để có đủ dữ liệu thao tác ngay trên màn hình Xử lý hồ sơ.            */
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 3,   soLD: 1, soDieuKien: 5, donVi: DON_VI[0] },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 18,  soLD: 4, soDieuKien: 4, donVi: DON_VI[0] },
    { loai: 'L2', luongPD: 'Hội sở',    buoc: 'ST-01', coRuiRo: false, tuoiNgay: 26,  soLD: 2, soDieuKien: 3, donVi: DON_VI[0] },
    { loai: 'L4', luongPD: 'Hội sở',    buoc: 'ST-01', coRuiRo: false, tuoiNgay: 95,  soLD: 2, soDieuKien: 2, donVi: DON_VI[0] },
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 130, soLD: 3, soDieuKien: 5, donVi: DON_VI[0], thieuTNTD: true },

    /* Nhánh A — không rủi ro, kết thúc tại GĐ/PGĐ phòng */
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-01', coRuiRo: false, tuoiNgay: 8,  soLD: 1 },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-02', coRuiRo: false, tuoiNgay: 22, soLD: 2 },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-02', coRuiRo: false, tuoiNgay: 35, soLD: 3 },
    { loai: 'L2', luongPD: 'Chi nhánh', buoc: 'ST-03', coRuiRo: false, tuoiNgay: 28, soLD: 1 },
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-99', coRuiRo: false, tuoiNgay: 60, soLD: 1 },
    { loai: 'L2', luongPD: 'Chi nhánh', buoc: 'ST-99', coRuiRo: false, tuoiNgay: 75, soLD: 2 },

    /* Nhánh B — có rủi ro, thẩm quyền chi nhánh */
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-03', coRuiRo: true,  tuoiNgay: 40, soLD: 2 },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-04', coRuiRo: true,  tuoiNgay: 55, soLD: 1 },
    { loai: 'L1', luongPD: 'Chi nhánh', buoc: 'ST-05', coRuiRo: true,  tuoiNgay: 70, soLD: 1, daDuyetPA: true },
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-99', coRuiRo: true,  tuoiNgay: 95, soLD: 2, daDuyetPA: true },

    /* Nhánh C — có rủi ro, luồng Hội sở */
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-03', coRuiRo: true,  tuoiNgay: 33, soLD: 2 },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-04', coRuiRo: true,  tuoiNgay: 48, soLD: 1 },
    { loai: 'L4', luongPD: 'Hội sở',    buoc: 'ST-05H', coRuiRo: true, tuoiNgay: 100, soLD: 1 },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-06', coRuiRo: true,  tuoiNgay: 62, soLD: 2, cbKssv: 'u06' },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-06', coRuiRo: true,  tuoiNgay: 58, soLD: 1, cbKssv: 'u07' },
    { loai: 'L1', luongPD: 'Hội sở',    buoc: 'ST-07', coRuiRo: true,  tuoiNgay: 80, soLD: 1, cbKssv: 'u06' },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-08', coRuiRo: true,  tuoiNgay: 88, soLD: 2, cbKssv: 'u06' },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-05', coRuiRo: true,  tuoiNgay: 110, soLD: 1, cbKssv: 'u06', daDuyetPA: true },
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-99', coRuiRo: true,  tuoiNgay: 130, soLD: 2, cbKssv: 'u07', daDuyetPA: true },

    /* Trưởng BP tự xử lý */
    { loai: 'L3', luongPD: 'Hội sở',    buoc: 'ST-05H', coRuiRo: true, tuoiNgay: 66, soLD: 1, phuongThucXuLy: 'Tự xử lý' },

    /* Quá hạn nặng + khắc phục quá hạn */
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-02', coRuiRo: true,  tuoiNgay: 150, soLD: 2 },
    { loai: 'L4', luongPD: 'Chi nhánh', buoc: 'ST-02', coRuiRo: false, tuoiNgay: 200, soLD: 1 },

    /* Không phải kiểm tra (khoản vay tất toán) — BR-206 */
    { loai: 'L3', luongPD: 'Chi nhánh', buoc: 'ST-02', coRuiRo: false, tuoiNgay: 90, soLD: 1, khongPhaiKiemTra: true },
  ];

  kichBan.forEach(kb => ds.push(sinhHoSo(kb)));

  /* Bổ sung hồ sơ ngẫu nhiên cho đủ khối lượng thử phân trang. */
  for (let i = 0; i < 26; i++) {
    ds.push(sinhHoSo({
      loai: rnd(['L1', 'L2', 'L3', 'L4']),
      luongPD: rnd(['Chi nhánh', 'Chi nhánh', 'Hội sở']),
      buoc: rnd(['ST-01', 'ST-02', 'ST-02', 'ST-03', 'ST-04', 'ST-99']),
      coRuiRo: Math.random() < 0.35,
      tuoiNgay: rndInt(3, 180),
      soLD: rndInt(1, 3),
      donVi: rnd(DON_VI),
    }));
  }
  return ds;
}
