import * as THREE from 'three';
import { CONCEPTION_STAGES } from '../data/conceptionStages.js';

/**
 * 3D Floating Spatial VR Information Panels
 * Renders in-world stereo canvas textures displaying stage title,
 * physical/biochemical equations, telemetry metrics, and scientific explanations.
 * Fully dynamic across Solar System, Photosynthesis, and Reproduction modules.
 */
export class VRInfoCard {
  constructor(scene) {
    this.scene = scene;
    this.stages = CONCEPTION_STAGES;
    this.currentStageIndex = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;

    const planeGeo = new THREE.PlaneGeometry(6.4, 3.2);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(planeGeo, planeMat);
    this.mesh.position.set(0, 5, 12);
    this.scene.add(this.mesh);

    this.updateCard(0);
  }

  setStages(stages) {
    this.stages = stages || CONCEPTION_STAGES;
    this.updateCard(this.currentStageIndex);
  }

  updateCard(stageIndex) {
    this.currentStageIndex = stageIndex;
    const stage = (this.stages && this.stages[stageIndex]) || (this.stages && this.stages[0]);
    if (!stage) return;

    // Position panel in front and above the active stage target
    const targetX = stage.lookAt ? stage.lookAt.x : 0;
    const targetY = stage.lookAt ? stage.lookAt.y : 0;
    const targetZ = stage.lookAt ? stage.lookAt.z : 0;
    const offset = stage.vrOffsetDist || 18;

    this.mesh.position.set(targetX, targetY + offset * 0.35, targetZ + offset * 0.4);
    this.mesh.rotation.set(-0.1, 0, 0);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, 1024, 512);

    // Glassmorphic rounded background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = stage.colorTheme || '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(10, 10, 1004, 492, [24]);
    ctx.fill();
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = stage.colorTheme || '#38bdf8';
    ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(`${stage.icon || '📍'} ${stage.name}`, 40, 65);

    // Timeline or Type badge
    if (stage.timeline) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText(`⏱️ ${stage.timeline}`, 680, 65);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Inter", sans-serif';
    ctx.fillText(stage.subtitle || '', 40, 105);

    // Balanced Reaction / Process / Physical Equation Box
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 125, 944, 60, [12]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic bold 22px "Inter", sans-serif';
    ctx.fillText(`⚡ ${stage.equation || stage.description.slice(0, 60)}`, 55, 163);

    // Key Scientific Points
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px "Inter", sans-serif';
    if (stage.keyPoints && stage.keyPoints.length) {
      stage.keyPoints.slice(0, 3).forEach((point, i) => {
        ctx.fillText(`• ${point}`, 40, 225 + i * 36);
      });
    }

    // Live Telemetry Bar at bottom
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.beginPath();
    ctx.roundRect(40, 360, 944, 110, [12]);
    ctx.fill();

    ctx.fillStyle = stage.colorTheme || '#38bdf8';
    ctx.font = 'bold 18px "Inter", monospace';
    let telX = 60;
    if (stage.telemetry) {
      for (const [k, v] of Object.entries(stage.telemetry)) {
        const formattedKey = k.replace(/([A-Z])/g, ' $1').toUpperCase();
        ctx.fillText(`${formattedKey}: ${v}`, telX, 420);
        telX += 230;
      }
    }

    this.texture.needsUpdate = true;
  }

  updatePosition(targetWorldPos, camera) {
    if (!targetWorldPos) return;
    const stage = this.stages[this.currentStageIndex];
    const offset = (stage && stage.vrOffsetDist) ? stage.vrOffsetDist : 18;
    this.mesh.position.set(targetWorldPos.x, targetWorldPos.y + offset * 0.3, targetWorldPos.z + offset * 0.45);
    if (camera) {
      this.mesh.lookAt(camera.position);
    }
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }
}
