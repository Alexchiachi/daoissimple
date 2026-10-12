#!/usr/bin/env python3
"""
深山的幸福道場 · 繁簡在地化建置腳本 (tools/build_zhcn.py)
自動從繁體中文版產生大陸簡體中文版，並轉換大陸在地習慣用語
（OpenCC tw2sp：網路→网络、影片→视频、專案→项目）。

產出（皆為編譯結果，切勿手改；改繁體正本後重新執行本腳本）：
  zh-cn/index.html   由根目錄 index.html 轉換
  zh-cn/content.js   由 js/content.js 轉換（價格卡片、花瓣、花心、道童問答）
  zh-cn/articles.js  由 js/articles.js 轉換（長文專欄）
  zh-cn/app.js       由 js/app.js 轉換（介面文字、本地智庫的關鍵字與回答）
並接著呼叫 tools/build_seo.py：長文獨立網頁、sitemap.xml、feed.xml、robots.txt，
以及 index.html 與 zh-cn/index.html 內的 SEO 標記區塊（需要 node）。

JS 一併轉換的好處：簡體訪客在道童輸入簡體關鍵字（如「面包」「父母」）也能比對到，
介面訊息、長文與按鈕不再混有繁體字。貨幣由 app.js 依頁面語系選用 cnPrice（¥），
簡體版資料檔內的 twPrice 欄位會被移除，避免 NT$ 殘留在簡體頁面。
"""

import os
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build_seo  # noqa: E402

try:
    from opencc import OpenCC
except ImportError:
    sys.exit("需要 opencc：請先執行 pip install opencc-python-reimplemented")

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "zh-cn"
SRC_HTML = ROOT / "index.html"

def main():
    print("🌿 開始執行深山的幸福道場繁簡在地化同步...")
    if not SRC_HTML.exists():
        sys.exit(f"❌ 找不到來源檔案：{SRC_HTML}")

    OUT.mkdir(exist_ok=True)

    # 先更新繁體首頁內的 SEO 標記區塊（canonical、hreflang、OG、JSON-LD、無 JS 長文索引），
    # 簡體首頁再由它轉換並以簡體資料重寫這兩段
    tw_articles = build_seo.load_articles(ROOT / "js" / "articles.js")
    build_seo.update_home(SRC_HTML, "zh-tw", tw_articles)

    # 讀取繁體 HTML
    content = SRC_HTML.read_text(encoding="utf-8")

    # 使用 OpenCC tw2sp 進行繁體轉簡體 + 詞彙在地化
    cc = OpenCC("tw2sp")
    converted = cc.convert(content)

    # 修正 HTML 語系標籤
    converted = re.sub(r'<html\s+lang="zh-TW">', '<html lang="zh-CN">', converted)

    # 調整資源相對路徑 (退回上一層)
    converted = converted.replace('href="css/style.css"', 'href="../css/style.css"')
    # JS 由本腳本轉成簡體後放在 zh-cn/，與頁面同層引用
    converted = converted.replace('src="js/articles.js"', 'src="articles.js"')
    converted = converted.replace('src="js/content.js"', 'src="content.js"')
    converted = converted.replace('src="js/app.js"', 'src="app.js"')
    
    # 習慣用語潤飾 (「拷贝」->「复制」，「信道」->「通道」)
    converted = converted.replace('拷贝', '复制')
    converted = converted.replace('信道', '通道')
    
    # 調整語系切換按鈕，點擊返回繁體版首頁
    converted = re.sub(
        r'<button id="lang-toggle-btn"[^>]*>.*?</button>',
        '<a href="../index.html" class="lang-switch-btn" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;" title="切换至繁體中文">繁體</a>',
        converted,
        flags=re.DOTALL
    )

    out_file = OUT / "index.html"
    out_file.write_text(converted, encoding="utf-8")

    # 轉換 JS：content.js 另移除 twPrice 欄位（簡體頁只使用 cnPrice）
    for name in ("content.js", "articles.js", "app.js"):
        src = (ROOT / "js" / name).read_text(encoding="utf-8")
        out = cc.convert(src)
        # 與 HTML 相同的習慣用語潤飾
        out = out.replace('拷贝', '复制').replace('信道', '通道')
        if name == "content.js":
            out = re.sub(r'^[ \t]*twPrice(?:Detail)?:.*\n', '', out, flags=re.M)
        (OUT / name).write_text(out, encoding="utf-8")

    print(f"🎉 簡體中文版建置完成：{out_file} 與 zh-cn/{{content,articles,app}}.js")

    # SEO：簡體首頁區塊改用簡體資料；長文獨立網頁、sitemap、feed、robots
    cn_articles = build_seo.load_articles(OUT / "articles.js")
    build_seo.update_home(out_file, "zh-cn", cn_articles)
    build_seo.build_pages(tw_articles, cn_articles)
    print(f"🔎 SEO 建置完成：{len(tw_articles)} 篇長文 × 2 語系、sitemap.xml、feed.xml、robots.txt")

if __name__ == "__main__":
    main()
