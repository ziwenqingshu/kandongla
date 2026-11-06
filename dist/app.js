/* ========================================
   看懂啦 - 主应用逻辑
   ======================================== */

// ==========================================
// Demo Data - 6 scenarios with pre-built analysis
// ==========================================
const DEMOS = [
  {
    id: 'wechat-update',
    label: '微信更新弹窗',
    image: 'demos/wechat-update.svg',
    risk: 'green',
    question: '这是什么意思？',
    analysis: {
      summary: '这是微信的更新提示，可以放心点"稍后"。',
      risk: 'green',
      risk_reason: '这是微信官方发出的版本更新提醒，属于正常操作，不是诈骗。您可以选择"立即更新"或"稍后"都可以。',
      steps: [
        { text: '这是微信弹出的"新版本更新"提示框，是正常的系统通知。', box: [0.1, 0.32, 0.8, 0.36] },
        { text: '如果想现在更新，点绿色的"立即更新"按钮。', box: [0.17, 0.55, 0.66, 0.06] },
        { text: '如果不想现在更新，点下面的"稍后"两个字就行。', box: [0.35, 0.62, 0.3, 0.04] }
      ]
    }
  },
  {
    id: 'alipay-transfer',
    label: '支付宝转账页',
    image: 'demos/alipay-transfer.svg',
    risk: 'yellow',
    question: '我该点哪里？',
    analysis: {
      summary: '这是支付宝转账页面，确认对方身份后再操作。',
      risk: 'yellow',
      risk_reason: '转账页面本身是正常的，但请注意：一定要确认收款人是不是您认识的人，金额是否正确。转出去的钱很难追回。',
      steps: [
        { text: '先看清楚收款人是谁——这里显示"张*华"，确认是您认识的人。', box: [0.04, 0.22, 0.92, 0.08] },
        { text: '再确认转账金额——这里显示500.00元，看看对不对。', box: [0.04, 0.33, 0.92, 0.08] },
        { text: '确认都没问题后，再点蓝色的"确认转账"按钮。', box: [0.04, 0.59, 0.92, 0.07] },
        { text: '如果不认识这个人或金额不对，请不要点确认，返回重新核实。', box: null }
      ]
    }
  },
  {
    id: 'scam-sms',
    label: '"客服退款"诈骗短信',
    image: 'demos/scam-sms.svg',
    risk: 'red',
    question: '这是不是骗子？',
    analysis: {
      summary: '这是诈骗短信！千万不要点链接，不要填银行卡信息！',
      risk: 'red',
      risk_reason: '这条短信有多个诈骗特征：冒充客服说退款、发来陌生链接要求填写银行卡信息、威胁说"24小时内未办理将自动扣款"制造紧迫感。正规平台不会通过短信链接要求填写银行卡信息。',
      steps: [
        { text: '这条短信说"商品有问题要双倍退款"——这是典型的诈骗话术，正规退款会直接在APP里操作。', box: [0.02, 0.17, 0.78, 0.32] },
        { text: '短信里的链接 http://tb.cn/Rf8x.k3f 是假网站，千万不要点！点了可能会盗取您的银行卡信息。', box: [0.02, 0.17, 0.78, 0.32] },
        { text: '"24小时内未办理将自动扣款"——这是吓唬您的，正规平台不会这样说话。', box: [0.02, 0.17, 0.78, 0.32] },
        { text: '正确做法：直接删除这条短信。如果担心，打官方客服电话核实（从官方APP里找电话，不要打短信里的号码）。', box: null }
      ]
    }
  },
  {
    id: 'hospital',
    label: '医院公众号挂号页',
    image: 'demos/hospital.svg',
    risk: 'green',
    question: '帮我一步步教',
    analysis: {
      summary: '这是北京协和医院的官方挂号页面，可以放心使用。',
      risk: 'green',
      risk_reason: '这是医院微信公众号的正规挂号功能，页面显示的信息（科室、医生、费用）都是正常的。挂号费50元医保报销后自付10元，价格透明合理。',
      steps: [
        { text: '这是北京协和医院的官方公众号，已经认证过了，可以放心使用。', box: [0.0, 0.11, 1.0, 0.06] },
        { text: '第一步：点"预约挂号"进入挂号页面。', box: [0.04, 0.30, 0.22, 0.10] },
        { text: '第二步：选择要看的科室，这里选了"内科-心血管内科"。', box: [0.04, 0.50, 0.92, 0.08] },
        { text: '第三步：选择日期和医生，确认就诊人信息。', box: [0.04, 0.58, 0.92, 0.16] },
        { text: '第四步：确认信息无误后，点绿色的"确认预约"按钮就完成了。', box: [0.04, 0.87, 0.92, 0.07] }
      ]
    }
  },
  {
    id: 'storage-full',
    label: '手机内存不足弹窗',
    image: 'demos/storage-full.svg',
    risk: 'yellow',
    question: '这是什么意思？',
    analysis: {
      summary: '手机存储空间快满了，需要清理一些不用的东西。',
      risk: 'yellow',
      risk_reason: '这是手机系统发出的正常提醒，不是诈骗。但存储空间满了会影响手机使用，建议清理一些不用的照片或APP。注意：只通过手机"设置"里的"存储空间"来清理，不要点不明链接下载"清理大师"之类的软件。',
      steps: [
        { text: '手机提示"存储空间不足"——128GB已经用了126.5GB，快满了。', box: [0.08, 0.35, 0.84, 0.37] },
        { text: '红色进度条表示空间已经几乎用完了。', box: [0.15, 0.49, 0.70, 0.02] },
        { text: '可以点"管理存储空间"来清理，系统会告诉您哪些东西占空间最多。', box: [0.15, 0.62, 0.70, 0.06] },
        { text: '也可以点"稍后处理"，以后再清理。但手机满了可能无法拍照和收消息。', box: [0.3, 0.69, 0.4, 0.04] }
      ]
    }
  },
  {
    id: 'screen-share',
    label: '陌生人共享屏幕邀请',
    image: 'demos/screen-share.svg',
    risk: 'red',
    question: '这是不是骗子？',
    analysis: {
      summary: '这是诈骗！千万不要允许共享屏幕！立刻拒绝！',
      risk: 'red',
      risk_reason: '陌生人要求共享屏幕是典型的诈骗手段。一旦共享，对方能看到您手机上的一切：银行卡号、密码、短信验证码。正规客服绝不会要求共享屏幕。请立即拒绝并拉黑此人。',
      steps: [
        { text: '这个"客服小王"是陌生人，他让您下载会议软件并共享屏幕——这是诈骗！', box: [0.02, 0.13, 0.86, 0.35] },
        { text: '屏幕上方弹出了"共享屏幕请求"的警告——红色弹窗说明这是高风险操作。', box: [0.03, 0.52, 0.94, 0.10] },
        { text: '如果点"允许共享"，对方就能看到您手机上所有内容，包括银行卡密码和验证码！', box: [0.03, 0.62, 0.94, 0.22] },
        { text: '正确做法：立刻点"拒绝"！然后拉黑这个人。如果已经操作了，马上打银行电话冻结账户，再拨打96110报警。', box: null }
      ]
    }
  }
];

