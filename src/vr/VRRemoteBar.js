import * as THREE from 'three';

/**
 * 4-Column In-VR Spatial Remote Controller with PC Mouse-Controlled Circle Pointer
 * 
 * Features:
 * 1. Fixed at top of user's field of view in VR mode (always accessible by glancing up)
 * 2. Circle mouse pointer driven exclusively by PC remote controller (controller.html) mouse movement!
 *    (Head tracking does NOT move the mouse pointer)
 * 3. 4-Column Layout:
 *    - Col 1: 🌌 Module Switcher (Solar System, Plant Biology, Human Conception)
 *    - Col 2: 🎬 Animation & Simulation Controls (Tour ON/OFF, Model Spin ON/OFF, Pause/Resume, Recenter VR)
 *    - Col 3: 🪐 Target List Part 1 (Stages 1 - 5, e.g. Sun, Mercury, Venus, Earth, Mars)
 *    - Col 4: 🪐 Target List Part 2 (Stages 6 - 10, e.g. Jupiter, Saturn, Uranus, Neptune, Pluto)
 * 4. Selecting any body/stage smoothly flies the camera towards that 3D model with inspection view!
 * 5. Instant remote click & optional dwell selection progress ring.
 */
export class VRRemoteBar {
  constructor({
    scene,
    camera,
    cameraRig,
    onSelectStage,
    onToggleTour,
    onToggleModelSpin,
    onTogglePause,
    onRecenterVR,
    onSwitchModule,
    getStagesCallback,
    getCurrentStageIndex,
    getIsTourPlaying,
    getIsModelSpinning,
    getIsPaused,
    getActiveModule
  }) {
    this.scene = scene;
    this.camera = camera;
    this.cameraRig = cameraRig;

    this.onSelectStage = onSelectStage;
    this.onToggleTour = onToggleTour;
    this.onToggleModelSpin = onToggleModelSpin;
    this.onTogglePause = onTogglePause;
    this.onRecenterVR = onRecenterVR;
    this.onSwitchModule = onSwitchModule;

    this.getStagesCallback = getStagesCallback;
    this.getCurrentStageIndex = getCurrentStageIndex;
    this.getIsTourPlaying = getIsTourPlaying;
    this.getIsModelSpinning = getIsModelSpinning;
    this.getIsPaused = getIsPaused;
    this.getActiveModule = getActiveModule;

    this.buttons = [];
    this.buttonMeshes = [];
    this.hoveredButton = null;
    this.dwellTime = 0;
    this.requiredDwell = 0.95; // 0.95s dwell duration
    this.actionCooldown = 0;

    // Target coordinates on the panel [-1.07 to +1.07] for X, [-0.31 to +0.31] for Y
    this.targetCursorX = 0;
    this.targetCursorY = 0;

    // Create Main Panel Container
    this.panelGroup = new THREE.Group();
    this.panelGroup.name = 'VR_Remote_Bar_4Columns';

    // Fixed at top of view in front of camera
    // Position: centered, Y=+0.68m up, Z=-2.1m forward, tilted downward 14° towards eye
    this.panelGroup.position.set(0, 0.68, -2.1);
    this.panelGroup.rotation.set(0.24, 0, 0);

    this.camera.add(this.panelGroup);

    // Group for menu items (cleared and rebuilt on module change)
    this.menuItemsGroup = new THREE.Group();
    this.menuItemsGroup.name = 'VR_Remote_Bar_MenuItems';
    this.panelGroup.add(this.menuItemsGroup);

    // Create Circular Remote Mouse Pointer (permanent child of panelGroup)
    this.createRemoteMouseReticle();

    // Build the 4 Columns
    this.build4Columns();

    // Physical tap / click listener on mobile screen
    this.initInputListeners();

    this.setVisible(true);
  }

