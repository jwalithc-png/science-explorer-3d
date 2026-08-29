# 👶✨ The Miracle of Life 3D: Human Conception & Child Formation WebVR / WebXR Simulation

A photorealistic, highly optimized, interactive 3D WebXR and WebVR scientific simulation of **Human Conception, Fertilization, Embryogenesis, and Child Formation** built with **Three.js**, **Custom GLSL Shaders**, **WebXR**, and a **Dual-Screen WebSocket PC-to-Mobile Remote Control Bridge**.

Supports full **360° Object Rotation and Inspection from all camera angles** in immersive VR (Meta Quest, Apple Vision Pro, mobile Cardboard / VR Box) and standard desktop/mobile browsers.

---

## 🔬 Biological & Embryological Hierarchy (9 Connected Stages)

1. **Stage 1: 🏊 Sperm Journey & Chemotaxis (Motility & Capacitation)**
   - 200-300 million spermatozoa swimming through the ciliated Fallopian tube / uterine canal.
   - Dynamic 9+2 axoneme flagellar sine-wave physics, mitochondrial midpiece ATP energy spiral, and progesterone chemotaxis gradients.
2. **Stage 2: 🥚 The Mature Oocyte & Corona Radiata (Encounter at Ampulla)**
   - Massive mature secondary oocyte (~120 µm) with translucent **Zona Pellucida** (subsurface scattering shader), internal yolk granules, 1st Polar Body, and radiating follicular Corona Radiata cells.
3. **Stage 3: ⚡ Acrosome Reaction & Membrane Fusion**
   - Acrosome exocytosis releasing Hyaluronidase and Acrosin enzyme vesicles to dissolve through the Zona.
   - Winning sperm docking at the oolemma via **Izumo1 - Juno** receptor lock-and-key recognition.
4. **Stage 4: 💫 Cortical Reaction, Zinc Spark & Syngamy (The Spark of Life)**
   - Propagating bioluminescent **Calcium Wave & Zinc Spark** cortical shockwave.
   - Cortical granule exocytosis hardening the fertilization envelope (block to polyspermy).
   - Extruded 2nd Polar Body and male/female pronuclei migration fusing 46 chromosomes (2n Diploid Zygote).
5. **Stage 5: 🔬 Cleavage Divisions & Blastocyst Development (Days 1 to 6)**
   - Mitotic cleavages: 2-cell, 4-cell, 8-cell, 16-cell Morula into the Cavitated Blastocyst.
   - Outer Trophoblast ring (future placenta), fluid-filled Blastocoel, and pluripotent **Inner Cell Mass (ICM / Embryoblast)**.
   - Zona hatching.
6. **Stage 6: 🧬 Endometrial Implantation & Gastrulation (Weeks 2 to 3)**
   - Invasive Syncytiotrophoblast creating maternal blood lacunae.
   - Formation of the 3 Primary Germ Layers: **Ectoderm** (nervous system & skin), **Mesoderm** (heart, blood, muscles & bones), and **Endoderm** (viscera & lungs).
7. **Stage 7: ❤️ Embryonic Organogenesis & The First Heartbeat (Weeks 4 to 8)**
   - 3D C-shaped human embryo with an **actively pulsating, beating primitive cardiac tube** synchronized with audio heartbeat and vascular shader.
   - Neural tube closure, optic cups (eyes), branchial arches, somites, and limb buds forming fingers and toes.
8. **Stage 8: 👶 Fetal Development & Placental Life-Support (Weeks 12 to 28)**
   - Weightless human fetus floating in the translucent fluid-filled **Amniotic Sac**.
   - Microvascular skin capillary perfusion, distinct facial features, and discoid Placenta with spiraling Umbilical Cord (2 arteries + 1 vein).
9. **Stage 9: 🌟 Full-Term Child Formation & Miracle of Life (Weeks 38 to 40)**
   - Fully developed full-term infant in vertex cephalic presentation with vernix caseosa, chest breathing dynamics, and placental life support, ready for birth.

---

## 🕹️ 360° Object Rotation & VR Controls

### 360° Multi-Angle Inspection
- **VR Mode**: Use VR controller thumbstick, trackpad, grab gesture, or PC remote trackpad to smoothly spin and inspect any 3D stage entity around all 3 axes (Yaw, Pitch, Roll) 360° from any angle.
- **Desktop & Mobile Touch**: Click/drag or swipe with crosshair to rotate 3D objects and orbit the camera.
- **Camera Side Presets**:
  - `F` Key: **Front View** (0°)
  - `B` Key: **Back View** (180°)
  - `L` Key: **Left View** (-90°)
  - `R` Key (without Ctrl): **Reset Overview**
  - `T` Key: **Top View** (+90° Pitch)
  - `1 - 9` Keys: Instant teleport to any conception stage
  - `A` Key: Toggle 9-Stage Guided Cinematic Tour with voice narration & audio
  - `M` Key: Toggle Audio & Heartbeat
  - **Auto-Spin**: 360° continuous turntable inspection toggle
  - **Cross-Section Cutaway**: Slices open the front quadrant to inspect internal cellular structures

---

## 📱 Dual-Screen PC Remote Controller (`controller.html`)

Over local Wi-Fi, open `https://<YOUR_PC_IP>:3000/controller.html` on your PC or tablet:
- **Fullscreen 360° Trackpad**: Move mouse or drag touch to rotate the VR view and 3D objects on the mobile headset.
- **Scroll Wheel**: Deep zoom & flight thrust.
- **6 Camera Side Buttons**: Front, Back, Left, Right, Top, Bottom, 3D Iso.
- **Stage Selector (1-9)**: Jump instantly to any biological stage.
- **Tour (A)** and **Reset (R)** buttons.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local HTTPS development server
npm run dev

# 3. Build production bundle
npm run build
```
