import * as THREE from 'three';

/**
 * In-Memory Procedural Canvas Texture Generator
 * Generates high-performance, photorealistic textures for biological surfaces
 * without loading external image assets.
 */
export class TextureGenerator {
  /**
   * Generates a circular glow particle sprite
   */
  static createParticleSprite(color = '#ffffff', innerRadius = 0.15) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 64 * innerRadius, 64, 64, 64);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  /**
   * Generates epidermal cellular tile pattern texture
   */
  static createEpidermisTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, 512, 512);

    // Draw irregular polygonal pavement cells
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#15803d';

    const cols = 8;
    const rows = 8;
    const cw = 512 / cols;
    const ch = 512 / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cw;
        const y = j * ch;
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 4, cw - 8, ch - 8, [12, 8, 14, 10]);
        ctx.fillStyle = (i + j) % 2 === 0 ? '#15803d' : '#166534';
        ctx.fill();
        ctx.stroke();

        // Inner nucleus dot
        ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.beginPath();
        ctx.arc(x + cw * 0.5, y + ch * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates Xylem vessel helical lignified ring texture
   */
  static createXylemRingsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;

    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + 16);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates Protein Surface bump/specular texture
   */
  static createProteinSurfaceTexture(color = '#0284c7') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);

    // Add amino acid globular grain noise
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 2 + Math.random() * 5;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
