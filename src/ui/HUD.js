import { CONCEPTION_STAGES, CONCEPTION_SIMULATION_PARAMETERS } from '../data/conceptionStages.js';
import { PHOTOSYNTHESIS_STAGES, SIMULATION_PARAMETERS } from '../data/photosynthesisStages.js';
import { SOLAR_STAGES, SOLAR_SIMULATION_PARAMETERS } from '../data/solarSystemStages.js';
import { HEART_STAGES, HEART_SIMULATION_PARAMETERS } from '../data/heartStages.js';
import { MODULE_REGISTRY, MODULE_ORDER } from '../data/moduleRegistry.js';

/**
 * 2D Glassmorphic Heads-Up Display (HUD) with:
 * 1. Multi-Module Selector (Solar System / Photosynthesis / Reproduction / Human Heart)
 * 2. Live Simulation Controls (Play/Pause, 0.5x, 1x, 2x, 5x speed)
 * 3. 3D Floating Labels Toggle (N)
 * 4. Keyboard Shortcuts & Remote Controls Help Guide Modal (H)
 * 5. Dynamic Stage Tabs with live target tracking
 * 6. 360° Object Rotation & 7 Camera Side Angle Quick-Buttons
 * 7. Cutaway Cross-Section & Auto Turntable Spin Toggles
 * 8. Module-Specific Real-time Telemetry Ticker
 */

const MODULE_STAGES = {
  solar: SOLAR_STAGES,
  photosynthesis: PHOTOSYNTHESIS_STAGES,
  reproduction: CONCEPTION_STAGES,
  heart: HEART_STAGES
};

const MODULE_PARAMS = {
  solar: SOLAR_SIMULATION_PARAMETERS,
  photosynthesis: SIMULATION_PARAMETERS,
  reproduction: CONCEPTION_SIMULATION_PARAMETERS,
  heart: HEART_SIMULATION_PARAMETERS
};

export class HUD {
  constructor(options = {}) {
    this.onStageSelect = options.onStageSelect || null;
    this.onEnterVR = options.onEnterVR || null;
    this.onToggleDualVR = options.onToggleDualVR || null;
    this.onToggleTour = options.onToggleTour || null;
    this.onResetCamera = options.onResetCamera || null;
    this.onToggleScience = options.onToggleScience || null;
    this.onToggleAudio = options.onToggleAudio || null;
    this.onToggleLabels = options.onToggleLabels || null;
    this.onCameraSide = options.onCameraSide || null;
    this.onParamChange = options.onParamChange || null;
    this.onModuleSwitch = options.onModuleSwitch || null;
    this.onToggleMouse = options.onToggleMouse || null;
    this.onDetachGizmo = options.onDetachGizmo || null;

    this.isGizmoActive = false;
    this.isMouseEnabled = true;
    this.activeModule = 'solar';
    this.currentStageIndex = 0;
    this.isTourPlaying = false;
    this.isPaused = false;
    this.currentSpeed = 1.0;
    this.showLabels = true;
    this.showHelpModal = false;
    this.showRemoteModal = false;
    this.autoRotate360 = false;
    this.crossSectionView = false;

    this.container = document.createElement('div');
    this.container.className = 'hud-root';
    document.body.appendChild(this.container);

    this.render();
    this.bindEvents();
  }

  getActiveStages() {
    return MODULE_STAGES[this.activeModule] || SOLAR_STAGES;
  }

  getActiveParams() {
    return MODULE_PARAMS[this.activeModule] || SOLAR_SIMULATION_PARAMETERS;
  }

  getModuleConfig() {
    return MODULE_REGISTRY[this.activeModule];
  }

