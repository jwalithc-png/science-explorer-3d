import * as THREE from 'three';

/**
 * Interactive Celestial Distance Measurement Tool
 * Allows measuring dynamic distances between any two planets or moons with 3D laser line.
 */
export class MeasurementTool {
  constructor(scene, solarSystem, onMeasurementUpdate) {
    this.scene = scene;
    this.solarSystem = solarSystem;
    this.onMeasurementUpdate = onMeasurementUpdate;

    this.isActive = false;
    this.bodyA = null;
    this.bodyB = null;

    // 3D Laser Line Mesh
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(), new THREE.Vector3()
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.laserLine = new THREE.Line(lineGeo, lineMat);
    this.laserLine.visible = false;
    this.scene.add(this.laserLine);
  }

  toggle() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.reset();
    }
    return this.isActive;
  }

  reset() {
    this.bodyA = null;
    this.bodyB = null;
    this.laserLine.visible = false;
    if (this.onMeasurementUpdate) {
      this.onMeasurementUpdate(null, null, null);
    }
  }

  handleBodySelect(celestialBody) {
    if (!this.isActive || !celestialBody) return;

    if (!this.bodyA) {
      this.bodyA = celestialBody;
    } else if (!this.bodyB && this.bodyA !== celestialBody) {
      this.bodyB = celestialBody;
      this.laserLine.visible = true;
    } else {
      // Cycle: select new target as B
      this.bodyA = this.bodyB || celestialBody;
      this.bodyB = celestialBody;
      this.laserLine.visible = true;
    }

    this.update();
  }

  update() {
    if (!this.isActive || !this.bodyA || !this.bodyB) {
      this.laserLine.visible = false;
      return;
    }

    const posA = new THREE.Vector3();
    const posB = new THREE.Vector3();
    this.bodyA.getWorldPosition(posA);
    this.bodyB.getWorldPosition(posB);

    // Update 3D Laser Line geometry
    const positions = this.laserLine.geometry.attributes.position;
    positions.setXYZ(0, posA.x, posA.y, posA.z);
    positions.setXYZ(1, posB.x, posB.y, posB.z);
    positions.needsUpdate = true;
    this.laserLine.visible = true;

    // Calculate metrics
    const simDistance = posA.distanceTo(posB);
    
    // Scale factor: Earth orbit distance = 140 sim units ≈ 1.0 AU (149.6M km)
    const scaleRatio = 149.6 / 140.0; // Million km per sim unit
    const realDistKmMillion = simDistance * scaleRatio;
    const realDistAU = realDistKmMillion / 149.6;

    // Light travel time: Speed of light = 300,000 km/s ≈ 0.3 Million km/s
    const lightSeconds = (realDistKmMillion * 1000000) / 299792;
    const lightMinutes = lightSeconds / 60.0;

    if (this.onMeasurementUpdate) {
      this.onMeasurementUpdate(this.bodyA, this.bodyB, {
        simDistance,
        realDistKmMillion,
        realDistAU,
        lightMinutes,
        lightSeconds
      });
    }
  }
}
