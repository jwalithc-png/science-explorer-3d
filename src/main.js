import './style.css';
import { App } from './core/App.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('#webgl-canvas');
  if (!canvas) {
    console.error('WebGL canvas element #webgl-canvas not found in DOM.');
    return;
  }

  // Initialize Science Explorer 3D multi-module app
  const app = new App(canvas);
  window.__SCIENCE_APP__ = app;
  console.log('🔬 Science Explorer 3D: Solar System, Photosynthesis & Reproduction — initialized successfully.');
});
