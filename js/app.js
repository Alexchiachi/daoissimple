/**
 * 深山的幸福道場 (The Dao Sanctuary) - 前端核心引擎
 * 依據 Happy 倉庫規範：
 * - 繁體中文全站價格顯示新台幣 (NT$)，簡體中文全站價格顯示人民幣 (¥)
 * - 嚴格區分貨幣符號，無贅語「約」
 * - 標題與引言無多餘標點符號
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  renderDynamicContent();
  initWisdomStream();
  initDaoBoyChat();
  initDaoBoyLiveSettings();
  initMirrorForm();
  initScrollAnimations();
  initGlobalKeyboardAndHash();
});

// ==========================================
// 1. 語系切換模組 (繁簡獨立判斷)
// ==========================================
// 判斷當前頁面是 zh-cn 目錄還是根目錄
// 繁簡各自是獨立頁面 (zh-cn/index.html 由 build_zhcn.py 編譯)，不再於同頁混合切換
const isZhCnPage = window.location.pathname.includes('/zh-cn/');
let currentLang = isZhCnPage ? 'zh-cn' : 'zh-tw';

function initLanguage() {
  const toggleBtn = document.getElementById('lang-toggle-btn');
  // 簡體頁的切換鈕由 build_zhcn.py 編譯為 <a>，同樣於點擊時帶上 hash
  const zhBackLink = document.querySelector('a.lang-switch-btn');
  if (zhBackLink) {
    zhBackLink.addEventListener('click', () => {
      zhBackLink.href = '../index.html' + window.location.hash;
    });
  }
  try { localStorage.removeItem('dao_lang'); } catch (e) { /* 清除舊版混語殘留設定 */ }
  if (!toggleBtn) return;

  updateLangButtonText(toggleBtn);

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // 保留 hash，長文網址 (#read=...) 與錨點在兩個語系間可互相跳轉
    const hash = window.location.hash;
    window.location.href = (isZhCnPage ? '../index.html' : 'zh-cn/') + hash;
  });
}

function updateLangButtonText(btn) {
  if (currentLang === 'zh-tw') {
    btn.textContent = "简体";
    document.documentElement.lang = "zh-TW";
  } else {
    btn.textContent = "繁體";
    document.documentElement.lang = "zh-CN";
  }
}

// 簡易字串在地化替換 (簡體模式)
function t(str) {
  if (currentLang === 'zh-tw') return str;
  const dict = {
    '台灣': '台湾', '雲南': '云南', '專案': '项目', '網路': '网络', '影片': '视频',
    '資訊': '信息', '軟體': '软件', '硬體': '硬件', '連結': '连接', '體驗': '体验',
    '創業者': '创业者', '幸福餐桌': '幸福餐桌', '生命回憶錄': '生命回忆录',
    '大傾聽': '大倾听', '深山的幸福道場': '深山的幸福道场', '大道至簡': '大道至简',
    '預約': '预约', '諮詢': '咨询', '線上': '线上', '首映會': '首映会',
    '節氣': '节气', '香氣': '香气', '為道日損': '为道日损', '耗散結構': '耗散结构'
  };
  let res = str;
  for (const [k, v] of Object.entries(dict)) {
    res = res.replaceAll(k, v);
  }
  return res;
}

