#!/usr/bin/env python3
"""
深山的幸福道場 · 美學與規範鐵律檢查 (tools/check.py)
把 AGENTS.md / DESIGN.md 寫在文件裡的鐵律變成會失敗的測試。
CI 與本機皆可執行：先 python3 tools/build_zhcn.py，再 python3 tools/check.py
退出碼：0 全數通過（可有警告）；1 有違規。
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

SITE_FILES = {
    "index.html": ROOT / "index.html",
    "zh-cn/index.html": ROOT / "zh-cn" / "index.html",
    "css/style.css": ROOT / "css" / "style.css",
    "js/app.js": ROOT / "js" / "app.js",
    "js/content.js": ROOT / "js" / "content.js",
    "js/articles.js": ROOT / "js" / "articles.js",
}

errors = []
warnings = []


def read(name):
    path = SITE_FILES[name]
    if not path.exists():
        errors.append(f"{name}：檔案不存在（zh-cn 需先執行 tools/build_zhcn.py）")
        return ""
    return path.read_text(encoding="utf-8")


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def fail(name, text, pos, msg):
    errors.append(f"{name}:{line_of(text, pos)}  {msg}")


# 標題標點：全形標點與常見半形標點（中間點「·」為版面分隔，不在此列）
TITLE_PUNCT = re.compile(r"[，。、！？；：,.!?;:]")
# emoji：U+1F000–1FAFF 圖形區、U+2600–26FF 雜項符號（含 ⚙）、U+FE0F 變體選擇符
# U+2700–27BF（✓ ✕ 等排印符號）屬介面微反饋用字，允許
EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-⛿️]")


def check_currency():
    html = read("index.html")
    for m in re.finditer(r"¥", html):
        fail("index.html", html, m.start(), "繁體版出現「¥」，繁體一律使用 NT$")
    for m in re.finditer(r"約\s*(?:NT\$|¥)", html):
        fail("index.html", html, m.start(), "價格前出現「約」字贅語")

    zh = read("zh-cn/index.html")
    for m in re.finditer(r"NT\$", zh):
        fail("zh-cn/index.html", zh, m.start(), "簡體版出現「NT$」，簡體一律使用 ¥")

    content = read("js/content.js")
    for m in re.finditer(r'twPrice(?:Detail)?:\s*"([^"]*)"', content):
        v = m.group(1)
        if "NT$" not in v or "¥" in v:
            fail("js/content.js", content, m.start(), f"twPrice 必須只含 NT$：{v}")
    for m in re.finditer(r'cnPrice(?:Detail)?:\s*"([^"]*)"', content):
        v = m.group(1)
        if "¥" not in v or "NT$" in v:
            fail("js/content.js", content, m.start(), f"cnPrice 必須只含 ¥：{v}")
    for m in re.finditer(r"約\s*(?:NT\$|¥)", content):
        fail("js/content.js", content, m.start(), "價格前出現「約」字贅語")


def check_titles():
    # 資料檔 title 欄位
    for name in ("js/content.js", "js/articles.js"):
        text = read(name)
        for m in re.finditer(r'\btitle:\s*"([^"]*)"', text):
            if TITLE_PUNCT.search(m.group(1)):
                fail(name, text, m.start(), f"標題含標點符號：{m.group(1)}")
    # HTML 標題標籤
    for name in ("index.html", "zh-cn/index.html"):
        html = read(name)
        for m in re.finditer(r"<(h[1-3])\b[^>]*>(.*?)</\1>", html, flags=re.S):
            inner = re.sub(r"<[^>]+>", "", m.group(2)).strip()
            if inner and TITLE_PUNCT.search(inner):
                fail(name, html, m.start(), f"標題含標點符號：{inner}")


def check_no_emoji():
    for name in ("index.html", "zh-cn/index.html", "js/app.js", "js/content.js", "js/articles.js"):
        text = read(name)
        for m in EMOJI.finditer(text):
            fail(name, text, m.start(), f"出現 emoji（U+{ord(m.group()):04X}），DESIGN.md 禁用")


def check_css():
    css = read("css/style.css")
    # 直角紀律：border-radius 僅允許 0；聯絡卡片的單字圓印記 (50%) 為已核可例外
    for m in re.finditer(r"border-radius:\s*([^;]+);", css):
        v = m.group(1).strip()
        if v in ("0", "0px", "0 0 0 0"):
            continue
        # 例外：.icon-mark 圓形單字印記
        block_start = css.rfind("{", 0, m.start())
        selector = css[css.rfind("}", 0, block_start) + 1:block_start]
        if "icon-mark" in selector and v == "50%":
            continue
        fail("css/style.css", css, m.start(), f"border-radius 非直角：{v}")
    # 細字紀律：不得使用 600+ 字重
    for m in re.finditer(r"font-weight:\s*([6-9]00|bold|bolder)", css):
        fail("css/style.css", css, m.start(), f"字重過粗：{m.group(1)}，嚴禁 600+ 粗體")
    # 標題置中的 letter-spacing 補償
    for m in re.finditer(r"([^{}]+)\{([^{}]*letter-spacing:\s*0\.15em[^{}]*)\}", css):
        sel, body = m.group(1).strip(), m.group(2)
        if "hero-title-line" in sel and "margin-right: -0.15em" not in body:
            fail("css/style.css", css, m.start(), f"{sel} 缺少 margin-right: -0.15em 光學置中補償")


def check_html_integrity():
    for name in ("index.html", "zh-cn/index.html"):
        html = read(name)
        ids = set(re.findall(r'\bid="([^"]+)"', html))
        for m in re.finditer(r'href="#([^"]+)"', html):
            target = m.group(1)
            if target and target not in ids:
                fail(name, html, m.start(), f"錨點 #{target} 找不到對應 id")
        for m in re.finditer(r'<script[^>]+src="([^"]+)"', html):
            src = m.group(1)
            if src.startswith("http"):
                continue
            base = (ROOT / name).parent
            if not (base / src).resolve().exists():
                fail(name, html, m.start(), f"腳本不存在：{src}")
    # 簡體版語系標籤與切換連結
    zh = read("zh-cn/index.html")
    if zh and 'lang="zh-CN"' not in zh:
        errors.append("zh-cn/index.html：缺少 lang=\"zh-CN\"")
    if zh and 'href="../index.html"' not in zh:
        errors.append("zh-cn/index.html：缺少返回繁體版的切換連結")


def check_secrets():
    """已知風險先以警告提示，不阻擋發布；修復後請改為 errors。"""
    content = read("js/content.js")
    if re.search(r"defaultKey\s*:", content) and "atob(" in content:
        warnings.append(
            "js/content.js：Gemini 金鑰以 base64 內嵌於公開前端（defaultKey + atob）。"
            "請撤銷輪換並改用 Cloudflare Worker 代理，見 DAO_BOY_GEMINI_STANDARD.md §2.1"
        )
    for name in ("index.html", "js/app.js", "js/articles.js"):
        text = read(name)
        for m in re.finditer(r"AIza[0-9A-Za-z_\-]{30,}", text):
            fail(name, text, m.start(), "疑似 Google API 金鑰明文")


def main():
    check_currency()
    check_titles()
    check_no_emoji()
    check_css()
    check_html_integrity()
    check_secrets()

    for w in warnings:
        print(f"警告  {w}")
    if errors:
        print(f"\n檢查失敗，共 {len(errors)} 項違規：")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    print("所有鐵律檢查通過")


if __name__ == "__main__":
    main()
