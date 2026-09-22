/* ============================================================================
 * KSSV Prototype — screens.js   M-01 Danh sách · M-02 Xử lý · M-03 Báo cáo
 * ==========================================================================*/

const CHIP_TT = {
  'Hoàn thành': 'ok', 'Sắp đến hạn': 'warn', 'Quá hạn': 'err',
  'Chưa đến hạn': 'mute', 'Không phải kiểm tra': 'mute',
};

function chipTinhTrang(hs) {
  const tt = tinhTinhTrang(hs, Store.state.ngayHeThong);
  return el('span', { class: 'chip ' + (CHIP_TT[tt] || 'mute') }, tt);
}

/* ======================================================= M-01 DANH SÁCH */
function veDanhSach() {
  const s = Store.state;
  const homNay = s.ngayHeThong;
  const cuaToi = s.manHinh === 'MY';          /* UC-M01-13 */

  const tatCa = Store.hoSoTheoPhamVi()
    .filter(hs => !cuaToi || (hs.buocHienTai !== 'ST-99' && laNguoiPhuTrach(hs, s.user)));

  const tab = s.tabDanhSach || 'tab1';
  const theoTab = tatCa.filter(hs =>
    tab === 'tab1' ? (hs.loai === 'L1' || hs.loai === 'L2') : (hs.loai === 'L3' || hs.loai === 'L4'));

  /* tìm kiếm */
  const tu = (s.tuKhoa || '').trim().toLowerCase();
  const truong = s.truongTim || 'ma';
  const loc = theoTab.filter(hs => {
    if (!tu) return true;
    const v = { ma: hs.ma, cif: hs.cif, ten: hs.tenKH, car: hs.maCAR, cn: hs.tenChiNhanh }[truong] || '';
    return String(v).toLowerCase().includes(tu);
  });

  /* thẻ chỉ số — BR-501: tính theo tab đang chọn */
  const dem = t => theoTab.filter(hs => tinhTinhTrang(hs, homNay) === t).length;
  const stats = el('div', { class: 'stats' },
    el('div', { class: 'stat info' }, el('div', { class: 'n' }, theoTab.length), el('div', { class: 'l' }, 'Tổng số hồ sơ')),
    el('div', { class: 'stat warn' }, el('div', { class: 'n' }, dem('Sắp đến hạn')), el('div', { class: 'l' }, 'Sắp đến hạn (dưới 30 ngày)')),
    el('div', { class: 'stat err' }, el('div', { class: 'n' }, dem('Quá hạn')), el('div', { class: 'l' }, 'Quá hạn')),
    el('div', { class: 'stat ok' }, el('div', { class: 'n' }, dem('Hoàn thành')), el('div', { class: 'l' }, 'Đã hoàn thành')));

  /* sắp xếp mặc định: hạn kiểm tra gần nhất tăng dần */
  loc.sort((a, b) => (hanGanNhat(a) || '9999') .localeCompare(hanGanNhat(b) || '9999'));

  /* phân trang phía "máy chủ" */
  const moiTrang = s.moiTrang || 50;
  const tongTrang = Math.max(1, Math.ceil(loc.length / moiTrang));
  const trang = Math.min(s.trang || 1, tongTrang);
  const batDau = (trang - 1) * moiTrang;
  const hienThi = loc.slice(batDau, batDau + moiTrang);

  /* nhóm */
  const nhom = {};
  hienThi.forEach(hs => {
    const key = tab === 'tab1'
      ? (hs.loai === 'L1' ? 'Kiểm tra tuân thủ điều kiện PD/sản phẩm' : 'Kiểm tra định kỳ')
      : 'Gói hạn mức ' + hs.maFAC;
    (nhom[key] = nhom[key] || []).push(hs);
  });

  const rows = [];
  Object.keys(nhom).sort().forEach(k => {
    const ds = nhom[k];
    const qh = ds.filter(h => tinhTinhTrang(h, homNay) === 'Quá hạn').length;
    const sd = ds.filter(h => tinhTinhTrang(h, homNay) === 'Sắp đến hạn').length;
    rows.push(el('tr', { class: 'grp' }, el('td', { colspan: 9 },
      k,
      el('span', { class: 'meta' },
        `${ds.length} hồ sơ` + (qh ? ` · ${qh} quá hạn` : '') + (sd ? ` · ${sd} sắp đến hạn` : '')))));
    ds.forEach(hs => {
      const rr = tinhCoRuiRo(hs);
      rows.push(el('tr', { class: 'row', onclick: () => moDrawer(hs.ma) },
        el('td', {}, el('a', {}, hs.ma),
          rr.coRuiRo ? el('span', { class: 'chip risk', style: 'margin-left:6px' }, 'Có rủi ro') : null,
          hs.coCoKhacPhuc ? el('span', { class: 'chip info', style: 'margin-left:6px' }, 'Đang khắc phục') : null),
        el('td', {}, dinhDangNgay(hs.ngayTao)),
        el('td', {}, dinhDangNgay(hanGanNhat(hs)),
          el('div', { class: 'note' }, nhanHanTuongDoi(hs, homNay))),
        el('td', {}, STEPS[hs.buocHienTai] ? `${STEPS[hs.buocHienTai].stt}. ${ROLES[STEPS[hs.buocHienTai].vaiTro]?.tat || '—'}` : '—'),
        el('td', {}, hs.cif),
        el('td', {}, hs.tenKH),
        el('td', {}, hs.tenChiNhanh, el('div', { class: 'note' }, hs.tenPhong)),
        el('td', {}, el('span', { class: 'chip ' + (hs.luongPD === 'Hội sở' ? 'info' : 'mute') }, hs.luongPD)),
        el('td', {}, chipTinhTrang(hs))));
    });
  });

  const bang = el('div', { class: 'card' },
    el('div', { class: 'tabs' },
      el('button', {
        class: tab === 'tab1' ? 'on' : '',
        onclick: () => { s.tabDanhSach = 'tab1'; s.trang = 1; Store.luu(); ve(); },
      }, 'Kiểm tra sau vay chung / định kỳ',
         el('span', { class: 'cnt' }, tatCa.filter(h => h.loai === 'L1' || h.loai === 'L2').length)),
      el('button', {
        class: tab === 'tab2' ? 'on' : '',
        onclick: () => { s.tabDanhSach = 'tab2'; s.trang = 1; Store.luu(); ve(); },
      }, 'Kiểm tra sử dụng vốn',
         el('span', { class: 'cnt' }, tatCa.filter(h => h.loai === 'L3' || h.loai === 'L4').length))),
    rows.length
      ? el('table', {}, el('thead', {}, el('tr', {},
          ...['Mã hồ sơ', 'Ngày tạo', 'Hạn kiểm tra gần nhất', 'Bước xử lý', 'CIF',
              'Tên khách hàng', 'Chi nhánh', 'Luồng PD', 'Tình trạng'].map(h => el('th', {}, h)))),
          el('tbody', {}, ...rows))
      : el('div', { class: 'empty' },
          'Không tìm thấy hồ sơ phù hợp — thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc'),
    el('div', { style: 'padding:11px 14px;display:flex;align-items:center;gap:10px;border-top:1px solid var(--line)' },
      el('span', { style: 'font-size:12.5px;color:var(--ink-2)' },
        loc.length ? `Hiển thị ${batDau + 1}–${Math.min(batDau + moiTrang, loc.length)} trên tổng ${loc.length} hồ sơ` : ''),
      el('span', { class: 'sep', style: 'flex:1' }),
      el('select', {
        onchange: e => { s.moiTrang = +e.target.value; s.trang = 1; Store.luu(); ve(); },
      }, ...[20, 50, 100, 200].map(n => el('option', { value: n, selected: n === moiTrang }, n + '/trang'))),
      el('button', { class: 'btn sm', disabled: trang <= 1, onclick: () => { s.trang = trang - 1; Store.luu(); ve(); } }, '‹ Trước'),
      el('span', { style: 'font-size:12.5px' }, `Trang ${trang}/${tongTrang}`),
      el('button', { class: 'btn sm', disabled: trang >= tongTrang, onclick: () => { s.trang = trang + 1; Store.luu(); ve(); } }, 'Sau ›')));

  return el('div', {},
    el('div', { class: 'crumb' }, 'Kiểm soát sau vay › ' + (cuaToi ? 'Hồ sơ của tôi' : 'Danh sách hồ sơ')),
    el('div', { class: 'page-h' },
      el('div', {},
        el('h1', {}, cuaToi ? 'Hồ sơ của tôi' : 'Danh sách hồ sơ kiểm soát sau vay'),
        el('p', {}, cuaToi
          ? `Hồ sơ đang ở bước thuộc vai trò ${ROLES[s.user.vaiTro].ten} và do chính anh/chị phụ trách`
          : 'Theo dõi, tra cứu và thực hiện kiểm tra sau vay theo từng khoản cấp tín dụng')),
      el('div', { class: 'sep' }),
      el('button', { class: 'btn', onclick: () => alert('Kết xuất Excel theo bộ lọc hiện tại (mô phỏng).') }, 'Xuất Excel')),
    cuaToi ? el('div', { class: 'banner info' }, el('div', {},
      'Danh sách lọc theo ba điều kiện của BR-329: đúng vai trò phụ trách bước hiện tại, '
      + 'đúng người được phân công, và hồ sơ chưa hoàn thành.')) : null,
    stats,
    el('div', { class: 'card' }, el('div', { class: 'body' },
      el('div', { class: 'filters' },
        el('select', { onchange: e => { s.truongTim = e.target.value; Store.luu(); ve(); } },
          ...[['ma', 'Mã hồ sơ'], ['cif', 'CIF khách hàng'], ['ten', 'Tên khách hàng'],
              ['car', 'Mã hồ sơ phê duyệt'], ['cn', 'Chi nhánh']]
            .map(([v, t]) => el('option', { value: v, selected: truong === v }, t))),
        el('input', {
          placeholder: 'Nhập giá trị tìm kiếm...', value: s.tuKhoa || '',
          onchange: e => { s.tuKhoa = e.target.value; s.trang = 1; Store.luu(); ve(); },
        }),
        el('button', { class: 'btn pri', onclick: () => ve() }, 'Tìm kiếm'),
        s.tuKhoa ? el('button', { class: 'btn', onclick: () => { s.tuKhoa = ''; Store.luu(); ve(); } }, 'Xóa bộ lọc') : null))),
    bang);
}

