import * as THREE from 'three';

/**
 * 3D Blender-Style Colorful XYZ Rotation Gizmo
 * Implements real 3D Torus Axis Rings (Red = X, Green = Y, Blue = Z)
 * Allows free rotation in all directions and viewing from all angles.
 */
export class Gizmo3D {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.selectedBody = null;
    this.targetGroup = null;
    this.activeAxis = null; // 'X', 'Y', 'Z' or null
    this.isDragging = false;

    // Continuous axis spin state
    this.continuousSpinAxis = null;
    this.continuousSpinSpeed = 1.4;

    // Root gizmo container attached to the scene
    this.gizmoRoot = new THREE.Group();
    this.gizmoRoot.name = 'Blender_Rotation_Gizmo_XYZ';
    this.gizmoRoot.visible = false;
    this.scene.add(this.gizmoRoot);

    // Plane for Raycaster Drag Tracking
    this.dragPlane = new THREE.Plane();
    this.dragPlaneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.scene.add(this.dragPlaneMesh);

    this.prevDragPoint = new THREE.Vector3();
    this.centerPos = new THREE.Vector3();

    // Build the 3 axis rings & axis labels
    this.rings = {};
    this.buildAxisRings();
  }

  buildAxisRings() {
    const radius = 1.0;
    const tubeRadius = 0.04;
    const segments = 64;

    // Materials (Blender style: Red=X, Green=Y, Blue=Z)
    this.materials = {
      X: new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, depthTest: false }),
      Y: new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, depthTest: false }),
      Z: new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, depthTest: false }),
      highlight: new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, depthTest: false })
    };

    // 1. Red Ring (X Axis) - Rotated to YZ plane
    const geoX = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringX = new THREE.Mesh(geoX, this.materials.X);
    ringX.rotation.y = Math.PI / 2;
    ringX.renderOrder = 999;
    ringX.userData = { axis: 'X', isGizmoRing: true };
    this.gizmoRoot.add(ringX);
    this.rings.X = ringX;

    // 2. Green Ring (Y Axis) - In XZ plane
    const geoY = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringY = new THREE.Mesh(geoY, this.materials.Y);
    ringY.rotation.x = Math.PI / 2;
    ringY.renderOrder = 999;
    ringY.userData = { axis: 'Y', isGizmoRing: true };
    this.gizmoRoot.add(ringY);
    this.rings.Y = ringY;

    // 3. Blue Ring (Z Axis) - In XY plane
    const geoZ = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringZ = new THREE.Mesh(geoZ, this.materials.Z);
    ringZ.renderOrder = 999;
    ringZ.userData = { axis: 'Z', isGizmoRing: true };
    this.gizmoRoot.add(ringZ);
    this.rings.Z = ringZ;

    // Axis visual indicators / arrows
    this.createAxisBadge('X', 0xef4444, new THREE.Vector3(radius + 0.18, 0, 0));
    this.createAxisBadge('Y', 0x10b981, new THREE.Vector3(0, radius + 0.18, 0));
    this.createAxisBadge('Z', 0x3b82f6, new THREE.Vector3(0, 0, radius + 0.18));
  }

  createAxisBadge(text, colorHex, pos) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.set(0.35, 0.35, 1);
    sprite.renderOrder = 1000;
    this.gizmoRoot.add(sprite);
  }

  /**
   * Attach Gizmo to any Selected Object or Model
   */
  attach(objectOrModel) {
    this.selectedBody = objectOrModel;
    this.targetGroup = objectOrModel.group || (objectOrModel.isObject3D ? objectOrModel : null);
    this.gizmoRoot.visible = true;
    this.continuousSpinAxis = null;
    this.updateTransform();
  }

  detach() {
    this.selectedBody = null;
    this.targetGroup = null;
    this.activeAxis = null;
    this.isDragging = false;
    this.continuousSpinAxis = null;
    this.gizmoRoot.visible = false;
    this.resetRingColors();
  }

  /**
   * Update Gizmo Position and Scaling
   */
  updateTransform() {
    if (!this.selectedBody || !this.gizmoRoot.visible) return;

    if (this.selectedBody.getWorldPosition) {
      this.selectedBody.getWorldPosition(this.centerPos);
    } else if (this.targetGroup) {
      this.targetGroup.getWorldPosition(this.centerPos);
    }
    this.gizmoRoot.position.copy(this.centerPos);

    // Keep gizmo aligned with object's orientation
    if (this.selectedBody.tiltGroup) {
      this.gizmoRoot.quaternion.copy(this.selectedBody.tiltGroup.getWorldQuaternion(new THREE.Quaternion()));
    } else if (this.targetGroup) {
      this.gizmoRoot.quaternion.copy(this.targetGroup.getWorldQuaternion(new THREE.Quaternion()));
    }

    // Screen-space constant scale based on camera distance
    const dist = this.camera.position.distanceTo(this.centerPos);
    const r = this.selectedBody.radius || 2.0;
    const scaleFactor = Math.max(r * 1.5, Math.min(dist * 0.18, 30));
    this.gizmoRoot.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  rotateAxis(axis, deltaRad) {
    const grp = this.targetGroup || (this.selectedBody ? (this.selectedBody.group || this.selectedBody) : null);
    if (!grp) return;

    if (axis === 'X') {
      grp.rotation.x += deltaRad;
    } else if (axis === 'Y') {
      grp.rotation.y += deltaRad;
    } else if (axis === 'Z') {
      grp.rotation.z += deltaRad;
    }
  }

  startContinuousRotation(axis = 'Y') {
    this.continuousSpinAxis = axis;
  }

  stopContinuousRotation() {
    this.continuousSpinAxis = null;
  }

  update(delta) {
    if (!this.gizmoRoot.visible) return;

    this.updateTransform();

    // Continuous spin if enabled
    if (this.continuousSpinAxis) {
      this.rotateAxis(this.continuousSpinAxis, this.continuousSpinSpeed * delta);
    }
  }

  resetRingColors() {
    this.rings.X.material = this.materials.X;
    this.rings.Y.material = this.materials.Y;
    this.rings.Z.material = this.materials.Z;
  }
}
