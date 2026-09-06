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
    this.activeAxis = null;
    this.activeHoverAxis = null; // 'X', 'Y', 'Z' or null
    this.isDragging = false;
    this.dragAxis = null;

    // Continuous axis spin state
    this.continuousSpinAxis = null;
    this.continuousSpinSpeed = 1.4;

    // Root gizmo container attached to the scene
    this.gizmoRoot = new THREE.Group();
    this.gizmoRoot.name = 'Blender_Rotation_Gizmo_XYZ';
    this.gizmoRoot.visible = false;
    this.scene.add(this.gizmoRoot);

    this.centerPos = new THREE.Vector3();

    // Hit-testing proxy array and visual elements by axis
    this.hitObjects = [];
    this.visuals = { X: [], Y: [], Z: [] };
    this.rings = {};

    this.initMaterials();
    this.buildAxisRingsAndLines();
    this.initDomListeners();
  }

  initMaterials() {
    this.materials = {
      X: new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, depthTest: false }),
      Y: new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, depthTest: false }),
      Z: new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, depthTest: false }),
      highlight: new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, depthTest: false })
    };
  }

  buildAxisRingsAndLines() {
    const ringRadius = 0.85;
    const ringTubeRadius = 0.022;
    const hitTubeRadius = 0.16; // Invisible hit-proxy for effortless mouse targeting
    const lineRadius = 0.016;
    const lineLength = 1.05; // Compact, smaller lines
    const hitLineRadius = 0.15;

    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

    // =========================================================================
    // 1. RED X AXIS (Pitch: YZ Plane ring + X Direction Line & Cone Arrow)
    // =========================================================================
    const geoRingX = new THREE.TorusGeometry(ringRadius, ringTubeRadius, 16, 64);
    const ringX = new THREE.Mesh(geoRingX, this.materials.X);
    ringX.rotation.y = Math.PI / 2;
    ringX.renderOrder = 999;
    this.gizmoRoot.add(ringX);
    this.visuals.X.push(ringX);
    this.rings.X = ringX;

    const hitGeoRingX = new THREE.TorusGeometry(ringRadius, hitTubeRadius, 12, 32);
    const hitRingX = new THREE.Mesh(hitGeoRingX, hitMaterial);
    hitRingX.rotation.y = Math.PI / 2;
    hitRingX.userData = { axis: 'X', isGizmo: true };
    this.gizmoRoot.add(hitRingX);
    this.hitObjects.push(hitRingX);

    const geoLineX = new THREE.CylinderGeometry(lineRadius, lineRadius, lineLength, 16);
    const lineX = new THREE.Mesh(geoLineX, this.materials.X);
    lineX.rotation.z = Math.PI / 2;
    lineX.renderOrder = 998;
    this.gizmoRoot.add(lineX);
    this.visuals.X.push(lineX);

    const geoArrowX = new THREE.ConeGeometry(0.045, 0.11, 16);
    const arrowX = new THREE.Mesh(geoArrowX, this.materials.X);
    arrowX.position.set(lineLength * 0.5 + 0.05, 0, 0);
    arrowX.rotation.z = -Math.PI / 2;
    arrowX.renderOrder = 999;
    this.gizmoRoot.add(arrowX);
    this.visuals.X.push(arrowX);

    const hitLineGeoX = new THREE.CylinderGeometry(hitLineRadius, hitLineRadius, lineLength + 0.15, 8);
    const hitLineX = new THREE.Mesh(hitLineGeoX, hitMaterial);
    hitLineX.rotation.z = Math.PI / 2;
    hitLineX.userData = { axis: 'X', isGizmo: true };
    this.gizmoRoot.add(hitLineX);
    this.hitObjects.push(hitLineX);

    this.createAxisBadge('X', 0xef4444, new THREE.Vector3(ringRadius + 0.16, 0, 0));

    // =========================================================================
    // 2. GREEN Y AXIS (Yaw: XZ Plane ring + Y Direction Line & Cone Arrow)
    // =========================================================================
    const geoRingY = new THREE.TorusGeometry(ringRadius, ringTubeRadius, 16, 64);
    const ringY = new THREE.Mesh(geoRingY, this.materials.Y);
    ringY.rotation.x = Math.PI / 2;
    ringY.renderOrder = 999;
    this.gizmoRoot.add(ringY);
    this.visuals.Y.push(ringY);
    this.rings.Y = ringY;

    const hitGeoRingY = new THREE.TorusGeometry(ringRadius, hitTubeRadius, 12, 32);
    const hitRingY = new THREE.Mesh(hitGeoRingY, hitMaterial);
    hitRingY.rotation.x = Math.PI / 2;
    hitRingY.userData = { axis: 'Y', isGizmo: true };
    this.gizmoRoot.add(hitRingY);
    this.hitObjects.push(hitRingY);

    const geoLineY = new THREE.CylinderGeometry(lineRadius, lineRadius, lineLength, 16);
    const lineY = new THREE.Mesh(geoLineY, this.materials.Y);
    lineY.renderOrder = 998;
    this.gizmoRoot.add(lineY);
    this.visuals.Y.push(lineY);

    const geoArrowY = new THREE.ConeGeometry(0.045, 0.11, 16);
    const arrowY = new THREE.Mesh(geoArrowY, this.materials.Y);
    arrowY.position.set(0, lineLength * 0.5 + 0.05, 0);
    arrowY.renderOrder = 999;
    this.gizmoRoot.add(arrowY);
    this.visuals.Y.push(arrowY);

    const hitLineGeoY = new THREE.CylinderGeometry(hitLineRadius, hitLineRadius, lineLength + 0.15, 8);
    const hitLineY = new THREE.Mesh(hitLineGeoY, hitMaterial);
    hitLineY.userData = { axis: 'Y', isGizmo: true };
    this.gizmoRoot.add(hitLineY);
    this.hitObjects.push(hitLineY);

    this.createAxisBadge('Y', 0x10b981, new THREE.Vector3(0, ringRadius + 0.16, 0));

    // =========================================================================
    // 3. BLUE Z AXIS (Roll: XY Plane ring + Z Direction Line & Cone Arrow)
    // =========================================================================
    const geoRingZ = new THREE.TorusGeometry(ringRadius, ringTubeRadius, 16, 64);
    const ringZ = new THREE.Mesh(geoRingZ, this.materials.Z);
    ringZ.renderOrder = 999;
    this.gizmoRoot.add(ringZ);
    this.visuals.Z.push(ringZ);
    this.rings.Z = ringZ;

    const hitGeoRingZ = new THREE.TorusGeometry(ringRadius, hitTubeRadius, 12, 32);
    const hitRingZ = new THREE.Mesh(hitGeoRingZ, hitMaterial);
    hitRingZ.userData = { axis: 'Z', isGizmo: true };
    this.gizmoRoot.add(hitRingZ);
    this.hitObjects.push(hitRingZ);

    const geoLineZ = new THREE.CylinderGeometry(lineRadius, lineRadius, lineLength, 16);
    const lineZ = new THREE.Mesh(geoLineZ, this.materials.Z);
    lineZ.rotation.x = Math.PI / 2;
    lineZ.renderOrder = 998;
    this.gizmoRoot.add(lineZ);
    this.visuals.Z.push(lineZ);

    const geoArrowZ = new THREE.ConeGeometry(0.045, 0.11, 16);
    const arrowZ = new THREE.Mesh(geoArrowZ, this.materials.Z);
    arrowZ.position.set(0, 0, lineLength * 0.5 + 0.05);
    arrowZ.rotation.x = Math.PI / 2;
    arrowZ.renderOrder = 999;
    this.gizmoRoot.add(arrowZ);
    this.visuals.Z.push(arrowZ);

    const hitLineGeoZ = new THREE.CylinderGeometry(hitLineRadius, hitLineRadius, lineLength + 0.15, 8);
    const hitLineZ = new THREE.Mesh(hitLineGeoZ, hitMaterial);
    hitLineZ.rotation.x = Math.PI / 2;
    hitLineZ.userData = { axis: 'Z', isGizmo: true };
    this.gizmoRoot.add(hitLineZ);
    this.hitObjects.push(hitLineZ);

    this.createAxisBadge('Z', 0x3b82f6, new THREE.Vector3(0, 0, ringRadius + 0.16));
  }

  createAxisBadge(text, colorHex, pos) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.set(0.22, 0.22, 1);
    sprite.renderOrder = 1000;
    sprite.userData = { axis: text, isGizmo: true };
    this.gizmoRoot.add(sprite);
    this.hitObjects.push(sprite);
  }

  // =========================================================================
  // RAYCASTING & HOVER HIGHLIGHTING
  // =========================================================================
  checkRay(raycaster) {
    if (!this.gizmoRoot.visible || this.hitObjects.length === 0) return null;

    const intersects = raycaster.intersectObjects(this.hitObjects, true);
    if (intersects && intersects.length > 0) {
      for (const hit of intersects) {
        if (hit.object && hit.object.userData && hit.object.userData.axis) {
          const axis = hit.object.userData.axis;
          this.setHoverAxis(axis);
          return axis;
        }
      }
    }

    this.clearHover();
    return null;
  }

  setHoverAxis(axis) {
    if (this.activeHoverAxis === axis) return;
    this.activeHoverAxis = axis;
    this.updateMaterials();
  }

  clearHover() {
    if (this.activeHoverAxis !== null) {
      this.activeHoverAxis = null;
      this.updateMaterials();
    }
  }

  updateMaterials() {
    const isX = this.activeHoverAxis === 'X';
    const isY = this.activeHoverAxis === 'Y';
    const isZ = this.activeHoverAxis === 'Z';

    const matX = isX ? this.materials.highlight : this.materials.X;
    const matY = isY ? this.materials.highlight : this.materials.Y;
    const matZ = isZ ? this.materials.highlight : this.materials.Z;

    if (this.visuals.X) this.visuals.X.forEach(m => { m.material = matX; });
    if (this.visuals.Y) this.visuals.Y.forEach(m => { m.material = matY; });
    if (this.visuals.Z) this.visuals.Z.forEach(m => { m.material = matZ; });
  }

  // =========================================================================
  // INTERACTIVE LINE-DIRECTION ROTATION
  // =========================================================================
  /**
   * Rotates the attached object along the specified axis line direction.
   * @param {string} axis - 'X', 'Y', or 'Z'
   * @param {number} deltaX - Horizontal delta movement
   * @param {number} deltaY - Vertical delta movement
   */
  rotateOnAxis(axis, deltaX, deltaY) {
    const grp = this.targetGroup || (this.selectedBody ? (this.selectedBody.inspectPivot || this.selectedBody.group || this.selectedBody) : null);
    if (!grp) return;

    const speed = 0.018;
    let dAngle = 0;

    if (axis === 'X') {
      // Red X Axis (Pitch): moving vertically (or along projected line) pitches the object
      dAngle = (-deltaY * speed) + (deltaX * speed * 0.25);
      grp.rotation.x += dAngle;
    } else if (axis === 'Y') {
      // Green Y Axis (Yaw): moving horizontally (or along projected line) turns the object
      dAngle = (deltaX * speed) + (deltaY * speed * 0.25);
      grp.rotation.y += dAngle;
    } else if (axis === 'Z') {
      // Blue Z Axis (Roll): moving diagonally rolls the object
      dAngle = (deltaX - deltaY) * (speed * 0.85);
      grp.rotation.z += dAngle;
    }

    // Keep internal simulation mesh aligned if present
    if (this.selectedBody && this.selectedBody.mesh && axis === 'Y') {
      this.selectedBody.mesh.rotation.y += dAngle;
    }
  }

  rotateAxis(axis, deltaRad) {
    const grp = this.targetGroup || (this.selectedBody ? (this.selectedBody.inspectPivot || this.selectedBody.group || this.selectedBody) : null);
    if (!grp) return;

    if (axis === 'X') grp.rotation.x += deltaRad;
    else if (axis === 'Y') grp.rotation.y += deltaRad;
    else if (axis === 'Z') grp.rotation.z += deltaRad;
  }

  startContinuousRotation(axis = 'Y') {
    this.continuousSpinAxis = axis;
  }

  stopContinuousRotation() {
    this.continuousSpinAxis = null;
  }

  // =========================================================================
  // LIFECYCLE & TRANSFORM TRACKING
  // =========================================================================
  attach(objectOrModel) {
    this.selectedBody = objectOrModel;
    this.targetGroup = objectOrModel.inspectPivot || objectOrModel.group || (objectOrModel.isObject3D ? objectOrModel : null);
    this.gizmoRoot.visible = true;
    this.continuousSpinAxis = null;
    this.updateTransform();
  }

  detach() {
    this.selectedBody = null;
    this.targetGroup = null;
    this.activeAxis = null;
    this.activeHoverAxis = null;
    this.isDragging = false;
    this.dragAxis = null;
    this.continuousSpinAxis = null;
    this.gizmoRoot.visible = false;
    this.updateMaterials();
  }

  updateTransform() {
    if (!this.selectedBody || !this.gizmoRoot.visible) return;

    if (this.selectedBody.getWorldPosition) {
      this.selectedBody.getWorldPosition(this.centerPos);
    } else if (this.targetGroup) {
      this.targetGroup.getWorldPosition(this.centerPos);
    }
    this.gizmoRoot.position.copy(this.centerPos);

    // Keep gizmo aligned with object orientation
    if (this.selectedBody.tiltGroup) {
      this.gizmoRoot.quaternion.copy(this.selectedBody.tiltGroup.getWorldQuaternion(new THREE.Quaternion()));
    } else if (this.targetGroup) {
      this.gizmoRoot.quaternion.copy(this.targetGroup.getWorldQuaternion(new THREE.Quaternion()));
    }

    // Screen-space constant scale based on camera distance - compact & smaller, tightly fitted
    const dist = this.camera.position.distanceTo(this.centerPos);
    const r = this.selectedBody.radius || (this.selectedBody.data && this.selectedBody.data.radius) || 1.8;
    const scaleFactor = Math.max(r * 1.12, Math.min(dist * 0.08, 6.0));
    this.gizmoRoot.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  update(delta) {
    if (!this.gizmoRoot.visible) return;

    this.updateTransform();

    // Continuous spin if enabled
    if (this.continuousSpinAxis) {
      this.rotateAxis(this.continuousSpinAxis, this.continuousSpinSpeed * delta);
    }
  }

  // =========================================================================
  // DIRECT DESKTOP / TOUCH LISTENERS
  // =========================================================================
  initDomListeners() {
    if (!this.domElement) return;

    let prevX = 0, prevY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e) => {
      if (!this.gizmoRoot.visible) return;
      const rect = this.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const hitAxis = this.checkRay(raycaster);

      const targetAxis = hitAxis || this.activeHoverAxis;
      if (targetAxis) {
        this.isDragging = true;
        this.dragAxis = targetAxis;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerMove = (e) => {
      if (!this.gizmoRoot.visible) return;
      if (this.isDragging && this.dragAxis) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        this.rotateOnAxis(this.dragAxis, dx, dy);
      } else {
        const rect = this.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        this.checkRay(raycaster);
      }
    };

    const onPointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragAxis = null;
      }
    };

    this.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
  }
}