/* ------------------------------------------------------------- DRAWER */
function moDrawer(ma) {
  const hs = Store.timHoSo(ma);
  const u = Store.state.user;
  const homNay = Store.state.ngayHeThong;
  const rr = tinhCoRuiRo(hs);

  const kv = (k, v) => [el('div', { class: 'k' }, k), el('div', { class: 'v' }, v)];

  const buoc = chuoiBuoc(hs);
  const idx = buoc.indexOf(hs.buocHienTai);
  const stepper = el('div', {}, ...buoc.map((b, i) => {
    const st = STEPS[b];
    const done = hs.buocHienTai === 'ST-99' ? true : i < idx;
    const now = i === idx;
    const ls = hs.lichSu.filter(l => l.buoc === b).pop();
    return el('div', {
      style: 'display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f0f3f7',
    },
      el('div', {
        style: `width:24px;height:24px;border-radius:50%;flex:none;text-align:center;line-height:24px;
                font-size:11.5px;font-weight:700;background:${now ? 'var(--pg)' : done ? 'var(--ok-bg)' : '#e6eaf0'};
                color:${now ? '#fff' : done ? 'var(--ok)' : 'var(--ink-3)'}`,
      }, st.stt),
      el('div', { style: 'flex:1' },
        el('div', { style: 'font-size:13px;font-weight:' + (now ? '600' : '400') }, st.ten),
        el('div', { class: 'note' },
          (st.vaiTro ? ROLES[st.vaiTro].ten : '—') +
          (ls ? ` · ${ls.nguoi} · ${ls.ketThuc}` : ''))),
      el('span', { class: 'chip ' + (now ? 'info' : done ? 'ok' : 'mute') },
        now ? 'Đang xử lý' : done ? 'Hoàn tất' : 'Chưa tới'));
  }));

  const drawer = el('div', { id: 'drawer' },
    el('div', { class: 'hd' },
      el('h3', {}, hs.ma),
      el('div', { class: 'note', style: 'margin-top:3px' }, `${hs.tenKH} · ${hs.cif} · ${hs.tenLoai}`),
      el('div', { style: 'margin-top:7px;display:flex;gap:6px;flex-wrap:wrap' },
        chipTinhTrang(hs),
        el('span', { class: 'chip mute' }, nhanHanTuongDoi(hs, homNay)),
        rr.coRuiRo ? el('span', { class: 'chip risk' }, 'Có rủi ro') : null,
        hs.coCoKhacPhuc ? el('span', { class: 'chip info' }, 'Đang theo dõi khắc phục') : null)),
    el('div', { class: 'bd' },
      el('div', { class: 'sec' }, 'Thông tin hồ sơ'),
      el('div', { class: 'kv' },
        ...kv('Mã hồ sơ KSSV', hs.ma),
        ...kv('Ngày tạo', dinhDangNgay(hs.ngayTao)),
        ...kv('CIF khách hàng', hs.cif),
        ...kv('Tên khách hàng', hs.tenKH),
        ...kv('Chi nhánh', `${hs.maChiNhanh} — ${hs.tenChiNhanh}`),
        ...kv('Phòng giao dịch', `${hs.maPhong} — ${hs.tenPhong}`),
        ...kv('Mã hồ sơ phê duyệt', hs.maCAR),
        ...kv('Gói hạn mức (FAC)', hs.maFAC),
        ...kv('Loại kiểm tra', hs.tenLoai + (hs.loai === 'L2' ? ` — kỳ ${hs.ky}` : '')),
        ...kv('Luồng phê duyệt', el('span', { class: 'chip ' + (hs.luongPD === 'Hội sở' ? 'info' : 'mute') }, hs.luongPD)),
        ...kv('Ngày giải ngân/phát hành đầu tiên', dinhDangNgay(hs.ngayGiaiNganDau)),
        ...kv('Hạn kiểm tra gần nhất', dinhDangNgay(hanGanNhat(hs)) + ' — ' + nhanHanTuongDoi(hs, homNay))),
      rr.coRuiRo ? el('div', { class: 'banner err', style: 'margin-top:14px' },
        el('div', {}, el('b', {}, 'Hệ thống xác định hồ sơ CÓ dấu hiệu rủi ro'),
          el('ul', { style: 'margin:6px 0 0;padding-left:18px' }, ...rr.lyDo.map(l => el('li', {}, l))),
          el('div', { class: 'rule', style: 'margin-top:6px' }, 'BR-506 — cờ rủi ro do hệ thống tự tính, người dùng không chọn'))) : null,
      el('div', { class: 'sec' }, 'Luồng xử lý hồ sơ'),
      stepper),
    el('div', { class: 'ft' },
      el('button', { class: 'btn', onclick: dongDrawer }, 'Đóng'),
      el('button', { class: 'btn', onclick: () => alert('Kết xuất PDF thông tin hồ sơ (mô phỏng).') }, 'In hồ sơ'),
      el('div', { style: 'flex:1' }),
      ROLES[u.vaiTro].chiXem ? null : el('button', {
        class: 'btn pri',
        onclick: () => { dongDrawer(); Store.state.hoSoDangMo = hs.ma; Store.state.tabDangMo = 'khachHang'; Store.luu(); ve(); },
      }, 'Mở hồ sơ xử lý')));

  document.body.append(el('div', { id: 'scrim', onclick: dongDrawer }));
  document.body.append(drawer);
}
function dongDrawer() { ['#scrim', '#drawer'].forEach(s => { const n = $(s); if (n) n.remove(); }); }

