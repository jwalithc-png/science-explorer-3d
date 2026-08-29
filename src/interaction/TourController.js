import { CONCEPTION_STAGES } from '../data/conceptionStages.js';

/**
 * Guided Cinematic Animation Tour Controller
 * Swoops the camera smoothly through all stages in sequence,
 * synchronizing scientific voice narration, acoustics, and stage cues.
 * Supports dynamic stage switching for multi-module architecture.
 */
export class TourController {
  constructor(navController, audioManager, onStageChangeCallback) {
    this.navController = navController;
    this.audioManager = audioManager;
    this.onStageChangeCallback = onStageChangeCallback;

    this.stages = CONCEPTION_STAGES;
    this.isPlaying = false;
    this.currentStep = 0;
    this.stepTimer = 0;
    this.stepDuration = 12.0; // 12 seconds per scientific stage
  }

  /**
   * Switch the active stages array and tour duration (for module switching)
   */
  setStages(stagesArray, stepDuration = 12.0) {
    this.stages = stagesArray;
    this.stepDuration = stepDuration;
    this.stopTour();
  }

  toggleTour() {
    if (this.isPlaying) {
      this.stopTour();
    } else {
      this.startTour();
    }
    return this.isPlaying;
  }

  startTour(fromStage = 0) {
    this.isPlaying = true;
    this.currentStep = fromStage;
    this.stepTimer = 0;
    if (this.audioManager) {
      this.audioManager.playTourSoundtrack();
    }
    this.executeStage(this.currentStep);
  }

  stopTour() {
    this.isPlaying = false;
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

    const stage = this.stages[stageIndex];
    this.navController.setStage(stageIndex, true);

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

    this.stepTimer += delta;

    // Superb cinematic swooping orbit around active planet / object
    if (!this.navController.isTransitioning) {
      this.navController.spherical.theta += delta * 0.32;
      this.navController.updateCameraFromSpherical();
    }

    if (this.stepTimer >= this.stepDuration) {
      this.stepTimer = 0;
      this.currentStep++;
      if (this.currentStep >= this.stages.length) {
        this.currentStep = 0; // Loop seamlessly
      }
      this.executeStage(this.currentStep);
    }
  }
}
