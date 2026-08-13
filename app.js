'use strict';

/* =========================================================================
   纸墨 · 离线 Markdown 笔记 —— 应用逻辑
   ========================================================================= */

/* ---------------- 图标（SVG / Lucide 风格，非 emoji） ---------------- */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/>',
  italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
  'heading-1': '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>',
  'heading-2': '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
  'heading-3': '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'list-ordered': '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'code-block': '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  minus: '<path d="M5 12h14"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  table: '<path d="M12 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>'
};

function icon(name, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------------- DOM ---------------- */
const $ = (s) => document.querySelector(s);
const listView = $('#list-view');
const editorView = $('#editor-view');
const noteList = $('#note-list');
const emptyState = $('#empty-state');
const searchInput = $('#search');
const titleInput = $('#note-title');
const editor = $('#editor');
const preview = $('#preview');
const toolbar = $('#toolbar');
const saveState = $('#save-state');
const wordCount = $('#word-count');
const btnEditMode = $('#btn-edit-mode');
const btnPreviewMode = $('#btn-preview-mode');
const btnTheme = $('#btn-theme');
const sheet = $('#sheet');
const sheetBackdrop = $('#sheet-backdrop');
const sheetTitle = $('#sheet-title');
const sheetItems = $('#sheet-items');
const sheetCancel = $('#sheet-cancel');
const dialog = $('#dialog');
const dialogBackdrop = $('#dialog-backdrop');
const dialogMessage = $('#dialog-message');
const dialogCancel = $('#dialog-cancel');
const dialogConfirm = $('#dialog-confirm');
const toastEl = $('#toast');
const fileMd = $('#file-md');
const fileJson = $('#file-json');
const printArea = $('#print-area');

/* ---------------- 状态 ---------------- */
let db = null;
let notes = [];
let currentId = null;
let currentCreatedAt = null;
let saveTimer = null;
let isPreview = false;
let deferredPrompt = null;

/* 提前注册安装事件（beforeinstallprompt 可能早于 DOMContentLoaded 触发） */
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('已安装到主屏幕 ✓'); });

/* ---------------- IndexedDB ---------------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('zhimo-notes', 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore('notes', { keyPath: 'id' });
      store.createIndex('updatedAt', 'updatedAt');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function getAllNotes() {
  return new Promise((resolve, reject) => {
    const req = db.transaction('notes', 'readonly').objectStore('notes').getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.updatedAt - a.updatedAt));
    req.onerror = () => reject(req.error);
  });
}
function getNote(id) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('notes', 'readonly').objectStore('notes').get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function putNote(note) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite');
    tx.objectStore('notes').put(note);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function deleteNote(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite');
    tx.objectStore('notes').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function clearAllNotes() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite');
    tx.objectStore('notes').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------------- 工具 ---------------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function sanitizeFilename(title) {
  const t = (title || '').replace(/[\\/:*?"<>|]/g, ' ').trim();
  return t || 'untitled';
}
function relativeTime(ts) {
  const diff = Date.now() - ts;
  const m = 60e3, h = 60 * m, d = 24 * h;
  if (diff < m) return '刚刚';
  if (diff < h) return Math.floor(diff / m) + ' 分钟前';
  if (diff < d) return Math.floor(diff / h) + ' 小时前';
  if (diff < 30 * d) return Math.floor(diff / d) + ' 天前';
  return new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}
function countWords(text) {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const latin = (text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latin;
}
function snippet(md, len = 120) {
  const s = String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~#>|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > len ? s.slice(0, len) + '…' : s;
}
function download(filename, text, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

/* ---------------- Markdown 渲染 ---------------- */
marked.setOptions({ gfm: true, breaks: true });
function renderMarkdown(md) {
  return DOMPurify.sanitize(marked.parse(md || ''));
}

/* ---------------- 列表页 ---------------- */
async function renderList() {
  notes = await getAllNotes();
  const f = searchInput.value.trim().toLowerCase();
  const filtered = f ? notes.filter((n) => (n.title + ' ' + n.content).toLowerCase().includes(f)) : notes;

  noteList.innerHTML = '';

  if (notes.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector('.empty-title').textContent = '还没有笔记';
    emptyState.querySelector('.empty-hint').innerHTML = '点右下角 <b>＋</b> 开始写第一篇';
    return;
  }
  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector('.empty-title').textContent = '无匹配结果';
    emptyState.querySelector('.empty-hint').innerHTML = '换个关键词试试';
    return;
  }
  emptyState.hidden = true;

  filtered.forEach((n) => noteList.appendChild(buildItem(n)));
}