/* ==================================================== M-02 XỬ LÝ HỒ SƠ */
function veManHinhXuLy() {
  const hs = Store.timHoSo(Store.state.hoSoDangMo);
  const u = Store.state.user;
  const homNay = Store.state.ngayHeThong;
  const rr = tinhCoRuiRo(hs);
  const phuTrach = laNguoiPhuTrach(hs, u) && hs.buocHienTai !== 'ST-99';

  /* thanh tiến trình */
  const buoc = chuoiBuoc(hs);
  const idx = buoc.indexOf(hs.buocHienTai);
  const stepper = el('div', { class: 'stepper' }, ...buoc.map((b, i) => {
    const st = STEPS[b];
    const done = hs.buocHienTai === 'ST-99' ? i < buoc.length - 1 : i < idx;
    const now = i === idx;
    return el('div', { class: 'step ' + (now ? 'now' : done ? 'done' : '') },
      el('div', { class: 'dot' }, done ? '✓' : st.stt),
      el('div', { class: 'nm' }, st.ten.replace('Bước ', ''),
        el('div', { style: 'color:var(--ink-3)' }, st.vaiTro ? ROLES[st.vaiTro].tat : '')));
  }));

  /* tab */
  const TABS = [
    ['khachHang', 'Thông tin Khách hàng'],
    ['dvkd', 'Thông tin KSSV tại ĐVKD'],
    ['hoiSo', 'KSSV tại Hội sở'],
    ['taiLieu', 'Danh sách tài liệu'],
    ['lichSu', 'Lịch sử'],
    ['luongXuLy', 'Luồng xử lý'],
  ].filter(([k]) => cheDoTab(k, hs, u) !== 'an');

  let tabHienTai = Store.state.tabDangMo;
  if (!TABS.some(([k]) => k === tabHienTai)) tabHienTai = TABS[0][0];

  const tabs = el('div', { class: 'tabs' }, ...TABS.map(([k, t]) => el('button', {
    class: tabHienTai === k ? 'on' : '',
    onclick: () => { Store.state.tabDangMo = k; Store.luu(); ve(); },
  }, t,
     k === 'taiLieu' ? el('span', { class: 'cnt' }, hs.taiLieuDVKD.length) : null,
     k === 'lichSu' ? el('span', { class: 'cnt' }, hs.lichSu.length) : null)));

  /* nội dung tab */
  const cheDo = cheDoTab(tabHienTai, hs, u);
  let noiDung;
  switch (tabHienTai) {
    case 'khachHang': noiDung = tabKhachHang(hs, cheDo); break;
    case 'dvkd':      noiDung = tabDVKD(hs, u, cheDo); break;
    case 'hoiSo':     noiDung = tabHoiSo(hs, u, cheDo); break;
    case 'taiLieu':   noiDung = tabTaiLieu(hs, u, cheDo); break;
    case 'lichSu':    noiDung = tabLichSu(hs); break;
    default:          noiDung = tabLuongXuLy(hs);
  }

  /* dải thông báo ngữ cảnh */
  const banners = [];
  if (hs.lyDoTraLaiGanNhat)
    banners.push(el('div', { class: 'banner warn' },
      el('div', {}, el('b', {}, 'Hồ sơ vừa bị trả lại — '),
        hs.lyDoTraLaiGanNhat.lyDo,
        el('div', { class: 'note' }, `${hs.lyDoTraLaiGanNhat.nguoi} · ${dinhDangNgay(hs.lyDoTraLaiGanNhat.ngay)}`))));
  if (cheDo === 'xem' && phuTrach === false && !ROLES[u.vaiTro].chiXem && hs.buocHienTai !== 'ST-99')
    banners.push(el('div', { class: 'banner info' },
      el('div', {}, `Hồ sơ đang ở bước "${STEPS[hs.buocHienTai].ten}" thuộc vai trò `
        + `${ROLES[STEPS[hs.buocHienTai].vaiTro]?.ten}. Vai trò ${ROLES[u.vaiTro].ten} chỉ xem ở bước này.`,
        el('div', { class: 'rule' }, 'BR-329 — nút chỉ hiện khi đúng vai trò, đúng người phụ trách, đủ quyền'))));
  if (ROLES[u.vaiTro].chiXem)
    banners.push(el('div', { class: 'banner info' },
      el('div', {}, `Vai trò ${ROLES[u.vaiTro].ten} — chỉ xem, không có thao tác nghiệp vụ trên hồ sơ.`)));
  if (rr.coRuiRo)
    banners.push(el('div', { class: 'banner err' },
      el('div', {}, el('b', {}, 'Hồ sơ có dấu hiệu rủi ro. '),
        rr.lyDo.join(' · '),
        el('div', { class: 'rule' }, 'BR-506 — hệ thống tự xác định, hiển thị chỉ đọc'))));

  return el('div', {},
    el('div', { class: 'crumb' },
      el('a', { onclick: () => { Store.state.hoSoDangMo = null; Store.luu(); ve(); }, style: 'cursor:pointer' },
        'Danh sách hồ sơ'), ' › Xử lý hồ sơ'),
    el('div', { class: 'page-h' },
      el('div', {},
        el('h1', {}, hs.ma),
        el('p', {}, `${hs.tenKH} · ${hs.cif} · ${hs.tenLoai}`)),
      el('div', { class: 'sep' }),
      el('div', { style: 'display:flex;gap:6px;align-items:center' },
        chipTinhTrang(hs),
        el('span', { class: 'chip mute' }, 'Hạn KT: ' + dinhDangNgay(hanGanNhat(hs))),
        el('span', { class: 'chip ' + (hs.luongPD === 'Hội sở' ? 'info' : 'mute') }, 'Luồng ' + hs.luongPD),
        hs.coCoKhacPhuc ? el('span', { class: 'chip info' }, 'Đang khắc phục') : null)),
    el('div', { class: 'card' }, stepper, tabs,
      el('div', { class: 'body' }, ...banners, noiDung)),
    veThanhThaoTac(hs, u));
}

/* -------------------------------------------------- M-02 · tab Khách hàng */
function tabKhachHang(hs, cheDo) {
  const nhap = cheDo === 'nhap';
  const ro = (k, v) => el('div', { class: 'fld' }, el('label', {}, k), el('div', { class: 'ro' }, v || '—'));
  return el('div', {},
    el('div', { class: 'sec' }, 'Thông tin định danh — liên kết từ LOS, chỉ đọc'),
    el('div', { class: 'grid3' },
      ro('Mã hồ sơ phê duyệt (CAR)', hs.maCAR),
      ro('Tên khách hàng', hs.tenKH),
      ro('CIF khách hàng', hs.cif),
      ro('Chi nhánh', `${hs.maChiNhanh} — ${hs.tenChiNhanh}`),
      ro('Phòng giao dịch', `${hs.maPhong} — ${hs.tenPhong}`),
      ro('Gói hạn mức (FAC)', hs.maFAC)),
    el('div', { class: 'sec' }, 'Thông tin khoản cấp tín dụng — liên kết từ LOS / hệ thống giải ngân'),
    el('div', { class: 'grid3' },
      ro('Số khế ước nhận nợ', hs.dongLD.length ? hs.dongLD.map(d => d.maLD).join(', ') : 'Chưa phát sinh'),
      ro('Ngày giải ngân/phát hành đầu tiên', dinhDangNgay(hs.ngayGiaiNganDau)),
      ro('Sản phẩm vay', hs.sanPham),
      ro('User cán bộ bán hàng', Store.nguoiDung(hs.cbbhPhuTrach)?.hoTen || '—'),
      el('div', { class: 'fld' }, el('label', {}, 'Luồng phê duyệt'),
        el('div', { class: 'ro' }, hs.luongPD,
          el('div', { class: 'rule' }, 'BR-201 — kế thừa từ cấp phê duyệt của CAR trên LOS, không sửa được')))),
    el('div', { class: 'sec' }, 'Mục đích và sản phẩm vay'
      + (nhap ? ' — TNTD nhập/hoàn thiện theo Nghị quyết phê duyệt' : ' — chỉ đọc từ bước CBBH trở đi')),
    el('div', { class: 'fld' },
      el('label', {}, 'Mục đích vay ', el('span', { class: 'req' }, '*')),
      el('textarea', {
        disabled: !nhap, value: hs.mucDichVay || '',
        onchange: e => { hs.mucDichVay = e.target.value; Store.luu(); },
      })),
    !nhap ? el('div', { class: 'rule' }, 'BR-602 — chỉ cho phép sửa tại bước TNTD (ST-01)') : null);
}

