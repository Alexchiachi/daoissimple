# DAO_BOY_GEMINI_STANDARD.md · 深山道童規範（已改為純本地智庫）

> **重要決議（2026-10-12）：深山道童不再接任何外部 AI 服務，沒有 Gemini、沒有 API 金鑰、沒有金鑰設定入口。**
> 檔名沿用舊名，是因為 `CLAUDE.md` 與舊文件曾以此檔為道童規範；內容已全面改寫為現行標準。
> 歷史上的 Gemini 接入方案與演進，請見 `CHANGELOG_AI.md`。

## 一、為何移除
1. 先前的金鑰以 base64 內嵌在公開倉庫，等同公開，且舊值留在 git 歷史中（主理人須自行到 Google AI Studio 撤銷）。
2. 道童的核心價值是簡家旗的長文與心法，這些內容本身就在站內；外部模型不增加可信度，反而有說教、幻覺與額度成本的風險。
3. 一人公司原則：低能耗、零維運、不增加新的服務與帳號。

## 二、現行架構
```
訪客提問
  ├─ 快速提問按鈕 → 直接顯示 js/content.js 的 daoBoyQuestions[].a 預寫答案
  └─ 自由輸入     → js/app.js fallbackLocalWisdom() 以關鍵字比對長文與心法
                     比對不到 → 溫暖兜底回答，並引導至「問道之鏡」
```
- 全程在瀏覽器內完成，無任何對外請求。
- 介面徽章顯示「本地智庫」。
- 頁面載入時會清除舊版殘留在訪客瀏覽器的 `dao_gemini_api_key`、`dao_gemini_endpoint`。

## 三、人格與語氣（維持不變）
- 平靜、留白、有溫度，像山風拂過；不說教，不自詡大師。
- 嚴禁 emoji，少用驚嘆號。
- 繁體版金額一律 `NT$`，簡體版一律 `¥`。
- 回答 150–280 字，點到即止，適時引導翻閱長文或前往「問道之鏡」。

## 四、維護方式
- **新增或修改預寫答案**：編輯 `js/content.js` 的 `daoBoyQuestions`，同時要確認不出現標點標題、emoji 與錯誤貨幣。
- **擴充自由輸入的比對**：編輯 `js/app.js` 的 `fallbackLocalWisdom()`，新長文上線時補對應關鍵字。
- **CI 守門**：`tools/check.py` 會擋下 `defaultKey`、`atob(`、Google API 金鑰字樣與任何 `generativelanguage.googleapis.com` 直連，防止外部 AI 與金鑰被悄悄加回來。若未來要重新引入，須先與主理人討論並開 PR，更新本文件。

## 五、表單送達（與道童分開）
問道之鏡與花瓣預約不屬於道童。它們 POST 到 `config.api.bookingUrl`（happy 倉庫已部署的 Cloudflare Worker `/api/dao`，實作在 `Alexchiachi/happy` 的 `executive-table/worker/dao.js`）。伺服端產生通關碼、存進來信資料表，並寄通知到 `dadaoissimple@gmail.com`。送達失敗時，頁面顯示「複製我的回答」與 LINE、信箱預填訊息，確保客人回答不遺失。
