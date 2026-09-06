import * as THREE from 'three';

/**
 * 4-Column In-VR Spatial Remote Controller with Head-Controlled Circle Mouse Pointer
 * 
 * Features:
 * 1. Fixed at top of user's field of view in VR mode (always accessible by glancing up)
 * 2. Head-controlled circular gaze mouse pointer with visual dwell timer progress ring
 * 3. 4-Column Layout:
 *    - Col 1: 🌌 Module Switcher (Solar System, Plant Biology, Human Conception)
 *    - Col 2: 🎬 Animation & Simulation Controls (Tour ON/OFF, Model Spin ON/OFF, Pause/Resume, Recenter VR)
 *    - Col 3: 🪐 Target List Part 1 (Stages 1 - 5, e.g. Sun, Mercury, Venus, Earth, Mars)
 *    - Col 4: 🪐 Target List Part 2 (Stages 6 - 10, e.g. Jupiter, Saturn, Uranus, Neptune, Pluto)
 * 4. Selecting any body/stage smoothly flies the camera towards that 3D model with inspection view!
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

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 10;

    // Create Main Panel Container
    this.panelGroup = new THREE.Group();
    this.panelGroup.name = 'VR_Remote_Bar_4Columns';

    // Fixed at top of view in front of camera
    // Position: centered, Y=+0.68m up, Z=-2.1m forward, tilted downward 14° towards eye
    this.panelGroup.position.set(0, 0.68, -2.1);
    this.panelGroup.rotation.set(0.24, 0, 0);

    this.camera.add(this.panelGroup);

    // Create Circular Gaze Mouse Pointer
    this.createGazeReticle();

    // Build the 4 Columns
    this.build4Columns();

    // Physical tap / click listener for instant activation
    this.initInputListeners();

    this.setVisible(true);
  }

  createGazeReticle() {
    this.reticleGroup = new THREE.Group();
    this.reticleGroup.name = 'VR_Gaze_Circle_MousePointer';
    this.reticleGroup.position.set(0, 0, -1.8); // 1.8m in front of camera

    // 1. Center pointer dot
    const dotGeo = new THREE.RingGeometry(0, 0.008, 16);
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

    // 2. Outer circle pointer ring
    const ringGeo = new THREE.RingGeometry(0.018, 0.024, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.85
    });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.renderOrder = 9999;
    this.reticleGroup.add(this.targetRing);

    // 3. Dynamic Progress Dwell Ring
    this.dwellGeo = new THREE.RingGeometry(0.026, 0.034, 32, 1, 0, 0.001);
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

    this.camera.add(this.reticleGroup);
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
    this.dwellMesh.geometry = new THREE.RingGeometry(0.026, 0.034, 32, 1, 0, arc);
  }

  build4Columns() {
    // Clear any previous meshes
    while (this.panelGroup.children.length > 0) {
      const child = this.panelGroup.children[0];
      this.panelGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
    this.buttons = [];
    this.buttonMeshes = [];

    // Overall Backdrop Plane
    const bgGeo = new THREE.PlaneGeometry(2.14, 0.62);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x050b18,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -0.01);
    bgMesh.renderOrder = 900;
    this.panelGroup.add(bgMesh);

    // Decorative top neon border
    const borderGeo = new THREE.PlaneGeometry(2.14, 0.012);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0, 0.305, 0);
    borderMesh.renderOrder = 901;
    this.panelGroup.add(borderMesh);

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
    this.panelGroup.add(mesh);
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

    this.panelGroup.add(mesh);

    const btnObj = {
      id,
      label,
      mesh,
      canvas,
      ctx,
      texture,
      isActive,
      colorTheme,
      onClick
    };

    this.buttons.push(btnObj);
    this.buttonMeshes.push(mesh);
  }

  renderButtonCanvas(ctx, label, isHovered, isActive, colorTheme = '#38bdf8') {
    ctx.clearRect(0, 0, 440, 80);

    // Background fill
    if (isHovered) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    } else if (isActive) {
      ctx.fillStyle = 'rgba(30, 58, 138, 0.65)';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
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
    this.actionCooldown = 0.5; // 500ms cooldown to prevent double firing

    // Button trigger bounce
    btn.mesh.scale.set(0.94, 0.94, 1.0);
    setTimeout(() => {
      btn.mesh.scale.set(1.0, 1.0, 1.0);
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

    // Raycast from center of camera (forward vector)
    const origin = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1);
    this.camera.getWorldPosition(origin);
    forward.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));

    this.raycaster.set(origin, forward);
    const intersects = this.raycaster.intersectObjects(this.buttonMeshes, false);

    let hitButton = null;
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      hitButton = this.buttons.find(b => b.mesh === hitMesh) || null;
    }

    // Gaze Hover & Dwell Logic
    if (hitButton) {
      if (this.hoveredButton !== hitButton) {
        // Gaze entered new button
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
        this.renderButtonCanvas(
          hitButton.ctx,
          hitButton.label,
          true,
          hitButton.isActive,
          hitButton.colorTheme
        );
        hitButton.texture.needsUpdate = true;
        hitButton.mesh.scale.set(1.05, 1.05, 1.0);
      } else {
        // Continuous gaze on current button: advance dwell timer
        this.dwellTime += delta;
        const progress = Math.min(this.dwellTime / this.requiredDwell, 1.0);
        this.updateDwellProgress(progress);

        if (progress >= 1.0) {
          this.triggerButton(hitButton);
        }
      }
    } else {
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
        this.hoveredButton = null;
      }
      this.dwellTime = 0;
      this.updateDwellProgress(0);
    }
  }

  setVisible(visible) {
    this.panelGroup.visible = visible;
    if (this.reticleGroup) {
      this.reticleGroup.visible = visible;
    }
  }
}
