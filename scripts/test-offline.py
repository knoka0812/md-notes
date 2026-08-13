#!/usr/bin/env python3
"""纸墨 PWA —— Service Worker / manifest / 离线能力测试"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8123"
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

    # 1) 加载 + SW 接管
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller !== null", timeout=15000)
    check("Service Worker 已接管页面", page.evaluate("!!navigator.serviceWorker.controller"))

    # 2) 再刷新一次，确保受控后再测
    page.reload(wait_until="networkidle")
    page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=15000)

    # 3) manifest 校验
    manifest = page.evaluate("""async () => {
        const r = await fetch('./manifest.json');
        return r.ok ? await r.json() : null;
    }""")
    check("manifest 可读取", manifest is not None and manifest.get("name"))
    check("manifest 含 3 个图标", isinstance(manifest.get("icons"), list) and len(manifest["icons"]) >= 3)
    check("manifest display=standalone", manifest.get("display") == "standalone")

    # 4) 准备离线数据：新建一篇笔记
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "离线笔记")
    page.fill("#editor", "# 离线也OK\n\n**bold** 和 `code`")
    page.wait_for_timeout(700)
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")

    # 5) 断网
    ctx.set_offline(True)

    # 6) 断网刷新，应用仍应渲染
    page.reload(wait_until="domcontentloaded")
    page.wait_for_selector("#list-view.active", timeout=15000)
    check("断网后应用仍能打开", page.locator("#list-view.active").count() == 1)
    check("断网后笔记仍在(IndexedDB)", page.locator(".note-item").count() == 1)

    # 7) 断网下打开笔记并预览（验证 marked/DOMPurify 已缓存）
    page.click(".note-item")
    page.wait_for_selector("#editor-view.active")
    page.click("#btn-preview-mode")
    page.wait_for_selector("#preview:not([hidden])")
    html = page.locator("#preview").inner_html()
    check("断网下预览正常渲染", "<strong>bold</strong>" in html and "<code>code</code>" in html)
    page.screenshot(path=os.path.join(os.path.dirname(__file__), "shots", "08-offline.png"))

    ctx.set_offline(False)
    browser.close()

print("\n================ 离线能力结果 ================")
for n, ok in results:
    print(("  PASS  " if ok else "  FAIL  ") + n)
fails = [n for n, ok in results if not ok]
print(f"\n{len(results)-len(fails)}/{len(results)} 通过")
if errors:
    print("\n页面错误：")
    for e in errors[:10]:
        print("  " + e)
import sys
sys.exit(1 if fails else 0)
