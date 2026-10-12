# 深山道場 Cloudflare Worker

一個 Worker 兩條路由，金鑰與信箱通知都留在伺服端，公開倉庫不再放任何金鑰。

| 路由 | 用途 |
| :--- | :--- |
| `POST /chat` | 深山道童：代理 Gemini（金鑰以 `x-goog-api-key` header 傳送，不進 URL） |
| `POST /booking` | 問道之鏡與花瓣預約：伺服端產生 `DAO-xxxxxx` 通關碼，寫入 KV，並寄信到 `dadaoissimple@gmail.com` |

## 一次性部署（約 15 分鐘）

### 0. 先撤銷舊金鑰（最重要）
舊 Gemini 金鑰曾以 base64 公開在 git 歷史中，刪除程式碼不會讓它失效。
到 [Google AI Studio](https://aistudio.google.com/app/apikey) 刪除舊金鑰，並建立一把新的，只用於這個 Worker。

### 1. 安裝並登入
```bash
cd worker
npx wrangler login
```

### 2. 建立預約紀錄儲存（KV）
```bash
npx wrangler kv namespace create BOOKINGS
```
把輸出的 `id` 貼進 `wrangler.toml` 的 `[[kv_namespaces]]` 區塊並取消註解。

### 3. 設定寄信（Resend，免費額度每月 3,000 封）
1. 用 `dadaoissimple@gmail.com` 註冊 [resend.com](https://resend.com)。
2. 建立 API Key。
3. 預設寄件人 `onboarding@resend.dev` 只能寄到 Resend 帳號本人的信箱，剛好就是通知信箱，不必設定網域。

### 4. 寫入 Secrets 並部署
```bash
npx wrangler secret put GEMINI_API_KEY    # 貼上新的 Gemini 金鑰
npx wrangler secret put RESEND_API_KEY    # 貼上 Resend 金鑰
npx wrangler deploy
```
部署完成會得到 `https://daoissimple-worker.<你的子網域>.workers.dev`。

### 5. 把網址填進前端
編輯 `js/content.js`：
```js
api: { workerUrl: "https://daoissimple-worker.<你的子網域>.workers.dev" },
```
再依專案流程 `python3 tools/build_zhcn.py` 與提交。未填網址時，道童走本地智庫，表單會顯示手動傳送備援，不會遺失客人的回答。

### 6. 加上 Cloudflare 速率限制（建議）
Worker 內建的限流只在單一實例內有效。到 Cloudflare Dashboard → Security → WAF → Rate limiting rules，
對 `*.workers.dev` 的 `/booking` 設每 IP 每 10 分鐘 5 次、`/chat` 每分鐘 10 次。

## 查看預約紀錄
信箱收不到時，可用通關碼查 KV：
```bash
npx wrangler kv key get --binding=BOOKINGS DAO-123456
npx wrangler kv key list --binding=BOOKINGS
```

## 本機測試
```bash
node --test worker/index.test.mjs
```
