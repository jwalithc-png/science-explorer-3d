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
    gizmo3D,
    audioManager,
    getStageModelsCallback,
    onSelectStage,
    onToggleTour,
    onStartTour,
    onStopTour,
    onToggleModelSpin,
    onStartModelSpin,
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
    this.gizmo3D = gizmo3D;
    this.audioManager = audioManager;
    this.getStageModelsCallback = getStageModelsCallback;

    this.onSelectStage = onSelectStage;
    this.onToggleTour = onToggleTour;
    this.onStartTour = onStartTour;
    this.onStopTour = onStopTour;
    this.onToggleModelSpin = onToggleModelSpin;
    this.onStartModelSpin = onStartModelSpin;
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

    // Window & View State ('main3', 'subOptions', or 'objectPopup')
    this.isWindowOpen = false;
    this.currentView = 'main3';
    this.selectedModule = (this.getActiveModule ? this.getActiveModule() : 'solar') || 'solar';
    this.selectedStageIndex = this.getCurrentStageIndex ? this.getCurrentStageIndex() : 0;
    this.pendingAction = null; // { type: 'stage', index: number }
    this.audioPlayingStageIndex = null;

    // 3D Scene Direct Object Selection (Hold 5 seconds)
    this.sceneRaycaster = new THREE.Raycaster();
    this.hoveredObjectStageIndex = -1;
    this.objectHoldTimer = 0;
    this.currentNormX = 0.5;
    this.currentNormY = 0.5;

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

    // DOM Screen hold countdown & progress overlay
    this.createObjectHoldDOMOverlay();

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

  openObjectPopupWindow(stageIndex) {
    this.isWindowOpen = true;
    this.windowGroup.visible = true;
    this.redBoxGroup.visible = false;
    this.currentView = 'objectPopup';
    this.selectedStageIndex = stageIndex;
    this.pendingAction = { type: 'stage', index: stageIndex, moduleId: this.selectedModule };

    // Move camera to focus smoothly on this object
    if (this.onSelectStage) {
      this.onSelectStage(stageIndex);
    }

    this.buildWindowContent();
    this.rebuildActiveButtons();

    if (this.sendRemoteMessage) {
      this.sendRemoteMessage({ type: 'menuWindowState', isOpen: true, view: 'objectPopup', stageIndex });
    }
  }

  closeWindowAndExecute() {
    this.isWindowOpen = false;
    this.windowGroup.visible = false;
    this.redBoxGroup.visible = true;

    // If closing from objectPopup view, keep everything user activated running in clean VR!
    if (this.currentView === 'objectPopup') {
      this.pendingAction = null;
      this.rebuildActiveButtons();
      if (this.sendRemoteMessage) {
        this.sendRemoteMessage({ type: 'menuWindowState', isOpen: false });
      }
      return;
    }

    // Use pending action or fallback to selected stage
    const action = this.pendingAction || { type: 'stage', index: this.selectedStageIndex, moduleId: this.selectedModule };

    if (action.type === 'stage') {
      const stageIdx = (action.index !== undefined) ? action.index : this.selectedStageIndex;
      const targetMod = action.moduleId || this.selectedModule;
      if (targetMod && targetMod !== this.getActiveModule()) {
        if (this.onSwitchModule) this.onSwitchModule(targetMod);
      }
      if (this.onSelectStage) {
        this.onSelectStage(stageIdx);
      }
    } else if (action.type === 'tour') {
      const targetMod = this.selectedModule;
      if (targetMod && targetMod !== this.getActiveModule()) {
        if (this.onSwitchModule) this.onSwitchModule(targetMod);
      }
      if (this.onStartTour) {
        this.onStartTour(this.selectedStageIndex || 0);
      } else if (this.onToggleTour) {
        this.onToggleTour();
      }
    } else if (action.type === 'stopTour') {
      if (this.onStopTour) this.onStopTour();
      else if (this.onToggleTour) this.onToggleTour();
    } else if (action.type === 'spin') {
      if (this.onStartModelSpin) {
        this.onStartModelSpin();
      } else if (this.onToggleModelSpin) {
        this.onToggleModelSpin();
      }
    } else if (action.type === 'stopSpin') {
      if (this.onToggleModelSpin) this.onToggleModelSpin();
    } else if (action.type === 'pause') {
      if (this.onTogglePause) this.onTogglePause();
    } else if (action.type === 'recenter') {
      if (this.onRecenterVR) this.onRecenterVR();
    } else if (action.type === 'module') {
      if (this.onSwitchModule) this.onSwitchModule(action.moduleId);
      if (this.onSelectStage) this.onSelectStage(0);
    }

    this.pendingAction = null;
    this.rebuildActiveButtons();

    if (this.sendRemoteMessage) {
      this.sendRemoteMessage({ type: 'menuWindowState', isOpen: false });
    }
  }

  // =========================================================================
  // 3. WINDOW CONTENT BUILDER (MAIN 3 / SUB-OPTIONS / OBJECT POPUP)
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
    } else if (this.currentView === 'subOptions') {
      this.buildSubOptionsView();
    } else if (this.currentView === 'objectPopup') {
      this.buildObjectPopupWindow(this.selectedStageIndex);
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

    const isTourPending = this.pendingAction && this.pendingAction.type === 'tour';
    const isStopTourPending = this.pendingAction && this.pendingAction.type === 'stopTour';
    const tourEffective = isTourPending || (isTour && !isStopTourPending);

    const isSpinPending = this.pendingAction && this.pendingAction.type === 'spin';
    const isStopSpinPending = this.pendingAction && this.pendingAction.type === 'stopSpin';
    const spinEffective = isSpinPending || (isSpin && !isStopSpinPending);

    const ctrlRowY = 0.36;
    const ctrlWidth = 0.36;
    const ctrlHeight = 0.085;

    this.createSubOptionButton({
      id: 'sub_btn_tour',
      label: tourEffective ? '🎬 Tour: [ACTIVE ✔]' : '🎬 Tour: [OFF]',
      colX: -0.56,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: tourEffective ? '#22c55e' : '#38bdf8',
      isActive: tourEffective,
      onClick: () => {
        if (tourEffective) {
          this.pendingAction = { type: 'stopTour' };
        } else {
          this.pendingAction = { type: 'tour' };
        }
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    this.createSubOptionButton({
      id: 'sub_btn_spin',
      label: spinEffective ? '🔄 Spin: [ACTIVE ✔]' : '🔄 Spin: [OFF]',
      colX: -0.19,
      y: ctrlRowY,
      width: ctrlWidth,
      height: ctrlHeight,
      color: spinEffective ? '#f59e0b' : '#38bdf8',
      isActive: spinEffective,
      onClick: () => {
        if (spinEffective) {
          this.pendingAction = { type: 'stopSpin' };
        } else {
          this.pendingAction = { type: 'spin' };
        }
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
        this.buildWindowContent();
        this.rebuildActiveButtons();
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
          this.pendingAction = { type: 'stage', index: i, moduleId: this.selectedModule };
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
          this.pendingAction = { type: 'stage', index: i, moduleId: this.selectedModule };
          this.buildWindowContent();
          this.rebuildActiveButtons();
        }
      });
    }

    // Selected Target Banner at Bottom of Window
    let footerText = '👉 Click any option or stage, then click [ ✕ CLOSE ] to execute!';
    if (this.pendingAction) {
      if (this.pendingAction.type === 'stage') {
        const selStage = stages[this.pendingAction.index];
        const selName = selStage ? `${selStage.icon || '🪐'} ${selStage.shortName || selStage.name}` : `Stage ${this.pendingAction.index + 1}`;
        footerText = `👉 Target Selected: [ ${selName} ] — Click [ ✕ CLOSE ] to fly & inspect 360° until stopped!`;
      } else if (this.pendingAction.type === 'tour') {
        footerText = '👉 Selected: 🎬 Stranger Things Tour — Click [ ✕ CLOSE ] to play full tour!';
      } else if (this.pendingAction.type === 'stopTour') {
        footerText = '👉 Selected: 🛑 Stop Tour — Click [ ✕ CLOSE ] to stop tour!';
      } else if (this.pendingAction.type === 'spin') {
        footerText = '👉 Selected: 🔄 360° Model Spin — Click [ ✕ CLOSE ] to start continuous rotation!';
      } else if (this.pendingAction.type === 'stopSpin') {
        footerText = '👉 Selected: 🛑 Stop Spin — Click [ ✕ CLOSE ] to stop rotation!';
      } else if (this.pendingAction.type === 'pause') {
        footerText = '👉 Selected: ⏸ Toggle Pause/Resume — Click [ ✕ CLOSE ] to execute!';
      } else if (this.pendingAction.type === 'recenter') {
        footerText = '👉 Selected: 🎯 Recenter VR — Click [ ✕ CLOSE ] to align heading!';
      }
    } else {
      const selStage = stages[this.selectedStageIndex];
      const selName = selStage ? `${selStage.icon || '🪐'} ${selStage.shortName || selStage.name}` : 'Current Stage';
      footerText = `👉 Current: [ ${selName} ] — Click [ ✕ CLOSE ] to inspect 360° until stopped!`;
    }
    this.createWindowFooter(footerText);
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
  // 5B. VIEW 3: OBJECT DETAILS & 3D BLENDER AXES / ANIMATION POPUP WINDOW
  // =========================================================================
  buildObjectPopupWindow(stageIndex) {
    this.windowButtons = [];
    const stages = this.getStagesCallback ? this.getStagesCallback() : [];
    const stage = stages[stageIndex];
    if (!stage) return;

    // Window Header Title
    const headerTitle = `${stage.icon || '🪐'} ${stage.name.toUpperCase()}`;
    this.createWindowHeader(headerTitle, 0.05, 0.52);

    // [ ← BACK ] Button on top-left to return to all options
    this.createWindowBackButton(-0.68, 0.52);

    // 1. Stage Detail Scientific Info Card (Top Block: Y = +0.32)
    this.createStageDetailInfoCard(stage, 0, 0.32);

    // 2. Section 1: Single Option for 3D XYZ Rotation (Blender-Style Compact Gizmo)
    const isGizmoAttached = (this.gizmo3D && this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible);

    this.createSubOptionButton({
      id: 'obj_btn_axes_toggle',
      label: isGizmoAttached ? '🎮 3D XYZ Rotation: [ACTIVE ✔]' : '🎮 3D XYZ Rotation: [OFF]',
      colX: 0,
      y: 0.08,
      width: 1.48,
      height: 0.11,
      color: isGizmoAttached ? '#22c55e' : '#38bdf8',
      isActive: isGizmoAttached,
      onClick: () => {
        if (this.gizmo3D) {
          if (this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible) {
            this.gizmo3D.detach();
          } else {
            const models = this.getStageModelsCallback ? this.getStageModelsCallback() : [];
            const model = models[stageIndex];
            if (model) {
              this.gizmo3D.attach(model);
            }
          }
        }
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    // 3. Section 2: Play Animation + Voiceover + BGM (Stranger Things Soundtrack)
    const isAudioActive = (this.audioPlayingStageIndex === stageIndex);
    this.createSubOptionButton({
      id: 'obj_btn_anim_voice_bgm',
      label: isAudioActive ? '🎬 Animation + Voiceover + BGM: [PLAYING ✔]' : '🎬 Play Animation + Voiceover + BGM',
      colX: -0.22,
      y: -0.10,
      width: 1.02,
      height: 0.11,
      color: isAudioActive ? '#22c55e' : '#e11d48',
      isActive: isAudioActive,
      onClick: () => {
        this.audioPlayingStageIndex = stageIndex;
        if (this.audioManager) {
          this.audioManager.init();
          this.audioManager.resume();
          this.audioManager.playTourSoundtrack();
          const speechText = stage.narration || stage.description;
          this.audioManager.speakNarration(speechText);
        }
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    this.createSubOptionButton({
      id: 'obj_btn_stop_audio',
      label: '⏹ Stop Audio',
      colX: 0.54,
      y: -0.10,
      width: 0.42,
      height: 0.11,
      color: '#94a3b8',
      isActive: false,
      onClick: () => {
        this.audioPlayingStageIndex = null;
        if (this.audioManager) {
          this.audioManager.stopNarration();
          this.audioManager.stopTourSoundtrack();
        }
        this.buildWindowContent();
        this.rebuildActiveButtons();
      }
    });

    // Helpful Footer Instructions
    this.createWindowFooter('💡 Click [ ✕ CLOSE ] to interact in clean VR — axes & animation will keep running!');
  }

  createStageDetailInfoCard(stage, colX, y) {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    // Translucent dark container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 892, 132, [16]);
    ctx.fill();

    // Subtle neon border
    const themeColor = stage.colorTheme || '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = themeColor;
    ctx.stroke();

    // Subtitle / Classification
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(stage.subtitle || '3D Scientific Stage', 24, 16);

    // Description text (wrapped nicely)
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '500 18px "Inter", sans-serif';
    const desc = stage.description || '';
    const words = desc.split(' ');
    let line1 = '', line2 = '';
    for (const w of words) {
      if (line1.length < 75) {
        line1 += (line1 ? ' ' : '') + w;
      } else if (line2.length < 80) {
        line2 += (line2 ? ' ' : '') + w;
      }
    }
    if (line2.length >= 80) line2 += '...';
    ctx.fillText(line1, 24, 48);
    if (line2) ctx.fillText(line2, 24, 74);

    // Key fact bullet
    if (stage.keyPoints && stage.keyPoints[0]) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '600 17px "Inter", sans-serif';
      ctx.fillText(`• ${stage.keyPoints[0]}`, 24, 104);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(1.50, 0.23);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(colX, y, 0.008);
    mesh.renderOrder = 955;
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
  // 7. FREE-SPACE CIRCLE MOUSE POINTER & 5-SECOND OBJECT HOLD INDICATOR
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

    // 3. Dynamic Progress Dwell Ring for UI Buttons (green glow)
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

    // 4. 5-Second Direct Object Selection Hold Progress Ring (amber gold glow)
    this.objectHoldRingGeo = new THREE.RingGeometry(0.038, 0.048, 48, 1, 0, 0.001);
    this.objectHoldRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.objectHoldRingMesh = new THREE.Mesh(this.objectHoldRingGeo, this.objectHoldRingMat);
    this.objectHoldRingMesh.rotation.z = Math.PI * 0.5;
    this.objectHoldRingMesh.renderOrder = 10001;
    this.objectHoldRingMesh.visible = false;
    this.reticleGroup.add(this.objectHoldRingMesh);

    // 5. 5-Second Object Selection Hold Floating Badge
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 460;
    badgeCanvas.height = 100;
    this.badgeCtx = badgeCanvas.getContext('2d');
    this.badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    this.badgeTexture.minFilter = THREE.LinearFilter;
    const badgeMat = new THREE.SpriteMaterial({
      map: this.badgeTexture,
      depthTest: false,
      transparent: true,
      opacity: 0.96
    });
    this.objectHoldBadge = new THREE.Sprite(badgeMat);
    this.objectHoldBadge.position.set(0, 0.082, 0.01);
    this.objectHoldBadge.scale.set(0.40, 0.09, 1);
    this.objectHoldBadge.renderOrder = 10002;
    this.objectHoldBadge.visible = false;
    this.reticleGroup.add(this.objectHoldBadge);

    // 6. Blender Axis Rotation Cursor Badge
    const gizmoBadgeCanvas = document.createElement('canvas');
    gizmoBadgeCanvas.width = 440;
    gizmoBadgeCanvas.height = 90;
    this.gizmoBadgeCtx = gizmoBadgeCanvas.getContext('2d');
    this.gizmoBadgeTexture = new THREE.CanvasTexture(gizmoBadgeCanvas);
    this.gizmoBadgeTexture.minFilter = THREE.LinearFilter;
    const gizmoBadgeMat = new THREE.SpriteMaterial({
      map: this.gizmoBadgeTexture,
      depthTest: false,
      transparent: true,
      opacity: 0.96
    });
    this.gizmoReticleBadge = new THREE.Sprite(gizmoBadgeMat);
    this.gizmoReticleBadge.position.set(0, -0.068, 0.01);
    this.gizmoReticleBadge.scale.set(0.38, 0.078, 1);
    this.gizmoReticleBadge.renderOrder = 10003;
    this.gizmoReticleBadge.visible = false;
    this.reticleGroup.add(this.gizmoReticleBadge);

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

  createObjectHoldDOMOverlay() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('vr-object-hold-overlay')) return;

    const div = document.createElement('div');
    div.id = 'vr-object-hold-overlay';
    div.style.cssText = `
      position: fixed;
      bottom: 82px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.94);
      border: 2px solid #f59e0b;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.55), inset 0 0 15px rgba(245, 158, 11, 0.2);
      border-radius: 18px;
      padding: 12px 28px;
      color: #ffffff;
      font-family: 'Inter', -apple-system, sans-serif;
      display: none;
      z-index: 99999;
      pointer-events: none;
      text-align: center;
      min-width: 320px;
      backdrop-filter: blur(10px);
    `;
    div.innerHTML = `
      <div id="hold-overlay-title" style="font-size: 17px; font-weight: 800; color: #fef08a; margin-bottom: 4px;">🪐 3D Object</div>
      <div id="hold-overlay-sub" style="font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px;">Hold pointer: 0.0s / 5.0s (or Click to Open)</div>
      <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.16); border-radius: 4px; overflow: hidden;">
        <div id="hold-overlay-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 4px; transition: width 0.06s linear;"></div>
      </div>
    `;
    document.body.appendChild(div);
    this.domHoldOverlay = div;
    this.domHoldTitle = div.querySelector('#hold-overlay-title');
    this.domHoldSub = div.querySelector('#hold-overlay-sub');
    this.domHoldBar = div.querySelector('#hold-overlay-bar');
  }

  updateObjectHoldVisual(stage, progress, seconds) {
    if (this.reticleGroup) this.reticleGroup.visible = true;

    // 1. 3D In-VR Reticle Ring & Badge
    if (this.objectHoldRingMesh && this.objectHoldBadge) {
      this.objectHoldRingMesh.visible = true;
      this.objectHoldBadge.visible = true;

      const arc = Math.max(0.001, Math.min(progress * Math.PI * 2, Math.PI * 2));
      this.objectHoldRingMesh.geometry.dispose();
      this.objectHoldRingMesh.geometry = new THREE.RingGeometry(0.038, 0.048, 48, 1, 0, arc);

      const ctx = this.badgeCtx;
      ctx.clearRect(0, 0, 460, 100);

      // Dark sleek container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.roundRect(4, 4, 452, 92, [18]);
      ctx.fill();

      // Amber border
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Stage Name
      const name = stage ? `${stage.icon || '🪐'} ${stage.shortName || stage.name}` : '3D Object';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 18, 32);

      // Countdown
      const remaining = Math.max(0, 5.0 - seconds).toFixed(1);
      ctx.fillStyle = '#fef08a';
      ctx.font = '600 20px "Inter", sans-serif';
      ctx.fillText(`Hold: ${seconds.toFixed(1)}s / 5.0s (Pop in ${remaining}s)`, 18, 66);

      // Mini progress bar in badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.roundRect(300, 58, 140, 14, [7]);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(300, 58, Math.max(8, 140 * progress), 14, [7]);
      ctx.fill();

      this.badgeTexture.needsUpdate = true;
    }

    // 2. On-screen 2D DOM Overlay for Desktop & Mobile view
    if (this.domHoldOverlay) {
      this.domHoldOverlay.style.display = 'block';
      if (this.domHoldTitle) {
        this.domHoldTitle.textContent = stage ? `${stage.icon || '🪐'} ${stage.name}` : '3D Object';
      }
      if (this.domHoldSub) {
        const rem = Math.max(0, 5.0 - seconds).toFixed(1);
        this.domHoldSub.textContent = `🎯 Hold: ${seconds.toFixed(1)}s / 5.0s (Opening in ${rem}s — or Click to Open)`;
      }
      if (this.domHoldBar) {
        this.domHoldBar.style.width = `${Math.min(100, progress * 100)}%`;
      }
    }
  }

  hideObjectHoldVisual() {
    if (this.objectHoldRingMesh) this.objectHoldRingMesh.visible = false;
    if (this.objectHoldBadge) this.objectHoldBadge.visible = false;
    if (this.domHoldOverlay) {
      this.domHoldOverlay.style.display = 'none';
    }
  }

  updateGizmoReticleBadge(axis) {
    if (!this.gizmoReticleBadge || !this.gizmoBadgeCtx) return;
    this.gizmoReticleBadge.visible = true;

    const ctx = this.gizmoBadgeCtx;
    ctx.clearRect(0, 0, 440, 90);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 432, 82, [18]);
    ctx.fill();

    const colors = { X: '#ef4444', Y: '#10b981', Z: '#3b82f6' };
    const names = { X: '🔴 X Axis (Pitch)', Y: '🟢 Y Axis (Yaw)', Z: '🔵 Z Axis (Roll)' };
    const color = colors[axis] || '#facc15';

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(names[axis] || `${axis} Axis`, 220, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 18px "Inter", sans-serif';
    ctx.fillText('Move / drag along line to rotate', 220, 62);

    this.gizmoBadgeTexture.needsUpdate = true;
  }

  hideGizmoReticleBadge() {
    if (this.gizmoReticleBadge) {
      this.gizmoReticleBadge.visible = false;
    }
  }

  // =========================================================================
  // 8. 3D SCENE OBJECT RAYCASTING & 5-SECOND HOLD DETECTION
  // =========================================================================
  checkObjectHover(delta) {
    if (this.isWindowOpen) {
      if (this.objectHoldTimer > 0) {
        this.objectHoldTimer = 0;
        this.hoveredObjectStageIndex = -1;
        this.hideObjectHoldVisual();
      }
      return;
    }

    // Only suppress hold detection if actively dragging/hovering on an XYZ gizmo axis line
    if (this.gizmo3D && this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible && this.gizmo3D.activeHoverAxis) {
      if (this.objectHoldTimer > 0) {
        this.objectHoldTimer = 0;
        this.hoveredObjectStageIndex = -1;
        this.hideObjectHoldVisual();
      }
      return;
    }

    const nx = this.currentNormX !== undefined ? this.currentNormX : 0.5;
    const ny = this.currentNormY !== undefined ? this.currentNormY : 0.5;
    const ndcX = nx * 2 - 1;
    const ndcY = -(ny * 2 - 1);

    // Update camera matrix world for accurate ray origin and direction
    this.camera.updateMatrixWorld(true);
    this.sceneRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    const stages = this.getStagesCallback ? this.getStagesCallback() : [];
    const stageModels = this.getStageModelsCallback ? this.getStageModelsCallback() : [];
    if (!stages || stages.length === 0) return;

    let hitStageIdx = -1;
    let bestDist = Infinity;

    // Accurate WORLD camera position (not local 0,0,0 inside cameraRig)
    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);
    const worldPos = new THREE.Vector3();

    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      const model = stageModels[i];
      if (!st) continue;

      worldPos.set(0, 0, 0);
      let targetObj = null;

      if (model) {
        if (model.group && model.group.getWorldPosition) {
          model.group.updateMatrixWorld(true);
          model.group.getWorldPosition(worldPos);
          targetObj = model.group;
        } else if (model.getWorldPosition) {
          model.updateMatrixWorld && model.updateMatrixWorld(true);
          model.getWorldPosition(worldPos);
          targetObj = model;
        } else if (model.isObject3D) {
          model.updateMatrixWorld(true);
          model.getWorldPosition(worldPos);
          targetObj = model;
        }
      }
      if (worldPos.lengthSq() < 0.001 && st.lookAt) {
        worldPos.set(st.lookAt.x, st.lookAt.y || 0, st.lookAt.z || 0);
      }

      // Check if in front of camera
      const toObj = worldPos.clone().sub(camPos);
      const distToCam = toObj.length();
      if (distToCam < 0.01) continue;

      const toObjNorm = toObj.clone().normalize();
      const fwdDot = this.sceneRaycaster.ray.direction.dot(toObjNorm);
      if (fwdDot <= 0.05) continue; // Behind camera or outside visible field of view

      let isHit = false;

      // 1. Direct Three.js Mesh Raycast intersection test
      if (targetObj) {
        const hits = this.sceneRaycaster.intersectObject(targetObj, true);
        if (hits && hits.length > 0) {
          isHit = true;
        }
      }

      // 2. Proximity Cone Hit Test (for easy targeting even on smaller bodies or from afar)
      if (!isHit) {
        const distToRay = this.sceneRaycaster.ray.distanceToPoint(worldPos);
        const r = st.radius || (st.data && st.data.radius) || 2.0;
        const hitThreshold = Math.max(3.8, r * 2.8, distToCam * 0.095);
        if (distToRay < hitThreshold) {
          isHit = true;
        }
      }

      if (isHit && distToCam < bestDist) {
        bestDist = distToCam;
        hitStageIdx = i;
      }
    }

    if (hitStageIdx !== -1) {
      if (this.hoveredObjectStageIndex === hitStageIdx) {
        this.objectHoldTimer += delta;
      } else {
        this.hoveredObjectStageIndex = hitStageIdx;
        this.objectHoldTimer = 0.02;
      }

      const stage = stages[hitStageIdx];
      const holdProgress = Math.min(this.objectHoldTimer / 5.0, 1.0);
      this.updateObjectHoldVisual(stage, holdProgress, this.objectHoldTimer);

      if (this.objectHoldTimer >= 5.0) {
        this.objectHoldTimer = 0;
        this.hoveredObjectStageIndex = -1;
        this.hideObjectHoldVisual();
        if (navigator.vibrate) {
          try { navigator.vibrate([60, 40, 60]); } catch (e) {}
        }
        this.openObjectPopupWindow(hitStageIdx);
      }
    } else {
      if (this.objectHoldTimer > 0 || this.hoveredObjectStageIndex !== -1) {
        this.objectHoldTimer = 0;
        this.hoveredObjectStageIndex = -1;
        this.hideObjectHoldVisual();
      }
    }
  }

  // =========================================================================
  // 9. REAL-TIME REMOTE MOUSE DRIVING
  // =========================================================================
  onRemoteMouseMove(normX, normY) {
    const nx = Math.max(0, Math.min(1, Number(normX) || 0));
    const ny = Math.max(0, Math.min(1, Number(normY) || 0));

    const prevX = (this.lastNormX !== undefined) ? this.lastNormX : nx;
    const prevY = (this.lastNormY !== undefined) ? this.lastNormY : ny;
    const deltaX = (nx - prevX) * 140;
    const deltaY = (ny - prevY) * 140;
    this.lastNormX = nx;
    this.lastNormY = ny;

    this.currentNormX = nx;
    this.currentNormY = ny;

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

    if (hitButton) {
      if (this.objectHoldTimer > 0 || this.hoveredObjectStageIndex !== -1) {
        this.objectHoldTimer = 0;
        this.hoveredObjectStageIndex = -1;
        this.hideObjectHoldVisual();
      }
      this.hideGizmoReticleBadge();
      if (this.gizmo3D) this.gizmo3D.clearHover();
    } else {
      // Free VR space: Check 3D Gizmo axis collision first
      if (this.gizmo3D && this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible) {
        const ndcX = nx * 2 - 1;
        const ndcY = -(ny * 2 - 1);
        this.sceneRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
        const hoveredAxis = this.gizmo3D.checkRay(this.sceneRaycaster);

        if (hoveredAxis) {
          // Hovering over colored direction line / ring
          this.updateGizmoReticleBadge(hoveredAxis);

          // Clear 5-second object hold so it doesn't pop up over the gizmo
          if (this.objectHoldTimer > 0 || this.hoveredObjectStageIndex !== -1) {
            this.objectHoldTimer = 0;
            this.hoveredObjectStageIndex = -1;
            this.hideObjectHoldVisual();
          }

          // Move along the axis line direction rotates the object!
          if (Math.hypot(deltaX, deltaY) > 0.04) {
            this.gizmo3D.rotateOnAxis(hoveredAxis, deltaX, deltaY);
          }
        } else {
          this.hideGizmoReticleBadge();
        }
      } else {
        this.hideGizmoReticleBadge();
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
    } else if (!this.isWindowOpen && this.hoveredObjectStageIndex !== -1) {
      const targetIdx = this.hoveredObjectStageIndex;
      this.objectHoldTimer = 0;
      this.hoveredObjectStageIndex = -1;
      this.hideObjectHoldVisual();
      if (navigator.vibrate) {
        try { navigator.vibrate([60, 40, 60]); } catch (e) {}
      }
      this.openObjectPopupWindow(targetIdx);
    }
  }

  initInputListeners() {
    if (typeof window === 'undefined') return;

    const onMove = (clientX, clientY) => {
      if (!window.innerWidth || !window.innerHeight) return;
      const nx = clientX / window.innerWidth;
      const ny = clientY / window.innerHeight;
      this.onRemoteMouseMove(nx, ny);
    };

    window.addEventListener('pointermove', (e) => {
      onMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    const trigger = (e) => {
      if (e && e.clientX !== undefined && e.clientY !== undefined && window.innerWidth && window.innerHeight) {
        const nx = e.clientX / window.innerWidth;
        const ny = e.clientY / window.innerHeight;
        this.onRemoteMouseClick(nx, ny);
      } else {
        this.onRemoteMouseClick();
      }
    };

    window.addEventListener('pointerdown', trigger);
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        trigger(e.touches[0]);
      } else {
        trigger();
      }
    }, { passive: true });
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

      // Check 3D scene direct object selection hold when free space is hovered
      if (!this.isWindowOpen) {
        this.checkObjectHover(delta);
      } else {
        if (this.objectHoldTimer > 0 || this.hoveredObjectStageIndex !== -1) {
          this.objectHoldTimer = 0;
          this.hoveredObjectStageIndex = -1;
          this.hideObjectHoldVisual();
        }
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
