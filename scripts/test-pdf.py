#!/usr/bin/env python3
"""纸墨 —— 导出 PDF 功能测试"""
import sys
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

    page.goto(BASE, wait_until="networkidle")

    # 新建笔记
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "PDF 测试")
    page.fill("#editor", "# 报告标题\n\n这是**正文**，含 `code` 与表格：\n\n| A | B |\n|---|---|\n| 1 | 2 |")

    # 拦截 window.print
    page.evaluate("() => { window.__printed = 0; window.print = () => { window.__printed++; }; }")

    # 打开菜单，点击导出 PDF
    page.click("#btn-editor-more")
    check("菜单含导出 PDF", "导出为 PDF" in page.locator("#sheet").inner_text())
    page.click("text=导出为 PDF")

    check("window.print 被调用", page.evaluate("window.__printed") == 1)
    pa = page.locator("#print-area")
    html = pa.inner_html()
    check("打印区含标题", "PDF 测试" in html)
    check("打印区渲染正文", "<strong>正文</strong>" in html and "<table" in html)
    check("打印区含 h1 标题", "<h1" in html)

    # 屏幕态：打印区隐藏
    check("屏幕态打印区隐藏", page.evaluate("getComputedStyle(document.querySelector('#print-area')).display") == "none")

    # 打印态：只显示打印区
    page.emulate_media(media="print")
    check("打印态打印区显示", page.evaluate("getComputedStyle(document.querySelector('#print-area')).display") == "block")
    check("打印态编辑器隐藏", page.evaluate("getComputedStyle(document.querySelector('#editor-view')).display") == "none")
    check("打印态列表隐藏", page.evaluate("getComputedStyle(document.querySelector('#list-view')).display") == "none")
    page.emulate_media(media="screen")

    browser.close()

print("\n================ PDF 导出结果 ================")
for n, ok in results:
    print(("  PASS  " if ok else "  FAIL  ") + n)
fails = [n for n, ok in results if not ok]
print(f"\n{len(results)-len(fails)}/{len(results)} 通过")
if errors:
    print("页面错误：", errors)
sys.exit(1 if fails else 0)
