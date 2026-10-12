#!/usr/bin/env python3
"""
深山的幸福道場 · 分享預覽圖產生器 (tools/make_og_image.py)
產出 images/og-cover.png (1200x630)，LINE、臉書、X 貼連結時顯示的預覽圖。
依 DESIGN.md：米白紙底、墨色細字、茶褐點綴、一方朱印，直角、無陰影、無裝飾。

圖不常改，產出後直接提交；改文案或色票時再執行：  python3 tools/make_og_image.py
需要 Pillow 與一套含繁體中文的字型（優先使用 Noto Serif/Sans CJK，其次文泉驛正黑）。
"""

import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "og-cover.png"

PAPER, INK, MIST, TEA, SEAL, LINE = "#FAF6EF", "#2A2520", "#736C63", "#82663F", "#A8543A", "#D9D1C2"

FONT_CANDIDATES = [
    "/usr/share/fonts/opentype/noto/NotoSerifCJK-Light.ttc",
    "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSerifCJKtc-Regular.otf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Light.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/System/Library/Fonts/Songti.ttc",
    "/System/Library/Fonts/PingFang.ttc",
]


def font(size):
    for path in FONT_CANDIDATES:
        if pathlib.Path(path).exists():
            return ImageFont.truetype(path, size)
    sys.exit("找不到含繁體中文的字型，請安裝 fonts-noto-cjk 或 fonts-wqy-zenhei")


def spaced(draw, xy, text, fnt, fill, tracking=0):
    """逐字繪製以加上字距（細字大標的舒展感）。"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x


def main():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # 外框細線（直角、1px 感）
    d.rectangle([40, 40, W - 41, H - 41], outline=LINE, width=2)

    # 左側文字
    spaced(d, (96, 150), "做幸福的事", font(76), INK, tracking=14)
    spaced(d, (96, 258), "把幸福做成有價值", font(76), INK, tracking=14)
    d.line([(96, 392), (336, 392)], fill=TEA, width=2)
    spaced(d, (96, 418), "大道至簡 · 深山的幸福道場", font(34), TEA, tracking=6)
    spaced(d, (96, 478), "THE DAO SANCTUARY", font(24), MIST, tracking=7)

    # 右側朱印：大道 / 至簡
    bx, by, bs = 870, 190, 210
    d.rectangle([bx, by, bx + bs, by + bs], outline=SEAL, width=5)
    f = font(70)
    for i, pair in enumerate(("大道", "至簡")):
        w = d.textlength(pair, font=f)
        d.text((bx + (bs - w) / 2, by + 28 + i * 84), pair, font=f, fill=SEAL)

    OUT.parent.mkdir(exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"已產生 {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
