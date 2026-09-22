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
  const mh = Store.state.manHinh;
  const nut = (ma, nhan) => el('button', {
    class: mh === ma ? 'on' : '',
    onclick: () => { Store.state.manHinh = ma; Store.state.hoSoDangMo = null; Store.luu(); ve(); },
  }, nhan);

  return el('div', { id: 'topbar' },
    el('div', { class: 'brand' }, 'PGBank', el('small', {}, 'Kiểm soát sau vay')),
    el('nav', {}, nut('M-01', 'Danh sách hồ sơ'), nut('M-03', 'Báo cáo')),
    el('div', { class: 'sep' }),
    el('button', { class: 'bell', title: 'Trung tâm thông báo', onclick: moThongBao },
      '🔔', chuaDoc ? el('span', {}, chuaDoc) : null),
    el('div', { class: 'who' }, el('b', {}, u.hoTen),
      `${ROLES[u.vaiTro].tat} · ${u.tenPhong}`),
    el('button', { class: 'out', onclick: () => { Store.state.user = null; Store.luu(); ve(); } }, 'Đăng xuất'));
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

/* ------------------------------------------------------------------ VẼ */
function ve() {
  if (!Store.state.user) return veDangNhap();
  document.body.innerHTML = '';
  document.body.append(veTopBar());

  const main = el('main', {});
  if (Store.state.hoSoDangMo) main.append(veManHinhXuLy());
  else if (Store.state.manHinh === 'M-03') main.append(veBaoCao());
  else main.append(veDanhSach());

  document.body.append(main);
  veDevBar();
}

window.addEventListener('DOMContentLoaded', () => { Store.khoiTao(); ve(); });
