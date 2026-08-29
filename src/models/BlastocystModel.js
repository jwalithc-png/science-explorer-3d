import * as THREE from 'three';

/**
 * Stage 5: Cleavage & Blastocyst Development Model
 * Shows mitotic cell divisions (Morula to Blastocyst), outer Trophoblast ring,
 * fluid-filled Blastocoel cavity, and the pluripotent Inner Cell Mass (ICM - origin of the child).
 */
export class BlastocystModel {
  constructor(position = { x: 60, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initTrophoblastShell();
    this.initInnerCellMass();
    this.initBlastocoelFluid();
    this.initHatchingZona();
  }

  initTrophoblastShell() {
    // Outer epithelial layer of Trophoblast cells (future chorion / placenta)
    this.trophoblastGroup = new THREE.Group();
    const cellCount = 72;
    const cellGeo = new THREE.SphereGeometry(0.55, 14, 12);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x16a34a,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.88
    });

    this.trophoMesh = new THREE.InstancedMesh(cellGeo, cellMat, cellCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < cellCount; i++) {
      const phi = Math.acos(2 * (i / cellCount) - 1);
      const theta = Math.sqrt(cellCount * Math.PI) * phi;
      const r = 3.6;

      dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      dummy.scale.set(1.0, 1.0, 0.7);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();

      this.trophoMesh.setMatrixAt(i, dummy.matrix);
    }
    this.trophoMesh.instanceMatrix.needsUpdate = true;
    this.trophoblastGroup.add(this.trophoMesh);
    this.inspectPivot.add(this.trophoblastGroup);
  }

  initInnerCellMass() {
    // Clustered Inner Cell Mass (ICM / Embryoblast) - Pluripotent stem cells that form the child
    this.icmGroup = new THREE.Group();
    this.icmGroup.position.set(0, 1.6, 0); // Positioned at embryonic pole

    const icmCellCount = 28;
    const icmGeo = new THREE.SphereGeometry(0.48, 14, 12);
    const icmMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.35,
      emissive: 0xeab308,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.95
    });

    this.icmMesh = new THREE.InstancedMesh(icmGeo, icmMat, icmCellCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < icmCellCount; i++) {
      const x = (Math.random() - 0.5) * 2.2;
      const y = (Math.random() - 0.5) * 1.6;
      const z = (Math.random() - 0.5) * 2.0;

      dummy.position.set(x, y, z);
      const s = 0.8 + Math.random() * 0.4;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      this.icmMesh.setMatrixAt(i, dummy.matrix);
    }
    this.icmMesh.instanceMatrix.needsUpdate = true;
    this.icmGroup.add(this.icmMesh);
    this.inspectPivot.add(this.icmGroup);
  }

  initBlastocoelFluid() {
    // Fluid-filled internal blastocoel cavity (Translucent cyan/emerald matrix)
    const fluidGeo = new THREE.SphereGeometry(3.1, 32, 24);
    const fluidMat = new THREE.MeshStandardMaterial({
      color: 0xa7f3d0,
      roughness: 0.2,
      metalness: 0.2,
      transparent: true,
      opacity: 0.45,
      emissive: 0x059669,
      emissiveIntensity: 0.3
    });
    this.fluidMesh = new THREE.Mesh(fluidGeo, fluidMat);
    this.inspectPivot.add(this.fluidMesh);
  }

  initHatchingZona() {
    // Shedding Zona Pellucida (Zona Hatching) - Ripped hemisphere opening
    const hatchGeo = new THREE.SphereGeometry(4.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hatchMat = new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      roughness: 0.3,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.hatchMesh = new THREE.Mesh(hatchGeo, hatchMat);
    this.hatchMesh.position.set(0, -1.2, 0);
    this.hatchMesh.rotation.x = Math.PI * 0.2;
    this.inspectPivot.add(this.hatchMesh);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Cutaway inspection support: hide front hemisphere of trophoblast if enabled
    if (params.crossSectionView) {
      this.fluidMesh.material.opacity = 0.2;
      this.hatchMesh.visible = false;
    } else {
      this.fluidMesh.material.opacity = 0.45;
      this.hatchMesh.visible = true;
    }

    // 3. Rhythmic pluripotency energy pulse inside ICM
    const icmPulse = 0.6 + Math.sin(time * 2.0) * 0.25;
    this.icmMesh.material.emissiveIntensity = icmPulse;
  }
}