// ==========================================
// Anti-Fraud Hard Rules
// ==========================================
const FRAUD_KEYWORDS = [
  { pattern: /转账|汇款|打款/, context: /陌生|不认识|未知|安全账户/, risk: 'red', reason: '要求转账汇款给陌生人' },
  { pattern: /中奖|领奖|恭喜.*获得|奖品/, risk: 'red', reason: '中奖领奖类诈骗' },
  { pattern: /客服.*退款|退款.*客服|理赔|赔偿/, risk: 'red', reason: '冒充客服退款诈骗' },
  { pattern: /共享屏幕|屏幕共享|远程.*控制|下载.*会议|云会议|zoom|腾讯会议.*下载/, risk: 'red', reason: '要求共享屏幕或下载会议软件' },
  { pattern: /验证码|校验码|动态密码|短信密码/, risk: 'red', reason: '索要验证码' },
  { pattern: /贷款|刷流水|刷单|做任务.*返现/, risk: 'red', reason: '贷款刷流水诈骗' },
  { pattern: /公安|检察院|法院.*电话|警察.*转账|通缉/, risk: 'red', reason: '冒充公检法' },
  { pattern: /安全账户|保证金|解冻.*账户|冻结.*账户/, risk: 'red', reason: '安全账户诈骗' },
  { pattern: /点击.*链接|打开.*网址|http[s]?:\/\/[^\s]*\.(cn|top|xyz|cc|tk)/, risk: 'red', reason: '可疑链接' },
  { pattern: /24小时|立即|马上|过期|失效/, context: /扣款|退款|取消/, risk: 'red', reason: '制造紧迫感施压' }
];

