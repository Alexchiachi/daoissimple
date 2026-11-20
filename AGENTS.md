# AGENTS.md · 深山的幸福道場 交接手冊

> 給所有接手本倉庫的 AI（Claude Code、Codex、Antigravity、Cursor、Copilot 及之後的工具）。先讀本檔，其餘文件依下表「何時讀」再讀。

## 一、開工前讀什麼

| 檔案 | 內容 | 何時讀 |
|---|---|---|
| `AGENTS.md` | 本檔：規則與流程 | 每次 |
| `facts.json` | 價格、地點、聯絡通道的唯一來源 | 每次 |
| `DESIGN.md` | 色票、字體、版面紀律 | 動到畫面時 |
| `docs/CRITERIA_LAYER.md` | 判準層 v0.3：對外文字的十二條規則 | 寫或改任何對外文字時 |
| `CHANGELOG_AI.md` | 仍有效的決策摘要與近期紀錄 | 做重大修改前 |
| `DAO_BOY_GEMINI_STANDARD.md` | 深山道童（純本地智庫）規範 | 動到道童時 |
| `AI_HUMAN_COLLABORATION_PARADIGM.md`、`HAPPINESS_PERFORMANCE_ART_PRACTICE.md` | 協作理念與實踐手冊 | 需要背景時；其中價格不是本站現行價 |
| `docs/archive/` | 舊紀錄 | 只查歷史，不當現行事實 |

## 二、不可違反的規則

1. **事實只有一個來源**：價格、服務名稱、地點、聯絡通道以 `facts.json` 為準。改價先改 `facts.json`，再改 `js/content.js` 與 `README.md`；`tools/check.py` 會比對，不一致就不能部署。本檔不寫價格。
2. **地點**：日常居住地一律寫「台灣南投」；第二基地為「雲南安寧」。
3. **貨幣分流**：繁體一律 `NT$`，簡體一律 `¥`，價格前不加「約」。
4. **對外文字守判準層**：不承諾成果（第 9 條）、生命改變只寫已發生的並引原話（第 11 條）、價格旁只寫買方付出什麼（第 12 條）、不用反問句說服。`check.py` 對常見違規字詞會發警告；警告也要處理或在 PR 說明為何保留。
5. **視覺**：依 `DESIGN.md`。直角、大標細字、標題無標點、無 emoji、無 `alert()`。
6. **不放金鑰、不接外部 AI**：道童是純本地智庫。需要伺服端能力時，放在 happy 倉庫的 Cloudflare Worker，金鑰存 Worker Secret。

## 三、多個 AI 同時維護時

* **一件事一個 AI 動手**：開工前看有沒有未合併的 PR 動到同一批檔案，有就等或在該 PR 留言，不另開衝突的改動。
* **一律開分支與 PR，不直接推 main**。合併由主理人決定。`tools/push.py` 直接推 main，只限主理人本人使用。
* **寫的和審的不是同一個 AI**：對外文字的 PR，由另一個 AI 依 `docs/CRITERIA_LAYER.md` 審，在 PR 留意見，不直接改檔。
* **需要主理人親自看的只有三種**：動到價格、動到對外承諾、寫到主理人個人經歷的細節。PR 標題前加 `[需主理人]`。

## 四、產品架構（價格見 `facts.json`）

* **花心**（簡家旗親授，零庫存）：幸福企業諮詢 線上版、生命回憶錄 大傾聽、幸福餐桌 IP 指導、高管 Inner Flow 身心退修會。
* **花瓣**（太太與共創者主理，節氣批次預約，不常態零售、不瑣碎發貨）：雲南的香氣、南投深山手採茶、台味木箱。
* 同名服務的新台幣價格與 `Alexchiachi/happy` 的 `MOTHER-UPGRADE.md` 對齊，改價兩邊同時改。

## 五、表單與聯絡

* 問道之鏡與花瓣預約 POST 到 `config.api.bookingUrl`（happy 倉庫的 Worker `/api/dao`，實作在 `executive-table/worker/dao.js`）。伺服端產生通關碼、存入來信資料表、寄信到 `facts.json` 的 email。送達失敗時前端顯示「複製我的回答」與 LINE、信箱預填訊息。
* 通關碼提供一鍵複製與內嵌狀態回饋。聯絡卡片維持 1px 細線、圓形單字印記與直角按鈕。

## 六、檔案地圖

```
index.html            繁體主頁（唯一手改的 HTML）
js/content.js         頁面資料（價格須與 facts.json 一致）
js/articles.js        長文
js/app.js             互動引擎
css/style.css         樣式
zh-cn/                簡體版，全部由 build_zhcn.py 產生，勿手改
articles/<id>/        長文獨立頁，由 build_seo.py 產生，勿手改
sitemap.xml feed.xml robots.txt   同上，編譯結果
facts.json            事實表
docs/CRITERIA_LAYER.md  判準層副本
tools/build_zhcn.py   繁轉簡並呼叫 build_seo.py（需 node 與 opencc）
tools/check.py        鐵律、事實一致性、判準層字詞檢查
tools/push.py         主理人專用：建置後直接推 main
.github/workflows/    check.yml（分支與 PR 檢查）、pages.yml（main 建置、檢查、部署）
```

## 七、改動流程

1. 開分支：`git checkout -b feat/<簡述>` 或 `fix/<簡述>`。
2. 改價：先改 `facts.json`，再改 `js/content.js`（`twPrice` 只含 `NT$`、`cnPrice` 只含 `¥`）與 `README.md`。
3. 改結構只動根目錄 `index.html`；`index.html` 內 `SEO:HEAD`、`SEO:ARTICLES`、`SEO:ANALYTICS` 三段標記之間是編譯結果，勿手改、勿刪標記。
4. 建置：`python3 tools/build_zhcn.py`（需 `pip install opencc-python-reimplemented` 與 node）。
5. 檢查：`python3 tools/check.py`，必須通過；判準層警告要處理或在 PR 說明。
6. 開 PR，寫清楚改了什麼、為什麼、檢查結果。重大修改在 `CHANGELOG_AI.md` 最下方追加一筆。

## 八、流量統計

Cloudflare Web Analytics，與 happy 共用 hostname `alexchiachi.github.io` 與 token（`tools/build_seo.py` 的 `ANALYTICS_TOKEN`，公開值）。看報表時以路徑 `/daoissimple/` 篩選。改用自有網域時，到 Cloudflare 為新網域新增 Web Analytics 網站並更新 token，再以 `DAO_SITE_URL=https://daoissimple.com/ python3 tools/build_zhcn.py` 重建。
