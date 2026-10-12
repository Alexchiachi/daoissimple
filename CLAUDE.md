# 給 AI 的說明 (CLAUDE.md)

- 一律用繁體中文回答使用者。
- 本專案是簡家旗「大道至簡 · 深山的幸福道場」一人公司官方網站。
- 完整的專案背景、商業架構與維護指南請先讀 [`AGENTS.md`](AGENTS.md)。
- 視覺規範、色票與字體排印規範請嚴格遵守 [`DESIGN.md`](DESIGN.md)。
- 完整的建置脈絡、架構決策 (ADR) 與演進日誌請讀 [`CHANGELOG_AI.md`](CHANGELOG_AI.md)。
- **重大改變鐵律**：任何重大改變均需寫入 `CHANGELOG_AI.md`，供後續 AI 快速接軌。
- **標題一律去除標點符號**，置中行必須加上 `margin-right: -0.15em` 抵銷 `letter-spacing`。
- **貨幣符號嚴格分流**：繁體中文主頁一律使用 `NT$`，簡體中文版一律使用 `¥`。
- **改動規則**：只改根目錄 `index.html` 與 `js/content.js`，改完執行 `python3 tools/build_zhcn.py` 重建簡體版，再用 `python3 tools/push.py` 推送。