function checkFraudRules(text) {
  const normalizedText = text.toLowerCase();
  for (const rule of FRAUD_KEYWORDS) {
    if (rule.pattern.test(normalizedText)) {
      if (rule.context) {
        if (rule.context.test(normalizedText)) {
          return { risk: rule.risk, reason: rule.reason };
        }
      } else {
        return { risk: rule.risk, reason: rule.reason };
      }
    }
  }
  return null;
}

// ==========================================
// OCR (Tesseract.js) - CDN loading with fallbacks
// ==========================================
function compressImage(imageSrc, maxSide) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w <= maxSide && h <= maxSide) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png', 0.9), width: w, height: h });
        return;
      }
      const scale = maxSide / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: canvas.toDataURL('image/png', 0.9), width: w, height: h });
    };
    img.src = imageSrc;
  });
}

const OCR_CDN = {
  worker: 'https://registry.npmmirror.com/tesseract.js/5.1.1/files/dist/worker.min.js',
  core: 'https://registry.npmmirror.com/tesseract.js-core/5.1.1/files/tesseract-core-simd-lstm.wasm.js'
};

let ocrLoadFailed = false;
let ocrWorkerInFlight = null;
let currentOcrProgressCb = null;

const OCR_LANG_PATHS = [
  'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_best_int',
  'https://fastly.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_best_int'
];

function createOCRWorkerWithTimeout(langPath) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('OCR worker creation timed out after 45s'));
    }, 45000);
    Tesseract.createWorker('chi_sim+eng', 1, {
      workerPath: OCR_CDN.worker,
      corePath: OCR_CDN.core,
      workerBlobURL: true,
      langPath,
      gzip: true,
      logger: (m) => {
        if (currentOcrProgressCb && m.status === 'recognizing text') {
          currentOcrProgressCb(0.1 + (m.progress || 0) * 0.85, 'recognizing');
        }
      },
      errorHandler: (err) => {
        console.warn('OCR worker error [' + langPath + ']:', err);
      }
    }).then(
      (w) => {
        if (settled) { try { w.terminate(); } catch (_) {} return; }
        settled = true;
        clearTimeout(timer);
        resolve(w);
      },
      (e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function getOrCreateOCRWorker() {
  if (state.ocrWorker) return state.ocrWorker;
  if (typeof Tesseract === 'undefined') {
    ocrLoadFailed = true;
    throw new Error('OCR library not loaded');
  }
  if (ocrWorkerInFlight) return ocrWorkerInFlight;

  ocrWorkerInFlight = (async () => {
    let lastErr;
    for (const langPath of OCR_LANG_PATHS) {
      let worker;
      try {
        worker = await createOCRWorkerWithTimeout(langPath);
        state.ocrWorker = worker;
        return worker;
      } catch (err) {
        lastErr = err;
        if (worker && typeof worker.terminate === 'function') {
          try { await worker.terminate(); } catch (_) {}
        }
        console.warn('OCR worker creation failed [' + langPath + ']:', err);
      }
    }
    throw lastErr || new Error('Failed to create OCR worker');
  })();

  try {
    return await ocrWorkerInFlight;
  } catch (err) {
    ocrWorkerInFlight = null;
    throw err;
  }
}

function prewarmOCR() {
  const cb = () => {
    getOrCreateOCRWorker().catch(err => {
      console.warn('OCR pre-warm failed:', err);
    });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(cb, { timeout: 5000 });
  } else {
    setTimeout(cb, 2000);
  }
}

async function performOCR(imageDataUrl, imgWidth, imgHeight, onProgress) {
  if (ocrLoadFailed) throw new Error('OCR library failed to load');

  const worker = await getOrCreateOCRWorker();

  if (onProgress) onProgress(0.1, 'loading');

  currentOcrProgressCb = onProgress || null;
  try {
    const recognizePromise = worker.recognize(imageDataUrl);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OCR 识别超时，请重试')), 30000)
    );
    const result = await Promise.race([recognizePromise, timeoutPromise]);

    if (onProgress) onProgress(0.95, 'processing');

    const lines = [];
    const w = result.data.dimensions?.width || imgWidth || 1;
    const h = result.data.dimensions?.height || imgHeight || 1;

    if (result.data.lines) {
      for (const line of result.data.lines) {
        if (!line.text || !line.text.trim()) continue;
        const bbox = line.bbox;
        lines.push({
          text: line.text.trim(),
          x0: bbox.x0 / w,
          y0: bbox.y0 / h,
          x1: bbox.x1 / w,
          y1: bbox.y1 / h,
          confidence: line.confidence
        });
      }
    }

    if (onProgress) onProgress(1.0, 'done');

    return {
      fullText: result.data.text,
      lines: lines
    };
  } finally {
    currentOcrProgressCb = null;
  }
}

// ==========================================
// Privacy Masking
// ==========================================
function maskPrivacyInfo(text) {
  let masked = text;
  masked = masked.replace(/1[3-9]\d{9}/g, '1**** **** ***');
  masked = masked.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '**** **** **** ****');
  masked = masked.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{3,4}/g, '**** **** **** ***');
  return masked;
}

