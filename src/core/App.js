import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Lighting } from './Lighting.js';
import { AudioManager } from './AudioManager.js';

// Reproduction Models & Living Environment
import { SpermJourneyModel } from '../models/SpermJourneyModel.js';
import { OocyteModel } from '../models/OocyteModel.js';
import { AcrosomeFusionModel } from '../models/AcrosomeFusionModel.js';
import { FertilizationSyngamyModel } from '../models/FertilizationSyngamyModel.js';
import { BlastocystModel } from '../models/BlastocystModel.js';
import { ImplantationGastrulationModel } from '../models/ImplantationGastrulationModel.js';
import { EmbryoOrganogenesisModel } from '../models/EmbryoOrganogenesisModel.js';
import { FetalDevelopmentModel } from '../models/FetalDevelopmentModel.js';
import { FullTermChildModel } from '../models/FullTermChildModel.js';
import { LivingHumanBodyEnvironment } from '../models/LivingHumanBodyEnvironment.js';

// Photosynthesis Models & Living Environment
import { SunSpaceEarthModel } from '../models/SunSpaceEarthModel.js';
import { TreeCanopyModel } from '../models/TreeCanopyModel.js';
import { PlantGrowthModel } from '../models/PlantGrowthModel.js';
import { LeafModel } from '../models/LeafModel.js';
import { CellChloroplastModel } from '../models/CellChloroplastModel.js';
import { PhotosystemIIModel } from '../models/PhotosystemIIModel.js';
import { ThylakoidETCModel } from '../models/ThylakoidETCModel.js';
import { ATPSynthaseModel } from '../models/ATPSynthaseModel.js';
import { CalvinCycleModel } from '../models/CalvinCycleModel.js';
import { LivingPhotosynthesisEnvironment } from '../models/LivingPhotosynthesisEnvironment.js';

// Solar System Models & Living Deep Space Environment
import { SolarSystemModel } from '../models/SolarSystemModel.js';
import { LivingCosmicEnvironment } from '../models/LivingCosmicEnvironment.js';

// VR, UI & Interaction
import { WebXRManager } from '../vr/WebXRManager.js';
import { VRInfoCard } from '../ui/VRInfoCard.js';
import { VRRemoteBar } from '../vr/VRRemoteBar.js';
import { BillboardLabels } from '../ui/BillboardLabels.js';
import { NavigationController } from '../interaction/NavigationController.js';
import { TourController } from '../interaction/TourController.js';
import { HUD } from '../ui/HUD.js';
import { ScientificPanel } from '../ui/ScientificPanel.js';
import { RemoteRelayClient } from '../remote/RemoteRelayClient.js';
import { Gizmo3D } from '../interaction/Gizmo3D.js';

// Data
import { CONCEPTION_STAGES, CONCEPTION_SIMULATION_PARAMETERS } from '../data/conceptionStages.js';
import { PHOTOSYNTHESIS_STAGES, SIMULATION_PARAMETERS } from '../data/photosynthesisStages.js';
import { SOLAR_STAGES, SOLAR_SIMULATION_PARAMETERS } from '../data/solarSystemStages.js';
import { MODULE_REGISTRY } from '../data/moduleRegistry.js';

/**
 * Master Application Coordinator for "Science Explorer 3D"
 * Coordinates Solar System, Photosynthesis, and Reproduction modules
 * with real-time living 3D environments, particle streams, GLSL shaders,
 * dynamic target tracking, 3D floating labels, and remote controls.
 */
