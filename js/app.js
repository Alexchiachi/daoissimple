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
  initDaoBoyChat();
  initMirrorForm();
  initScrollAnimations();
});

// ==========================================
// 1. 語系切換模組 (繁簡獨立判斷)
// ==========================================
// 判斷當前頁面是 zh-cn 目錄還是根目錄
const isZhCnPage = window.location.pathname.includes('/zh-cn/');
let currentLang = isZhCnPage ? 'zh-cn' : (localStorage.getItem('dao_lang') || 'zh-tw');

function initLanguage() {
  const toggleBtn = document.getElementById('lang-toggle-btn');
  if (!toggleBtn) return;

  updateLangButtonText(toggleBtn);

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isZhCnPage) {
      window.location.href = '../index.html';
    } else {
      currentLang = currentLang === 'zh-tw' ? 'zh-cn' : 'zh-tw';
      localStorage.setItem('dao_lang', currentLang);
      if (currentLang === 'zh-cn' && document.getElementById('link-to-zhcn')) {
        window.location.href = 'zh-cn/index.html';
      } else {
        updateLangButtonText(toggleBtn);
        renderDynamicContent();
      }
    }
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

  // 4. 渲染俗人對話錄
  const wisdomContainer = document.getElementById('wisdom-container');
  if (wisdomContainer) {
    wisdomContainer.innerHTML = data.wisdomStream.map((item, idx) => `
      <div class="wisdom-card reveal">
        <div class="wisdom-tag">${t(item.tag)} · ${t(item.date)}</div>
        <h3>${t(item.title)}</h3>
        <p class="wisdom-content">${t(item.content)}</p>
        <div class="wisdom-quote">${t(item.quote)}</div>
      </div>
    `).join('');
  }
}

// ==========================================
// 3. 守門道童問答
// ==========================================
function initDaoBoyChat() {
  const chatWindow = document.getElementById('daoboy-chat-window');
  const input = document.getElementById('daoboy-input');
  const sendBtn = document.getElementById('daoboy-send-btn');
  const quickContainer = document.getElementById('quick-questions-container');

  if (!chatWindow || !input || !sendBtn) return;

  if (quickContainer) {
    quickContainer.innerHTML = DaoSanctuaryData.daoBoyQuestions.map(item => `
      <button class="quick-btn" onclick="askDaoBoy('${item.q.replace(/'/g, "\\'")}')">
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

window.askDaoBoy = function(question) {
  handleUserQuery(question);
};

function handleUserQuery(query) {
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

  setTimeout(() => {
    let matchedAnswer = null;
    const lowerQuery = query.toLowerCase();

    for (const item of DaoSanctuaryData.daoBoyQuestions) {
      if (lowerQuery.includes('焦慮') || lowerQuery.includes('過載') || lowerQuery.includes('創業') || lowerQuery.includes('失眠')) {
        matchedAnswer = DaoSanctuaryData.daoBoyQuestions[0].a;
        break;
      } else if (lowerQuery.includes('父母') || lowerQuery.includes('回憶錄') || lowerQuery.includes('首映')) {
        matchedAnswer = DaoSanctuaryData.daoBoyQuestions[1].a;
        break;
      } else if (lowerQuery.includes('金融') || lowerQuery.includes('老莊') || lowerQuery.includes('餐桌')) {
        matchedAnswer = DaoSanctuaryData.daoBoyQuestions[2].a;
        break;
      } else if (lowerQuery.includes('香氣') || lowerQuery.includes('安寧') || lowerQuery.includes('雲南')) {
        matchedAnswer = DaoSanctuaryData.daoBoyQuestions[3].a;
        break;
      }
    }

    if (!matchedAnswer) {
      matchedAnswer = `簡家旗常說：大道至簡，所有複雜性最終都為了讓人嚐得到一口熱米飯。你所問的「${query}」，問題本身往往就是解答的原礦。若大腦正處於增熵過載中，先給自己泡一壺茶；若需要仙人親自一對一撥雲見日，歡迎點擊下方「問道之鏡」預約深山連線。`;
    }

    typingBubble.innerHTML = `${t(matchedAnswer)}<br><br><small style="color: var(--tea);">👉 ${t('若需與簡家旗深度對話 請前往下方「問道之鏡」完成心性過濾')}</small>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 600);
}

// ==========================================
// 4. 問道之鏡
// ==========================================
function initMirrorForm() {
  const form = document.getElementById('mirror-form');
  const resultBox = document.getElementById('mirror-result-box');
  if (!form || !resultBox) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q1 = document.getElementById('mirror-q1').value;
    const q2 = document.getElementById('mirror-q2').value;
    const q3 = document.getElementById('mirror-q3').value;

    if (!q1 || !q2 || !q3) {
      alert(t('請完整回答三道心性問題 以完成道場承諾儀式'));
      return;
    }

    form.style.display = 'none';
    resultBox.style.display = 'block';

    const bookingCode = 'DAO-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('booking-code-span').textContent = bookingCode;
  });
}

window.scrollToMirror = function(productTitle) {
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

    <form onsubmit="handlePetalReservation(event, '${petal.title}')">
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('姓名稱呼')}</label>
        <input type="text" required style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="如：張先生 / 林小姐">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('聯絡方式 (LINE 或 微信號 / 手機號)')}</label>
        <input type="text" required style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="以便確認節氣配額">
      </div>
      <button type="submit" class="btn-cta" style="width: 100%;">
        ${t('確認登記節氣配額')} →
      </button>
    </form>
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

window.handlePetalReservation = function(e, title) {
  e.preventDefault();
  alert(t(`感謝結緣 已記錄您對【${title}】的節氣預約 太太與工作室將於節氣出產前夕與您聯繫`));
  closePetalDrawer();
};
