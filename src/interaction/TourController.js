import * as THREE from 'three';
import { CONCEPTION_STAGES } from '../data/conceptionStages.js';

/**
 * Guided Cinematic Animation Tour Controller
 * Swoops the camera smoothly through all stages in sequence,
 * synchronizing scientific voice narration, acoustics, and stage cues.
 * Features comprehensive multi-angle 360° inspection of each entity:
 * - High-angle polar overhead views (top)
 * - Dramatic low-angle underside views (bottom)
 * - Continuous 360° horizontal panoramic orbit (sides)
 * - Dynamic macro zoom breathing (close-up details to wide vista)
 */
export class TourController {
  constructor(navController, audioManager, onStageChangeCallback, getStageModelsCallback = null) {
    this.navController = navController;
    this.audioManager = audioManager;
    this.onStageChangeCallback = onStageChangeCallback;
    this.getStageModelsCallback = getStageModelsCallback;

    this.stages = CONCEPTION_STAGES;
    this.stageDuration = 13.0; // Seconds per stage inspection
    this.isPlaying = false;
    this.currentStep = 0;
    this.inspectionTime = 0;
    this.inspectionInitialized = false;
    this.initialRotations = new Map();
  }

  /**
   * Switch active stages array and inspection duration
   */
  setStages(stagesArray, stepDuration = 13.0) {
    this.stages = stagesArray;
    this.stageDuration = stepDuration || 13.0;
    this.stopTour();
  }

  getModel(stageIndex) {
    if (!this.getStageModelsCallback) return null;
    const models = this.getStageModelsCallback();
    return (models && models[stageIndex]) ? models[stageIndex] : null;
  }

  getModelPivot(stageIndex) {
    const model = this.getModel(stageIndex);
    if (!model) return null;
    return model.inspectPivot || model.group || (model.isObject3D ? model : null);
  }

  saveModelRotation(stageIndex) {
    const pivot = this.getModelPivot(stageIndex);
    if (pivot && !this.initialRotations.has(stageIndex)) {
      this.initialRotations.set(stageIndex, {
        x: pivot.rotation.x,
        y: pivot.rotation.y,
        z: pivot.rotation.z
      });
    }
  }

  resetModelRotation(stageIndex) {
    const pivot = this.getModelPivot(stageIndex);
    if (pivot && this.initialRotations.has(stageIndex)) {
      const init = this.initialRotations.get(stageIndex);
      pivot.rotation.x = init.x;
      pivot.rotation.z = init.z;
    } else if (pivot) {
      pivot.rotation.x = 0;
      pivot.rotation.z = 0;
    }
  }

  toggleTour() {
    if (this.isPlaying) {
      this.stopTour();
    } else {
      const currentIdx = (this.navController && this.navController.currentStageIndex !== undefined)
        ? this.navController.currentStageIndex
        : 0;
      this.startTour(currentIdx);
    }
    return this.isPlaying;
  }

  startTour(fromStage = 0) {
    this.isPlaying = true;
    this.currentStep = fromStage;
    this.inspectionTime = 0;
    this.inspectionInitialized = false;
    if (this.audioManager) {
      this.audioManager.playTourSoundtrack();
    }
    this.executeStage(this.currentStep);
  }

  stopTour() {
    this.isPlaying = false;
    this.resetModelRotation(this.currentStep);
    this.inspectionTime = 0;
    this.inspectionInitialized = false;
    if (this.audioManager) {
      this.audioManager.stopNarration();
      this.audioManager.stopTourSoundtrack();
    }
  }

  executeStage(stageIndex) {
    if (stageIndex >= this.stages.length) {
      this.stopTour();
      return;
    }

    // Cleanly restore previous model rotation
    this.resetModelRotation(this.currentStep);

    this.currentStep = stageIndex;
    this.inspectionTime = 0;
    this.inspectionInitialized = false;
    const stage = this.stages[stageIndex];

    // Glide smoothly into position directly in front of the object
    this.navController.setStage(stageIndex, true, 2.8);
    this.navController.autoRotate360 = false;

    // Save baseline rotation for this new model
    this.saveModelRotation(stageIndex);

    if (this.onStageChangeCallback) {
      this.onStageChangeCallback(stageIndex);
    }

    // Trigger stage-specific scientific voice narration
    if (this.audioManager && stage.narration) {
      this.audioManager.speakNarration(stage.narration);
    }
  }

  update(delta) {
    if (!this.isPlaying) return;

    // 1. While flying smoothly between models, wait until arrival
    if (this.navController.isTransitioning) {
      this.inspectionInitialized = false;
      return;
    }

    // 2. Camera has arrived directly in front of the model at the single fixed camera angle
    if (!this.inspectionInitialized) {
      this.inspectionInitialized = true;
      this.inspectionTime = 0;
      // Guarantee camera stays fixed in front - no camera orbit or angle changes!
      this.navController.autoRotate360 = false;
      this.saveModelRotation(this.currentStep);
    }

    this.inspectionTime += delta;

    // 3. Multi-Directional 3D Object Rotation
    // Camera angle stays completely FIXED in front; the object rotates in ALL directions!
    const pivot = this.getModelPivot(this.currentStep);
    if (pivot) {
      // (a) 360° Horizontal Spin (Yaw): continuously presents front, right, back, and left sides
      pivot.rotation.y += delta * 0.50;

      // (b) Continuous Smooth Vertical Pitch Tilt: smoothly tilts top polar view & bottom underside toward the camera
      // Tilts smoothly between +25° (exposing underside/bottom) and -25° (exposing top pole/roof)
      const pitchCycle = Math.sin(this.inspectionTime * 0.55);
      pivot.rotation.x = pitchCycle * 0.44;

      // (c) Subtle Organic Roll: reveals side/diagonal profiles
      const rollCycle = Math.cos(this.inspectionTime * 0.38);
      pivot.rotation.z = rollCycle * 0.16;
    }

    // 4. Once full inspection cycle is complete, smoothly advance to next model
    const targetDuration = Math.max(12.0, this.stageDuration || 12.0);
    if (this.inspectionTime >= targetDuration) {
      this.resetModelRotation(this.currentStep);
      this.inspectionTime = 0;
      this.inspectionInitialized = false;
      this.currentStep++;
      if (this.currentStep >= this.stages.length) {
        this.currentStep = 0; // Seamless loop to first stage
      }
      this.executeStage(this.currentStep);
    }
  }
}
