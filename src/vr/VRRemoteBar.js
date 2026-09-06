import * as THREE from 'three';

/**
 * VR Remote Window Manager with Small Red Box & Popup Floating Window
 * 
 * Features:
 * 1. Clean, 100% empty free space in VR mode by default.
 * 2. Small Red Box [ 🔴 MENU ] fixed at top of user's field of view in VR.
 * 3. PC mouse from controller.html moves freely across the VR space.
 * 4. Clicking the Small Red Box opens a sleek floating window.
 * 5. Inside the window:
 *    - View 1: 3 Main Options (☀️ Solar System, 🌿 Plant Biology, 👶 Human Conception)
 *    - View 2: When an option is clicked, shows all sub-options of it (stages + controls + back button)
 * 6. User selects an option and clicks the [ ✕ ] close button on the window:
 *    - Window closes!
 *    - The selected function executes (camera flies smoothly towards the 3D model/planet with 360 inspection, or tour starts)!
 *    - The VR view returns to clean, unobstructed empty space with only the small red box at the top!
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
    getActiveModule,
    sendRemoteMessage
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
    this.sendRemoteMessage = sendRemoteMessage;

    // Window & View State
    this.isWindowOpen = false;
    this.currentView = 'main3'; // 'main3' or 'subOptions'
    this.selectedModule = (this.getActiveModule ? this.getActiveModule() : 'solar') || 'solar';
    this.selectedStageIndex = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;
    this.pendingAction = null; // { type: 'stage', index: number }

    this.buttons = [];
    this.hoveredButton = null;
    this.dwellTime = 0;
    this.requiredDwell = 0.95;
    this.actionCooldown = 0;

    // Mouse cursor coordinates in local VR UI space
    this.targetCursorX = 0;
    this.targetCursorY = 0;

    // Root UI container attached to camera
    // Placed 1.9m in front of camera, tilted 12° down towards eye line
    this.panelGroup = new THREE.Group();
    this.panelGroup.name = 'VR_Floating_Window_Root';
    this.panelGroup.position.set(0, 0, -1.9);
    this.panelGroup.rotation.set(0.18, 0, 0);
    this.camera.add(this.panelGroup);

    // 1. Small Red Box Container (visible when window is closed)
    this.redBoxGroup = new THREE.Group();
    this.redBoxGroup.name = 'VR_Small_Red_Box_Group';
    this.panelGroup.add(this.redBoxGroup);
    this.buildSmallRedBox();

    // 2. Floating Interactive Window Container (hidden until opened)
    this.windowGroup = new THREE.Group();
    this.windowGroup.name = 'VR_Floating_Window_Group';
    this.windowGroup.visible = false;
    this.panelGroup.add(this.windowGroup);

    // 3. Free Space Mouse Cursor Reticle
    this.createMouseReticle();

    // Physical tap / click listener on mobile screen
    this.initInputListeners();

    // Build initial state (window closed, red box active)
    this.rebuildActiveButtons();
    this.setVisible(true);
  }

  // =========================================================================
  // 1. SMALL RED BOX BUILDER
  // =========================================================================
  buildSmallRedBox() {
    while (this.redBoxGroup.children.length > 0) {
      const child = this.redBoxGroup.children[0];
      this.redBoxGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    this.renderRedBoxCanvas(ctx, false);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    // Width: 0.38m, Height: 0.11m, positioned at top center (Y = +0.72m)
    const geo = new THREE.PlaneGeometry(0.38, 0.11);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.redBoxMesh = new THREE.Mesh(geo, mat);
    this.redBoxMesh.position.set(0, 0.72, 0.02);
    this.redBoxMesh.renderOrder = 950;
    this.redBoxGroup.add(this.redBoxMesh);

    this.redBoxObj = {
      id: 'btn_open_menu',
      label: '3D MENU',
      mesh: this.redBoxMesh,
      canvas,
      ctx,
      texture,
      colX: 0,
      y: 0.72,
      width: 0.38,
      height: 0.11,
      onClick: () => this.openWindow()
    };
  }

  renderRedBoxCanvas(ctx, isHovered) {
    ctx.clearRect(0, 0, 380, 110);

    // Glowing rounded box
    ctx.fillStyle = isHovered ? 'rgba(239, 68, 68, 0.98)' : 'rgba(220, 38, 38, 0.90)';
    ctx.beginPath();
    ctx.roundRect(6, 6, 368, 98, [16]);
    ctx.fill();

    // Border
    ctx.lineWidth = isHovered ? 5 : 2.5;
    ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(254, 202, 202, 0.8)';
    ctx.stroke();

    // Red Box Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isHovered ? '▶ OPEN MENU' : '🔴 3D MENU', 190, 55);
  }

  // =========================================================================
  // 2. WINDOW LIFECYCLE (OPEN / CLOSE)
  // =========================================================================
  openWindow() {
    this.isWindowOpen = true;
    this.windowGroup.visible = true;
    this.redBoxGroup.visible = false;
    this.currentView = 'main3';
    this.selectedModule = (this.getActiveModule ? this.getActiveModule() : 'solar') || 'solar';
    this.selectedStageIndex = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;
    this.pendingAction = null;

    this.buildWindowContent();
    this.rebuildActiveButtons();

    if (this.sendRemoteMessage) {
      this.sendRemoteMessage({ type: 'menuWindowState', isOpen: true, view: this.currentView });
    }
  }

  closeWindowAndExecute() {
    this.isWindowOpen = false;
    this.windowGroup.visible = false;
    this.redBoxGroup.visible = true;

    // Execute the selected function / work!
    if (this.pendingAction) {
      if (this.pendingAction.type === 'stage') {
        const stageIdx = this.pendingAction.index;
        // If module changed, switch module first
        if (this.selectedModule && this.selectedModule !== this.getActiveModule()) {
          if (this.onSwitchModule) this.onSwitchModule(this.selectedModule);
        }
        if (this.onSelectStage) {
          this.onSelectStage(stageIdx);
        }
      } else if (this.pendingAction.type === 'tour') {
        if (this.onToggleTour) this.onToggleTour();
      } else if (this.pendingAction.type === 'spin') {
        if (this.onToggleModelSpin) this.onToggleModelSpin();
      } else if (this.pendingAction.type === 'pause') {
        if (this.onTogglePause) this.onTogglePause();
      } else if (this.pendingAction.type === 'recenter') {
        if (this.onRecenterVR) this.onRecenterVR();
      }
    } else if (this.selectedModule && this.selectedModule !== this.getActiveModule()) {
      if (this.onSwitchModule) this.onSwitchModule(this.selectedModule);
    }

    this.rebuildActiveButtons();

    if (this.sendRemoteMessage) {
      this.sendRemoteMessage({ type: 'menuWindowState', isOpen: false });
    }
  }

  // =========================================================================
  // 3. WINDOW CONTENT BUILDER (3 OPTIONS VS SUB-OPTIONS)
  // =========================================================================
  buildWindowContent() {
    // Clear previous window children
    while (this.windowGroup.children.length > 0) {
      const child = this.windowGroup.children[0];
      this.windowGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }

    // Large Window Backdrop (1.82m width x 1.28m height)
    const bgGeo = new THREE.PlaneGeometry(1.82, 1.28);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x070e24,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -0.01);
    bgMesh.renderOrder = 900;
    this.windowGroup.add(bgMesh);

    // Window cyber neon header border
    const topBorderGeo = new THREE.PlaneGeometry(1.82, 0.012);
    const topBorderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false });
    const topBorderMesh = new THREE.Mesh(topBorderGeo, topBorderMat);
    topBorderMesh.position.set(0, 0.635, 0);
    topBorderMesh.renderOrder = 901;
    this.windowGroup.add(topBorderMesh);

    // [ ✕ ] CLOSE BUTTON (Top-Right of Window: colX = +0.76m, Y = +0.52m)
    this.createWindowCloseButton(0.76, 0.52);

    if (this.currentView === 'main3') {
      this.buildMain3OptionsView();
    } else {
      this.buildSubOptionsView();
    }
  }

  createWindowCloseButton(colX, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    this.renderCloseButtonCanvas(ctx, false);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(0.16, 0.10);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.01);
    mesh.renderOrder = 980;
    this.windowGroup.add(mesh);

    this.closeBtnObj = {
      id: 'btn_window_close',
      label: '✕',
      mesh,
      canvas,
      ctx,
      texture,
      colX,
      y,
      width: 0.16,
      height: 0.10,
      onClick: () => this.closeWindowAndExecute()
    };
  }

  renderCloseButtonCanvas(ctx, isHovered) {
    ctx.clearRect(0, 0, 160, 100);

    ctx.fillStyle = isHovered ? 'rgba(239, 68, 68, 1.0)' : 'rgba(220, 38, 38, 0.85)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 152, 92, [14]);
    ctx.fill();

    ctx.lineWidth = isHovered ? 4 : 2;
    ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕ CLOSE', 80, 50);
  }

  // =========================================================================
  // 4. VIEW 1: THE THREE MAIN OPTIONS
  // =========================================================================
  buildMain3OptionsView() {
    this.windowButtons = [];

    // Window Header
    this.createWindowHeader('🚀 CHOOSE 3D EXPLORATION MODULE', 0, 0.52);

    // 3 Big Selectable Cards
    const cards = [
      {
        id: 'opt_solar',
        modId: 'solar',
        icon: '☀️',
        title: '1. SOLAR SYSTEM',
        subtitle: '10 Celestial Bodies, Planetary Orbits & Stranger Things Tour',
        y: 0.25,
        color: '#38bdf8'
      },
      {
        id: 'opt_photosynthesis',
        modId: 'photosynthesis',
        icon: '🌿',
        title: '2. PLANT BIOLOGY',
        subtitle: 'Leaf Anatomy, Chloroplast, ATP Synthase & Calvin Cycle',
        y: 0.01,
        color: '#22c55e'
      },
      {
        id: 'opt_reproduction',
        modId: 'reproduction',
        icon: '👶',
        title: '3. HUMAN REPRODUCTION',
        subtitle: 'Fertilization, Acrosome Fusion, Blastocyst & Embryogenesis',
        y: -0.23,
        color: '#f43f5e'
      }
    ];

    cards.forEach(card => {
      this.createMain3Card(card);
    });

    // Instructions footer
    this.createWindowFooter('💡 Click any module to view all options, then click [✕ CLOSE] to fly into that 3D world!');
  }

  createMain3Card(card) {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');

    const isSelected = (this.selectedModule === card.modId);
    this.renderMain3CardCanvas(ctx, card, false, isSelected);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(1.44, 0.20);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, card.y, 0.01);
    mesh.renderOrder = 970;
    this.windowGroup.add(mesh);

    const btnObj = {
      id: card.id,
      card,
      mesh,
      canvas,
      ctx,
      texture,
      colX: 0,
      y: card.y,
      width: 1.44,
      height: 0.20,
      onClick: () => {
        this.selectedModule = card.modId;
        this.currentView = 'subOptions';
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    };

    this.windowButtons.push(btnObj);
  }

  renderMain3CardCanvas(ctx, card, isHovered, isSelected) {
    ctx.clearRect(0, 0, 720, 110);

    // Background
    if (isHovered) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    } else if (isSelected) {
      ctx.fillStyle = 'rgba(30, 58, 138, 0.65)';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    }
    ctx.beginPath();
    ctx.roundRect(6, 6, 708, 98, [18]);
    ctx.fill();

    // Border
    ctx.lineWidth = isHovered ? 4 : (isSelected ? 3 : 1.5);
    ctx.strokeStyle = isHovered ? '#ffffff' : (isSelected ? card.color : 'rgba(148, 163, 184, 0.4)');
    ctx.stroke();

    // Icon & Title
    ctx.fillStyle = isHovered ? '#ffffff' : '#f8fafc';
    ctx.font = 'bold 30px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${card.icon}  ${card.title}`, 24, 40);

    // Subtitle
    ctx.fillStyle = isHovered ? '#fef08a' : '#94a3b8';
    ctx.font = '500 19px "Inter", sans-serif';
    ctx.fillText(card.subtitle, 24, 76);

    // Right Arrow indicator
    ctx.fillStyle = card.color;
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('OPEN OPTIONS ▶', 690, 55);
  }

  // =========================================================================
  // 5. VIEW 2: SUB-OPTIONS OF SELECTED MODULE
  // =========================================================================
  buildSubOptionsView() {
    this.windowButtons = [];

    const modTitles = {
      solar: '☀️ SOLAR SYSTEM — ALL OPTIONS',
      photosynthesis: '🌿 PLANT BIOLOGY — ALL OPTIONS',
      reproduction: '👶 HUMAN REPRODUCTION — ALL OPTIONS'
    };
    const titleText = modTitles[this.selectedModule] || '3D EXPLORATION OPTIONS';

    // Header title
    this.createWindowHeader(titleText, 0.05, 0.52);

    // [ ← BACK ] Button to return to 3 main options (colX = -0.68m, Y = +0.52m)
    this.createWindowBackButton(-0.68, 0.52);

    // Controls Row (Tour, Spin, Pause, Recenter)
    const isTour = this.getIsTourPlaying ? this.getIsTourPlaying() : false;
    const isSpin = this.getIsModelSpinning ? this.getIsModelSpinning() : false;
    const isPause = this.getIsPaused ? this.getIsPaused() : false;

    const ctrlRowY = 0.36;
    const ctrlWidth = 0.36;
    const ctrlHeight = 0.085;

    this.createSubOptionButton({
      id: 'sub_btn_tour',
      label: isTour ? '🎬 Tour: [ON]' : '🎬 Tour: [OFF]',
      colX: -0.56,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: isTour ? '#22c55e' : '#38bdf8',
      isActive: isTour,
      onClick: () => {
        this.pendingAction = { type: 'tour' };
        if (this.onToggleTour) this.onToggleTour();
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    this.createSubOptionButton({
      id: 'sub_btn_spin',
      label: isSpin ? '🔄 Spin: [ON]' : '🔄 Spin: [OFF]',
      colX: -0.19,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: isSpin ? '#f59e0b' : '#38bdf8',
      isActive: isSpin,
      onClick: () => {
        this.pendingAction = { type: 'spin' };
        if (this.onToggleModelSpin) this.onToggleModelSpin();
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    this.createSubOptionButton({
      id: 'sub_btn_pause',
      label: isPause ? '▶ Resume' : '⏸ Pause',
      colX: 0.19,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: isPause ? '#ef4444' : '#38bdf8',
      isActive: isPause,
      onClick: () => {
        this.pendingAction = { type: 'pause' };
        if (this.onTogglePause) this.onTogglePause();
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    this.createSubOptionButton({
      id: 'sub_btn_recenter',
      label: '🎯 Recenter (H)',
      colX: 0.56,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: '#38bdf8',
      isActive: false,
      onClick: () => {
        this.pendingAction = { type: 'recenter' };
        if (this.onRecenterVR) this.onRecenterVR();
      }
    });

    // 2 Rows of 5 Stage Buttons (10 stages total)
    const stages = this.getStagesCallback ? this.getStagesCallback() : [];
    const activeStageIdx = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;

    const row1Y = 0.16;
    const row2Y = -0.06;
    const stageColXs = [-0.64, -0.32, 0.0, 0.32, 0.64];
    const stageW = 0.30;
    const stageH = 0.16;

    // Row 1: Stages 0 to 4
    for (let i = 0; i < 5; i++) {
      const st = stages[i];
      if (!st) continue;
      const isCur = (this.selectedStageIndex === i);
      this.createStageCardButton({
        id: `sub_stage_${i}`,
        index: i,
        stage: st,
        colX: stageColXs[i],
        y: row1Y,
        width: stageW,
        height: stageH,
        isActive: isCur,
        onClick: () => {
          this.selectedStageIndex = i;
          this.pendingAction = { type: 'stage', index: i };
          this.buildWindowContent();
          this.rebuildActiveButtons();
        }
      });
    }

    // Row 2: Stages 5 to 9
    for (let i = 5; i < 10; i++) {
      const st = stages[i];
      if (!st) continue;
      const isCur = (this.selectedStageIndex === i);
      this.createStageCardButton({
        id: `sub_stage_${i}`,
        index: i,
        stage: st,
        colX: stageColXs[i - 5],
        y: row2Y,
        width: stageW,
        height: stageH,
        isActive: isCur,
        onClick: () => {
          this.selectedStageIndex = i;
          this.pendingAction = { type: 'stage', index: i };
          this.buildWindowContent();
          this.rebuildActiveButtons();
        }
      });
    }

    // Selected Target Banner at Bottom of Window
    const selStage = stages[this.selectedStageIndex];
    const selName = selStage ? `${selStage.icon || '📍'} ${selStage.name || 'Stage'}` : 'Current Target';
    this.createWindowFooter(`👉 Selected Target: [ ${selName} ] — Click [ ✕ CLOSE ] to fly towards it!`);
  }

  createWindowBackButton(colX, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 152, 92, [14]);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← BACK', 80, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(0.16, 0.10);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.01);
    mesh.renderOrder = 980;
    this.windowGroup.add(mesh);

    this.windowButtons.push({
      id: 'btn_window_back',
      label: '← BACK',
      mesh,
      canvas,
      ctx,
      texture,
      colX,
      y,
      width: 0.16,
      height: 0.10,
      onClick: () => {
        this.currentView = 'main3';
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });
  }

  createSubOptionButton({ id, label, colX, y, width, height, color, isActive, onClick }) {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 85;
    const ctx = canvas.getContext('2d');

    this.renderPillCanvas(ctx, label, false, isActive, color);

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
    this.windowGroup.add(mesh);

    this.windowButtons.push({
      id,
      label,
      mesh,
      canvas,
      ctx,
      texture,
      colX,
      y,
      width,
      height,
      color,
      isActive,
      onClick
    });
  }

  renderPillCanvas(ctx, label, isHovered, isActive, color = '#38bdf8') {
    ctx.clearRect(0, 0, 360, 85);

    if (isHovered) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.40)';
    } else if (isActive) {
      ctx.fillStyle = 'rgba(30, 58, 138, 0.70)';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    }
    ctx.beginPath();
    ctx.roundRect(4, 4, 352, 77, [14]);
    ctx.fill();

    ctx.lineWidth = isHovered ? 4 : (isActive ? 3 : 1.5);
    ctx.strokeStyle = isHovered ? '#ffffff' : (isActive ? color : 'rgba(148, 163, 184, 0.35)');
    ctx.stroke();

    ctx.fillStyle = isHovered ? '#ffffff' : (isActive ? '#fef08a' : '#f8fafc');
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 180, 42);
  }

  createStageCardButton({ id, index, stage, colX, y, width, height, isActive, onClick }) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    this.renderStageCardCanvas(ctx, stage, false, isActive);

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
    this.windowGroup.add(mesh);

    this.windowButtons.push({
      id,
      stage,
      index,
      mesh,
      canvas,
      ctx,
      texture,
      colX,
      y,
      width,
      height,
      isActive,
      onClick
    });
  }

  renderStageCardCanvas(ctx, stage, isHovered, isActive) {
    ctx.clearRect(0, 0, 300, 160);

    // Background
    if (isHovered) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    } else if (isActive) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.40)';
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    }
    ctx.beginPath();
    ctx.roundRect(4, 4, 292, 152, [16]);
    ctx.fill();

    // Border
    ctx.lineWidth = isHovered ? 4 : (isActive ? 3.5 : 1.5);
    ctx.strokeStyle = isHovered ? '#ffffff' : (isActive ? '#22c55e' : 'rgba(148, 163, 184, 0.35)');
    ctx.stroke();

    // Stage Icon (Large)
    ctx.font = '48px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stage.icon || '🪐', 150, 52);

    // Stage Name
    ctx.fillStyle = isHovered ? '#ffffff' : (isActive ? '#86efac' : '#f8fafc');
    ctx.font = 'bold 22px "Inter", sans-serif';
    const name = stage.shortName || stage.name || 'Stage';
    ctx.fillText(name, 150, 108);

    // Selection Badge
    if (isActive) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.fillText('SELECTED ✔', 150, 136);
    }
  }

  createWindowHeader(text, colX, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 320, 30);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(0.90, 0.08);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.005);
    mesh.renderOrder = 950;
    this.windowGroup.add(mesh);
  }

  createWindowFooter(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 450, 25);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(1.50, 0.08);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.48, 0.005);
    mesh.renderOrder = 950;
    this.windowGroup.add(mesh);
  }

  // =========================================================================
  // 6. ACTIVE BUTTONS REBUILDER (Hit-Testing Pool)
  // =========================================================================
  rebuildActiveButtons() {
    this.buttons = [];
    if (!this.isWindowOpen) {
      // Window is closed -> only the Small Red Box is active!
      if (this.redBoxObj) {
        this.buttons.push(this.redBoxObj);
      }
    } else {
      // Window is open -> close button is always active!
      if (this.closeBtnObj) {
        this.buttons.push(this.closeBtnObj);
      }
      // Plus whichever buttons are active in current view
      if (this.windowButtons) {
        this.buttons.push(...this.windowButtons);
      }
    }
  }

  // =========================================================================
  // 7. FREE-SPACE CIRCLE MOUSE POINTER
  // =========================================================================
  createMouseReticle() {
    this.reticleGroup = new THREE.Group();
    this.reticleGroup.name = 'VR_FreeSpace_Mouse_Pointer';
    this.reticleGroup.position.set(0, 0, 0.06);

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

  // =========================================================================
  // 8. REAL-TIME REMOTE MOUSE DRIVING
  // =========================================================================
  onRemoteMouseMove(normX, normY) {
    const nx = Math.max(0, Math.min(1, Number(normX) || 0));
    const ny = Math.max(0, Math.min(1, Number(normY) || 0));

    // Map normalized [0, 1] to full interactive VR space:
    // Width = 2.4m (X from -1.2 to +1.2)
    // Height = 1.8m (Y from +0.9 to -0.9)
    const x = (nx - 0.5) * 2.4;
    const y = (0.5 - ny) * 1.8;

    this.targetCursorX = x;
    this.targetCursorY = y;

    if (this.reticleGroup) {
      this.reticleGroup.visible = true;
    }

    // 2D Bounding Box Hit-Testing against active buttons
    let hitButton = null;
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const halfW = (btn.width || 0.4) * 0.5;
      const halfH = (btn.height || 0.1) * 0.5;
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
      // Unhover previous
      if (this.hoveredButton) {
        this.setButtonHoverVisual(this.hoveredButton, false);
      }

      this.hoveredButton = hitButton;
      this.dwellTime = 0;
      this.updateDwellProgress(0);

      // Hover new
      if (hitButton) {
        this.setButtonHoverVisual(hitButton, true);
      }
    }
  }

  setButtonHoverVisual(btn, isHovered) {
    if (!btn || !btn.mesh) return;

    if (btn.id === 'btn_open_menu') {
      this.renderRedBoxCanvas(btn.ctx, isHovered);
      btn.texture.needsUpdate = true;
      btn.mesh.scale.set(isHovered ? 1.08 : 1.0, isHovered ? 1.08 : 1.0, 1.0);
    } else if (btn.id === 'btn_window_close') {
      this.renderCloseButtonCanvas(btn.ctx, isHovered);
      btn.texture.needsUpdate = true;
      btn.mesh.scale.set(isHovered ? 1.08 : 1.0, isHovered ? 1.08 : 1.0, 1.0);
    } else if (btn.card) {
      const isSelected = (this.selectedModule === btn.card.modId);
      this.renderMain3CardCanvas(btn.ctx, btn.card, isHovered, isSelected);
      btn.texture.needsUpdate = true;
      btn.mesh.scale.set(isHovered ? 1.04 : 1.0, isHovered ? 1.04 : 1.0, 1.0);
    } else if (btn.stage) {
      this.renderStageCardCanvas(btn.ctx, btn.stage, isHovered, btn.isActive);
      btn.texture.needsUpdate = true;
      btn.mesh.scale.set(isHovered ? 1.06 : 1.0, isHovered ? 1.06 : 1.0, 1.0);
    } else if (btn.color) {
      this.renderPillCanvas(btn.ctx, btn.label, isHovered, btn.isActive, btn.color);
      btn.texture.needsUpdate = true;
      btn.mesh.scale.set(isHovered ? 1.06 : 1.0, isHovered ? 1.06 : 1.0, 1.0);
    }
  }

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
    this.actionCooldown = 0.35;

    btn.mesh.scale.set(0.92, 0.92, 1.0);
    setTimeout(() => {
      if (btn.mesh) btn.mesh.scale.set(1.0, 1.0, 1.0);
    }, 120);

    if (navigator.vibrate) {
      try { navigator.vibrate([40]); } catch (e) {}
    }

    if (btn.onClick) {
      btn.onClick();
    }

    this.dwellTime = 0;
    this.updateDwellProgress(0);
  }

  update(delta) {
    if (this.actionCooldown > 0) {
      this.actionCooldown = Math.max(0, this.actionCooldown - delta);
    }

    // Smoothly interpolate reticle position towards targetCursor
    if (this.reticleGroup && this.targetCursorX !== undefined && this.targetCursorY !== undefined) {
      this.reticleGroup.position.x += (this.targetCursorX - this.reticleGroup.position.x) * 0.4;
      this.reticleGroup.position.y += (this.targetCursorY - this.reticleGroup.position.y) * 0.4;
      this.reticleGroup.position.z = 0.05;
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

  // Compatibility helper
  updateButtons() {
    if (this.isWindowOpen) {
      this.buildWindowContent();
      this.rebuildActiveButtons();
    }
  }

  build4Columns() {
    this.updateButtons();
  }

  setVisible(visible) {
    this.panelGroup.visible = visible;
  }
}
