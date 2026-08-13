#!/usr/bin/env python3
"""线上冒烟测试：验证部署到 GitHub Pages 后的应用可用性"""
import sys
from playwright.sync_api import sync_playwright

URL = "https://knoka0812.github.io/md-notes/"
results = []
errors = []

def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("  PASS  " if cond else "  FAIL  ") + name + (("  [" + str(extra) + "]") if extra else ""))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    page.goto(URL, wait_until="networkidle")
    check("线上页面加载", page.locator("#list-view.active").count() == 1)
    check("空状态可见", page.locator("#empty-state").is_visible())

    # Service Worker 注册（子路径作用域）
    sw_ok = page.evaluate("""async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return !!reg && reg.scope.includes('/md-notes/');
    }""")
    check("Service Worker 已注册(子路径)", sw_ok)

    # manifest
    manifest = page.evaluate("""async () => {
        const r = await fetch('./manifest.json'); return r.ok ? await r.json() : null;
    }""")
    check("manifest 可读", manifest is not None and manifest.get("start_url") == "./")

    # 建一篇笔记（验证 IndexedDB + 渲染库在线上正常）
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "线上冒烟")
    page.fill("#editor", "# 你好\n\n这是 **线上** 测试")
    page.click("#btn-preview-mode")
    page.wait_for_selector("#preview:not([hidden])")
    check("线上预览渲染", "<strong>线上</strong>" in page.locator("#preview").inner_html())
    page.screenshot(path=__import__("os").path.join(__import__("os").path.dirname(__file__), "shots", "09-live.png"))

    browser.close()

print("\n================ 线上冒烟结果 ================")
for n, ok in results:
    print(("  PASS  " if ok else "  FAIL  ") + n)
fails = [n for n, ok in results if not ok]
print(f"\n{len(results)-len(fails)}/{len(results)} 通过")
if errors:
    print("错误：", errors[:10])
sys.exit(1 if fails else 0)
