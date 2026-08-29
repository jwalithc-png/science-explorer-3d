import { globalLensManager, LENS_PRESETS } from '../vr/lensConfig.js';

/**
 * VR Optical Lens Calibration UI Controller
 * Allows real-time live adjustment of optical distortion, IPD, lens centers, and test grids.
 */
export class VRCalibrationUI {
  constructor() {
    this.lensManager = globalLensManager;
    this.modal = document.getElementById('vr-calibration-modal');
    this.btnOpen = document.getElementById('btn-vr-calibrate');
    this.btnClose = document.getElementById('btn-close-calibration');

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    // Preset buttons
    this.presetButtons = document.querySelectorAll('.btn-lens-preset');

    // Controls
    this.sliderIPD = document.getElementById('calib-ipd');
    this.valIPD = document.getElementById('val-calib-ipd');

    this.sliderK1 = document.getElementById('calib-k1');
    this.valK1 = document.getElementById('val-calib-k1');

    this.sliderK2 = document.getElementById('calib-k2');
    this.valK2 = document.getElementById('val-calib-k2');

    this.sliderChroma = document.getElementById('calib-chroma');
    this.valChroma = document.getElementById('val-calib-chroma');

    this.sliderRadiusX = document.getElementById('calib-radius-x');
    this.valRadiusX = document.getElementById('val-calib-radius-x');

    this.sliderRadiusY = document.getElementById('calib-radius-y');
    this.valRadiusY = document.getElementById('val-calib-radius-y');

    this.sliderCenterLX = document.getElementById('calib-center-lx');
    this.valCenterLX = document.getElementById('val-calib-center-lx');

    this.sliderCenterRX = document.getElementById('calib-center-rx');
    this.valCenterRX = document.getElementById('val-calib-center-rx');

    this.sliderFOV = document.getElementById('calib-fov');
    this.valFOV = document.getElementById('val-calib-fov');

    this.toggleGrid = document.getElementById('calib-toggle-grid');
    this.toggleMask = document.getElementById('calib-toggle-mask');

    this.updateSliderValues();
  }

  updateSliderValues() {
    const cfg = this.lensManager.config;

    if (this.sliderIPD && this.valIPD) {
      this.sliderIPD.value = cfg.ipd * 1000;
      this.valIPD.textContent = `${(cfg.ipd * 1000).toFixed(1)} mm`;
    }
    if (this.sliderK1 && this.valK1) {
      this.sliderK1.value = cfg.distortionK1;
      this.valK1.textContent = cfg.distortionK1.toFixed(3);
    }
    if (this.sliderK2 && this.valK2) {
      this.sliderK2.value = cfg.distortionK2;
      this.valK2.textContent = cfg.distortionK2.toFixed(3);
    }
    if (this.sliderChroma && this.valChroma) {
      this.sliderChroma.value = cfg.chromaticAberration;
      this.valChroma.textContent = cfg.chromaticAberration.toFixed(4);
    }
    if (this.sliderRadiusX && this.valRadiusX) {
      this.sliderRadiusX.value = cfg.lensRadiusX;
      this.valRadiusX.textContent = cfg.lensRadiusX.toFixed(2);
    }
    if (this.sliderRadiusY && this.valRadiusY) {
      this.sliderRadiusY.value = cfg.lensRadiusY;
      this.valRadiusY.textContent = cfg.lensRadiusY.toFixed(2);
    }
    if (this.sliderCenterLX && this.valCenterLX) {
      this.sliderCenterLX.value = cfg.lensCenterLX;
      this.valCenterLX.textContent = cfg.lensCenterLX.toFixed(2);
    }
    if (this.sliderCenterRX && this.valCenterRX) {
      this.sliderCenterRX.value = cfg.lensCenterRX;
      this.valCenterRX.textContent = cfg.lensCenterRX.toFixed(2);
    }
    if (this.sliderFOV && this.valFOV) {
      this.sliderFOV.value = cfg.cameraFOV || 62;
      this.valFOV.textContent = `${cfg.cameraFOV || 62}°`;
    }
  }

  bindEvents() {
    if (this.btnOpen) {
      this.btnOpen.addEventListener('click', () => this.toggleModal(true));
    }
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.toggleModal(false));
    }

    // Presets
    this.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset) {
          this.lensManager.applyPreset(preset);
          this.updateSliderValues();
          this.presetButtons.forEach((b) => b.classList.toggle('active', b === btn));
        }
      });
    });

    // Real-time Sliders
    this.sliderIPD?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 1000;
      this.lensManager.set('ipd', val);
      if (this.valIPD) this.valIPD.textContent = `${e.target.value} mm`;
    });

    this.sliderK1?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('distortionK1', val);
      if (this.valK1) this.valK1.textContent = val.toFixed(3);
    });

    this.sliderK2?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('distortionK2', val);
      if (this.valK2) this.valK2.textContent = val.toFixed(3);
    });

    this.sliderChroma?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('chromaticAberration', val);
      if (this.valChroma) this.valChroma.textContent = val.toFixed(4);
    });

    this.sliderRadiusX?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('lensRadiusX', val);
      if (this.valRadiusX) this.valRadiusX.textContent = val.toFixed(2);
    });

    this.sliderRadiusY?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('lensRadiusY', val);
      if (this.valRadiusY) this.valRadiusY.textContent = val.toFixed(2);
    });

    this.sliderCenterLX?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('lensCenterLX', val);
      if (this.valCenterLX) this.valCenterLX.textContent = val.toFixed(2);
    });

    this.sliderCenterRX?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('lensCenterRX', val);
      if (this.valCenterRX) this.valCenterRX.textContent = val.toFixed(2);
    });

    this.sliderFOV?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.lensManager.set('cameraFOV', val);
      if (this.valFOV) this.valFOV.textContent = `${val}°`;
    });

    // Toggles
    this.toggleGrid?.addEventListener('change', (e) => {
      this.lensManager.showCalibrationGrid = e.target.checked;
      this.lensManager.notify();
    });

    this.toggleMask?.addEventListener('change', (e) => {
      this.lensManager.showLensMask = e.target.checked;
      this.lensManager.notify();
    });
  }

  toggleModal(show) {
    if (this.modal) {
      this.modal.classList.toggle('hidden', !show);
      if (show) this.updateSliderValues();
    }
  }
}
