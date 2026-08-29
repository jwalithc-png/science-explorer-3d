# 🚀 Science Explorer 3D: Multi-Module VR & 3D Scientific Simulation

A photorealistic, highly optimized, interactive 3D WebXR and WebVR scientific simulation platform featuring **The Solar System**, **Plant Biology & Photosynthesis**, and **Human Conception & Embryogenesis**, built with **Three.js**, **Custom GLSL Shaders**, **WebXR**, and a **Dual-Screen Real-Time WebSocket PC-to-Mobile Remote Control Bridge**.

Supports full **360° omnidirectional camera & environment navigation**, **per-model self-rotation**, **Stranger Things cinematic 360° visual inspection tour**, and **mobile VR Cardboard / VR Box gyroscope auto-recentering**.

---

## 🌌 Modules Overview

### ☀️ Module 1: The Solar System (10 Celestial Bodies)
1. **Sun**: Animated 3D Simplex FBM plasma convection surface, luminous prominence loops, and multi-layer corona shader.
2. **Mercury**: High-detail cratered surface topography and orbital inclination.
3. **Venus**: Dense turbulent atmosphere with retrograde axial rotation.
4. **Earth & Moon**: Specular ocean reflection, Rayleigh atmospheric scattering shader, rotating cloud layer, night city illumination, and the orbiting Moon.
5. **Mars**: Olympus Mons volcanic terrain and rusty iron-oxide dusty atmosphere.
6. **Jupiter**: Dynamic atmospheric jet streams, Great Red Spot vortex, and the 4 Galilean moons (Io, Europa, Ganymede, Callisto).
7. **Saturn**: High-resolution concentric ring system (Cassini Division & Encke Gap) with realistic 26.7° axial tilt and orbiting Titan & Enceladus.
8. **Uranus**: Cyan methane atmosphere with extreme 97.8° axial tilt and translucent vertical rings.
9. **Neptune**: Deep blue supersonic storm bands, Great Dark Spot, and retrograde moon Triton.
10. **Pluto**: Kuiper belt dwarf planet with the nitrogen-ice Tombaugh Regio heart and moon Charon.

### 🌿 Module 2: Plant Biology & Photosynthesis (9 Connected Stages)
1. **Sun Photon Transit**: Sunlight photons journeying through space towards Earth.
2. **Tree Canopy Catchment**: Photon harvesting across leafy forest canopies.
3. **Plant Growth Dynamics**: Stem, root, and leaf vegetative development.
4. **Leaf Anatomy & Stomata**: Cuticle layer, palisade mesophyll, and stomatal gas exchange ($CO_2 / O_2$).
5. **Chloroplast Organelle**: Outer/inner membranes, stroma matrix, and stacked thylakoid grana.
6. **Photosystem II (PSII)**: P680 reaction center and water-photolysis oxygen-evolving complex ($2H_2O \rightarrow O_2 + 4H^+ + 4e^-$).
7. **Electron Transport Chain (ETC)**: Plastoquinone, Cytochrome $b_6f$, Plastocyanin, and Photosystem I proton pumping.
8. **ATP Synthase Rotary Motor**: Proton gradient driven catalytic shaft rotation synthesizing ATP from ADP + Pi.
9. **Calvin Cycle & Sugar Synthesis**: RuBisCO fixation, carbon reduction, and glucose carbohydrate generation.

### 👶 Module 3: Human Conception & Embryogenesis (9 Connected Stages)
1. **Sperm Journey & Chemotaxis**: 300 million spermatozoa navigating the Fallopian tube with 9+2 flagellar sine physics.
2. **Mature Oocyte & Corona Radiata**: Translucent Zona Pellucida with subsurface scattering and radiating follicle cells.
3. **Acrosome Reaction & Fusion**: Enzyme exocytosis dissolving the Zona with Izumo1–Juno receptor docking.
4. **Cortical Reaction & Zinc Spark**: Bioluminescent Calcium Wave, zinc spark, and male/female pronuclei syngamy.
5. **Blastocyst Formation**: Mitotic cleavages forming the cavitated blastocyst and inner cell mass (ICM).
6. **Endometrial Implantation**: Syncytiotrophoblast lacunae and 3 primary germ layer gastrulation.
7. **Organogenesis & First Heartbeat**: Primitive pulsating cardiac tube with rhythmic audio heartbeat and neural tube closure.
8. **Fetal Development**: Fetus floating in the amniotic sac with discoid placenta and umbilical vessels.
9. **Full-Term Child**: Vertex presentation infant with breathing dynamics and placental life-support ready for birth.

