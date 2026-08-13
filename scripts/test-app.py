#!/usr/bin/env python3
"""纸墨 PWA 端到端测试（Playwright，移动端视口）"""
import sys, os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8123"
SHOTS = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(SHOTS, exist_ok=True)

errors = []
results = []

def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("  PASS  " if cond else "  FAIL  ") + name + (("  [" + str(extra) + "]") if extra else ""))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
        locale="zh-CN",
    )
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(f"[console:{m.type}] {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))

    page.goto(BASE, wait_until="networkidle")

    # 1) 列表页 + 空状态
    check("列表页激活", page.locator("#list-view.active").count() == 1)
    check("空状态可见", page.locator("#empty-state").is_visible())
    page.screenshot(path=os.path.join(SHOTS, "01-empty.png"))

    # 2) 新建笔记
    page.click("#btn-new")
    page.wait_for_selector("#editor-view.active")
    check("编辑器激活", page.locator("#editor-view.active").count() == 1)
    check("工具栏按钮数量>10", page.locator(".tool-btn").count() > 10)

    page.fill("#note-title", "测试笔记")
    page.fill("#editor",
        "# 标题一\n\n这是加粗文字\n\n- 项目1\n- 项目2\n\n`code` 行内代码\n\n> 引用一段话")
    page.wait_for_timeout(800)  # 等自动保存
    check("字数统计>0", "0 字" not in page.locator("#word-count").inner_text())

    # 3) 工具栏：加粗
    page.evaluate("""() => {
        const e = document.querySelector('#editor');
        const i = e.value.indexOf('加粗');
        e.focus(); e.setSelectionRange(i, i + 2);
    }""")
    page.click('[aria-label="加粗"]')
    check("加粗插入 **", "**加粗**" in page.input_value("#editor"))
    page.screenshot(path=os.path.join(SHOTS, "02-editor.png"))

    # 4) 预览
    page.click("#btn-preview-mode")
    page.wait_for_selector("#preview:not([hidden])")
    html = page.locator("#preview").inner_html()
    check("预览渲染 h1", "<h1" in html)
    check("预览渲染 strong", "<strong>加粗</strong>" in html)
    check("预览渲染列表", "<ul>" in html or "<li>" in html)
    check("预览渲染行内代码", "<code>" in html)
    check("预览渲染引用", "<blockquote>" in html)
    page.screenshot(path=os.path.join(SHOTS, "03-preview.png"))

    # 5) 深色模式（通过编辑器“更多”菜单切换）
    page.click("#btn-edit-mode")
    page.click("#btn-editor-more")
    page.click("text=切换深色 / 浅色")
    theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
    check("深色模式切换", theme == "dark")
    page.screenshot(path=os.path.join(SHOTS, "04-dark.png"))
    page.click("#btn-editor-more")
    page.click("text=切换深色 / 浅色")  # 切回浅色
    check("切回浅色", page.evaluate("document.documentElement.getAttribute('data-theme')") == "light")

    # 6) 导出 .md
    page.click("#btn-editor-more")
    with page.expect_download() as dl:
        page.click("text=导出为 .md")
    download = dl.value
    check("导出下载触发", download.suggested_filename == "测试笔记.md", download.suggested_filename)

    # 7) 返回列表
    page.click("#btn-back")
    page.wait_for_selector("#list-view.active")
    check("返回列表", page.locator("#list-view.active").count() == 1)
    check("列表出现笔记", page.locator(".note-item").count() == 1)
    check("笔记标题显示", "测试笔记" in page.locator(".note-item-title").inner_text())
    page.screenshot(path=os.path.join(SHOTS, "05-list.png"))

    # 8) 持久化（刷新后仍在）
    page.reload(wait_until="networkidle")
    page.wait_for_selector(".note-item")
    check("刷新后数据仍在(IndexedDB)", page.locator(".note-item").count() == 1)

    # 9) 搜索
    page.fill("#search", "测试")
    page.wait_for_timeout(300)
    check("搜索命中", page.locator(".note-item").count() == 1)
    page.fill("#search", "不存在的词xyz")
    page.wait_for_timeout(300)
    check("搜索无结果提示", "无匹配结果" in page.locator("#empty-state").inner_text())
    page.fill("#search", "")
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(SHOTS, "06-search-clear.png"))

    # 10) 列表“更多”面板
    page.click("#btn-more")
    check("更多面板打开", page.locator("#sheet").is_visible())
    check("面板含导出全部", "导出全部为 .md" in page.locator("#sheet").inner_text())
    page.screenshot(path=os.path.join(SHOTS, "07-sheet.png"))
    page.click("#sheet-cancel")

    browser.close()

# 汇总
print("\n================ 结果 ================")
fails = [n for n, ok in results if not ok]
for n, ok in results:
    print(("  PASS  " if ok else "  FAIL  ") + n)
print(f"\n{len(results)-len(fails)}/{len(results)} 通过")

print("\n================ 控制台错误 ================")
if errors:
    for e in errors[:20]:
        print("  " + e)
else:
    print("  （无）")

print("\n截图目录:", SHOTS)
sys.exit(1 if fails else 0)