function buildItem(n) {
  const li = document.createElement('li');

  const main = document.createElement('button');
  main.type = 'button';
  main.className = 'note-item';
  const title = n.title || '';
  const snip = snippet(n.content);
  main.innerHTML = `
    <p class="note-item-title ${title ? '' : 'is-untitled'}">${escapeHTML(title || '无标题')}</p>
    <p class="note-item-snippet">${escapeHTML(snip) || '&nbsp;'}</p>
    <div class="note-item-meta"><span>${relativeTime(n.updatedAt)}</span><span>${countWords(n.content)} 字</span></div>`;
  main.addEventListener('click', () => openNote(n.id));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'note-item-del icon-btn';
  del.setAttribute('aria-label', '删除');
  del.innerHTML = icon('trash', 18);
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDialog({
      message: `删除「${n.title || '无标题'}」？此操作不可撤销。`,
      confirmLabel: '删除', danger: true,
      onConfirm: async () => {
        await deleteNote(n.id);
        if (currentId === n.id) { currentId = null; clearTimeout(saveTimer); }
        toast('已删除');
        await renderList();
      }
    });
  });

  li.appendChild(main);
  li.appendChild(del);
  return li;
}

/* ---------------- 编辑器 ---------------- */
async function openNote(id) {
  const note = await getNote(id);
  if (!note) return;
  currentId = note.id;
  currentCreatedAt = note.createdAt;
  titleInput.value = note.title || '';
  editor.value = note.content || '';
  setMode('edit');
  updateWordCount();
  setSaveState('saved');
  listView.classList.remove('active');
  editorView.classList.add('active');
  window.scrollTo(0, 0);
  requestAnimationFrame(() => { (note.title ? editor : titleInput).focus(); });
}

async function newNote() {
  const note = { id: uid(), title: '', content: '', createdAt: Date.now(), updatedAt: Date.now() };
  await putNote(note);
  await openNote(note.id);
}

async function saveNow() {
  if (!currentId) return;
  setSaveState('saving');
  const note = {
    id: currentId,
    title: titleInput.value.trim(),
    content: editor.value,
    createdAt: currentCreatedAt || Date.now(),
    updatedAt: Date.now()
  };
  await putNote(note);
  const idx = notes.findIndex((n) => n.id === currentId);
  if (idx >= 0) notes[idx] = note; else notes.unshift(note);
  setSaveState('saved');
}

