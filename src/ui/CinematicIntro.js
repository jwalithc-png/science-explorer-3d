import * as THREE from 'three';

/**
 * Cinematic Guided Astronomical Solar System Tour
 * 
 * Features all 9 Planets, the Sun, Moon, and Kuiper Belt in magnificent close-up detail.
 * Operates with smooth 6-DOF camera interpolation in both Desktop and WebXR ENTER VR modes.
 */
export class CinematicIntro {
  constructor(camera, solarSystem, onComplete, onPlanetChange) {
    this.camera = camera;
    this.solarSystem = solarSystem;
    this.onComplete = onComplete;
    this.onPlanetChange = onPlanetChange;
    this.vrManager = null;

    this.isPlayingIntro = true;
    this.introTime = 0;
    this.introDuration = 5.5;

    this.overlay = document.getElementById('cinematic-overlay');
    this.progressBar = document.getElementById('startup-bar');
    this.statusText = document.getElementById('startup-status');
    this.btnEnter = document.getElementById('btn-enter-system');

    // Camera Keyframes for Cinematic Intro
    this.introStartPos = new THREE.Vector3(0, 750, 1600);
    this.introMidPos = new THREE.Vector3(120, 180, 500);
    this.introEndPos = new THREE.Vector3(0, 140, 320);

    // Tour state
    this.isTouring = false;
    this.tourIndex = 0;
    this.tourProgress = 0;
    this.timePerTarget = 10.0; // 10 seconds of rich inspection per planet

    // Inter-planet transition flight
    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 1.8;
    this.transitionStartPos = new THREE.Vector3();

    // Comprehensive planetary tour sequence covering every celestial body in rich detail
    this.tourSequence = [
      {
        name: 'Sun',
        title: '☀️ THE SUN // CENTRAL STAR',
        subtitle: 'Incandescent plasma sphere, solar flares & gravitational anchor',
        approachFactor: 3.5,
        closeFactor: 2.2,
        elevation: 0.22,
        orbitSpeed: 0.30
      },
      {
        name: 'Mercury',
        title: '☿ MERCURY // 1ST PLANET',
        subtitle: 'Sun-scorched cratered crust & extreme temperature swings (-180°C to 430°C)',
        approachFactor: 4.8,
        closeFactor: 3.2,
        elevation: 0.28,
        orbitSpeed: 0.40
      },
      {
        name: 'Venus',
        title: '♀ VENUS // 2ND PLANET',
        subtitle: 'Runaway greenhouse atmosphere, sulfuric acid clouds & retrograde spin',
        approachFactor: 4.5,
        closeFactor: 2.8,
        elevation: 0.25,
        orbitSpeed: 0.38
      },
      {
        name: 'Earth',
        title: '🌍 EARTH // 3RD PLANET (OUR HOME)',
        subtitle: 'Dynamic liquid oceans, swirling cloud systems, atmosphere & night city lights',
        approachFactor: 4.5,
        closeFactor: 2.8,
        elevation: 0.28,
        orbitSpeed: 0.36
      },
      {
        name: 'Moon',
        title: '🌕 THE MOON (LUNA) // NATURAL SATELLITE',
        subtitle: 'Dark basaltic volcanic maria & crater Tycho ejecta rays',
        approachFactor: 5.2,
        closeFactor: 3.2,
        elevation: 0.25,
        orbitSpeed: 0.45
      },
      {
        name: 'Mars',
        title: '♂ MARS // 4TH PLANET (THE RED PLANET)',
        subtitle: 'Iron oxide red regolith, Olympus Mons volcano, Valles Marineris canyon & ice caps',
        approachFactor: 4.5,
        closeFactor: 2.8,
        elevation: 0.28,
        orbitSpeed: 0.40
      },
      {
        name: 'Jupiter',
        title: '♃ JUPITER // 5TH PLANET (GAS GIANT KING)',
        subtitle: 'Great Red Spot storm vortex, colorful jet stream bands & Galilean moons',
        approachFactor: 3.8,
        closeFactor: 2.5,
        elevation: 0.28,
        orbitSpeed: 0.30
      },
      {
        name: 'Saturn',
        title: '♄ SATURN // 6TH PLANET (RINGED JEWEL)',
        subtitle: 'Spectacular icy ring system with Cassini Division & golden cloud banding',
        approachFactor: 4.0,
        closeFactor: 2.6,
        elevation: 0.42, // Elevated view over the majestic ring plane
        orbitSpeed: 0.28
      },
      {
        name: 'Uranus',
        title: '♅ URANUS // 7TH PLANET (ICE GIANT)',
        subtitle: 'Aquamarine methane atmosphere, extreme 98° tilted roll axis & ice rings',
        approachFactor: 4.5,
        closeFactor: 2.8,
        elevation: 0.28,
        orbitSpeed: 0.34
      },
      {
        name: 'Neptune',
        title: '♆ NEPTUNE // 8TH PLANET (AZURE ICE GIANT)',
        subtitle: 'Deep azure blue atmosphere, supersonic 2,100 km/h winds, white clouds & Triton',
        approachFactor: 4.5,
        closeFactor: 2.8,
        elevation: 0.28,
        orbitSpeed: 0.34
      },
      {
        name: 'Pluto',
        title: '♇ PLUTO // 9TH PLANET (KUIPER BELT FRONTIER)',
        subtitle: 'Frozen nitrogen heart (Tombaugh Regio), reddish tholins & water-ice mountains',
        approachFactor: 5.5,
        closeFactor: 3.4,
        elevation: 0.30,
        orbitSpeed: 0.42
      }
    ];

    this.initUI();
  }

  setVRManager(vrManager) {
    this.vrManager = vrManager;
  }

  initUI() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (this.progressBar) this.progressBar.style.width = `${progress}%`;
      
