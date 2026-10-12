---
version: 1
name: 大道至簡 · 深山的幸福道場 DESIGN.md
description: 像一本在產地讀的書。米白紙底、墨色字、茶褐強調色，大量留白，宋體中文配義大利體英文。介面退後，一律直角，細線分段，每頁用一方朱印收尾。
reference: 繼承自 Alexchiachi/happy 倉庫之 DESIGN.md，融入 Apple Design 的流體紀律與東方侘寂。

colors:
  paper: "#FAF6EF"        # 主畫布，米白紙底
  paper-deep: "#F2EBDF"   # 第二層紙，hover、按下底色
  ink: "#2A2520"          # 所有標題與正文墨色
  ink-soft: "#4A423A"     # 段落、說明文字
  mist: "#736C63"         # 輔助字、英文副標、編號
  line: "#D9D1C2"         # 1px 細線、卡片框、分隔線
  tea: "#82663F"          # 全站核心茶褐強調色
  moss: "#547050"         # 台灣苔綠強調色
  seal: "#A8543A"         # 朱印，唯一允許的紅

typography:
  font-display: '"Cormorant Garamond", "Noto Serif TC", serif'   # 英文、價格、數字、eyebrow
  font-body: '"Noto Serif TC", "Songti TC", "PingFang TC", serif'
  font-han: '"Noto Serif TC", "Songti TC", serif'                # 中文標題、按鈕
  hero-title: { size: "clamp(2.8rem, 6.5vw, 5rem)", weight: 200, letterSpacing: 0.12em, lineHeight: 1.35 }
  h-section:  { size: "clamp(1.8rem, 3.5vw, 2.6rem)", weight: 300, letterSpacing: 0.08em }
  eyebrow:    { family: font-display, size: 0.78rem, weight: 500, letterSpacing: 0.4em, color: tea }

shapes:
  rounded: 0              # 一律直角，卡片、按鈕、輸入框皆為直角
  shadows: none           # 無 box-shadow，層次靠 1px 細線與 paper-deep 紙色

currency:
  tw: "NT$"               # 繁體版一律使用 NT$
  cn: "¥"                 # 簡體版一律使用 ¥
---

# 大道至簡 · 深山的幸福道場 視覺規範 (DESIGN.md)

## 一、 核心視覺哲學
大道至簡的網頁像**一本在產地讀的書**，不是一間店。
介面盡量退後，讓文字、風土與思想說話。

## 二、 標題文字與排版對齊
1. **標題不留標點**：逗號、頓號、句號以 `<i class="gap"> </i>` 留白或換行替代。
2. **光學置中**：所有帶 `letter-spacing` 的標題行必須搭配負外距補償（`margin-right: -0.15em`），避免文字向左偏移。
3. **細字大字**：越大的字越細，頁首大標重 200，段落標題 300–400。嚴禁使用粗體當標題。

## 三、 形狀與動態
1. **一律直角**：卡片、按鈕、輸入框無圓角。
2. **微觸感回饋**：按鈕按下 `:active` 具備 `scale(0.97)` 縮放。
3. **收尾朱印**：每頁結尾以 88px 的方形朱印落款。

## 四、 防孤字與語意排版紀律（參考 Dao-Is-Simple-The-Open-System-Series 規範）
1. **標題求每行等長**：所有 `h1~h4` 與區塊標題強制 `text-wrap: balance`，左右兩端對稱平衡。
2. **段落絕不單獨留孤字**：所有段落、引言與清單強制 `text-wrap: pretty`，最後一行嚴禁只留一個字。
3. **中文語意片段 (`.ph`)**：
   - 中文沒有字間空白，瀏覽器預設會在隨機字元處折行（如「生／命」、「道／場」）。
   - 對長標題、導言與表單題目採用 `<span class="ph">...</span>`（`display: inline-block`）語意切片，斷行只能發生在片段之間，跨行絕不拆散詞彙。
4. **按鈕與價格不折斷**：
   - 所有按鈕（`.btn-cta`、`.lang-switch-btn`）與價格（`.core-price`、`.petal-price`）強制 `white-space: nowrap` 與 `tabular-nums`，禁止符號與數字分離。