  createRemoteMouseReticle() {
    this.reticleGroup = new THREE.Group();
    this.reticleGroup.name = 'VR_Remote_Circle_MousePointer';
    this.reticleGroup.position.set(0, 0, 0.04);

    // 1. Center pointer dot
    const dotGeo = new THREE.RingGeometry(0, 0.009, 20);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.centerDot = new THREE.Mesh(dotGeo, dotMat);
    this.centerDot.renderOrder = 9999;
    this.reticleGroup.add(this.centerDot);

    // 2. Outer circle pointer ring (cyan glow)
    const ringGeo = new THREE.RingGeometry(0.022, 0.030, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.92
    });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.renderOrder = 9999;
    this.reticleGroup.add(this.targetRing);

    // 3. Dynamic Progress Dwell Ring (green glow)
    this.dwellGeo = new THREE.RingGeometry(0.032, 0.042, 32, 1, 0, 0.001);
    this.dwellMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.dwellMesh = new THREE.Mesh(this.dwellGeo, this.dwellMat);
    this.dwellMesh.rotation.z = Math.PI * 0.5;
    this.dwellMesh.renderOrder = 10000;
    this.dwellMesh.visible = false;
    this.reticleGroup.add(this.dwellMesh);

    // Add reticle directly to panelGroup so it stays on the surface of the menu
    this.panelGroup.add(this.reticleGroup);
  }

  updateDwellProgress(progress) {
    if (!this.dwellMesh) return;
    if (progress <= 0.02) {
      this.dwellMesh.visible = false;
      return;
    }
    this.dwellMesh.visible = true;
    const arc = Math.max(0.001, Math.min(progress * Math.PI * 2, Math.PI * 2));
    this.dwellMesh.geometry.dispose();
    this.dwellMesh.geometry = new THREE.RingGeometry(0.032, 0.042, 32, 1, 0, arc);
  }

  build4Columns() {
    // Clear previous menu items
    while (this.menuItemsGroup.children.length > 0) {
      const child = this.menuItemsGroup.children[0];
      this.menuItemsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
    this.buttons = [];
    this.buttonMeshes = [];
    this.hoveredButton = null;
    this.dwellTime = 0;
    this.updateDwellProgress(0);

    // Overall Backdrop Plane (2.14m width x 0.62m height)
    const bgGeo = new THREE.PlaneGeometry(2.14, 0.62);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x050b18,
      transparent: true,
      opacity: 0.90,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -0.01);
    bgMesh.renderOrder = 900;
    this.menuItemsGroup.add(bgMesh);

    // Decorative top neon border
    const borderGeo = new THREE.PlaneGeometry(2.14, 0.012);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0, 0.305, 0);
    borderMesh.renderOrder = 901;
    this.menuItemsGroup.add(borderMesh);

    // 4 Column X positions
    const colXs = [-0.78, -0.26, 0.26, 0.78];
    const stages = this.getStagesCallback ? this.getStagesCallback() : [];
    const activeMod = this.getActiveModule ? this.getActiveModule() : 'solar';

    // ==========================================
    // COLUMN 1: MODULES
    // ==========================================
    this.createColumnHeader('1. MODULES', colXs[0], 0.25);
    this.createButton({
      id: 'mod_solar',
      label: '☀️ Solar System',
      colX: colXs[0],
      y: 0.14,
      isActive: activeMod === 'solar',
      onClick: () => this.onSwitchModule && this.onSwitchModule('solar')
    });
    this.createButton({
      id: 'mod_photosynthesis',
      label: '🌿 Plant Biology',
      colX: colXs[0],
      y: 0.02,
      isActive: activeMod === 'photosynthesis',
      onClick: () => this.onSwitchModule && this.onSwitchModule('photosynthesis')
    });
    this.createButton({
      id: 'mod_reproduction',
      label: '👶 Reproduction',
      colX: colXs[0],
      y: -0.10,
      isActive: activeMod === 'reproduction',
      onClick: () => this.onSwitchModule && this.onSwitchModule('reproduction')
    });

    // ==========================================
    // COLUMN 2: ANIMATION & CONTROLS
    // ==========================================
    const isTour = this.getIsTourPlaying ? this.getIsTourPlaying() : false;
    const isSpin = this.getIsModelSpinning ? this.getIsModelSpinning() : false;
    const isPause = this.getIsPaused ? this.getIsPaused() : false;

    this.createColumnHeader('2. CONTROLS', colXs[1], 0.25);
    this.createButton({
      id: 'btn_tour',
      label: isTour ? '🎬 Tour: [ON]' : '🎬 Tour: [OFF]',
      colX: colXs[1],
      y: 0.16,
      isActive: isTour,
      colorTheme: isTour ? '#22c55e' : '#38bdf8',
      onClick: () => {
        if (this.onToggleTour) this.onToggleTour();
        this.updateButtons();
      }
    });
    this.createButton({
      id: 'btn_spin',
      label: isSpin ? '🔄 Spin: [ON]' : '🔄 Spin: [OFF]',
      colX: colXs[1],
      y: 0.05,
      isActive: isSpin,
      colorTheme: isSpin ? '#f59e0b' : '#38bdf8',
      onClick: () => {
        if (this.onToggleModelSpin) this.onToggleModelSpin();
        this.updateButtons();
      }
    });
    this.createButton({
      id: 'btn_pause',
      label: isPause ? '▶ Resume' : '⏸ Pause',
      colX: colXs[1],
      y: -0.06,
      isActive: isPause,
      colorTheme: isPause ? '#ef4444' : '#38bdf8',
      onClick: () => {
        if (this.onTogglePause) this.onTogglePause();
        this.updateButtons();
      }
    });
    this.createButton({
      id: 'btn_recenter',
      label: '🎯 Recenter (H)',
      colX: colXs[1],
      y: -0.17,
      onClick: () => {
        if (this.onRecenterVR) this.onRecenterVR();
      }
    });

    // ==========================================
    // COLUMN 3: STAGES PART 1 (Stages 1 to 5)
    // ==========================================
    const currentIdx = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;
    const col3Title = activeMod === 'solar' ? '3. INNER BODIES' : '3. FIRST STAGES';
    this.createColumnHeader(col3Title, colXs[2], 0.25);

    const firstBatch = stages.slice(0, 5);
    const startY = 0.17;
    const stepY = 0.095;

    firstBatch.forEach((stage, idx) => {
      this.createButton({
        id: `stage_${idx}`,
        label: `${stage.icon || '📍'} ${stage.shortName || stage.name}`,
        colX: colXs[2],
        y: startY - idx * stepY,
        width: 0.44,
        height: 0.075,
        isActive: currentIdx === idx,
        colorTheme: stage.colorTheme || '#38bdf8',
        onClick: () => {
          if (this.onSelectStage) this.onSelectStage(idx);
          this.updateButtons();
        }
      });
    });

    // ==========================================
    // COLUMN 4: STAGES PART 2 (Stages 6 to 10)
    // ==========================================
    const col4Title = activeMod === 'solar' ? '4. OUTER BODIES' : '4. LATER STAGES';
    this.createColumnHeader(col4Title, colXs[3], 0.25);

    const secondBatch = stages.slice(5, 10);
    secondBatch.forEach((stage, relIdx) => {
      const actualIdx = 5 + relIdx;
      this.createButton({
        id: `stage_${actualIdx}`,
        label: `${stage.icon || '📍'} ${stage.shortName || stage.name}`,
        colX: colXs[3],
        y: startY - relIdx * stepY,
        width: 0.44,
        height: 0.075,
        isActive: currentIdx === actualIdx,
        colorTheme: stage.colorTheme || '#38bdf8',
        onClick: () => {
          if (this.onSelectStage) this.onSelectStage(actualIdx);
          this.updateButtons();
        }
      });
    });
  }

  createColumnHeader(text, colX, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 190, 24);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const geo = new THREE.PlaneGeometry(0.44, 0.055);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.005);
    mesh.renderOrder = 950;
    this.menuItemsGroup.add(mesh);
  }

  createButton({ id, label, colX, y, width = 0.44, height = 0.082, isActive = false, colorTheme = '#38bdf8', onClick }) {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    this.renderButtonCanvas(ctx, label, false, isActive, colorTheme);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.01);
    mesh.renderOrder = 980;
    mesh.userData = { id, isVRButton: true };

    this.menuItemsGroup.add(mesh);

    const btnObj = {
      id,
      label,
      mesh,
      canvas,
      ctx,
      texture,
      isActive,
      colorTheme,
      colX,
      y,
      width,
      height,
      onClick
    };

    this.buttons.push(btnObj);
    this.buttonMeshes.push(mesh);
  }

  renderButtonCanvas(ctx, label, isHovered, isActive, colorTheme = '#38bdf8') {
    ctx.clearRect(0, 0, 440, 80);

    // Background fill
    if (isHovered) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    } else if (isActive) {
      ctx.fillStyle = 'rgba(30, 58, 138, 0.70)';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.80)';
    }
    ctx.beginPath();
    ctx.roundRect(4, 4, 432, 72, [14]);
    ctx.fill();

    // Border glow
    ctx.lineWidth = isHovered ? 4 : (isActive ? 3 : 1.5);
    ctx.strokeStyle = isHovered ? '#ffffff' : (isActive ? colorTheme : 'rgba(148, 163, 184, 0.35)');
    ctx.stroke();

    // Label Text
    ctx.fillStyle = isHovered ? '#ffffff' : (isActive ? '#fef08a' : '#f8fafc');
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 220, 40);

    // Active Indicator Dot
    if (isActive) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(32, 40, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  updateButtons() {
    const stages = this.getStagesCallback ? this.getStagesCallback() : [];
    const activeMod = this.getActiveModule ? this.getActiveModule() : 'solar';
    const currentIdx = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;
    const isTour = this.getIsTourPlaying ? this.getIsTourPlaying() : false;
    const isSpin = this.getIsModelSpinning ? this.getIsModelSpinning() : false;
    const isPause = this.getIsPaused ? this.getIsPaused() : false;

    this.buttons.forEach(btn => {
      if (btn.id === 'mod_solar') btn.isActive = activeMod === 'solar';
      if (btn.id === 'mod_photosynthesis') btn.isActive = activeMod === 'photosynthesis';
      if (btn.id === 'mod_reproduction') btn.isActive = activeMod === 'reproduction';

      if (btn.id === 'btn_tour') {
        btn.isActive = isTour;
        btn.label = isTour ? '🎬 Tour: [ON]' : '🎬 Tour: [OFF]';
        btn.colorTheme = isTour ? '#22c55e' : '#38bdf8';
      }
      if (btn.id === 'btn_spin') {
        btn.isActive = isSpin;
        btn.label = isSpin ? '🔄 Spin: [ON]' : '🔄 Spin: [OFF]';
        btn.colorTheme = isSpin ? '#f59e0b' : '#38bdf8';
      }
      if (btn.id === 'btn_pause') {
        btn.isActive = isPause;
        btn.label = isPause ? '▶ Resume' : '⏸ Pause';
        btn.colorTheme = isPause ? '#ef4444' : '#38bdf8';
      }

      if (btn.id.startsWith('stage_')) {
        const idx = parseInt(btn.id.replace('stage_', ''), 10);
        btn.isActive = currentIdx === idx;
        if (stages[idx]) {
          btn.label = `${stages[idx].icon || '📍'} ${stages[idx].shortName || stages[idx].name}`;
        }
      }

      this.renderButtonCanvas(btn.ctx, btn.label, btn === this.hoveredButton, btn.isActive, btn.colorTheme);
      btn.texture.needsUpdate = true;
    });
  }

  /**
   * Handle mouse move from remote controller (controller.html)
   * @param {number} normX Normalized [0, 1] horizontal position
   * @param {number} normY Normalized [0, 1] vertical position
   */
  onRemoteMouseMove(normX, normY) {
    const nx = Math.max(0, Math.min(1, Number(normX) || 0));
    const ny = Math.max(0, Math.min(1, Number(normY) || 0));

    // Map normalized [0, 1] to panel local coordinates:
    // Panel width = 2.14m (X from -1.07 to +1.07)
    // Panel height = 0.62m (Y from +0.31 to -0.31)
    const x = (nx - 0.5) * 2.14;
    const y = (0.5 - ny) * 0.62;

    this.targetCursorX = x;
    this.targetCursorY = y;

    if (this.reticleGroup) {
      this.reticleGroup.visible = true;
    }

    // 2D Bounding Box Hit-Testing across all buttons
    let hitButton = null;
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const halfW = (btn.width || 0.44) * 0.5;
      const halfH = (btn.height || 0.082) * 0.5;
      if (
        x >= (btn.colX - halfW) &&
        x <= (btn.colX + halfW) &&
        y >= (btn.y - halfH) &&
        y <= (btn.y + halfH)
      ) {
        hitButton = btn;
        break;
      }
    }

    if (hitButton !== this.hoveredButton) {
      if (this.hoveredButton) {
        this.renderButtonCanvas(
          this.hoveredButton.ctx,
          this.hoveredButton.label,
          false,
          this.hoveredButton.isActive,
          this.hoveredButton.colorTheme
        );
        this.hoveredButton.texture.needsUpdate = true;
        this.hoveredButton.mesh.scale.set(1.0, 1.0, 1.0);
      }

      this.hoveredButton = hitButton;
      this.dwellTime = 0;
      this.updateDwellProgress(0);

      if (hitButton) {
        this.renderButtonCanvas(
          hitButton.ctx,
          hitButton.label,
          true,
          hitButton.isActive,
          hitButton.colorTheme
        );
        hitButton.texture.needsUpdate = true;
        hitButton.mesh.scale.set(1.06, 1.06, 1.0);
      }
    }
  }

  /**
   * Handle mouse click from remote controller (controller.html)
   */
  onRemoteMouseClick(normX, normY) {
    if (normX !== undefined && normY !== undefined) {
      this.onRemoteMouseMove(normX, normY);
    }
    if (this.hoveredButton) {
      this.triggerButton(this.hoveredButton);
    }
  }

  initInputListeners() {
    const trigger = () => {
      if (this.hoveredButton && this.hoveredButton.onClick) {
        this.triggerButton(this.hoveredButton);
      }
    };
    window.addEventListener('pointerdown', trigger);
    window.addEventListener('touchstart', trigger, { passive: true });
  }

  triggerButton(btn) {
    if (!btn || this.actionCooldown > 0) return;
    this.actionCooldown = 0.4; // 400ms cooldown to prevent bounce

    // Button trigger bounce animation
    btn.mesh.scale.set(0.92, 0.92, 1.0);
    setTimeout(() => {
      if (btn.mesh) btn.mesh.scale.set(1.0, 1.0, 1.0);
    }, 120);

    // Haptic feedback
    if (navigator.vibrate) {
      try { navigator.vibrate([40]); } catch (e) {}
    }

    if (btn.onClick) {
      btn.onClick();
    }

    this.dwellTime = 0;
    this.updateDwellProgress(0);
    this.updateButtons();
  }

  update(delta) {
    if (this.actionCooldown > 0) {
      this.actionCooldown = Math.max(0, this.actionCooldown - delta);
    }

    // Smoothly interpolate reticle position towards targetCursor
    if (this.reticleGroup && this.targetCursorX !== undefined && this.targetCursorY !== undefined) {
      this.reticleGroup.position.x += (this.targetCursorX - this.reticleGroup.position.x) * 0.4;
      this.reticleGroup.position.y += (this.targetCursorY - this.reticleGroup.position.y) * 0.4;
      this.reticleGroup.position.z = 0.04;
    }

    // Dwell Progress when hovering over a button
    if (this.hoveredButton) {
      this.dwellTime += delta;
      const progress = Math.min(this.dwellTime / this.requiredDwell, 1.0);
      this.updateDwellProgress(progress);

      if (progress >= 1.0) {
        this.triggerButton(this.hoveredButton);
      }
    } else {
      if (this.dwellTime > 0) {
        this.dwellTime = 0;
        this.updateDwellProgress(0);
      }
    }
  }

  setVisible(visible) {
    this.panelGroup.visible = visible;
  }
}
