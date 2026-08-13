'use strict';

/* 生成 PWA 图标（纯 Node + zlib，无外部依赖）
   设计：纸张底色 + 墨色 "M" + 赭石下箭头（Markdown 标记） */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const PAPER = [253, 251, 247];   // #FDFBF7
const INK = [26, 26, 26];        // #1A1A1A
const ACCENT = [138, 90, 0];     // #8A5A00

/* ---------- CRC32 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* ---------- PNG 编码 ---------- */
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- 绘制（扫描线填充，快速） ---------- */
function setPx(buf, W, x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= W) return;
  const i = (y * W + x) * 4;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
}
function disk(buf, W, cx, cy, r, c) {
  const R = Math.ceil(r);
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      if (dx * dx + dy * dy <= r * r) setPx(buf, W, cx + dx, cy + dy, c);
    }
  }
}
function fillPolygon(buf, W, pts, c) {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  minY = Math.max(0, Math.floor(minY)); maxY = Math.min(W - 1, Math.ceil(maxY));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i < xs.length; i += 2) {
      const xa = Math.max(0, Math.ceil(xs[i]));
      const xb = Math.min(W - 1, Math.floor(xs[i + 1]));
      for (let x = xa; x <= xb; x++) setPx(buf, W, x, y, c);
    }
  }
}
function strokePolyline(buf, W, pts, c, th) {
  const h = th / 2;
  for (const [x, y] of pts) disk(buf, W, Math.round(x), Math.round(y), h, c);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * h, ny = dx / len * h;
    fillPolygon(buf, W, [
      [x0 + nx, y0 + ny], [x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny]
    ], c);
  }
}

function downsample(buf, W, target) {
  const K = W / target;
  const out = new Uint8Array(target * target * 4);
  for (let y = 0; y < target; y++) {
    for (let x = 0; x < target; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < K; ky++) {
        for (let kx = 0; kx < K; kx++) {
          const i = ((y * K + ky) * W + (x * K + kx)) * 4;
          r += buf[i]; g += buf[i + 1]; b += buf[i + 2];
        }
      }
      const n = K * K;
      const o = (y * target + x) * 4;
      out[o] = Math.round(r / n); out[o + 1] = Math.round(g / n); out[o + 2] = Math.round(b / n); out[o + 3] = 255;
    }
  }
  return out;
}

function makeIcon(target, designScale) {
  const K = 4;
  const W = target * K;
  const buf = new Uint8Array(W * W * 4);
  for (let i = 0; i < W * W; i++) {
    const o = i * 4;
    buf[o] = PAPER[0]; buf[o + 1] = PAPER[1]; buf[o + 2] = PAPER[2]; buf[o + 3] = 255;
  }

  const S = W * designScale;
  const off = (W - S) / 2;
  const p = (ux, uy) => [off + ux * S, off + uy * S];
  const th = (u) => u * S;

  const M = [p(0.12, 0.72), p(0.12, 0.14), p(0.50, 0.46), p(0.88, 0.14), p(0.88, 0.72)];
  strokePolyline(buf, W, M, INK, th(0.115));

  strokePolyline(buf, W, [p(0.50, 0.54), p(0.50, 0.92)], ACCENT, th(0.10));
  strokePolyline(buf, W, [p(0.50, 0.92), p(0.40, 0.80)], ACCENT, th(0.10));
  strokePolyline(buf, W, [p(0.50, 0.92), p(0.60, 0.80)], ACCENT, th(0.10));

  return downsample(buf, W, target);
}

/* ---------- 输出 ---------- */
const outDir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const specs = [
  ['icon-192.png', 192, 0.80],
  ['icon-512.png', 512, 0.80],
  ['icon-maskable-512.png', 512, 0.60]
];

for (const [name, size, scale] of specs) {
  const rgba = makeIcon(size, scale);
  fs.writeFileSync(path.join(outDir, name), encodePNG(size, size, Buffer.from(rgba)));
  console.log('OK', name, size + 'x' + size);
}
console.log('DONE ->', outDir);
