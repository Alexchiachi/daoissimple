#!/usr/bin/env python3
"""
深山的幸福道場 · SEO 建置 (tools/build_seo.py)
由 tools/build_zhcn.py 在繁簡建置時呼叫，也可單獨執行。

產出（皆為編譯結果，切勿手改；改長文或網址設定後重新執行 tools/build_zhcn.py）：
  articles/<id>/index.html          每篇長文的獨立網頁（繁體），靜態 HTML，無 JS 也能讀
  zh-cn/articles/<id>/index.html    同上（簡體）
  sitemap.xml                       首頁與全部長文，含繁簡 hreflang 互指
  feed.xml、zh-cn/feed.xml          RSS 2.0 訂閱源
  robots.txt                        爬蟲規則與 sitemap 位置
並就地更新 index.html、zh-cn/index.html 中三段標記區塊：
  <!-- SEO:HEAD:START --> … <!-- SEO:HEAD:END -->        canonical、hreflang、Open Graph、Twitter、JSON-LD
  <!-- SEO:ARTICLES:START --> … <!-- SEO:ARTICLES:END -->  無 JS 時的長文索引 (noscript)
  <!-- SEO:ANALYTICS:START --> … <!-- SEO:ANALYTICS:END -->  Cloudflare Web Analytics 統計碼（長文頁也會帶上）

網址只在 SITE_URL 一處設定。日後改用自有網域（如 daoissimple.com），執行
  DAO_SITE_URL=https://daoissimple.com/ python3 tools/build_zhcn.py
或修改下方預設值即可，全站網址同步更新。

需要 node（讀取 js/articles.js 的資料）；GitHub Actions 的 ubuntu-latest 內建。
"""

import functools
import html
import json
import os
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

SITE_URL = os.environ.get("DAO_SITE_URL", "https://alexchiachi.github.io/daoissimple/").rstrip("/") + "/"
SITE_NAME = "大道至簡 · 深山的幸福道場"
OG_IMAGE_PATH = "images/og-cover.png"
OG_IMAGE_ALT = "大道至簡 · 深山的幸福道場"
AUTHOR_NAME = "簡家旗"
# Cloudflare Web Analytics：與 happy 品牌站共用同一個 hostname（alexchiachi.github.io）與 token，
# 報表以網址路徑 /daoissimple/ 篩選即可單看本站。token 是公開值，本來就會出現在頁面原始碼。
# 日後改用自有網域時，需在 Cloudflare 後台為新網域新增網站，並把新 token 填在這裡（或用環境變數）。
# 設為空字串可關閉統計。
ANALYTICS_TOKEN = os.environ.get("DAO_ANALYTICS_TOKEN", "bbab4131ad864cc59ac6bdd0c4707adb")
SAME_AS = [
    "https://www.facebook.com/dream2walker",
    "https://github.com/Alexchiachi/daoissimple",
]

HOME_DESC_TW = "做幸福的事 讓幸福變成有價值的事。簡家旗一人公司活體門戶，融通7年主流金融與老莊道法，台灣南投與雲南安寧雙基地。"

LANGS = {
    "zh-tw": {"html": "zh-TW", "hreflang": "zh-Hant", "og": "zh_TW", "prefix": "", "ld": "zh-Hant"},
    "zh-cn": {"html": "zh-CN", "hreflang": "zh-Hans", "og": "zh_CN", "prefix": "zh-cn/", "ld": "zh-Hans"},
}


@functools.lru_cache(maxsize=1)
def _cc():
    try:
        from opencc import OpenCC
    except ImportError:
        sys.exit("需要 opencc：請先執行 pip install opencc-python-reimplemented")
    return OpenCC("tw2sp")


def esc(s):
    return html.escape(str(s), quote=True)


def url_for(lang, path=""):
    return SITE_URL + LANGS[lang]["prefix"] + path


def og_image_url():
    return SITE_URL + OG_IMAGE_PATH


