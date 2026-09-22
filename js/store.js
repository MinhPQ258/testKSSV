/* ============================================================================
 * KSSV Prototype — store.js
 * Trạng thái ứng dụng, lưu bền bằng localStorage. Không có backend.
 * "Ngày hệ thống" có thể tua tới/lui bằng dev bar để thử nhắc hạn, quá hạn.
 * ==========================================================================*/

const KHOA_LUU = 'kssv-prototype-v1';

const Store = {
  state: null,

  khoiTao() {
    const luu = this._doc();
    if (luu) { this.state = luu; return; }
    this.datLai();
  },

  datLai() {
    this.state = {
      user: null,
      hoSo: sinhBoDuLieu(),
      ngayHeThong: new Date().toISOString().slice(0, 10),
      thongBao: [],
      manHinh: 'M-01',
      hoSoDangMo: null,
      tabDangMo: 'khachHang',
      tabDanhSach: 'tab1',
      trang: 1,
    };
    this._ghi();
  },

  _doc() {
    try {
      const s = localStorage.getItem(KHOA_LUU);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  },

  _ghi() {
    try { localStorage.setItem(KHOA_LUU, JSON.stringify(this.state)); } catch (e) {}
  },

  luu() { this._ghi(); },

  /* ------------------------------------------------------------- truy vấn */
  hoSoTheoPhamVi() {
    const u = this.state.user;
    if (!u) return [];
    return this.state.hoSo.filter(hs => trongPhamVi(hs, u));
  },

  timHoSo(ma) { return this.state.hoSo.find(h => h.ma === ma); },

  nguoiDung(id) { return USERS.find(u => u.id === id); },

  /* ------------------------------------------------------------- hành động */
  chuyenBuoc(hs, chuyen, lyDo) {
    const u = this.state.user;
    const now = this.state.ngayHeThong;

    hs.lichSu.push({
      buoc: hs.buocHienTai,
      nguoi: u.hoTen,
      vaiTro: ROLES[u.vaiTro].tat,
      batDau: now + ' 08:00',
      ketThuc: now + ' ' + new Date().toTimeString().slice(0, 5),
      hanhDong: chuyen.nhan,
      ketQua: chuyen.kieu === 'tralai' ? 'Đã trả lại bước trước' : 'Đã chuyển bước',
      lyDo: lyDo || '',
    });

    hs.buocHienTai = chuyen.den;
    if (chuyen.kieu === 'tralai') hs.lyDoTraLaiGanNhat = { lyDo, nguoi: u.hoTen, ngay: now };
    else hs.lyDoTraLaiGanNhat = null;

    /* Khi phương án khắc phục được duyệt → chuyển trạng thái phương án và bật
     * cờ "Đang theo dõi khắc phục" chạy song song với luồng chính (BR-214).
     * Điểm duyệt phương án là: R4 đồng ý (→ ST-05), thư ký hoàn tất (→ ST-05),
     * hoặc R7 đồng ý kết thúc nhánh nội bộ (→ ST-99).                        */
    const pa = hs.phuongAnKhacPhuc;
    if (pa && (chuyen.den === 'ST-05' || chuyen.den === 'ST-99')) {
      if (pa.trangThai === 'Đang trình') pa.trangThai = 'Đã được duyệt, đang thực hiện';
      hs.coCoKhacPhuc = pa.trangThai !== 'Đã khắc phục xong';
    }

    /* Sinh kỳ kiểm tra tiếp theo — BR-205, không phụ thuộc khắc phục. */
    if (chuyen.den === 'ST-99' && (hs.loai === 'L1' || hs.loai === 'L2')) {
      this._sinhKyTiepTheo(hs);
    }

    this._thongBao(hs, chuyen);
    this._ghi();
  },

  _sinhKyTiepTheo(hsCu) {
    if (hsCu.khongPhaiKiemTra) return;
    const hsMoi = JSON.parse(JSON.stringify(hsCu));
    hsMoi.ma = maHoSo();
    hsMoi.loai = 'L2';
    hsMoi.tenLoai = LOAI_HO_SO.L2;
    hsMoi.ky = (hsCu.ky || 1) + 1;
    hsMoi.ngayTao = this.state.ngayHeThong;
    hsMoi.buocHienTai = 'ST-01';
    hsMoi.coCoKhacPhuc = false;
    hsMoi.phuongAnKhacPhuc = null;
    hsMoi.theoDoiKhacPhuc = [];
    hsMoi.ykienKSSV = null;
    hsMoi.deXuatCapPD = null;
    hsMoi.phuongAnPheDuyet = null;
    hsMoi.tichCoRuiRo = false;
    hsMoi.dongLD.forEach(d => { d.ngayThucHienKT = null; d.ketQua = null; d.danhGiaRuiRo = ''; d.taiLieu = []; });
    hsMoi.dieuKien.forEach(d => { d.ketQua = null; d.ngayKTGanNhat = null; d.taiLieu = []; });
    hsMoi.hdkd = { ketQua: null, taiLieu: null, danhGiaRuiRo: '', ngayKT: null, chiTiet: '' };
    hsMoi.tsbd = { ketQua: null, taiLieu: null, danhGiaRuiRo: '', ngayKT: null, chiTiet: '' };
    hsMoi.taiLieuDVKD = [];
    hsMoi.lichSu = [{
      buoc: '—', nguoi: 'Hệ thống', vaiTro: '—',
      batDau: hsMoi.ngayTao + ' 06:00', ketThuc: hsMoi.ngayTao + ' 06:00',
      hanhDong: 'Khởi tạo hồ sơ',
      ketQua: `Sinh kỳ kiểm tra định kỳ tiếp theo (kỳ ${hsMoi.ky}) từ hồ sơ ${hsCu.ma} — BR-205`,
      lyDo: '',
    }];
    this.state.hoSo.unshift(hsMoi);
    this._them('Hệ thống đã sinh kỳ kiểm tra tiếp theo: ' + hsMoi.ma, hsMoi.ma);
  },

  _thongBao(hs, chuyen) {
    const buocDich = STEPS[chuyen.den];
    if (!buocDich || !buocDich.vaiTro) return;
    this._them(
      `Hồ sơ ${hs.ma} đã chuyển đến bước "${buocDich.ten}" — ${ROLES[buocDich.vaiTro].ten}`,
      hs.ma);
  },

  _them(noiDung, maHS) {
    this.state.thongBao.unshift({
      noiDung, maHS, thoiGian: this.state.ngayHeThong, daDoc: false,
    });
    if (this.state.thongBao.length > 50) this.state.thongBao.pop();
  },

  tuaNgay(soNgay) {
    this.state.ngayHeThong = themNgay(this.state.ngayHeThong, soNgay);
    this._ghi();
  },
};