      if (progress === 50 && this.statusText) {
        this.statusText.textContent = 'CALCULATING KEPLERIAN ORBITS & GLSL SHADERS...';
      } else if (progress >= 100) {
        clearInterval(interval);
        if (this.statusText) this.statusText.textContent = 'SYSTEMS OPERATIONAL // READY FOR DEEP SPACE EXPLORATION';
        if (this.btnEnter) {
          this.btnEnter.classList.remove('hidden');
          this.btnEnter.addEventListener('click', () => this.startExperience());
        }
      }
    }, 200);
  }

  startExperience() {
    if (this.overlay) {
      this.overlay.classList.add('fade-out');
    }
    this.isPlayingIntro = true;
    this.introTime = 0;
  }

  startTour() {
    this.isTouring = true;
    this.isPlayingIntro = false;
    this.tourIndex = 0;
    this.tourProgress = 0;
    this.isTransitioning = false;

    // Ensure solar system animation is running
    if (this.solarSystem) {
      this.solarSystem.globalAnimEnabled = true;
      this.solarSystem.isPaused = false;
    }

    this.notifyCurrentTarget();
  }

  stopTour() {
    this.isTouring = false;
    this.isTransitioning = false;
  }

  toggleTour() {
    if (this.isTouring) {
      this.stopTour();
    } else {
      this.startTour();
    }
    return this.isTouring;
  }

  nextPlanet() {
    const inVR = this.vrManager && (this.vrManager.isInVR || this.vrManager.renderer.xr.isPresenting);
    this.transitionStartPos.copy(inVR ? this.vrManager.dolly.position : this.camera.position);
    this.isTransitioning = true;
    this.transitionTime = 0;
    this.tourProgress = 0;
    this.tourIndex = (this.tourIndex + 1) % this.tourSequence.length;
    this.notifyCurrentTarget();
  }

  notifyCurrentTarget() {
    const target = this.tourSequence[this.tourIndex];
    if (target && this.onPlanetChange) {
      this.onPlanetChange(target.name, target);
    }
  }

  update(deltaTime) {
    const inVR = this.vrManager && (this.vrManager.isInVR || this.vrManager.renderer.xr.isPresenting);

    // 1. Startup Intro Cinematic Camera Swoop (desktop only)
    if (this.isPlayingIntro && !inVR) {
      this.introTime += deltaTime;
      const t = Math.min(1.0, this.introTime / this.introDuration);

      if (t < 0.5) {
        const subT = t * 2.0;
        this.camera.position.lerpVectors(this.introStartPos, this.introMidPos, subT);
      } else {
        const subT = (t - 0.5) * 2.0;
        this.camera.position.lerpVectors(this.introMidPos, this.introEndPos, subT);
      }

      this.camera.lookAt(0, 0, 0);

      if (t >= 1.0) {
        this.isPlayingIntro = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    // 2. Guided Detailed Planetary Tour Across all 9 Planets
    if (this.isTouring) {
      const step = this.tourSequence[this.tourIndex];
      const targetBody = this.solarSystem.getBody(step.name);

      if (targetBody) {
        const targetPos = new THREE.Vector3();
        targetBody.getWorldPosition(targetPos);

        // Multi-stage factor: approach wide -> close inspection orbit
        const phaseRatio = Math.min(1.0, this.tourProgress / this.timePerTarget);
        const currentFactor = phaseRatio < 0.35
          ? THREE.MathUtils.lerp(step.approachFactor, step.closeFactor, phaseRatio / 0.35)
          : step.closeFactor;

        const offsetDist = Math.max(targetBody.radius * currentFactor, 12.0);
        const orbitAngle = this.tourProgress * step.orbitSpeed;

        let desiredPos;

        if (inVR) {
          // In WebXR: Place planet right in front of user's VR forward direction
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
          
          // Slight orbital glide in VR without inducing motion sickness
          const vrOrbitOffset = Math.sin(orbitAngle * 0.4) * (offsetDist * 0.15);

          desiredPos = new THREE.Vector3(
            targetPos.x - forward.x * offsetDist + right.x * vrOrbitOffset,
            targetPos.y - forward.y * offsetDist + offsetDist * step.elevation * 0.4,
            targetPos.z - forward.z * offsetDist + right.z * vrOrbitOffset
          );

          if (this.isTransitioning) {
            this.transitionTime += deltaTime;
            const t = Math.min(1.0, this.transitionTime / this.transitionDuration);
            const ease = t * t * (3 - 2 * t);
            this.vrManager.dolly.position.lerpVectors(this.transitionStartPos, desiredPos, ease);
            if (t >= 1.0) this.isTransitioning = false;
          } else {
            this.vrManager.dolly.position.lerp(desiredPos, 0.08);
          }
        } else {
          // On Desktop: 360° Circular Orbit
          desiredPos = new THREE.Vector3(
            targetPos.x + Math.sin(orbitAngle) * offsetDist,
            targetPos.y + offsetDist * step.elevation,
            targetPos.z + Math.cos(orbitAngle) * offsetDist
          );

          if (this.isTransitioning) {
            this.transitionTime += deltaTime;
            const t = Math.min(1.0, this.transitionTime / this.transitionDuration);
            const ease = t * t * (3 - 2 * t);
            this.camera.position.lerpVectors(this.transitionStartPos, desiredPos, ease);
            if (t >= 1.0) this.isTransitioning = false;
          } else {
            this.camera.position.lerp(desiredPos, 0.08);
          }

          this.camera.lookAt(targetPos);
        }

        this.tourProgress += deltaTime;

        // Advance to next planet after showcasing detailed close-up
        if (this.tourProgress > this.timePerTarget) {
          this.nextPlanet();
        }
      }
    }
  }
}