/* ------------------------------------------------------ M-02 · tab ĐVKD */
function tabDVKD(hs, u, cheDo) {
  const sub = Store.state.subTab || 'sdv';
  const nhapTNTD = u.vaiTro === 'R1' && hs.buocHienTai === 'ST-01' && cheDo === 'nhap';
  const nhapCBBH = u.vaiTro === 'R2' && hs.buocHienTai === 'ST-02' && cheDo === 'nhap';

  const subTabs = el('div', { style: 'display:flex;gap:6px;margin-bottom:14px' },
    ...[['sdv', 'Kiểm tra mục đích sử dụng vốn'], ['dk', 'Tuân thủ điều kiện PD/sản phẩm']]
      .map(([k, t]) => el('button', {
        class: 'btn' + (sub === k ? ' pri' : ''),
        onclick: () => { Store.state.subTab = k; Store.luu(); ve(); },
      }, t)));

  return el('div', {}, subTabs,
    sub === 'sdv' ? subTabSDV(hs, nhapTNTD, nhapCBBH) : subTabDieuKien(hs, u, nhapTNTD, nhapCBBH, cheDo));
}

function subTabSDV(hs, nhapTNTD, nhapCBBH) {
  const homNay = Store.state.ngayHeThong;
  if (!hs.dongLD.length)
    return el('div', { class: 'empty' }, 'Hồ sơ chưa có khế ước nhận nợ / giao dịch phát hành nào');

  const rows = hs.dongLD.map((d, i) => {
    const han = hanCuaDong(d);
    const qh = !d.ngayThucHienKT && soNgayGiua(homNay, han) < 0;
    return el('tr', {},
      el('td', {}, hs.maCAR),
      el('td', {}, el('b', {}, d.maLD), el('div', { class: 'note' }, d.loai)),
      el('td', {}, dinhDangNgay(d.ngayNhanNo)),
      el('td', {}, (d.soTien / 1e6).toLocaleString('vi-VN') + ' tr'),
      el('td', { style: 'min-width:230px' },
        nhapTNTD
          ? el('textarea', {
              style: 'min-height:54px', value: d.chiTietMucDich || '',
              onchange: e => { d.chiTietMucDich = e.target.value; Store.luu(); },
            })
          : el('div', { style: 'font-size:12.5px' }, d.chiTietMucDich || el('i', { style: 'color:var(--err)' }, 'Chờ TNTD bổ sung'))),
      el('td', {}, dinhDangNgay(han),
        el('div', { class: 'note' }, d.loai === 'Bảo lãnh/LC' ? 'ngày phát hành + 90' : 'ngày nhận nợ + 30')),
      el('td', {}, d.ngayThucHienKT ? el('span', { class: 'chip ok' }, 'Hoàn thành')
        : qh ? el('span', { class: 'chip err' }, 'Quá hạn') : el('span', { class: 'chip mute' }, 'Chưa thực hiện')),
      el('td', {},
        nhapCBBH
          ? el('input', {
              type: 'date', value: d.ngayThucHienKT || '', max: homNay,
              onchange: e => { d.ngayThucHienKT = e.target.value; Store.luu(); ve(); },
            })
          : dinhDangNgay(d.ngayThucHienKT)),
      el('td', {},
        nhapCBBH
          ? el('select', {
              onchange: e => { d.ketQua = e.target.value || null; Store.luu(); ve(); },
            }, el('option', { value: '' }, '— chọn —'),
               ...DANH_MUC.ketQuaSDV.map(v => el('option', { value: v, selected: d.ketQua === v }, v)))
          : (d.ketQua
              ? el('span', { class: 'chip ' + (d.ketQua === 'Sai mục đích' ? 'err' : 'ok') }, d.ketQua)
              : '—')));
  });

  const coSai = hs.dongLD.some(d => d.ketQua === 'Sai mục đích');

  return el('div', {},
    el('div', { class: 'banner info' },
      el('div', {}, 'Mỗi khế ước nhận nợ là một dòng theo dõi riêng, có hạn kiểm tra riêng tính theo ngày nhận nợ của chính khế ước đó.',
        el('div', { class: 'rule' }, 'BR-202, BR-212 — 1 hồ sơ theo CAR ứng với 1..n LD'))),
    el('div', { style: 'overflow-x:auto' },
      el('table', {}, el('thead', {}, el('tr', {},
        ...['Mã CAR', 'Mã giải ngân (LD)', 'Ngày nhận nợ', 'Số tiền', 'Chi tiết mục đích giải ngân',
            'Hạn phải kiểm tra', 'Trạng thái', 'Ngày thực hiện KT', 'Kết quả'].map(h => el('th', {}, h)))),
        el('tbody', {}, ...rows))),
    coSai ? el('div', { class: 'fld', style: 'margin-top:14px' },
      el('label', {}, 'Đánh giá dấu hiệu rủi ro ', el('span', { class: 'req' }, '*'),
        ' — bắt buộc khi có kết quả "Sai mục đích"'),
      el('textarea', {
        disabled: !nhapCBBH,
        value: hs.dongLD.filter(d => d.danhGiaRuiRo).map(d => `${d.maLD}: ${d.danhGiaRuiRo}`).join('\n'),
        onchange: e => { if (hs.dongLD[0]) hs.dongLD[0].danhGiaRuiRo = e.target.value; Store.luu(); },
      })) : null,
    nhapCBBH ? el('div', { class: 'fld', style: 'margin-top:8px' },
      el('label', {}, el('input', {
        type: 'checkbox', style: 'width:auto;margin-right:7px',
        checked: hs.tichCoRuiRo,
        onchange: e => { hs.tichCoRuiRo = e.target.checked; Store.luu(); ve(); },
      }), 'Có rủi ro / dấu hiệu cần lưu ý')) : null);
}

function subTabDieuKien(hs, u, nhapTNTD, nhapCBBH, cheDo) {
  const rows = hs.dieuKien.map((d, i) => el('tr', {},
    el('td', {}, i + 1),
    el('td', { style: 'min-width:260px' },
      nhapTNTD
        ? el('textarea', { style: 'min-height:54px', value: d.noiDung,
            onchange: e => { d.noiDung = e.target.value; Store.luu(); } })
        : el('div', { style: 'font-size:12.5px' }, d.noiDung)),
    el('td', {}, nhapTNTD
      ? el('input', { type: 'number', min: 0, style: 'width:78px', value: d.thoiGianYeuCau,
          onchange: e => { d.thoiGianYeuCau = +e.target.value; Store.luu(); } })
      : d.thoiGianYeuCau + ' ngày'),
    el('td', {}, d.tanSuat),
    el('td', { style: 'min-width:170px;font-size:12.5px' }, d.cheTai),
    el('td', {}, nhapCBBH
      ? el('select', { onchange: e => { d.ketQua = e.target.value || null; Store.luu(); ve(); } },
          el('option', { value: '' }, '— chọn —'),
          ...DANH_MUC.ketQuaDieuKien.map(v => el('option', { value: v, selected: d.ketQua === v }, v)))
      : (d.ketQua ? el('span', { class: 'chip ' + (d.ketQua === 'Vi phạm' ? 'err' : d.ketQua === 'Tuân thủ' ? 'ok' : 'mute') }, d.ketQua) : '—')),
    el('td', {}, dinhDangNgay(d.ngayKTGanNhat))));

  const khoi = (tieuDe, o, key) => el('div', {},
    el('div', { class: 'sec' }, tieuDe),
    el('div', { class: 'grid3' },
      el('div', { class: 'fld' }, el('label', {}, 'Kết quả ', el('span', { class: 'req' }, '*')),
        nhapCBBH
          ? el('select', { onchange: e => { o.ketQua = e.target.value || null; Store.luu(); ve(); } },
              el('option', { value: '' }, '— chọn —'),
              ...DANH_MUC.ketQuaHDKD.map(v => el('option', { value: v, selected: o.ketQua === v }, v)))
          : el('div', { class: 'ro' }, o.ketQua || '—')),
      el('div', { class: 'fld' }, el('label', {}, 'Tài liệu cung cấp'),
        nhapCBBH
          ? el('select', { onchange: e => { o.taiLieu = e.target.value || null; Store.luu(); ve(); } },
              el('option', { value: '' }, '— chọn —'),
              ...DANH_MUC.taiLieuHopLe.map(v => el('option', { value: v, selected: o.taiLieu === v }, v)))
          : el('div', { class: 'ro' }, o.taiLieu || '—')),
      el('div', { class: 'fld' }, el('label', {}, 'Ngày thực hiện kiểm tra'),
        nhapCBBH
          ? el('input', { type: 'date', value: o.ngayKT || '', max: Store.state.ngayHeThong,
              onchange: e => { o.ngayKT = e.target.value; Store.luu(); } })
          : el('div', { class: 'ro' }, dinhDangNgay(o.ngayKT)))),
    o.ketQua === 'Có dấu hiệu rủi ro'
      ? el('div', { class: 'fld' }, el('label', {}, 'Chi tiết đánh giá dấu hiệu rủi ro ', el('span', { class: 'req' }, '*')),
          el('textarea', { disabled: !nhapCBBH, value: o.chiTiet || '',
            onchange: e => { o.chiTiet = e.target.value; Store.luu(); } }))
      : null);

  const cheDoKP = cheDoKhoiKhacPhuc(hs, u);

  return el('div', {},
    el('div', { style: 'overflow-x:auto' },
      el('table', {}, el('thead', {}, el('tr', {},
        ...['STT', 'Nội dung điều kiện', 'Thời gian yêu cầu', 'Tần suất', 'Chế tài nếu vi phạm',
            'Kết quả KT/ĐG', 'KT gần nhất'].map(h => el('th', {}, h)))),
        el('tbody', {}, ...rows))),
    nhapTNTD ? el('button', {
      class: 'btn sm', style: 'margin-top:9px',
      onclick: () => { hs.dieuKien.push({ noiDung: '', thoiGianYeuCau: 30, cheTai: '', tanSuat: 'Thời điểm', ketQua: null, ngayKTGanNhat: null, taiLieu: [] }); Store.luu(); ve(); },
    }, '+ Thêm điều kiện') : null,
    khoi('Kiểm tra tình hình hoạt động kinh doanh', hs.hdkd),
    khoi('Kiểm tra tài sản bảo đảm', hs.tsbd),
    cheDoKP !== 'an' ? khoiKhacPhuc(hs, cheDoKP) : null);
}

