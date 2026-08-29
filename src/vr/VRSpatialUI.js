import * as THREE from 'three';

/**
 * 3D Spatial Holographic UI Panel rendered in VR World-Space
 * Visible in BOTH eye cameras with true stereoscopic depth and parallax.
 */
export class VRSpatialUI {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.panelGroup = new THREE.Group();
    this.panelGroup.name = 'VR_Spatial_Holo_Panel';
    this.panelGroup.visible = false;
    this.scene.add(this.panelGroup);

    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.PlaneGeometry(1.0, 1.0);
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.panelMesh = new THREE.Mesh(geo, mat);
    this.panelGroup.add(this.panelMesh);
  }

  updateSelectedBody(body) {
    if (!body) {
      this.panelGroup.visible = false;
      return;
    }

    this.panelGroup.visible = true;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 512, 512);

    // Glass holographic background
    ctx.fillStyle = 'rgba(7, 16, 38, 0.88)';
    ctx.roundRect(10, 10, 492, 492, 24);
    ctx.fill();

    // Border Glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Title
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${body.data.symbol || '🪐'} ${body.name.toUpperCase()}`, 30, 65);

    ctx.font = '20px Orbitron, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(body.data.type || 'CELESTIAL BODY', 30, 105);

    // Separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 125);
    ctx.lineTo(482, 125);
    ctx.stroke();

    // Telemetry items
    ctx.font = 'bold 22px Rajdhani, sans-serif';
    ctx.fillStyle = '#f8fafc';

    const items = [
      ['Diameter:', body.data.diameter || 'N/A'],
      ['Distance from Sun:', body.data.distanceFromSun || 'N/A'],
      ['Rotation Period:', body.data.rotationPeriodHours ? `${Math.abs(body.data.rotationPeriodHours)} hrs` : 'N/A'],
      ['Orbital Period:', body.data.orbitalPeriodDays || 'N/A'],
      ['Temperature:', body.data.temperature || 'N/A'],
      ['Moons:', body.data.moonsCount || '0']
    ];

    let y = 170;
    for (const [label, val] of items) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(label, 30, y);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(val, 240, y);
      y += 40;
    }

    // VR Interaction Tip
    ctx.font = '16px Orbitron, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('GRIP RINGS TO ROTATE // DOUBLE CLICK TO FLY', 30, 470);

    this.texture.needsUpdate = true;
  }

  update(selectedBody) {
    if (!selectedBody || !this.panelGroup.visible) return;

    // Position panel floating near the selected planet in world-space
    const worldPos = new THREE.Vector3();
    selectedBody.getWorldPosition(worldPos);

    const radius = selectedBody.radius;
    const offset = Math.max(radius * 1.8, 6.0);
    const scale = Math.max(radius * 0.9, 4.0);
    this.panelMesh.scale.set(scale, scale, 1);

    this.panelGroup.position.set(
      worldPos.x + offset,
      worldPos.y + offset * 0.35,
      worldPos.z
    );

    // Face camera
    this.panelGroup.lookAt(this.camera.position);
  }
}
