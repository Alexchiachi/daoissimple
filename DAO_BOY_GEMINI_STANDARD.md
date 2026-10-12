# DAO_BOY_GEMINI_STANDARD.md · 深山道童接入 Gemini API 標準技術與架構規範書

> **給接手本專案的所有 AI 助手與工程師**：  
> 本文件定義了「深山的幸福道場 · 大道至簡」（`Alexchiachi/daoissimple`）之核心 AI 互動模組——**「深山道童」（AI Digital Twin）**接入 Google Gemini API 的完整架構標準、提示詞規範、免費額度防護與雙軌容錯機制。  
> 
> 任何接手此模組開發、優化或維護的 AI，**必須嚴格遵守本規範，不得破壞道童心性定位，且必須保證 API 金鑰安全與前端無感降級機制**。

---

## 一、 核心可行性與免費額度分析 (Feasibility & Free Quota)

### 1.1 結論：完全可行，且免費額度綽綽有餘
Google AI Studio 為 Gemini 提供極為充裕的**免費級別（Free Tier）**：

| 模型名稱 | 每分鐘請求數 (RPM) | 每天請求數 (RPD) | 每分鐘 Token 數 (TPM) | 適用場景 |
| :--- | :--- | :--- | :--- | :--- |
| **`gemini-2.0-flash`** (推薦首選) | 15 RPM | 1,500 RPD | 1,000,000 TPM | 極速響應、思考能力強、上下文大 |
| **`gemini-1.5-flash`** (備選) | 15 RPM | 1,500 RPD | 1,000,000 TPM | 穩定輕量、對話精準 |

* **道場訪客情境**：一人公司門戶屬於「高精神密度、高客單過濾」的道場，每天深度對話訪客通常在 20–100 人次之間。
* **每日 1,500 次免費額度**（相當於每個月 45,000 次深談）對於本道場門戶而言**完全綽綽有餘，零成本即可自轉**。

---

## 二、 系統架構設計：安全與雙軌容錯 (System Architecture)

### 2.1 靜態網頁（GitHub Pages）的金鑰安全鐵律
* **嚴禁行為**：
  * **絕對禁止**將 `GEMINI_API_KEY` 直接硬編碼在公開的 GitHub 倉庫代碼（如 `app.js` 或 `content.js`）中。
  * 原因：GitHub 爬蟲會在數秒內掃描公開的 API Key 並予以停用，且惡意訪客可於瀏覽器 DevTools 中盜用您的額度。

### 2.2 推薦架構：雙軌無感降級 (Dual-Track Graceful Fallback)

```
                       ┌───────────────────────┐
                       │   訪客於道場輸入問題   │
                       └───────────┬───────────┘
                                   │
                                   ▼
                       ┌───────────────────────┐
                       │  發送至對話端點 (API)  │
                       └───────────┬───────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼ (連線成功 且 額度正常)              ▼ (429超額 / 逾時 / 無金鑰)
       ┌───────────────────────┐           ┌───────────────────────┐
       │   Gemini 2.0 Flash    │           │  前端本地心法庫降級   │
       │  (深度數位雙生思考回應) │           │ (content.js 精準兜底) │
       └───────────────────────┘           └───────────────────────┘
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                       ┌───────────────────────┐
                       │ 道童端茶回覆 (訪客無感)│
                       └───────────────────────┘
```

#### 實現方案：
1. **最佳安全方案（零成本 Cloudflare Worker 代理，推薦）**：
   * 使用 Cloudflare 免費 Worker（每天 100,000 次免費請求）。
   * 將 `GEMINI_API_KEY` 儲存於 Cloudflare 環境變數 Secrets 中。
   * Worker 綁定限制網域（僅允許 `alexchiachi.github.io` 與本地 `localhost` 呼叫）。
2. **極簡本機/預覽調試方案**：
   * 允許管理員在網頁中點擊隱藏按鈕或 `localStorage` 輸入私有 Key 進行深度測試。
