# AGENTS.md · 深山的幸福道場 (The Dao Sanctuary)

> 本文件是給所有 AI 助手（包括 Antigravity、Claude Code、Cursor、Copilot、Codex 及未來新對話 AI）的**單一真理源與交接手冊**。  
> 任何接手本專案的 AI，在閱讀任何代碼前**必須先閱讀並嚴格遵守本文件、`AI_HUMAN_COLLABORATION_PARADIGM.md`、`HAPPINESS_PERFORMANCE_ART_PRACTICE.md` 與 `DESIGN.md`**。

---

## 一、 專案核心與主理人哲學 (Core Philosophy)

* **倉庫定位**：簡家旗（Bob Chien / 大道至簡）一人公司官方門戶。
  * 遠端倉庫：`Alexchiachi/daoissimple`
  * 部署網址：`https://alexchiachi.github.io/daoissimple/`（繁體主站）
  * 大陸簡體版：`https://alexchiachi.github.io/daoissimple/zh-cn/`
* **品牌憲法**：**「做幸福的事，把幸福做成有價值。」**
* **時空座標**：
  * **台灣南投**（唯一日常居住地，深山茶園，全系統以此為準，嚴禁寫成水里）。
  * **雲南安寧**（慢旅居幸福之家，太平新城，香氣與大傾聽發源地）。
* **人機協同極致原則**：
  * **簡家旗負責 1% 靈魂**：生活感知、隨心錄音、在場大傾聽、方向定奪。
  * **AI 負責 99% 苦力**：代碼維護、系統思考優化、繁簡在地化、零摩擦部署。
  * **主理人自由第一**：主理人永遠不需要打開後台，不當網管，不當客服。

---

## 二、 產品體系矩陣：花心與花瓣 (Product Matrix)

```
                       🌸【花瓣：生活芬芳信物】🌸
            （太太主理 · 節氣批次限量 · 嚴禁常態瑣碎打包）
        ・雲南的香氣 · 安寧清晨：NT$ 1,320 起 ｜ ¥298 起
        ・南投節氣風土 · 深山手採茶：NT$ 1,280 起 ｜ ¥280 起
        ・台味木箱 · 幸福解憂信物：NT$ 28,888 ｜ ¥6,480
                               ▲
                               │ 身體先於大腦 · 五感互哺
                               ▼
                       🏵️【花心：四大精神之錨】🏵️
              （簡家旗親授 · 極高精神密度 · 零庫存高客單）
        ・幸福企業諮詢（線上版）：NT$ 68,000 起 ｜ ¥15,000 起
        ・生命回憶錄 × 大傾聽：NT$ 220,000 起 ｜ ¥49,800 起
        ・幸福餐桌 IP 指導：NT$ 450,000 起 ｜ ¥100,000 起
        ・高管 Inner Flow 退修會：NT$ 680,000 起 ｜ ¥150,000 起
```

---

## 三、 美感與設計鐵律（嚴格遵循 Happy 倉庫 DESIGN.md）

本專案與 `Alexchiachi/happy` 共享同一套品牌美學哲學：**「像一本在產地讀的書，不是一間店。」**

### 1. 標題與排版對齊鐵律
* **大標題絕不帶標點符號**：逗號、句號、頓號全部以 `<i class="gap"> </i>` 留白或自然換行替代，嚴禁在標題尾端留下全形標點！
* **置中對齊光學補償**：所有包含 `letter-spacing` 的標題行，**必須加上負外距抵銷尾端多餘間隙**：
  ```css
  .hero-title-line {
    display: block;
    letter-spacing: 0.15em;
    margin-right: -0.15em; /* 抵銷最後一字字距，確保置中完全對齊 */
  }
  ```
* **細字大字**：越大的字越細！頁首大標字重為 **`weight: 200`**，次標題 `300–400`。**嚴禁使用 600+ 粗體作為標題**！

### 2. 兩岸貨幣符號絕對分流
* **繁體中文版 (`index.html`)**：全站所有價格一律顯示 **`NT$`**（新台幣），嚴禁出現「¥」，嚴禁出現「約」字贅語。
* **簡體中文版 (`zh-cn/index.html`)**：全站所有價格一律顯示 **`¥`**（人民幣）。
* 價格統一由 `js/content.js` 驅動，`app.js` 根據語系自動渲染，禁止在 HTML 寫死混淆貨幣。