def load_articles(js_path):
    """用 node 執行資料檔並輸出 JSON，避免用正規表示式解析 JS。"""
    code = (
        "const vm=require('vm'),fs=require('fs');"
        "const ctx={window:{},module:{exports:{}}};vm.createContext(ctx);"
        "vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+'\\n;globalThis.__out=DaoArticlesData;',ctx);"
        "process.stdout.write(JSON.stringify(ctx.__out));"
    )
    try:
        out = subprocess.run(["node", "-e", code, str(js_path)], check=True, capture_output=True, text=True).stdout
    except FileNotFoundError:
        sys.exit("需要 node 來讀取長文資料（GitHub Actions 的 ubuntu-latest 內建；本機請先安裝 Node.js）")
    return json.loads(out)


def short_desc(article, limit=110):
    """meta description：取摘要前段，在句讀處收尾，去掉結尾省略號。"""
    text = re.sub(r"[…\.]+$", "", article["excerpt"].strip())
    if len(text) <= limit:
        return text
    cut = text[:limit]
    idx = max(cut.rfind("。"), cut.rfind("，"), cut.rfind("；"))
    return (cut[:idx] if idx > limit // 2 else cut).rstrip("，。；、 ") + "…"


def related(articles, current, n=3):
    same = [a for a in articles if a["id"] != current["id"] and a["category"] == current["category"]]
    other = [a for a in articles if a["id"] != current["id"] and a["category"] != current["category"]]
    return (same + other)[:n]


# ------------------------------------------------------------------ 共用 head
def alternates(path_tw, path_cn):
    tw, cn = url_for("zh-tw", path_tw), url_for("zh-cn", path_cn)
    return (
        f'<link rel="alternate" hreflang="zh-Hant" href="{esc(tw)}">\n'
        f'  <link rel="alternate" hreflang="zh-Hans" href="{esc(cn)}">\n'
        f'  <link rel="alternate" hreflang="x-default" href="{esc(tw)}">'
    )


def social_tags(lang, *, title, desc, url, og_type):
    other = "zh-cn" if lang == "zh-tw" else "zh-tw"
    return "\n  ".join([
        f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:site_name" content="{esc(conv(lang, SITE_NAME))}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{esc(url)}">',
        f'<meta property="og:locale" content="{LANGS[lang]["og"]}">',
        f'<meta property="og:locale:alternate" content="{LANGS[other]["og"]}">',
        f'<meta property="og:image" content="{esc(og_image_url())}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(conv(lang, OG_IMAGE_ALT))}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc(title)}">',
        f'<meta name="twitter:description" content="{esc(desc)}">',
        f'<meta name="twitter:image" content="{esc(og_image_url())}">',
    ])


def ld_json(data):
    # </ 會提早結束 script 區塊，必須跳脫
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/") + "\n  </script>"


def conv(lang, text):
    """固定介面文字以繁體撰寫，簡體頁由 OpenCC 轉換。"""
    return _cc().convert(text) if lang == "zh-cn" else text


def analytics_snippet(lang="zh-tw"):
    if not ANALYTICS_TOKEN:
        return "<!-- " + conv(lang, "統計已關閉") + " -->"
    return (
        "<!-- " + conv(lang, "Cloudflare Web Analytics：不用 cookie、不追蹤個人，只統計瀏覽量；與品牌站共用 hostname，報表以路徑 /daoissimple/ 篩選") + " -->"
        "<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' "
        "data-cf-beacon='{\"token\": \"" + ANALYTICS_TOKEN + "\"}'></script>"
    )


# ------------------------------------------------------------------ 首頁區塊
def home_head_block(lang):
    L = LANGS[lang]
    desc = conv(lang, HOME_DESC_TW)
    title = conv(lang, SITE_NAME)
    url = url_for(lang)
    feed = url_for(lang, "feed.xml")
    person = {
        "@type": "Person",
        "@id": SITE_URL + "#person",
        "name": conv(lang, AUTHOR_NAME),
        "alternateName": "Bob Chien",
        "url": SITE_URL,
        "jobTitle": conv(lang, "一人公司主理人"),
        "description": desc,
        "sameAs": SAME_AS,
    }
    site = {
        "@type": "WebSite",
        "@id": SITE_URL + "#website",
        "name": title,
        "url": url,
        "inLanguage": L["ld"],
        "description": desc,
        "publisher": {"@id": SITE_URL + "#person"},
    }
    parts = [
        '<meta name="robots" content="index,follow,max-image-preview:large">',
        '<meta name="theme-color" content="#FAF6EF">',
        f'<link rel="canonical" href="{esc(url)}">',
        alternates("", ""),
        f'<link rel="alternate" type="application/rss+xml" title="{esc(conv(lang, "大道至簡 · 深山長文專欄"))}" href="{esc(feed)}">',
        social_tags(lang, title=title, desc=desc, url=url, og_type="website"),
        ld_json({"@context": "https://schema.org", "@graph": [person, site]}),
    ]
    return "\n  ".join(parts)


def home_articles_block(lang, articles):
    items = "\n".join(
        f'        <li><a href="articles/{esc(a["id"])}/">{esc(a["title"])}</a>（{esc(a["categoryName"])}）</li>'
        for a in articles
    )
    label = conv(lang, "深山長文專欄索引")
    return (
        f'<noscript>\n      <nav aria-label="{esc(label)}">\n        <ul>\n{items}\n        </ul>\n      </nav>\n    </noscript>'
    )


def replace_block(text, name, new, indent=""):
    pattern = re.compile(rf"([ \t]*)<!-- SEO:{name}:START -->.*?<!-- SEO:{name}:END -->", re.S)
    m = pattern.search(text)
    if not m:
        sys.exit(f"找不到標記區塊 SEO:{name}，請在 HTML 內加入 <!-- SEO:{name}:START --> 與 <!-- SEO:{name}:END -->")
    ind = m.group(1)
    block = f"{ind}<!-- SEO:{name}:START -->\n{ind}{new}\n{ind}<!-- SEO:{name}:END -->"
    return text[:m.start()] + block + text[m.end():]


def update_home(path, lang, articles):
    text = path.read_text(encoding="utf-8")
    text = replace_block(text, "HEAD", home_head_block(lang))
    text = replace_block(text, "ARTICLES", home_articles_block(lang, articles))
    text = replace_block(text, "ANALYTICS", analytics_snippet(lang))
    path.write_text(text, encoding="utf-8")


# ------------------------------------------------------------------ 長文獨立頁
FONT_LINK = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Noto+Serif+TC:wght@200;300;400;500&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
    '  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Noto+Serif+TC:wght@200;300;400;500&display=swap"></noscript>'
)
FAVICON = (
    '<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>'
    '<text y=%22.85em%22 font-size=%2280%22 font-family=%22serif%22 fill=%22%2382663F%22>道</text></svg>">'
)