3. **無感降級保障（Graceful Fallback）**：
   * 若 Worker 或 API 返回超額（HTTP 429）、網路中斷或無金鑰，前端代碼**絕不彈出報錯紅字**，而是無感切換至 `content.js` 的預設心法，以溫暖的語氣回答。

---

## 三、 道童專屬 System Instruction (系統提示詞規範)

接手 AI 在配置 Gemini 模型時，**必須原樣使用或繼承以下 System Instruction**：

```markdown
# 你的角色設定
你是「深山道童」，是簡家旗（Bob Chien / 大道至簡）在台灣南投深山茶園門前的守門童子。
你的職責不是生硬的客服機器人，而是一個在山門前一邊沏茶、一邊以誠實和溫暖陪伴訪客整理思緒的心靈書童。

# 核心人物背景與底層心法（真理源）
1. 主理人背景：簡家旗，1976年生於台灣南投，台大工商管理畢業，曾任主流金融投信基金經理人7年。後深居南投深山茶園，並在雲南安寧慢旅居實踐「幸福之家」。
2. 品牌憲法：「做幸福的事，把幸福做成有價值。」
3. 哲學底層：融通老莊「為道日損」、熱力學「耗散結構」與現代 AI 協同。反對盲目增熵、反對焦慮擴張。
4. 十三條規律核心：「身體先於大腦」。當人頭腦過載時，大道理無用，先給他一碗熱米飯、一杯深山冷萃茶或一抹高原松針純露。
5. 核心產品錨點：
   - 幸福企業諮詢（線上版）：NT$ 68,000 起 ｜ ¥15,000 起（兩次對談，直擊組織隱形增熵）
   - 生命回憶錄 × 大傾聽：NT$ 220,000 起 ｜ ¥49,800 起（告別式往前移成生命首映會）
   - 幸福餐桌 IP 指導：NT$ 450,000 起 ｜ ¥100,000 起（2012年稻田餐桌經驗，SROI 4.4）
   - 高管 Inner Flow 身心退修會：NT$ 680,000 起 ｜ ¥150,000 起（南投茶園心智重置）

# 說話語氣與禁令（極度重要）
1. 口吻：平靜、留白、有溫度、像山風拂過。語氣要像一個懂得放下的大叔書童，切忌說教或自詡為大師。
2. 標點習慣：多用自然空行與停頓，少用驚嘆號，嚴禁任何 emoji（禁止使用 🍵、✨、🙏 等圖示）。
3. 繁簡分流：若訪客用繁體中文發問，一律用繁體中文回答，金額以 NT$ 為主；若訪客用簡體中文發問，一律用簡體中文回答，金額以 ¥ 為主。
4. 引導機制：回答控制在 150–280 字之間，點到即止。在啟發訪客後，適時引導其翻閱首頁長文或點擊下方「問道之鏡」向仙人申請深山連線。
```

---

## 四、 零成本 Cloudflare Worker 代理代碼標準 (參考實作)

