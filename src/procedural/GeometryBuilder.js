import * as THREE from 'three';

/**
 * Procedural Geometry Builder for Biological Structures
 */
export class GeometryBuilder {
  /**
   * Builds kidney-shaped Stomata Guard Cell pair geometry
   */
  static createGuardCellPair() {
    const group = new THREE.Group();

    // Guard cell material
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.35,
      metalness: 0.1
    });

    // Left kidney cell
    const leftCellGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 32, Math.PI * 0.85);
    const leftCell = new THREE.Mesh(leftCellGeo, guardMat);
    leftCell.rotation.z = Math.PI * 0.58;
    leftCell.position.x = -0.55;
    group.add(leftCell);

    // Right kidney cell
    const rightCellGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 32, Math.PI * 0.85);
    const rightCell = new THREE.Mesh(rightCellGeo, guardMat);
    rightCell.rotation.z = -Math.PI * 0.42;
    rightCell.position.x = 0.55;
    group.add(rightCell);

    // Inner stomatal pore aperture glow
    const poreGeo = new THREE.PlaneGeometry(0.5, 1.8);
    const poreMat = new THREE.MeshBasicMaterial({
      color: 0x065f46,
      side: THREE.DoubleSide
    });
    const pore = new THREE.Mesh(poreGeo, poreMat);
    pore.position.z = -0.1;
    group.add(pore);

    group.userData = { leftCell, rightCell, pore };
    return group;
  }

  /**
   * Creates a multi-lobed globular protein macromolecule mesh
   */
  static createGlobularProtein(subunits = 6, radius = 1.5, color = 0x0284c7) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.4,
      metalness: 0.15
    });

    for (let i = 0; i < subunits; i++) {
      const angle = (i / subunits) * Math.PI * 2;
      const r = radius * (0.6 + Math.random() * 0.3);
      const sphereGeo = new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 20, 20);
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 0.8,
        Math.sin(angle) * r
      );
      mesh.scale.set(1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.3);
      group.add(mesh);
    }

    return group;
  }

  /**
   * Creates a Granum Stack of Thylakoid Discs
   */
  static createGranumStack(discCount = 8, discRadius = 2.0, discHeight = 0.25, discMat) {
    const group = new THREE.Group();
    const discGeo = new THREE.CylinderGeometry(discRadius, discRadius, discHeight, 28);

    for (let i = 0; i < discCount; i++) {
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = (i - discCount * 0.5) * (discHeight + 0.08);
      // Slight organic angle variation
      disc.rotation.x = (Math.random() - 0.5) * 0.04;
      disc.rotation.z = (Math.random() - 0.5) * 0.04;
      group.add(disc);
    }

    return group;
  }
}