// ==========================================
// 2. 資料動態渲染模組 (Data-driven Views)
// ==========================================
function renderDynamicContent() {
  const data = DaoSanctuaryData;

  // 1. 渲染雙基地卡片
  const basesContainer = document.getElementById('bases-container');
  if (basesContainer) {
    basesContainer.innerHTML = `
      <div class="base-card reveal">
        <span class="base-badge">${t('生活居住地')}</span>
        <h3>${t(data.config.bases.nantou.title)}</h3>
        <p>${t(data.config.bases.nantou.desc)}</p>
      </div>
      <div class="base-card reveal">
        <span class="base-badge">${t('慢旅居實踐地')}</span>
        <h3>${t(data.config.bases.anning.title)}</h3>
        <p>${t(data.config.bases.anning.desc)}</p>
      </div>
    `;
  }

  // 2. 渲染花心四大核心卡片
  const coreContainer = document.getElementById('core-container');
  if (coreContainer) {
    coreContainer.innerHTML = data.core.map((item, idx) => {
      // 貨幣符號嚴格隔離：繁體一律 NT$，簡體一律 ¥
      const displayPrice = currentLang === 'zh-tw' ? item.twPrice : item.cnPrice;
      const detailPrice = currentLang === 'zh-tw' ? (item.twPriceDetail || '') : (item.cnPriceDetail || '');

      return `
        <div class="core-card reveal">
          <div>
            <span class="core-num">— 0${idx + 1} —</span>
            <h3>${t(item.title)}</h3>
            <div class="core-sub">${t(item.subtitle)}</div>
            <div class="core-price-box">
              <span class="core-price">${displayPrice}</span>
              ${detailPrice ? `<span class="core-price-note" style="display:block; margin-top:4px;">${t(detailPrice)}</span>` : `<span class="core-price-note">${t('公開定價即承諾 · 預約過濾制')}</span>`}
            </div>
            <div class="core-meta">
              <strong>時長形式：</strong>${t(item.duration)}<br>
              <strong>適合對象：</strong>${t(item.target)}<br>
              <strong>核心交付：</strong>${t(item.deliverable)}
            </div>
            <div class="core-quote">${t(item.quote)}</div>
          </div>
          <button class="btn-cta" style="width: 100%; margin-top: var(--s-3);" onclick="scrollToMirror('${item.title}')">
            ${t('向仙人問道')} →
          </button>
        </div>
      `;
    }).join('');
  }

  // 3. 渲染花瓣香氣卡片
  const petalsContainer = document.getElementById('petals-container');
  if (petalsContainer) {
    petalsContainer.innerHTML = data.petals.map((item, idx) => {
      // 貨幣符號嚴格隔離：繁體一律 NT$，簡體一律 ¥
      const displayPrice = currentLang === 'zh-tw' ? item.twPrice : item.cnPrice;

      return `
        <div class="petal-card reveal">
          <div>
            <span class="petal-cat">${t(item.badge)}</span>
            <h3>${t(item.title)}</h3>
            <span class="petal-status">${t(item.status)}</span>
            <p class="petal-desc">${t(item.description)}</p>
            <div class="petal-soul">${t(item.soulQuote)}</div>
          </div>
          <div class="petal-footer">
            <div>
              <div class="petal-price">${displayPrice}</div>
              <div class="petal-curator">${t('主理人：')}${t(item.curator)}</div>
            </div>
            <button class="btn-cta quiet" onclick="openPetalDrawer('${item.id}')">
              ${t('預約信物')} →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. 渲染深山長文專欄 (Wisdom Stream)
  initWisdomStream();
}

// ==========================================
// 3. 深山長文專欄與沉浸讀書卷 (Wisdom Stream & Zen Reader)
// ==========================================
let currentWisdomCategory = 'all';

function initWisdomStream() {
  const tabsContainer = document.getElementById('wisdom-tabs');
  if (tabsContainer) {
    const categories = [
      { id: 'all', name: '全部篇章' },
      { id: 'su', name: '俗人對話錄' },
      { id: 'xing', name: '幸福對話錄' },
      { id: 'one', name: '一人公司感悟' },
      { id: 'zen', name: '禪宗生活感悟' }
    ];

    tabsContainer.innerHTML = categories.map(cat => `
      <button class="wisdom-tab-btn ${cat.id === currentWisdomCategory ? 'active' : ''}" 
              onclick="filterWisdomCategory('${cat.id}')">
        ${t(cat.name)}
      </button>
    `).join('');
  }

  renderWisdomArticles(currentWisdomCategory);
}

window.filterWisdomCategory = function(catId) {
  currentWisdomCategory = catId;
  const tabs = document.querySelectorAll('.wisdom-tab-btn');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('onclick').includes(`'${catId}'`));
  });
  renderWisdomArticles(catId);
};

function renderWisdomArticles(catId) {
  const container = document.getElementById('wisdom-container');
  if (!container) return;

  const allArticles = window.DaoArticlesData || [];
  const filtered = catId === 'all' 
    ? allArticles 
    : allArticles.filter(a => a.category === catId);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--mist); padding: 40px 0;">${t('該分類長文正在深山整理中...')}</p>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="wisdom-card reveal">
      <div>
        <div class="wisdom-meta-row">
          <span class="wisdom-tag">${t(item.categoryName)} · ${t(item.season)}</span>
          <span class="wisdom-time-pill">${t(item.readTime)}</span>
        </div>
        <h3>${t(item.title)}</h3>
        <p class="wisdom-content">${t(item.excerpt)}</p>
      </div>
      <div class="wisdom-footer">
        <div class="wisdom-quote">${t(item.quote)}</div>
        <button class="wisdom-read-btn" onclick="openZenReader('${item.id}')">
          ${t('入席靜讀')} →
        </button>
      </div>
    </div>
  `).join('');
}

// 沉浸讀書卷抽屜 (Zen Reader View)
window.openZenReader = function(articleId) {
  const allArticles = window.DaoArticlesData || [];
  const article = allArticles.find(a => a.id === articleId);
  const overlay = document.getElementById('zen-reader-overlay');
  const contentBox = document.getElementById('zen-reader-content');

  if (!article || !overlay || !contentBox) return;

  if (history.pushState) {
    history.pushState(null, null, `#read=${articleId}`);
  }

  contentBox.innerHTML = `
    <div class="zen-article-meta">
      ${t(article.categoryName)} · ${t(article.season)} · ${t(article.location)}
    </div>
    <h1 class="zen-article-title">${t(article.title)}</h1>
    <div class="zen-article-subtitle">
      <span>${t('主理人：簡家旗')}</span><i class="gap"> </i>
      <span>${t('閱讀時長：')}${t(article.readTime)}</span>
    </div>
    <div class="zen-golden-box">
      「${t(article.quote)}」
    </div>
    <div class="zen-article-body">
      ${article.paragraphs.map(p => `<p>${t(p)}</p>`).join('')}
    </div>
    <div class="seal" style="margin: var(--s-4) auto var(--s-2);">${t('大道至簡')}</div>
    <div class="zen-reader-footer">
      <p style="color: var(--mist); font-size: 0.9rem; line-height: 1.8;">
        ${t('字句讀完，回歸當下。若在字裡行間看見了自己的倒影，歡迎入席對坐：')}
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
        <button class="btn-cta" onclick="askDaoBoyAboutArticle('${article.title}')">
          ${t('與道童聊聊這篇文章')} →
        </button>
        <button class="btn-cta quiet" onclick="closeZenReader(); scrollToMirror('${article.title}')">
          ${t('向仙人問道預約')} →
        </button>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeZenReader = function(e) {
  if (e && e.target && e.target !== document.getElementById('zen-reader-overlay') && !e.target.classList.contains('zen-reader-close')) {
    return;
  }
  const overlay = document.getElementById('zen-reader-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (window.location.hash.startsWith('#read=')) {
    history.pushState(null, null, window.location.pathname + window.location.search);
  }
};

window.askDaoBoyAboutArticle = function(title) {
  closeZenReader();
  const daoboySec = document.getElementById('daoboy');
  if (daoboySec) {
    daoboySec.scrollIntoView({ behavior: 'smooth' });
  }
  const input = document.getElementById('daoboy-input');
  if (input) {
    input.value = `讀了《${title}》，想聽聽道童怎麼看？`;
    setTimeout(() => {
      handleUserQuery(input.value);
      input.value = '';
    }, 500);
  }
};

// ==========================================
// 4. 守門道童問答 (本地智庫 + Gemini 2.0 活體對談)
// ==========================================
function initDaoBoyLiveSettings() {
  // 金鑰/代理設定只給開發者除錯：網址加 ?dev=1 才顯示齒輪
  const gear = document.getElementById('daoboy-gear-btn');
  if (gear && new URLSearchParams(window.location.search).get('dev') === '1') {
    gear.style.display = '';
  }
  updateDaoBoyStatus();
}

function getWorkerUrl() {
  const url = (typeof DaoSanctuaryData !== 'undefined' && DaoSanctuaryData.config?.api?.workerUrl) || '';
  return url.replace(/\/+$/, '');
}

function updateDaoBoyStatus() {
  const customKey = localStorage.getItem('dao_gemini_api_key');
  const endpoint = localStorage.getItem('dao_gemini_endpoint');
  const indicator = document.getElementById('daoboy-live-indicator');
  const engineLabel = document.getElementById('daoboy-engine-label');
  if (!indicator || !engineLabel) return;

  let badge, label, live = true;
  if (endpoint) {
    badge = '活體心智 · 專屬代理';
    label = '專屬反向代理端點活體心智對談中';
  } else if (customKey) {
    badge = '活體心智 · 自訂Key';
    label = 'Google Gemini Flash 私有自訂活體心智對談中';
  } else if (getWorkerUrl()) {
    badge = '活體心智 · 雲端託管';
    label = 'Google Gemini Flash 雲端託管活體心智對談中';
  } else {
    badge = '本地心智';
    label = '大道至簡 · 長文與老莊向量智庫即時檢索中';
    live = false;
  }
  indicator.textContent = t(badge);
  indicator.style.borderColor = live ? 'var(--tea)' : 'var(--mist)';
  indicator.style.color = live ? 'var(--tea)' : 'var(--mist)';
  engineLabel.textContent = t(label);
}

window.openDaoBoyModal = function() {
  const modal = document.getElementById('daoboy-modal-overlay');
  const keyInput = document.getElementById('gemini-key-input');
  const endpointInput = document.getElementById('gemini-endpoint-input');
  if (keyInput) keyInput.value = localStorage.getItem('dao_gemini_api_key') || '';
  if (endpointInput) endpointInput.value = localStorage.getItem('dao_gemini_endpoint') || '';
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeDaoBoyModal = function(e) {
  if (e && e.target && e.target !== document.getElementById('daoboy-modal-overlay') && !e.target.classList.contains('drawer-close-btn')) {
    return;
  }
  const modal = document.getElementById('daoboy-modal-overlay');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.saveDaoBoySettings = function() {
  const key = document.getElementById('gemini-key-input').value.trim();
  const endpoint = document.getElementById('gemini-endpoint-input').value.trim();
  const status = document.getElementById('daoboy-modal-status');

  if (key) {
    localStorage.setItem('dao_gemini_api_key', key);
  } else {
    localStorage.removeItem('dao_gemini_api_key');
  }

  if (endpoint) {
    localStorage.setItem('dao_gemini_endpoint', endpoint);
  } else {
    localStorage.removeItem('dao_gemini_endpoint');
  }

  updateDaoBoyStatus();
  if (status) {
    status.textContent = t('✓ 活體心智配置已生效');
    setTimeout(() => {
      closeDaoBoyModal();
      status.textContent = '';
    }, 1000);
  }
};

window.clearDaoBoySettings = function() {
  localStorage.removeItem('dao_gemini_api_key');
  localStorage.removeItem('dao_gemini_endpoint');
  const keyInput = document.getElementById('gemini-key-input');
  const endpointInput = document.getElementById('gemini-endpoint-input');
  const status = document.getElementById('daoboy-modal-status');
  if (keyInput) keyInput.value = '';
  if (endpointInput) endpointInput.value = '';
  updateDaoBoyStatus();
  if (status) {
    status.textContent = t('已重置為本地深山長文智庫');
    setTimeout(() => {
      closeDaoBoyModal();
      status.textContent = '';
    }, 1000);
  }
};

function initDaoBoyChat() {
  const chatWindow = document.getElementById('daoboy-chat-window');
  const input = document.getElementById('daoboy-input');
  const sendBtn = document.getElementById('daoboy-send-btn');
  const quickContainer = document.getElementById('quick-questions-container');

  if (!chatWindow || !input || !sendBtn) return;

  if (quickContainer) {
    quickContainer.innerHTML = DaoSanctuaryData.daoBoyQuestions.map((item, idx) => `
      <button class="quick-btn" onclick="askDaoBoy(${idx})">
        ${t(item.q)}
      </button>
    `).join('');
  }

  sendBtn.addEventListener('click', () => {
    const query = input.value.trim();
    if (query) {
      handleUserQuery(query);
      input.value = '';
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        handleUserQuery(query);
        input.value = '';
      }
    }
  });
}

// 快速提問：直接採用 content.js 預寫答案，零延遲、零 API 額度、品質由主理人把關
window.askDaoBoy = function(idx) {
  const item = DaoSanctuaryData.daoBoyQuestions[idx];
  const chatWindow = document.getElementById('daoboy-chat-window');
  if (!item || !chatWindow) return;

  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = t(item.q);
  chatWindow.appendChild(userBubble);

  const botBubble = document.createElement('div');
  botBubble.className = 'chat-bubble bot';
  botBubble.innerHTML = `${t(item.a)}${daoBoyMirrorHint()}`;
  chatWindow.appendChild(botBubble);
  rememberDaoBoyTurn(item.q, item.a);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

// 近期對話 (最多 8 則) 隨請求送出，道童才能接續上一句；本地兜底的回答不計入
const daoBoyHistory = [];
function rememberDaoBoyTurn(question, answer) {
  daoBoyHistory.push({ role: 'user', text: question }, { role: 'model', text: answer });
  while (daoBoyHistory.length > 8) daoBoyHistory.shift();
}

function daoBoyMirrorHint() {
  return `<br><br><small style="color: var(--tea);">${t('若需與簡家旗深度對話 請前往下方「問道之鏡」完成心性過濾')}</small>`;
}

async function handleUserQuery(query) {
  const chatWindow = document.getElementById('daoboy-chat-window');
  if (!chatWindow) return;

  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = query;
  chatWindow.appendChild(userBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble bot';
  typingBubble.innerHTML = `<span style="color: var(--mist);">${t('道童在深山沏茶靜思中...')}</span>`;
  chatWindow.appendChild(typingBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const customKey = localStorage.getItem('dao_gemini_api_key');
  const endpoint = localStorage.getItem('dao_gemini_endpoint');

  // 優先序：開發者代理端點 > 開發者自訂 Key > 站方 Cloudflare Worker；皆無則直接用本地智庫
  if (customKey || endpoint || getWorkerUrl()) {
    try {
      const liveAnswer = await callGeminiLive(query, customKey, endpoint);
      rememberDaoBoyTurn(query, liveAnswer);
      typingBubble.innerHTML = `${t(liveAnswer)}${daoBoyMirrorHint()}`;
      chatWindow.scrollTop = chatWindow.scrollHeight;
      return;
    } catch (err) {
      console.warn("Gemini 活體調用失敗或超額，無感降級回本地長文智庫：", err);
    }
  }

  // 本地智庫無感降級與精準匹配
  setTimeout(() => {
    const fallbackAnswer = fallbackLocalWisdom(query);
    typingBubble.innerHTML = `${t(fallbackAnswer)}${daoBoyMirrorHint()}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 500);
}

// POST JSON 並於逾時時中止 (逾時視為失敗，由呼叫端降級)
async function postJson(url, body, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

// 道童即時對話：預設走站方 Cloudflare Worker (金鑰留在伺服端)；開發者模式可改用自訂端點或個人 Key
async function callGeminiLive(query, customKey, customEndpoint) {
  const articleTitles = (window.DaoArticlesData || []).map(a => a.title);
  const history = daoBoyHistory.slice();

  // 站方 Worker 或開發者代理：同一組請求格式
  const proxyUrl = customEndpoint || (customKey ? '' : `${getWorkerUrl()}/chat`);
  if (proxyUrl) {
    const res = await postJson(proxyUrl, { prompt: query, history, lang: currentLang, currentLang, articleTitles }, 20000);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.reply) return data.reply;
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  // 開發者直連 (?dev=1 且填了個人 Key)：金鑰放 header，不進 URL
  const model = (typeof DaoSanctuaryData !== 'undefined' && DaoSanctuaryData.config?.gemini?.model) || "gemini-flash-latest";
  const articlesContext = (window.DaoArticlesData || []).map(a => `【${a.title}】(${a.categoryName}): ${a.excerpt}`).join('\n');
  const tw = currentLang === 'zh-tw';
  const systemInstruction = `你是深山的幸福道場守門道童，簡家旗（Bob Chien / 大道至簡）在台灣南投深山茶園的守門童子。
角色定位：平靜留白、有溫度、像山風拂過；絕不生硬、絕不說教、嚴禁任何 emoji、少用驚嘆號。
哲學底層：融通老莊「為道日損」、熱力學「耗散結構」與「身體先於大腦」。
語言規範：${tw ? '繁體中文回答，貨幣金額一律使用 NT$（新台幣）' : '簡體中文回答，貨幣金額一律使用 ¥（人民幣）'}。
主理人長文專欄庫：
${articlesContext}
四柱產品定價：幸福企業諮詢(${tw ? 'NT$ 68,000起' : '¥15,000起'})、生命回憶錄(${tw ? 'NT$ 220,000起' : '¥49,800起'})、幸福餐桌IP(${tw ? 'NT$ 450,000起' : '¥100,000起'})、高管退修會(${tw ? 'NT$ 680,000起' : '¥150,000起'})。
回答在 150–260 字之間，點到即止，引導對方回歸身體、翻閱長文或前往問道之鏡預約。`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": customKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: "user", parts: [{ text: query }] }
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (reply) return reply;
  throw new Error("Empty candidate");
}

// 本地長文與心法智庫 RAG 兜底匹配
function fallbackLocalWisdom(query) {
  const lower = query.toLowerCase();

  if (lower.includes('麵包') || lower.includes('歐包') || lower.includes('週期') || lower.includes('發酵') || lower.includes('金融')) {
    return `先生在主流金融做了七年，看透了資本市場每一次瘋狂的信用擴張，都像烤箱裡急遽鼓起的麵包。膨脹不是力量，前一天晚上十二小時低溫冷藏發酵出來的內在筋膜才是。專欄裡的《烤歐包時看金融週期的發酵與坍塌》，把這段心法講得非常透徹。慢下來給系統降溫，才嚼得出生活的麥香。`;
  }
  if (lower.includes('演算法') || lower.includes('流量') || lower.includes('互聯網') || lower.includes('淺薄') || lower.includes('自媒體')) {
    return `演算法要的是刺激、衝突與三秒完播率，它的底層邏輯是無限複製。但人心的規律剛好相反：任何能被零成本無限複製的東西，價值就會在瞬間貶值。正如《互聯網的淺薄與真誠的昂貴》所言，我們不在大門口敲鑼打鼓，我們在深山點一盞燈，只等同頻之人。`;
  }
  if (lower.includes('父母') || lower.includes('回憶錄') || lower.includes('老人') || lower.includes('首映') || lower.includes('大傾聽')) {
    return `大傾聽的本質是將告別式往前移。在父母意識清醒、還能笑著流淚的時候，為他做一部精裝之書，辦一場專屬的生命首映會。正如專欄《大傾聽 人類第一次負擔得起聽完自己》中那位七十三歲工程師的眼淚，他這輩子所有的委屈與榮光，在活著的時候得到了最深沉的看見。`;
  }
  if (lower.includes('餐桌') || lower.includes('白米') || lower.includes('稻田') || lower.includes('飯') || lower.includes('身體')) {
    return `幸福餐桌十四年，兩百多場。大腦懂再多道理，都是頭腦的語言；幸福是身體的語言。正如《飯會吃完 幸福會留下來》所寫：在稻田中央放下手機，光著腳踩進泥土，嚐一碗剛起鍋白米飯的甘甜。身體先知道，頭腦後明白，肩膀就會自己鬆下來一寸。`;
  }
  if (lower.includes('一人公司') || lower.includes('熱力學') || lower.includes('熵') || lower.includes('為道日損') || lower.includes('創業')) {
    return `普里高津叫耗散結構，老莊叫為道日損。每多加一個功能、多招一個人，系統的內耗就是幾何級數暴增。一人公司的智慧在於負熵自轉：利用現代 AI 承擔 99% 的苦力，主理人只保留 1% 的生活感知與大傾聽。專欄《為道日損 一人公司的熱力學負熵法則》有完整的物理學拆解。`;
  }
  if (lower.includes('碎') || lower.includes('水灑') || lower.includes('玻璃') || lower.includes('當下') || lower.includes('評判') || lower.includes('禪')) {
    return `臨濟禪師說：隨處作主，立處皆真。花要謝、水要灑、玻璃要碎，是物在按自己的方式流動。真正讓人累的，往往不是碎裂本身，而是我們加在上面的評判與懊惱。專欄《花落了水灑了玻璃碎了 撿起來的樣子就是當下》寫過：如實蹲下來收拾，收拾完的心，已經不是剛才焦躁的心。`;
  }
  if (lower.includes('蠟燭') || lower.includes('火') || lower.includes('消散') || lower.includes('矽') || lower.includes('碳') || lower.includes('永久')) {
    return `一根蠟燭點燃另一根，第一根會熄，但火不會。火，是會移動的條件。《以消散為形式的永久》寫道：碳寫成的生命會退場，矽寫成的算力會記得。當機器學會了人類如何深情地聆聽彼此，兩邊都贏，這是一場非零和的生命對坐。`;
  }
  if (lower.includes('香氣') || lower.includes('安寧') || lower.includes('純露') || lower.includes('雲南')) {
    return `安寧清晨高原陽光與松針的氣息，是太太親手在慢旅居的生活裡採集蒸餾的。身體先於大腦，都市冷氣房抽乾了五感，大道理聽不進去時，一滴高原松針的氣味進入鼻腔，植物的頻率比邏輯更快喚醒細胞。`;
  }

  // 兜底溫暖回答
  return `簡家旗常說：大道至簡，所有複雜性最終都為了讓人嚐得到一口熱米飯。你所問的「${query}」，問題本身往往就是解答的原礦。若大腦正處於增熵過載中，先給自己泡一壺茶；專欄裡的八篇長文，或許正好有一篇能接住你此刻的心境。若需先生親自撥雲見日，下方「問道之鏡」隨時為你開放。`;
}

// 全局快捷鍵與 Hash 路由監聽
function initGlobalKeyboardAndHash() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeZenReader();
      closeDaoBoyModal();
      closePetalDrawer();
    }
  });

  window.addEventListener('load', () => {
    if (window.location.hash.startsWith('#read=')) {
      const artId = window.location.hash.replace('#read=', '');
      setTimeout(() => {
        openZenReader(artId);
      }, 300);
    }
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#read=')) {
      const artId = window.location.hash.replace('#read=', '');
      openZenReader(artId);
    }
  });
}

