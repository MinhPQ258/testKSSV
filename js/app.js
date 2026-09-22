/* ============================================================================
 * KSSV Prototype — app.js  (vỏ ứng dụng, đăng nhập giả, dev bar, điều hướng)
 * ==========================================================================*/

const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'html') n.innerHTML = attrs[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false)
      n.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) n.append(c.nodeType ? c : String(c)); });
  return n;
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------------------------------------------------------- MODAL */
function moModal(tieuDe, noiDungEl, nutList) {
  dongModal();
  const box = el('div', { class: 'box' },
    el('div', { class: 'hd' }, el('h3', {}, tieuDe)),
    el('div', { class: 'bd' }, noiDungEl),
    el('div', { class: 'ft' }, ...nutList));
  const m = el('div', { id: 'modal', onclick: e => { if (e.target.id === 'modal') dongModal(); } }, box);
  document.body.append(m);
}
function dongModal() { const m = $('#modal'); if (m) m.remove(); }

function xacNhan(tieuDe, moTa, onOk, nhanOk = 'Xác nhận') {
  moModal(tieuDe, el('div', {}, el('p', { style: 'margin:0;font-size:13.5px' }, moTa)), [
    el('button', { class: 'btn', onclick: dongModal }, 'Hủy'),
    el('button', { class: 'btn pri', onclick: () => { dongModal(); onOk(); } }, nhanOk),
  ]);
}

/* ------------------------------------------------------------- ĐĂNG NHẬP */
function veDangNhap() {
  document.body.innerHTML = '';
  const ds = USERS.map(u => el('div', { class: 'u', onclick: () => { Store.state.user = u; Store.luu(); ve(); } },
    el('div', { class: 'av' }, u.hoTen.split(' ').pop()[0]),
    el('div', {}, el('b', {}, u.hoTen), el('span', {}, `${ROLES[u.vaiTro].ten} · ${u.tenPhong}, ${u.tenChiNhanh}`)),
    el('div', { class: 'sep' }),
    el('span', { class: 'chip mute' }, u.vaiTro)));

  document.body.append(el('div', { id: 'login' },
    el('div', { class: 'box' },
      el('h1', {}, 'Hệ thống Kiểm soát sau vay (KSSV)'),
      el('p', {}, 'Bản mô phỏng giao diện — chọn tài khoản để đăng nhập. '
        + 'Vai trò lấy từ tài khoản, không có bộ chọn vai trò trong hệ thống (BR-330, NFR-07).'),
      ...ds)));
  veDevBar();
}

/* ---------------------------------------------------------------- DEV BAR */
function veDevBar() {
  const cu = $('#devbar'); if (cu) cu.remove();
  const s = Store.state;
  const bar = el('div', { id: 'devbar' },
    el('b', {}, 'CÔNG CỤ THỬ NGHIỆM'),
    el('span', { class: 'tag' }, 'Ngày hệ thống: ' + dinhDangNgay(s.ngayHeThong)),
    el('button', { onclick: () => { Store.tuaNgay(-7); ve(); } }, '− 7 ngày'),
    el('button', { onclick: () => { Store.tuaNgay(-1); ve(); } }, '− 1'),
    el('button', { onclick: () => { Store.tuaNgay(1); ve(); } }, '+ 1'),
    el('button', { onclick: () => { Store.tuaNgay(7); ve(); } }, '+ 7 ngày'),
    el('button', { onclick: () => { Store.tuaNgay(30); ve(); } }, '+ 30 ngày'),
    el('span', { class: 'sep' }),
    el('span', { class: 'tag' }, s.hoSo.length + ' hồ sơ'),
    el('button', {
      onclick: () => xacNhan('Đặt lại dữ liệu',
        'Toàn bộ thao tác đã thực hiện sẽ bị xoá và dữ liệu mẫu được sinh lại từ đầu. Tiếp tục?',
        () => { const u = Store.state.user; Store.datLai(); Store.state.user = u; Store.luu(); ve(); },
        'Đặt lại'),
    }, 'Đặt lại dữ liệu'),
    el('button', { onclick: () => { Store.state.user = null; Store.luu(); ve(); } }, 'Đăng xuất'));
  document.body.append(bar);
}

/* ------------------------------------------------------------- THANH TRÊN */
function veTopBar() {
  const u = Store.state.user;
  const chuaDoc = Store.state.thongBao.filter(t => !t.daDoc).length;

  return el('div', { id: 'topbar' },
    el('div', { class: 'brand' }, 'PGBank', el('small', {}, 'Kiểm soát sau vay')),
    el('div', { class: 'sep' }),
    el('button', { class: 'bell', title: 'Trung tâm thông báo (M-17)', onclick: moThongBao },
      '🔔', chuaDoc ? el('span', {}, chuaDoc) : null),
    el('button', { class: 'out', title: 'M-18 Đăng xuất',
      onclick: () => { Store.state.user = null; Store.luu(); ve(); } }, 'Đăng xuất'));
}

function moThongBao() {
  const ds = Store.state.thongBao;
  const body = ds.length
    ? el('div', {}, ...ds.slice(0, 20).map(t => el('div', {
        style: 'padding:9px 0;border-bottom:1px solid #eef1f5;font-size:13px',
      }, el('div', {}, t.noiDung),
         el('div', { class: 'note' }, dinhDangNgay(t.thoiGian)))))
    : el('div', { class: 'empty' }, 'Chưa có thông báo nào');
  Store.state.thongBao.forEach(t => t.daDoc = true); Store.luu();
  moModal('Trung tâm thông báo', body, [el('button', { class: 'btn pri', onclick: () => { dongModal(); ve(); } }, 'Đóng')]);
}