### 3. 紙墨色票與直角紀律
* **畫布與墨色**：
  * 主畫布：`--paper: #FAF6EF;`（米白紙底，絕不用純白 `#FFF` 當全站背景）
  * 第二層紙：`--paper-deep: #F2EBDF;`（hover、按下、卡片區塊）
  * 文字：`--ink: #2A2520;`（深墨黑）
  * 強調色：`--tea: #82663F;`（茶褐）
  * 輔助線：`--line: #D9D1C2;`（1px 細線）
  * 朱印：`--seal: #A8543A;`
* **形狀一律直角**：卡片、按鈕、輸入框皆為 **直角 (border-radius: 0)**。不加圓角、不加大陰影、不加彩色膠囊漸層。
* **按鈕規範**：茶色 1px 細框直角按鈕，字距 `0.2em`，文字一律以「 →」結尾；hover 時平滑填滿茶色。
* **收尾朱印 (`.seal`)**：每頁結尾以一方「大道至簡」朱紅方印優雅收尾。
* **嚴格去裝飾**：不用驚嘆號、不用 emoji（禁止 🌐、🍵、🪞 等圖示）、不寫促銷限時字眼。

### 4. 文字排版與防孤字規範（全域技能 `dao-zen-typography`）
* **四重折行防線**：
  * `text-wrap: balance`：標題與卡片大標等長平衡。
  * `text-wrap: pretty`：內文、說明與問答氣泡避開末行孤字。
  * 中文語意切片 `<span class="ph">`：保持詞語完整性，換行只發生在短語之間。
  * 數據與按鈕 `white-space: nowrap` + `tabular-nums`：禁止數字與按鈕折斷。
* **全域技能資產**：`~/.gemini/config/skills/dao-zen-typography/SKILL.md`，本機所有倉庫均一體適用。

### 5. 官方聯絡體系（傳承 `Alexchiachi/happy/connect.html`）
* **通道真理源**：
  * 電子郵件：`dadaoissimple@gmail.com`
  * LINE 官方帳號：`@473nnjul`（`https://line.me/R/ti/p/@473nnjul`）
  * 臉書專頁：`facebook.com/dream2walker`
  * 微信秘書號：`chiachilove`
  * 微信公眾號：`簡家旗-出租大書`
* **交互規範**：
  * 問道之鏡與花瓣預約 POST 到 `config.api.bookingUrl`（`Alexchiachi/happy` 已部署的 Worker `/api/dao`），伺服端產生通關碼、存入來信資料表並寄信至 `dadaoissimple@gmail.com`，在其 `/admin` 的「大道至簡來信」搜尋通關碼；送達失敗時前端顯示「複製我的回答」與 LINE/信箱預填訊息，確保客人回答不遺失。
  * 通關碼提供「一鍵複製」與內嵌狀態微反饋，禁止侵入式 `alert()`。
  * 聯絡卡片維持 1px 細線隔間、圓形單字印記（「信」、「賴」、「臉」、「微」）與直角按鈕。

---

## 四、 專案架構與檔案清單

