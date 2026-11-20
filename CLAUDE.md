# 給 AI 的說明 (CLAUDE.md)

- 一律用繁體中文回答使用者。
- 本專案是簡家旗「大道至簡 · 深山的幸福道場」一人公司官方網站。
- 先讀 [`AGENTS.md`](AGENTS.md)（規則與流程）與 [`facts.json`](facts.json)（價格、地點、聯絡通道的唯一來源）。
- 動到畫面讀 [`DESIGN.md`](DESIGN.md)；寫或改對外文字讀 [`docs/CRITERIA_LAYER.md`](docs/CRITERIA_LAYER.md)（判準層 v0.3）。
- **改動規則**：開分支，只改根目錄 `index.html`、`js/*.js` 與 `facts.json`，執行 `python3 tools/build_zhcn.py` 與 `python3 tools/check.py`，通過後開 PR。不直接推 main；`tools/push.py` 只限主理人本人使用。
- **重大改變**：在 [`CHANGELOG_AI.md`](CHANGELOG_AI.md) 最下方追加一筆紀錄。