/* ------------------------------------------------------- THANH BÊN (NFR-01) */
function veSidebar() {
  const s = Store.state;
  const u = s.user;
  const nhom = menuTheoVaiTro(u.vaiTro);

  /* Số hồ sơ đang chờ chính người dùng xử lý — UC-M01-13 */
  const demCuaToi = Store.hoSoTheoPhamVi()
    .filter(hs => hs.buocHienTai !== 'ST-99' && laNguoiPhuTrach(hs, u)).length;

  const mucMenu = it => {
    const dangChon = !s.hoSoDangMo && (s.manHinh === it.ma);
    return el('button', {
      class: 'mi' + (dangChon ? ' on' : '') + (it.daDung ? '' : ' chuaDung'),
      title: it.daDung ? '' : (it.moTa || '') + ' — thuộc giai đoạn mở rộng, chưa dựng trong bản mô phỏng',
      onclick: () => {
        s.manHinh = it.ma; s.hoSoDangMo = null; s.trang = 1; Store.luu(); ve();
      },
    },
      el('span', { class: 'ma' }, it.ma === 'MY' ? '★' : it.ma),
      el('span', { class: 'tn' }, it.ten),
      it.dem && demCuaToi ? el('span', { class: 'badge' }, demCuaToi) : null,
      !it.daDung ? el('span', { class: 'soon' }, 'sau') : null);
  };

  const khoi = [];

  /* Mục ngữ cảnh: chỉ hiện khi đang mở một hồ sơ (M-02 là "menu gốc"). */
  if (s.hoSoDangMo) {
    khoi.push(el('div', { class: 'mgrp' },
      el('div', { class: 'mhd' }, 'Đang mở'),
      el('button', { class: 'mi on' },
        el('span', { class: 'ma' }, 'M-02'),
        el('span', { class: 'tn' }, 'Xử lý hồ sơ',
          el('small', {}, s.hoSoDangMo)))));
  }

  nhom.forEach(g => {
    khoi.push(el('div', { class: 'mgrp' },
      g.nhom ? el('div', { class: 'mhd' }, g.nhom) : null,
      ...g.items.map(mucMenu)));
  });

  return el('aside', { id: 'sidebar' },
    el('div', { class: 'me' },
      el('div', { class: 'av' }, u.hoTen.split(' ').pop()[0]),
      el('div', { style: 'min-width:0' },
        el('b', {}, u.hoTen),
        el('span', {}, ROLES[u.vaiTro].ten),
        el('span', {}, `${u.tenPhong} · ${u.tenChiNhanh}`))),
    ...khoi,
    el('div', { class: 'mfoot' },
      'Bản mô phỏng giao diện',
      el('div', {}, 'Không có backend · dữ liệu giả')));
}

/* ------------------------------------------------ Màn hình chưa dựng */
function veChuaDung(ma) {
  let it = null, nhomCha = null;
  MENU.forEach(g => g.items.forEach(x => { if (x.ma === ma) { it = x; nhomCha = g.nhom; } }));
  if (!it) return el('div', { class: 'empty' }, 'Không tìm thấy màn hình ' + ma);

  return el('div', {},
    el('div', { class: 'crumb' }, 'Kiểm soát sau vay › ' + (nhomCha ? nhomCha + ' › ' : '') + it.ten),
    el('div', { class: 'page-h' }, el('div', {},
      el('h1', {}, `${it.ma} — ${it.ten}`),
      el('p', {}, it.moTa || ''))),
    el('div', { class: 'card' }, el('div', { class: 'body' },
      el('div', { class: 'banner info' }, el('div', {},
        el('b', {}, 'Màn hình này chưa được dựng trong bản mô phỏng.'),
        el('div', { style: 'margin-top:5px' },
          'Theo URD, đây là màn hình thuộc nhóm “Định hướng mở rộng giai đoạn tiếp theo”. '
          + 'Mục này vẫn hiển thị trên thanh bên để đơn vị nghiệp vụ rà soát sơ đồ điều hướng '
          + 'tổng thể và xác nhận vai trò nào được thấy nhóm menu nào.'))),
      el('div', { class: 'kv' },
        el('div', { class: 'k' }, 'Nhóm menu'), el('div', { class: 'v' }, nhomCha || '(menu gốc)'),
        el('div', { class: 'k' }, 'Vai trò được truy cập'),
        el('div', { class: 'v' }, it.vaiTro.map(v => el('span', { class: 'chip mute', style: 'margin-right:5px' },
          `${v} ${ROLES[v] ? ROLES[v].tat : ''}`)))))));
}

/* ------------------------------------------------------------------ VẼ */
function ve() {
  if (!Store.state.user) return veDangNhap();
  document.body.innerHTML = '';
  document.body.append(veTopBar());

  const main = el('main', {});
  const mh = Store.state.manHinh;
  if (Store.state.hoSoDangMo) main.append(veManHinhXuLy());
  else if (mh === 'M-03') main.append(veBaoCao());
  else if (mh === 'M-01' || mh === 'MY') main.append(veDanhSach());
  else main.append(veChuaDung(mh));

  document.body.append(el('div', { id: 'shell' }, veSidebar(), main));
  veDevBar();
}

window.addEventListener('DOMContentLoaded', () => { Store.khoiTao(); ve(); });