// ==========================================
// App State
// ==========================================
const state = {
  currentScreen: 'upload',
  currentImage: null,
  currentImageSrc: null,
  isDemo: false,
  currentDemo: null,
  currentStep: 0,
  analysisResult: null,
  isSpeaking: false,
  fontLarge: false,
  speechUtterance: null,
  ocrLines: [],
  compressedImageData: null,
  ocrWorker: null
};

// ==========================================
// DOM Elements
// ==========================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ==========================================
// Screen Navigation
// ==========================================
function showScreen(screenId) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen${screenId}`).classList.add('active');
  state.currentScreen = screenId.toLowerCase();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// Initialize Demo Grid
// ==========================================
function initDemoGrid() {
  const grid = $('#demoGrid');
  grid.innerHTML = DEMOS.map(demo => `
    <div class="demo-card" data-demo-id="${demo.id}" role="button" tabindex="0" aria-label="试用示例：${demo.label}">
      <img class="demo-card-img" src="${demo.image}" alt="${demo.label}截图" loading="lazy">
      <div class="demo-card-label">
        <span class="demo-card-risk ${demo.risk}"></span>
        ${demo.label}
      </div>
    </div>
  `).join('');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.demo-card');
    if (!card) return;
    const demoId = card.dataset.demoId;
    selectDemo(demoId);
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const card = e.target.closest('.demo-card');
      if (!card) return;
      selectDemo(card.dataset.demoId);
    }
  });
}

function selectDemo(demoId) {
  const demo = DEMOS.find(d => d.id === demoId);
  if (!demo) return;

  state.isDemo = true;
  state.currentDemo = demo;
  state.currentImageSrc = demo.image;
  state.currentImage = null;

  $('#previewImage').src = demo.image;
  $('#previewImage').alt = demo.label + ' 截图';
  $('#questionInput').value = demo.question;

  showScreen('Question');
}

// ==========================================
// File Upload
// ==========================================
function initUpload() {
  const uploadArea = $('#uploadArea');
  const fileInput = $('#fileInput');

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFileUpload(file);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-primary-dark)';
    uploadArea.style.background = 'var(--color-primary-light)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  });
}

function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    state.currentImageSrc = e.target.result;
    state.currentImage = file;
    state.isDemo = false;
    state.currentDemo = null;

    $('#previewImage').src = e.target.result;
    $('#previewImage').alt = '您上传的截图';
    $('#questionInput').value = '';

    showScreen('Question');
  };
  reader.readAsDataURL(file);
}

// ==========================================
// Analysis
// ==========================================
function initAnalysis() {
  // Quick option buttons
  $$('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.quick-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      $('#questionInput').value = btn.dataset.question;
    });
  });

  // Analyze button
  $('#analyzeBtn').addEventListener('click', runAnalysis);

  // Enter key in input
  $('#questionInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runAnalysis();
  });

  // Back button
  $('#backToUpload').addEventListener('click', () => {
    stopSpeaking();
    showScreen('Upload');
  });
}

async function runAnalysis() {
  const question = $('#questionInput').value.trim() || '这是什么意思？';

  if (state.isDemo && state.currentDemo) {
    showLoading('正在分析...');
    setTimeout(() => {
      hideLoading();
      displayResult(state.currentDemo.analysis, state.currentImageSrc);
    }, 800);
    return;
  }

  showLoading('正在看图…', true);

  try {
    const compressed = await compressImage(state.currentImageSrc, 1280);
    state.compressedImageData = compressed.dataUrl;

    let ocrResult = null;
    let ocrFailed = false;
    try {
      ocrResult = await performOCR(compressed.dataUrl, compressed.width, compressed.height, (fraction, status) => {
        updateOcrProgress(fraction, status);
      });
      state.ocrLines = ocrResult.lines || [];
    } catch (ocrErr) {
      console.warn('OCR failed:', ocrErr);
      ocrFailed = true;
      state.ocrLines = [];
    }

    if (ocrFailed) {
      hideLoading();
      const fraudCheck = checkFraudRules(question);
      displayResult({
        summary: '看图功能暂时加载不了，您可以直接打字说说屏幕上写了什么',
        risk: fraudCheck && fraudCheck.risk === 'red' ? 'red' : 'yellow',
        risk_reason: 'OCR（看图）功能需要下载额外的识别库，当前网络可能不太顺畅。您可以用文字描述截图内容，或者稍后再试。' +
          (fraudCheck && fraudCheck.risk === 'red' ? '\n\n⚠️ 反诈检测：' + fraudCheck.reason : ''),
        steps: [
          { text: '请回到上一页，在问题框里用文字描述您看到的内容，比如"短信说我的账户异常要退款"。', box: null },
          { text: '系统会根据您描述的文字内容进行分析。', box: null },
          { text: '如果涉及转账、验证码等操作，请务必先跟家人确认。', box: null }
        ]
      }, state.currentImageSrc);
      return;
    }

    showLoading('正在分析…');

    const fraudCheckOnOCR = ocrResult ? checkFraudRules(ocrResult.fullText) : null;

    const result = await analyzeWithCloudAgent(
      state.currentImageSrc,
      question,
      ocrResult
    );
    hideLoading();

    if (fraudCheckOnOCR && fraudCheckOnOCR.risk === 'red') {
      result.risk = 'red';
      result.risk_reason = (result.risk_reason || '') + '\n\n⚠️ 反诈检测（截图文字）：' + fraudCheckOnOCR.reason;
    }

    const fraudCheck = checkFraudRules(result.summary + ' ' + (result.risk_reason || ''));
    if (fraudCheck && fraudCheck.risk === 'red') {
      result.risk = 'red';
      result.risk_reason = (result.risk_reason || '') + '\n\n⚠️ 反诈检测：' + fraudCheck.reason;
    }

    if (result.steps && state.ocrLines.length > 0) {
      for (const step of result.steps) {
        if (step.lineIndex != null && step.lineIndex >= 0 && step.lineIndex < state.ocrLines.length) {
          const line = state.ocrLines[step.lineIndex];
          step.box = [line.x0, line.y0, line.x1 - line.x0, line.y1 - line.y0];
        }
      }
    }

    displayResult(result, state.currentImageSrc);
  } catch (err) {
    hideLoading();

    const ocrText = state.ocrLines.map(l => l.text).join(' ');
    const fraudCheck = checkFraudRules(question + ' ' + ocrText);
    if (fraudCheck && fraudCheck.risk === 'red') {
      displayResult({
        summary: '请注意安全！您截图中的内容可能涉及诈骗。',
        risk: 'red',
        risk_reason: '反诈检测：' + fraudCheck.reason + '。\n\nAI分析暂时不可用，但截图文字触发了安全警报，建议先不要操作。',
        steps: [
          { text: '先不要进行任何操作，不要点任何链接或按钮。', box: null },
          { text: '打电话给家里人，让他们帮您看看。', box: null },
          { text: '如果已经转账或泄露了信息，请立即拨打 96110 反诈专线。', box: null }
        ]
      }, state.currentImageSrc);
    } else {
      displayResult({
        summary: '暂时没看懂这张截图，请稍后再试。',
        risk: 'yellow',
        risk_reason: 'AI分析服务暂时不可用。建议您：\n1. 稍后再试一次\n2. 打电话让家里人帮忙看看\n3. 如果涉及钱的操作，请拨打 96110 咨询',
        steps: [
          { text: '请稍后再试，或者让家人帮您看看这个截图。', box: null },
          { text: '如果涉及转账、付款等操作，建议先不要操作，确认安全再说。', box: null },
          { text: '如有疑问，可拨打 96110 反诈专线咨询。', box: null }
        ]
      }, state.currentImageSrc);
    }
  }
}

async function analyzeWithCloudAgent(imageDataUrl, question, ocrResult) {
  const payload = {
    action: 'analyze',
    question: question,
    imageDescription: imageDataUrl ? '用户上传了一张截图' : ''
  };

  if (ocrResult && ocrResult.lines && ocrResult.lines.length > 0) {
    payload.ocrText = ocrResult.fullText;
    payload.ocrLines = ocrResult.lines.map((line, index) => ({
      index: index,
      text: line.text,
      x0: Math.round(line.x0 * 10000) / 10000,
      y0: Math.round(line.y0 * 10000) / 10000,
      x1: Math.round(line.x1 * 10000) / 10000,
      y1: Math.round(line.y1 * 10000) / 10000,
      confidence: Math.round(line.confidence)
    }));
  }

  const response = await fetch('/functions/v1/app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.detail || 'Cloud Agent unavailable');
  }

  const data = await response.json();
  return data.result;
}

function generateFallbackAnalysis(question) {
  const fraudCheck = checkFraudRules(question);
  if (fraudCheck) {
    return {
      summary: '请注意安全！这可能涉及诈骗。',
      risk: 'red',
      risk_reason: '您描述的内容触发了反诈规则：' + fraudCheck.reason + '。建议先不操作，打电话给家里人确认。',
      steps: [
        { text: '先不要进行任何操作，不要点任何链接或按钮。', box: null },
        { text: '打电话给家里人，让他们帮您看看。', box: null },
        { text: '如果已经转账或泄露了信息，立即拨打 96110 反诈专线。', box: null }
      ]
    };
  }

  return {
    summary: '这个页面看起来是正常的，但建议您让家人帮忙确认一下。',
    risk: 'yellow',
    risk_reason: '目前无法完全确定这个截图的内容是否安全。建议您让家人或信任的人帮忙看一下。',
    steps: [
      { text: '先不要着急操作，仔细看看页面上的内容。', box: null },
      { text: '如果有不确定的地方，可以截图发给家人看看。', box: null },
      { text: '记住：凡是涉及钱的操作，都要三思而后行。', box: null }
    ]
  };
}

// ==========================================
// Result Display
// ==========================================
function displayResult(analysis, imageSrc) {
  state.analysisResult = analysis;
  state.currentStep = 0;

  const section = $('#resultSection');
  const riskLabels = { green: '安全', yellow: '小心', red: '先别点！' };
  const riskIcons = { green: '✅', yellow: '⚠️', red: '🚨' };

  let html = '';

  // Risk banner
  html += `
    <div class="risk-banner ${analysis.risk}">
      <div class="risk-badge ${analysis.risk}">
        ${riskIcons[analysis.risk]} ${riskLabels[analysis.risk]}
      </div>
      <div class="risk-summary">${escapeHtml(analysis.summary)}</div>
      <div class="risk-reason">${escapeHtml(analysis.risk_reason || '').replace(/\n/g, '<br>')}</div>
    </div>
  `;

  // Danger mode
  if (analysis.risk === 'red') {
    section.classList.add('danger-mode');
    html += `
      <a href="tel:96110" class="emergency-call">
        📞 拨打 96110 反诈专线
      </a>
      <button class="share-family-btn" onclick="shareToFamily()">
        📨 发给子女看看
      </button>
    `;
  } else {
    section.classList.remove('danger-mode');
  }

  // Screenshot with overlay circles
  if (imageSrc) {
    html += `
      <div class="result-screenshot" id="resultScreenshot">
        <img src="${imageSrc}" alt="分析截图">
        <svg id="overlaySvg" viewBox="0 0 1 1" preserveAspectRatio="none"></svg>
      </div>
    `;
  }

  // Steps
  if (analysis.steps && analysis.steps.length > 0) {
    html += `
      <div class="steps-container">
        <div class="steps-title">📋 一步步来</div>
        ${analysis.steps.map((step, i) => `
          <div class="step-card ${i === 0 ? 'active' : ''}" data-step="${i}">
            <div class="step-number">${i + 1}</div>
            <div class="step-text">${escapeHtml(step.text)}</div>
          </div>
        `).join('')}
        ${analysis.steps.length > 1 ? `
          <div class="step-nav">
            <button class="step-nav-btn prev" id="stepPrev" disabled>← 上一步</button>
            <button class="step-nav-btn next" id="stepNext">下一步 →</button>
          </div>
          <div class="step-dots" id="stepDots">
            ${analysis.steps.map((_, i) => `<div class="step-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Voice button
  const voiceText = buildVoiceText(analysis);
  html += `
    <button class="voice-btn" id="voiceBtn" aria-label="念给我听">
      🔊 念给我听
    </button>
  `;

  // New analysis
  html += `
    <button class="new-analysis-btn" id="newAnalysisBtn">
      📷 再看一张截图
    </button>
  `;

  section.innerHTML = html;

  // Bind step navigation
  const stepPrev = $('#stepPrev');
  const stepNext = $('#stepNext');
  if (stepPrev && stepNext) {
    stepPrev.addEventListener('click', () => navigateStep(-1));
    stepNext.addEventListener('click', () => navigateStep(1));
  }

  // Bind voice
  $('#voiceBtn').addEventListener('click', () => toggleSpeech(voiceText));

  // Bind new analysis
  $('#newAnalysisBtn').addEventListener('click', () => {
    stopSpeaking();
    showScreen('Upload');
  });

  // Draw overlay circles for current step
  updateOverlay();

  showScreen('Result');
}

