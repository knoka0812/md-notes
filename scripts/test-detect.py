#!/usr/bin/env python3
"""浏览器识别 + 自适应安装指引测试"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8123"

UAS = [
    ("Chrome(安卓)", "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", "Chrome"),
    ("Edge(安卓)", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 EdgA/120.0", "Edge"),
    ("三星浏览器", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 SamsungBrowser/23.0", "三星浏览器"),
    ("华为浏览器", "Mozilla/5.0 (Linux; Android 12; HUAWEI) AppleWebKit/537.36 Chrome/99.0 Mobile Safari/537.36 HuaweiBrowser/13.0", "华为浏览器"),
    ("小米浏览器", "Mozilla/5.0 (Linux; Android 13; Mi 13) AppleWebKit/537.36 Chrome/100.0 Mobile Safari/537.36 MiuiBrowser/15.0", "小米浏览器"),
    ("QQ浏览器", "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/90.0 Mobile Safari/537.36 MQQBrowser/13.0", "QQ 浏览器"),
    ("UC浏览器", "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/90.0 Mobile Safari/537.36 UCBrowser/15.0", "UC 浏览器"),
    ("微信内置(安卓)", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/100.0 Mobile Safari/537.36 MicroMessenger/8.0.40", "微信"),
    ("Safari(iPhone)", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1", "Safari"),
    ("Chrome(iPhone)", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120.0 Mobile/15E148 Safari/604.1", "Chrome"),
    ("Firefox(安卓)", "Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0", "Firefox"),
]

results = []
def check(name, cond):
    results.append((name, cond))
    print(("  PASS  " if cond else "  FAIL  ") + name)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for label, ua, expect in UAS:
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, user_agent=ua, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        page.click("#btn-more")
        page.click("text=安装到主屏幕")
        page.wait_for_selector("#dialog:not([hidden])")
        txt = page.locator("#dialog-message").inner_text()
        ok = expect in txt
        check(f"{label} → 识别为「{expect}」", ok)
        if not ok:
            print("      实际文案:", txt.replace("\n", " / ")[:90])
        ctx.close()
    browser.close()

print(f"\n{sum(1 for _,c in results if c)}/{len(results)} 通过")
sys.exit(0 if all(c for _, c in results) else 1)