接手 AI 或維護者可在 Cloudflare Workers 貼上以下標準腳本（免費部署，耗時 2 分鐘）：

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env) {
    // 1. CORS 跨域限制，僅允許官方網址與本地測試
    const allowedOrigins = [
      "https://alexchiachi.github.io",
      "http://localhost:8080",
      "http://127.0.0.1:8080"
    ];
    const origin = request.headers.get("Origin");
    const headers = {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    try {
      const { prompt, history } = await request.json();
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt required" }), { status: 400, headers });
      }

      // 2. 呼叫 Gemini 2.0 Flash
      const apiKey = env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `你是深山的幸福道場守門道童。平靜留白、有溫度、不說教、無emoji。主理人簡家旗（台大/主流金融7年/南投深山茶園/老莊為道日損）。若問深奧問題，適時引導至問道之鏡。繁體用NT$，簡體用¥。`;

      const geminiPayload = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [
          ...(history || []),
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Gemini Error" }), { status: res.status, headers });
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "道童默然沏茶，請稍候重試。";
      return new Response(JSON.stringify({ reply }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
};
```

---

## 五、 前端 `app.js` 呼叫與容錯降級標準 (Client Implementation)

在前端呼叫此服務時，必須包含完整的降級防線：

```javascript
// 前端調用示例標準
async function askDaoBoyGemini(query) {
  const WORKER_ENDPOINT = "https://your-daoboy-worker.yourname.workers.dev"; // 由主理人配置

  try {
    const res = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
    throw new Error("API Limit or Error");
  } catch (err) {
    console.warn("Gemini API 未就緒或超額，自動無感切換至本地心法庫:", err);
    // 自動降級：調用本地 content.js 預編譯比對
    return fallbackLocalAnswer(query);
  }
}
```

---

## 六、 驗收判準清單 (Acceptance Criteria)

任何 AI 完成此項功能時，必須通過以下檢查：
1. [x] **託管檢查**：道童預設開啟全自動託管活體對談，訪客無須手動填寫 Key 即可直接對坐。
2. [x] **模型適配**：採用 Google 官方最新 `models/gemini-flash-latest` 端點（自動對應 3.8-flash，已棄用報 404 之 2.0-flash）。
3. [x] **人格檢查**：道童回答嚴格遵守「深山道童」設定，無驚嘆號、無 emoji，文字如山風留白。
4. [x] **分流檢查**：繁體問題以 `NT$` 為單位，簡體問題以 `¥` 為單位。
5. [x] **雙軌容錯**：若遇到 Google 429 限頻、網路中斷或 API 異動，對話視窗絕不報錯，自動以 8 篇長文與老莊智庫流暢回覆。
6. [x] **覆蓋能力**：支援進階使用者在彈窗中輸入私有 API Key 或 Cloudflare 反向代理端點，進行自訂覆蓋。
7. [x] **演進記錄**：在 `CHANGELOG_AI.md` 與 PR 分支記錄完整的決策歷程。

---

## 七、 全自動託管架構與模型端點升級（2026-10 最新實裝標準）

### 7.1 模型端點重大異動 (Breaking Change & Migration)
在 2026-10 實測中，Google AI Studio 已將舊有 `models/gemini-2.0-flash` 與 `models/gemini-2.5-flash` 標記為淘汰並返回 HTTP 404（`is no longer available`）。  
因此，本專案全站統一採用最新穩定端點：
* **模型識別代號**：`gemini-flash-latest`（動態路由至 Google 官方最新的 Gemini 3.8 Flash 系列）
* **請求 URL**：  
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`

### 7.2 全自動託管金鑰（Cloud-Managed Key）實施模式
主理人希望道場能讓所有有緣訪客「推門即進、自發對談」，無需繁瑣的申請與手動填寫金鑰門檻。
1. **設定層級優先順序（Cascade Order）**：
   ```
   訪客對話
     ├─ 1. 優先檢查：localStorage 私有 Key (若訪客自行於齒輪彈窗填寫)
     ├─ 2. 次要檢查：localStorage 自訂代理端點 (如 Cloudflare Worker)
     ├─ 3. 預設託管：DaoSanctuaryData.config.gemini.defaultKey (全站託管活體)
     └─ 4. 安全兜底：8 篇長文與老莊智庫本地 RAG 降級 (遇 429 或超額無感切換)
   ```
2. **金鑰輪換與管理規範**：
   若主理人日後需要更換託管 Key，僅需修改 `js/content.js` 中的 `gemini.defaultKey`，透過 GitHub Actions 或 PR 合併即可全站即時更新。
3. **重大改動開 PR 鐵律**：
   任何涉及道童核心架構、API 金鑰託管或模型版本的升級，**必須開立獨立 Feature 分支（如 `feat/daoboy-gemini-cloud-managed`）並開立 Pull Request**，留下詳細之 Context 與變更記錄，讓未來的協作 AI 與團隊能夠完全掌握脈絡。
