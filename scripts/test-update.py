#!/usr/bin/env python3
"""自动更新提示测试：模拟服务器新版本，验证弹窗"""
import sys
from playwright.sync_api import sync_playwright

results = []
def check(name, cond, extra=""):
    results.append((name, cond))
    print(("  PASS  " if cond else "  FAIL  ") + name + (("  [" + str(extra) + "]") if extra else ""))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # 关闭 SW，让 Playwright 能拦截 version.json 请求（测试环境限制，不影响功能本身）
    page = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block").new_page()

    # 拦截 version.json，返回一个更新的版本
    page.route("**/version.json*", lambda route: route.fulfill(
        status=200, content_type="application/json", body='{"version":"v99"}'))

    page.goto("http://localhost:8123", wait_until="networkidle")

    # checkForUpdate 在页面加载后 3 秒触发
    try:
        page.wait_for_selector("#dialog:not([hidden])", timeout=7000)
        txt = page.locator("#dialog-message").inner_text()
        check("弹出更新提示", "v99" in txt and "v5" in txt, txt.replace("\n", " / ")[:60])
        check("含刷新按钮", "立即刷新" in page.locator("#dialog-confirm").inner_text())
    except Exception as e:
        check("弹出更新提示", False, str(e)[:60])

    browser.close()

print(f"\n{sum(1 for _,c in results if c)}/{len(results)} 通过")
sys.exit(0 if all(c for _, c in results) else 1)