function navigateStep(direction) {
  const steps = state.analysisResult.steps;
  const newStep = state.currentStep + direction;
  if (newStep < 0 || newStep >= steps.length) return;

  state.currentStep = newStep;

  $$('.step-card').forEach((card, i) => {
    card.classList.toggle('active', i === newStep);
  });

  $$('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === newStep);
  });

  const prevBtn = $('#stepPrev');
  const nextBtn = $('#stepNext');
  if (prevBtn) prevBtn.disabled = newStep === 0;
  if (nextBtn) {
    nextBtn.textContent = newStep === steps.length - 1 ? '完成 ✓' : '下一步 →';
    nextBtn.disabled = false;
  }

  updateOverlay();

  // Speak current step if speaking
  if (state.isSpeaking) {
    stopSpeaking();
    speakText(steps[newStep].text);
  }
}

function updateOverlay() {
  const svg = $('#overlaySvg');
  if (!svg || !state.analysisResult.steps) return;

  const step = state.analysisResult.steps[state.currentStep];
  if (!step || !step.box) {
    svg.innerHTML = '';
    return;
  }

  const [x, y, w, h] = step.box;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  svg.innerHTML = `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      fill="none" stroke="#DC2626" stroke-width="0.015"
      stroke-dasharray="0.02 0.01" opacity="0.9">
      <animate attributeName="stroke-dashoffset" from="0" to="0.06" dur="1.5s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      fill="rgba(220, 38, 38, 0.08)" stroke="none"/>
  `;
}

