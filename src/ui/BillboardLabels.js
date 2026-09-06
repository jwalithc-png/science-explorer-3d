import * as THREE from 'three';

/**
 * 3D Floating Billboard Names & Labels System
 * Generates neat, high-contrast, elegant 3D badges that attach to celestial bodies
 * and biological stages.
 * 
 * Features:
 * - Proper depth testing (no magnifying glass occlusions)
 * - Proportional neat scaling that never blows up when close
 * - Smooth proximity fading: fades out when camera is up close inspecting a model
 * - Crisp, modern typography with clean pill borders
 */
export class BillboardLabels {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Neat_Billboard_Labels';
    this.scene.add(this.group);

    this.labels = [];
    this.visible = true;
  }

  setStages(stages, getModelCallback) {
    // Remove old labels
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child.material && child.material.map) {
        child.material.map.dispose();
      }
      if (child.material) {
        child.material.dispose();
      }
      this.group.remove(child);
    }
    this.labels = [];

    if (!stages) return;

    stages.forEach((stage, idx) => {
      const sprite = this.createLabelSprite(stage.icon || '📍', stage.shortName || stage.name, stage.colorTheme || '#38bdf8');
      this.group.add(sprite);

      this.labels.push({
        sprite,
        stage,
        stageIndex: idx,
        getModelCallback
      });
    });
  }

  createLabelSprite(icon, text, colorHex = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    // Neat translucent dark glass pill
    ctx.fillStyle = 'rgba(10, 18, 36, 0.85)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 104, [26]);
    ctx.fill();

    // Crisp neon border
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 104, [26]);
    ctx.stroke();

    // Active accent dot
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(36, 60, 8, 0, Math.PI * 2);
    ctx.fill();

    // Clean, crisp typography
    ctx.font = 'bold 36px "Inter", -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${icon} ${text}`, 58, 60);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.88,
      depthTest: true, // Proper 3D depth test prevents magnifying glass effect
      depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4, 1, 1);
    return sprite;
  }

  toggle() {
    this.visible = !this.visible;
    this.group.visible = this.visible;
    return this.visible;
  }

  setVisible(val) {
    this.visible = val;
    this.group.visible = this.visible;
  }

  update(camera) {
    if (!this.visible) return;

    const camPos = camera ? camera.position : new THREE.Vector3();

    this.labels.forEach(item => {
      let targetPos = new THREE.Vector3();
      const model = item.getModelCallback ? item.getModelCallback(item.stageIndex) : null;

      if (model && model.group) {
        model.group.getWorldPosition(targetPos);
      } else if (item.stage.lookAt) {
        targetPos.set(item.stage.lookAt.x, item.stage.lookAt.y || 0, item.stage.lookAt.z || 0);
      }

      // Height offset placed neatly above the body
      const r = item.stage.radius || 2.0;
      const heightOffset = Math.max(1.6, r * 1.4);
      item.sprite.position.set(targetPos.x, targetPos.y + heightOffset, targetPos.z);

      // Distance from camera
      const dist = camPos.distanceTo(item.sprite.position);

      // Proximity fade: when camera is close to the model for inspection,
      // fade out smoothly so the model is 100% clean and unobstructed
      const fadeDist = Math.max(0, Math.min(1.0, (dist - 7.0) / 10.0));
      item.sprite.material.opacity = 0.88 * fadeDist;
      item.sprite.visible = (fadeDist > 0.02);

      // Neat proportional scale (never blows up or covers the screen)
      const scale = Math.max(0.8, Math.min(6.5, dist * 0.045));
      item.sprite.scale.set(scale * 3.2, scale * 0.78, 1);
    });
  }
}