def render_article(a, lang, articles):
    L = LANGS[lang]
    cn = lang == "zh-cn"
    assets = "../../../" if cn else "../../"
    home = "../../"  # 兩種語系頁面的首頁都在上兩層
    path = f'articles/{a["id"]}/'
    canonical = url_for(lang, path)
    desc = short_desc(a)
    page_title = f'{a["title"]} · {conv(lang, "大道至簡")}'
    other_href = (f"../../../articles/{a['id']}/" if cn else f"../../zh-cn/articles/{a['id']}/")
    other_label = "繁體" if cn else "简体"
    feed_href = "../../feed.xml"

    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": a["title"],
                "description": desc,
                "inLanguage": L["ld"],
                "url": canonical,
                "mainEntityOfPage": canonical,
                "image": og_image_url(),
                "articleSection": a["categoryName"],
                "keywords": [a["categoryName"], conv(lang, "大道至簡")],
                "author": {"@type": "Person", "name": conv(lang, AUTHOR_NAME), "url": SITE_URL},
                "publisher": {"@type": "Organization", "name": conv(lang, "大道至簡"), "url": SITE_URL},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": conv(lang, "大道至簡"), "item": url_for(lang)},
                    {"@type": "ListItem", "position": 2, "name": conv(lang, "深山長文專欄"), "item": url_for(lang) + "#wisdom"},
                    {"@type": "ListItem", "position": 3, "name": a["title"], "item": canonical},
                ],
            },
        ],
    }
    if a.get("datePublished"):  # 資料檔日後若加 ISO 日期欄位，自動輸出
        ld["@graph"][0]["datePublished"] = a["datePublished"]

    paras = "\n".join(f"        <p>{esc(p)}</p>" for p in a["paragraphs"])
    rel = "\n".join(
        f'          <li><a href="../{esc(r["id"])}/">{esc(r["title"])}</a></li>' for r in related(articles, a)
    )
    t = lambda s: conv(lang, s)

    return f"""<!DOCTYPE html>
<html lang="{L['html']}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(page_title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#FAF6EF">
  <link rel="canonical" href="{esc(canonical)}">
  {alternates(path, path)}
  <link rel="alternate" type="application/rss+xml" title="{esc(t('大道至簡 · 深山長文專欄'))}" href="{feed_href}">
  {social_tags(lang, title=page_title, desc=desc, url=canonical, og_type="article")}
  <meta property="article:section" content="{esc(a['categoryName'])}">
  <meta property="article:author" content="{esc(t(AUTHOR_NAME))}">
  {FONT_LINK}
  <link rel="stylesheet" href="{assets}css/style.css">
  {FAVICON}
  {ld_json(ld)}
</head>
<body>
  <header class="site-nav">
    <div class="sanctuary-container nav-wrapper">
      <a href="{home}" class="brand-badge">
        <div class="brand-seal">道</div>
        <div class="brand-text">
          <span class="brand-name">{esc(t('大道至簡'))}</span>
          <p>The Dao Sanctuary</p>
        </div>
      </a>
      <a href="{other_href}" class="lang-switch-btn" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;" hreflang="{LANGS['zh-tw' if cn else 'zh-cn']['hreflang']}">{other_label}</a>
    </div>
  </header>

  <main class="sanctuary-container" style="padding-top: var(--s-5);">
    <article class="zen-article-container">
      <div class="zen-article-meta">{esc(a['categoryName'])} · {esc(a['season'])} · {esc(a['location'])}</div>
      <h1 class="zen-article-title">{esc(a['title'])}</h1>
      <div class="zen-article-subtitle">
        <span>{esc(t('主理人：簡家旗'))}</span><i class="gap"> </i>
        <span>{esc(t('閱讀時長：'))}{esc(a['readTime'])}</span>
      </div>
      <blockquote class="zen-golden-box">「{esc(a['quote'])}」</blockquote>
      <div class="zen-article-body">
{paras}
      </div>

      <div class="seal">
        <div class="seal-mark"><span>{esc(t('大道'))}</span><span>{esc(t('至簡'))}</span></div>
      </div>

      <div class="zen-reader-footer">
        <p style="color: var(--mist); font-size: 0.9rem; line-height: 1.8;">
          {esc(t('字句讀完，回歸當下。若在字裡行間看見了自己的倒影，歡迎入席對坐：'))}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
          <a class="btn-cta" href="{home}#daoboy">{esc(t('與道童聊聊這篇文章'))} →</a>
          <a class="btn-cta quiet" href="{home}#mirror">{esc(t('向仙人問道預約'))} →</a>
        </div>
      </div>

      <nav class="article-related" aria-label="{esc(t('延伸閱讀'))}">
        <h2>{esc(t('延伸閱讀'))}</h2>
        <ul>
{rel}
        </ul>
        <p><a href="{home}#wisdom">{esc(t('回到深山長文專欄'))} →</a></p>
      </nav>
    </article>
  </main>

  <footer class="site-footer">
    <div class="sanctuary-container">
      <div class="footer-bottom">
        <p>{esc(t('© 2026 大道至簡 · 簡家旗 (Bob Chien) · All Rights Reserved.'))}</p>
      </div>
    </div>
  </footer>
  {analytics_snippet(lang)}
</body>
</html>
"""


