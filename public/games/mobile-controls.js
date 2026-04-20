/**
 * ═══════════════════════════════════════════════════════
 * MOBILE CONTROLS — Premium Edition v2
 * Virtual joystick (FIXED position), action buttons,
 * keyboard helper, look-aim zone, fullscreen, and
 * orientation lock for Unity WebGL games on mobile.
 *
 * KEY CHANGES:
 * - Joystick is FIXED in bottom-left (not dynamic)
 * - Controls auto-activate in landscape
 * - Fire ONLY triggers on fire button press
 * - Throttled mouse move events (60fps max)
 * - Sensitivity saved to localStorage
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

  // ─── Detect mobile via userAgent + touch support ───
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
    console.log('[MobileControls] Initializing v2...');
    setViewportMeta();
    injectHTML();
    setupFullscreenButton();
    setupOrientationHandler();
    loadNippleJS(function () {
      console.log('[MobileControls] nipplejs loaded, setting up joystick');
      setupJoystick();
    });
    setupActionButtons();
    setupKeyboardHelper();
    setupLookZone();
    preventDefaultGestures();
    if (gameType === 'fps') {
      blockCanvasDirectTouch();
    }
    console.log('[MobileControls] Init complete');
  }

  // ═══════════════════════════════════════════════
  // SET VIEWPORT META FOR MOBILE
  // ═══════════════════════════════════════════════
  function setViewportMeta() {
    var existing = document.querySelector('meta[name="viewport"]');
    if (existing) existing.remove();

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = [
      'width=device-width',
      'height=device-height',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'minimum-scale=1.0',
      'user-scalable=no',
      'shrink-to-fit=yes',
      'viewport-fit=cover'
    ].join(', ');
    document.head.appendChild(meta);

    document.body.style.overscrollBehavior = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';

    console.log('[MobileControls] Viewport meta set');
  }

  // ═══════════════════════════════════════════════
  // PREVENT DEFAULT GESTURES
  // ═══════════════════════════════════════════════
  function preventDefaultGestures() {
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gestureend', function(e) { e.preventDefault(); }, { passive: false });

    var lastTap = 0;
    document.addEventListener('touchend', function(e) {
      var now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      lastTap = now;
    }, { passive: false });

    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    }, { passive: false });

    console.log('[MobileControls] Default gestures prevented');
  }

  // ═══════════════════════════════════════════════
  // ORIENTATION HANDLER — Auto-activate in landscape
  // ═══════════════════════════════════════════════
  function setupOrientationHandler() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(function(err) {
        console.log('[MobileControls] Could not lock orientation:', err.message);
      });
    }

    function onOrientationChange() {
      var isLandscape = window.innerWidth > window.innerHeight;
      console.log('[MobileControls] Orientation:', isLandscape ? 'landscape' : 'portrait');

      if (isLandscape) {
        // AUTO-ACTIVATE controls in landscape
        document.body.classList.add('controls-active');
        var toggleBtn = document.getElementById('controls-toggle');
        if (toggleBtn) toggleBtn.classList.add('active');

        setTimeout(function() {
          window.scrollTo(0, 0);
          window.dispatchEvent(new Event('resize'));
        }, 100);
      } else {
        // Deactivate in portrait
        document.body.classList.remove('controls-active');
        var toggleBtn2 = document.getElementById('controls-toggle');
        if (toggleBtn2) toggleBtn2.classList.remove('active');
      }
    }

    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', function() {
      clearTimeout(window._mobileResizeTimer);
      window._mobileResizeTimer = setTimeout(function() {
        window.scrollTo(0, 0);
        onOrientationChange();
      }, 150);
    });

    // Initial check
    onOrientationChange();
    console.log('[MobileControls] Orientation handler ready (auto-activate)');
  }

  // ═══════════════════════════════════════════════
  // INJECT HTML ELEMENTS
  // ═══════════════════════════════════════════════
  function injectHTML() {
    // ── Rotate overlay ──
    var rotateOverlay = document.createElement('div');
    rotateOverlay.id = 'mobile-rotate-overlay';
    rotateOverlay.innerHTML = [
      '<svg class="rotate-icon" viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="2.5">',
      '  <rect x="25" y="10" width="50" height="80" rx="10" />',
      '  <circle cx="50" cy="78" r="3.5" fill="white"/>',
      '  <rect x="35" y="18" width="30" height="46" rx="2" fill="rgba(255,255,255,0.08)" stroke="none"/>',
      '  <path d="M75 50 Q95 50 95 35" stroke-width="2.5" stroke-linecap="round" fill="none"/>',
      '  <path d="M91 28 L95 35 L88 36" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      '</svg>',
      '<h2>Rotate Your Device</h2>',
      '<p>For the best gaming experience, please rotate your phone to landscape mode.</p>'
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
      var touchIndicator = document.createElement('div');
      touchIndicator.className = 'look-touch-indicator';
      touchIndicator.id = 'look-touch-indicator';
      lookZone.appendChild(touchIndicator);
      controlsLayer.appendChild(lookZone);
    }

    // Primary action buttons
    var actionBtns = document.createElement('div');
    actionBtns.id = 'action-buttons';

    if (gameType === 'fps') {
      actionBtns.innerHTML = [
        '<button class="action-btn btn-primary-action" data-key=" " data-code="Space" data-keycode="32">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/></svg>',
        '  <span class="btn-label">JUMP</span>',
        '</button>',
        '<button class="action-btn btn-fire" data-mouse="left">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/></svg>',
        '  <span class="btn-label">FIRE</span>',
        '</button>',
        '<button class="action-btn btn-aim" data-mouse="right">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
        '  <span class="btn-label">AIM</span>',
        '</button>'
      ].join('\n');
    } else {
      // Racing controls
      actionBtns.innerHTML = [
        '<button class="action-btn btn-primary-action" data-key="w" data-code="KeyW" data-keycode="87">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 22 2 22"/></svg>',
        '  <span class="btn-label">GAS</span>',
        '</button>',
        '<button class="action-btn btn-brake" data-key="s" data-code="KeyS" data-keycode="83">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
        '  <span class="btn-label">BRAKE</span>',
        '</button>',
        '<button class="action-btn btn-boost" data-key=" " data-code="Space" data-keycode="32">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        '  <span class="btn-label">BOOST</span>',
        '</button>'
      ].join('\n');
    }
    controlsLayer.appendChild(actionBtns);

    // Secondary buttons (FPS only)
    if (gameType === 'fps') {
      var secBtns = document.createElement('div');
      secBtns.id = 'action-buttons-secondary';
      secBtns.innerHTML = [
        '<button class="action-btn" data-key="r" data-code="KeyR" data-keycode="82">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
        '</button>',
        '<button class="action-btn" data-key="e" data-code="KeyE" data-keycode="69">',
        '  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        '</button>'
      ].join('\n');
      controlsLayer.appendChild(secBtns);
    }

    document.body.appendChild(controlsLayer);

    // ── Keyboard input helper ──
    var kbHelper = document.createElement('div');
    kbHelper.id = 'mobile-keyboard-helper';
    kbHelper.innerHTML = [
      '<button class="kb-toggle-btn" id="kb-toggle">',
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <rect x="2" y="4" width="20" height="16" rx="2"/>',
      '    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/>',
      '  </svg>',
      '  Chat',
      '</button>'
    ].join('\n');
    document.body.appendChild(kbHelper);

    var kbInput = document.createElement('input');
    kbInput.id = 'mobile-keyboard-input';
    kbInput.type = 'text';
    kbInput.placeholder = 'Type here, press Enter...';
    kbInput.autocomplete = 'off';
    kbInput.autocapitalize = 'off';
    kbInput.spellcheck = false;
    document.body.appendChild(kbInput);

    // ── Fullscreen button ──
    var fsBtn = document.createElement('button');
    fsBtn.id = 'mobile-fullscreen-btn';
    fsBtn.innerHTML = [
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
      '  <polyline points="15 3 21 3 21 9"/>',
      '  <polyline points="9 21 3 21 3 15"/>',
      '  <line x1="21" y1="3" x2="14" y2="10"/>',
      '  <line x1="3" y1="21" x2="10" y2="14"/>',
      '</svg>',
      '<span>Fullscreen</span>'
    ].join('\n');
    document.body.appendChild(fsBtn);

    // ── Performance notice ──
    var perfNotice = document.createElement('div');
    perfNotice.id = 'mobile-perf-notice';
    perfNotice.textContent = 'WebGL Mobile — Performance may vary';
    document.body.appendChild(perfNotice);

    // ── Controls toggle button ──
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'controls-toggle';
    toggleBtn.innerHTML = '<span class="toggle-icon"></span> Controls';
    toggleBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isActive = document.body.classList.toggle('controls-active');
      toggleBtn.classList.toggle('active', isActive);
      console.log('[MobileControls] Controls', isActive ? 'ON' : 'OFF');
    }, { passive: false });
    toggleBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
    document.body.appendChild(toggleBtn);

    console.log('[MobileControls] HTML injected');
  }

  // ═══════════════════════════════════════════════
  // FULLSCREEN BUTTON
  // ═══════════════════════════════════════════════
  function setupFullscreenButton() {
    var fsBtn = document.getElementById('mobile-fullscreen-btn');
    if (!fsBtn) return;

    fsBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var elem = document.documentElement;
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      }
    }, { passive: false });

    console.log('[MobileControls] Fullscreen button ready');
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
      var alt = document.createElement('script');
      alt.src = 'https://unpkg.com/nipplejs@0.10.2/dist/nipplejs.min.js';
      alt.onload = function() {
        console.log('[MobileControls] nipplejs loaded from alternate CDN');
        callback();
      };
      alt.onerror = function() {
        console.error('[MobileControls] Failed to load nipplejs from all CDNs');
        createFallbackDpad();
      };
      document.head.appendChild(alt);
    };
    document.head.appendChild(script);
  }

  // ═══════════════════════════════════════════════
  // FALLBACK D-PAD
  // ═══════════════════════════════════════════════
  function createFallbackDpad() {
    var zone = document.getElementById('joystick-zone');
    if (!zone) return;

    zone.innerHTML = [
      '<div style="position:absolute;left:10%;bottom:15%;display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px);gap:4px;">',
      '  <div></div>',
      '  <button class="action-btn" data-key="w" data-code="KeyW" data-keycode="87" style="width:48px;height:48px;font-size:16px;">↑</button>',
      '  <div></div>',
      '  <button class="action-btn" data-key="a" data-code="KeyA" data-keycode="65" style="width:48px;height:48px;font-size:16px;">←</button>',
      '  <div></div>',
      '  <button class="action-btn" data-key="d" data-code="KeyD" data-keycode="68" style="width:48px;height:48px;font-size:16px;">→</button>',
      '  <div></div>',
      '  <button class="action-btn" data-key="s" data-code="KeyS" data-keycode="83" style="width:48px;height:48px;font-size:16px;">↓</button>',
      '  <div></div>',
      '</div>'
    ].join('\n');
    zone.style.pointerEvents = 'auto';

    console.log('[MobileControls] Fallback D-pad created');
  }

  // ═══════════════════════════════════════════════
  // VIRTUAL JOYSTICK — FIXED POSITION (bottom-left)
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

    // Fixed joystick size
    var joystickSize = 120;

    var joystick = nipplejs.create({
      zone: zone,
      mode: 'static',                    // ← FIXED, not dynamic
      position: { left: '80px', bottom: '80px' },  // ← Fixed bottom-left
      color: 'rgba(255, 255, 255, 0.2)',
      size: joystickSize,
      fadeTime: 0,                        // No fade — always visible
      restOpacity: 0.65,
      threshold: 0.12,
      multitouch: true
    });

    // For racing: joystick only does left/right/backward. Forward = GAS button only.
    var keyMap;
    if (gameType === 'racing') {
      keyMap = {
        down:  { key: 's', code: 'KeyS', keyCode: 83 },
        left:  { key: 'a', code: 'KeyA', keyCode: 65 },
        right: { key: 'd', code: 'KeyD', keyCode: 68 }
      };
    } else {
      keyMap = {
        up:    { key: 'w', code: 'KeyW', keyCode: 87 },
        down:  { key: 's', code: 'KeyS', keyCode: 83 },
        left:  { key: 'a', code: 'KeyA', keyCode: 65 },
        right: { key: 'd', code: 'KeyD', keyCode: 68 }
      };
    }

    joystick.on('move', function (evt, data) {
      if (!data.direction) return;

      var newKeys = {};
      // For racing, skip 'up' — GAS button handles forward
      if (data.direction.y === 'up' && gameType !== 'racing') newKeys.up = true;
      if (data.direction.y === 'down')  newKeys.down = true;
      if (data.direction.x === 'left')  newKeys.left = true;
      if (data.direction.x === 'right') newKeys.right = true;

      // Release keys that are no longer active
      Object.keys(activeKeys).forEach(function (dir) {
        if (!newKeys[dir] && activeKeys[dir] && keyMap[dir]) {
          simulateKey(keyMap[dir].key, 'keyup', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = false;
        }
      });

      // Press new keys
      Object.keys(newKeys).forEach(function (dir) {
        if (!activeKeys[dir] && keyMap[dir]) {
          simulateKey(keyMap[dir].key, 'keydown', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = true;
        }
      });
    });

    joystick.on('end', function () {
      Object.keys(activeKeys).forEach(function (dir) {
        if (activeKeys[dir] && keyMap[dir]) {
          simulateKey(keyMap[dir].key, 'keyup', keyMap[dir].code, keyMap[dir].keyCode);
          activeKeys[dir] = false;
        }
      });
    });

    console.log('[MobileControls] Joystick ready — FIXED position, size:', joystickSize + 'px, gameType:', gameType);
  }

  // ═══════════════════════════════════════════════
  // ACTION BUTTONS — Fire ONLY on fire button press
  // ═══════════════════════════════════════════════
  function setupActionButtons() {
    var activeTouches = new Map();

    document.addEventListener('touchstart', handleBtnTouch, { passive: false });
    document.addEventListener('touchend', handleBtnRelease, { passive: false });
    document.addEventListener('touchcancel', handleBtnRelease, { passive: false });

    function handleBtnTouch(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        var btn = document.elementFromPoint(touch.clientX, touch.clientY);
        if (btn) btn = btn.closest('.action-btn');
        if (!btn) continue;

        e.preventDefault();
        activeTouches.set(touch.identifier, btn);
        btn.classList.add('pressed');

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(12);
        }

        // Keyboard key simulation
        if (btn.dataset.key !== undefined && btn.dataset.key !== '') {
          simulateKey(
            btn.dataset.key,
            'keydown',
            btn.dataset.code || '',
            parseInt(btn.dataset.keycode) || 0
          );
        }

        // Mouse button simulation — ONLY from explicit button press
        if (btn.dataset.mouse === 'left') {
          simulateMouse('mousedown', 0);
        } else if (btn.dataset.mouse === 'right') {
          simulateMouse('mousedown', 2);
        }
      }
    }

    function handleBtnRelease(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i];
        var btn = activeTouches.get(touch.identifier);
        if (!btn) continue;

        activeTouches.delete(touch.identifier);

        // Only un-press if no other touch is on this button
        var stillPressed = false;
        activeTouches.forEach(function(b) {
          if (b === btn) stillPressed = true;
        });

        if (!stillPressed) {
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
        }
      }
    }

    console.log('[MobileControls] Action buttons ready — fire only on explicit press');
  }

  // ═══════════════════════════════════════════════
  // CANVAS TOUCH INTERCEPTOR — Prevent bare canvas
  // touches from triggering fire/click in Unity.
  // Only the fire button should trigger mousedown.
  // ═══════════════════════════════════════════════
  function blockCanvasDirectTouch() {
    // Wait for canvas to exist
    function attach() {
      var canvas = document.getElementById('unity-canvas');
      if (!canvas) {
        setTimeout(attach, 500);
        return;
      }

      // Intercept touchstart on canvas and prevent it from becoming
      // a mouse click — unless the touch originated from a control element
      canvas.addEventListener('touchstart', function(e) {
        var target = e.target;
        // If the touch is directly on the canvas (not on a control overlay),
        // prevent the default which would synthesize a mouse click
        if (target === canvas) {
          e.preventDefault();
        }
      }, { passive: false });

      canvas.addEventListener('touchend', function(e) {
        if (e.target === canvas) {
          e.preventDefault();
        }
      }, { passive: false });

      console.log('[MobileControls] Canvas touch interceptor active — fire button only');
    }
    attach();
  }

  // ═══════════════════════════════════════════════
  // LOOK / AIM ZONE — Mouse move ONLY (no click/fire)
  // Throttled to 60fps for performance
  // ═══════════════════════════════════════════════
  function setupLookZone() {
    if (gameType !== 'fps') return;

    var lookZone = document.getElementById('look-zone');
    if (!lookZone) return;

    var touchIndicator = document.getElementById('look-touch-indicator');
    var lastTouch = null;
    var activeTouchId = null;

    // Load sensitivity from localStorage or use default
    var sensitivity = parseFloat(localStorage.getItem('mc_sensitivity')) || 2.5;

    // Throttle: max 60fps for mouse move events
    var lastMoveTime = 0;
    var THROTTLE_MS = 16; // ~60fps

    lookZone.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
      lastTouch = { x: touch.clientX, y: touch.clientY };

      // Show touch indicator
      if (touchIndicator) {
        touchIndicator.style.left = touch.clientX + 'px';
        touchIndicator.style.top = touch.clientY + 'px';
        touchIndicator.classList.add('visible');
      }

      // NO mouse click here — fire ONLY from fire button
    }, { passive: false });

    lookZone.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (activeTouchId === null || !lastTouch) return;

      // Throttle to 60fps
      var now = performance.now();
      if (now - lastMoveTime < THROTTLE_MS) return;
      lastMoveTime = now;

      var touch = null;
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          touch = e.changedTouches[i];
          break;
        }
      }
      if (!touch) return;

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

      if (touchIndicator) {
        touchIndicator.style.left = touch.clientX + 'px';
        touchIndicator.style.top = touch.clientY + 'px';
      }

      lastTouch = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    lookZone.addEventListener('touchend', function (e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          lastTouch = null;
          if (touchIndicator) {
            touchIndicator.classList.remove('visible');
          }
          // NO mouse up/click here — look zone is LOOK ONLY
          break;
        }
      }
    }, { passive: false });

    lookZone.addEventListener('touchcancel', function () {
      activeTouchId = null;
      lastTouch = null;
      if (touchIndicator) {
        touchIndicator.classList.remove('visible');
      }
    }, { passive: false });

    console.log('[MobileControls] Look zone ready — LOOK ONLY, no fire (sensitivity:', sensitivity + ')');
  }

  // ═══════════════════════════════════════════════
  // KEYBOARD INPUT HELPER
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

    input.addEventListener('input', function (e) {
      var val = input.value;
      if (val.length > 0) {
        var lastChar = val.charAt(val.length - 1);
        var canvas = document.getElementById('unity-canvas');

        simulateKey(lastChar, 'keydown', 'Key' + lastChar.toUpperCase(), lastChar.charCodeAt(0));
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
        simulateKey(lastChar, 'keyup', 'Key' + lastChar.toUpperCase(), lastChar.charCodeAt(0));
      }
    });

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

    if (canvas) {
      canvas.dispatchEvent(evt);
    }
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
