/**
 * 深山的幸福道场 (The Dao Sanctuary) - 前端内核引擎
 * 依据 Happy 仓库规范：
 * - 繁体中文全站价格显示新台币 (NT$)，简体中文全站价格显示人民币 (¥)
 * - 严格区分货币符号，无赘语「约」
 * - 标题与引言无多余标点符号
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
// 1. 语系切换模块 (繁简独立判断)
// ==========================================
// 判断当前页面是 zh-cn 目录还是根目录
// 繁简各自是独立页面 (zh-cn/index.html 由 build_zhcn.py 编译)，不再于同页混合切换
const isZhCnPage = window.location.pathname.includes('/zh-cn/');
let currentLang = isZhCnPage ? 'zh-cn' : 'zh-tw';

function initLanguage() {
  const toggleBtn = document.getElementById('lang-toggle-btn');
  // 简体页的切换钮由 build_zhcn.py 编译为 <a>，同样于点击时带上 hash
  const zhBackLink = document.querySelector('a.lang-switch-btn');
  if (zhBackLink) {
    zhBackLink.addEventListener('click', () => {
      zhBackLink.href = '../index.html' + window.location.hash;
    });
  }
  try { localStorage.removeItem('dao_lang'); } catch (e) { /* 清除旧版混语残留设置 */ }
  if (!toggleBtn) return;

  updateLangButtonText(toggleBtn);

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // 保留 hash，长文网址 (#read=...) 与锚点在两个语系间可互相跳转
    const hash = window.location.hash;
    window.location.href = (isZhCnPage ? '../index.html' : 'zh-cn/') + hash;
  });
}

function updateLangButtonText(btn) {
  if (currentLang === 'zh-tw') {
    btn.textContent = "简体";
    document.documentElement.lang = "zh-TW";
  } else {
    btn.textContent = "繁体";
    document.documentElement.lang = "zh-CN";
  }
}

// 接口字符串的繁简转换已在建置时完成 (tools/build_zhcn.py 会把本档与数据档整份转成 zh-cn/*.js)，
// 这里保留 t() 只是让既有调用处不必改动；运行期不再做任何字符串替换。
function t(str) {
  return str;
}