---

## 🎮 Complete Control Scheme

| Input | Action |
|---|---|
| **🖱️ Left-Click + Drag** | Universal **360° Omnidirectional Orbit** of entire 3D environment & camera |
| **🖱️ Right-Click + Drag** | **Pan Screen / Camera** in any 3D direction |
| **Scroll Wheel** | Smooth dolly zoom in / out |
| **`1 – 9 / 0`** | **Jump & Track** any specific 3D model, planet, or biological stage |
| **`R`** | **Rotate selected 3D model** on its own axis |
| **`C`** | **Turn OFF / Stop** the 3D model rotation |
| **`Z`** | **Zoom In** |
| **`X`** | **Zoom Out** |
| **`A`** | **Toggle Cinematic Visual Tour + *Stranger Things* Soundtrack** |
| **`I`** | **Flip VR 180° Orientation** (instant gyro heading flip) |
| **`H`** | **Recenter VR Forward Heading** towards active target |
| **`Space`** | Pause / Resume simulation |
| **`Tab`** | Cycle modules (Solar System ➔ Plant Biology ➔ Human Reproduction) |
| **`N`** | Toggle 3D floating billboard names & labels |
| **`M`** | Toggle audio & narration |
| **`F, B, L, T`** | Instant camera sides (Front, Back, Left, Top) |
| **`[ / ]`** | Adjust simulation speed (0.5x, 1x, 2x, 5x) |
| **Arrow Keys** | Move screen / camera in that direction |

---

## 🎬 *Stranger Things* Cinematic 360° Visual Tour

Pressing **`A`** launches a cinematic guided inspection tour:
1. 🎶 Plays the *Stranger Things* theme soundtrack seamlessly with volume leveling and looping.
2. 🚀 The camera swoops across space directly towards the target model / celestial body.
3. 🔄 Performs an exact, detailed **360-degree circular orbit** around the model with dynamic subtle pitch variation to showcase all particle effects, shaders, and fine structural details.
4. ➡️ Automatically advances to the next model in sequence and repeats the detailed 360° orbit, cycling through all 10 celestial bodies / stages with synchronized scientific voice narration.

---

## 🥽 Mobile VR & Dual-Screen Remote Controller

### 1. Dual-Screen Cardboard / VR Box Mode
- Touch **`👓 DUAL SCREEN VR`** on your smartphone.
- Features **Screen Orientation Auto-Compensation** (`screen.orientation.angle`) for both landscape-left and landscape-right headset insertion.
- Features **Auto-Recentering** (`recenterVR()`) so looking straight forward in your room always faces directly at the active planet.
- Press **`I`** at any time to flip the VR view 180°.

### 2. Wireless WebSocket Remote Controller (`public/controller.html`)
Open `https://<YOUR_PC_IP>:3050/controller.html` on your PC, laptop, or second mobile device over local Wi-Fi:
- **Full-Width 360° Virtual Trackpad**: Drag anywhere to wirelessly orbit the VR environment on the headset.
- **Scroll Wheel Depth Thrust**: Zoom in and out wirelessly.
- **Stage Selector Grid**: Tap `1-10` to instantly jump the headset between planets / stages.
- **Module Switcher Tabs**: Switch between Solar System, Photosynthesis, and Conception on the fly.
- **Full Keyboard Support**: Remotely press `A` (Tour), `R` (Rotate Model), `C` (Stop Rotation), `Z/X` (Zoom), `I` (Flip 180°), `H` (Recenter).

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local HTTPS development server with WebSocket Remote Relay
npm run dev

# 3. Build optimized production bundle
npm run build
```

- **Desktop Simulation**: `https://localhost:3050/`
- **Mobile VR Headset**: `https://<YOUR_LOCAL_IP>:3050/`
- **Wireless Remote Controller**: `https://<YOUR_LOCAL_IP>:3050/controller.html`