# ------------------------------------------------------------------ sitemap / feed / robots
def render_sitemap(articles):
    def entry(lang, path):
        tw, cn = path
        loc = url_for(lang, tw if lang == "zh-tw" else cn)
        return (
            "  <url>\n"
            f"    <loc>{esc(loc)}</loc>\n"
            f'    <xhtml:link rel="alternate" hreflang="zh-Hant" href="{esc(url_for("zh-tw", tw))}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="zh-Hans" href="{esc(url_for("zh-cn", cn))}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{esc(url_for("zh-tw", tw))}"/>\n'
            "  </url>"
        )

    urls = [entry(lang, ("", "")) for lang in ("zh-tw", "zh-cn")]
    for a in articles:
        p = f'articles/{a["id"]}/'
        urls += [entry(lang, (p, p)) for lang in ("zh-tw", "zh-cn")]
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(urls) + "\n</urlset>\n"
    )


def render_feed(lang, articles):
    t = lambda s: conv(lang, s)
    rows = []
    for a in articles:
        link = esc(url_for(lang, "articles/" + a["id"] + "/"))
        rows.append(
            "    <item>\n"
            "      <title>" + esc(a["title"]) + "</title>\n"
            "      <link>" + link + "</link>\n"
            '      <guid isPermaLink="true">' + link + "</guid>\n"
            "      <category>" + esc(a["categoryName"]) + "</category>\n"
            "      <description>" + esc(short_desc(a, 160)) + "</description>\n"
            "    </item>"
        )
    items = "\n".join(rows)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{esc(t('大道至簡 · 深山長文專欄'))}</title>\n"
        f"    <link>{esc(url_for(lang))}</link>\n"
        f"    <description>{esc(t('俗人對話 幸福對話 一人公司 禪宗生活 只保留在產地細細研磨的深度生命篇章'))}</description>\n"
        f"    <language>{LANGS[lang]['html']}</language>\n"
        f'    <atom:link href="{esc(url_for(lang, "feed.xml"))}" rel="self" type="application/rss+xml"/>\n'
        f"{items}\n"
        "  </channel>\n</rss>\n"
    )