// ==========================================
// 2. 数据动态渲染模块 (Data-driven Views)
// ==========================================
function renderDynamicContent() {
  const data = DaoSanctuaryData;

  // 1. 渲染双基地卡片
  const basesContainer = document.getElementById('bases-container');
  if (basesContainer) {
    basesContainer.innerHTML = `
      <div class="base-card reveal">
        <span class="base-badge">${t('生活居住地')}</span>
        <h3>${t(data.config.bases.nantou.title)}</h3>
        <p>${t(data.config.bases.nantou.desc)}</p>
      </div>
      <div class="base-card reveal">
        <span class="base-badge">${t('慢旅居实践地')}</span>
        <h3>${t(data.config.bases.anning.title)}</h3>
        <p>${t(data.config.bases.anning.desc)}</p>
      </div>
    `;
  }

  // 2. 渲染花心四大内核卡片
  const coreContainer = document.getElementById('core-container');
  if (coreContainer) {
    coreContainer.innerHTML = data.core.map((item, idx) => {
      // 货币符号严格隔离：繁体一律 NT$，简体一律 ¥
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
              ${detailPrice ? `<span class="core-price-note" style="display:block; margin-top:4px;">${t(detailPrice)}</span>` : `<span class="core-price-note">${t('公开定价即承诺 · 预约过滤制')}</span>`}
            </div>
            <div class="core-meta">
              <strong>时长形式：</strong>${t(item.duration)}<br>
              <strong>适合对象：</strong>${t(item.target)}<br>
              <strong>内核交付：</strong>${t(item.deliverable)}
            </div>
            <div class="core-quote">${t(item.quote)}</div>
          </div>
          <button class="btn-cta" style="width: 100%; margin-top: var(--s-3);" onclick="scrollToMirror('${item.title}')">
            ${t('向仙人问道')} →
          </button>
        </div>
      `;
    }).join('');
  }

  // 3. 渲染花瓣香气卡片
  const petalsContainer = document.getElementById('petals-container');
  if (petalsContainer) {
    petalsContainer.innerHTML = data.petals.map((item, idx) => {
      // 货币符号严格隔离：繁体一律 NT$，简体一律 ¥
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
              ${t('预约信物')} →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. 渲染深山长文专栏 (Wisdom Stream)
  initWisdomStream();
}

// ==========================================
// 3. 深山长文专栏与沉浸读书卷 (Wisdom Stream & Zen Reader)
// ==========================================
let currentWisdomCategory = 'all';

function initWisdomStream() {
  const tabsContainer = document.getElementById('wisdom-tabs');
  if (tabsContainer) {
    const categories = [
      { id: 'all', name: '全部篇章' },
      { id: 'su', name: '俗人对话录' },
      { id: 'xing', name: '幸福对话录' },
      { id: 'one', name: '一人公司感悟' },
      { id: 'zen', name: '禅宗生活感悟' }
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
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--mist); padding: 40px 0;">${t('该分类长文正在深山整理中...')}</p>`;
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
          ${t('入席静读')} →
        </button>
      </div>
    </div>
  `).join('');
}

// 沉浸读书卷抽屉 (Zen Reader View)
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
      <span>${t('主理人：简家旗')}</span><i class="gap"> </i>
      <span>${t('阅读时长：')}${t(article.readTime)}</span>
    </div>
    <div class="zen-golden-box">
      「${t(article.quote)}」
    </div>
    <div class="zen-article-body">
      ${article.paragraphs.map(p => `<p>${t(p)}</p>`).join('')}
    </div>
    <div class="seal" style="margin: var(--s-4) auto var(--s-2);">${t('大道至简')}</div>
    <div class="zen-reader-footer">
      <p style="color: var(--mist); font-size: 0.9rem; line-height: 1.8;">
        ${t('字句读完，回归当下。若在字里行间看见了自己的倒影，欢迎入席对坐：')}
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
        <button class="btn-cta" onclick="askDaoBoyAboutArticle('${article.title}')">
          ${t('与道童聊聊这篇文章')} →
        </button>
        <button class="btn-cta quiet" onclick="closeZenReader(); scrollToMirror('${article.title}')">
          ${t('向仙人问道预约')} →
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
    input.value = `读了《${title}》，想听听道童怎么看？`;
    setTimeout(() => {
      handleUserQuery(input.value);
      input.value = '';
    }, 500);
  }
};

// ==========================================
// 4. 守门道童问答 (纯本地智库：长文专栏与老庄心法，不接任何外部 AI 服务，无密钥)
// ==========================================
function initDaoBoyLiveSettings() {
  // 清除旧版曾保存在访客浏览器的 Gemini 密钥与代理设置
  try {
    localStorage.removeItem('dao_gemini_api_key');
    localStorage.removeItem('dao_gemini_endpoint');
  } catch (e) { /* 无痕模式等环境无法访问，略过 */ }
  const indicator = document.getElementById('daoboy-live-indicator');
  const engineLabel = document.getElementById('daoboy-engine-label');
  if (indicator) indicator.textContent = t('本地智库');
  if (engineLabel) engineLabel.textContent = t('长文专栏与老庄心法即时检索中');
}

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

// 快速提问：直接采用 content.js 预写答案，零延迟、零 API 额度、品质由主理人把关
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
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

function daoBoyMirrorHint() {
  return `<br><br><small style="color: var(--tea);">${t('若需与简家旗深度对话 请前往下方「问道之镜」完成心性过滤')}</small>`;
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
  typingBubble.innerHTML = `<span style="color: var(--mist);">${t('道童在深山沏茶静思中...')}</span>`;
  chatWindow.appendChild(typingBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // 本地智库精准匹配 (稍作停顿，维持沏茶静思的节奏)
  setTimeout(() => {
    const fallbackAnswer = fallbackLocalWisdom(query);
    typingBubble.innerHTML = `${t(fallbackAnswer)}${daoBoyMirrorHint()}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 500);
}

// POST JSON 并于逾时时中止 (逾时视为失败，由调用端降级)
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

// 本地长文与心法智库 RAG 兜底匹配
function fallbackLocalWisdom(query) {
  const lower = query.toLowerCase();

  if (lower.includes('面包') || lower.includes('欧包') || lower.includes('周期') || lower.includes('发酵') || lower.includes('金融')) {
    return `先生在主流金融做了七年，看透了资本市场每一次疯狂的信用扩张，都像烤箱里急遽鼓起的面包。膨胀不是力量，前一天晚上十二小时低温冷藏发酵出来的内在筋膜才是。专栏里的《烤欧包时看金融周期的发酵与坍塌》，把这段心法讲得非常透彻。慢下来给系统降温，才嚼得出生活的麦香。`;
  }
  if (lower.includes('算法') || lower.includes('流量') || lower.includes('互联网') || lower.includes('浅薄') || lower.includes('自媒体')) {
    return `算法要的是刺激、冲突与三秒完播率，它的底层逻辑是无限复制。但人心的规律刚好相反：任何能被零成本无限复制的东西，价值就会在瞬间贬值。正如《互联网的浅薄与真诚的昂贵》所言，我们不在大门口敲锣打鼓，我们在深山点一盏灯，只等同频之人。`;
  }
  if (lower.includes('父母') || lower.includes('回忆录') || lower.includes('老人') || lower.includes('首映') || lower.includes('大倾听')) {
    return `大倾听的本质是将告别式往前移。在父母意识清醒、还能笑着流泪的时候，为他做一部精装之书，办一场专属的生命首映会。正如专栏《大倾听 人类第一次负担得起听完自己》中那位七十三岁工程师的眼泪，他这辈子所有的委屈与荣光，在活着的时候得到了最深沉的看见。`;
  }
  if (lower.includes('餐桌') || lower.includes('白米') || lower.includes('稻田') || lower.includes('饭') || lower.includes('身体')) {
    return `幸福餐桌十四年，两百多场。大脑懂再多道理，都是头脑的语言；幸福是身体的语言。正如《饭会吃完 幸福会留下来》所写：在稻田中央放下手机，光着脚踩进泥土，尝一碗刚起锅白米饭的甘甜。身体先知道，头脑后明白，肩膀就会自己松下来一寸。`;
  }
  if (lower.includes('一人公司') || lower.includes('热力学') || lower.includes('熵') || lower.includes('为道日损') || lower.includes('创业')) {
    return `普里高津叫耗散结构，老庄叫为道日损。每多加一个功能、多招一个人，系统的内耗就是几何级数暴增。一人公司的智能在于负熵自转：利用现代 AI 承担 99% 的苦力，主理人只保留 1% 的生活感知与大倾听。专栏《为道日损 一人公司的热力学负熵法则》有完整的物理学拆解。`;
  }
  if (lower.includes('碎') || lower.includes('水洒') || lower.includes('玻璃') || lower.includes('当下') || lower.includes('评判') || lower.includes('禅')) {
    return `临济禅师说：随处作主，立处皆真。花要谢、水要洒、玻璃要碎，是物在按自己的方式流动。真正让人累的，往往不是碎裂本身，而是我们加在上面的评判与懊恼。专栏《花落了水洒了玻璃碎了 捡起来的样子就是当下》写过：如实蹲下来收拾，收拾完的心，已经不是刚才焦躁的心。`;
  }
  if (lower.includes('蜡烛') || lower.includes('火') || lower.includes('消散') || lower.includes('硅') || lower.includes('碳') || lower.includes('永久')) {
    return `一根蜡烛点燃另一根，第一根会熄，但火不会。火，是会移动的条件。《以消散为形式的永久》写道：碳写成的生命会退场，硅写成的算力会记得。当机器学会了人类如何深情地聆听彼此，两边都赢，这是一场非零和的生命对坐。`;
  }
  if (lower.includes('香气') || lower.includes('安宁') || lower.includes('纯露') || lower.includes('云南')) {
    return `安宁清晨高原阳光与松针的气息，是太太亲手在慢旅居的生活里采集蒸馏的。身体先于大脑，都市冷气房抽干了五感，大道理听不进去时，一滴高原松针的气味进入鼻腔，植物的频率比逻辑更快唤醒细胞。`;
  }

  // 兜底温暖回答
  return `简家旗常说：大道至简，所有复杂性最终都为了让人尝得到一口热米饭。你所问的「${query}」，问题本身往往就是解答的原矿。若大脑正处于增熵重载中，先给自己泡一壶茶；专栏里的八篇长文，或许正好有一篇能接住你此刻的心境。若需先生亲自拨云见日，下方「问道之镜」随时为你开放。`;
}

// 全局快捷键与 Hash 路由监听
function initGlobalKeyboardAndHash() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeZenReader();
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
// 4. 问道之镜
// ==========================================
// 表单送达：POST 到 Cloudflare Worker /api/dao (happy 仓库 executive-table/worker/dao.js)
// 伺服端产生通关码、存盘并寄信给主理人。回传 { ok:true, code } 或 { ok:false }；
// 未设置网址或任何失败都回 ok:false，由调用端走手动备援
async function submitBooking(payload) {
  const url = (typeof DaoSanctuaryData !== 'undefined' && DaoSanctuaryData.config?.api?.bookingUrl) || '';
  if (!url) return { ok: false };
  try {
    const res = await postJson(url, payload, 15000);
    const data = await res.json().catch(() => ({}));
    // mailed:false 代表数据已存进后台，但通知信没寄出；旧版 Worker 不回传此字段则视为已寄出
    if (res.ok && data.ok && data.code) return { ok: true, code: data.code, mailed: data.mailed !== false };
  } catch (err) {
    console.warn('表单送达失败，改走手动发送备援：', err);
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
      if (status) status.textContent = t('请完整回答三道心性问题 以完成道场承诺仪式');
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
    showMirrorResult(code, result.ok, { q1, q2, q3 }, result.mailed);
    if (btn) { btn.disabled = false; btn.textContent = btnText; }
  });
}

function showMirrorResult(code, delivered, answers, mailed) {
  const contact = DaoSanctuaryData.config.contact;
  const intentLine = mirrorIntent ? `（意向：${mirrorIntent}）` : '';

  // 已存盘且通知信已寄出，只需回传通关码；否则把完整回答放进消息，客人传出去主理人才一定收得到
  const notified = delivered && mailed !== false;
  const message = notified
    ? `通关码 ${code}${intentLine}`
    : `通关码 ${code}${intentLine}\n一、${answers.q1}\n二、${answers.q2}\n三、${answers.q3}`;
  mirrorManualText = message;

  document.getElementById('booking-code-span').textContent = code;

  const statusEl = document.getElementById('mirror-delivery-status');
  const manualEl = document.getElementById('mirror-manual-actions');
  if (statusEl) {
    if (notified) {
      statusEl.textContent = t('✓ 您的回答已送达简家旗工作室 请凭通关码从下方任一管道回传 我们会对照确认');
    } else if (delivered) {
      statusEl.textContent = t('您的回答已记录在工作室后台 但通知信寄送遇到问题。请复制回答 连同通关码传给下方任一管道 我们才能即时看到');
    } else {
      statusEl.textContent = t('您的回答尚未自动送达。请先复制回答 再连同通关码传给下方任一管道 这样我们才收得到');
    }
    statusEl.style.color = notified ? 'var(--tea)' : 'var(--seal)';
  }
  if (manualEl) manualEl.style.display = notified ? 'none' : 'block';

  const lineBtn = document.getElementById('mirror-line-btn');
  if (lineBtn) lineBtn.href = `https://line.me/R/oaMessage/${contact.lineId}/?${encodeURIComponent(message)}`;
  const mailBtn = document.getElementById('mirror-mail-btn');
  if (mailBtn) {
    mailBtn.href = `mailto:${contact.email}?subject=${encodeURIComponent('问道之镜 ' + code)}&body=${encodeURIComponent(message)}`;
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
      q1.value = `【意向项目：${productTitle}】\n`;
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
      btn.textContent = '✓ 已复制';
      btn.style.background = 'var(--ink)';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
      }, 1800);
    }
    if (tip) {
      tip.textContent = '✓ 通关码已复制至剪贴板，请于连系时回传以确认调度';
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
      btn.textContent = '✓ 已复制';
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
    console.error('复制失败', err);
  }
  document.body.removeChild(el);
}

