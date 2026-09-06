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
  constructor(navController, audioManager, onStageChangeCallback) {
    this.navController = navController;
    this.audioManager = audioManager;
    this.onStageChangeCallback = onStageChangeCallback;

    this.stages = CONCEPTION_STAGES;
    this.isPlaying = false;
    this.currentStep = 0;
    this.orbitAngleTraveled = 0; // Tracks radians rotated around current model
    this.totalRotationAngle = Math.PI * 2.5; // ~450° inspection cycle
    this.baseRadius = 0;
    this.inspectionInitialized = false;
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
      // Start tour from the model currently in view
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
    this.orbitAngleTraveled = 0;
    this.inspectionInitialized = false;
    if (this.audioManager) {
      this.audioManager.playTourSoundtrack();
    }
    this.executeStage(this.currentStep);
  }

  stopTour() {
    this.isPlaying = false;
    this.orbitAngleTraveled = 0;
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

    this.orbitAngleTraveled = 0;
    this.inspectionInitialized = false;
    const stage = this.stages[stageIndex];
    // Glide smoothly into position with a majestic 2.8s interstellar transition
    this.navController.setStage(stageIndex, true, 2.8);

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

    // 1. If currently flying/gliding between models, let the transition finish smoothly
    if (this.navController.isTransitioning) {
      this.inspectionInitialized = false;
      return;
    }

    // 2. Camera has arrived at the model: initialize base distance
    if (!this.inspectionInitialized) {
      this.inspectionInitialized = true;
      this.baseRadius = this.navController.spherical.radius || 25;
      this.orbitAngleTraveled = 0;
    }

    // 3. Cinematic Slow Multi-Angle Orbit
    // Slower rotation rate (~0.20 rad/sec) allows viewers to absorb rich details
    const rotSpeed = 0.20;
    const angleDelta = delta * rotSpeed;
    this.orbitAngleTraveled += angleDelta;

    // Horizontal 360° Yaw rotation
    this.navController.spherical.theta += angleDelta;

    // Progress through this model's multi-angle inspection cycle (0.0 to 1.0)
    const p = Math.min(1.0, this.orbitAngleTraveled / this.totalRotationAngle);

    // Multi-angle Vertical Elevation (Pitch):
    // Smoothly sweeps between top polar view (0.18*PI ~ 32°),
    // eye-level equatorial beauty view (0.38*PI ~ 68°),
    // and dramatic low-angle looking up from beneath (0.58*PI ~ 104°)
    const pitchWave = Math.sin(p * Math.PI * 2.0);
    const targetPhi = Math.max(
      Math.PI * 0.16,
      Math.min(Math.PI * 0.60, Math.PI * 0.38 - pitchWave * 0.20)
    );
    this.navController.spherical.phi = targetPhi;

    // Dynamic Zoom Breathing (Macro Close-up -> Normal -> Wide Environment)
    // Starts at close-up 0.82x for surface details, expands to 1.18x for moons/atmosphere
    const zoomFactor = 0.82 + 0.18 * (1 - Math.cos(p * Math.PI * 2.0));
    this.navController.spherical.radius = this.baseRadius * zoomFactor;

    this.navController.updateCameraFromSpherical();

    // 4. Once full multi-angle cycle is complete, smoothly advance to next model
    if (this.orbitAngleTraveled >= this.totalRotationAngle) {
      this.orbitAngleTraveled = 0;
      this.inspectionInitialized = false;
      this.currentStep++;
      if (this.currentStep >= this.stages.length) {
        this.currentStep = 0; // Seamless loop
      }
      this.executeStage(this.currentStep);
    }
  }
}
