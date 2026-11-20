# CHANGELOG_AI.md · 演進紀錄

> 2026-10 以前的完整建置歷程已歸檔到 [`docs/archive/CHANGELOG_AI_2026-10.md`](docs/archive/CHANGELOG_AI_2026-10.md)，只供查歷史，內文的價格與決策可能已過時。
> 現行事實（價格、地點、聯絡通道）以 [`facts.json`](facts.json) 為準；對外文字以 [`docs/CRITERIA_LAYER.md`](docs/CRITERIA_LAYER.md) 為準。
> 任何重大修改後，在本檔**最下方**追加一筆紀錄：日期、改了什麼、為什麼、怎麼驗證。

## 仍然有效的決策（摘要）

| 日期 | 決策 | 細節 |
|---|---|---|
| 2026-10-12 | 產品分花心（簡家旗親授）與花瓣（節氣批次信物），花瓣不常態零售、不瑣碎發貨 | 價格見 `facts.json` |
| 2026-10-12 | 視覺依 `DESIGN.md`：直角、細字大標、標題無標點、無 emoji | `tools/check.py` 會擋 |
| 2026-10-12 | 繁體一律 `NT$`、簡體一律 `¥`；簡體版全部由 `tools/build_zhcn.py` 產生 | 只改繁體來源 |
| 2026-10-12 | 深山道童為純本地智庫，不接外部 AI、倉庫不放任何金鑰 | 見 `DAO_BOY_GEMINI_STANDARD.md` |
| 2026-10-12 | 問道之鏡與花瓣預約 POST 到 happy 倉庫的 Cloudflare Worker `/api/dao` | 見 `AGENTS.md` |
| 2026-10-12 | 長文獨立頁、sitemap、feed、SEO 區塊由 `tools/build_seo.py` 產生 | 編譯結果勿手改 |
| 2026-10-12 | Cloudflare Web Analytics，與 happy 共用 hostname，以 `/daoissimple/` 篩選 | |
| 2026-10-13 | 同名服務新台幣價格與 happy 的 `MOTHER-UPGRADE.md` 對齊 | 改價兩邊同時改 |

## 演進紀錄

### [2026-11-20] 事實表、判準層入庫、交接文件精簡、檢查擴充

* **背景**：多個 AI 輪流維護本站，文件開始漂移。舊 CHANGELOG 前段寫諮詢 NT$ 68,000、餐桌 IP NT$ 450,000，`AGENTS.md` 寫 NT$ 50,000、NT$ 1,000,000，AI 由上往下讀時可能先抓到舊值。判準層（對外文字的十二條規則）不在倉庫裡，接手的 AI 只守得住視覺規範，守不住「不承諾成果」。每個 AI 開工前要讀約 1,100 行文件。
* **改動**：
  1. 新增 `facts.json`：價格、地點、聯絡通道的唯一來源。
  2. 新增 `docs/CRITERIA_LAYER.md`：《核心哲學（判準層）v0.3》倉庫副本。
  3. 舊 `CHANGELOG_AI.md` 整份歸檔到 `docs/archive/`，本檔改為摘要加新紀錄。
  4. `AGENTS.md` 重寫為一百行內的交接手冊，產品價格移出，改指向 `facts.json`。
  5. `tools/check.py` 新增兩項：
     * **事實一致性（擋部署）**：`js/content.js` 各產品的 `twPrice`、`cnPrice`、價格細項，以及 `README.md` 列出的價格，必須與 `facts.json` 相同；`AGENTS.md` 不得再寫價格。
     * **判準層字詞（先警告，不擋部署）**：對外文字出現承諾成果的字詞（第 9、11、12 條）或反問句按鈕（不說服）時列出警告。現有文案有多處命中，屬於文案取捨，等主理人決定改法後再改為擋部署。
* **驗證**：本機執行 `python3 tools/build_zhcn.py` 與 `python3 tools/check.py`，鐵律全數通過，判準層警告清單見 PR 說明。