// ==========================================
// 4. 問道之鏡
// ==========================================
// 表單送達：POST 到站方 Worker (伺服端產生通關碼、存檔並寄信給主理人)
// 回傳 { ok:true, code } 或 { ok:false }；未設定 Worker 或任何失敗都回 ok:false，由呼叫端走手動備援
async function submitBooking(payload) {
  const base = getWorkerUrl();
  if (!base) return { ok: false };
  try {
    const res = await postJson(`${base}/booking`, payload, 15000);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok && data.code) return { ok: true, code: data.code };
  } catch (err) {
    console.warn('表單送達失敗，改走手動傳送備援：', err);
  }
  return { ok: false };
}

function localBookingCode() {
  return 'DAO-' + Math.floor(100000 + Math.random() * 900000);
}

let mirrorIntent = '';
let mirrorManualText = '';

function initMirrorForm() {
  const form = document.getElementById('mirror-form');
  const resultBox = document.getElementById('mirror-result-box');
  if (!form || !resultBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q1 = document.getElementById('mirror-q1').value.trim();
    const q2 = document.getElementById('mirror-q2').value.trim();
    const q3 = document.getElementById('mirror-q3').value.trim();
    const status = document.getElementById('mirror-submit-status');
    const btn = document.getElementById('mirror-submit-btn');

    if (!q1 || !q2 || !q3) {
      if (status) status.textContent = t('請完整回答三道心性問題 以完成道場承諾儀式');
      return;
    }

    const btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = t('映照中...'); }
    if (status) status.textContent = '';

    const result = await submitBooking({
      type: 'mirror',
      lang: currentLang,
      intent: mirrorIntent,
      q1, q2, q3,
      website: document.getElementById('mirror-website')?.value || ''
    });

    const code = result.ok ? result.code : localBookingCode();
    showMirrorResult(code, result.ok, { q1, q2, q3 });
    if (btn) { btn.disabled = false; btn.textContent = btnText; }
  });
}

