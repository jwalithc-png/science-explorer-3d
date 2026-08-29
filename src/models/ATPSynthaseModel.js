import * as THREE from 'three';
import { createLipidBilayerMaterial } from '../shaders/LipidBilayerShader.js';

/**
 * ATP Synthase Molecular Turbine Model (Level 4: Photophosphorylation)
 * 
 * Components:
 * 1. F0 Base Motor (embedded in thylakoid membrane):
 *    - c-ring rotor (12 c-subunits) driven by H+ proton translocation
 *    - a-subunit stator channel
 * 2. Central Asymmetric γ-Shaft (connecting F0 rotor to F1 headpiece)
 * 3. F1 Catalytic Hexamer (α3β3 headpiece in stroma):
 *    - 3 catalytic β-subunits cycling through Open, Loose, Tight states
 *    - Synthesizes ATP from ADP + Pi
 * 4. Peripheral Stator Arm (b2δ) anchoring F1 to membrane
 * 5. Dynamic Rotation & Energetic Flash Effects
 */
export class ATPSynthaseModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 170, options.y || 0, options.z || 0);

    this.rotorGroup = new THREE.Group(); // Rotating sub-assembly (c-ring + gamma shaft)
    this.statorGroup = new THREE.Group(); // Stationary sub-assembly (a-subunit, b2 stalk, alpha3beta3 head)
    this.catalyticSubunits = [];
    this.time = 0;
    this.rotationAngle = 0;

    this.buildMembranePatch();
    this.buildF0Rotor();
    this.buildGammaShaft();
    this.buildF1CatalyticHead();
    this.buildStatorArm();

    this.group.add(this.rotorGroup);
    this.group.add(this.statorGroup);
  }

  buildMembranePatch() {
    // Small lipid bilayer ring surrounding F0
    const membraneMat = createLipidBilayerMaterial({
      headColor: '#0284c7',
      tailColor: '#0f172a'
    });
    const memGeo = new THREE.CylinderGeometry(6, 6, 1.4, 32);
    const mem = new THREE.Mesh(memGeo, membraneMat);
    mem.position.y = 0;
    this.statorGroup.add(mem);
  }

  buildF0Rotor() {
    // c-ring rotor: 12 cylindrical c-subunits arranged in a ring
    const cSubunitGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.6, 12);
    const cSubunitMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange motor rotor
      roughness: 0.3,
      metalness: 0.2
    });

    const cCount = 12;
    const ringRadius = 1.3;
    for (let i = 0; i < cCount; i++) {
      const angle = (i / cCount) * Math.PI * 2;
      const sub = new THREE.Mesh(cSubunitGeo, cSubunitMat);
      sub.position.set(
        Math.cos(angle) * ringRadius,
        0,
        Math.sin(angle) * ringRadius
      );
      this.rotorGroup.add(sub);
    }

    // F0 a-subunit Stator (stationary proton channel alongside c-ring)
    const aSubMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const aSubGeo = new THREE.BoxGeometry(1.4, 1.8, 1.6);
    const aSub = new THREE.Mesh(aSubGeo, aSubMat);
    aSub.position.set(2.2, 0, 0);
    this.statorGroup.add(aSub);

    // Proton channel indicators (lumen entry, stroma exit)
    const entryPore = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
    entryPore.position.set(2.2, -0.9, 0);
    this.statorGroup.add(entryPore);

    const exitPore = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
    exitPore.position.set(1.5, 0.9, 0);
    this.statorGroup.add(exitPore);
  }

  buildGammaShaft() {
    // Asymmetric central gamma-stalk rotating inside F1 head
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.45, 4.2, 16);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Golden transmission axle
      metalness: 0.5,
      roughness: 0.2
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 2.1;
    // Asymmetric tilt
    shaft.rotation.z = 0.08;
    this.rotorGroup.add(shaft);

    // Eccentric cam lobe at top of shaft
    const camGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const cam = new THREE.Mesh(camGeo, shaftMat);
    cam.position.set(0.2, 3.8, 0);
    this.rotorGroup.add(cam);
  }

  buildF1CatalyticHead() {
    // F1 Hexamer (3 alpha + 3 beta subunits arranged alternately in a crown)
    const f1Group = new THREE.Group();
    f1Group.position.set(0, 3.8, 0);

    const alphaMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }); // Alpha subunits (blue)
    const betaMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });  // Beta catalytic subunits (pink/magenta)

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const isBeta = i % 2 === 1;
      const mat = isBeta ? betaMat : alphaMat;

      const subunitGeo = new THREE.SphereGeometry(0.95, 16, 16);
      const subunit = new THREE.Mesh(subunitGeo, mat);
      subunit.scale.set(0.9, 1.3, 0.9);
      subunit.position.set(
        Math.cos(angle) * 1.6,
        0,
        Math.sin(angle) * 1.6
      );

      f1Group.add(subunit);

      if (isBeta) {
        // Catalytic binding pocket indicator (ADP/ATP site)
        const site = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
        site.position.set(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2);
        f1Group.add(site);

        this.catalyticSubunits.push({
          mesh: subunit,
          site: site,
          baseAngle: angle
        });
      }
    }

    this.statorGroup.add(f1Group);
  }

  buildStatorArm() {
    // b2δ Peripheral Stator Arm (anchors top of F1 to membrane F0)
    const armMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });

    // Vertical column
    const colGeo = new THREE.CylinderGeometry(0.25, 0.25, 5.0, 10);
    const col = new THREE.Mesh(colGeo, armMat);
    col.position.set(-2.4, 2.2, 0);
    this.statorGroup.add(col);

    // Top cap over F1
    const topCapGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.6, 10);
    const topCap = new THREE.Mesh(topCapGeo, armMat);
    topCap.rotation.z = Math.PI * 0.5;
    topCap.position.set(-1.2, 4.8, 0);
    this.statorGroup.add(topCap);
  }

  update(delta, simParams = {}) {
    const speed = 4.5 * (simParams.simSpeed || 1.0) * (simParams.waterSupply || 1.0);
    this.time += delta;
    this.rotationAngle += delta * speed;

    // Rotate rotor assembly (c-ring + central gamma shaft)
    this.rotorGroup.rotation.y = this.rotationAngle;

    // Animate conformational breathing of catalytic beta subunits (Open -> Loose -> Tight)
    this.catalyticSubunits.forEach((sub, idx) => {
      // Relative angle between rotating gamma shaft and stationary beta subunit
      const relAngle = (this.rotationAngle - sub.baseAngle + Math.PI * 2) % (Math.PI * 2);
      const deformation = Math.sin(relAngle) * 0.15;

      sub.mesh.scale.set(0.9 + deformation, 1.3 - deformation, 0.9 + deformation);

      // Flash catalytic site during Tight -> Open ATP discharge transition
      const isFiring = Math.cos(relAngle) > 0.8;
      if (sub.site) {
        sub.site.scale.setScalar(isFiring ? 1.6 : 0.8);
      }
    });
  }
}