function scheduleSave() {
  setSaveState('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 500);
}

async function exitToNotes() {
  currentId = null;
  currentCreatedAt = null;
  clearTimeout(saveTimer);
  isPreview = false;
  editor.value = '';
  titleInput.value = '';
  editorView.classList.remove('active');
  listView.classList.add('active');
  window.scrollTo(0, 0);
  await renderList();
}

async function closeEditor() {
  if (currentId) {
    if (!titleInput.value.trim() && !editor.value.trim()) {
      await deleteNote(currentId); // 丢弃空笔记
    } else {
      await saveNow();
    }
  }
  await exitToNotes();
}

function confirmDeleteCurrent() {
  const id = currentId;
  if (!id) return;
  confirmDialog({
    message: '删除这篇笔记？此操作不可撤销。',
    confirmLabel: '删除', danger: true,
    onConfirm: async () => {
      await deleteNote(id);
      toast('已删除');
      await exitToNotes();
    }
  });
}

function setSaveState(s) {
  saveState.dataset.state = s;
  saveState.textContent = s === 'saving' ? '保存中…' : '已保存';
}

function updateWordCount() {
  wordCount.textContent = countWords(editor.value) + ' 字';
}

function setMode(mode) {
  isPreview = (mode === 'preview');
  if (isPreview) {
    updatePreview();
    editor.hidden = true;
    preview.hidden = false;
    toolbar.style.display = 'none';
    btnEditMode.setAttribute('aria-selected', 'false');
    btnPreviewMode.setAttribute('aria-selected', 'true');
    editor.blur();
  } else {
    editor.hidden = false;
    preview.hidden = true;
    toolbar.style.display = '';
    btnEditMode.setAttribute('aria-selected', 'true');
    btnPreviewMode.setAttribute('aria-selected', 'false');
    editor.focus();
  }
}

function updatePreview() {
  preview.innerHTML = renderMarkdown(editor.value);
  preview.scrollTop = 0;
}

/* ---------------- 工具栏 ---------------- */
const TOOLBAR = [
  { icon: 'bold', label: '加粗', action: 'wrap', before: '**', after: '**', ph: '加粗文字' },
  { icon: 'italic', label: '斜体', action: 'wrap', before: '*', after: '*', ph: '斜体文字' },
  { sep: true },
  { icon: 'heading-1', label: '一级标题', action: 'heading', level: 1 },
  { icon: 'heading-2', label: '二级标题', action: 'heading', level: 2 },
  { icon: 'heading-3', label: '三级标题', action: 'heading', level: 3 },
  { sep: true },
  { icon: 'list', label: '无序列表', action: 'prefix', prefix: '- ' },
  { icon: 'list-ordered', label: '有序列表', action: 'prefix', prefix: '1. ' },
  { icon: 'check-square', label: '任务清单', action: 'prefix', prefix: '- [ ] ' },
  { sep: true },
  { icon: 'quote', label: '引用', action: 'prefix', prefix: '> ' },
  { icon: 'code', label: '行内代码', action: 'wrap', before: '`', after: '`', ph: 'code' },
  { icon: 'code-block', label: '代码块', action: 'block' },
  { sep: true },
  { icon: 'link', label: '链接', action: 'link' },
  { icon: 'image', label: '图片', action: 'image' },
  { icon: 'minus', label: '分割线', action: 'insert', text: '\n---\n' },
  { icon: 'table', label: '表格', action: 'insert', text: '\n| 列1 | 列2 |\n| --- | --- |\n|  |  |\n' }
];

function renderToolbar() {
  toolbar.innerHTML = '';
  TOOLBAR.forEach((item) => {
    if (item.sep) {
      const s = document.createElement('div');
      s.className = 'tool-sep';
      toolbar.appendChild(s);
      return;
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tool-btn';
    b.setAttribute('aria-label', item.label);
    b.title = item.label;
    b.innerHTML = icon(item.icon, 19);
    b.addEventListener('click', () => applyAction(item));
    toolbar.appendChild(b);
  });
}

function getSel() {
  return { start: editor.selectionStart, end: editor.selectionEnd, value: editor.value };
}
function replaceSelection(text, start, end, focusOffset) {
  const v = editor.value;
  editor.value = v.slice(0, start) + text + v.slice(end);
  const pos = focusOffset != null ? start + focusOffset : start + text.length;
  editor.focus();
  editor.setSelectionRange(pos, pos);
  scheduleSave();
}

function applyAction(item) {
  switch (item.action) {
    case 'wrap': {
      const s = getSel();
      const sel = s.value.slice(s.start, s.end) || item.ph;
      replaceSelection(item.before + sel + item.after, s.start, s.end);
      editor.setSelectionRange(s.start + item.before.length, s.start + item.before.length + sel.length);
      break;
    }
    case 'heading': {
      const s = getSel();
      const e = expandToLines(s);
      const prefix = '#'.repeat(item.level) + ' ';
      const out = s.value.slice(e.start, e.end).split('\n').map((l) => prefix + l.replace(/^#{1,6}\s+/, '')).join('\n');
      replaceSelection(out, e.start, e.end);
      break;
    }
    case 'prefix': {
      const s = getSel();
      const e = expandToLines(s);
      const out = s.value.slice(e.start, e.end).split('\n').map((l) => item.prefix + l).join('\n');
      replaceSelection(out, e.start, e.end);
      break;
    }
    case 'block': {
      const s = getSel();
      const sel = s.value.slice(s.start, s.end) || 'code';
      replaceSelection('```\n' + sel + '\n```', s.start, s.end);
      break;
    }
    case 'link': {
      const s = getSel();
      const sel = s.value.slice(s.start, s.end) || '链接文字';
      const text = '[' + sel + '](https://)';
      replaceSelection(text, s.start, s.end);
      editor.setSelectionRange(s.start + text.indexOf('https://') + 8, s.start + text.indexOf('https://') + 8);
      break;
    }
    case 'image': {
      const s = getSel();
      const sel = s.value.slice(s.start, s.end) || '图片描述';
      const text = '![' + sel + '](https://)';
      replaceSelection(text, s.start, s.end);
      editor.setSelectionRange(s.start + text.indexOf('https://') + 8, s.start + text.indexOf('https://') + 8);
      break;
    }
    case 'insert': {
      const s = getSel();
      replaceSelection(item.text, s.start, s.end);
      break;
    }
  }
}

function expandToLines(s) {
  let start = s.start, end = s.end;
  const v = s.value;
  while (start > 0 && v[start - 1] !== '\n') start--;
  while (end < v.length && v[end] !== '\n') end++;
  return { start, end };
}

/* ---------------- 底部面板 / 对话框 ---------------- */
function showSheet(title, items) {
  sheetTitle.textContent = title;
  sheetItems.innerHTML = '';
  items.forEach((it) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sheet-item' + (it.danger ? ' is-danger' : '');
    b.innerHTML = icon(it.icon) + '<span>' + it.label + '</span>';
    b.addEventListener('click', () => { hideSheet(); it.action && it.action(); });
    sheetItems.appendChild(b);
  });
  sheet.hidden = false;
  sheetBackdrop.hidden = false;
}
function hideSheet() {
  sheet.hidden = true;
  sheetBackdrop.hidden = true;
}

function confirmDialog({ message, confirmLabel = '确定', cancelLabel = '取消', danger = false, onConfirm }) {
  dialogMessage.textContent = message;
  dialogConfirm.textContent = confirmLabel;
  dialogConfirm.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  dialogCancel.textContent = cancelLabel;
  dialogCancel.hidden = !cancelLabel;
  dialogConfirm.onclick = () => { hideDialog(); onConfirm && onConfirm(); };
  dialog.hidden = false;
  dialogBackdrop.hidden = false;
}
function hideDialog() {
  dialog.hidden = true;
  dialogBackdrop.hidden = true;
}

function openListMenu() {
  const items = [
    { icon: 'download', label: '导出全部为 .md', action: exportAll },
    { icon: 'database', label: '备份为 JSON', action: backupJSON },
    { icon: 'upload', label: '导入 Markdown (.md)', action: () => fileMd.click() },
    { icon: 'database', label: '导入备份 (JSON)', action: () => fileJson.click() }
  ];
  items.push({ icon: 'download', label: '安装到主屏幕', action: installApp });
  items.push({ icon: 'info', label: '关于', action: showAbout });
  showSheet('更多', items);
}

function openEditorMenu() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  showSheet('笔记', [
    { icon: 'download', label: '导出为 .md', action: exportCurrent },
    { icon: 'file-text', label: '导出为 PDF', action: exportPDF },
    { icon: isDark ? 'sun' : 'moon', label: '切换深色 / 浅色', action: toggleTheme },
    { icon: 'trash', label: '删除此篇', danger: true, action: confirmDeleteCurrent }
  ]);
}

/* ---------------- 导出 / 导入 ---------------- */
function exportCurrent() {
  const n = notes.find((x) => x.id === currentId) || { title: titleInput.value, content: editor.value };
  let text = n.content || '';
  if (n.title && !/^\s*#\s/.test(text)) text = '# ' + n.title + '\n\n' + text;
  const name = sanitizeFilename(n.title);
  download(name + '.md', text);
  toast('已导出 ' + name + '.md');
}

function exportPDF() {
  const title = titleInput.value.trim() || '无标题';
  const content = editor.value || '';

  // 组装打印区：标题 + 渲染后的正文
  printArea.innerHTML = '';
  const h = document.createElement('h1');
  h.className = 'print-title';
  h.textContent = title;
  printArea.appendChild(h);
  const body = document.createElement('div');
  body.className = 'markdown-body';
  body.innerHTML = renderMarkdown(content);
  printArea.appendChild(body);

  // 用标题作为 PDF 默认文件名
  const prevTitle = document.title;
  document.title = title + ' · 纸墨';
  const restore = () => {
    document.title = prevTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  window.print();
  setTimeout(restore, 1500); // 兜底：afterprint 未触发时恢复标题
}

function exportAll() {
  if (!notes.length) { toast('没有可导出的笔记'); return; }
  const body = notes.map((n) => `# ${n.title || '无标题'}\n\n${n.content || ''}`).join('\n\n---\n\n');
  const date = new Date().toISOString().slice(0, 10);
  download(`纸墨笔记-${date}.md`, body);
  toast(`已导出 ${notes.length} 篇`);
}

function backupJSON() {
  const data = { app: '纸墨', version: 1, exportedAt: new Date().toISOString(), notes };
  const date = new Date().toISOString().slice(0, 10);
  download(`纸墨备份-${date}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
  toast('已备份为 JSON');
}

function importMD(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    const content = String(reader.result || '');
    const baseName = file.name.replace(/\.(md|markdown|txt)$/i, '');
    const m = content.match(/^\s*#\s+(.+)$/m);
    const title = m ? m[1].trim() : baseName;
    await putNote({ id: uid(), title, content, createdAt: Date.now(), updatedAt: Date.now() });
    await renderList();
    toast('已导入：' + title);
  };
  reader.readAsText(file);
}

function restoreJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(String(reader.result)); } catch { toast('备份文件解析失败'); return; }
    if (!data || !Array.isArray(data.notes)) { toast('不是有效的纸墨备份文件'); return; }
    confirmDialog({
      message: `将用备份覆盖当前全部 ${notes.length} 篇笔记（备份含 ${data.notes.length} 篇），确定？`,
      confirmLabel: '覆盖导入', danger: true,
      onConfirm: async () => {
        await clearAllNotes();
        for (const n of data.notes) {
          await putNote({
            id: n.id || uid(), title: n.title || '', content: n.content || '',
            createdAt: n.createdAt || Date.now(), updatedAt: n.updatedAt || Date.now()
          });
        }
        if (currentId) { currentId = null; clearTimeout(saveTimer); }
        editorView.classList.remove('active');
        listView.classList.add('active');
        await renderList();
        toast('已恢复备份');
      }
    });
  };
  reader.readAsText(file);
}

/* ---------------- 主题 ---------------- */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  btnTheme.innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 22);
  const mc = document.querySelector('meta[name="theme-color"]');
  if (mc) mc.setAttribute('content', t === 'dark' ? '#1E1C17' : '#FDFBF7');
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}
function toggleTheme() {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

/* ---------------- PWA ---------------- */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
async function installApp() {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (e) { /* 用户取消或浏览器不支持时忽略 */ }
    deferredPrompt = null;
  } else {
    showInstallGuide();
  }
}

function showInstallGuide() {
  confirmDialog({
    message: '安装到主屏幕（两步）\n\n1. 点 Chrome 右上角「⋮」菜单\n2. 选「安装应用」或「添加到主屏幕」\n\n提示：如果菜单里暂时没有这项，说明页面还没加载完，稍等几秒再点右上角菜单看看。',
    confirmLabel: '知道了', cancelLabel: '', danger: false,
    onConfirm: () => {}
  });
}

/* ---------------- 关于 ---------------- */
function showAbout() {
  confirmDialog({
    message: '纸墨 · 离线 Markdown 笔记\n\n• 数据保存在手机本地（浏览器 IndexedDB）\n• 安装到主屏幕后，断网也能使用\n• 建议定期「备份为 JSON」以防数据丢失\n• 支持导出为 .md，可在 MacDown 中打开',
    confirmLabel: '知道了', cancelLabel: '', danger: false,
    onConfirm: () => {}
  });
}

/* ---------------- 事件绑定 ---------------- */
function bindEvents() {
  $('#btn-new').addEventListener('click', newNote);
  $('#btn-theme').addEventListener('click', toggleTheme);
  $('#btn-more').addEventListener('click', openListMenu);
  $('#btn-editor-more').addEventListener('click', openEditorMenu);
  $('#btn-back').addEventListener('click', closeEditor);
  btnEditMode.addEventListener('click', () => setMode('edit'));
  btnPreviewMode.addEventListener('click', () => setMode('preview'));
  sheetCancel.addEventListener('click', hideSheet);
  sheetBackdrop.addEventListener('click', hideSheet);
  dialogBackdrop.addEventListener('click', hideDialog);
  dialogCancel.addEventListener('click', hideDialog);

  searchInput.addEventListener('input', debounce(renderList, 200));

  titleInput.addEventListener('input', scheduleSave);
  editor.addEventListener('input', () => { scheduleSave(); updateWordCount(); });

  fileMd.addEventListener('change', () => {
    if (fileMd.files[0]) importMD(fileMd.files[0]);
    fileMd.value = '';
  });
  fileJson.addEventListener('change', () => {
    if (fileJson.files[0]) restoreJSON(fileJson.files[0]);
    fileJson.value = '';
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { hideSheet(); hideDialog(); }
  });
}

function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.getAttribute('data-icon'), 22);
  });
}

/* ---------------- 启动 ---------------- */
async function init() {
  injectIcons();
  renderToolbar();
  initTheme();
  bindEvents();
  db = await openDB();
  await renderList();
  registerSW();
}

document.addEventListener('DOMContentLoaded', init);