function buildVoiceText(analysis) {
  let text = '';
  const riskLabels = { green: '安全', yellow: '需要小心', red: '危险，先别点' };
  text += `安全判断：${riskLabels[analysis.risk]}。`;
  text += analysis.summary + '。';
  if (analysis.risk_reason) text += analysis.risk_reason + '。';
  if (analysis.steps) {
    analysis.steps.forEach((step, i) => {
      text += `第${i + 1}步：${step.text}。`;
    });
  }
  if (analysis.risk === 'red') {
    text += '请先不要操作。打电话给家里人，或拨打96110反诈专线问一问。';
  }
  return text;
}

// ==========================================
// Text-to-Speech (Web Speech API)
// ==========================================
function toggleSpeech(text) {
  if (state.isSpeaking) {
    stopSpeaking();
    return;
  }
  speakText(text);
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert('您的浏览器不支持语音朗读功能');
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a Chinese voice
  const voices = speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh'));
  if (zhVoice) utterance.voice = zhVoice;

  utterance.onstart = () => {
    state.isSpeaking = true;
    state.speechUtterance = utterance;
    const btn = $('#voiceBtn');
    if (btn) {
      btn.classList.add('speaking');
      btn.innerHTML = '⏹️ 停止朗读';
    }
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    state.speechUtterance = null;
    const btn = $('#voiceBtn');
    if (btn) {
      btn.classList.remove('speaking');
      btn.innerHTML = '🔊 念给我听';
    }
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    const btn = $('#voiceBtn');
    if (btn) {
      btn.classList.remove('speaking');
      btn.innerHTML = '🔊 念给我听';
    }
  };

  speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  state.isSpeaking = false;
  state.speechUtterance = null;
  const btn = $('#voiceBtn');
  if (btn) {
    btn.classList.remove('speaking');
    btn.innerHTML = '🔊 念给我听';
  }
}

