/* Máy chủ tĩnh tối giản để chạy thử bản mô phỏng: node serve.js  → http://localhost:5321 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5321;
const ROOT = __dirname;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Không tìm thấy: ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }).end(buf);
  });
}).listen(PORT, () => console.log('KSSV prototype: http://localhost:' + PORT));
