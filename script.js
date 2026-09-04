(function () {
  'use strict';

  // 模式常量
  const MODE_NORMAL = 'normal';
  const MODE_EXERCISE = 'exercise';
  const UNIT_SEC = 'sec';
  const UNIT_MIN = 'min';
  const STORAGE_KEY = 'small-timer.v1';
  const THEME_STORAGE_KEY = 'small-timer.theme';
  const THEMES = ['sport', 'sweet', 'neutral'];
  const DEFAULT_THEME = 'sport';

  /** 内置训练模板（不写入 localStorage） */
  const PRESETS = [
    {
      id: 'hiit',
      name: '快速 HIIT',
      config: {
        mode: MODE_EXERCISE,
        alertBeforeSec: 3,
        normal: { durationSec: 60, durationUnit: UNIT_SEC },
        exercise: {
          actions: [
            { name: '开合跳', durationSec: 30, durationUnit: UNIT_SEC },
            { name: '高抬腿', durationSec: 30, durationUnit: UNIT_SEC },
            { name: '波比跳', durationSec: 30, durationUnit: UNIT_SEC },
            { name: '登山跑', durationSec: 30, durationUnit: UNIT_SEC },
          ],
          actionRestSec: 10,
          actionRestUnit: UNIT_SEC,
          totalSets: 3,
          setRestSec: 60,
          setRestUnit: UNIT_MIN,
        },
      },
    },
    {
      id: 'strength',
      name: '力量循环',
      config: {
        mode: MODE_EXERCISE,
        alertBeforeSec: 3,
        normal: { durationSec: 60, durationUnit: UNIT_SEC },
        exercise: {
          actions: [
            { name: '深蹲', durationSec: 45, durationUnit: UNIT_SEC },
            { name: '俯卧撑', durationSec: 45, durationUnit: UNIT_SEC },
            { name: '弓步蹲', durationSec: 45, durationUnit: UNIT_SEC },
            { name: '平板支撑', durationSec: 45, durationUnit: UNIT_SEC },
          ],
          actionRestSec: 20,
          actionRestUnit: UNIT_SEC,
          totalSets: 3,
          setRestSec: 90,
          setRestUnit: UNIT_SEC,
        },
      },
    },
    {
      id: 'stretch',
      name: '拉伸放松',
      config: {
        mode: MODE_EXERCISE,
        alertBeforeSec: 3,
        normal: { durationSec: 60, durationUnit: UNIT_SEC },
        exercise: {
          actions: [
            { name: '站立前屈', durationSec: 60, durationUnit: UNIT_SEC },
            { name: '髋屈肌拉伸', durationSec: 60, durationUnit: UNIT_SEC },
            { name: '肩部环绕', durationSec: 45, durationUnit: UNIT_SEC },
            { name: '猫牛式', durationSec: 60, durationUnit: UNIT_SEC },
          ],
          actionRestSec: 5,
          actionRestUnit: UNIT_SEC,
          totalSets: 2,
          setRestSec: 30,
          setRestUnit: UNIT_SEC,
        },
      },
    },
    {
      id: 'tabata',
      name: 'Tabata 经典',
      config: {
        mode: MODE_EXERCISE,
        alertBeforeSec: 3,
        normal: { durationSec: 60, durationUnit: UNIT_SEC },
        exercise: {
          actions: [
            { name: '高强度动作', durationSec: 20, durationUnit: UNIT_SEC },
          ],
          actionRestSec: 10,
          actionRestUnit: UNIT_SEC,
          totalSets: 8,
          setRestSec: 10,
          setRestUnit: UNIT_SEC,
        },
      },
    },
  ];

  // DOM 元素
  const modeBadge = document.getElementById('modeBadge');
  const modeNormalBtn = document.getElementById('modeNormalBtn');
  const modeExerciseBtn = document.getElementById('modeExerciseBtn');
  const modeSwitch = document.getElementById('modeSwitch');
  const planBar = document.getElementById('planBar');
  const planSelect = document.getElementById('planSelect');
  const savePlanBtn = document.getElementById('savePlanBtn');
  const newPlanBtn = document.getElementById('newPlanBtn');
  const deletePlanBtn = document.getElementById('deletePlanBtn');
  const presetChips = document.getElementById('presetChips');
  const backupToggleBtn = document.getElementById('backupToggleBtn');
  const backupMenu = document.getElementById('backupMenu');
  const importConfigBtn = document.getElementById('importConfigBtn');
  const exportConfigBtn = document.getElementById('exportConfigBtn');
  const importFileInput = document.getElementById('importFileInput');
  const saveDialog = document.getElementById('saveDialog');
  const savePlanNameInput = document.getElementById('savePlanNameInput');
  const savePlanConfirmBtn = document.getElementById('savePlanConfirmBtn');
  const savePlanCancelBtn = document.getElementById('savePlanCancelBtn');
  const planToast = document.getElementById('planToast');
  const planStatus = document.getElementById('planStatus');
  const autosaveHint = document.getElementById('autosaveHint');
  const playerSection = document.getElementById('playerSection');
  const phaseBadge = document.getElementById('phaseBadge');
  const actionDisplay = document.getElementById('actionDisplay');
  const countdownEl = document.getElementById('countdown');
  const setProgressWrap = document.getElementById('setProgressWrap');
  const setProgressText = document.getElementById('setProgressText');
  const progressFill = document.getElementById('progressFill');
  const normalProgressWrap = document.getElementById('normalProgressWrap');
  const normalProgressFill = document.getElementById('normalProgressFill');
  const finishMessage = document.getElementById('finishMessage');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const configSection = document.getElementById('configSection');
  const normalConfigBlock = document.getElementById('normalConfigBlock');
  const exerciseConfigBlock = document.getElementById('exerciseConfigBlock');
  const exerciseSettingsBlock = document.getElementById('exerciseSettingsBlock');
  const normalDurationHourInput = document.getElementById('normalDurationHour');
  const normalDurationMinInput = document.getElementById('normalDurationMin');
  const normalDurationSecInput = document.getElementById('normalDurationSec');
  const actionList = document.getElementById('actionList');
  const addActionBtn = document.getElementById('addActionBtn');
  const actionRestHourInput = document.getElementById('actionRestHour');
  const actionRestMinInput = document.getElementById('actionRestMin');
  const actionRestSecInput = document.getElementById('actionRestSec');
  const totalSetsInput = document.getElementById('totalSets');
  const setRestHourInput = document.getElementById('setRestHour');
  const setRestMinInput = document.getElementById('setRestMin');
  const setRestSecInput = document.getElementById('setRestSec');
  const themeSwitch = document.getElementById('themeSwitch');

  // 当前应用模式
  let currentMode = MODE_EXERCISE;
  // 当前界面风格
  let currentTheme = DEFAULT_THEME;
  // 提前提醒秒数（从配置加载）
  let alertBeforeSec = 3;

  // 方案状态
  let storageState = { version: 1, lastUsedPlanId: null, draft: null, plans: [] };
  let currentPlanId = null;
  let suppressAutosave = false;
  let draftSaveTimer = null;
  let toastTimer = null;

  // 运行状态：idle | running | paused | finished
  let runState = 'idle';
  // 运动模式阶段：exercise | action_rest | set_rest
  let phase = null;
  let intervalId = null;
  let lastTick = 0;
  let remainingMs = 0;
  let phaseTotalMs = 0;
  let currentSet = 1;
  let currentActionIndex = 0;
  let workoutActions = [];
  let workoutConfig = null;
  let normalConfig = null;
  // 记录当前阶段已播放提醒的秒数，避免重复
  let warnedSeconds = new Set();

  /** 音频上下文（需用户交互后创建） */
  let audioCtx = null;

  /**
   * 规范化单位
   */
  function normalizeUnit(unit) {
    return unit === UNIT_MIN ? UNIT_MIN : UNIT_SEC;
  }

  /**
   * 根据数值与单位换算为秒
   */
  function toSeconds(value, unit) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return NaN;
    return normalizeUnit(unit) === UNIT_MIN ? n * 60 : n;
  }

  /**
   * 将总秒数拆成「数值 + 单位」便于展示
   */
  function fromSeconds(totalSec, preferredUnit) {
    const sec = Math.max(0, Math.round(totalSec || 0));
    if (preferredUnit === UNIT_MIN || preferredUnit === UNIT_SEC) {
      if (preferredUnit === UNIT_MIN) {
        return { value: sec / 60, unit: UNIT_MIN };
      }
      return { value: sec, unit: UNIT_SEC };
    }
    if (sec >= 60 && sec % 60 === 0) {
      return { value: sec / 60, unit: UNIT_MIN };
    }
    return { value: sec, unit: UNIT_SEC };
  }

  /**
   * 规范化风格名称
   */
  function normalizeTheme(theme) {
    return THEMES.includes(theme) ? theme : DEFAULT_THEME;
  }

  /**
   * 读取已保存的界面风格
   */
  function loadTheme() {
    try {
      return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch (_) {
      return DEFAULT_THEME;
    }
  }

  /**
   * 应用界面风格并同步按钮状态
   */
  function applyTheme(theme) {
    currentTheme = normalizeTheme(theme);
    document.body.setAttribute('data-theme', currentTheme);

    if (themeSwitch) {
      themeSwitch.querySelectorAll('.theme-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
      });
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch (_) {
      // 配额不足等忽略
    }
  }

  /**
   * 生成方案 ID
   */
  function createPlanId() {
    return `plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 从 localStorage 读取
   */
  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return null;
      return {
        version: 1,
        lastUsedPlanId: data.lastUsedPlanId || null,
        draft: data.draft && typeof data.draft === 'object' ? data.draft : null,
        plans: Array.isArray(data.plans) ? data.plans : [],
      };
    } catch (_) {
      return null;
    }
  }

  /**
   * 写入 localStorage
   */
  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
    } catch (_) {
      // 配额不足等忽略
    }
  }

  /**
   * 将当前界面写入 draft（可立即或防抖）
   */
  function persistDraftNow() {
    storageState.draft = readFullConfig();
    storageState.lastUsedPlanId = currentPlanId;
    saveStorage();
  }

  /**
   * 防抖自动保存 draft
   */
  function scheduleDraftSave() {
    if (suppressAutosave) return;
    if (draftSaveTimer) clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(() => {
      draftSaveTimer = null;
      persistDraftNow();
      flashAutosaveHint();
      updatePlanStatus();
    }, 300);
  }

  /**
   * 在暂停自动保存的情况下执行回调
   */
  function withoutAutosave(fn) {
    suppressAutosave = true;
    try {
      fn();
    } finally {
      suppressAutosave = false;
    }
  }

  /**
   * 刷新方案下拉与删除按钮
   */
  function refreshPlanSelect() {
    planSelect.innerHTML = '';

    const unnamed = document.createElement('option');
    unnamed.value = '';
    unnamed.textContent = '当前编辑（未保存为方案）';
    planSelect.appendChild(unnamed);

    storageState.plans
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .forEach((plan) => {
        const opt = document.createElement('option');
        opt.value = plan.id;
        opt.textContent = plan.name;
        planSelect.appendChild(opt);
      });

    const exists = currentPlanId && storageState.plans.some((p) => p.id === currentPlanId);
    if (!exists) currentPlanId = null;
    planSelect.value = currentPlanId || '';
    deletePlanBtn.disabled = !currentPlanId;
  }

  /**
   * 渲染模板按钮
   */
  function populatePresetChips() {
    presetChips.innerHTML = '';
    PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-chip';
      btn.dataset.presetId = preset.id;
      btn.textContent = preset.name;
      btn.title = `套用「${preset.name}」到下方动作列表`;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyPreset(preset.id);
      });
      presetChips.appendChild(btn);
    });
  }

  /**
   * 高亮当前选用的模板按钮
   */
  function highlightPresetChip(presetId) {
    presetChips.querySelectorAll('.preset-chip').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.presetId === presetId);
    });
  }

  /**
   * 将总秒数拆成时/分/秒
   */
  function splitHms(totalSec) {
    const sec = Math.max(0, Math.round(totalSec || 0));
    return {
      hour: Math.floor(sec / 3600),
      min: Math.floor((sec % 3600) / 60),
      sec: sec % 60,
    };
  }

  /**
   * 从时/分/秒控件读总秒数
   */
  function readHmsInputs(hourInput, minInput, secInput) {
    const hour = Math.max(0, parseInt(hourInput.value, 10) || 0);
    const min = Math.min(59, Math.max(0, parseInt(minInput.value, 10) || 0));
    const sec = Math.min(59, Math.max(0, parseInt(secInput.value, 10) || 0));
    return hour * 3600 + min * 60 + sec;
  }

  /**
   * 将总秒数写入时/分/秒控件（00:00:00）
   */
  function setHmsInputs(hourInput, minInput, secInput, totalSec) {
    const parts = splitHms(totalSec);
    hourInput.value = String(parts.hour).padStart(2, '0');
    minInput.value = String(parts.min).padStart(2, '0');
    secInput.value = String(parts.sec).padStart(2, '0');
  }

  /**
   * 倒计时显示：始终为 00:00:00
   */
  function formatCountdown(totalSec) {
    const sec = Math.max(0, Math.ceil(totalSec || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * 稳定序列化配置，便于比较是否改动
   */
  function stableConfigKey(config) {
    try {
      return JSON.stringify(config);
    } catch (_) {
      return '';
    }
  }

  /**
   * 更新方案状态提示（是否已保存 / 有未保存修改）
   */
  function updatePlanStatus() {
    if (!planStatus) return;

    if (!currentPlanId) {
      planStatus.textContent = '当前为临时编辑，浏览器会自动记住；点「保存」可起名收藏。';
      planStatus.classList.remove('is-dirty', 'is-saved');
      return;
    }

    const plan = storageState.plans.find((p) => p.id === currentPlanId);
    if (!plan) {
      planStatus.textContent = '';
      return;
    }

    const dirty = stableConfigKey(readFullConfig()) !== stableConfigKey(plan.config);
    if (dirty) {
      planStatus.textContent = `正在编辑「${plan.name}」，有未保存的修改。`;
      planStatus.classList.add('is-dirty');
      planStatus.classList.remove('is-saved');
    } else {
      planStatus.textContent = `当前方案「${plan.name}」`;
      planStatus.classList.add('is-saved');
      planStatus.classList.remove('is-dirty');
    }
  }

  /**
   * 新建空白训练（不删已保存方案）
   */
  function createBlankPlan() {
    if (isActive()) {
      showToast('请先暂停或重置后再新建');
      return;
    }

    withoutAutosave(() => {
      currentMode = MODE_EXERCISE;
      setActionRows([]);
      setHmsInputs(normalDurationHourInput, normalDurationMinInput, normalDurationSecInput, 60);
      setHmsInputs(actionRestHourInput, actionRestMinInput, actionRestSecInput, 10);
      totalSetsInput.value = 3;
      setHmsInputs(setRestHourInput, setRestMinInput, setRestSecInput, 60);
      updateModeUI();
      resetTimer();
      updatePhaseUI();
    });

    currentPlanId = null;
    persistDraftNow();
    refreshPlanSelect();
    highlightPresetChip(null);
    updatePlanStatus();
    showToast('已新建空白训练，可填写动作或选用模板');
  }

  /**
   * 短暂提示
   */
  function showToast(message) {
    if (!planToast) return;
    planToast.textContent = message;
    planToast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      planToast.classList.add('hidden');
      toastTimer = null;
    }, 2800);
  }

  /**
   * 闪一下自动记忆提示
   */
  function flashAutosaveHint() {
    if (!autosaveHint) return;
    autosaveHint.textContent = '已自动记住';
    autosaveHint.classList.add('is-flash');
    setTimeout(() => {
      autosaveHint.textContent = '自动记忆已开启';
      autosaveHint.classList.remove('is-flash');
    }, 1200);
  }

  /**
   * 打开保存对话框
   */
  function openSaveDialog() {
    if (isActive()) {
      showToast('请先暂停或重置后再保存');
      return;
    }

    const existing = currentPlanId
      ? storageState.plans.find((p) => p.id === currentPlanId)
      : null;
    savePlanNameInput.value = existing ? existing.name : '';
    saveDialog.classList.remove('hidden');
    savePlanNameInput.focus();
    savePlanNameInput.select();
  }

  /**
   * 关闭保存对话框
   */
  function closeSaveDialog() {
    saveDialog.classList.add('hidden');
  }

  /**
   * 确认保存当前配置为命名方案
   */
  function confirmSavePlan() {
    if (isActive()) {
      showToast('请先暂停或重置后再保存');
      return;
    }

    const trimmed = savePlanNameInput.value.trim();
    if (!trimmed) {
      showToast('方案名称不能为空');
      savePlanNameInput.focus();
      return;
    }

    const existing = currentPlanId
      ? storageState.plans.find((p) => p.id === currentPlanId)
      : null;

    const sameName = storageState.plans.find(
      (p) => p.name === trimmed && p.id !== currentPlanId
    );
    if (sameName) {
      if (!window.confirm(`已有同名方案「${trimmed}」，是否覆盖？`)) return;
      sameName.config = readFullConfig();
      sameName.updatedAt = Date.now();
      currentPlanId = sameName.id;
    } else if (existing) {
      existing.name = trimmed;
      existing.config = readFullConfig();
      existing.updatedAt = Date.now();
    } else {
      const plan = {
        id: createPlanId(),
        name: trimmed,
        updatedAt: Date.now(),
        config: readFullConfig(),
      };
      storageState.plans.push(plan);
      currentPlanId = plan.id;
    }

    persistDraftNow();
    refreshPlanSelect();
    closeSaveDialog();
    highlightPresetChip(null);
    updatePlanStatus();
    showToast(`已保存「${trimmed}」`);
  }

  /**
   * 加载指定方案
   */
  function loadPlan(planId) {
    if (isActive()) {
      showToast('请先暂停或重置后再切换方案');
      refreshPlanSelect();
      return;
    }

    if (!planId) {
      currentPlanId = null;
      persistDraftNow();
      refreshPlanSelect();
      updatePlanStatus();
      return;
    }

    const plan = storageState.plans.find((p) => p.id === planId);
    if (!plan) {
      currentPlanId = null;
      refreshPlanSelect();
      return;
    }

    withoutAutosave(() => {
      applyConfig(plan.config);
      resetTimer();
      updatePhaseUI();
    });
    currentPlanId = plan.id;
    persistDraftNow();
    refreshPlanSelect();
    showToast(`已切换到「${plan.name}」`);
    updatePlanStatus();
  }

  /**
   * 删除当前方案
   */
  function deleteCurrentPlan() {
    if (isActive()) {
      showToast('请先暂停或重置后再删除方案');
      return;
    }
    if (!currentPlanId) return;

    const plan = storageState.plans.find((p) => p.id === currentPlanId);
    if (!plan) {
      currentPlanId = null;
      refreshPlanSelect();
      return;
    }

    if (!window.confirm(`确定删除方案「${plan.name}」？当前配置仍会保留在界面上。`)) {
      return;
    }

    storageState.plans = storageState.plans.filter((p) => p.id !== currentPlanId);
    currentPlanId = null;
    persistDraftNow();
    refreshPlanSelect();
    showToast(`已删除「${plan.name}」`);
    updatePlanStatus();
  }

  /**
   * 套用内置模板：立即填入下方动作 / 休息 / 组数
   */
  function applyPreset(presetId) {
    if (isActive()) {
      showToast('请先暂停或重置后再选用模板');
      return;
    }

    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // 深拷贝，避免后续编辑污染模板常量
    const config = JSON.parse(JSON.stringify(preset.config));

    withoutAutosave(() => {
      applyConfig(config);
      resetTimer();
      updatePhaseUI();
    });

    currentPlanId = null;
    persistDraftNow();
    refreshPlanSelect();
    highlightPresetChip(presetId);

    // 确保用户看到动作列表已更新
    if (exerciseConfigBlock) {
      exerciseConfigBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (actionList) {
      actionList.classList.remove('preset-flash');
      void actionList.offsetWidth;
      actionList.classList.add('preset-flash');
    }

    const actionCount = (config.exercise && config.exercise.actions)
      ? config.exercise.actions.length
      : 0;
    showToast(`已填入「${preset.name}」（${actionCount} 个动作），可改完后点保存`);
    updatePlanStatus();
  }

  /**
   * 获取或创建 AudioContext
   */
  function getAudioContext() {
    if (audioCtx) return audioCtx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
    return audioCtx;
  }

  /**
   * 播放指定频率与时长的提示音
   */
  function playTone(frequency, duration, volume, type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type || 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {
      // 浏览器不支持时忽略
    }
  }

  /** 快结束提醒："滴" */
  function playTickBeep() {
    playTone(880, 0.15, 0.32, 'sine');
  }

  /** 动作开始：双音上升，更明显 */
  function playExerciseStartSound() {
    playTone(587, 0.22, 0.42, 'square');
    setTimeout(() => playTone(880, 0.3, 0.45, 'square'), 200);
  }

  /** 动作结束：双音下降 */
  function playExerciseEndSound() {
    playTone(880, 0.2, 0.4, 'square');
    setTimeout(() => playTone(587, 0.28, 0.4, 'square'), 180);
  }

  /** 间隔开始（动作间隔 / 组间休息） */
  function playRestStartSound() {
    playTone(392, 0.3, 0.36, 'triangle');
    setTimeout(() => playTone(262, 0.38, 0.36, 'triangle'), 220);
  }

  /** 动作间隔结束：三连音提示准备开始 */
  function playRestEndSound() {
    playTone(523, 0.18, 0.38, 'square');
    setTimeout(() => playTone(659, 0.18, 0.38, 'square'), 150);
    setTimeout(() => playTone(784, 0.24, 0.42, 'square'), 300);
  }

  /** 组间休息结束：更长更明显 */
  function playSetRestEndSound() {
    playTone(330, 0.45, 0.38, 'sine');
    setTimeout(() => playTone(440, 0.45, 0.4, 'sine'), 350);
    setTimeout(() => playTone(554, 0.35, 0.42, 'sine'), 700);
  }

  /** 全部完成 / 倒计时结束提示音 */
  function playFinishSound() {
    playTone(523, 0.25, 0.28, 'sine');
    setTimeout(() => playTone(659, 0.25, 0.28, 'sine'), 280);
    setTimeout(() => playTone(784, 0.45, 0.32, 'sine'), 560);
  }

  /**
   * 播放当前阶段结束提示音
   */
  function playPhaseEndSound(endedPhase) {
    if (endedPhase === 'exercise') {
      playExerciseEndSound();
    } else if (endedPhase === 'action_rest') {
      playRestEndSound();
    } else if (endedPhase === 'set_rest') {
      playSetRestEndSound();
    }
  }

  /**
   * 播放新阶段开始提示音
   */
  function playPhaseStartSound(newPhase) {
    if (newPhase === 'exercise') {
      playExerciseStartSound();
      triggerFlash();
      return;
    }

    if (newPhase === 'action_rest' || newPhase === 'set_rest') {
      playRestStartSound();
      triggerFlash();
    }
  }

  /**
   * 触发视觉闪烁
   */
  function triggerFlash() {
    playerSection.classList.remove('flash-pulse');
    countdownEl.classList.remove('tick-flash');
    void playerSection.offsetWidth;
    playerSection.classList.add('flash-pulse');
    countdownEl.classList.add('tick-flash');
  }

  /**
   * 是否正在计时中
   */
  function isActive() {
    return runState === 'running' || runState === 'paused';
  }

  /**
   * 更新模式指示与按钮状态
   */
  function updateModeUI() {
    const isNormal = currentMode === MODE_NORMAL;
    modeBadge.textContent = isNormal ? '普通模式' : '运动模式';
    modeBadge.classList.toggle('mode-normal', isNormal);
    modeBadge.classList.toggle('mode-exercise', !isNormal);

    modeNormalBtn.classList.toggle('active', isNormal);
    modeExerciseBtn.classList.toggle('active', !isNormal);

    normalConfigBlock.classList.toggle('hidden', !isNormal);
    exerciseConfigBlock.classList.toggle('hidden', isNormal);
    exerciseSettingsBlock.classList.toggle('hidden', isNormal);

    // 方案 / 模板仅运动模式使用
    if (planBar) planBar.classList.toggle('hidden', isNormal);
    if (isNormal) {
      if (typeof closeSaveDialog === 'function') closeSaveDialog();
      if (typeof closeBackupMenu === 'function') closeBackupMenu();
      if (planToast) planToast.classList.add('hidden');
    }

    setProgressWrap.classList.toggle('hidden', isNormal);
    normalProgressWrap.classList.toggle('hidden', !isNormal);

    modeSwitch.classList.toggle('disabled', isActive());
  }

  /**
   * 切换模式
   */
  function switchMode(mode) {
    if (isActive()) return;
    if (mode !== MODE_NORMAL && mode !== MODE_EXERCISE) return;
    if (currentMode === mode) return;

    currentMode = mode;
    resetTimer();
    updateModeUI();
    updatePhaseUI();
    scheduleDraftSave();
  }

  /**
   * 创建动作行的时分秒输入（00:00:00）
   */
  function createActionHmsWrap(durationSec) {
    const wrap = document.createElement('div');
    wrap.className = 'field-hms action-hms';

    const hourInput = document.createElement('input');
    hourInput.type = 'number';
    hourInput.className = 'action-hour-input';
    hourInput.min = '0';
    hourInput.placeholder = '00';
    hourInput.setAttribute('aria-label', '小时');

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'action-min-input';
    minInput.min = '0';
    minInput.max = '59';
    minInput.placeholder = '00';
    minInput.setAttribute('aria-label', '分钟');

    const secInput = document.createElement('input');
    secInput.type = 'number';
    secInput.className = 'action-sec-input';
    secInput.min = '0';
    secInput.max = '59';
    secInput.placeholder = '00';
    secInput.setAttribute('aria-label', '秒');

    const hourSep = document.createElement('span');
    hourSep.className = 'field-unit';
    hourSep.setAttribute('aria-hidden', 'true');
    hourSep.textContent = ':';
    const minSep = document.createElement('span');
    minSep.className = 'field-unit';
    minSep.setAttribute('aria-hidden', 'true');
    minSep.textContent = ':';

    wrap.append(hourInput, hourSep, minInput, minSep, secInput);

    if (durationSec !== undefined && durationSec !== '' && Number.isFinite(Number(durationSec))) {
      setHmsInputs(hourInput, minInput, secInput, Number(durationSec));
    }

    return wrap;
  }

  /**
   * 从动作行读取时长（秒）
   */
  function readActionRowDurationSec(row) {
    return readHmsInputs(
      row.querySelector('.action-hour-input'),
      row.querySelector('.action-min-input'),
      row.querySelector('.action-sec-input')
    );
  }

  /**
   * 创建一条动作输入行
   */
  function createActionRow(name, durationSec) {
    const row = document.createElement('div');
    row.className = 'action-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'action-name-input';
    nameInput.placeholder = '动作名称';
    if (name) nameInput.value = name;

    const durationWrap = createActionHmsWrap(durationSec);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.title = '删除动作';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      if (actionList.children.length <= 1) {
        nameInput.value = '';
        setHmsInputs(
          row.querySelector('.action-hour-input'),
          row.querySelector('.action-min-input'),
          row.querySelector('.action-sec-input'),
          0
        );
        scheduleDraftSave();
        return;
      }
      row.remove();
      updateRemoveButtons();
      scheduleDraftSave();
    });

    row.append(nameInput, durationWrap, removeBtn);
    return row;
  }

  /**
   * 更新删除按钮提示（始终可点：多条删除，最后一条清空）
   */
  function updateRemoveButtons() {
    const rows = actionList.querySelectorAll('.action-row');
    const onlyOne = rows.length <= 1;
    rows.forEach((row) => {
      const btn = row.querySelector('.btn-remove');
      btn.disabled = false;
      btn.title = onlyOne ? '清空动作' : '删除动作';
    });
  }

  /**
   * 添加动作行
   */
  function addActionRow(name, durationSec) {
    actionList.appendChild(createActionRow(name, durationSec));
    updateRemoveButtons();
  }

  /**
   * 清空并重建动作列表
   */
  function setActionRows(actions) {
    actionList.innerHTML = '';
    if (!actions || actions.length === 0) {
      addActionRow();
      return;
    }
    actions.forEach((a) => {
      let durationSec = a.durationSec;
      if (durationSec === undefined && a.durationValue !== undefined) {
        durationSec = toSeconds(a.durationValue, a.durationUnit);
      }
      addActionRow(a.name, durationSec);
    });
  }

  /**
   * 从界面读取运动模式配置（不弹窗，用于导出）
   */
  function readExerciseConfigRaw() {
    const rows = actionList.querySelectorAll('.action-row');
    const actions = [];

    rows.forEach((row) => {
      const name = row.querySelector('.action-name-input').value.trim();
      const durationSec = readActionRowDurationSec(row);
      if (name && Number.isFinite(durationSec) && durationSec >= 1) {
        actions.push({
          name,
          durationSec: Math.round(durationSec),
        });
      }
    });

    const actionRestSec = readHmsInputs(
      actionRestHourInput,
      actionRestMinInput,
      actionRestSecInput
    );
    const totalSets = parseInt(totalSetsInput.value, 10);
    const setRestSec = readHmsInputs(
      setRestHourInput,
      setRestMinInput,
      setRestSecInput
    );

    return {
      actions: actions.length > 0 ? actions : [{ name: '动作1', durationSec: 30 }],
      actionRestSec: Number.isFinite(actionRestSec) && actionRestSec >= 0 ? actionRestSec : 10,
      totalSets: Number.isFinite(totalSets) && totalSets >= 1 ? totalSets : 3,
      setRestSec: Number.isFinite(setRestSec) && setRestSec >= 0 ? setRestSec : 60,
    };
  }

  /**
   * 从界面读取普通模式配置（不弹窗，用于导出）
   */
  function readNormalConfigRaw() {
    const durationSec = readHmsInputs(
      normalDurationHourInput,
      normalDurationMinInput,
      normalDurationSecInput
    );
    return {
      durationSec: durationSec >= 1 ? durationSec : 60,
    };
  }

  /**
   * 从界面读取普通模式配置（启动前校验）
   */
  function readNormalConfig() {
    const durationSec = readHmsInputs(
      normalDurationHourInput,
      normalDurationMinInput,
      normalDurationSecInput
    );
    if (!Number.isFinite(durationSec) || durationSec < 1) {
      alert('请设置有效的倒计时时长（至少 1 秒）');
      return null;
    }
    return { durationSec };
  }

  /**
   * 从界面读取运动模式配置
   */
  function readExerciseConfig() {
    const rows = actionList.querySelectorAll('.action-row');
    const actions = [];

    for (let i = 0; i < rows.length; i++) {
      const name = rows[i].querySelector('.action-name-input').value.trim();
      const durationSec = readActionRowDurationSec(rows[i]);

      if (!name) {
        alert(`请填写第 ${i + 1} 个动作的名称`);
        return null;
      }
      if (!Number.isFinite(durationSec) || durationSec < 1) {
        alert(`请为「${name}」设置有效的执行时长（至少 1 秒）`);
        return null;
      }
      actions.push({ name, durationSec: Math.round(durationSec) });
    }

    const actionRestSec = readHmsInputs(
      actionRestHourInput,
      actionRestMinInput,
      actionRestSecInput
    );
    if (!Number.isFinite(actionRestSec) || actionRestSec < 0) {
      alert('请设置有效的动作间休息时间（0 或以上）');
      return null;
    }

    const totalSets = parseInt(totalSetsInput.value, 10);
    if (!Number.isFinite(totalSets) || totalSets < 1) {
      alert('请设置有效的组数（至少 1 组）');
      return null;
    }

    const setRestTotalSec = readHmsInputs(
      setRestHourInput,
      setRestMinInput,
      setRestSecInput
    );
    if (!Number.isFinite(setRestTotalSec) || setRestTotalSec < 0) {
      alert('请设置有效的组间休息时间（0 或以上）');
      return null;
    }

    return {
      actions,
      actionRestSec: Math.round(actionRestSec),
      totalSets,
      setRestTotalSec: Math.round(setRestTotalSec),
    };
  }

  /**
   * 从界面读取当前完整配置（用于导出 / draft）
   */
  function readFullConfig() {
    const normal = readNormalConfigRaw();
    const exercise = readExerciseConfigRaw();

    return {
      mode: currentMode,
      alertBeforeSec,
      normal: {
        durationSec: normal.durationSec,
      },
      exercise: {
        actions: exercise.actions,
        actionRestSec: exercise.actionRestSec,
        totalSets: exercise.totalSets,
        setRestSec: exercise.setRestSec,
      },
    };
  }

  /**
   * 将配置应用到界面
   */
  function applyConfig(config) {
    if (!config || typeof config !== 'object') {
      alert('配置文件格式无效');
      return false;
    }

    if (config.alertBeforeSec !== undefined) {
      const val = parseInt(config.alertBeforeSec, 10);
      if (Number.isFinite(val) && val >= 1) {
        alertBeforeSec = val;
      }
    }

    if (config.normal && config.normal.durationSec !== undefined) {
      setHmsInputs(
        normalDurationHourInput,
        normalDurationMinInput,
        normalDurationSecInput,
        config.normal.durationSec
      );
    }

    if (config.exercise) {
      const ex = config.exercise;
      if (Array.isArray(ex.actions)) {
        setActionRows(ex.actions);
      }
      if (ex.actionRestSec !== undefined) {
        setDurationControls(
          actionRestValueInput,
          actionRestUnitSelect,
          ex.actionRestSec,
          ex.actionRestUnit
        );
      }
      if (ex.totalSets !== undefined) {
        totalSetsInput.value = ex.totalSets;
      }
      if (ex.setRestSec !== undefined) {
        setDurationControls(
          setRestValueInput,
          setRestUnitSelect,
          ex.setRestSec,
          ex.setRestUnit
        );
      }
    }

    if (config.mode === MODE_NORMAL || config.mode === MODE_EXERCISE) {
      currentMode = config.mode;
    }

    updateModeUI();
    return true;
  }

  /**
   * 填入界面兜底默认值
   */
  function applyFallbackDefaults() {
    const hasNormal =
      normalDurationHourInput.value !== ''
      || normalDurationMinInput.value !== ''
      || normalDurationSecInput.value !== '';
    if (!hasNormal) {
      setHmsInputs(normalDurationHourInput, normalDurationMinInput, normalDurationSecInput, 60);
    }

    const hasActionRest =
      actionRestHourInput.value !== ''
      || actionRestMinInput.value !== ''
      || actionRestSecInput.value !== '';
    if (!hasActionRest) {
      setHmsInputs(actionRestHourInput, actionRestMinInput, actionRestSecInput, 10);
    }

    if (!totalSetsInput.value) {
      totalSetsInput.value = 3;
    }

    const hasSetRest =
      setRestHourInput.value !== ''
      || setRestMinInput.value !== ''
      || setRestSecInput.value !== '';
    if (!hasSetRest) {
      setHmsInputs(setRestHourInput, setRestMinInput, setRestSecInput, 60);
    }

    if (actionList.children.length === 0) {
      addActionRow();
    }
  }

  /**
   * 启动加载：localStorage draft → config.json → 兜底
   */
  async function bootstrapConfig() {
    const stored = loadStorage();
    if (stored) {
      storageState = stored;
    }

    let loadedFromDraft = false;
    withoutAutosave(() => {
      if (storageState.draft) {
        loadedFromDraft = applyConfig(storageState.draft);
      }
    });

    if (!loadedFromDraft) {
      let loadedFromFile = false;
      try {
        const res = await fetch('config.json');
        if (res.ok) {
          const config = await res.json();
          withoutAutosave(() => {
            loadedFromFile = applyConfig(config);
          });
        }
      } catch (_) {
        // 本地 file:// 打开时可能失败
      }
      if (!loadedFromFile) {
        withoutAutosave(() => applyFallbackDefaults());
      }
    }

    withoutAutosave(() => applyFallbackDefaults());

    if (
      storageState.lastUsedPlanId &&
      storageState.plans.some((p) => p.id === storageState.lastUsedPlanId)
    ) {
      currentPlanId = storageState.lastUsedPlanId;
    } else {
      currentPlanId = null;
    }

    persistDraftNow();
    refreshPlanSelect();
    updateModeUI();
    updatePhaseUI();
    updatePlanStatus();
  }

  /**
   * 导出配置为 JSON 文件（备份）
   */
  function exportConfig() {
    if (isActive()) {
      alert('请先暂停或重置计时器后再导出备份');
      return;
    }

    closeBackupMenu();
    const config = readFullConfig();

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timer-config-${currentMode}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 导入配置文件（恢复备份）
   */
  function importConfigFromFile(file) {
    if (!file) return;
    if (isActive()) {
      alert('请先暂停或重置计时器后再恢复备份');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        withoutAutosave(() => {
          if (applyConfig(config)) {
            resetTimer();
            updatePhaseUI();
          }
        });
        currentPlanId = null;
        persistDraftNow();
        refreshPlanSelect();
        showToast('备份已恢复，可点保存固化');
        updatePlanStatus();
      } catch (_) {
        alert('无法解析备份文件，请确认是有效的 JSON 格式');
      }
    };
    reader.readAsText(file);
  }

  /**
   * 设置配置区是否可编辑
   */
  function setConfigEnabled(enabled) {
    configSection.classList.toggle('disabled', !enabled);
    modeSwitch.classList.toggle('disabled', !enabled);
  }

  function closeBackupMenu() {
    backupMenu.classList.add('hidden');
    backupToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleBackupMenu() {
    const open = backupMenu.classList.contains('hidden');
    if (open) {
      backupMenu.classList.remove('hidden');
      backupToggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      closeBackupMenu();
    }
  }

  /**
   * 更新运动模式组进度
   */
  function updateSetProgress() {
    if (!workoutConfig) return;

    const total = workoutConfig.totalSets;
    setProgressText.textContent = `第 ${currentSet} / ${total} 组`;

    const completedSets = currentSet - 1;
    let setFraction = completedSets / total;

    if (runState === 'running' || runState === 'paused') {
      const actionsCount = workoutActions.length;
      let stepIndex = 0;
      const totalSteps = actionsCount;

      if (phase === 'action_rest') {
        stepIndex = currentActionIndex + 0.5;
      } else if (phase === 'set_rest') {
        stepIndex = actionsCount;
      } else {
        stepIndex = currentActionIndex;
      }

      const withinSetProgress = totalSteps > 0 ? stepIndex / totalSteps : 0;
      setFraction = (completedSets + withinSetProgress) / total;
    }

    if (runState === 'finished') {
      setFraction = 1;
    }

    const percent = Math.min(100, Math.round(setFraction * 100));
    progressFill.style.width = `${percent}%`;
    progressFill.parentElement.setAttribute('aria-valuenow', String(percent));
  }

  /**
   * 更新普通模式进度条
   */
  function updateNormalProgress() {
    if (!normalConfig || phaseTotalMs <= 0) {
      normalProgressFill.style.width = '0%';
      normalProgressFill.parentElement.setAttribute('aria-valuenow', '0');
      return;
    }

    let fraction = 0;
    if (runState === 'finished') {
      fraction = 1;
    } else if (runState === 'running' || runState === 'paused') {
      fraction = 1 - remainingMs / phaseTotalMs;
    }

    const percent = Math.min(100, Math.round(fraction * 100));
    normalProgressFill.style.width = `${percent}%`;
    normalProgressFill.parentElement.setAttribute('aria-valuenow', String(percent));
  }

  /**
   * 更新阶段 UI
   */
  function updatePhaseUI() {
    playerSection.classList.remove('phase-rest', 'phase-finished');

    if (runState === 'idle') {
      phaseBadge.textContent = '待机';
      actionDisplay.textContent = currentMode === MODE_NORMAL ? '倒计时' : '—';
      countdownEl.textContent = '—';
      countdownEl.classList.remove('warning');
      finishMessage.classList.add('hidden');
      progressFill.style.width = '0%';
      normalProgressFill.style.width = '0%';
      return;
    }

    if (runState === 'finished') {
      playerSection.classList.add('phase-finished');
      phaseBadge.textContent = '完成';
      actionDisplay.textContent = currentMode === MODE_NORMAL ? '倒计时结束' : '全部完成';
      countdownEl.textContent = '00:00:00';
      countdownEl.classList.remove('warning');
      finishMessage.classList.remove('hidden');
      if (currentMode === MODE_EXERCISE) {
        updateSetProgress();
      } else {
        updateNormalProgress();
      }
      return;
    }

    finishMessage.classList.add('hidden');

    if (currentMode === MODE_NORMAL) {
      phaseBadge.textContent = '倒计时';
      actionDisplay.textContent = '剩余时间';
    } else if (phase === 'exercise') {
      phaseBadge.textContent = '执行动作';
      actionDisplay.textContent = workoutActions[currentActionIndex].name;
    } else if (phase === 'action_rest') {
      playerSection.classList.add('phase-rest');
      phaseBadge.textContent = '动作间隔';
      actionDisplay.textContent = '休息';
    } else if (phase === 'set_rest') {
      playerSection.classList.add('phase-rest');
      phaseBadge.textContent = '组间休息';
      actionDisplay.textContent = '组间休息';
    }

    const remainSec = Math.ceil(remainingMs / 1000);
    countdownEl.textContent = formatCountdown(remainSec);

    if (currentMode === MODE_EXERCISE) {
      const showWarning = remainSec <= alertBeforeSec && remainSec > 0;
      countdownEl.classList.toggle('warning', showWarning);
      updateSetProgress();
    } else {
      countdownEl.classList.remove('warning');
      updateNormalProgress();
    }
  }

  function resetWarnings() {
    warnedSeconds = new Set();
  }

  function checkExerciseAlert(remainSec) {
    const phaseTotalSec = Math.ceil(phaseTotalMs / 1000);
    const alertAtSec = Math.min(alertBeforeSec, phaseTotalSec);

    if (remainSec !== alertAtSec) return;
    const key = `${phase}-${alertAtSec}`;
    if (warnedSeconds.has(key)) return;
    warnedSeconds.add(key);
    playTickBeep();
    triggerFlash();
  }

  function enterExercisePhase(newPhase, durationMs, playStart) {
    phase = newPhase;
    remainingMs = durationMs;
    phaseTotalMs = durationMs;
    resetWarnings();

    if (playStart !== false) {
      playPhaseStartSound(newPhase);
    } else {
      updatePhaseUI();
      return;
    }

    updatePhaseUI();
  }

  function transitionWithSound(endedPhase, nextPhase, durationMs) {
    const endWouldPlay = !!endedPhase;
    const startWouldPlay = nextPhase === 'exercise'
      || nextPhase === 'action_rest'
      || nextPhase === 'set_rest';

    if (endWouldPlay && startWouldPlay) {
      enterExercisePhase(nextPhase, durationMs, true);
      return;
    }

    if (endWouldPlay) {
      playPhaseEndSound(endedPhase);
      triggerFlash();
    }

    enterExercisePhase(nextPhase, durationMs, startWouldPlay);
  }

  function advanceExercisePhase() {
    const endedPhase = phase;
    const actionsCount = workoutActions.length;
    const isLastAction = currentActionIndex >= actionsCount - 1;
    const isLastSet = currentSet >= workoutConfig.totalSets;

    if (phase === 'exercise') {
      if (!isLastAction) {
        if (workoutConfig.actionRestSec > 0) {
          transitionWithSound(endedPhase, 'action_rest', workoutConfig.actionRestSec * 1000);
        } else {
          currentActionIndex += 1;
          transitionWithSound(endedPhase, 'exercise', workoutActions[currentActionIndex].durationSec * 1000);
        }
        return;
      }

      if (!isLastSet) {
        if (workoutConfig.setRestTotalSec > 0) {
          transitionWithSound(endedPhase, 'set_rest', workoutConfig.setRestTotalSec * 1000);
        } else {
          currentSet += 1;
          currentActionIndex = 0;
          transitionWithSound(endedPhase, 'exercise', workoutActions[0].durationSec * 1000);
        }
        return;
      }

      finishTimer();
      return;
    }

    if (phase === 'action_rest') {
      currentActionIndex += 1;
      transitionWithSound(endedPhase, 'exercise', workoutActions[currentActionIndex].durationSec * 1000);
      return;
    }

    if (phase === 'set_rest') {
      currentSet += 1;
      currentActionIndex = 0;
      transitionWithSound(endedPhase, 'exercise', workoutActions[0].durationSec * 1000);
    }
  }

  function finishTimer() {
    runState = 'finished';
    phase = null;
    stopInterval();
    playFinishSound();
    triggerFlash();

    startBtn.disabled = true;
    pauseBtn.disabled = true;
    setConfigEnabled(true);

    updatePhaseUI();
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function tickNormal() {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    remainingMs -= delta;

    if (remainingMs <= 0) {
      remainingMs = 0;
      updatePhaseUI();
      finishTimer();
      return;
    }

    updatePhaseUI();
  }

  function tickExercise() {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    remainingMs -= delta;

    const remainSec = Math.ceil(remainingMs / 1000);
    checkExerciseAlert(remainSec);

    if (remainingMs <= 0) {
      remainingMs = 0;
      updatePhaseUI();
      advanceExercisePhase();
      return;
    }

    updatePhaseUI();
  }

  function tick() {
    if (currentMode === MODE_NORMAL) {
      tickNormal();
    } else {
      tickExercise();
    }
  }

  function startTimer() {
    if (runState === 'running') return;

    getAudioContext();

    if (runState === 'idle' || runState === 'finished') {
      if (currentMode === MODE_NORMAL) {
        const config = readNormalConfig();
        if (!config) return;
        normalConfig = config;
        workoutConfig = null;
        workoutActions = [];
        phase = 'countdown';
        remainingMs = config.durationSec * 1000;
        phaseTotalMs = remainingMs;
      } else {
        const config = readExerciseConfig();
        if (!config) return;
        workoutConfig = config;
        workoutActions = config.actions;
        normalConfig = null;
        currentSet = 1;
        currentActionIndex = 0;
        enterExercisePhase('exercise', workoutActions[0].durationSec * 1000);
      }
      runState = 'running';
      if (currentMode === MODE_NORMAL) {
        updatePhaseUI();
      }
    } else if (runState === 'paused') {
      runState = 'running';
      updatePhaseUI();
    }

    lastTick = Date.now();
    intervalId = setInterval(tick, 50);

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    setConfigEnabled(false);
    closeBackupMenu();
  }

  function pauseTimer() {
    if (runState !== 'running') return;
    runState = 'paused';
    stopInterval();

    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function resetTimer() {
    stopInterval();
    runState = 'idle';
    phase = null;
    remainingMs = 0;
    phaseTotalMs = 0;
    currentSet = 1;
    currentActionIndex = 0;
    workoutActions = [];
    workoutConfig = null;
    normalConfig = null;
    resetWarnings();

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    setConfigEnabled(true);

    playerSection.classList.remove('phase-rest', 'phase-finished', 'flash-pulse');
    countdownEl.classList.remove('warning', 'tick-flash');
    progressFill.style.width = '0%';
    normalProgressFill.style.width = '0%';

    updatePhaseUI();
  }

  // 事件绑定
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  modeNormalBtn.addEventListener('click', () => switchMode(MODE_NORMAL));
  modeExerciseBtn.addEventListener('click', () => switchMode(MODE_EXERCISE));

  addActionBtn.addEventListener('click', () => {
    if (isActive()) return;
    addActionRow();
    scheduleDraftSave();
  });

  planSelect.addEventListener('change', () => {
    highlightPresetChip(null);
    loadPlan(planSelect.value || null);
  });

  savePlanBtn.addEventListener('click', openSaveDialog);
  newPlanBtn.addEventListener('click', createBlankPlan);
  deletePlanBtn.addEventListener('click', deleteCurrentPlan);
  savePlanConfirmBtn.addEventListener('click', confirmSavePlan);
  savePlanCancelBtn.addEventListener('click', closeSaveDialog);
  savePlanNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmSavePlan();
    } else if (e.key === 'Escape') {
      closeSaveDialog();
    }
  });

  backupToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBackupMenu();
  });

  document.addEventListener('click', (e) => {
    if (!backupMenu.classList.contains('hidden') && !backupMenu.contains(e.target) && e.target !== backupToggleBtn) {
      closeBackupMenu();
    }
  });

  importConfigBtn.addEventListener('click', () => {
    closeBackupMenu();
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    importConfigFromFile(file);
    importFileInput.value = '';
  });

  exportConfigBtn.addEventListener('click', exportConfig);

  // 风格切换（可随时切换，不影响计时逻辑）
  if (themeSwitch) {
    themeSwitch.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-btn');
      if (!btn || !btn.dataset.theme) return;
      applyTheme(btn.dataset.theme);
    });
  }

  // 配置变更自动保存（排除方案切换本身）
  configSection.addEventListener('input', (e) => {
    if (e.target.closest('#planSelect, #saveDialog')) return;
    scheduleDraftSave();
  });
  configSection.addEventListener('change', (e) => {
    if (e.target.closest('#planSelect, #saveDialog, .preset-chips')) return;
    scheduleDraftSave();
  });

  // 初始化
  applyTheme(loadTheme());
  populatePresetChips();
  addActionRow();
  bootstrapConfig();
})();
