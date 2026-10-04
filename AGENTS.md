# 🧠 Antigravity Project Context & Agent Memory: Science Explorer 3D

> **Persistent Workspace Memory:**  
> This file is automatically read by Antigravity and AI coding agents when this repository is opened on any system. It captures the entire context, design philosophy, file hierarchy, technical specifications, and key behavioral invariants of **Science Explorer 3D**.

---

## 1. Project Overview & Identity
- **Project Name:** Science Explorer 3D (`photosynthesis-webvr-simulation`)
- **Repository:** `https://github.com/jwalithc-png/science-explorer-3d.git`
- **Tech Stack:** Vanilla JavaScript (ES Modules), Three.js (`^0.170.0`), Custom GLSL Shaders, WebXR / WebVR, Vite (`^5.4.10`), Node.js `ws` (`^8.21.3`), `@vitejs/plugin-basic-ssl`.
- **Target Experience:** Photorealistic, scientifically accurate, interactive 3D WebGL / WebXR educational simulation with dual-screen wireless mobile phone remote control.

---

## 2. The Four Core Science Modules (Invariant: Never delete any module)
The application currently features **4 complete, fully simulated, interconnected science topics**. When modifying the project or adding features, all 4 must remain operational:

### ☀️ Module 1: The Solar System (`solar`)
- **Key Files:** `src/models/SolarSystemModel.js`, `src/models/LivingCosmicEnvironment.js`, `src/data/solarSystemStages.js`
- **10 Stages:**
  1. Sun (Procedural 3D Simplex FBM plasma convection, solar flares, corona shader)
  2. Mercury (High-detail cratered topography)
  3. Venus (Dense atmospheric turbulence, retrograde spin)
  4. Earth & Moon (Atmospheric Rayleigh scattering, ocean specular, clouds, orbiting Moon)
  5. Mars (Olympus Mons, iron-oxide dusty atmosphere)
  6. Jupiter (Dynamic atmospheric jet streams, Great Red Spot, 4 Galilean moons)
  7. Saturn (Realistic concentric rings with Cassini division, 26.7° tilt, Titan & Enceladus)
  8. Uranus (Cyan methane atmosphere, 97.8° tilt, translucent vertical rings)
  9. Neptune (Deep blue supersonic storm bands, Great Dark Spot, Triton)
  10. Pluto & Charon (Nitrogen-ice Tombaugh Regio heart)

### 🌿 Module 2: Plant Biology & Photosynthesis (`photosynthesis`)
- **Key Files:** `src/models/LeafModel.js`, `src/models/CellChloroplastModel.js`, `src/models/PhotosystemIIModel.js`, `src/models/ThylakoidETCModel.js`, `src/models/ATPSynthaseModel.js`, `src/models/CalvinCycleModel.js`, `src/models/LivingPhotosynthesisEnvironment.js`, `src/data/photosynthesisStages.js`
- **9 Stages:**
  1. Sun Photon Transit | 2. Tree Canopy Catchment | 3. Plant Growth Dynamics | 4. Leaf Anatomy & Stomata | 5. Chloroplast Organelle | 6. Photosystem II (PSII) | 7. Electron Transport Chain (ETC) | 8. ATP Synthase Rotary Motor | 9. Calvin Cycle & Sugar Synthesis

### 👶 Module 3: Human Conception & Embryogenesis (`reproduction`)
- **Key Files:** `src/models/SpermJourneyModel.js`, `src/models/OocyteModel.js`, `src/models/AcrosomeFusionModel.js`, `src/models/FertilizationSyngamyModel.js`, `src/models/BlastocystModel.js`, `src/models/ImplantationGastrulationModel.js`, `src/models/EmbryoOrganogenesisModel.js`, `src/models/FetalDevelopmentModel.js`, `src/models/FullTermChildModel.js`, `src/models/LivingHumanBodyEnvironment.js`, `src/data/conceptionStages.js`
- **9 Stages:**
  1. Sperm Journey & Chemotaxis | 2. Mature Oocyte & Corona Radiata | 3. Acrosome Reaction & Fusion | 4. Cortical Reaction & Zinc Spark | 5. Blastocyst Formation | 6. Endometrial Implantation | 7. Organogenesis & First Heartbeat | 8. Fetal Development | 9. Full-Term Child

