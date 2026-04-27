(() => {
  const inputText   = document.getElementById('inputText');
  const outputText  = document.getElementById('outputText');
  const sourceLang  = document.getElementById('sourceLang');
  const targetLang  = document.getElementById('targetLang');
  const translateBtn= document.getElementById('translateBtn');
  const swapBtn     = document.getElementById('swapBtn');
  const clearBtn    = document.getElementById('clearBtn');
  const pasteBtn    = document.getElementById('pasteBtn');
  const copyBtn     = document.getElementById('copyBtn');
  const charCount   = document.getElementById('charCount');
  const detectBadge = document.getElementById('detectBadge');
  const copyToast   = document.getElementById('copyToast');
  const errorBanner = document.getElementById('errorBanner');
  const btnLoader   = document.getElementById('btnLoader');
  const sourceLabel = document.getElementById('sourceLabel');
  const targetLabel = document.getElementById('targetLabel');

  const MAX_CHARS = 5000;
  let debounceTimer = null;
  let lastTranslated = '';

  // ── Char counter ──────────────────────────────────────────────
  inputText.addEventListener('input', () => {
    const len = inputText.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.className = 'char-count' + (len > MAX_CHARS * 0.9 ? ' warn' : '') + (len >= MAX_CHARS ? ' limit' : '');

    if (len > MAX_CHARS) {
      inputText.value = inputText.value.slice(0, MAX_CHARS);
    }

    clearError();
    clearDetect();
    triggerDebounce();
  });

  // ── Debounced auto-translate (800ms) ─────────────────────────
  function triggerDebounce() {
    clearTimeout(debounceTimer);
    if (inputText.value.trim().length > 2) {
      debounceTimer = setTimeout(doTranslate, 800);
    }
  }

  // ── Translate ─────────────────────────────────────────────────
  async function doTranslate() {
    const text = inputText.value.trim();
    if (!text) { resetOutput(); return; }

    setLoading(true);
    clearError();

    try {
      const res = await fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source: sourceLang.value,
          target: targetLang.value
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showError(data.error || 'Translation failed. Please try again.');
        return;
      }

      outputText.classList.remove('loading');
      outputText.innerHTML = '';
      outputText.textContent = data.translated;
      lastTranslated = data.translated;

      if (data.detected_language) {
        detectBadge.textContent = `Detected: ${data.detected_language}`;
        detectBadge.classList.add('visible');
      }

    } catch (err) {
      showError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  // ── Translate button ──────────────────────────────────────────
  translateBtn.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    doTranslate();
  });

  // ── Keyboard shortcut Ctrl+Enter ─────────────────────────────
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceTimer);
      doTranslate();
    }
  });

  // ── Swap languages ────────────────────────────────────────────
  swapBtn.addEventListener('click', () => {
    const srcVal = sourceLang.value;
    const tgtVal = targetLang.value;

    if (srcVal === 'auto') {
      // If auto, just swap the text
      const out = lastTranslated;
      if (out) {
        inputText.value = out;
        updateCharCount();
        outputText.innerHTML = '<span class="placeholder-text">Translation will appear here...</span>';
        lastTranslated = '';
      }
      return;
    }

    // Swap selects
    sourceLang.value = tgtVal;
    targetLang.value = srcVal;

    // Swap text
    const currentInput = inputText.value;
    const currentOutput = lastTranslated;
    if (currentOutput) {
      inputText.value = currentOutput;
      updateCharCount();
      outputText.innerHTML = '<span class="placeholder-text">Translation will appear here...</span>';
      lastTranslated = '';
      clearDetect();
      triggerDebounce();
    }
  });

  // ── Clear ─────────────────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    updateCharCount();
    resetOutput();
    clearDetect();
    clearError();
    clearTimeout(debounceTimer);
    inputText.focus();
  });

  // ── Paste ─────────────────────────────────────────────────────
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text.slice(0, MAX_CHARS);
      updateCharCount();
      triggerDebounce();
      inputText.focus();
    } catch {
      inputText.focus();
    }
  });

  // ── Copy translation ──────────────────────────────────────────
  copyBtn.addEventListener('click', async () => {
    if (!lastTranslated) return;
    try {
      await navigator.clipboard.writeText(lastTranslated);
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = lastTranslated;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2000);
    }
  });

  // ── Lang change → re-translate ────────────────────────────────
  sourceLang.addEventListener('change', () => {
    if (inputText.value.trim()) triggerDebounce();
    sourceLabel.textContent = sourceLang.options[sourceLang.selectedIndex].text.replace('🔍 ', '');
  });
  targetLang.addEventListener('change', () => {
    if (inputText.value.trim()) triggerDebounce();
    targetLabel.textContent = `→ ${targetLang.options[targetLang.selectedIndex].text}`;
  });

  // ── Helpers ───────────────────────────────────────────────────
  function setLoading(on) {
    translateBtn.classList.toggle('loading', on);
    outputText.classList.toggle('loading', on);
    if (on) {
      outputText.innerHTML = '';
    }
  }

  function resetOutput() {
    outputText.innerHTML = '<span class="placeholder-text">Translation will appear here...</span>';
    lastTranslated = '';
    outputText.classList.remove('loading');
  }

  function updateCharCount() {
    const len = inputText.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.className = 'char-count';
  }

  function clearDetect() {
    detectBadge.textContent = '';
    detectBadge.classList.remove('visible');
  }

  function showError(msg) {
    errorBanner.textContent = '⚠ ' + msg;
    errorBanner.classList.add('show');
  }

  function clearError() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('show');
  }

  // Focus textarea on load
  inputText.focus();
})();
