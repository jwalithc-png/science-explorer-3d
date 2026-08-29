/**
 * UI Manager for HUD Panels, Inspector, Time Multipliers, Layer Toggles, and Toast Telemetry
 */
export class UIManager {
  constructor({ solarSystem, selectionManager, measurementTool, onCinematicTour, onToggleSplitVR }) {
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.measurementTool = measurementTool;
    this.onCinematicTour = onCinematicTour;
    this.onToggleSplitVR = onToggleSplitVR;

    this.selectedBody = null;
    this.toastTimer = null;
    this.isSplitVR = false;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    // Top bar elements
    this.topBar = document.getElementById('top-bar');
    this.shortcutsPanel = document.getElementById('shortcuts-panel');
    this.timeButtons = document.querySelectorAll('.time-btn[data-speed]');
    this.btnPause = document.getElementById('btn-time-pause');
    this.selectJump = document.getElementById('select-planet-jump');
    this.btnToggleOrbits = document.getElementById('btn-toggle-orbits');
    this.btnToggleLabels = document.getElementById('btn-toggle-labels');
    this.btnMeasure = document.getElementById('btn-measure-tool');
    this.btnCinematicCam = document.getElementById('btn-cinematic-cam');
    this.btnSplitVR = document.getElementById('btn-split-vr');
    this.splitVROverlay = document.getElementById('split-vr-overlay');
    this.btnExitSplitVR = document.getElementById('btn-exit-split-vr');
    this.btnVRTour = document.getElementById('btn-vr-tour');
    this.vrStatusBanner = document.getElementById('vr-status-banner');

    // Inspector elements
    this.inspectorPanel = document.getElementById('inspector-panel');
    this.inspectorSymbol = document.getElementById('inspector-symbol');
    this.inspectorName = document.getElementById('inspector-name');
    this.inspectorType = document.getElementById('inspector-type');
    this.btnCloseInspector = document.getElementById('btn-close-inspector');

    // Object Controls
    this.btnObjAnimToggle = document.getElementById('btn-obj-anim-toggle');
    this.objAnimStatus = document.getElementById('obj-anim-status');
    this.btnObjOrbitToggle = document.getElementById('btn-obj-orbit-toggle');
    this.objOrbitStatus = document.getElementById('obj-orbit-status');
    this.btnObjRotToggle = document.getElementById('btn-obj-rotation-toggle');
    this.objRotStatus = document.getElementById('obj-rotation-status');
    this.btnObjResetRot = document.getElementById('btn-obj-reset-rot');
    this.dynamicLayerControls = document.getElementById('dynamic-layer-controls');

    this.sliderRotSpeed = document.getElementById('slider-rot-speed');
    this.valRotSpeed = document.getElementById('val-rot-speed');
    this.sliderOrbitSpeed = document.getElementById('slider-orbit-speed');
    this.valOrbitSpeed = document.getElementById('val-orbit-speed');

    this.btnFlyTo = document.getElementById('btn-flyto-target');
    this.btnTrack = document.getElementById('btn-track-target');

    // Telemetry items
    this.tDiameter = document.getElementById('t-diameter');
    this.tDistance = document.getElementById('t-distance');
    this.tRotation = document.getElementById('t-rotation');
    this.tOrbit = document.getElementById('t-orbit');
    this.tTemp = document.getElementById('t-temp');
    this.tMoons = document.getElementById('t-moons');
    this.tTilt = document.getElementById('t-tilt');
    this.tAtmo = document.getElementById('t-atmo');
    this.tDesc = document.getElementById('t-description');

    // Measurement HUD
    this.measurementHud = document.getElementById('measurement-hud');
    this.measurePointA = document.getElementById('measure-point-a');
    this.measurePointB = document.getElementById('measure-point-b');
    this.measureSimDist = document.getElementById('measure-sim-dist');
    this.measureRealDist = document.getElementById('measure-real-dist');
    this.measureLightTime = document.getElementById('measure-light-time');
    this.btnCloseMeasure = document.getElementById('btn-close-measure');

    // Toast
    this.toastElem = document.getElementById('status-toast');
    this.toastMsg = document.getElementById('toast-message');

    // Shortcuts panel
    this.btnCollapseShortcuts = document.getElementById('btn-collapse-shortcuts');
    this.shortcutsContent = document.querySelector('.shortcuts-content');
  }