### 🫀 Module 4: Human Heart & Cardiovascular System (`heart`)
- **Key Files:** `src/models/heart/*.js`, `src/models/LivingHeartCardiovascularEnvironment.js`, `src/data/heartStages.js`
- **10 Stages:**
  1. Superior & Inferior Vena Cava | 2. Right Atrium & Tricuspid Valve | 3. Right Ventricle & Trabeculae Carneae | 4. Pulmonary Artery & Semilunar Valve | 5. Alveolar-Capillary Gas Exchange (Capillary bed with RBC/WBC fluid flow) | 6. Pulmonary Veins & Left Atrium | 7. Mitral (Bicuspid) Valve & Chordae Tendineae | 8. Left Ventricle & Thick Myocardium | 9. Aortic Arch & Systemic Branches | 10. Complete Integrated Beating Heart with Hemodynamic Audio (Lub-Dub sync)

---

## 3. Interaction & Control Schemes

### Selection & 3D XYZ Rotation Gizmo
- **Double-Click / Double-Tap Selection:** The previous 5-second hold was replaced with an immediate, responsive **double-click/double-tap** on any 3D object in space.
- **5 Ways to Turn OFF XYZ Rotation Axes:**
  1. Floating 3D button directly on the gizmo: `[ ✕ OFF XYZ AXES ]`
  2. Inside the Object Details Popup Window: click `[ 🛑 OFF XYZ Axes ]`
  3. On the HUD Top Bar: click `[ 🛑 OFF XYZ (X) ]`
  4. On the Mobile Remote Controller (`controller.html`): tap `[ 🛑 OFF XYZ Axes (X) ]`
  5. Keyboard Shortcut: press <kbd>X</kbd> or <kbd>Escape</kbd>.

### Mouse Pointer Toggle
- **Toggle Mouse Pointer:** Pressing <kbd>Spacebar</kbd> or clicking `[ 🖱️ MOUSE: ON/OFF ]` on the HUD or mobile controller toggles the cursor circle pointer ON and OFF across VR, desktop, and mobile.

### Guided Cinematic Tour (Stranger Things Audio)
- Pressing <kbd>A</kbd> or clicking `[ 🎬 TOUR (A) ]` starts the guided tour.
- **Fixed Front Camera Angle:** The camera stays fixed at a single, comfortable forward angle to prevent motion sickness; entities rotate smoothly in all directions so the user never has to turn their head.

---

## 4. Dual-Screen Mobile Controller Architecture
- **Mobile Web App:** `public/controller.html` (with alias `public/controller.htm`)
- **Server Plugin:** `vite-remote-plugin.js`
  - Attaches a `ws.WebSocketServer({ noServer: true })` on pathname `/ws-remote`.
  - Avoids conflicting with Vite's internal HMR WebSockets.
  - Automatically redirects `/controller.htm` and `/controller` to `/controller.html`.
- **Simulation Client Relay:** `src/remote/RemoteRelayClient.js`
  - Maintains auto-reconnecting socket on the PC side.
  - Dispatches `remoteMouseMove`, `remoteMouseClick`, `drag`, `toggleMouse`, `detachGizmo`, `switchModule`, `tour`.
- **Coordinate Transformation:**
  Mobile 2D touch coordinates $(x, y) \in [0, 1]^2$ are sent over WebSockets and mapped to local 3D UI plane:
  $$\text{targetCursorX} = (x - 0.5) \times 1.90, \quad \text{targetCursorY} = -(y - 0.5) \times 1.05$$
  and projected into world space via Three.js Raycaster for entity selection.

---