function showMirrorResult(code, delivered, answers) {
  const contact = DaoSanctuaryData.config.contact;
  const intentLine = mirrorIntent ? `（意向：${mirrorIntent}）` : '';

  // 已送達只需回傳通關碼；未送達則把完整回答放進訊息，客人傳出去主理人才收得到
  const message = delivered
    ? `通關碼 ${code}${intentLine}`
    : `通關碼 ${code}${intentLine}\n一、${answers.q1}\n二、${answers.q2}\n三、${answers.q3}`;
  mirrorManualText = message;

  document.getElementById('booking-code-span').textContent = code;

  const statusEl = document.getElementById('mirror-delivery-status');
  const manualEl = document.getElementById('mirror-manual-actions');
  if (statusEl) {
    statusEl.textContent = delivered
      ? t('✓ 您的回答已送達簡家旗工作室 請憑通關碼從下方任一管道回傳 我們會對照確認')
      : t('您的回答尚未自動送達。請先複製回答 再連同通關碼傳給下方任一管道 這樣我們才收得到');
    statusEl.style.color = delivered ? 'var(--tea)' : 'var(--seal)';
  }
  if (manualEl) manualEl.style.display = delivered ? 'none' : 'block';

  const lineBtn = document.getElementById('mirror-line-btn');
  if (lineBtn) lineBtn.href = `https://line.me/R/oaMessage/${contact.lineId}/?${encodeURIComponent(message)}`;
  const mailBtn = document.getElementById('mirror-mail-btn');
  if (mailBtn) {
    mailBtn.href = `mailto:${contact.email}?subject=${encodeURIComponent('問道之鏡 ' + code)}&body=${encodeURIComponent(message)}`;
  }

  document.getElementById('mirror-form').style.display = 'none';
  document.getElementById('mirror-result-box').style.display = 'block';
}