  render() {
    const mod = this.getModuleConfig();
    const stages = this.getActiveStages();

    this.container.innerHTML = `
      <!-- Module Selector Tabs -->
      <div class="hud-module-selector">
        ${MODULE_ORDER.map(id => {
          const m = MODULE_REGISTRY[id];
          return `
            <button class="module-tab ${id === this.activeModule ? 'active' : ''}" data-module="${id}" style="--mod-color: ${m.colorTheme}">
              <span class="module-tab-icon">${m.icon}</span>
              <span class="module-tab-name">${m.name}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Top Header & Status Bar -->
      <div class="hud-top-bar">
        <div class="hud-brand">
          <div class="brand-logo">${mod.icon}🔬</div>
          <div class="brand-text">
            <h1 class="brand-title" style="background: linear-gradient(135deg, ${mod.gradientStart}, ${mod.gradientEnd}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${mod.brandTitle}</h1>
            <div class="brand-tagline">${mod.brandTagline}</div>
          </div>
        </div>

        <!-- Live Simulation Speed & Controls -->
        <div class="hud-sim-speed-bar">
          <button class="btn-sim-control ${this.isPaused ? 'active' : ''}" id="btnSimPause" title="Pause / Resume Live Simulation (P or Click)">
            <span id="txtSimPause">${this.isPaused ? '▶' : '⏸'}</span>
          </button>
          <button class="btn-speed ${this.currentSpeed === 0.5 ? 'active' : ''}" data-speed="0.5">0.5x</button>
          <button class="btn-speed ${this.currentSpeed === 1.0 ? 'active' : ''}" data-speed="1.0">1x</button>
          <button class="btn-speed ${this.currentSpeed === 2.0 ? 'active' : ''}" data-speed="2.0">2x</button>
          <button class="btn-speed ${this.currentSpeed === 5.0 ? 'active' : ''}" data-speed="5.0">5x</button>
        </div>

        <div class="hud-top-actions">
          <button class="btn-secondary btn-detach-gizmo" id="btnDetachGizmo" style="display: ${this.isGizmoActive ? 'inline-flex' : 'none'}; background: rgba(239, 68, 68, 0.25); border-color: #ef4444; color: #fca5a5;" title="Turn OFF 3D XYZ Rotation Axes (X)">
            <span class="btn-icon">🛑</span>
            <span class="btn-label">OFF XYZ (X)</span>
          </button>
          <button class="btn-secondary ${this.isMouseEnabled ? 'mouse-active' : 'mouse-inactive'}" id="btnToggleMouse" title="Toggle Mouse Pointer ${this.isMouseEnabled ? 'OFF' : 'ON'} (Space)">
            <span class="btn-icon" id="mouseIcon">${this.isMouseEnabled ? '🖱️' : '🚫'}</span>
            <span class="btn-label" id="mouseBtnText">MOUSE: ${this.isMouseEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <button class="btn-primary btn-vr" id="btnEnterVR" title="Enter WebXR Immersive VR (Meta Quest / Mobile)">
            <span class="btn-icon">🥽</span>
            <span class="btn-label">ENTER VR</span>
          </button>
          <button class="btn-secondary" id="btnDualVR" title="Cardboard / VR Box Dual Screen SBS VR with Gyro">
            <span class="btn-icon">👓</span>
            <span class="btn-label" id="dualVRText">DUAL SCREEN VR</span>
          </button>
          <button class="btn-secondary" id="btnShowRemoteModal" title="Open Mobile VR Remote Controller Link & QR Code" style="border-color: #38bdf8; color: #38bdf8;">
            <span class="btn-icon">📱</span>
            <span class="btn-label">REMOTE</span>
          </button>
          <button class="btn-secondary" id="btnToggleTour" title="Start Guided Tour (A)">
            <span class="btn-icon">🎬</span>
            <span class="btn-label" id="tourBtnText">TOUR (A)</span>
          </button>
          <button class="btn-secondary btn-drawer-toggle" id="btnTopAngleToggle" title="Toggle 360° Camera Angles">
            <span>🎥 360°</span>
          </button>
          <button class="btn-secondary btn-drawer-toggle" id="btnTopControlsToggle" title="Toggle Live Simulation Sliders">
            <span>⚙️ SLIDERS</span>
          </button>
          <button class="btn-icon-only ${this.showLabels ? 'active' : ''}" id="btnToggleLabels" title="Toggle 3D Names & Labels (N)">
            <span>🏷️</span>
          </button>
          <button class="btn-icon-only" id="btnToggleHelp" title="Keyboard Shortcuts & Remote Guide (H)">
            <span>⌨️</span>
          </button>
          <button class="btn-icon-only" id="btnToggleAudio" title="Toggle Audio & Narration (M)">
            <span id="audioIcon">🔊</span>
          </button>
          <button class="btn-icon-only" id="btnToggleScience" title="Toggle Scientific Guide">
            <span>📖</span>
          </button>
          <button class="btn-icon-only" id="btnResetCam" title="Reset View to Overview (R)">
            <span>🔄</span>
          </button>
        </div>
      </div>

      <!-- 360° Object Rotation & Camera Angles Toolbar (Top Left) -->
      <div class="hud-camera-angles-bar" id="hudCameraAnglesBar">
        <div class="angle-bar-title" id="btnCollapseAngles" title="Tap to expand / collapse">
          <span>🔄 360° VIEW & SIDES</span>
          <span class="collapse-icon">▲</span>
        </div>
        <div class="angle-bar-content" id="angleBarContent">
          <div class="angle-btns-grid">
            <button class="btn-angle" data-side="front" title="Front View (F)">Front</button>
            <button class="btn-angle" data-side="back" title="Back View (B)">Back</button>
            <button class="btn-angle" data-side="left" title="Left View (L)">Left</button>
            <button class="btn-angle" data-side="right" title="Right View">Right</button>
            <button class="btn-angle" data-side="top" title="Top-Down View (T)">Top</button>
            <button class="btn-angle" data-side="bottom" title="Bottom View">Bottom</button>
            <button class="btn-angle" data-side="iso" title="Isometric Angle">3D Iso</button>
          </div>
          <div class="angle-toggles">
            <button class="btn-toggle-util" id="btnAutoSpin">
              <span>💫 Auto Spin</span>
            </button>
            <button class="btn-toggle-util" id="btnCutaway">
              <span>🔪 Cross-Section</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Live Telemetry Ticker -->
      <div class="hud-telemetry-ticker" id="telemetryTicker">
        ${this.renderTelemetryTicker()}
      </div>

      <!-- Stage Switcher Navigation Strip -->
      <div class="hud-stage-strip">
        ${stages.map((s, idx) => `
          <button class="stage-tab-btn ${idx === this.currentStageIndex ? 'active' : ''}" data-stage="${idx}" title="${s.name}">
            <span class="stage-btn-num">${idx + 1}</span>
            <span class="stage-btn-icon">${s.icon}</span>
            <span class="stage-btn-name">${s.shortName}</span>
          </button>
        `).join('')}
      </div>

      <!-- Simulation Parameters Drawer -->
      <div class="hud-controls-panel" id="hudControlsPanel">
        <div class="controls-title" id="btnCollapseControls" title="Tap to expand / collapse">
          <span>⚙️ SIMULATION CONTROLS</span>
          <span class="collapse-icon">▲</span>
        </div>
        <div class="controls-content" id="controlsContent">
          ${this.renderParamSliders()}
        </div>
      </div>

      <!-- Keyboard Shortcuts & Remote Guide Modal -->
      <div class="hud-help-modal ${this.showHelpModal ? 'open' : ''}" id="helpModal">
        <div class="help-card">
          <div class="help-header">
            <div class="help-title">⌨️ Keyboard Shortcuts & Remote Controls Guide</div>
            <button class="help-close-btn" id="btnCloseHelp">✕</button>
          </div>
          <div class="help-body">
            <table class="shortcuts-table">
              <thead>
                <tr>
                  <th>Input Action</th>
                  <th>Function & Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="kbd-chip">Left-Click Drag</span></td>
                  <td><strong>360° Omnidirectional Orbit</strong> around target / environment</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Right / Mid Drag</span></td>
                  <td><strong>Pan Screen & Camera</strong> in any 3D direction</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Scroll Wheel</span></td>
                  <td><strong>Smooth Dolly Zoom</strong> in / out</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Arrow Keys</span></td>
                  <td><strong>Move Screen / Camera</strong> in arrow direction</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Z / X</span></td>
                  <td><strong>Zoom In (Z) / Zoom Out (X)</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">1 – 9 / 0</span></td>
                  <td><strong>Jump & Track</strong> any model / stage / planet</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">R</span></td>
                  <td><strong>Rotate 3D Model</strong> on its own axis</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">C</span></td>
                  <td><strong>Turn OFF / Stop</strong> 3D model rotation</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">A</span></td>
                  <td><strong>Toggle Full Visual Tour & Stranger Things Music</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">V</span></td>
                  <td><strong>Toggle 4-Column In-VR Remote Controller & Head Gaze Pointer</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Tab</span></td>
                  <td><strong>Cycle Modules</strong> (Solar ➔ Plant ➔ Conception)</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">[ / ]</span></td>
                  <td><strong>Adjust Speed</strong> (0.5x, 1x, 2x, 5x)</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">F, B, L, T</span></td>
                  <td><strong>Instant Camera Sides</strong> (Front, Back, Left, Top)</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">Space</span></td>
                  <td><strong>Toggle Mouse Pointer ON / OFF</strong> in VR, Desktop & Mobile</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">N</span></td>
                  <td><strong>Toggle 3D Floating Names & Labels</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">M</span></td>
                  <td><strong>Toggle Audio & Narration</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">R</span></td>
                  <td><strong>Reset Camera View</strong> to central system overview</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">🥽 ENTER VR</span></td>
                  <td>Launch <strong>WebXR 6-DOF Stereoscopic VR</strong> (Meta Quest / Mobile)</td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">👓 DUAL SCREEN VR</span></td>
                  <td>Cardboard / VR Box <strong>Split-Screen SBS VR with Gyro</strong></td>
                </tr>
                <tr>
                  <td><span class="kbd-chip">📱 Mobile Remote</span></td>
                  <td>Open <strong><code style="color:#38bdf8;">/controller.html</code></strong> on mobile to control 3D view wirelessly!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Mobile Remote Controller Modal -->
      <div class="hud-help-modal ${this.showRemoteModal ? 'open' : ''}" id="remoteModal">
        <div class="help-card" style="max-width: 520px;">
          <div class="help-header">
            <div class="help-title">📱 Mobile VR Remote Mouse Controller</div>
            <button class="help-close-btn" id="btnCloseRemote">✕</button>
          </div>
          <div class="help-body" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 18px 20px;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">
              Scan the QR code with your phone camera or open the link below in your phone's browser:
            </p>
            
            <div style="background: #ffffff; padding: 10px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: inline-block;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://${window.location.hostname}:3050/controller.html`)}" alt="Remote QR Code" width="180" height="180" style="display: block; border-radius: 6px;" onerror="this.style.display='none'" />
            </div>

            <div style="width: 100%; display: flex; gap: 8px; justify-content: center; align-items: center;">
              <input type="text" readonly id="txtRemoteUrl" value="https://${window.location.hostname}:3050/controller.html" style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 8px 12px; border-radius: 8px; width: 75%; text-align: center;" />
              <button class="btn-secondary" id="btnCopyRemoteUrl" style="padding: 8px 14px; border-radius: 8px; font-weight: bold; background: #38bdf8; color: #020617; border: none; cursor: pointer;">📋 Copy</button>
            </div>

            <div style="background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #fde047; text-align: left; line-height: 1.5; width: 100%;">
              <strong>⚠️ Mobile Chrome / Safari SSL Notice:</strong><br>
              Because mobile VR &amp; gyroscope strictly require HTTPS, your phone browser will show a warning (<em>"Your connection is not private"</em>).<br>
              Simply tap <strong>Advanced</strong> (or <em>Details</em>) ➔ <strong>Proceed to ${window.location.hostname} (unsafe)</strong> to load the controller.
            </div>

            <a href="https://${window.location.hostname}:3050/controller.html" target="_blank" style="color: #38bdf8; font-size: 13px; text-decoration: underline; font-weight: 600;">
              Open Controller in new tab (Desktop test) ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderTelemetryTicker() {
    const stages = this.getActiveStages();
    const stage = stages[this.currentStageIndex] || stages[0];
    if (this.activeModule === 'heart') {
      return `
        <div class="ticker-item">
          <span class="ticker-dot dot-red"></span>
          <span class="ticker-label">Cardiac Cycle:</span>
          <span class="ticker-val" id="valTicker1">${stage.shortName}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-purple"></span>
          <span class="ticker-label">Heart Rate:</span>
          <span class="ticker-val" id="valTicker2">75 BPM 🫀</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-cyan"></span>
          <span class="ticker-label">Pressure:</span>
          <span class="ticker-val" id="valTicker3">${stage.telemetry ? (stage.telemetry.atrialPressure || stage.telemetry.rvPressure || stage.telemetry.aorticPressure || '120/80 mmHg') : '120/80 mmHg'}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-green"></span>
          <span class="ticker-label">Cardiac Output:</span>
          <span class="ticker-val" id="valTicker4">5.25 L/min</span>
        </div>
      `;
    } else if (this.activeModule === 'reproduction') {
      return `
        <div class="ticker-item">
          <span class="ticker-dot dot-cyan"></span>
          <span class="ticker-label">Timeline:</span>
          <span class="ticker-val" id="valTicker1">${stage.timeline || 'N/A'}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-red"></span>
          <span class="ticker-label">Heartbeat:</span>
          <span class="ticker-val" id="valTicker2">140 BPM ❤️</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-purple"></span>
          <span class="ticker-label">Chromosomes:</span>
          <span class="ticker-val" id="valTicker3">46 (2n)</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-green"></span>
          <span class="ticker-label">Cell Count:</span>
          <span class="ticker-val" id="valTicker4">250 Million</span>
        </div>
      `;
    } else if (this.activeModule === 'photosynthesis') {
      return `
        <div class="ticker-item">
          <span class="ticker-dot dot-green"></span>
          <span class="ticker-label">Bio-Scale:</span>
          <span class="ticker-val" id="valTicker1">${stage.shortName}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-cyan"></span>
          <span class="ticker-label">PAR Flux:</span>
          <span class="ticker-val" id="valTicker2">${stage.telemetry ? Object.values(stage.telemetry)[0] : '1450 µmol/m²s'}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-purple"></span>
          <span class="ticker-label">CO₂:</span>
          <span class="ticker-val" id="valTicker3">420 ppm</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-red"></span>
          <span class="ticker-label">ATP Rate:</span>
          <span class="ticker-val" id="valTicker4">36.5 µmol/h</span>
        </div>
      `;
    } else {
      // Solar
      return `
        <div class="ticker-item">
          <span class="ticker-dot" style="background:#facc15;box-shadow:0 0 6px #facc15;"></span>
          <span class="ticker-label">Tracking:</span>
          <span class="ticker-val" id="valTicker1">${stage.shortName}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-cyan"></span>
          <span class="ticker-label">Distance:</span>
          <span class="ticker-val" id="valTicker2">${stage.telemetry ? (stage.telemetry.distanceFromSun || stage.telemetry.diameter || '0 km') : '0 km'}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-red"></span>
          <span class="ticker-label">Temp:</span>
          <span class="ticker-val" id="valTicker3">${stage.telemetry ? (stage.telemetry.surfaceTemp || stage.telemetry.temperature || stage.telemetry.cloudTopTemp || 'N/A') : 'N/A'}</span>
        </div>
        <div class="ticker-item">
          <span class="ticker-dot dot-purple"></span>
          <span class="ticker-label">Moons:</span>
          <span class="ticker-val" id="valTicker4">${stage.telemetry ? (stage.telemetry.moons || stage.telemetry.moonsCount || '0') : '0'}</span>
        </div>
      `;
    }
  }

  renderParamSliders() {
    if (this.activeModule === 'heart') {
      return `
        <div class="param-slider-group">
          <div class="param-header">
            <span>🫀 Heart Rate</span>
            <span id="txtParam1">75 BPM</span>
          </div>
          <input type="range" id="sliderParam1" min="40" max="180" step="5" value="75" data-key="heartRateBPM">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>🩸 Systolic Blood Pressure</span>
            <span id="txtParam2">120 mmHg</span>
          </div>
          <input type="range" id="sliderParam2" min="80" max="180" step="5" value="120" data-key="bloodPressureSys">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>🌊 Stroke Volume</span>
            <span id="txtParam3">70 mL</span>
          </div>
          <input type="range" id="sliderParam3" min="40" max="120" step="5" value="70" data-key="strokeVolumeML">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>⏱️ Simulation Speed</span>
            <span id="txtParam4">1.0x</span>
          </div>
          <input type="range" id="sliderParam4" min="0.2" max="5" step="0.1" value="1.0" data-key="simSpeed">
        </div>
      `;
    } else if (this.activeModule === 'reproduction') {
      return `
        <div class="param-slider-group">
          <div class="param-header">
            <span>❤️ Embryo / Fetal Heart Rate</span>
            <span id="txtParam1">140 BPM</span>
          </div>
          <input type="range" id="sliderParam1" min="100" max="180" step="5" value="140" data-key="heartRateBPM">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>🏊 Sperm Motility Speed</span>
            <span id="txtParam2">1.0x</span>
          </div>
          <input type="range" id="sliderParam2" min="0.2" max="2.5" step="0.1" value="1.0" data-key="spermMotilitySpeed">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>💫 Calcium Wave Glow</span>
            <span id="txtParam3">1.0x</span>
          </div>
          <input type="range" id="sliderParam3" min="0.2" max="2.0" step="0.1" value="1.0" data-key="calciumWaveIntensity">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>⏱️ Simulation Speed</span>
            <span id="txtParam4">1.0x</span>
          </div>
          <input type="range" id="sliderParam4" min="0.2" max="5" step="0.1" value="1.0" data-key="simSpeed">
        </div>
      `;
    } else if (this.activeModule === 'photosynthesis') {
      return `
        <div class="param-slider-group">
          <div class="param-header">
            <span>☀️ Sunlight Photon Flux</span>
            <span id="txtParam1">1.0x</span>
          </div>
          <input type="range" id="sliderParam1" min="0" max="2.5" step="0.1" value="1.0" data-key="lightIntensity">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>🌫️ Atmospheric CO₂</span>
            <span id="txtParam2">1.0x</span>
          </div>
          <input type="range" id="sliderParam2" min="0.2" max="2.5" step="0.1" value="1.0" data-key="co2Level">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>💧 Xylem Water Delivery</span>
            <span id="txtParam3">1.0x</span>
          </div>
          <input type="range" id="sliderParam3" min="0.2" max="2.5" step="0.1" value="1.0" data-key="waterSupply">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>⏱️ Bio-Kinetics Speed</span>
            <span id="txtParam4">1.0x</span>
          </div>
          <input type="range" id="sliderParam4" min="0.1" max="5" step="0.1" value="1.0" data-key="simSpeed">
        </div>
      `;
    } else {
      // Solar
      return `
        <div class="param-slider-group">
          <div class="param-header">
            <span>⏱️ Orbital Clock Speed</span>
            <span id="txtParam1">1.0x</span>
          </div>
          <input type="range" id="sliderParam1" min="0.1" max="10" step="0.1" value="1.0" data-key="orbitSpeedMult">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>🔄 Planetary Axial Spin</span>
            <span id="txtParam2">1.0x</span>
          </div>
          <input type="range" id="sliderParam2" min="0.1" max="5" step="0.1" value="1.0" data-key="rotationSpeedMult">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>☀️ Solar Wind Intensity</span>
            <span id="txtParam3">1.0x</span>
          </div>
          <input type="range" id="sliderParam3" min="0.2" max="3" step="0.1" value="1.0" data-key="solarWindMult">
        </div>
        <div class="param-slider-group">
          <div class="param-header">
            <span>⏱️ Master Time Multiplier</span>
            <span id="txtParam4">1.0x</span>
          </div>
          <input type="range" id="sliderParam4" min="0.1" max="10" step="0.1" value="1.0" data-key="simSpeed">
        </div>
      `;
    }
  }

  bindEvents() {
    // Module selector tabs
    const moduleTabs = this.container.querySelectorAll('.module-tab');
    moduleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const moduleId = tab.getAttribute('data-module');
        if (moduleId === this.activeModule) return;
        this.switchModule(moduleId);
      });
    });

    // Play / Pause live simulation
    const btnPause = this.container.querySelector('#btnSimPause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.togglePause();
      });
    }

    // Speed multiplier buttons
    const speedBtns = this.container.querySelectorAll('.btn-speed');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.getAttribute('data-speed'));
        this.currentSpeed = speed;
        this.isPaused = false;
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const btnPause = this.container.querySelector('#btnSimPause');
        if (btnPause) btnPause.classList.remove('active');
        const txt = this.container.querySelector('#txtSimPause');
        if (txt) txt.textContent = '⏸';

        if (this.onParamChange) {
          this.onParamChange('simSpeed', speed);
        }
      });
    });

    // Labels toggle
    const btnLabels = this.container.querySelector('#btnToggleLabels');
    if (btnLabels) {
      btnLabels.addEventListener('click', () => {
        this.toggleLabels();
      });
    }

    // Help Modal toggle
    const btnHelp = this.container.querySelector('#btnToggleHelp');
    const modal = this.container.querySelector('#helpModal');
    const btnCloseHelp = this.container.querySelector('#btnCloseHelp');

    if (btnHelp && modal) {
      btnHelp.addEventListener('click', () => {
        this.showHelpModal = !this.showHelpModal;
        modal.classList.toggle('open', this.showHelpModal);
      });
    }

    if (btnCloseHelp && modal) {
      btnCloseHelp.addEventListener('click', () => {
        this.showHelpModal = false;
        modal.classList.remove('open');
      });
    }

    // Remote Modal toggle & Copy
    const btnShowRemote = this.container.querySelector('#btnShowRemoteModal');
    const remoteModal = this.container.querySelector('#remoteModal');
    const btnCloseRemote = this.container.querySelector('#btnCloseRemote');
    const btnCopyRemoteUrl = this.container.querySelector('#btnCopyRemoteUrl');

    if (btnShowRemote && remoteModal) {
      btnShowRemote.addEventListener('click', () => {
        this.showRemoteModal = !this.showRemoteModal;
        remoteModal.classList.toggle('open', this.showRemoteModal);
      });
    }

    if (btnCloseRemote && remoteModal) {
      btnCloseRemote.addEventListener('click', () => {
        this.showRemoteModal = false;
        remoteModal.classList.remove('open');
      });
    }

    if (btnCopyRemoteUrl) {
      btnCopyRemoteUrl.addEventListener('click', () => {
        const txt = this.container.querySelector('#txtRemoteUrl');
        if (txt) {
          navigator.clipboard?.writeText(txt.value).catch(() => {});
          btnCopyRemoteUrl.textContent = '✅ Copied!';
          setTimeout(() => {
            btnCopyRemoteUrl.textContent = '📋 Copy';
          }, 2000);
        }
      });
    }

    // Stage navigation buttons
    const stageBtns = this.container.querySelectorAll('.stage-tab-btn');
    stageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stageIdx = parseInt(btn.getAttribute('data-stage'), 10);
        this.setActiveStage(stageIdx);
        if (this.onStageSelect) this.onStageSelect(stageIdx);
      });
    });

    // 360° Camera side preset buttons
    const angleBtns = this.container.querySelectorAll('.btn-angle');
    angleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const side = btn.getAttribute('data-side');
        if (this.onCameraSide) this.onCameraSide(side);
      });
    });

    // Auto Spin Toggle
    const btnAutoSpin = this.container.querySelector('#btnAutoSpin');
    if (btnAutoSpin) {
      btnAutoSpin.addEventListener('click', () => {
        this.autoRotate360 = !this.autoRotate360;
        btnAutoSpin.classList.toggle('active', this.autoRotate360);
        if (this.onParamChange) this.onParamChange('autoRotate360', this.autoRotate360);
      });
    }

    // Cutaway Toggle
    const btnCutaway = this.container.querySelector('#btnCutaway');
    if (btnCutaway) {
      btnCutaway.addEventListener('click', () => {
        this.crossSectionView = !this.crossSectionView;
        btnCutaway.classList.toggle('active', this.crossSectionView);
        if (this.onParamChange) this.onParamChange('crossSectionView', this.crossSectionView);
      });
    }

    // Detach 3D Gizmo Button (X)
    const btnDetachGizmo = this.container.querySelector('#btnDetachGizmo');
    if (btnDetachGizmo) {
      btnDetachGizmo.addEventListener('click', () => {
        if (this.onDetachGizmo) this.onDetachGizmo();
      });
    }

    // Mouse Pointer Toggle (Space)
    const btnMouse = this.container.querySelector('#btnToggleMouse');
    if (btnMouse) {
      btnMouse.addEventListener('click', () => {
        if (this.onToggleMouse) {
          const enabled = this.onToggleMouse();
          this.setMouseState(enabled);
        }
      });
    }

    // Collapsible Camera Angles Panel & Top Toggle
    const btnCollapseAngles = this.container.querySelector('#btnCollapseAngles');
    const anglesBar = this.container.querySelector('#hudCameraAnglesBar');
    const toggleAngle = () => {
      if (!anglesBar) return;
      anglesBar.classList.toggle('collapsed');
      const arrow = btnCollapseAngles ? btnCollapseAngles.querySelector('.collapse-icon') : null;
      if (arrow) arrow.textContent = anglesBar.classList.contains('collapsed') ? '▼' : '▲';
    };
    if (btnCollapseAngles) btnCollapseAngles.addEventListener('click', toggleAngle);
    const btnTopAngleToggle = this.container.querySelector('#btnTopAngleToggle');
    if (btnTopAngleToggle) btnTopAngleToggle.addEventListener('click', toggleAngle);

    // Collapsible Simulation Controls Panel & Top Toggle
    const btnCollapseControls = this.container.querySelector('#btnCollapseControls');
    const controlsPanel = this.container.querySelector('#hudControlsPanel');
    const toggleControls = () => {
      if (!controlsPanel) return;
      controlsPanel.classList.toggle('collapsed');
      const arrow = btnCollapseControls ? btnCollapseControls.querySelector('.collapse-icon') : null;
      if (arrow) arrow.textContent = controlsPanel.classList.contains('collapsed') ? '▼' : '▲';
    };
    if (btnCollapseControls) btnCollapseControls.addEventListener('click', toggleControls);
    const btnTopControlsToggle = this.container.querySelector('#btnTopControlsToggle');
    if (btnTopControlsToggle) btnTopControlsToggle.addEventListener('click', toggleControls);

    // Enter VR button
    const btnVR = this.container.querySelector('#btnEnterVR');
    if (btnVR) {
      btnVR.addEventListener('click', () => {
        if (this.onEnterVR) this.onEnterVR();
      });
    }

    // Dual Screen VR button
    const btnDualVR = this.container.querySelector('#btnDualVR');
    if (btnDualVR) {
      btnDualVR.addEventListener('click', () => {
        if (this.onToggleDualVR) {
          const isDual = this.onToggleDualVR();
          this.container.querySelector('#dualVRText').textContent = isDual ? 'EXIT VR' : 'DUAL SCREEN VR';
        }
      });
    }

    // Tour toggle
    const btnTour = this.container.querySelector('#btnToggleTour');
    if (btnTour) {
      btnTour.addEventListener('click', () => {
        if (this.onToggleTour) this.onToggleTour();
      });
    }

    // Reset camera
    const btnReset = this.container.querySelector('#btnResetCam');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.onResetCamera) this.onResetCamera();
      });
    }

    // Audio toggle
    const btnAudio = this.container.querySelector('#btnToggleAudio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        if (this.onToggleAudio) {
          const isMuted = this.onToggleAudio();
          this.container.querySelector('#audioIcon').textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Science panel toggle
    const btnSci = this.container.querySelector('#btnToggleScience');
    if (btnSci) {
      btnSci.addEventListener('click', () => {
        if (this.onToggleScience) this.onToggleScience();
      });
    }

    // Parameter sliders
    this.bindParamSliders();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const btnPause = this.container.querySelector('#btnSimPause');
    if (btnPause) btnPause.classList.toggle('active', this.isPaused);
    const txt = this.container.querySelector('#txtSimPause');
    if (txt) txt.textContent = this.isPaused ? '▶' : '⏸';
    if (this.onParamChange) {
      this.onParamChange('simSpeed', this.isPaused ? 0.0 : this.currentSpeed);
    }
  }

  toggleLabels() {
    this.showLabels = !this.showLabels;
    const btnLabels = this.container.querySelector('#btnToggleLabels');
    if (btnLabels) btnLabels.classList.toggle('active', this.showLabels);
    if (this.onToggleLabels) {
      this.onToggleLabels(this.showLabels);
    }
  }

  toggleHelpModal() {
    this.showHelpModal = !this.showHelpModal;
    const modal = this.container.querySelector('#helpModal');
    if (modal) modal.classList.toggle('open', this.showHelpModal);
  }

  setMouseState(enabled) {
    this.isMouseEnabled = Boolean(enabled);
    const btn = this.container.querySelector('#btnToggleMouse');
    const txt = this.container.querySelector('#mouseBtnText');
    const icon = this.container.querySelector('#mouseIcon');
    if (!btn || !txt) return;

    if (this.isMouseEnabled) {
      btn.classList.add('mouse-active');
      btn.classList.remove('mouse-inactive');
      txt.textContent = 'MOUSE: ON';
      if (icon) icon.textContent = '🖱️';
      btn.title = 'Toggle Mouse Pointer OFF (Space)';
    } else {
      btn.classList.remove('mouse-active');
      btn.classList.add('mouse-inactive');
      txt.textContent = 'MOUSE: OFF';
      if (icon) icon.textContent = '🚫';
      btn.title = 'Toggle Mouse Pointer ON (Space)';
    }
  }

  setGizmoActive(isActive) {
    this.isGizmoActive = Boolean(isActive);
    const btn = this.container.querySelector('#btnDetachGizmo');
    if (btn) {
      btn.style.display = this.isGizmoActive ? 'inline-flex' : 'none';
    }
  }

  bindParamSliders() {
    for (let i = 1; i <= 4; i++) {
      const slider = this.container.querySelector(`#sliderParam${i}`);
      const txt = this.container.querySelector(`#txtParam${i}`);
      if (slider && txt) {
        slider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          const key = slider.getAttribute('data-key');
          if (key === 'heartRateBPM') {
            txt.textContent = `${Math.round(val)} BPM`;
          } else {
            txt.textContent = `${val.toFixed(1)}x`;
          }
          if (this.onParamChange) this.onParamChange(key, val);
        });
      }
    }
  }

  switchModule(moduleId) {
    this.activeModule = moduleId;
    this.currentStageIndex = 0;
    this.render();
    this.bindEvents();
    if (this.onModuleSwitch) this.onModuleSwitch(moduleId);
  }

  setActiveStage(stageIndex) {
    this.currentStageIndex = stageIndex;
    const stageBtns = this.container.querySelectorAll('.stage-tab-btn');
    stageBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === stageIndex);
    });

    const ticker = this.container.querySelector('#telemetryTicker');
    if (ticker) {
      ticker.innerHTML = this.renderTelemetryTicker();
    }
  }

  setTourState(isPlaying) {
    this.isTourPlaying = isPlaying;
    const label = this.container.querySelector('#tourBtnText');
    if (label) {
      label.textContent = isPlaying ? 'PAUSE (A)' : 'TOUR (A)';
    }
  }
}
