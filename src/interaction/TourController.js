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
    this.orbitAngleTraveled = 0; // Tracks radians rotated around current model
  }

  /**
   * Switch the active stages array and tour duration (for module switching)
   */
  setStages(stagesArray) {
    this.stages = stagesArray;
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
    this.orbitAngleTraveled = 0;
    if (this.audioManager) {
      this.audioManager.playTourSoundtrack();
    }
    this.executeStage(this.currentStep);
  }

  stopTour() {
    this.isPlaying = false;
    this.orbitAngleTraveled = 0;
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

    this.orbitAngleTraveled = 0;
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

    // 1. Wait while camera is flying/transitioning towards the model
    if (this.navController.isTransitioning) {
      return;
    }

    // 2. Camera has arrived: Perform a smooth, detailed 360-degree rotation around the model
    const rotSpeed = 0.65; // ~9.6 seconds for a full 360° inspection orbit
    const angleDelta = delta * rotSpeed;
    this.orbitAngleTraveled += angleDelta;

    this.navController.spherical.theta += angleDelta;
    // Dynamic subtle pitch oscillation to reveal top/side/bottom angles of the particle model
    this.navController.spherical.phi = Math.PI * 0.38 + 0.14 * Math.sin(this.orbitAngleTraveled * 2.0);
    this.navController.updateCameraFromSpherical();

    // 3. Once full 360° (2*PI) rotation around this model is complete, fly to the next model
    if (this.orbitAngleTraveled >= Math.PI * 2) {
      this.orbitAngleTraveled = 0;
      this.currentStep++;
      if (this.currentStep >= this.stages.length) {
        this.currentStep = 0; // Loop seamlessly
      }
      this.executeStage(this.currentStep);
    }
  }
}