## 5. Development Server & Network Rules
- **Configuration:** `vite.config.js` runs on port **3050** with `https: true` and `@vitejs/plugin-basic-ssl`.
- **Why HTTPS is Required:** Mobile Chrome and iOS Safari strictly disable the phone's **Gyroscope (`DeviceOrientationEvent`)** and **WebXR API** unless running on a secure HTTPS origin.
- **Mobile SSL Warning:** On local IP networks, mobile devices will show *"Your connection is not private"*. Users must tap **"Advanced" ➔ "Proceed to IP (unsafe)"**.
- **Wi-Fi AP Isolation:** On college or institutional Wi-Fi networks where router client isolation is enabled, use a **Mobile Hotspot** between the laptop and phone for 100% reliable peer-to-peer connection.

---

## 6. Project Directory Hierarchy
```text
├── public/
│   ├── audio/
│   │   └── stranger_things_theme.mp3   # Cinematic tour soundtrack
│   ├── controller.html                 # Mobile touch trackpad & remote interface
│   └── controller.htm                  # Typo alias for mobile controller
├── src/
│   ├── core/
│   │   ├── App.js                      # Central coordinator, loop & event dispatcher
│   │   ├── SceneManager.js             # WebGL renderer, Dual-screen SBS VR & WebXR
│   │   ├── Lighting.js                 # Dynamic multi-light rig (Sun, rim, ambient)
│   │   └── AudioManager.js             # Spatial audio synthesis & hemodynamic rhythms
│   ├── data/
│   │   ├── solarSystemStages.js        # 10 Solar system stages & scientific facts
│   │   ├── photosynthesisStages.js     # 9 Photosynthesis stages & biochemistry
│   │   ├── conceptionStages.js         # 9 Conception stages & embryology data
│   │   ├── heartStages.js              # 10 Cardiovascular stages & hemodynamics
│   │   └── moduleRegistry.js           # Module definitions, colors, branding
│   ├── interaction/
│   │   ├── NavigationController.js     # 3D orbit flight, model spin & camera presets
│   │   ├── TourController.js           # 360° cinematic inspection sequence
│   │   └── Gizmo3D.js                  # Blender-style colorful XYZ rotation rings
│   ├── models/
│   │   ├── SolarSystemModel.js         # 10 procedural solar system bodies
│   │   ├── LivingCosmicEnvironment.js  # Deep-space starfield & nebula
│   │   ├── heart/                      # 10 dedicated cardiac 3D anatomical models
│   │   ├── LivingHeartCardiovascularEnvironment.js # Blood cells & vascular chamber
│   │   ├── LivingPhotosynthesisEnvironment.js      # Forest canopy & chloroplast rays
│   │   └── LivingHumanBodyEnvironment.js           # Fluid cellular environment
│   ├── remote/
│   │   └── RemoteRelayClient.js        # PC WebSocket bridge to vite-remote-plugin
│   ├── ui/
│   │   ├── HUD.js                      # Top header, speed sliders, remote QR modal
│   │   ├── BillboardLabels.js          # Dynamic 3D floating object names
│   │   ├── VRInfoCard.js               # 3D spatial telemetry info board in VR
│   │   └── ScientificPanel.js          # Deep scientific explanations drawer
│   ├── vr/
│   │   ├── VRRemoteBar.js              # 3D In-VR floating window & virtual pointer
│   │   └── WebXRManager.js             # Native 6-DOF WebXR session manager
│   ├── main.js                         # Application entry point
│   └── style.css                       # Modern glassmorphism UI styles
├── package.json                        # Dependencies and scripts (dev, build)
├── vite.config.js                      # Vite config (port 3050, https, plugins)
├── vite-remote-plugin.js               # WebSocket relay plugin & routing middleware
├── README.md                           # User documentation & setup guide
├── AGENTS.md                           # This persistent memory document
└── ARCHITECTURE.md                     # Deep, pin-to-pin technical blueprint
```
