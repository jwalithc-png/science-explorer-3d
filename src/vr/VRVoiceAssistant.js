import * as THREE from 'three';

/**
 * AI Voice Assistant & Speech Control for Solar System VR & WebXR
 * 
 * Voice Commands:
 * - "GO FORWARD" / "FORWARD" / "GO FRONT"
 * - "GO BACK" / "BACKWARD" / "REVERSE"
 * - "ZOOM" / "ZOOM IN"
 * - "ZOOM OUT"
 * - "TURN LEFT" / "ROTATE LEFT"
 * - "TURN RIGHT" / "ROTATE RIGHT"
 * - "STOP" / "HALT"
 * - "PLAY ANIMATION" / "START ANIMATION"
 * - "PAUSE ANIMATION"
 * - "FLY TO [PLANET]"
 * - "START TOUR"
 * - "RESET" / "OVERVIEW"
 */
export class VRVoiceAssistant {
  constructor({ solarSystem, selectionManager, navigationControls, vrGazeController, vrManager, camera, cinematicIntro, onToast }) {
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.navigationControls = navigationControls;
    this.vrGazeController = vrGazeController;
    this.vrManager = vrManager;
    this.camera = camera;
    this.cinematicIntro = cinematicIntro;
    this.onToast = onToast;

    this.isListening = false;
    this.recognition = null;
    this.speechSynthesis = window.speechSynthesis || null;

    this.initRecognition();
    this.createVoiceStatusUI();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatusBadge('🎙️ LISTENING...');
      };