def render_robots():
    return f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n"


# ------------------------------------------------------------------ 主流程
def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def clear_dir(path):
    """移除已不存在的長文頁，避免殘留。"""
    if path.exists():
        for child in path.iterdir():
            if child.is_dir():
                for f in child.iterdir():
                    f.unlink()
                child.rmdir()


def build_pages(tw_articles, cn_articles):
    for lang, articles in (("zh-tw", tw_articles), ("zh-cn", cn_articles)):
        base = ROOT / LANGS[lang]["prefix"] / "articles"
        clear_dir(base)
        for a in articles:
            write(base / a["id"] / "index.html", render_article(a, lang, articles))
        write(ROOT / LANGS[lang]["prefix"] / "feed.xml", render_feed(lang, articles))
    write(ROOT / "sitemap.xml", render_sitemap(tw_articles))
    write(ROOT / "robots.txt", render_robots())


def main():
    tw = load_articles(ROOT / "js" / "articles.js")
    cn_js = ROOT / "zh-cn" / "articles.js"
    if not cn_js.exists():
        sys.exit("找不到 zh-cn/articles.js，請改執行 python3 tools/build_zhcn.py（會依序完成繁簡與 SEO 建置）")
    cn = load_articles(cn_js)
    update_home(ROOT / "index.html", "zh-tw", tw)
    if (ROOT / "zh-cn" / "index.html").exists():
        update_home(ROOT / "zh-cn" / "index.html", "zh-cn", cn)
    build_pages(tw, cn)
    print(f"🔎 SEO 建置完成：{len(tw)} 篇長文 × 2 語系、sitemap.xml、feed.xml、robots.txt")


if __name__ == "__main__":
    main()
