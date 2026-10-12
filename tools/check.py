#!/usr/bin/env python3
"""
深山的幸福道場 · 美學與規範鐵律檢查 (tools/check.py)
把 AGENTS.md / DESIGN.md 寫在文件裡的鐵律變成會失敗的測試。
CI 與本機皆可執行：先 python3 tools/build_zhcn.py，再 python3 tools/check.py
退出碼：0 全數通過（可有警告）；1 有違規。
"""

import json
import pathlib
import re
import struct
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent

SITE_FILES = {
    "index.html": ROOT / "index.html",
    "zh-cn/index.html": ROOT / "zh-cn" / "index.html",
    "css/style.css": ROOT / "css" / "style.css",
    "js/app.js": ROOT / "js" / "app.js",
    "js/content.js": ROOT / "js" / "content.js",
    "js/articles.js": ROOT / "js" / "articles.js",
    "zh-cn/content.js": ROOT / "zh-cn" / "content.js",
    "zh-cn/articles.js": ROOT / "zh-cn" / "articles.js",
    "zh-cn/app.js": ROOT / "zh-cn" / "app.js",
}

errors = []
warnings = []


def article_pages():
    """build_seo.py 產生的長文頁（繁、簡）。"""
    pages = []
    for base in ("articles", "zh-cn/articles"):
        d = ROOT / base
        if d.exists():
            pages += sorted(f"{base}/{p.name}/index.html" for p in d.iterdir() if (p / "index.html").exists())
    return pages


def read(name):
    path = SITE_FILES.get(name) or (ROOT / name)
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

    for name in ("zh-cn/index.html", *[p for p in article_pages() if p.startswith("zh-cn/")]):
        zh = read(name)
        for m in re.finditer(r"NT\$", zh):
            fail(name, zh, m.start(), "簡體版出現「NT$」，簡體一律使用 ¥")

    for name in ("zh-cn/content.js", "zh-cn/articles.js", "zh-cn/app.js"):
        text = read(name)
        for m in re.finditer(r"NT\$", text):
            line_start = text.rfind("\n", 0, m.start()) + 1
            line = text[line_start:text.find("\n", m.start())].lstrip()
            if line.startswith(("//", "*", "/*")):
                continue  # 註解中的說明文字不會顯示給訪客
            fail(name, text, m.start(), "簡體版 JS 出現「NT$」，簡體一律使用 ¥")

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
    for name in ("js/content.js", "js/articles.js", "zh-cn/content.js", "zh-cn/articles.js"):
        text = read(name)
        for m in re.finditer(r'\btitle:\s*"([^"]*)"', text):
            if TITLE_PUNCT.search(m.group(1)):
                fail(name, text, m.start(), f"標題含標點符號：{m.group(1)}")
    # HTML 標題標籤
    for name in ("index.html", "zh-cn/index.html", *article_pages()):
        html = read(name)
        for m in re.finditer(r"<(h[1-3])\b[^>]*>(.*?)</\1>", html, flags=re.S):
            inner = re.sub(r"<[^>]+>", "", m.group(2)).strip()
            if inner and TITLE_PUNCT.search(inner):
                fail(name, html, m.start(), f"標題含標點符號：{inner}")


def check_no_emoji():
    for name in ("index.html", "zh-cn/index.html", "js/app.js", "js/content.js", "js/articles.js",
                 "zh-cn/app.js", "zh-cn/content.js", "zh-cn/articles.js", *article_pages()):
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
    """道童已改為純本地智庫：倉庫內不得有任何金鑰，也不得直連外部 AI 服務"""
    content = read("js/content.js")
    for m in re.finditer(r"defaultKey\s*:|atob\(|Buffer\.from\(", content):
        fail("js/content.js", content, m.start(), "疑似內嵌金鑰（defaultKey / atob），本站不使用任何 API 金鑰")
    for name in ("index.html", "zh-cn/index.html", "js/app.js", "js/content.js", "js/articles.js",
                 "zh-cn/app.js", "zh-cn/content.js", "zh-cn/articles.js"):
        text = read(name)
        for m in re.finditer(r"AIza[0-9A-Za-z_\-]{30,}|AQ\.[0-9A-Za-z_\-]{30,}", text):
            fail(name, text, m.start(), "疑似 Google API 金鑰明文")
        for m in re.finditer(r"generativelanguage\.googleapis\.com", text):
            fail(name, text, m.start(), "道童已移除 Gemini，不得再直連外部 AI 服務（2026-10 決議，見 CHANGELOG_AI.md）")