      this.recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim().toLowerCase();
          this.processCommand(transcript);
        }
      };

      this.recognition.onerror = () => {};

      this.recognition.onend = () => {
        if (this.isListening) {
          try { this.recognition.start(); } catch (e) {}
        }
      };
    } catch (e) {}
  }

  createVoiceStatusUI() {
    this.statusBadge = document.createElement('div');
    this.statusBadge.id = 'vr-voice-badge';
    this.statusBadge.className = 'vr-voice-badge';
    this.statusBadge.innerHTML = '<span class="voice-mic-icon">🎙️</span> <span class="voice-text">VOICE ASSISTANT</span>';
    document.body.appendChild(this.statusBadge);
    this.statusBadge.addEventListener('click', () => this.toggleListening());
  }

  updateStatusBadge(text) {
    if (this.statusBadge) {
      const el = this.statusBadge.querySelector('.voice-text');
      if (el) el.textContent = text;
      this.statusBadge.classList.toggle('active', this.isListening);
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.speak('Voice recognition not supported.');
      return;
    }

    if (this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      this.updateStatusBadge('🎙️ MUTED');
      if (this.onToast) this.onToast('🎙️ VOICE MUTED');
    } else {
      try {
        this.isListening = true;
        this.recognition.start();
        this.updateStatusBadge('🎙️ LISTENING...');
        this.speak('Voice assistant online.');
        if (this.onToast) this.onToast('🎙️ VOICE ASSISTANT LISTENING');
      } catch (e) {}
    }
  }

  speak(text) {
    if (!this.speechSynthesis) return;
    try {
      this.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1.0;
      this.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---- Helpers to move cameras in both modes ----

  moveForward(distance) {
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    if (this.vrManager && this.vrManager.isInVR) {
      this.vrManager.dolly.position.addScaledVector(fwd, distance);
    } else {
      this.camera.position.addScaledVector(fwd, distance);
    }
  }

  turnYaw(radians) {
    if (this.vrManager && this.vrManager.isInVR) {
      this.vrManager.dolly.rotation.y += radians;
    } else if (this.navigationControls) {
      this.navigationControls.rotationVelocity.y += radians;
    }
  }

  processCommand(transcript) {
    if (this.onToast) this.onToast(`🎙️ "${transcript.toUpperCase()}"`);

    // ---- STOP (check first so "go back" doesn't match "stop")
    if (transcript.includes('stop') || transcript.includes('halt') || transcript.includes('brake') || transcript.includes('freeze')) {
      // Stop flight in both systems
      if (this.vrGazeController) this.vrGazeController.stopAllFlight();
      if (this.vrManager) {
        this.vrManager.isFlyingForward = false;
        this.vrManager.isFlyingBackward = false;
        this.vrManager.isStrafingLeft = false;
        this.vrManager.isStrafingRight = false;
      }
      if (this.navigationControls) {
        this.navigationControls.velocity.set(0, 0, 0);
        this.navigationControls.zoomVelocity = 0;
        this.navigationControls.rotationVelocity = { x: 0, y: 0 };
      }
      this.speak('Stopped.');
      return;
    }

    // ---- ZOOM OUT (check before ZOOM IN so "zoom out" doesn't match "zoom")
    if (transcript.includes('zoom out') || transcript.includes('zoom back')) {
      this.moveForward(-50);
      this.speak('Zooming out.');
      return;
    }

    // ---- ZOOM IN
    if (transcript.includes('zoom in') || transcript.includes('zoom')) {
      this.moveForward(50);
      this.speak('Zooming in.');
      return;
    }

    // ---- FORWARD / GO FRONT
    if (transcript.includes('forward') || transcript.includes('front') || transcript.includes('go ahead')) {
      if (this.vrGazeController) {
        this.vrGazeController.isFlyingForward = true;
        this.vrGazeController.isFlyingBackward = false;
      }
      if (this.vrManager) {
        this.vrManager.isFlyingForward = true;
        this.vrManager.isFlyingBackward = false;
      }
      this.speak('Moving forward.');
      return;
    }

    // ---- BACKWARD / REVERSE
    if (transcript.includes('backward') || transcript.includes('reverse') || transcript.includes('go back') || transcript.includes('back')) {
      if (this.vrGazeController) {
        this.vrGazeController.isFlyingBackward = true;
        this.vrGazeController.isFlyingForward = false;
      }
      if (this.vrManager) {
        this.vrManager.isFlyingBackward = true;
        this.vrManager.isFlyingForward = false;
      }
      this.speak('Moving backward.');
      return;
    }

    // ---- TURN LEFT
    if (transcript.includes('turn left') || transcript.includes('rotate left') || transcript.includes('look left')) {
      this.turnYaw(0.4);
      this.speak('Turning left.');
      return;
    }

    // ---- TURN RIGHT
    if (transcript.includes('turn right') || transcript.includes('rotate right') || transcript.includes('look right')) {
      this.turnYaw(-0.4);
      this.speak('Turning right.');
      return;
    }

    // ---- LEFT (strafe)
    if (transcript.includes('left')) {
      this.turnYaw(0.25);
      this.speak('Turning left.');
      return;
    }

    // ---- RIGHT (strafe)
    if (transcript.includes('right')) {
      this.turnYaw(-0.25);
      this.speak('Turning right.');
      return;
    }

    // ---- PLAY ANIMATION
    if (transcript.includes('play animation') || transcript.includes('start animation') || transcript.includes('resume animation')) {
      if (this.solarSystem.toggleGlobalAnimation) {
        this.solarSystem.toggleGlobalAnimation(true);
      }
      this.speak('Animation playing.');
      return;
    }

    // ---- PAUSE ANIMATION
    if (transcript.includes('pause animation') || transcript.includes('stop animation') || transcript.includes('freeze animation')) {
      if (this.solarSystem.toggleGlobalAnimation) {
        this.solarSystem.toggleGlobalAnimation(false);
      }
      this.speak('Animation paused.');
      return;
    }

    // ---- FLY TO PLANET
    const planets = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    for (const p of planets) {
      if (transcript.includes(p)) {
        const name = p.charAt(0).toUpperCase() + p.slice(1);
        const body = this.solarSystem.getBody(name);
        if (body) {
          this.selectionManager.selectBody(body);

          if (this.vrManager && this.vrManager.isInVR) {
            const pos = new THREE.Vector3();
            body.getWorldPosition(pos);
            const dist = Math.max(body.radius * 3.5, 15);
            this.vrManager.dolly.position.set(pos.x + dist * 0.7, pos.y + dist * 0.3, pos.z + dist);
          } else {
            this.selectionManager.flyToBody(body);
          }

          this.speak(`Flying to ${name}.`);
          return;
        }
      }
    }

    // ---- TOUR
    if (transcript.includes('tour') || transcript.includes('guide')) {
      if (this.cinematicIntro && this.cinematicIntro.toggleTour) {
        this.cinematicIntro.toggleTour();
        this.speak('Tour started.');
      }
      return;
    }

    // ---- RESET / OVERVIEW
    if (transcript.includes('reset') || transcript.includes('overview') || transcript.includes('home')) {
      if (this.vrManager && this.vrManager.isInVR) {
        this.vrManager.dolly.position.set(0, 40, 220);
        this.vrManager.dolly.rotation.set(0, 0, 0);
      } else {
        this.camera.position.set(0, 140, 320);
        this.camera.lookAt(0, 0, 0);
      }
      if (this.vrGazeController) this.vrGazeController.stopAllFlight();
      this.speak('Reset to overview.');
      return;
    }

    // Fallback
    this.speak('Say go forward, turn left, zoom, or a planet name.');
  }
}