function khoiKhacPhuc(hs, cheDo) {
  const nhap = cheDo === 'nhap';
  if (!hs.phuongAnKhacPhuc)
    hs.phuongAnKhacPhuc = { noiDung: '', capPheDuyet: hs.luongPD === 'Chi nhánh' ? 'GĐ/PGĐ chi nhánh' : 'Cấp phê duyệt Hội sở',
      ngayCapNhat: Store.state.ngayHeThong, cheTaiTrongKP: '', thoiGianKhacPhuc: '', trangThai: 'Đang trình' };
  const pa = hs.phuongAnKhacPhuc;

  const theoDoi = pa.trangThai === 'Đã được duyệt, đang thực hiện' || pa.trangThai === 'Đã khắc phục xong';

  return el('div', {},
    el('div', { class: 'sec' }, 'Phương án khắc phục'),
    el('div', { class: 'rule', style: 'margin-bottom:9px' },
      'BR-510 — khối này chỉ hiển thị khi hồ sơ có vi phạm hoặc dấu hiệu rủi ro'),
    el('div', { class: 'fld' }, el('label', {}, 'Nội dung phương án khắc phục ', el('span', { class: 'req' }, '*')),
      el('textarea', { disabled: !nhap, value: pa.noiDung,
        onchange: e => { pa.noiDung = e.target.value; Store.luu(); } })),
    el('div', { class: 'grid3' },
      el('div', { class: 'fld' }, el('label', {}, 'Cấp phê duyệt'),
        el('div', { class: 'ro' }, pa.capPheDuyet,
          el('div', { class: 'rule' }, 'BR-511 — hệ thống xác định, không nhập tay'))),
      el('div', { class: 'fld' }, el('label', {}, 'Thời gian khắc phục ', el('span', { class: 'req' }, '*')),
        nhap ? el('input', { type: 'date', value: pa.thoiGianKhacPhuc || '',
          onchange: e => { pa.thoiGianKhacPhuc = e.target.value; Store.luu(); } })
             : el('div', { class: 'ro' }, dinhDangNgay(pa.thoiGianKhacPhuc))),
      el('div', { class: 'fld' }, el('label', {}, 'Trạng thái phương án'),
        nhap ? el('select', { onchange: e => { pa.trangThai = e.target.value; hs.coCoKhacPhuc = e.target.value !== 'Đã khắc phục xong'; Store.luu(); ve(); } },
            ...DANH_MUC.trangThaiPA.map(v => el('option', { value: v, selected: pa.trangThai === v }, v)))
             : el('div', { class: 'ro' }, pa.trangThai))),
    theoDoi ? el('div', {},
      el('div', { class: 'sec' }, 'Tình hình thực hiện phương án khắc phục'),
      (() => {
        const qh = pa.thoiGianKhacPhuc && soNgayGiua(Store.state.ngayHeThong, pa.thoiGianKhacPhuc) < 0;
        return el('div', { class: 'banner ' + (qh ? 'err' : 'ok') },
          el('div', {}, qh ? 'QUÁ HẠN KHẮC PHỤC — hồ sơ tự động đưa vào Báo cáo theo dõi tình trạng khắc phục (BR-305)'
                           : 'Trong hạn khắc phục'));
      })(),
      ...hs.theoDoiKhacPhuc.map(t => el('div', { style: 'border:1px solid var(--line);border-radius:6px;padding:11px;margin-bottom:9px' },
        el('div', { class: 'grid3' },
          el('div', { class: 'fld' }, el('label', {}, 'Ngày cập nhật'), el('div', { class: 'ro' }, dinhDangNgay(t.ngayCapNhat))),
          el('div', { class: 'fld' }, el('label', {}, 'Tình trạng khắc phục'), el('div', { class: 'ro' }, t.tinhTrang)),
          el('div', { class: 'fld' }, el('label', {}, 'Ngày báo cáo lên Phòng KSSV'),
            nhap ? el('input', { type: 'date', value: t.ngayBaoCaoKSSV || '',
              onchange: e => { t.ngayBaoCaoKSSV = e.target.value; Store.luu(); } })
                 : el('div', { class: 'ro' }, dinhDangNgay(t.ngayBaoCaoKSSV)))),
        el('div', { class: 'fld', style: 'margin:0' }, el('label', {}, 'Nội dung chưa khắc phục được'),
          el('div', { class: 'ro' }, t.noiDungChua || '—')))),
      nhap ? el('button', { class: 'btn sm', onclick: () => {
        hs.theoDoiKhacPhuc.push({ ngayCapNhat: Store.state.ngayHeThong, tinhTrang: 'Chưa', noiDungChua: '', ngayBaoCaoKSSV: null });
        Store.luu(); ve();
      } }, '+ Thêm lần cập nhật') : null,
      el('div', { class: 'rule' }, 'AMB-06 — CBBH tự cập nhật và tự đóng, không có bước trình duyệt trạng thái')) : null);
}

