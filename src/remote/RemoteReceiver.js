/**
 * Remote Control Receiver
 * 
 * Connects to the WebSocket relay and applies commands from the PC controller
 * to the mobile viewer — with FULL support for WebXR (ENTER VR) mode and standard mode!
 */
export class RemoteReceiver {
  constructor({ camera, controls, vrManager, solarSystem, selectionManager, cinematicIntro, onToast }) {
    this.camera = camera;
    this.controls = controls;
    this.vrManager = vrManager;
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.cinematicIntro = cinematicIntro;
    this.onToast = onToast;

    this.ws = null;
    this.reconnectTimer = null;
    this.isDestroyed = false;

    // Connect after a short delay
    setTimeout(() => this.connect(), 800);
  }

  isInWebXR() {
    return this.vrManager && (this.vrManager.isInVR || this.vrManager.renderer.xr.isPresenting);
  }

  connect() {
    if (this.isDestroyed) return;
    if (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1)) return;

    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = location.host;
      this.ws = new WebSocket(`${protocol}//${host}/ws-remote`);

      this.ws.onopen = () => {
        if (this.onToast) this.onToast('🖱️ PC REMOTE CONTROLLER PAIRED');
        try {
          this.ws.send(JSON.stringify({ type: 'hello', role: 'viewer' }));
        } catch (e) {}
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {}
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {};
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.isDestroyed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;

    const inVR = this.isInWebXR();

    switch (msg.type) {
      case 'drag':
        // Mouse drag on PC → rotate view (360° yaw/pitch)
        if (inVR && this.vrManager.applyRemoteDrag) {
          this.vrManager.applyRemoteDrag(msg.dx, msg.dy);
        } else if (this.controls && this.controls.applyDrag) {
          this.controls.applyDrag(msg.dx, msg.dy);
        }
        break;

      case 'zoom':
        // Scroll wheel on PC → zoom / thrust
        if (inVR && this.vrManager.applyRemoteZoom) {
          this.vrManager.applyRemoteZoom(msg.delta);
        } else if (this.controls && this.controls.applyZoom) {
          this.controls.applyZoom(msg.delta);
        }
        break;

      case 'play_animation':
      case 'tour':
        // Play Planetary Animation & Cinematic Tour
        if (this.solarSystem) {
          this.solarSystem.globalAnimEnabled = true;
          this.solarSystem.isPaused = false;
        }
        if (this.cinematicIntro) {
          const isTouring = this.cinematicIntro.toggleTour();
          if (this.onToast) {
            this.onToast(isTouring ? '🎬 SOLAR ANIMATION TOUR ACTIVE (A)' : '⏹ TOUR STOPPED // MANUAL EXPLORATION');
          }
        }
        break;

      case 'keydown':
        if (msg.key === 'KeyA') {
          // Key A plays animation tour
          if (this.solarSystem) {
            this.solarSystem.globalAnimEnabled = true;
            this.solarSystem.isPaused = false;
          }
          if (this.cinematicIntro) {
            const isTouring = this.cinematicIntro.toggleTour();
            if (this.onToast) {
              this.onToast(isTouring ? '🎬 SOLAR ANIMATION TOUR ACTIVE (A)' : '⏹ TOUR STOPPED');
            }
          }
          return;
        }

        if (inVR && this.vrManager.setRemoteKey) {
          this.vrManager.setRemoteKey(msg.key, true);
        }
        if (this.controls && this.controls.onKeyDown) {
          this.controls.onKeyDown({ code: msg.key, preventDefault: () => {} });
        }
        break;

      case 'keyup':
        if (inVR && this.vrManager.setRemoteKey) {
          this.vrManager.setRemoteKey(msg.key, false);
        }
        if (this.controls && this.controls.onKeyUp) {
          this.controls.onKeyUp({ code: msg.key, preventDefault: () => {} });
        }
        break;

      case 'flyto':
        this.flyToPlanet(msg.planet);
        break;

      case 'reset':
        if (this.cinematicIntro) {
          this.cinematicIntro.stopTour();
        }
        if (inVR && this.vrManager.resetView) {
          this.vrManager.resetView();
        } else {
          this.camera.position.set(0, 140, 320);
          this.camera.lookAt(0, 0, 0);
          if (this.controls) {
            this.controls.velocity.set(0, 0, 0);
            this.controls.zoomVelocity = 0;
            this.controls.rotationVelocity = { x: 0, y: 0 };
            this.controls.manualYaw = 0;
            this.controls.manualPitch = 0;
          }
        }
        if (this.selectionManager) {
          this.selectionManager.clearSelection();
        }
        if (this.onToast) this.onToast('🔄 VIEW RESET TO OVERVIEW');
        break;
    }
  }

  flyToPlanet(name) {
    const body = this.solarSystem.getBody(name);
    if (body) {
      if (this.cinematicIntro) {
        this.cinematicIntro.stopTour();
      }
      if (this.selectionManager) {
        this.selectionManager.selectBody(body);
      }

      if (this.isInWebXR() && this.vrManager.flyToPlanet) {
        this.vrManager.flyToPlanet(body);
      } else if (this.selectionManager) {
        this.selectionManager.flyToBody(body);
      }

      if (this.onToast) this.onToast(`🪐 FLYING TO ${name.toUpperCase()}`);
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
  }
}