// ==========================================
// Share to Family
// ==========================================
function shareToFamily() {
  const text = state.analysisResult
    ? `【看懂啦提醒】${state.analysisResult.summary}\n\n${state.analysisResult.risk_reason}`
    : '请帮我看看这个手机截图';

  if (navigator.share) {
    navigator.share({
      title: '看懂啦 - 安全提醒',
      text: text
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('提醒内容已复制，可以发给子女了');
  } catch {
    alert('请手动复制以下内容发给家人：\n\n' + text);
  }
  document.body.removeChild(textarea);
}

// ==========================================
// Privacy Masking
// ==========================================
function initPrivacyMask() {
  $('#autoMaskBtn').addEventListener('click', () => {
    const canvas = $('#privacyCanvas');
    const img = $('#previewImage');
    if (!canvas || !img || !img.naturalWidth) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Simple privacy masking: blur regions that might contain sensitive info
    // This is a visual indicator; real masking would need OCR
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = `${Math.max(20, canvas.width / 15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🔒 已开启隐私保护', canvas.width / 2, canvas.height / 2);

    const btn = $('#autoMaskBtn');
    btn.textContent = '✅ 已打码';
    btn.disabled = true;
  });
}

// ==========================================
// Font Size Toggle
// ==========================================
function initFontSize() {
  const btn = $('#fontSizeBtn');
  const saved = localStorage.getItem('kandongla_font_large');
  if (saved === 'true') {
    document.body.classList.add('font-large');
    btn.classList.add('active');
    state.fontLarge = true;
  }

  btn.addEventListener('click', () => {
    state.fontLarge = !state.fontLarge;
    document.body.classList.toggle('font-large', state.fontLarge);
    btn.classList.toggle('active', state.fontLarge);
    localStorage.setItem('kandongla_font_large', state.fontLarge);
  });
}

// ==========================================
// Privacy Notice
// ==========================================
function initPrivacyNotice() {
  const notice = $('#privacyNotice');
  const dismiss = $('#privacyDismiss');
  const saved = localStorage.getItem('kandongla_privacy_dismissed');
  if (saved === 'true') {
    notice.classList.add('hidden');
  }
  dismiss.addEventListener('click', () => {
    notice.classList.add('hidden');
    localStorage.setItem('kandongla_privacy_dismissed', 'true');
  });
}

// ==========================================
// Loading
// ==========================================
function showLoading(text, showOcrProgress) {
  let overlay = $('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }
  let inner = overlay.querySelector('.loading-inner');
  if (!inner) {
    overlay.innerHTML = '';
    inner = document.createElement('div');
    inner.className = 'loading-inner';
    inner.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    inner.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${text || '正在处理...'}</div>
      <div class="ocr-progress" style="display:none;">
        <div class="ocr-progress-bar"><div class="ocr-progress-fill"></div></div>
        <div class="ocr-progress-text">正在看图…</div>
      </div>
    `;
    overlay.appendChild(inner);
  } else {
    inner.querySelector('.loading-text').textContent = text || '正在处理...';
  }
  const progressEl = inner.querySelector('.ocr-progress');
  if (progressEl) {
    progressEl.style.display = showOcrProgress ? 'block' : 'none';
    if (showOcrProgress) {
      const fill = progressEl.querySelector('.ocr-progress-fill');
      if (fill) fill.style.width = '0%';
      const ptext = progressEl.querySelector('.ocr-progress-text');
      if (ptext) ptext.textContent = '正在看图…';
    }
  }
  overlay.classList.remove('hidden');
}

function updateOcrProgress(fraction, statusText) {
  const overlay = $('.loading-overlay');
  if (!overlay) return;
  const fill = overlay.querySelector('.ocr-progress-fill');
  const ptext = overlay.querySelector('.ocr-progress-text');
  if (fill) fill.style.width = Math.round(fraction * 100) + '%';
  if (ptext) {
    if (fraction >= 1.0) {
      ptext.textContent = '看图完成！正在分析…';
    } else if (statusText === 'recognizing') {
      ptext.textContent = '正在识别文字… ' + Math.round(fraction * 100) + '%';
    } else {
      ptext.textContent = '正在看图… ' + Math.round(fraction * 100) + '%';
    }
  }
}

function hideLoading() {
  const overlay = $('.loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ==========================================
// Utilities
// ==========================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// Initialize
// ==========================================
function init() {
  initDemoGrid();
  initUpload();
  initAnalysis();
  initPrivacyMask();
  initFontSize();
  initPrivacyNotice();

  // Preload voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  prewarmOCR();
}

document.addEventListener('DOMContentLoaded', init);