#!/usr/bin/env python3
"""新功能测试：置顶、回收站、搜索高亮、快捷符号栏"""
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

    # 建两篇笔记
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "重要笔记")
    page.fill("#editor", "这是苹果的内容")
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")

    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    page.fill("#note-title", "普通笔记")
    page.fill("#editor", "香蕉很好吃")
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")

    # ---- 置顶 ----
    page.locator(".note-item", has_text="重要笔记").click()
    page.wait_for_selector("#editor-view.active")
    page.click("#btn-editor-more")
    page.click("text=置顶")
    page.wait_for_timeout(300)
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")
    first_title = page.locator(".note-item-title").first.inner_text()
    check("置顶后排在第一位", "重要笔记" in first_title, first_title.strip())
    check("列表显示置顶标识", page.locator(".note-item-pin").count() == 1)

    # ---- 搜索高亮 ----
    page.fill("#search", "苹果")
    page.wait_for_timeout(300)
    marks = page.locator(".note-item-snippet mark").all_inner_texts()
    check("搜索关键词高亮", any("苹果" in m for m in marks), marks)
    page.fill("#search", "")
    page.wait_for_timeout(300)

    # ---- 回收站 ----
    page.locator("li", has_text="普通笔记").locator(".note-item-del").click()
    page.wait_for_selector("#dialog:not([hidden])")
    page.click("#dialog-confirm")
    page.wait_for_selector("#dialog", state="hidden", timeout=5000)
    page.wait_for_timeout(400)
    check("删除后列表只剩1篇", page.locator(".note-item").count() == 1)

    page.click("#btn-more")
    page.locator("#sheet .sheet-item", has_text="回收站").click()
    page.wait_for_timeout(300)
    check("进入回收站(标题)", "回收站" in page.locator("#app-name").inner_text())
    check("回收站里有被删笔记", page.locator(".note-item", has_text="普通笔记").count() == 1)

    # 恢复
    page.locator(".note-item", has_text="普通笔记").click()
    page.wait_for_timeout(400)
    check("恢复后回收站为空", page.locator(".note-item").count() == 0)

    # 返回列表，确认恢复
    page.click("#btn-trash-back")
    page.wait_for_timeout(300)
    check("回到列表后笔记恢复", page.locator(".note-item", has_text="普通笔记").count() == 1)

    # ---- 快捷符号栏 ----
    page.locator(".note-item", has_text="重要笔记").click()
    page.wait_for_selector("#editor-view.active")
    page.evaluate("""() => {
        const e = document.querySelector('#editor');
        e.value = 'abc';
        e.setSelectionRange(3, 3);
        insertQuick(QUICKBAR.find(i => i.label === '#'));
    }""")
    val = page.input_value("#editor")
    check("快捷符号插入 #", val == "abc# ", val)

    browser.close()

print(f"\n{sum(1 for _,c in results if c)}/{len(results)} 通过")
sys.exit(0 if all(c for _, c in results) else 1)