export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.activeModule = 'solar';
    this.simParams = { ...SOLAR_SIMULATION_PARAMETERS };

    // 1. Core Scene & Lighting
    this.sceneManager = new SceneManager(this.canvas);
    this.lighting = new Lighting(this.sceneManager.scene);
    this.audioManager = new AudioManager();

    // 2. Active 3D Environments & Stage Models
    this.stageModels = [];
    this.humanBodyEnvironment = null;
    this.cosmicEnvironment = null;
    this.photosynthesisEnvironment = null;
    this.solarSystemModel = null;

    // 3. 3D Floating Billboard Names & Labels
    this.billboardLabels = new BillboardLabels(this.sceneManager.scene);

    // 4. WebXR Manager
    this.webXRManager = new WebXRManager(
      this.sceneManager.renderer,
      this.sceneManager.scene,
      this.sceneManager.cameraRig,
      (isVR) => this.onVRSessionChange(isVR),
      () => {
        const targetPos = this.navigationController ? this.navigationController.getTargetWorldPosition() : null;
        const isDual = this.sceneManager.toggleDualScreenVR(targetPos);
        const btn = document.querySelector('#dualVRText');
        if (btn) btn.textContent = isDual ? 'EXIT VR' : 'DUAL SCREEN VR';
      }
    );

    // 5. Navigation Controller
    this.navigationController = new NavigationController(
      this.sceneManager.camera,
      this.sceneManager.cameraRig,
      this.canvas,
      () => this.webXRManager.getIsVR(),
      (stageIdx) => this.stageModels[stageIdx]
    );
    this.navigationController.onTransitionCompleteCallback = (stageIndex) => {
      if (this.sceneManager.isDualScreenVR) {
        this.sceneManager.recenterVR(this.navigationController.getTargetWorldPosition());
      }
    };

    // 6. Guided Cinematic Tour Controller
    this.tourController = new TourController(
      this.navigationController,
      this.audioManager,
      (stageIdx) => this.onStageChanged(stageIdx)
    );

    // 7. Spatial VR 3D Info Panel
    this.vrInfoCard = new VRInfoCard(this.sceneManager.scene);

    // 8. 2D HUD & Scientific Panel
    this.initUI();

    // 8b. 3D Blender-Style Colorful XYZ Rotation Gizmo
    this.gizmo3D = new Gizmo3D(this.sceneManager.scene, this.sceneManager.camera, this.canvas);
    this.navigationController.isGizmoActiveCallback = () => (
      this.gizmo3D &&
      this.gizmo3D.gizmoRoot &&
      this.gizmo3D.gizmoRoot.visible &&
      (this.gizmo3D.activeHoverAxis !== null || this.gizmo3D.isDragging)
    );

    // 9. In-VR Spatial Remote Window Manager with Free-Space Pointer & Object Hold Detection
    this.vrRemoteBar = new VRRemoteBar({
      scene: this.sceneManager.scene,
      camera: this.sceneManager.camera,
      cameraRig: this.sceneManager.cameraRig,
      gizmo3D: this.gizmo3D,
      audioManager: this.audioManager,
      getStageModelsCallback: () => this.stageModels,
      onSelectStage: (idx) => {
        this.tourController.stopTour();
        this.hud.setTourState(false);
        // Camera spinning should be OFF! Camera stops moving, only the object rotates & simulation runs
        this.navigationController.autoRotate360 = false;
        this.selectStage(idx);
        this.navigationController.startRotatingCurrentModel();
      },
      onToggleTour: () => {
        this.audioManager.init();
        this.audioManager.resume();
        const isPlaying = this.tourController.toggleTour();
        this.hud.setTourState(isPlaying);
        return isPlaying;
      },
      onStartTour: (fromStage = 0) => {
        this.audioManager.init();
        this.audioManager.resume();
        this.tourController.startTour(fromStage);
        this.hud.setTourState(true);
      },
      onStopTour: () => {
        this.tourController.stopTour();
        this.hud.setTourState(false);
      },
      onToggleModelSpin: () => {
        const nav = this.navigationController;
        if (nav.spinningModelIndex >= 0) {
          nav.stopRotatingModel();
        } else {
          nav.startRotatingCurrentModel();
        }
        nav.autoRotate360 = false;
      },
      onStartModelSpin: () => {
        this.navigationController.startRotatingCurrentModel();
        this.navigationController.autoRotate360 = false;
      },
      onTogglePause: () => {
        this.hud.togglePause();
      },
      onRecenterVR: () => {
        this.sceneManager.recenterVR(this.navigationController.getTargetWorldPosition());
      },
      onSwitchModule: (modId) => {
        this.hud.switchModule(modId);
      },
      getStagesCallback: () => this.navigationController.stages,
      getCurrentStageIndex: () => this.navigationController.currentStageIndex,
      getIsTourPlaying: () => this.tourController.isPlaying,
      getIsModelSpinning: () => (this.navigationController.spinningModelIndex >= 0),
      getIsPaused: () => (this.simParams.simSpeed === 0),
      getActiveModule: () => this.activeModule,
      sendRemoteMessage: (msg) => {
        if (this.remoteRelay) {
          this.remoteRelay.sendMessage(msg);
        }
      }
    });

    // 10. Remote Control WebSocket Relay
    this.initRemoteRelay();

    // 11. Global Keyboard Shortcuts
    this.initKeyboardShortcuts();

    // 12. Initialize with default module (Solar System)
    this.switchModule('solar');

    // Start Master Render Loop
    this.sceneManager.setAnimationLoop((timestamp, frame) => this.renderLoop(timestamp, frame));
  }

  initUI() {
    this.scientificPanel = new ScientificPanel(document.body);

    this.hud = new HUD({
      onStageSelect: (idx) => {
        this.tourController.stopTour();
        this.hud.setTourState(false);
        this.selectStage(idx);
      },
      onEnterVR: () => {
        this.audioManager.init();
        this.audioManager.resume();
        this.webXRManager.enterVR();
      },
      onToggleDualVR: () => {
        this.audioManager.init();
        this.audioManager.resume();
        const targetPos = this.navigationController.getTargetWorldPosition();
        const isDual = this.sceneManager.toggleDualScreenVR(targetPos);
        return isDual;
      },
      onToggleTour: () => {
        this.audioManager.init();
        this.audioManager.resume();
        const isPlaying = this.tourController.toggleTour();
        this.hud.setTourState(isPlaying);
      },
      onResetCamera: () => {
        this.tourController.stopTour();
        this.hud.setTourState(false);
        this.navigationController.setStage(0, true);
        this.onStageChanged(0);
      },
      onToggleScience: () => {
        this.scientificPanel.toggle();
      },
      onToggleAudio: () => {
        return this.audioManager.toggleMute();
      },
      onToggleLabels: (visible) => {
        this.billboardLabels.setVisible(visible);
      },
      onCameraSide: (side) => {
        this.navigationController.setCameraSideView(side);
      },
      onParamChange: (key, val) => {
        this.simParams[key] = val;
        if (key === 'autoRotate360') {
          this.navigationController.autoRotate360 = val;
        }
        if (this.remoteRelay) {
          this.remoteRelay.sendMessage({ type: 'params', params: this.simParams });
        }
      },
      onModuleSwitch: (moduleId) => {
        this.switchModule(moduleId);
      }
    });
  }

  /**
   * Switch between Solar System, Photosynthesis, and Reproduction modules
   */
  switchModule(moduleId) {
    const moduleConfig = MODULE_REGISTRY[moduleId];
    if (!moduleConfig) return;

    this.activeModule = moduleId;

    // 0. Detach active 3D Gizmo
    if (this.gizmo3D) {
      this.gizmo3D.detach();
    }

    // 1. Remove old stage models from scene
    this.stageModels.forEach(model => {
      if (model && model.group) {
        this.sceneManager.scene.remove(model.group);
      }
    });
    this.stageModels = [];

    // 2. Remove old background environments
    if (this.humanBodyEnvironment) {
      this.sceneManager.scene.remove(this.humanBodyEnvironment.group);
      this.humanBodyEnvironment = null;
    }
    if (this.cosmicEnvironment) {
      this.sceneManager.scene.remove(this.cosmicEnvironment.group);
      this.cosmicEnvironment = null;
    }
    if (this.photosynthesisEnvironment) {
      this.sceneManager.scene.remove(this.photosynthesisEnvironment.group);
      this.photosynthesisEnvironment = null;
    }
    if (this.solarSystemModel) {
      if (this.solarSystemModel.orbitTrails) {
        this.solarSystemModel.orbitTrails.forEach(trail => {
          this.sceneManager.scene.remove(trail);
        });
      }
      this.solarSystemModel.groups.forEach(g => {
        this.sceneManager.scene.remove(g.group);
      });
      this.solarSystemModel = null;
    }

    // 3. Set scene atmosphere environment
    this.sceneManager.setEnvironment(moduleConfig);

    // 4. Create new module's living environment and stage models
    let stages, params;
    if (moduleId === 'solar') {
      stages = SOLAR_STAGES;
      params = { ...SOLAR_SIMULATION_PARAMETERS };
      this.createSolarModule(stages);
    } else if (moduleId === 'photosynthesis') {
      stages = PHOTOSYNTHESIS_STAGES;
      params = { ...SIMULATION_PARAMETERS };
      this.createPhotosynthesisModule(stages);
    } else if (moduleId === 'reproduction') {
      stages = CONCEPTION_STAGES;
      params = { ...CONCEPTION_SIMULATION_PARAMETERS };
      this.createReproductionModule(stages);
    }

    this.simParams = params;

    // 5. Add new models to scene
    this.stageModels.forEach(model => {
      if (model && model.group) {
        this.sceneManager.scene.add(model.group);
      }
    });

    // 6. Update 3D Floating Billboard Labels
    this.billboardLabels.setStages(stages, (stageIdx) => this.stageModels[stageIdx]);

    // 7. Update lighting
    const stagePositions = stages.map(s => ({
      x: s.lookAt ? s.lookAt.x : (s.cameraPos ? s.cameraPos.x : 0),
      y: s.lookAt ? s.lookAt.y : 0,
      z: s.lookAt ? s.lookAt.z : 0
    }));
    this.lighting.setModule(moduleId, stagePositions);

    // 8. Update navigation & tour
    this.navigationController.setStages(stages, (stageIdx) => this.stageModels[stageIdx]);
    this.tourController.setStages(stages, moduleConfig.tourStepDuration);

    // 9. Update scientific panel
    this.scientificPanel.setStages(stages);

    // 10. Update VR info card with active module stages
    this.vrInfoCard.setStages(stages);
    this.vrInfoCard.updateCard(0);

    // 11. Stop any active tour
    this.tourController.stopTour();
    this.hud.setTourState(false);

    // 12. Rebuild 4 columns in VR Remote Bar for active module
    if (this.vrRemoteBar) {
      this.vrRemoteBar.selectedModule = moduleId;
      this.vrRemoteBar.selectedStageIndex = 0;
      this.vrRemoteBar.build4Columns();
    }

    console.log(`🔬 Switched to module: ${moduleConfig.name}`);
  }

  createSolarModule(stages) {
    // 1. Living Deep Space Milky Way & Starfield Environment
    this.cosmicEnvironment = new LivingCosmicEnvironment(this.sceneManager.scene);

    // 2. 3D Planetary Orbital Simulation Model
    this.solarSystemModel = new SolarSystemModel();
    this.stageModels = this.solarSystemModel.groups;

    // 3. Add planetary orbit trails to scene
    if (this.solarSystemModel.orbitTrails) {
      this.solarSystemModel.orbitTrails.forEach(trail => {
        this.sceneManager.scene.add(trail);
      });
    }
  }

  createPhotosynthesisModule(stages) {
    // 1. Living Biosphere Forest & Molecular Gas Environment
    this.photosynthesisEnvironment = new LivingPhotosynthesisEnvironment(this.sceneManager.scene);

    // 2. 9 Connected Photosynthetic Biological Models
    const modelClasses = [
      SunSpaceEarthModel,
      TreeCanopyModel,
      PlantGrowthModel,
      LeafModel,
      CellChloroplastModel,
      PhotosystemIIModel,
      ThylakoidETCModel,
      ATPSynthaseModel,
      CalvinCycleModel
    ];

    this.stageModels = stages.map((stage, idx) => {
      const ModelClass = modelClasses[idx];
      if (ModelClass) {
        const pos = stage.lookAt || stage.cameraPos;
        return new ModelClass({ x: pos.x, y: 0, z: 0 });
      }
      return null;
    }).filter(Boolean);
  }

  createReproductionModule(stages) {
    // 1. Living Human Body Vascular & Neural Environment
    this.humanBodyEnvironment = new LivingHumanBodyEnvironment(this.sceneManager.scene);

    // 2. 9 Connected Human Conception & Embryogenesis Models
    this.stageModels = [
      new SpermJourneyModel({ x: -120, y: 0, z: 0 }),
      new OocyteModel({ x: -75, y: 0, z: 0 }),
      new AcrosomeFusionModel({ x: -30, y: 0, z: 0 }),
      new FertilizationSyngamyModel({ x: 15, y: 0, z: 0 }),
      new BlastocystModel({ x: 60, y: 0, z: 0 }),
      new ImplantationGastrulationModel({ x: 105, y: 0, z: 0 }),
      new EmbryoOrganogenesisModel({ x: 150, y: 0, z: 0 }),
      new FetalDevelopmentModel({ x: 195, y: 0, z: 0 }),
      new FullTermChildModel({ x: 240, y: 0, z: 0 })
    ];
  }

  initRemoteRelay() {
    this.remoteRelay = new RemoteRelayClient({
      onMessage: (msg) => {
        if (msg.type === 'toggleMouse') {
          if (this.vrRemoteBar) {
            this.vrRemoteBar.toggleMouse(msg.enabled);
          }
        } else if (msg.type === 'remoteMouseMove') {
          if (this.vrRemoteBar && this.vrRemoteBar.isMouseEnabled) {
            this.vrRemoteBar.onRemoteMouseMove(msg.x, msg.y);
          }
        } else if (msg.type === 'remoteMouseClick') {
          if (this.vrRemoteBar && this.vrRemoteBar.isMouseEnabled) {
            this.vrRemoteBar.onRemoteMouseClick(msg.x, msg.y);
          }
        } else if (msg.type === 'drag') {
          if (this.gizmo3D && this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible && this.gizmo3D.activeHoverAxis) {
            this.gizmo3D.rotateOnAxis(this.gizmo3D.activeHoverAxis, msg.dx, msg.dy);
          } else {
            this.navigationController.applyRemoteInput(msg);
          }
        } else if (msg.type === 'pan' || msg.type === 'wheel' || msg.type === 'cameraSide' || msg.type === 'rotateModel' || msg.type === 'stopRotateModel') {
          this.navigationController.applyRemoteInput(msg);
        } else if (msg.type === 'teleport') {
          this.tourController.stopTour();
          this.hud.setTourState(false);
          this.selectStage(msg.stageIndex);
        } else if (msg.type === 'tour') {
          this.audioManager.init();
          this.audioManager.resume();
          const isPlaying = this.tourController.toggleTour();
          this.hud.setTourState(isPlaying);
        } else if (msg.type === 'reset') {
          this.tourController.stopTour();
          this.hud.setTourState(false);
          this.navigationController.setStage(0, true);
          this.onStageChanged(0);
        } else if (msg.type === 'setParam') {
          this.simParams[msg.key] = msg.value;
        } else if (msg.type === 'flipVR') {
          this.sceneManager.flipVR180();
        } else if (msg.type === 'recenterVR') {
          this.sceneManager.recenterVR(this.navigationController.getTargetWorldPosition());
        } else if (msg.type === 'switchModule') {
          this.hud.switchModule(msg.moduleId);
        } else if (msg.type === 'toggleVRBar') {
          if (this.vrRemoteBar) {
            this.vrRemoteBar.setVisible(!this.vrRemoteBar.panelGroup.visible);
          }
        }
      }
    });
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      this.audioManager.init();

      const stages = this.navigationController.stages;
      const maxKey = Math.min(stages.length, 9);

      // Number keys 1-9 to jump to stages
      if (e.key >= '1' && e.key <= String(maxKey)) {
        const stageIdx = parseInt(e.key, 10) - 1;
        this.tourController.stopTour();
        this.hud.setTourState(false);
        this.selectStage(stageIdx);
      } else if (e.key === '0' && stages.length >= 10) {
        // Key 0 = stage 10 (Pluto)
        this.tourController.stopTour();
        this.hud.setTourState(false);
        this.selectStage(9);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (this.vrRemoteBar) {
          const isEnabled = this.vrRemoteBar.toggleMouse();
          if (this.remoteRelay) {
            this.remoteRelay.sendMessage({ type: 'mouseState', enabled: isEnabled });
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const modules = ['solar', 'photosynthesis', 'reproduction'];
        const nextIdx = (modules.indexOf(this.activeModule) + 1) % modules.length;
        this.hud.switchModule(modules[nextIdx]);
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey) {
        // R = Start/Rotate the currently selected 3D model on its own axis
        this.navigationController.startRotatingCurrentModel();
      } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey) {
        // C = Turn OFF / Stop the 3D model rotation
        this.navigationController.stopRotatingModel();
      } else if (e.key.toLowerCase() === 'a') {
        // A = Toggle 10-stage animated visual tour with Stranger Things soundtrack
        const isPlaying = this.tourController.toggleTour();
        this.hud.setTourState(isPlaying);
      } else if (e.key.toLowerCase() === 'i') {
        // I = Flip VR 180° orientation
        this.sceneManager.flipVR180();
      } else if (e.key.toLowerCase() === 'v') {
        // V = Toggle 4-Column In-VR Remote Controller
        if (this.vrRemoteBar) {
          const vis = !this.vrRemoteBar.panelGroup.visible;
          this.vrRemoteBar.setVisible(vis);
        }
      } else if (e.key.toLowerCase() === 'm') {
        const isMuted = this.audioManager.toggleMute();
        const icon = document.querySelector('#audioIcon');
        if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
      } else if (e.key.toLowerCase() === 'n') {
        this.hud.toggleLabels();
      } else if (e.key.toLowerCase() === 'h') {
        this.hud.toggleHelpModal();
      } else if (e.key.toLowerCase() === 'f') {
        this.navigationController.setCameraSideView('front');
      } else if (e.key.toLowerCase() === 'b') {
        this.navigationController.setCameraSideView('back');
      } else if (e.key.toLowerCase() === 't' && !e.ctrlKey) {
        this.navigationController.setCameraSideView('top');
      } else if (e.key === '[') {
        const speeds = [0.5, 1.0, 2.0, 5.0];
        const curIdx = speeds.indexOf(this.simParams.simSpeed || 1.0);
        const prevSpeed = speeds[Math.max(0, curIdx - 1)];
        this.hud.container.querySelector(`.btn-speed[data-speed="${prevSpeed}"]`)?.click();
      } else if (e.key === ']') {
        const speeds = [0.5, 1.0, 2.0, 5.0];
        const curIdx = speeds.indexOf(this.simParams.simSpeed || 1.0);
        const nextSpeed = speeds[Math.min(speeds.length - 1, (curIdx === -1 ? 1 : curIdx) + 1)];
        this.hud.container.querySelector(`.btn-speed[data-speed="${nextSpeed}"]`)?.click();
      }
    });

    window.addEventListener('pointerdown', () => this.audioManager.init(), { once: true });
  }

  selectStage(stageIndex) {
    this.navigationController.autoRotate360 = false;
    this.navigationController.setStage(stageIndex, true);
    this.onStageChanged(stageIndex);
  }

  onStageChanged(stageIndex) {
    this.hud.setActiveStage(stageIndex);
    this.scientificPanel.showStage(stageIndex);
    this.vrInfoCard.updateCard(stageIndex);
    if (this.vrRemoteBar) {
      this.vrRemoteBar.updateButtons();
    }

    // Auto-recenter VR heading towards the active planet
    if (this.sceneManager.isDualScreenVR) {
      setTimeout(() => {
        this.sceneManager.recenterVR(this.navigationController.getTargetWorldPosition());
      }, 200);
    }

    if (this.remoteRelay) {
      const stages = this.navigationController.stages;
      this.remoteRelay.sendMessage({
        type: 'stageChanged',
        stageIndex: stageIndex,
        stage: stages[stageIndex]
      });
    }
  }

  onVRSessionChange(isVR) {
    console.log('[WebXR] Session state changed. In VR:', isVR);
    this.navigationController.setStage(this.navigationController.currentStageIndex, false);
    if (this.remoteRelay) {
      this.remoteRelay.sendMessage({ type: 'vrState', isVR });
    }
  }

  renderLoop(timestamp, frame) {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update navigation flight & 360° rotation & smooth arrow-key camera panning
    this.navigationController.update(delta);

    // 2. Update guided tour
    const simSpeed = this.simParams.simSpeed !== undefined ? this.simParams.simSpeed : 1.0;
    this.tourController.update(delta * simSpeed);

    // 2b. Update In-VR Spatial Remote Window Manager & Free-Space Mouse Pointer
    if (this.vrRemoteBar) {
      this.vrRemoteBar.update(delta);
    }

    // 2c. Update 3D Blender-Style Colorful XYZ Rotation Gizmo
    if (this.gizmo3D) {
      this.gizmo3D.update(delta);
    }

    // 3. Update lighting
    this.lighting.update(delta, this.simParams);

    // 4. Update module-specific living environments
    if (this.activeModule === 'solar' && this.cosmicEnvironment) {
      this.cosmicEnvironment.update(delta, this.simParams);
    } else if (this.activeModule === 'photosynthesis' && this.photosynthesisEnvironment) {
      this.photosynthesisEnvironment.update(delta, this.simParams);
    } else if (this.activeModule === 'reproduction' && this.humanBodyEnvironment) {
      this.humanBodyEnvironment.update(delta, this.simParams);
    }

    // 5. Update all stage models & celestial orbital revolutions
    this.stageModels.forEach(model => {
      if (model && model.update) {
        model.update(delta, this.simParams);
      }
    });

    // 5b. Spin the selected model on its own Y-axis (runs continuously, paused while using XYZ gizmo)
    const isGizmoActive = this.gizmo3D && this.gizmo3D.gizmoRoot && this.gizmo3D.gizmoRoot.visible;
    const spinIdx = this.navigationController.spinningModelIndex;
    if (!isGizmoActive && spinIdx >= 0 && spinIdx < this.stageModels.length) {
      const spinModel = this.stageModels[spinIdx];
      if (spinModel) {
        const grp = spinModel.inspectPivot || spinModel.group || (spinModel.isObject3D ? spinModel : null);
        if (grp) {
          grp.rotation.y += this.navigationController.modelSpinSpeed * delta;
        }
      }
    }

    // In Dual-Screen VR, keep heading locked on active model during continuous 360° orbit or tour
    if (this.sceneManager.isDualScreenVR && (this.navigationController.autoRotate360 || this.tourController.isPlaying)) {
      this.sceneManager.recenterVR(this.navigationController.getTargetWorldPosition());
    }

    // 6. Update 3D Billboard Labels positions to follow moving objects
    if (this.billboardLabels) {
      this.billboardLabels.update(this.sceneManager.camera);
    }

    // 7. Update 3D VR Info Card spatial position in VR/World space
    if (this.vrInfoCard) {
      const targetPos = this.navigationController.getTargetWorldPosition();
      this.vrInfoCard.updatePosition(targetPos, this.sceneManager.camera);
    }

    // 8. Update rhythmic audio
    if (this.activeModule === 'reproduction') {
      this.audioManager.updateHeartbeat(delta, this.navigationController.currentStageIndex, this.simParams.heartRateBPM);
    }

    // 8. Render WebGL / WebXR
    this.sceneManager.render();
  }
}
