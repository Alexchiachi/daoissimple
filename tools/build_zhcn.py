#!/usr/bin/env python3
"""
深山的幸福道場 · 繁簡在地化建置腳本 (tools/build_zhcn.py)
自動從繁體中文版產生大陸簡體中文版 (zh-cn/index.html)，
並轉換大陸在地習慣用語（OpenCC tw2sp：網路→网络、影片→视频、專案→项目）。
"""

import os
import pathlib
import re
import sys

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
    
    # 讀取繁體 HTML
    content = SRC_HTML.read_text(encoding="utf-8")

    # 使用 OpenCC tw2sp 進行繁體轉簡體 + 詞彙在地化
    cc = OpenCC("tw2sp")
    converted = cc.convert(content)

    # 修正 HTML 語系標籤
    converted = re.sub(r'<html\s+lang="zh-TW">', '<html lang="zh-CN">', converted)

    # 調整資源相對路徑 (退回上一層)
    converted = converted.replace('href="css/style.css"', 'href="../css/style.css"')
    converted = converted.replace('src="js/articles.js"', 'src="../js/articles.js"')
    converted = converted.replace('src="js/content.js"', 'src="../js/content.js"')
    converted = converted.replace('src="js/app.js"', 'src="../js/app.js"')
    
    # 習慣用語潤飾 (「拷贝」->「复制」，「信道」->「通道」)
    converted = converted.replace('拷贝', '复制')
    converted = converted.replace('信道', '通道')
    
    # 調整語系切換按鈕，點擊返回繁體版首頁
    converted = re.sub(
        r'<button id="lang-toggle-btn"[^>]*>.*?</button>',
        '<a href="../index.html" class="lang-switch-btn" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;" title="切換至繁體中文">繁體</a>',
        converted,
        flags=re.DOTALL
    )

    out_file = OUT / "index.html"
    out_file.write_text(converted, encoding="utf-8")
    print(f"🎉 簡體中文版建置完成：{out_file}")

if __name__ == "__main__":
    main()
