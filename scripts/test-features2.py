#!/usr/bin/env python3
"""第二批功能测试：标签、本地图片、左滑手势结构"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8123"
results = []
def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("  PASS  " if cond else "  FAIL  ") + name + (("  [" + str(extra) + "]") if extra else ""))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True).new_page()
    page.goto(BASE, wait_until="networkidle")

    # 建一篇
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "灵感")
    page.fill("#editor", "这是一个想法")
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")

    # ---- 左滑结构 ----
    check("左滑容器存在", page.locator(".note-swipe").count() >= 1)
    check("左滑按钮存在(置顶+删除)", page.locator(".swipe-btn").count() >= 2)

    # 模拟左滑打开后，点击删除按钮应弹确认框
    page.evaluate("""() => {
        const swipe = document.querySelector('.note-swipe');
        const front = swipe.querySelector('.note-item');
        front.style.transform = 'translateX(-148px)';
    }""")
    page.locator(".note-swipe .swipe-btn-danger").click()
    page.wait_for_selector("#dialog:not([hidden])")
    check("左滑删除按钮触发确认框", "删除" in page.locator("#dialog-message").inner_text())
    page.click("#dialog-cancel")
    page.wait_for_selector("#dialog", state="hidden")

    # ---- 标签 ----
    page.locator(".note-item", has_text="灵感").click()
    page.wait_for_selector("#editor-view.active")
    page.click("#btn-editor-more")
    page.locator("#sheet .sheet-item", has_text="编辑标签").click()
    page.wait_for_selector("#dialog:not([hidden])")
    page.fill(".dialog-input", "工作 灵感")
    page.click("#dialog-confirm")
    page.wait_for_selector("#dialog", state="hidden", timeout=5000)
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")

    chips = page.locator(".tag-chip").all_inner_texts()
    check("标签显示为chip", "工作" in chips and "灵感" in chips, chips)

    # 点击标签筛选
    page.locator(".tag-chip", has_text="工作").click()
    page.wait_for_timeout(300)
    check("筛选栏显示", page.locator("#filter-bar").is_visible())
    check("筛选栏含标签", "工作" in page.locator("#filter-bar").inner_text())
    page.locator(".filter-clear").click()
    page.wait_for_timeout(300)
    check("清除筛选后隐藏", page.locator("#filter-bar").is_hidden())

    # ---- 本地图片 ----
    page.locator(".note-item", has_text="灵感").click()
    page.wait_for_selector("#editor-view.active")
    page.set_input_files("#file-image", "icons/icon-192.png")
    page.wait_for_timeout(1200)
    val = page.input_value("#editor")
    check("本地图片插入(压缩为jpeg)", "data:image/jpeg" in val, val[:50])

    browser.close()

print(f"\n{sum(1 for _,c in results if c)}/{len(results)} 通过")
sys.exit(0 if all(c for _, c in results) else 1)
