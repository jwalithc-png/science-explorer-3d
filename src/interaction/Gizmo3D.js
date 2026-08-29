import * as THREE from 'three';

/**
 * 3D Blender-Style Rotation Gizmo
 * Implements real 3D Torus Axis Rings (Red = X, Green = Y, Blue = Z)
 * Uses ray-plane intersection and Quaternion rotations to avoid gimbal lock.
 */
export class Gizmo3D {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.selectedBody = null;
    this.activeAxis = null; // 'X', 'Y', 'Z' or null
    this.isDragging = false;

    // Root gizmo container attached to the scene
    this.gizmoRoot = new THREE.Group();
    this.gizmoRoot.name = 'Blender_Rotation_Gizmo';
    this.gizmoRoot.visible = false;
    this.scene.add(this.gizmoRoot);

    // Plane for Raycaster Drag Tracking
    this.dragPlane = new THREE.Plane();
    this.dragPlaneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.scene.add(this.dragPlaneMesh);

    // Previous drag intersection point
    this.prevDragPoint = new THREE.Vector3();
    this.centerPos = new THREE.Vector3();

    // Build the 3 axis rings
    this.rings = {};
    this.buildAxisRings();
  }

  buildAxisRings() {
    const radius = 1.0;
    const tubeRadius = 0.035;
    const segments = 64;

    // Materials
    this.materials = {
      X: new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }),
      Y: new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }),
      Z: new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide }),
      highlight: new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    };

    // 1. Red Ring (X Axis) - Perpendicular to X (Rotated to YZ plane)
    const geoX = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringX = new THREE.Mesh(geoX, this.materials.X);
    ringX.rotation.y = Math.PI / 2;
    ringX.userData = { axis: 'X', isGizmoRing: true };
    this.gizmoRoot.add(ringX);
    this.rings.X = ringX;

    // 2. Green Ring (Y Axis) - Perpendicular to Y (XZ plane)
    const geoY = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringY = new THREE.Mesh(geoY, this.materials.Y);
    ringY.rotation.x = Math.PI / 2;
    ringY.userData = { axis: 'Y', isGizmoRing: true };
    this.gizmoRoot.add(ringY);
    this.rings.Y = ringY;

    // 3. Blue Ring (Z Axis) - Perpendicular to Z (XY plane)
    const geoZ = new THREE.TorusGeometry(radius, tubeRadius, 16, segments);
    const ringZ = new THREE.Mesh(geoZ, this.materials.Z);
    ringZ.userData = { axis: 'Z', isGizmoRing: true };
    this.gizmoRoot.add(ringZ);
    this.rings.Z = ringZ;
  }

  /**
   * Attach Gizmo to a Selected CelestialBody
   */
  attach(celestialBody) {
    this.selectedBody = celestialBody;
    this.gizmoRoot.visible = true;
    this.updateTransform();
  }

  /**
   * Detach Gizmo
   */
  detach() {
    this.selectedBody = null;
    this.activeAxis = null;
    this.isDragging = false;
    this.gizmoRoot.visible = false;
    this.resetRingColors();
  }

  /**
   * Update Gizmo Position and Screen-Space Scaling
   */
  updateTransform() {
    if (!this.selectedBody || !this.gizmoRoot.visible) return;

    this.selectedBody.getWorldPosition(this.centerPos);
    this.gizmoRoot.position.copy(this.centerPos);

    // Keep gizmo aligned with object's tilt group orientation
    this.gizmoRoot.quaternion.copy(this.selectedBody.tiltGroup.getWorldQuaternion(new THREE.Quaternion()));

    // Screen-space constant scale based on camera distance
    const dist = this.camera.position.distanceTo(this.centerPos);
    const scaleFactor = Math.max(this.selectedBody.radius * 1.5, dist * 0.12);
    this.gizmoRoot.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  /**
   * Test if ray intersects any gizmo ring
   */
  intersectRings(raycaster) {
    if (!this.gizmoRoot.visible) return null;
    const ringMeshes = [this.rings.X, this.rings.Y, this.rings.Z];
    const hits = raycaster.intersectObjects(ringMeshes, false);
    return hits.length > 0 ? hits[0] : null;
  }

  /**
   * Start Ring Drag Interaction
   */
  startDrag(axis, raycaster) {
    if (!this.selectedBody) return false;
    this.activeAxis = axis;
    this.isDragging = true;

    // Highlight active ring
    this.resetRingColors();
    if (this.rings[axis]) {
      this.rings[axis].material = this.materials.highlight;
    }

    // Set drag plane normal aligned with the selected rotation axis in world coordinates
    const planeNormal = new THREE.Vector3();
    if (axis === 'X') planeNormal.set(1, 0, 0);
    else if (axis === 'Y') planeNormal.set(0, 1, 0);
    else if (axis === 'Z') planeNormal.set(0, 0, 1);

    planeNormal.applyQuaternion(this.gizmoRoot.quaternion).normalize();
    this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, this.centerPos);

    // Initial ray-plane intersection point
    raycaster.ray.intersectPlane(this.dragPlane, this.prevDragPoint);
    return true;
  }

  /**
   * Handle Ring Drag Move
   */
  onDrag(raycaster) {
    if (!this.isDragging || !this.activeAxis || !this.selectedBody) return;

    const currentPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(this.dragPlane, currentPoint)) {
      // Calculate angle delta around centerPos relative to planeNormal
      const vPrev = this.prevDragPoint.clone().sub(this.centerPos).normalize();
      const vCurr = currentPoint.clone().sub(this.centerPos).normalize();

      const planeNormal = this.dragPlane.normal;
      const cross = new THREE.Vector3().crossVectors(vPrev, vCurr);
      let angle = vPrev.angleTo(vCurr);

      if (cross.dot(planeNormal) < 0) {
        angle = -angle;
      }

      if (!isNaN(angle) && Math.abs(angle) > 0.0001) {
        // Apply quaternion delta rotation directly to the object's manual rotation group
        this.selectedBody.applyManualRotation(this.activeAxis, angle);
      }

      this.prevDragPoint.copy(currentPoint);
    }
  }

  /**
   * Stop Drag Interaction
   */
  endDrag() {
    this.isDragging = false;
    this.activeAxis = null;
    this.resetRingColors();
  }

  /**
   * Hover highlight for UI feedback
   */
  setHoverAxis(axis) {
    if (this.isDragging) return;
    this.resetRingColors();
    if (axis && this.rings[axis]) {
      this.rings[axis].material = this.materials.highlight;
    }
  }

  resetRingColors() {
    this.rings.X.material = this.materials.X;
    this.rings.Y.material = this.materials.Y;
    this.rings.Z.material = this.materials.Z;
  }
}