def check_no_alert():
    for name in ("js/app.js", "zh-cn/app.js"):
        app = read(name)
        for m in re.finditer(r"(?<![.\w])alert\(", app):
            fail(name, app, m.start(), "禁止侵入式 alert()，請改用內嵌狀態微反饋")


# OpenCC 的已知怪癖，不是繁體殘留：
#  ・簡體的「么」（什么、怎么）會被當成繁體再轉成「幺」
#  ・「通道」會被轉成「信道」；build_zhcn.py 刻意在轉換後把「信道」改回「通道」（channel 的習慣用語）
OPENCC_AMBIGUOUS = {("么", "幺"), ("通", "信")}


def check_zhcn_simplified():
    """簡體頁面不得殘留繁體字：把簡體 JS 再丟進 OpenCC，輸出應與輸入完全相同。"""
    try:
        from opencc import OpenCC
    except ImportError:
        warnings.append("未安裝 opencc，略過簡體版殘留繁體字檢查（pip install opencc-python-reimplemented）")
        return
    cc = OpenCC("tw2sp")
    html_pages = ["zh-cn/index.html", *[p for p in article_pages() if p.startswith("zh-cn/")]]
    for name in ("zh-cn/content.js", "zh-cn/articles.js", "zh-cn/app.js", *html_pages):
        text = read(name)
        if not text:
            continue
        if name.endswith(".html"):
            text = text.replace("繁體", "")  # 切換回繁體版的按鈕文字，刻意保留繁體
        converted = cc.convert(text)
        if converted == text:
            continue
        shown = 0
        for i, (a, b) in enumerate(zip(text, converted)):
            if a != b and (a, b) not in OPENCC_AMBIGUOUS:
                fail(name, text, i, f"簡體版殘留繁體字「{a}」(應為「{b}」)，請重新執行 tools/build_zhcn.py")
                shown += 1
                if shown >= 5:
                    break
        # 長度不同或僅有已知例外的差異，不視為違規