// ==========================================
// 5. 滚动进场显现动画
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
// 6. 花瓣香气预约抽屉
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
        <span style="font-family: var(--font-han);">${t('节气流通价')}</span>
        <span style="font-family: var(--font-display); font-size: 1.5rem; color: var(--ink);">
          ${displayPrice}
        </span>
      </div>
      <small style="color: var(--mist); display: block;">${t(petal.deliveryInfo)}</small>
    </div>

    <form id="petal-form" onsubmit="handlePetalReservation(event, '${petal.id}')">
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('姓名称呼')}</label>
        <input type="text" name="name" required maxlength="60" autocomplete="name" style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="如：张先生 / 林小姐">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.88rem; margin-bottom: 6px;">${t('联系方式 (LINE 或 微信号 / 手机号)')}</label>
        <input type="text" name="contact" required maxlength="100" style="width: 100%; padding: 12px 16px; border: 1px solid var(--line); background: var(--paper); font-size: 0.95rem; border-radius: 0;" placeholder="以便确认节气配额">
      </div>
      <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;">
      <button type="submit" class="btn-cta" style="width: 100%;">
        ${t('确认登记节气配额')} →
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
  btn.textContent = t('登记中...');
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
    // 成功：以抽屉内的状态取代表单，不使用原生 alert
    form.style.display = 'none';
    status.style.color = 'var(--ink)';
    status.innerHTML = `
      <div style="border: 1px solid var(--tea); padding: 18px; background: var(--paper-deep);">
        <div style="color: var(--tea); margin-bottom: 6px;">${t('✓ 已登记 感谢结缘')}</div>
        <div style="font-family: var(--font-display); font-size: 1.4rem; letter-spacing: 0.12em; margin-bottom: 8px;">${result.code}</div>
        <div style="color: var(--ink-soft);">${t('太太与工作室将于节气出产前夕与您联系 请留存此通关码')}</div>
        ${result.mailed === false ? `<div style="color: var(--seal); margin-top: 8px;">${t('通知信寄送遇到问题 数据已记录在后台 建议再以 LINE 发送通关码')} <a href="https://line.me/R/oaMessage/${DaoSanctuaryData.config.contact.lineId}/?${encodeURIComponent(`通关码 ${result.code}（${petal.title}）`)}" target="_blank" rel="noopener" style="color: var(--tea); text-decoration: underline;">${t('以 LINE 发送')} →</a></div>` : ''}
        <button type="button" class="contact-sub-btn" style="margin-top: 12px;" onclick="copyText('${result.code}', this)">${t('复制通关码')}</button>
      </div>`;
    return;
  }

  // 失败或尚未设置 Worker：保留表单内容，提供 LINE 预填消息备援，客人数据不会凭空消失
  btn.disabled = false;
  btn.textContent = btnText;
  const contact = DaoSanctuaryData.config.contact;
  const msg = `预约【${petal.title}】\n称呼：${name}\n联系：${contactInfo}`;
  status.style.color = 'var(--seal)';
  status.innerHTML = `${t('登记尚未自动送达。请改由 LINE 发送预约信息 我们收到后会回复：')}
    <a href="https://line.me/R/oaMessage/${contact.lineId}/?${encodeURIComponent(msg)}" target="_blank" rel="noopener" style="color: var(--tea); text-decoration: underline;">${t('以 LINE 发送预约')} →</a>`;
};
