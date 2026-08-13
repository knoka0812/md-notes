# 纸墨 · 离线 Markdown 笔记

一个**可安装到手机主屏幕、完全离线运行**的 Markdown 笔记编辑器（PWA）。
界面采用「纸张 E-Ink」风格：暖色纸面 + 墨色文字，专注护眼，含深色模式。

## 功能

- 📝 Markdown 编辑器 + 实时**编辑/预览**切换
- 🧰 格式工具栏：标题、加粗、斜体、列表、任务、引用、代码块、链接、图片、表格、分割线
- ⌨️ **键盘上方 Markdown 快捷符号栏**（手机上输入 `#` `*` `` ` `` 等符号不用切键盘）
- 📌 **笔记置顶**、🗑️ **回收站**（删除保留 30 天可恢复）、🔍 **搜索关键词高亮**
- 🖼️ **本地图片插入**（相册选图自动压缩为 JPEG 嵌入）、🏷️ **标签分类**（点击标签筛选）
- 👈 **左滑手势**（快速置顶 / 删除）、✍️ **专注模式**（一键收起工具栏，沉浸写作）
- 💾 笔记自动保存（数据存在手机本地 IndexedDB，断网可用）
- 🔍 全文搜索、字数统计、相对时间
- 🌙 深色 / 浅色主题（跟随系统或手动切换）
- 📤 导出：单篇 / 全部为 `.md`（可在 MacDown 打开）、**导出为 PDF**（打印排版，零依赖）、备份 / 恢复 JSON
- 📲 PWA：添加到主屏幕后像原生 App 一样全屏、离线运行；**自动检测新版本**并提示刷新

## 本地预览

```bash
cd md-notes
python3 -m http.server 8123
# 浏览器打开 http://localhost:8123
```

## 部署（任选一个免费静态托管，只需部署一次用于安装）

将以下文件放到托管服务根目录即可：

```
index.html  styles.css  app.js  sw.js  manifest.json
vendor/  icons/
```

- **GitHub Pages**：推送到仓库 → Settings → Pages 开启
- **Vercel / Cloudflare Pages / Netlify**：直接导入该目录

> ⚠️ 离线能力（Service Worker）要求 **HTTPS**（或 localhost）。所以请部署到上面任一
> HTTPS 托管后再从手机安装，不要只靠局域网 HTTP 地址。

## 安装到 Android 手机

1. 手机 Chrome 打开部署好的网址
2. 点菜单「**安装应用 / 添加到主屏幕**」（或应用内「更多 → 安装到主屏幕」）
3. 之后从主屏幕图标进入，**断网也能用**

## 数据与备份

- 笔记保存在**手机浏览器本地**（IndexedDB），不经过任何服务器
- 清除浏览器数据会清空笔记，请定期「**更多 → 备份为 JSON**」导出备份
- 单篇笔记可「导出为 .md」在 MacDown / Typora 等工具中继续编辑

## 技术栈

纯前端（无构建步骤）：原生 HTML/CSS/JS + [marked](https://github.com/markedjs/marked)（渲染）+ [DOMPurify](https://github.com/cure53/DOMPurify)（XSS 净化），已本地化以保证离线可用。

## 目录

```
md-notes/
├── index.html          应用外壳
├── styles.css          设计系统（纸张 E-Ink 主题）
├── app.js              全部逻辑
├── sw.js               Service Worker（离线缓存）
├── manifest.json       PWA 清单
├── vendor/             marked / DOMPurify（本地化）
├── icons/              应用图标
└── scripts/            开发脚本（生成图标、Playwright 测试）
```

测试：`scripts/test-app.py`（功能）+ `scripts/test-offline.py`（离线/PWA）+ `scripts/test-detect.py`（浏览器识别）+ `scripts/test-pdf.py`（PDF 导出）+ `scripts/test-update.py`（自动更新）。

## 如何更新版本

1. 改代码后，**同步**把 `app.js` 里的 `APP_VERSION`、`sw.js` 里的 `CACHE`、`version.json` 里的版本号一起 +1（例如 v5 → v6）
2. `git push` 到 main
3. 用户下次打开/刷新即可看到新版（网络优先缓存，无需手动清缓存；App 会自动弹「发现新版本」提示）