/* ---------------------------------------------------- M-02 · tab Hội sở */
function tabHoiSo(hs, u, cheDo) {
  const nhap = cheDo === 'nhap';
  if (!hs.ykienKSSV) hs.ykienKSSV = { ketLuan: '', ykien: '', kienNghi: '' };
  const y = hs.ykienKSSV;

  return el('div', {},
    el('div', { class: 'banner info' },
      el('div', {}, 'Tab này chỉ hiển thị với hồ sơ thuộc luồng phê duyệt Hội sở. '
        + 'R5/R6/R7 nhập ý kiến độc lập; R2/R3/R4 chỉ xem.',
        el('div', { class: 'rule' }, 'BR-504'))),
    el('div', { class: 'sec' }, 'Ý kiến độc lập của Phòng KSSV'),
    el('div', { class: 'fld' }, el('label', {}, 'Kết luận của Phòng KSSV'),
      nhap ? el('select', { onchange: e => { y.ketLuan = e.target.value; Store.luu(); } },
          el('option', { value: '' }, '— chọn —'),
          ...['Đồng ý với đánh giá của ĐVKD', 'Không đồng ý, đánh giá lại mức độ rủi ro', 'Yêu cầu bổ sung hồ sơ']
            .map(v => el('option', { value: v, selected: y.ketLuan === v }, v)))
           : el('div', { class: 'ro' }, y.ketLuan || '—')),
    el('div', { class: 'fld' }, el('label', {}, 'Ý kiến chi tiết'),
      el('textarea', { disabled: !nhap, value: y.ykien || '',
        onchange: e => { y.ykien = e.target.value; Store.luu(); } })),
    el('div', { class: 'fld' }, el('label', {}, 'Kiến nghị chế tài / biện pháp bổ sung'),
      el('textarea', { disabled: !nhap, value: y.kienNghi || '',
        onchange: e => { y.kienNghi = e.target.value; Store.luu(); } })),

    hs.deXuatCapPD ? el('div', {},
      el('div', { class: 'sec' }, 'Đề xuất luồng phê duyệt mở rộng'),
      el('div', { class: 'kv' },
        el('div', { class: 'k' }, 'Các cấp đã đề xuất'),
        el('div', { class: 'v' }, hs.deXuatCapPD.capDaChon.map(c => el('span', { class: 'chip info', style: 'margin-right:5px' }, c))),
        el('div', { class: 'k' }, 'Lý do đề xuất'),
        el('div', { class: 'v' }, hs.deXuatCapPD.lyDo || '—'))) : null,

    hs.buocHienTai === 'ST-08' && u.vaiTro === 'R6' ? el('div', {},
      el('div', { class: 'sec' }, 'Phương án phê duyệt — thư ký ghi nhận'),
      el('div', { class: 'banner warn' },
        el('div', {}, 'Cấp phê duyệt mở rộng xử lý hoàn toàn NGOÀI hệ thống trên hồ sơ giấy. '
          + 'Thư ký nhập lại kết quả đã được duyệt.')),
      (() => {
        if (!hs.phuongAnPheDuyet) hs.phuongAnPheDuyet = { noiDung: '', capDaDuyet: '', soVanBan: '', ngayPheDuyet: '' };
        const p = hs.phuongAnPheDuyet;
        return el('div', {},
          el('div', { class: 'fld' }, el('label', {}, 'Nội dung phương án phê duyệt ', el('span', { class: 'req' }, '*')),
            el('textarea', { value: p.noiDung, onchange: e => { p.noiDung = e.target.value; Store.luu(); ve(); } })),
          el('div', { class: 'grid3' },
            el('div', { class: 'fld' }, el('label', {}, 'Cấp phê duyệt thực tế đã duyệt'),
              el('select', { onchange: e => { p.capDaDuyet = e.target.value; Store.luu(); } },
                el('option', { value: '' }, '— chọn —'),
                ...(hs.deXuatCapPD?.capDaChon || []).map(c => el('option', { value: c, selected: p.capDaDuyet === c }, c)))),
            el('div', { class: 'fld' }, el('label', {}, 'Số văn bản / Nghị quyết'),
              el('input', { value: p.soVanBan, onchange: e => { p.soVanBan = e.target.value; Store.luu(); } })),
            el('div', { class: 'fld' }, el('label', {}, 'Ngày phê duyệt'),
              el('input', { type: 'date', value: p.ngayPheDuyet, onchange: e => { p.ngayPheDuyet = e.target.value; Store.luu(); } }))));
      })()) : null);
}

/* -------------------------------------------------- M-02 · tab Tài liệu */
function tabTaiLieu(hs, u, cheDo) {
  const nhap = cheDo === 'nhap';
  return el('div', {},
    el('div', { class: 'sec' }, 'Danh sách tài liệu (ĐVKD)'),
    hs.taiLieuDVKD.length
      ? el('table', {}, el('thead', {}, el('tr', {},
          ...['STT', 'Loại tài liệu', 'Tên tài liệu', 'Người tải lên', 'Thời gian', 'Dung lượng', ''].map(h => el('th', {}, h)))),
          el('tbody', {}, ...hs.taiLieuDVKD.map((t, i) => el('tr', {},
            el('td', {}, i + 1),
            el('td', {}, t.loai),
            el('td', {}, el('a', {}, t.ten)),
            el('td', {}, t.nguoiTai),
            el('td', {}, t.thoiGian),
            el('td', {}, t.dungLuong),
            el('td', {}, nhap ? el('button', {
              class: 'btn sm',
              onclick: () => xacNhan('Xóa tài liệu', `Xóa "${t.ten}"?`, () => {
                hs.taiLieuDVKD.splice(i, 1); Store.luu(); ve();
              }, 'Xóa'),
            }, 'Xóa') : null)))))
      : el('div', { class: 'empty' }, 'Chưa có tài liệu nào'),
    nhap ? el('div', { style: 'margin-top:12px;display:flex;gap:8px;align-items:flex-end' },
      el('div', { class: 'fld', style: 'margin:0;min-width:300px' },
        el('label', {}, 'Loại tài liệu ', el('span', { class: 'req' }, '*')),
        el('select', { id: 'loaiTL' }, ...DANH_MUC.loaiTaiLieu.map(v => el('option', { value: v }, v)))),
      el('button', { class: 'btn', onclick: () => {
        const loai = $('#loaiTL').value;
        hs.taiLieuDVKD.push({
          ten: 'Tai_lieu_' + (hs.taiLieuDVKD.length + 1) + '.pdf', loai,
          nguoiTai: u.hoTen, thoiGian: Store.state.ngayHeThong + ' 09:00', dungLuong: '820 KB',
        });
        Store.luu(); ve();
      } }, 'Tải tài liệu lên (mô phỏng)')) : null,
    el('div', { class: 'rule', style: 'margin-top:9px' },
      'BR-507 — số tệp tối đa cấu hình theo từng loại tài liệu; BR-513 — không được chuyển bước khi danh sách tài liệu trống'));
}

/* -------------------------------------------------- M-02 · tab Lịch sử */
function tabLichSu(hs) {
  return el('table', {}, el('thead', {}, el('tr', {},
    ...['STT', 'Bước xử lý', 'Người xử lý', 'Bắt đầu', 'Kết thúc', 'Hành động', 'Kết quả', 'Lý do'].map(h => el('th', {}, h)))),
    el('tbody', {}, ...hs.lichSu.map((l, i) => el('tr', {},
      el('td', {}, i + 1),
      el('td', {}, l.buoc === '—' ? '—' : `${l.buoc} · ${STEPS[l.buoc]?.ten || ''}`),
      el('td', {}, l.nguoi, el('div', { class: 'note' }, l.vaiTro)),
      el('td', {}, l.batDau),
      el('td', {}, l.ketThuc || '—'),
      el('td', {}, l.hanhDong),
      el('td', {}, l.ketQua),
      el('td', { style: 'max-width:240px;font-size:12.5px' }, l.lyDo || '—')))));
}

/* ----------------------------------------------- M-02 · tab Luồng xử lý */
function tabLuongXuLy(hs) {
  const buoc = chuoiBuoc(hs);
  const idx = buoc.indexOf(hs.buocHienTai);
  return el('div', {},
    el('div', { class: 'banner info' },
      el('div', {}, `Hồ sơ đang đi theo nhánh: `, el('b', {},
        hs.luongPD === 'Chi nhánh' ? 'Thẩm quyền chi nhánh' : 'Vượt thẩm quyền chi nhánh — luồng Hội sở'))),
    ...buoc.map((b, i) => {
      const st = STEPS[b];
      const ngoai = false;
      const done = hs.buocHienTai === 'ST-99' ? i < buoc.length - 1 : i < idx;
      return el('div', {
        style: `border:1px solid ${i === idx ? 'var(--pg)' : 'var(--line)'};border-radius:6px;padding:10px 12px;
                margin-bottom:8px;background:${i === idx ? 'var(--pg-light)' : '#fff'}`,
      },
        el('div', { style: 'display:flex;gap:9px;align-items:center' },
          el('span', { class: 'chip ' + (i === idx ? 'info' : done ? 'ok' : 'mute') }, 'Bước ' + st.stt),
          el('b', { style: 'font-size:13px' }, st.ten),
          el('span', { style: 'flex:1' }),
          el('span', { class: 'note' }, st.vaiTro ? ROLES[st.vaiTro].ten : '—')));
    }),
    hs.luongPD === 'Hội sở' ? el('div', {
      style: 'border:1.5px dashed #e69500;border-radius:6px;padding:10px 12px;background:#fffaf2',
    }, el('b', {}, 'Cấp phê duyệt mở rộng — XỬ LÝ NGOÀI HỆ THỐNG'),
       el('div', { class: 'note' }, 'Giám đốc Khối · PTGĐ · TGĐ · Hội đồng tín dụng · Hội đồng rủi ro · HĐQT. '
         + 'Hệ thống chỉ ghi nhận đề xuất và kết quả do thư ký nhập lại.')) : null);
}

