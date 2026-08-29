/**
 * VR Optical Lens Model Configuration & Headset Presets
 * Calibrated for maximum crispness, high resolution, and physical VR Box headsets.
 */

export const LENS_PRESETS = {
  'VR Box (Ultra-Crisp)': {
    name: 'VR Box (Ultra-Crisp)',
    ipd: 0.064,
    lensSeparation: 0.064,
    lensCenterLX: 0.50,
    lensCenterLY: 0.50,
    lensCenterRX: 0.50,
    lensCenterRY: 0.50,
    lensRadiusX: 0.50,
    lensRadiusY: 0.50,
    distortionK1: 0.05,
    distortionK2: 0.01,
    chromaticAberration: 0.0,
    cameraFOV: 62
  },
  'Pure Sharp SBS (Zero Blur)': {
    name: 'Pure Sharp SBS (Zero Blur)',
    ipd: 0.064,
    lensSeparation: 0.064,
    lensCenterLX: 0.50,
    lensCenterLY: 0.50,
    lensCenterRX: 0.50,
    lensCenterRY: 0.50,
    lensRadiusX: 0.50,
    lensRadiusY: 0.50,
    distortionK1: 0.0,
    distortionK2: 0.0,
    chromaticAberration: 0.0,
    cameraFOV: 62
  },
  'Google Cardboard': {
    name: 'Google Cardboard',
    ipd: 0.064,
    lensSeparation: 0.060,
    lensCenterLX: 0.50,
    lensCenterLY: 0.50,
    lensCenterRX: 0.50,
    lensCenterRY: 0.50,
    lensRadiusX: 0.48,
    lensRadiusY: 0.48,
    distortionK1: 0.10,
    distortionK2: 0.02,
    chromaticAberration: 0.0005,
    cameraFOV: 64
  },
  'Irusu VR': {
    name: 'Irusu VR',
    ipd: 0.066,
    lensSeparation: 0.066,
    lensCenterLX: 0.50,
    lensCenterLY: 0.50,
    lensCenterRX: 0.50,
    lensCenterRY: 0.50,
    lensRadiusX: 0.49,
    lensRadiusY: 0.49,
    distortionK1: 0.07,
    distortionK2: 0.015,
    chromaticAberration: 0.0,
    cameraFOV: 63
  }
};

export class LensConfigManager {
  constructor() {
    // Default to ultra-crisp VR Box preset
    this.config = { ...LENS_PRESETS['VR Box (Ultra-Crisp)'] };
    this.showCalibrationGrid = false;
    this.showLensMask = false;
    this.listeners = [];
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.notify();
  }

  applyPreset(presetName) {
    if (LENS_PRESETS[presetName]) {
      this.config = { ...this.config, ...LENS_PRESETS[presetName] };
      this.notify();
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.config);
    }
  }
}

export const globalLensManager = new LensConfigManager();
