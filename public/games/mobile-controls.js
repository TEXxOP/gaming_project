/**
 * ═══════════════════════════════════════════════════════
 * MOBILE CONTROLS — Virtual joystick, action buttons,
 * keyboard helper, look-aim zone for Unity WebGL games.
 *
 * Usage: Add to game HTML with:
 *   <link rel="stylesheet" href="../mobile-controls.css">
 *   <script src="../mobile-controls.js" data-game-type="fps"></script>
 *
 * Game types: "fps" | "racing"
 * ═══════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ─── Detect mobile via userAgent ───
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Also check touch support as fallback
  if (!isMobile) {
    isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  if (!isMobile) return;

  // ─── Add mobile class to body for CSS ───
  document.body.classList.add('mobile-device');

  var scriptTag = document.currentScript || document.querySelector('script[data-game-type]');
  var gameType = (scriptTag && scriptTag.getAttribute('data-game-type')) || 'fps';

  console.log('[MobileControls] Detected mobile device, game type:', gameType);

  // ─── Wait for DOM then init ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('[MobileControls] Initializing...');
    injectHTML();
    loadNippleJS(function () {
      console.log('[MobileControls] nipplejs loaded, setting up joystick');
      setupJoystick();
    });
    setupActionButtons();
    setupKeyboardHelper();
    setupLookZone();
    console.log('[MobileControls] Init complete');
  }

  // ═══════════════════════════════════════════════
  // INJECT HTML ELEMENTS
  // ═══════════════════════════════════════════════
  function injectHTML() {
    // ── Rotate overlay ──
    var rotateOverlay = document.createElement('div');
    rotateOverlay.id = 'mobile-rotate-overlay';
    rotateOverlay.innerHTML = [
      '<svg class="rotate-icon" viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="3">',
      '  <rect x="25" y="10" width="50" height="80" rx="8" />',
      '  <circle cx="50" cy="78" r="4" fill="white"/>',
      '  <path d="M75 50 L90 50 M82 42 L90 50 L82 58" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>',
      '<h2>Rotate Your Device</h2>',
      '<p>This game is best played in landscape mode. Please rotate your phone.</p>'
    ].join('\n');
    document.body.appendChild(rotateOverlay);

    // ── Controls layer ──
    var controlsLayer = document.createElement('div');
    controlsLayer.id = 'mobile-controls-layer';

    // Joystick zone
    var joystickZone = document.createElement('div');
    joystickZone.id = 'joystick-zone';
    controlsLayer.appendChild(joystickZone);

    // Look zone (FPS only)
    if (gameType === 'fps') {
      var lookZone = document.createElement('div');
      lookZone.id = 'look-zone';
      controlsLayer.appendChild(lookZone);
    }

    // Primary action buttons
    var actionBtns = document.createElement('div');
    actionBtns.id = 'action-buttons';

    if (gameType === 'fps') {
      actionBtns.innerHTML = [
        '<button class="action-btn btn-primary-action" data-key=" " data-code="Space" data-keycode="32">JUMP</button>',
        '<button class="action-btn" data-mouse="left">FIRE</button>',
        '<button class="action-btn" data-mouse="right">AIM</button>'
      ].join('\n');
    } else {
      // Racing controls
      actionBtns.innerHTML = [
        '<button class="action-btn btn-primary-action" data-key="w" data-code="KeyW" data-keycode="87">GAS</button>',
        '<button class="action-btn" data-key="s" data-code="KeyS" data-keycode="83">BRAKE</button>',
        '<button class="action-btn" data-key=" " data-code="Space" data-keycode="32">BOOST</button>'
      ].join('\n');
    }
    controlsLayer.appendChild(actionBtns);

    // Secondary buttons (FPS only)
    if (gameType === 'fps') {
      var secBtns = document.createElement('div');
      secBtns.id = 'action-buttons-secondary';
      secBtns.innerHTML = [
        '<button class="action-btn" data-key="r" data-code="KeyR" data-keycode="82">RLD</button>',
        '<button class="action-btn" data-key="e" data-code="KeyE" data-keycode="69">USE</button>'
      ].join('\n');
      controlsLayer.appendChild(secBtns);
    }

    document.body.appendChild(controlsLayer);

    // ── Keyboard input helper ──
    var kbHelper = document.createElement('div');
    kbHelper.id = 'mobile-keyboard-helper';
    kbHelper.innerHTML = [
      '<button class="kb-toggle-btn" id="kb-toggle">',
      '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <rect x="2" y="4" width="20" height="16" rx="2"/>',
      '    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/>',
      '  </svg>',
      '  Keyboard',
      '</button>'
    ].join('\n');
    document.body.appendChild(kbHelper);

    var kbInput = document.createElement('input');
    kbInput.id = 'mobile-keyboard-input';
    kbInput.type = 'text';
    kbInput.placeholder = 'Type here, press Enter to submit...';
    kbInput.autocomplete = 'off';
    kbInput.autocapitalize = 'off';
    kbInput.spellcheck = false;
    document.body.appendChild(kbInput);

    // ── Performance notice ──
    var perfNotice = document.createElement('div');
    perfNotice.id = 'mobile-perf-notice';
    perfNotice.textContent = 'Mobile WebGL — Performance may vary';
    document.body.appendChild(perfNotice);

    console.log('[MobileControls] HTML injected');
  }

  // ═══════════════════════════════════════════════
  // LOAD NIPPLE.JS FROM CDN
  // ═══════════════════════════════════════════════
  function loadNippleJS(callback) {
    if (window.nipplejs) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.10.2/nipplejs.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      console.log('[MobileControls] nipplejs loaded successfully');
      callback();
    };
    script.onerror = function () {
      console.warn('[MobileControls] Failed to load nipplejs — trying alternate CDN');
      // Try alternate CDN
      var alt = document.createElement('script');
      alt.src = 'https://unpkg.com/nipplejs@0.10.2/dist/nipplejs.min.js';
      alt.onload = function() {
        console.log('[MobileControls] nipplejs loaded from alternate CDN');
        callback();
      };
      alt.onerror = function() {
        console.error('[MobileControls] Failed to load nipplejs from all CDNs');
      };
      document.head.appendChild(alt);
    };
    document.head.appendChild(script);
  }

  // ═══════════════════════════════════════════════
  // VIRTUAL JOYSTICK (WASD)
  // ═══════════════════════════════════════════════
  function setupJoystick() {
    if (!window.nipplejs) {
      console.warn('[MobileControls] nipplejs not available');
      return;
    }

    var zone = document.getElementById('joystick-zone');
    if (!zone) {
      console.warn('[MobileControls] joystick-zone not found');
      return;
    }

    var activeKeys = {};
    var joystick = nipplejs.create({
      zone: zone,
      mode: 'dynamic',
      position: { left: '20%', bottom: '30%' },
      color: 'rgba(255, 255, 255, 0.35)',
      size: 120,
      fadeTime: 150
    });

    var keyMap = {
      up: { key: 'w', code: 'KeyW', keyCode: 87 },
      down: { key: 's', code: 'KeyS', keyCode: 83 },
      left: { key: 'a', code: 'KeyA', keyCode: 65 },
      right: { key: 'd', code: 'KeyD', keyCode: 68 }
    };

    // For racing, also use WASD (most Unity racing games respond to WASD)
    if (gameType === 'racing') {
      keyMap = {
        up: { key: 'w', code: 'KeyW', keyCode: 87 },
        down: { key: 's', code: 'KeyS', keyCode: 83 },
        left: { key: 'a', code: 'KeyA', keyCode: 65 },
        right: { key: 'd', code: 'KeyD', keyCode: 68 }
      };
    }

    joystick.on('move', function (evt, data) {
      if (!data.direction) return;

      var newKeys = {};
      if (data.direction.y === 'up') newKeys.up = true;
      if (data.direction.y === 'down') newKeys.down = true;
      if (data.direction.x === 'left') newKeys.left = true;
      if (data.direction.x === 'right') newKeys.right = true;

      // Release keys that are no longer active
      Object.keys(activeKeys).forEach(function (dir) {
        if (!newKeys[dir] && activeKeys[dir]) {
          simulateKey(keyMap[dir].key, 'keyup', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = false;
        }
      });

      // Press new keys
      Object.keys(newKeys).forEach(function (dir) {
        if (!activeKeys[dir]) {
          simulateKey(keyMap[dir].key, 'keydown', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = true;
        }
      });
    });

    joystick.on('end', function () {
      Object.keys(activeKeys).forEach(function (dir) {
        if (activeKeys[dir]) {
          simulateKey(keyMap[dir].key, 'keyup', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = false;
        }
      });
    });

    console.log('[MobileControls] Joystick ready');
  }

  // ═══════════════════════════════════════════════
  // ACTION BUTTONS (Fire, Jump, etc.)
  // ═══════════════════════════════════════════════
  function setupActionButtons() {
    // Use touchstart/touchend for immediate response
    document.addEventListener('touchstart', handleBtnTouch, { passive: false });
    document.addEventListener('touchend', handleBtnRelease, { passive: false });
    document.addEventListener('touchcancel', handleBtnRelease, { passive: false });

    function handleBtnTouch(e) {
      var btn = e.target.closest('.action-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');

      if (btn.dataset.key !== undefined && btn.dataset.key !== '') {
        simulateKey(
          btn.dataset.key,
          'keydown',
          btn.dataset.code || '',
          parseInt(btn.dataset.keycode) || 0
        );
      }

      if (btn.dataset.mouse === 'left') {
        simulateMouse('mousedown', 0);
      } else if (btn.dataset.mouse === 'right') {
        simulateMouse('mousedown', 2);
      }
    }

    function handleBtnRelease(e) {
      // Release ALL pressed buttons (handles multi-touch edge cases)
      var pressedBtns = document.querySelectorAll('.action-btn.pressed');
      pressedBtns.forEach(function(btn) {
        btn.classList.remove('pressed');

        if (btn.dataset.key !== undefined && btn.dataset.key !== '') {
          simulateKey(
            btn.dataset.key,
            'keyup',
            btn.dataset.code || '',
            parseInt(btn.dataset.keycode) || 0
          );
        }

        if (btn.dataset.mouse === 'left') {
          simulateMouse('mouseup', 0);
        } else if (btn.dataset.mouse === 'right') {
          simulateMouse('mouseup', 2);
        }
      });
    }

    console.log('[MobileControls] Action buttons ready');
  }

  // ═══════════════════════════════════════════════
  // LOOK / AIM ZONE (Mouse simulation for FPS)
  // ═══════════════════════════════════════════════
  function setupLookZone() {
    if (gameType !== 'fps') return;

    var lookZone = document.getElementById('look-zone');
    if (!lookZone) return;

    var lastTouch = null;
    var sensitivity = 2.0;

    lookZone.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var touch = e.changedTouches[0];
      lastTouch = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    lookZone.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!lastTouch) return;

      var touch = e.changedTouches[0];
      var dx = (touch.clientX - lastTouch.x) * sensitivity;
      var dy = (touch.clientY - lastTouch.y) * sensitivity;

      var canvas = document.getElementById('unity-canvas');
      if (canvas) {
        var rect = canvas.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;

        canvas.dispatchEvent(new MouseEvent('mousemove', {
          clientX: centerX + dx,
          clientY: centerY + dy,
          movementX: dx,
          movementY: dy,
          bubbles: true,
          cancelable: true
        }));
      }

      lastTouch = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    lookZone.addEventListener('touchend', function (e) {
      e.preventDefault();
      lastTouch = null;
    }, { passive: false });

    console.log('[MobileControls] Look zone ready');
  }

  // ═══════════════════════════════════════════════
  // KEYBOARD INPUT HELPER (for Unity text fields)
  // ═══════════════════════════════════════════════
  function setupKeyboardHelper() {
    var toggleBtn = document.getElementById('kb-toggle');
    var input = document.getElementById('mobile-keyboard-input');
    if (!toggleBtn || !input) return;

    var isVisible = false;

    toggleBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isVisible = !isVisible;
      input.style.display = isVisible ? 'block' : 'none';
      if (isVisible) {
        setTimeout(function() { input.focus(); }, 100);
      } else {
        input.blur();
      }
    }, { passive: false });

    // Forward each character typed to Unity canvas
    input.addEventListener('input', function (e) {
      var val = input.value;
      if (val.length > 0) {
        var lastChar = val.charAt(val.length - 1);
        var canvas = document.getElementById('unity-canvas');

        // keydown
        simulateKey(lastChar, 'keydown', 'Key' + lastChar.toUpperCase(), lastChar.charCodeAt(0));
        // keypress (some Unity input systems need this)
        if (canvas) {
          canvas.dispatchEvent(new KeyboardEvent('keypress', {
            key: lastChar,
            charCode: lastChar.charCodeAt(0),
            keyCode: lastChar.charCodeAt(0),
            which: lastChar.charCodeAt(0),
            bubbles: true,
            cancelable: true
          }));
        }
        // keyup
        simulateKey(lastChar, 'keyup', 'Key' + lastChar.toUpperCase(), lastChar.charCodeAt(0));
      }
    });

    // Handle Enter key to submit
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        simulateKey('Enter', 'keydown', 'Enter', 13);
        simulateKey('Enter', 'keyup', 'Enter', 13);
        input.value = '';
        input.style.display = 'none';
        input.blur();
        isVisible = false;
      }
    });

    console.log('[MobileControls] Keyboard helper ready');
  }

  // ═══════════════════════════════════════════════
  // UTILITY: Simulate keyboard events on canvas
  // ═══════════════════════════════════════════════
  function simulateKey(key, type, code, keyCode) {
    var canvas = document.getElementById('unity-canvas');
    
    var eventInit = {
      key: key,
      code: code || ('Key' + key.toUpperCase()),
      keyCode: keyCode || key.charCodeAt(0),
      which: keyCode || key.charCodeAt(0),
      bubbles: true,
      cancelable: true
    };

    var evt = new KeyboardEvent(type, eventInit);

    // Dispatch on canvas (primary target for Unity)
    if (canvas) {
      canvas.dispatchEvent(evt);
    }
    // Also dispatch on document & window (some Unity builds listen here)
    document.dispatchEvent(new KeyboardEvent(type, eventInit));
    window.dispatchEvent(new KeyboardEvent(type, eventInit));
  }

  // ═══════════════════════════════════════════════
  // UTILITY: Simulate mouse events on canvas
  // ═══════════════════════════════════════════════
  function simulateMouse(type, button) {
    var canvas = document.getElementById('unity-canvas');
    if (!canvas) return;

    var rect = canvas.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    var evt = new MouseEvent(type, {
      button: button,
      buttons: button === 0 ? 1 : 2,
      clientX: centerX,
      clientY: centerY,
      bubbles: true,
      cancelable: true
    });

    canvas.dispatchEvent(evt);

    if (type === 'mouseup' && button === 0) {
      canvas.dispatchEvent(new MouseEvent('click', {
        button: 0,
        clientX: centerX,
        clientY: centerY,
        bubbles: true,
        cancelable: true
      }));
    }
  }

})();