```
daoissimple/
├── AGENTS.md                    # 本文件：給所有 AI 的全局記憶與操作手冊
├── AI_HUMAN_COLLABORATION_PARADIGM.md # 核心：簡家旗 × AI 協作典範與無限演化手冊
├── CLAUDE.md                    # AI 工具指令對齊指南
├── DESIGN.md                    # 視覺與美學規範事實表
├── CHANGELOG_AI.md              # 建置歷程、架構決策 (ADR) 與重大演進歷史
├── DAO_BOY_GEMINI_STANDARD.md   # 深山道童接入 Gemini API 技術與提示詞規範
├── README.md                    # 專案公開說明手冊
├── index.html                   # 繁體中文版主頁（單一維護正本）
├── zh-cn/                       # 大陸簡體版（全部由 tools/build_zhcn.py 自動生成，切勿手改）
│   ├── index.html               #   由 index.html 轉換
│   ├── content.js / articles.js #   由 js/content.js、js/articles.js 轉換（移除 twPrice）
│   └── app.js                   #   由 js/app.js 轉換（介面文字與道童關鍵字也是簡體）
├── css/style.css                # 侘寂紙墨美學專屬樣式表
├── js/
│   ├── content.js               # 單一數據真理源（四大花心、花瓣香氣、俗人對話錄）
│   └── app.js                   # 互動引擎（繁簡分流、道童問答、問道之鏡、抽屜）
├── articles/<id>/index.html     # 長文獨立網頁（繁體，tools/build_seo.py 產生，切勿手改）
├── sitemap.xml · feed.xml · robots.txt  # SEO 檔案（同上，編譯結果）
├── images/og-cover.png          # 分享預覽圖（tools/make_og_image.py 產生）
├── tools/
│   ├── build_zhcn.py            # 繁簡在地化建置腳本（OpenCC tw2sp）
│   ├── build_seo.py             # 長文獨立頁、sitemap、feed、robots 與首頁 SEO 區塊（由 build_zhcn.py 呼叫，需要 node）
│   ├── make_og_image.py         # 產生 images/og-cover.png
│   ├── check.py                 # 鐵律自動檢查（貨幣、標題標點、emoji、直角、字重、錨點）
│   └── push.py                  # 一鍵建置、繁簡同步與 GitHub 免密推送腳本
└── .github/workflows/pages.yml  # GitHub Pages 自動發布 CI/CD
```

---

## 五、 日常維護與修改操作標準（AI 執行規範）

當主理人提出任何內容、價格、功能或排版修改時，接手的 AI 必須按照以下標準動作執行：

1. **修改內容/定價**：
   * 編輯 `js/content.js`（確保 `twPrice` 為 `NT$`、`cnPrice` 為 `¥`）。
2. **修改 HTML/結構**：
   * 僅修改根目錄 `index.html`，**切勿手動修改 `zh-cn/` 底下任何檔案**（含 `zh-cn/*.js`，皆為編譯結果）。
   * 改 `js/app.js`、`js/content.js`、`js/articles.js` 後同樣要重新建置，CI 會比對 `zh-cn/`、`articles/`、`sitemap.xml`、`feed.xml`、`robots.txt` 與 `index.html` 是否與建置結果一致。
   * **新增或修改長文**（`js/articles.js`）：重新建置即會自動產生繁簡兩份獨立網頁、更新 sitemap 與 RSS，不需另外動作。建置需要 `node` 與 `pip install opencc-python-reimplemented`。
   * `index.html` 內 `<!-- SEO:HEAD:START -->…<!-- SEO:HEAD:END -->` 與 `<!-- SEO:ARTICLES:START -->…<!-- SEO:ARTICLES:END -->` 兩段是編譯結果，建置時會被改寫，請勿手改、也勿刪除標記。
   * **改用自有網域**（如 daoissimple.com）：`DAO_SITE_URL=https://daoissimple.com/ python3 tools/build_zhcn.py`，或修改 `tools/build_seo.py` 的 `SITE_URL`，全站網址一次更新。
3. **執行繁簡同步與建置**：
   ```bash
   python3 tools/build_zhcn.py
   ```
4. **驗證與一鍵推送**：先執行 `python3 tools/check.py`，必須通過（CI 也會執行）。
   ```bash
   python3 tools/push.py "語意 Commit 訊息"
   ```
5. **金鑰與外部 AI 鐵律**：深山道童為純本地智庫，不接 Gemini 或任何外部 AI；任何 API 金鑰嚴禁寫入本倉庫（含 base64 混淆）。`tools/check.py` 會擋。需要伺服端能力時，放在 happy 倉庫的 Cloudflare Worker，金鑰存 Worker Secret。
6. **重大改變開 PR 與記錄鐵律（最高規範）**：
   * 若商業模式、產品定價、道童活體心智架構、API 金鑰託管或網站核心架構有重大變更，**一律嚴禁直接盲推 main**！
   * **必須建立專屬 Feature 分支並開立 Pull Request (PR)**，在 PR 說明中寫清楚變更原由、技術架構、影響範圍與自檢結果。
   * **必須同步在 `CHANGELOG_AI.md` 追加一筆演進紀錄**，並更新 `AGENTS.md`、`DAO_BOY_GEMINI_STANDARD.md`。
   * 目的：確保下一次對話的 AI 或不同 AI 工具能在 1 秒內完全掌握建置脈絡與演進歷史，嚴禁遺失主理人的核心哲學與美學防線。