def check_seo():
    """SEO 產出（tools/build_seo.py）：每篇長文有獨立頁、canonical 與 hreflang 互指、JSON-LD 可解析、
    sitemap 與 feed 完整、連結不斷、分享預覽圖存在。"""
    articles_js = read("js/articles.js")
    ids = re.findall(r'\bid:\s*"(art-[^"]+)"', articles_js)
    if not ids:
        errors.append("js/articles.js：找不到任何長文 id")
        return

    home = read("index.html")
    m = re.search(r'<link rel="canonical" href="([^"]+)">', home)
    if not m:
        errors.append("index.html：缺少 canonical（請執行 tools/build_zhcn.py）")
        return
    site = m.group(1)
    if not site.endswith("/"):
        errors.append(f"index.html：首頁 canonical 應以 / 結尾：{site}")
        return

    def ld_ok(name, text):
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)
        if not blocks:
            errors.append(f"{name}：缺少 JSON-LD 結構化資料")
        for b in blocks:
            try:
                json.loads(b)
            except ValueError as e:
                errors.append(f"{name}：JSON-LD 無法解析（{e}）")

    def common(name, text, canonical, hreflangs):
        if f'<link rel="canonical" href="{canonical}">' not in text:
            errors.append(f"{name}：canonical 應為 {canonical}")
        for lang, href in hreflangs.items():
            if f'hreflang="{lang}" href="{href}"' not in text:
                errors.append(f"{name}：hreflang={lang} 應指向 {href}")
        if f'<meta property="og:image" content="{site}images/og-cover.png">' not in text:
            errors.append(f"{name}：缺少 og:image")
        if text.count("<h1") != 1:
            errors.append(f"{name}：頁面應恰有一個 h1（目前 {text.count('<h1')} 個）")
        if not re.search(r'<meta name="description" content="[^"]{10,}', text):
            errors.append(f"{name}：缺少 meta description")
        ld_ok(name, text)

    # 首頁（繁、簡）
    tw_alt = {"zh-Hant": site, "zh-Hans": site + "zh-cn/", "x-default": site}
    common("index.html", home, site, tw_alt)
    cn_home = read("zh-cn/index.html")
    common("zh-cn/index.html", cn_home, site + "zh-cn/", tw_alt)
    for name, text in (("index.html", home), ("zh-cn/index.html", cn_home)):
        for aid in ids:
            if f'href="articles/{aid}/"' not in text:
                errors.append(f"{name}：無 JS 長文索引缺少 {aid}（請執行 tools/build_zhcn.py）")

    # 長文頁
    for aid in ids:
        for prefix in ("", "zh-cn/"):
            name = f"{prefix}articles/{aid}/index.html"
            text = read(name)
            if not text:
                continue
            tw_url, cn_url = f"{site}articles/{aid}/", f"{site}zh-cn/articles/{aid}/"
            common(name, text, cn_url if prefix else tw_url, {"zh-Hant": tw_url, "zh-Hans": cn_url, "x-default": tw_url})
            if 'class="zen-article-body"' not in text or text.count("<p>") < 3:
                errors.append(f"{name}：正文缺漏")
            # 相對連結必須存在
            base = (ROOT / name).parent
            for href in re.findall(r'(?:href|src)="((?:\.\./)[^"#?]*)"', text):
                target = (base / href).resolve()
                ok = (target / "index.html").exists() if href.endswith("/") else target.exists()
                if not ok:
                    errors.append(f"{name}：連結不存在 {href}")

    # sitemap
    sm = read("sitemap.xml")
    if sm:
        try:
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            locs = [e.text for e in ET.fromstring(sm).findall("s:url/s:loc", ns)]
        except ET.ParseError as e:
            errors.append(f"sitemap.xml：XML 無法解析（{e}）")
            locs = []
        expected = {site, site + "zh-cn/"}
        for aid in ids:
            expected |= {f"{site}articles/{aid}/", f"{site}zh-cn/articles/{aid}/"}
        if len(locs) != len(set(locs)):
            errors.append("sitemap.xml：有重複網址")
        for miss in sorted(expected - set(locs)):
            errors.append(f"sitemap.xml：缺少 {miss}")
        for extra in sorted(set(locs) - expected):
            errors.append(f"sitemap.xml：多出不存在的網址 {extra}")

    # RSS
    for name in ("feed.xml", "zh-cn/feed.xml"):
        text = read(name)
        if not text:
            continue
        try:
            items = ET.fromstring(text).findall("channel/item")
        except ET.ParseError as e:
            errors.append(f"{name}：XML 無法解析（{e}）")
            continue
        if len(items) != len(ids):
            errors.append(f"{name}：項目數 {len(items)} 與長文數 {len(ids)} 不符")

    # robots 與預覽圖
    robots = read("robots.txt")
    if robots and f"Sitemap: {site}sitemap.xml" not in robots:
        errors.append(f"robots.txt：Sitemap 應為 {site}sitemap.xml")
    og = ROOT / "images" / "og-cover.png"
    if not og.exists():
        errors.append("images/og-cover.png：分享預覽圖不存在（python3 tools/make_og_image.py）")
    else:
        head = og.read_bytes()[:24]
        if head[:8] != b"\x89PNG\r\n\x1a\n" or struct.unpack(">II", head[16:24]) != (1200, 630):
            errors.append("images/og-cover.png：必須是 1200x630 的 PNG")


def main():
    check_currency()
    check_titles()
    check_no_emoji()
    check_css()
    check_html_integrity()
    check_secrets()
    check_no_alert()
    check_zhcn_simplified()
    check_seo()

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