/* ------------------------------------------------ M-02 · thanh thao tác */
function veThanhThaoTac(hs, u) {
  const nut = nutKhaDung(hs, u);
  const st = STEPS[hs.buocHienTai];

  const nutEls = nut.map(t => el('button', {
    class: 'btn ' + (t.kieu === 'tralai' ? 'warn' : 'pri'),
    disabled: t.voHieu,
    title: t.voHieu ? (t.ghiChu || '') : '',
    onclick: () => thucHienChuyenBuoc(hs, t),
  }, t.nhan));

  /* Chú thích lý do cho nút đang bị vô hiệu — BR-302, BR-328 */
  const lyDoVoHieu = nut.filter(t => t.voHieu && t.ghiChu)
    .map(t => el('div', {}, el('b', {}, t.nhan + ': '), t.ghiChu));

  /* panel phân công của Trưởng BP KSSV */
  const panelPhanCong = (hs.buocHienTai === 'ST-05H' && u.vaiTro === 'R5')
    ? el('div', { class: 'card' },
        el('h3', {}, 'Phân công xử lý hồ sơ'),
        el('div', { class: 'body' },
          el('div', { class: 'fld' }, el('label', {}, 'Phương thức xử lý ', el('span', { class: 'req' }, '*')),
            el('select', { onchange: e => { hs.phuongThucXuLy = e.target.value; Store.luu(); ve(); } },
              ...['Phân công cho cán bộ', 'Tự xử lý'].map(v =>
                el('option', { value: v, selected: hs.phuongThucXuLy === v }, v)))),
          hs.phuongThucXuLy === 'Phân công cho cán bộ'
            ? el('div', { class: 'fld' }, el('label', {}, 'Cán bộ KSSV phụ trách ', el('span', { class: 'req' }, '*')),
                el('select', { onchange: e => { hs.cbKssvPhuTrach = e.target.value || null; Store.luu(); ve(); } },
                  el('option', { value: '' }, '— chọn cán bộ —'),
                  ...USERS.filter(x => x.vaiTro === 'R6').map(x => el('option', {
                    value: x.id, selected: hs.cbKssvPhuTrach === x.id,
                  }, `${x.hoTen} — đang xử lý ${Store.state.hoSo.filter(h => h.cbKssvPhuTrach === x.id && h.buocHienTai !== 'ST-99').length} hồ sơ`))))
            : el('div', { class: 'banner info' }, el('div', {},
                'Trưởng bộ phận trực tiếp xử lý như một cán bộ KSSV, sau đó trình Lãnh đạo Phòng KSSV phê duyệt. '
                + 'Không vi phạm nguyên tắc bốn mắt vì người tự xử lý không phê duyệt kết quả của chính mình (BR-540).'))))
    : null;

  return el('div', {}, panelPhanCong,
    lyDoVoHieu.length ? el('div', { class: 'banner warn', style: 'margin-top:14px;margin-bottom:0' },
      el('div', {}, el('b', {}, 'Thao tác đang bị vô hiệu hóa'), ...lyDoVoHieu)) : null,
    el('div', { id: 'actionbar' },
      el('div', { class: 'info' },
        el('b', {}, 'Bước hiện tại: ' + (st ? st.ten : '—')),
        el('div', {}, hs.buocHienTai === 'ST-99'
          ? 'Hồ sơ đã hoàn thành — không còn thao tác.'
          : nut.length ? 'Chọn thao tác để chuyển hồ sơ sang bước tiếp theo.'
                       : `Vai trò ${ROLES[u.vaiTro].ten} không có thao tác ở bước này.`)),
      el('div', { class: 'sep' }),
      nut.length ? el('button', { class: 'btn', onclick: () => { Store.luu(); alert('Đã lưu nháp.'); } }, 'Lưu') : null,
      ...nutEls));
}

function thucHienChuyenBuoc(hs, t) {
  /* BR-513 — chặn chuyển bước khi danh sách tài liệu trống */
  if (t.kieu === 'chinh' && hs.buocHienTai === 'ST-02' && !hs.taiLieuDVKD.length) {
    moModal('Không thể chuyển bước',
      el('div', { class: 'banner err' }, el('div', {},
        'Danh sách tài liệu đang trống. Phải đính kèm tối thiểu một tài liệu minh chứng trước khi trình phê duyệt.',
        el('div', { class: 'rule' }, 'BR-513'))),
      [el('button', { class: 'btn pri', onclick: dongModal }, 'Đã hiểu')]);
    return;
  }
  /* BR-320 — kết quả kiểm tra bắt buộc */
  if (t.kieu === 'chinh' && hs.buocHienTai === 'ST-02') {
    const thieu = hs.dongLD.filter(d => !d.ketQua).map(d => d.maLD);
    if (thieu.length) {
      moModal('Thiếu dữ liệu bắt buộc',
        el('div', { class: 'banner err' }, el('div', {},
          'Chưa nhập kết quả kiểm tra cho các khế ước: ' + thieu.join(', '),
          el('div', { class: 'rule' }, 'BR-320'))),
        [el('button', { class: 'btn pri', onclick: dongModal }, 'Đã hiểu')]);
      return;
    }
  }

  /* Trả lại — bắt buộc nhập lý do tối thiểu 20 ký tự (BR-307) */
  if (t.kieu === 'tralai') {
    const ta = el('textarea', { style: 'width:100%;min-height:90px', placeholder: 'Nhập lý do trả lại (tối thiểu 20 ký tự)...' });
    moModal(t.nhan, el('div', {},
      el('p', { style: 'margin:0 0 9px;font-size:13px' },
        `Hồ sơ sẽ được chuyển về bước "${STEPS[t.den].ten}". Dữ liệu đã nhập ở các bước sau được giữ nguyên (BR-308).`),
      ta), [
      el('button', { class: 'btn', onclick: dongModal }, 'Hủy'),
      el('button', { class: 'btn pri', onclick: () => {
        if (ta.value.trim().length < 20) { alert('Lý do trả lại phải có tối thiểu 20 ký tự (BR-307).'); return; }
        dongModal(); Store.chuyenBuoc(hs, t, ta.value.trim()); ve();
      } }, 'Xác nhận trả lại'),
    ]);
    return;
  }

  /* Popup đề xuất cấp phê duyệt mở rộng — BR-326 */
  if (t.moPopup === 'deXuatCapPD') return popupDeXuatCapPD(hs, t);

  const rr = tinhCoRuiRo(hs);
  const moTa = t.den === 'ST-99'
    ? 'Thao tác này KẾT THÚC luồng xử lý của hồ sơ.'
      + (rr.coRuiRo ? ' Cờ "Đang theo dõi khắc phục" sẽ được bật và chạy song song (BR-214).' : '')
      + ((hs.loai === 'L1' || hs.loai === 'L2') ? ' Hệ thống sẽ tự sinh kỳ kiểm tra định kỳ tiếp theo (BR-205).' : '')
    : `Hồ sơ sẽ chuyển sang bước "${STEPS[t.den].ten}" — ${ROLES[STEPS[t.den].vaiTro]?.ten || ''}.`;

  xacNhan(t.nhan, moTa, () => { Store.chuyenBuoc(hs, t, ''); ve(); });
}

