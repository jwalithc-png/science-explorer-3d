import * as THREE from 'three';

/**
 * Selection Manager with Raycasting Hierarchy & Smooth Fly-To Focus
 * Supports accurate raycasting on both Single Screen and Dual-Screen Stereoscopic VR on PC.
 */
export class SelectionManager {
  constructor(solarSystem, camera, gizmo, domElement, sceneManager = null) {
    this.solarSystem = solarSystem;
    this.camera = camera;
    this.gizmo = gizmo;
    this.domElement = domElement;
    this.sceneManager = sceneManager;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectedBody = null;
    this.trackedBody = null;

    // Smooth Fly-To Animation State
    this.isFlying = false;
    this.flyStartPos = new THREE.Vector3();
    this.flyTargetPos = new THREE.Vector3();
    this.flyStartLook = new THREE.Vector3();
    this.flyTargetLook = new THREE.Vector3();
    this.flyProgress = 0;
    this.flyDuration = 1.6; // Seconds

    // Callbacks
    this.onSelectionChanged = null;

    // Mouse Tracking for Click vs Drag differentiation
    this.mouseDownPos = { x: 0, y: 0 };
    this.dragThreshold = 6; // Pixels
    this.lastClickTime = 0;

    this.initEvents();
  }

  initEvents() {
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.domElement.addEventListener('pointerup', (e) => this.onPointerUp(e));
  }

  updateMouseAndRaycaster(e) {
    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (this.sceneManager && this.sceneManager.isSplitScreenVR && this.sceneManager.stereoCamera) {
      const halfWidth = width / 2;
      const isRightEye = clientX >= halfWidth;
      const activeCam = isRightEye ? this.sceneManager.stereoCamera.cameraR : this.sceneManager.stereoCamera.cameraL;
      const subX = isRightEye ? (clientX - halfWidth) : clientX;

      this.mouse.x = (subX / halfWidth) * 2 - 1;
      this.mouse.y = -(clientY / height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, activeCam);
    } else {
      this.mouse.x = (clientX / width) * 2 - 1;
      this.mouse.y = -(clientY / height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
    }
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    this.updateMouseAndRaycaster(e);

    // Priority 1: Check Gizmo Rings intersection first
    const ringHit = this.gizmo.intersectRings(this.raycaster);
    if (ringHit) {
      const axis = ringHit.object.userData.axis;
      this.gizmo.startDrag(axis, this.raycaster);
      e.stopPropagation();
    }
  }

  onPointerMove(e) {
    this.updateMouseAndRaycaster(e);

    // If currently dragging Gizmo
    if (this.gizmo.isDragging) {
      this.gizmo.onDrag(this.raycaster);
      return;
    }

    // Check Gizmo Hover Highlights
    const ringHit = this.gizmo.intersectRings(this.raycaster);
    if (ringHit) {
      this.gizmo.setHoverAxis(ringHit.object.userData.axis);
      this.domElement.style.cursor = 'grab';
    } else {
      this.gizmo.setHoverAxis(null);
      this.domElement.style.cursor = 'default';
    }
  }

  onPointerUp(e) {
    if (e.button !== 0) return;

    if (this.gizmo.isDragging) {
      this.gizmo.endDrag();
      return;
    }

    // Check if movement was minimal (Click vs Drag)
    const dist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y);
    if (dist < this.dragThreshold) {
      this.handleClick(e);
    }
  }

  handleClick(e) {
    this.updateMouseAndRaycaster(e);

    // Double click detection
    const now = performance.now();
    const isDoubleClick = (now - this.lastClickTime) < 300;
    this.lastClickTime = now;

    // Collect all pickable meshes from solar bodies and moons
    const pickables = [];
    for (const body of this.solarSystem.bodies.values()) {
      if (body.bodyMesh) pickables.push(body.bodyMesh);
      if (body.cloudsMesh) pickables.push(body.cloudsMesh);
      for (const moon of body.moons) {
        if (moon.bodyMesh) pickables.push(moon.bodyMesh);
      }
    }

    const hits = this.raycaster.intersectObjects(pickables, false);

    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const celestialBody = hitObj.userData.celestialBody;
      if (celestialBody) {
        this.selectBody(celestialBody);
        if (isDoubleClick) {
          this.flyToBody(celestialBody);
        }
      }
    } else {
      // Clicked on empty deep space -> clear selection
      this.clearSelection();
    }
  }

  selectBody(celestialBody) {
    if (this.selectedBody === celestialBody) return;

    // Remove halo from old selection
    if (this.selectedBody && this.selectedBody.selectionHalo) {
      this.selectedBody.selectionHalo.visible = false;
    }

    this.selectedBody = celestialBody;

    if (this.selectedBody) {
      if (this.selectedBody.selectionHalo) {
        this.selectedBody.selectionHalo.visible = true;
      }
      this.gizmo.attach(this.selectedBody);
    } else {
      this.gizmo.detach();
    }

    if (this.onSelectionChanged) {
      this.onSelectionChanged(this.selectedBody);
    }
  }

  clearSelection() {
    this.selectBody(null);
    this.trackedBody = null;
  }

  /**
   * Smooth Cinematic Fly-To Celestial Target
   */
  flyToBody(celestialBody) {
    if (!celestialBody) return;
    this.selectBody(celestialBody);

    const worldPos = new THREE.Vector3();
    celestialBody.getWorldPosition(worldPos);

    const offsetDist = Math.max(celestialBody.radius * 3.5, 12.0);
    const viewOffset = new THREE.Vector3(offsetDist * 0.8, offsetDist * 0.4, offsetDist * 0.8);
    
    this.flyStartPos.copy(this.camera.position);
    this.flyTargetPos.copy(worldPos).add(viewOffset);

    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.flyStartLook.copy(this.camera.position).add(dir.multiplyScalar(50));
    this.flyTargetLook.copy(worldPos);

    this.isFlying = true;
    this.flyProgress = 0;
  }

  update(deltaTime) {
    // 1. Keep Gizmo synchronized with selected body
    if (this.selectedBody) {
      this.gizmo.updateTransform();
    }

    // 2. Camera Smooth Fly-To Interpolation
    if (this.isFlying) {
      this.flyProgress += deltaTime / this.flyDuration;
      if (this.flyProgress >= 1.0) {
        this.flyProgress = 1.0;
        this.isFlying = false;
        this.camera.position.copy(this.flyTargetPos);
        this.camera.lookAt(this.flyTargetLook);
      } else {
        const t = this.flyProgress;
        const ease = t * t * (3 - 2 * t);

        this.camera.position.lerpVectors(this.flyStartPos, this.flyTargetPos, ease);
        const currLook = new THREE.Vector3().lerpVectors(this.flyStartLook, this.flyTargetLook, ease);
        this.camera.lookAt(currLook);
      }
    }

    // 3. Camera Track Target Mode
    if (this.trackedBody && !this.isFlying) {
      const targetPos = new THREE.Vector3();
      this.trackedBody.getWorldPosition(targetPos);
      this.camera.lookAt(targetPos);
    }
  }
}
