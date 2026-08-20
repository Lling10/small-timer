(function () {
  'use strict';

  // DOM 元素
  const display = document.getElementById('display');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const lapBtn = document.getElementById('lapBtn');
  const lapList = document.getElementById('lapList');
  const lapsSection = document.getElementById('lapsSection');
  const countdownSetup = document.getElementById('countdownSetup');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const modeBtns = document.querySelectorAll('.mode-btn');

  // 状态
  let mode = 'stopwatch'; // stopwatch | countdown
  let elapsed = 0; // 毫秒
  let countdownTotal = 0; // 倒计时总毫秒
  let intervalId = null;
  let lastTick = 0;
  let lapCount = 0;

  /**
   * 将毫秒格式化为 HH:MM:SS 或 MM:SS
   */
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  /**
   * 更新显示
   */
  function updateDisplay() {
    let showMs = elapsed;
    if (mode === 'countdown') {
      showMs = Math.max(0, countdownTotal - elapsed);
    }
    display.textContent = formatTime(showMs);

    // 倒计时剩余 10 秒内警告样式
    if (mode === 'countdown' && showMs > 0 && showMs <= 10000) {
      display.classList.add('warning');
    } else {
      display.classList.remove('warning');
    }

    // 倒计时结束
    if (mode === 'countdown' && showMs === 0 && elapsed >= countdownTotal) {
      display.classList.add('finished');
      stopTimer();
      startBtn.disabled = true;
    }
  }

  /**
   * 开始计时
   */
  function startTimer() {
    if (intervalId) return;

    if (mode === 'countdown' && elapsed === 0) {
      const min = parseInt(minutesInput.value, 10) || 0;
      const sec = parseInt(secondsInput.value, 10) || 0;
      countdownTotal = (min * 60 + sec) * 1000;
      if (countdownTotal <= 0) {
        alert('请设置有效的倒计时时间');
        return;
      }
    }

    lastTick = Date.now();
    intervalId = setInterval(tick, 10);

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    lapBtn.disabled = mode !== 'stopwatch';
    countdownSetup.classList.add('hidden');
    modeBtns.forEach((btn) => (btn.disabled = true));
  }

  /**
   * 每帧更新
   */
  function tick() {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    elapsed += delta;

    if (mode === 'countdown' && elapsed >= countdownTotal) {
      elapsed = countdownTotal;
      updateDisplay();
      stopTimer();
      startBtn.disabled = true;
      return;
    }

    updateDisplay();
  }

  /**
   * 暂停计时
   */
  function pauseTimer() {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
    modeBtns.forEach((btn) => (btn.disabled = false));
  }

  /**
   * 停止计时（内部用）
   */
  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
    modeBtns.forEach((btn) => (btn.disabled = false));
  }

  /**
   * 重置
   */
  function resetTimer() {
    stopTimer();
    elapsed = 0;
    countdownTotal = 0;
    lapCount = 0;
    lapList.innerHTML = '';
    display.classList.remove('warning', 'finished');

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;

    if (mode === 'countdown') {
      countdownSetup.classList.remove('hidden');
    }

    updateDisplay();
  }

  /**
   * 记录计次（秒表模式）
   */
  function recordLap() {
    if (mode !== 'stopwatch' || !intervalId) return;
    lapCount += 1;
    const li = document.createElement('li');
    li.innerHTML = `<span>计次 ${lapCount}</span><span class="lap-time">${formatTime(elapsed)}</span>`;
    lapList.insertBefore(li, lapList.firstChild);
  }

  /**
   * 切换模式
   */
  function switchMode(newMode) {
    if (intervalId) return;
    mode = newMode;

    modeBtns.forEach((btn) => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    if (mode === 'countdown') {
      countdownSetup.classList.remove('hidden');
      lapsSection.classList.add('hidden');
    } else {
      countdownSetup.classList.add('hidden');
      lapsSection.classList.remove('hidden');
    }

    resetTimer();
  }

  // 事件绑定
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
  lapBtn.addEventListener('click', recordLap);

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // 初始化显示
  updateDisplay();
})();