function popupDeXuatCapPD(hs, t) {
  const chon = new Set(hs.deXuatCapPD?.capDaChon || []);
  const ta = el('textarea', { style: 'width:100%;min-height:66px', value: hs.deXuatCapPD?.lyDo || '' });
  const dem = el('div', { class: 'note' });
  const capNhatDem = () => dem.textContent = `Đã chọn ${chon.size} cấp phê duyệt`;

  const nhomEls = Object.entries(DANH_MUC.capPDMoRong).map(([nhom, ds]) =>
    el('div', {}, el('div', { class: 'sec' }, nhom),
      ...ds.map(c => el('label', { style: 'display:block;padding:4px 0;font-size:13px' },
        el('input', {
          type: 'checkbox', style: 'margin-right:8px', checked: chon.has(c),
          onchange: e => { e.target.checked ? chon.add(c) : chon.delete(c); capNhatDem(); },
        }), c))));
  capNhatDem();

  moModal('Đề xuất luồng phê duyệt mở rộng', el('div', {},
    el('div', { class: 'banner warn' }, el('div', {},
      'Luồng phê duyệt mở rộng thực hiện NGOÀI hệ thống. Mục này chỉ ghi nhận đề xuất; '
      + 'ở mọi cấp, Cán bộ Phòng KSSV đóng vai trò thư ký.')),
    ...nhomEls,
    el('div', { class: 'fld', style: 'margin-top:12px' },
      el('label', {}, 'Lý do / căn cứ đề xuất (không bắt buộc)'), ta),
    dem), [
    el('button', { class: 'btn', onclick: dongModal }, 'Hủy'),
    el('button', { class: 'btn pri', onclick: () => {
      hs.deXuatCapPD = { capDaChon: [...chon], lyDo: ta.value.trim() };
      dongModal(); Store.chuyenBuoc(hs, t, ''); ve();
    } }, 'Chuyển Lãnh đạo KSSV duyệt'),
  ]);
}

/* ======================================================== M-03 BÁO CÁO */
function veBaoCao() {
  const s = Store.state;
  const loai = s.baoCao || 'kp';
  const ds = Store.hoSoTheoPhamVi();

  const nut = (k, t) => el('button', {
    class: 'btn' + (loai === k ? ' pri' : ''),
    onclick: () => { s.baoCao = k; Store.luu(); ve(); },
  }, t);

  let bang;
  if (loai === 'kp') {
    const rows = ds.filter(h => h.phuongAnKhacPhuc).map((h, i) => {
      const pa = h.phuongAnKhacPhuc;
      const qh = pa.thoiGianKhacPhuc && soNgayGiua(s.ngayHeThong, pa.thoiGianKhacPhuc) < 0;
      const td = h.theoDoiKhacPhuc[h.theoDoiKhacPhuc.length - 1];
      return el('tr', {}, el('td', {}, i + 1), el('td', {}, h.cif), el('td', {}, h.tenKH),
        el('td', {}, h.ma), el('td', {}, h.dongLD[0]?.maLD || '—'), el('td', {}, h.tenChiNhanh),
        el('td', {}, h.tenPhong), el('td', {}, Store.nguoiDung(h.cbbhPhuTrach)?.hoTen || '—'),
        el('td', {}, pa.capPheDuyet), el('td', {}, h.sanPham),
        el('td', { style: 'max-width:250px;font-size:12.5px' }, pa.noiDung),
        el('td', {}, dinhDangNgay(pa.thoiGianKhacPhuc)),
        el('td', {}, td ? td.tinhTrang : '—'),
        el('td', { style: 'max-width:200px;font-size:12.5px' }, td?.noiDungChua || '—'),
        el('td', {}, qh ? el('span', { class: 'chip err' }, 'Quá hạn') : el('span', { class: 'chip ok' }, 'Trong hạn')),
        el('td', { style: 'max-width:200px;font-size:12.5px' }, h.ykienKSSV?.ykien || '—'));
    });
    bang = el('div', { style: 'overflow-x:auto' }, el('table', {},
      el('thead', {}, el('tr', {}, ...['STT', 'CIF', 'Tên khách hàng', 'Mã hồ sơ', 'Mã khoản vay',
        'Chi nhánh', 'PGD', 'CB kinh doanh', 'Cấp PD', 'Sản phẩm', 'Phương án khắc phục',
        'Thời hạn hoàn thành', 'Tình trạng khắc phục', 'Khó khăn vướng mắc', 'Dấu hiệu rủi ro',
        'Ý kiến Phòng KSSV'].map(h => el('th', {}, h)))),
      el('tbody', {}, ...(rows.length ? rows : [el('tr', {}, el('td', { colspan: 16, class: 'empty' },
        'Không có hồ sơ nào có phương án khắc phục trong kỳ'))]))));
  } else {
    const rows = ds.map((h, i) => {
      const dong = h.dongLD[0];
      const dk = h.dieuKien[0];
      const axSDV = dong?.ketQua ? ANH_XA_BAO_CAO.ketQuaSDV[dong.ketQua] : '';
      const axDK = dk?.ketQua ? ANH_XA_BAO_CAO.ketQuaDieuKien[dk.ketQua] : '';
      const tt = tinhTinhTrang(h, s.ngayHeThong);
      return el('tr', {}, el('td', {}, i + 1), el('td', {}, h.maChiNhanh), el('td', {}, h.tenChiNhanh),
        el('td', {}, h.cif), el('td', {}, h.tenKH),
        el('td', {}, Store.nguoiDung(h.cbbhPhuTrach)?.hoTen || '—'),
        el('td', {}, h.luongPD), el('td', {}, h.sanPham),
        el('td', {}, dinhDangNgay(hanGanNhat(h))),
        el('td', {}, tt === 'Hoàn thành' ? 'Đã hoàn thành' : tt === 'Quá hạn' ? 'Chưa hoàn thành' : 'Đang thực hiện'),
        el('td', {}, dinhDangNgay(dong?.ngayThucHienKT)),
        el('td', {}, axSDV || el('span', { style: 'color:var(--ink-3)' }, '(trống)')),
        el('td', {}, h.hdkd?.ketQua || ''),
        el('td', {}, axDK || el('span', { style: 'color:var(--ink-3)' }, '(trống)')),
        el('td', {}, h.tsbd?.ketQua === 'Có dấu hiệu rủi ro' ? 'Có rủi ro' : 'Không có rủi ro'));
    });
    bang = el('div', { style: 'overflow-x:auto' }, el('table', {},
      el('thead', {}, el('tr', {}, ...['STT', 'Mã CN', 'Tên chi nhánh', 'Mã KH', 'Tên khách hàng',
        'User RM', 'Cấp PD', 'Sản phẩm', 'Ngày đến hạn KTKSSV', 'Tình trạng (0)', 'Ngày thực hiện',
        'Mục đích SDV (1)', 'HĐKD (2)', 'Tuân thủ ĐK (3)', 'TSBĐ (4)'].map(h => el('th', {}, h)))),
      el('tbody', {}, ...rows)));
  }

  return el('div', {},
    el('div', { class: 'crumb' }, 'Kiểm soát sau vay › Báo cáo tổng hợp'),
    el('div', { class: 'page-h' },
      el('div', {}, el('h1', {}, 'Báo cáo tổng hợp KSSV'),
        el('p', {}, 'Kết xuất theo biểu mẫu quy định, phạm vi dữ liệu theo phân quyền của người dùng')),
      el('div', { class: 'sep' }),
      el('button', { class: 'btn', onclick: () => alert('Kết xuất PDF theo bố cục biểu mẫu (mô phỏng).') }, 'In / Xuất PDF'),
      el('button', { class: 'btn', onclick: () => alert('Kết xuất Excel đúng cấu trúc biểu mẫu (mô phỏng).') }, 'Xuất Excel')),
    el('div', { class: 'card' }, el('div', { class: 'body' },
      el('div', { class: 'filters' },
        nut('kp', 'Theo dõi tình trạng khắc phục — MB.BCTDKP.08'),
        nut('th', 'Tình hình thực hiện KSSV — MB03.QTH-RR.TD.GS/04')))),
    loai === 'th' ? el('div', { class: 'banner info' }, el('div', {},
      'Cột (1) và (3) hiển thị theo bảng ánh xạ BR-522: giá trị "Chưa đến kỳ" của nhập liệu được ánh xạ thành ô trống trên báo cáo.')) : null,
    el('div', { class: 'card' }, bang));
}