  bindEvents() {
    // 1. Time Multipliers
    this.timeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        this.solarSystem.setTimeMultiplier(speed);
        this.timeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.showToast(`SIMULATION TIME MULTIPLIER: ${speed}×`);
      });
    });

    // Pause button
    this.btnPause.addEventListener('click', () => {
      const isPaused = this.solarSystem.togglePause();
      this.btnPause.innerHTML = isPaused ? '▶' : '⏸';
      this.btnPause.classList.toggle('active', isPaused);
      this.showToast(isPaused ? 'SIMULATION PAUSED' : 'SIMULATION RUNNING');
    });

    // 2. Planet Jump Dropdown
    this.selectJump.addEventListener('change', (e) => {
      const name = e.target.value;
      if (!name) return;
      const body = this.solarSystem.getBody(name);
      if (body) {
        this.selectionManager.flyToBody(body);
        this.showToast(`NAVIGATING TO ${name.toUpperCase()}...`);
      }
      this.selectJump.value = '';
    });

    // 3. Orbits & Labels Toggles
    this.btnToggleOrbits.addEventListener('click', () => {
      const active = this.solarSystem.toggleOrbitTrails();
      this.btnToggleOrbits.classList.toggle('active', active);
      this.showToast(`ORBIT TRAILS: ${active ? 'VISIBLE' : 'HIDDEN'}`);
    });

    this.btnToggleLabels.addEventListener('click', () => {
      const active = this.solarSystem.toggleLabels();
      this.btnToggleLabels.classList.toggle('active', active);
      this.showToast(`CELESTIAL LABELS: ${active ? 'VISIBLE' : 'HIDDEN'}`);
    });

    // 4. Measurement Tool Toggle
    this.btnMeasure.addEventListener('click', () => {
      const active = this.measurementTool.toggle();
      this.btnMeasure.classList.toggle('active', active);
      this.measurementHud.classList.toggle('hidden', !active);
      this.showToast(active ? 'MEASUREMENT TOOL ACTIVE: SELECT TWO BODIES' : 'MEASUREMENT TOOL DEACTIVATED');
    });

    this.btnCloseMeasure.addEventListener('click', () => {
      this.measurementTool.toggle();
      this.btnMeasure.classList.remove('active');
      this.measurementHud.classList.add('hidden');
    });

    // 5. Cinematic Guided Tour (Desktop Top Bar)
    if (this.btnCinematicCam) {
      this.btnCinematicCam.addEventListener('click', () => {
        if (this.onCinematicTour) {
          const isTouring = this.onCinematicTour();
          this.btnCinematicCam.classList.toggle('active', isTouring);
        }
      });
    }

    // 6. Dual-Screen Stereoscopic VR Mode & VR Tour
    if (this.btnSplitVR) {
      this.btnSplitVR.addEventListener('click', () => {
        if (this.onToggleSplitVR) {
          const isSplit = this.onToggleSplitVR();
          this.setSplitVRUI(isSplit);
        }
      });
    }

    const btnVRTour = document.getElementById('btn-vr-tour');
    if (btnVRTour) {
      btnVRTour.addEventListener('click', () => {
        if (this.onCinematicTour) {
          const isTouring = this.onCinematicTour();
          btnVRTour.classList.toggle('active', isTouring);
          btnVRTour.textContent = isTouring ? '⏸ PAUSE TOUR' : '🎬 VR SOLAR TOUR';
        }
      });
    }

    const btnVRFullscreen = document.getElementById('btn-vr-fullscreen');
    if (btnVRFullscreen) {
      btnVRFullscreen.addEventListener('click', () => {
        this.toggleAppFullscreen();
      });
    }

    document.addEventListener('fullscreenchange', () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (btnVRFullscreen) {
        btnVRFullscreen.textContent = isFs ? '⛶ EXIT FULLSCREEN' : '⛶ FULLSCREEN';
      }
    });

    const btnExitSplitVR = document.getElementById('btn-exit-split-vr');
    if (btnExitSplitVR) {
      btnExitSplitVR.addEventListener('click', () => {
        if (this.onToggleSplitVR) {
          this.onToggleSplitVR(false);
          this.setSplitVRUI(false);
        }
      });
    }

    // 6. Inspector Actions
    this.btnCloseInspector.addEventListener('click', () => {
      this.selectionManager.clearSelection();
    });

    this.btnFlyTo.addEventListener('click', () => {
      if (this.selectedBody) {
        this.selectionManager.flyToBody(this.selectedBody);
      }
    });

    this.btnTrack.addEventListener('click', () => {
      if (this.selectedBody) {
        this.selectionManager.trackedBody = 
          this.selectionManager.trackedBody === this.selectedBody ? null : this.selectedBody;
        const isTracking = this.selectionManager.trackedBody !== null;
        this.btnTrack.classList.toggle('glow-btn-cyan', isTracking);
        this.showToast(isTracking ? `LOCKED TRACKING: ${this.selectedBody.name.toUpperCase()}` : 'TRACKING RELEASED');
      }
    });

    // Object Animation Sub-toggles
    this.btnObjAnimToggle.addEventListener('click', () => {
      if (!this.selectedBody) return;
      const active = this.selectedBody.toggleAnimation();
      this.updateObjectControlsState();
      this.showToast(`${this.selectedBody.name.toUpperCase()} ANIMATION ${active ? 'RESUMED' : 'PAUSED'}`);
    });

    this.btnObjOrbitToggle.addEventListener('click', () => {
      if (!this.selectedBody) return;
      this.selectedBody.animationState.orbit = !this.selectedBody.animationState.orbit;
      this.updateObjectControlsState();
    });

    this.btnObjRotToggle.addEventListener('click', () => {
      if (!this.selectedBody) return;
      this.selectedBody.animationState.rotation = !this.selectedBody.animationState.rotation;
      this.updateObjectControlsState();
    });

    this.btnObjResetRot.addEventListener('click', () => {
      if (!this.selectedBody) return;
      this.selectedBody.resetManualRotation();
      this.showToast(`${this.selectedBody.name.toUpperCase()} GIZMO ROTATION RESET`);
    });

    // Sliders
    this.sliderRotSpeed.addEventListener('input', (e) => {
      if (!this.selectedBody) return;
      const val = parseFloat(e.target.value);
      this.selectedBody.rotationSpeedMult = val;
      this.valRotSpeed.textContent = `${val.toFixed(1)}×`;
    });

    this.sliderOrbitSpeed.addEventListener('input', (e) => {
      if (!this.selectedBody) return;
      const val = parseFloat(e.target.value);
      this.selectedBody.orbitSpeedMult = val;
      this.valOrbitSpeed.textContent = `${val.toFixed(1)}×`;
    });

    // Collapse shortcuts
    this.btnCollapseShortcuts.addEventListener('click', () => {
      const isHidden = this.shortcutsContent.classList.toggle('hidden');
      this.btnCollapseShortcuts.textContent = isHidden ? '+' : '−';
    });
  }

  /**
   * Called by SelectionManager when target changes
   */
  updateInspector(body) {
    this.selectedBody = body;

    if (!body || this.isSplitVR) {
      this.inspectorPanel.classList.add('hidden');
      return;
    }

    this.inspectorPanel.classList.remove('hidden');

    // Populate Header
    this.inspectorSymbol.textContent = body.data.symbol || '🪐';
    this.inspectorName.textContent = body.name.toUpperCase();
    this.inspectorType.textContent = body.data.type || 'CELESTIAL BODY';

    // Populate Telemetry
    this.tDiameter.textContent = body.data.diameter || 'N/A';
    this.tDistance.textContent = body.data.distanceFromSun || 'N/A';
    this.tRotation.textContent = body.data.rotationPeriodHours ? `${Math.abs(body.data.rotationPeriodHours)} Hours` : 'N/A';
    this.tOrbit.textContent = body.data.orbitalPeriodDays || 'N/A';
    this.tTemp.textContent = body.data.temperature || 'N/A';
    this.tMoons.textContent = body.data.moonsCount || '0';
    this.tTilt.textContent = `${body.data.axialTiltDeg || 0}°`;
    this.tAtmo.textContent = body.data.atmosphere || (body.name === 'Earth' ? 'N₂, O₂, Ar, CO₂' : body.name === 'Venus' ? 'CO₂, N₂, SO₂' : body.name === 'Jupiter' ? 'H₂, He, CH₄, NH₃' : 'None / Trace');
    this.tDesc.textContent = body.data.description || 'Planetary body in the Solar System.';

    // Reset sliders to body's current multipliers
    this.sliderRotSpeed.value = body.rotationSpeedMult;
    this.valRotSpeed.textContent = `${body.rotationSpeedMult.toFixed(1)}×`;
    this.sliderOrbitSpeed.value = body.orbitSpeedMult;
    this.valOrbitSpeed.textContent = `${body.orbitSpeedMult.toFixed(1)}×`;

    // Populate Dynamic Layer Controls (Specific to Earth, Sun, Saturn, etc.)
    this.populateLayerControls(body);
    this.updateObjectControlsState();
  }

  populateLayerControls(body) {
    this.dynamicLayerControls.innerHTML = '';

    if (body.name === 'Earth') {
      const layers = [
        { id: 'clouds', label: 'Cloud Layer', active: true },
        { id: 'atmosphere', label: 'Atmosphere Scattering', active: true },
        { id: 'nightLights', label: 'Night City Lights', active: true }
      ];

      layers.forEach((layer) => {
        const btn = document.createElement('button');
        btn.className = 'layer-toggle-btn active';
        btn.innerHTML = `<span>${layer.label}</span><span class="layer-status-pill"></span>`;
        btn.addEventListener('click', () => {
          const state = body.toggleLayer(layer.id);
          btn.classList.toggle('active', state);
          this.showToast(`EARTH ${layer.label.toUpperCase()}: ${state ? 'ENABLED' : 'DISABLED'}`);
        });
        this.dynamicLayerControls.appendChild(btn);
      });
    } else if (body.name === 'Sun') {
      const sunControls = [
        { key: 'surface', label: 'Plasma Convection' },
        { key: 'corona', label: 'Solar Corona' },
        { key: 'rays', label: 'Solar Rays' }
      ];
      sunControls.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'layer-toggle-btn active';
        btn.innerHTML = `<span>${item.label}</span><span class="layer-status-pill"></span>`;
        btn.addEventListener('click', () => {
          body.animationState[item.key] = !body.animationState[item.key];
          const active = body.animationState[item.key];
          btn.classList.toggle('active', active);
          this.showToast(`SUN ${item.label.toUpperCase()}: ${active ? 'ENABLED' : 'DISABLED'}`);
        });
        this.dynamicLayerControls.appendChild(btn);
      });
    } else if (body.name === 'Saturn') {
      const btn = document.createElement('button');
      btn.className = 'layer-toggle-btn active';
      btn.innerHTML = `<span>Icy Ring System</span><span class="layer-status-pill"></span>`;
      btn.addEventListener('click', () => {
        if (body.ringMesh) {
          body.ringMesh.visible = !body.ringMesh.visible;
          btn.classList.toggle('active', body.ringMesh.visible);
          this.showToast(`SATURN RINGS: ${body.ringMesh.visible ? 'VISIBLE' : 'HIDDEN'}`);
        }
      });
      this.dynamicLayerControls.appendChild(btn);
    }
  }

  updateObjectControlsState() {
    if (!this.selectedBody) return;
    const anim = this.selectedBody.animationState;

    // Master Anim button
    this.btnObjAnimToggle.classList.toggle('active', anim.enabled);
    this.objAnimStatus.textContent = anim.enabled ? 'ON (A)' : 'OFF (A)';
    this.objAnimStatus.className = `card-val ${anim.enabled ? 'active-val' : 'inactive-val'}`;

    // Orbit button
    this.btnObjOrbitToggle.classList.toggle('active', anim.orbit);
    this.objOrbitStatus.textContent = anim.orbit ? 'ACTIVE' : 'FROZEN';
    this.objOrbitStatus.className = `card-val ${anim.orbit ? 'active-val' : 'inactive-val'}`;

    // Spin button
    this.btnObjRotToggle.classList.toggle('active', anim.rotation);
    this.objRotationStatus.textContent = anim.rotation ? 'ACTIVE' : 'FROZEN';
    this.objRotationStatus.className = `card-val ${anim.rotation ? 'active-val' : 'inactive-val'}`;
  }

  /**
   * Update Distance Measurement HUD
   */
  updateMeasurementData(bodyA, bodyB, data) {
    if (!data || !bodyA || !bodyB) {
      this.measurePointA.textContent = 'Click 1st Body (e.g. Earth)';
      this.measurePointB.textContent = 'Click 2nd Body (e.g. Mars)';
      this.measureSimDist.textContent = '0.00 Units';
      this.measureRealDist.textContent = '0.00 Million km (0.00 AU)';
      this.measureLightTime.textContent = '0.00 Minutes';
      return;
    }

    this.measurePointA.textContent = `${bodyA.data.symbol || '✦'} ${bodyA.name}`;
    this.measurePointB.textContent = `${bodyB.data.symbol || '✦'} ${bodyB.name}`;

    this.measureSimDist.textContent = `${data.simDistance.toFixed(2)} Simulation Units`;
    this.measureRealDist.textContent = `${data.realDistKmMillion.toFixed(1)}M km (${data.realDistAU.toFixed(2)} AU)`;
    this.measureLightTime.textContent = `${data.lightMinutes.toFixed(2)} Light Minutes (${data.lightSeconds.toFixed(1)}s)`;
  }

  /**
   * Display Toast Status Message
   */
  showToast(message) {
    if (!this.toastElem || !this.toastMsg) return;
    this.toastMsg.textContent = message;
    this.toastElem.style.opacity = '1';

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastElem.style.opacity = '0.75';
    }, 4000);
  }

  updateVRStatus(text) {
    const banners = document.querySelectorAll('.vr-status-text');
    banners.forEach((b) => {
      b.textContent = text;
    });
  }

  setSplitVRUI(isSplit) {
    this.isSplitVR = isSplit;

    if (this.splitVROverlay) {
      this.splitVROverlay.classList.toggle('hidden', !isSplit);
    }
    if (this.btnSplitVR) {
      this.btnSplitVR.classList.toggle('active', isSplit);
      this.btnSplitVR.innerHTML = isSplit 
        ? '<span class="vr-icon">👓</span> DUAL SCREEN (ON)' 
        : '<span class="vr-icon">👓</span> DUAL SCREEN VR';
    }

    // When in VR Box Mode, hide 2D desktop panels to prevent double-vision across lenses
    if (this.topBar) {
      this.topBar.classList.toggle('hidden', isSplit);
    }
    if (this.shortcutsPanel) {
      this.shortcutsPanel.classList.toggle('hidden', isSplit);
    }
    if (this.inspectorPanel) {
      this.inspectorPanel.classList.toggle('hidden', isSplit);
    }
    if (this.measurementHud) {
      this.measurementHud.classList.toggle('hidden', isSplit);
    }

    this.showToast(isSplit 
      ? 'VR BOX 3D MODE ACTIVE // FULLSCREEN ENABLED // 360° FREE-LOOK' 
      : 'RETURNED TO DESKTOP VIEW'
    );

    if (isSplit) {
      this.requestAppFullscreen();
    }
  }

  requestAppFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  exitAppFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  toggleAppFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      this.exitAppFullscreen();
    } else {
      this.requestAppFullscreen();
    }
  }
}