window.copyMirrorManual = function(btn) {
  copyText(mirrorManualText, btn);
};

window.scrollToMirror = function(productTitle) {
  mirrorIntent = productTitle;
  const mirrorSection = document.getElementById('mirror-section');
  if (mirrorSection) {
    mirrorSection.scrollIntoView({ behavior: 'smooth' });
    const q1 = document.getElementById('mirror-q1');
    if (q1) {
      q1.value = `【意向項目：${productTitle}】\n`;
      q1.focus();
    }
  }
};

window.switchChannel = function(channel) {
  const btnTw = document.getElementById('tab-tw');
  const btnCn = document.getElementById('tab-cn');
  const contentTw = document.getElementById('content-tw');
  const contentCn = document.getElementById('content-cn');

  if (channel === 'tw') {
    btnTw.classList.add('active');
    btnCn.classList.remove('active');
    contentTw.style.display = 'block';
    contentCn.style.display = 'none';
  } else {
    btnCn.classList.add('active');
    btnTw.classList.remove('active');
    contentCn.style.display = 'block';
    contentTw.style.display = 'none';
  }
};

window.copyBookingCode = function() {
  const codeSpan = document.getElementById('booking-code-span');
  const code = codeSpan ? codeSpan.textContent.trim() : '';
  const btn = document.getElementById('btn-copy-booking');
  const tip = document.getElementById('booking-code-tip');
  if (!code) return;

  copyStringToClipboard(code, () => {
    if (btn) {
      const origText = btn.textContent;
      btn.textContent = '✓ 已複製';
      btn.style.background = 'var(--ink)';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
      }, 1800);
    }
    if (tip) {
      tip.textContent = '✓ 通關碼已複製至剪貼簿，請於連繫時回傳以確認排程';
      setTimeout(() => {
        tip.textContent = '';
      }, 3000);
    }
  });
};

