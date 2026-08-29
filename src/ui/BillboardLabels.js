import * as THREE from 'three';

/**
 * 3D Floating Billboard Names & Labels System
 * Generates glowing high-contrast 3D canvas sprites that attach to celestial bodies
 * and biological stages, tracking them in real-time and facing the camera.
 */
export class BillboardLabels {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
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
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Rounded glowing pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, [48]);
    ctx.fill();
    ctx.stroke();

    // Subtle inner glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(20, 20, 472, 88, [44]);
    ctx.stroke();

    // Icon + Text
    ctx.font = 'bold 44px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 12;
    ctx.fillText(`${icon} ${text}`, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthTest: false,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(12, 3, 1);
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

      // Height offset above the target object
      const r = item.stage.vrOffsetDist || 14;
      const heightOffset = Math.max(3.5, r * 0.35);
      item.sprite.position.set(targetPos.x, targetPos.y + heightOffset, targetPos.z);

      // Distance-based dynamic scale
      const dist = camPos.distanceTo(item.sprite.position);
      const scale = Math.max(4.0, Math.min(30.0, dist * 0.18));
      item.sprite.scale.set(scale * 3.5, scale * 0.9, 1);
    });
  }
}