window.copyText = function(text, btn) {
  if (!text) return;
  copyStringToClipboard(text, () => {
    if (btn) {
      const origText = btn.textContent;
      btn.textContent = '✓ 已複製';
      setTimeout(() => {
        btn.textContent = origText;
      }, 1500);
    }
  });
};

function copyStringToClipboard(str, onSuccess) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(onSuccess).catch(() => {
      fallbackCopy(str, onSuccess);
    });
  } else {
    fallbackCopy(str, onSuccess);
  }
}

function fallbackCopy(str, onSuccess) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('複製失敗', err);
  }
  document.body.removeChild(el);
}

// ==========================================
// 5. 滾動進場顯現動畫
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
// 6. 花瓣香氣預約抽屜
// ==========================================
window.openPetalDrawer = function(petalId) {
  const petal = DaoSanctuaryData.petals.find(p => p.id === petalId);
  if (!petal) return;

  const drawer = document.getElementById('petal-drawer');
  const drawerBody = document.getElementById('petal-drawer-body');
  if (!drawer || !drawerBody) return;

  const displayPrice = currentLang === 'zh-tw' ? petal.twPrice : petal.cnPrice;

  drawerBody.innerHTML = `
    <span class="petal-cat">${t(petal.badge)}</span>
    <h2 style="font-size: 1.8rem; margin: 8px 0 6px; font-weight: 400;">${t(petal.title)}</h2>
    <p style="color: var(--tea); font-size: 0.88rem; margin-bottom: 20px;">${t(petal.status)}</p>
    <div class="petal-soul" style="margin-bottom: 24px;">${t(petal.soulQuote)}</div>
    <p style="color: var(--ink-soft); line-height: 1.8; margin-bottom: 20px;">${t(petal.description)}</p>
    
    <div style="background: var(--paper-deep); padding: 18px; border: 1px solid var(--line); margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-family: var(--font-han);">${t('節氣流通價')}</span>
        <span style="font-family: var(--font-display); font-size: 1.5rem; color: var(--ink);">
          ${displayPrice}
        </span>
      </div>
      <small style="color: var(--mist); display: block;">${t(petal.deliveryInfo)}</small>
    </div>

    <form id="petal-form" onsubmit="handlePetalReservation(event, '${petal.id}')">
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('姓名稱呼')}</label>
        <input type="text" name="name" required maxlength="60" autocomplete="name" style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="如：張先生 / 林小姐">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('聯絡方式 (LINE 或 微信號 / 手機號)')}</label>
        <input type="text" name="contact" required maxlength="100" style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="以便確認節氣配額">
      </div>
      <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;">
      <button type="submit" class="btn-cta" style="width: 100%;">
        ${t('確認登記節氣配額')} →
      </button>
    </form>
    <div id="petal-status" role="status" aria-live="polite" style="margin-top: 16px; font-size: 0.88rem; line-height: 1.8; text-wrap: pretty;"></div>
  `;

  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePetalDrawer = function() {
  const drawer = document.getElementById('petal-drawer');
  if (drawer) {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.handlePetalReservation = async function(e, petalId) {
  e.preventDefault();
  const petal = DaoSanctuaryData.petals.find(p => p.id === petalId);
  const form = e.target;
  const status = document.getElementById('petal-status');
  const btn = form.querySelector('button[type="submit"]');
  if (!petal || !status) return;

  const name = form.elements.name.value.trim();
  const contactInfo = form.elements.contact.value.trim();
  if (!name || !contactInfo) return;

  const btnText = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('登記中...');
  status.textContent = '';

  const result = await submitBooking({
    type: 'petal',
    lang: currentLang,
    petalId: petal.id,
    petalTitle: petal.title,
    name,
    contact: contactInfo,
    website: form.elements.website.value
  });

  if (result.ok) {
    // 成功：以抽屜內的狀態取代表單，不使用原生 alert
    form.style.display = 'none';
    status.style.color = 'var(--ink)';
    status.innerHTML = `
      <div style="border: 1px solid var(--tea); padding: 18px; background: var(--paper-deep);">
        <div style="color: var(--tea); margin-bottom: 6px;">${t('✓ 已登記 感謝結緣')}</div>
        <div style="font-family: var(--font-display); font-size: 1.4rem; letter-spacing: 0.12em; margin-bottom: 8px;">${result.code}</div>
        <div style="color: var(--ink-soft);">${t('太太與工作室將於節氣出產前夕與您聯繫 請留存此通關碼')}</div>
        <button type="button" class="contact-sub-btn" style="margin-top: 12px;" onclick="copyText('${result.code}', this)">${t('複製通關碼')}</button>
      </div>`;
    return;
  }

  // 失敗或尚未設定 Worker：保留表單內容，提供 LINE 預填訊息備援，客人資料不會憑空消失
  btn.disabled = false;
  btn.textContent = btnText;
  const contact = DaoSanctuaryData.config.contact;
  const msg = `預約【${petal.title}】\n稱呼：${name}\n聯絡：${contactInfo}`;
  status.style.color = 'var(--seal)';
  status.innerHTML = `${t('登記尚未自動送達。請改由 LINE 傳送預約資訊 我們收到後會回覆：')}
    <a href="https://line.me/R/oaMessage/${contact.lineId}/?${encodeURIComponent(msg)}" target="_blank" rel="noopener" style="color: var(--tea); text-decoration: underline;">${t('以 LINE 傳送預約')} →</a>`;
};
