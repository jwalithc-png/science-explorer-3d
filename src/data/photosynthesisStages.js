/**
 * Photosynthesis Scientific Stages & Biological Hierarchy Data
 * 
 * 9 Connected Cinematic Interactive Stages:
 * Stage 1: ☀️ Sun & Interplanetary Photon Transit (Cosmic Solar Origin)
 * Stage 2: 🌍 Earth Atmosphere & Tree Canopy Absorption (Macro Catchment)
 * Stage 3: 🌱 Step-by-Step Plant Growth (Morphogenesis powered by Photosynthesis)
 * Stage 4: 🍃 Leaf Anatomy & Stomatal Gas Exchange (Botanical Leaf Tissue)
 * Stage 5: 🌿 Plant Cell & Chloroplast Cyclosis (Cellular & Organelle Compartmentation)
 * Stage 6: ⚡ Photosystem II & Water Photolysis (Light-Dependent Photochemistry)
 * Stage 7: 🌊 Electron Transport Chain & PSI (Proton Pumping & NADPH Synthesis)
 * Stage 8: 🔄 ATP Synthase Molecular Turbine (Rotary Photophosphorylation)
 * Stage 9: 🧪 RuBisCO & Calvin Cycle (Light-Independent Glucose Synthesis)
 */

export const PHOTOSYNTHESIS_STAGES = [
  {
    id: 1,
    key: 'sun_space',
    name: 'Sun & Space Photon Transit',
    subtitle: 'Stage 1: Cosmic Origin of Solar Energy',
    shortName: '1. Sun & Space',
    icon: '☀️',
    cameraPos: { x: -120, y: 8, z: 24 },
    lookAt: { x: -95, y: 0, z: 0 },
    vrOffsetDist: 18,
    colorTheme: '#facc15',
    equation: '4 ¹H ➔ ⁴He + 2e⁺ + 2νₑ + 26.7 MeV (hν Photons ➔ Earth)',
    description: 'In the core of the Sun, nuclear fusion converts 600 million tons of hydrogen into helium every second, generating radiant electromagnetic photons (hν). These light packets travel 150 million kilometers through the cold vacuum of space in 8.3 minutes, delivering solar energy to Planet Earth.',
    narration: 'Our journey begins 150 million kilometers away at the Sun. Nuclear fusion releases photons that travel through space at the speed of light, reaching Earth in eight minutes to power all life.',
    keyPoints: [
      'Solar Radiation Spectrum: Visible light (400-700 nm) drives photosynthesis',
      'Solar Constant at Earth Orbit: ~1361 W/m² irradiance',
      'Photon Wave Packets: Discrete quantum energy packets (E = h·c / λ)',
      'Solar Flares & Prominences: High-energy magnetic eruptions on solar corona'
    ],
    telemetry: {
      solarIrradiance: '1361 W/m²',
      lightSpeed: '299,792 km/s',
      transitTime: '8.3 Minutes',
      surfaceTemp: '5,500 °C'
    }
  },
  {
    id: 2,
    key: 'earth_tree',
    name: 'Earth Atmosphere & Tree Canopy',
    subtitle: 'Stage 2: Macro Biological Solar Catchment',
    shortName: '2. Earth & Tree',
    icon: '🌍',
    cameraPos: { x: -25, y: 10, z: 20 },
    lookAt: { x: -25, y: 4, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#38bdf8',
    equation: 'Atmospheric Photons (PAR 400-700nm) ➔ Canopy Foliage Capture',
    description: 'Solar rays stream through Earth’s protective atmosphere and strike the lush green tree canopy. Thousands of sun-facing leaves act as biological solar collectors, intercepting incoming photons and initiating the global carbon cycle.',
    narration: 'Entering Earth atmosphere, golden sunbeams illuminate the forest canopy. Broad green leaves position themselves towards the sunlight, capturing photons with glistening chlorophyll pigments.',
    keyPoints: [
      'Photosynthetically Active Radiation (PAR): Wavelengths between 400nm and 700nm',
      'Canopy Light Interception: Upper canopy absorbs up to 90% of incident photons',
      'Volumetric Sunbeams (God Rays): Light scattering through humid forest air',
      'Chlorophyll Absorption Peaks: Peak blue (430 nm) and red (660-680 nm) absorption'
    ],
    telemetry: {
      leafAreaIndex: '4.8 m²/m²',
      parFlux: '1450 µmol/m²s',
      ambientCO2: '420 ppm',
      relativeHumidity: '68%'
    }
  },
  {
    id: 3,
    key: 'plant_growth',
    name: 'Step-by-Step Plant Growth',
    subtitle: 'Stage 3: Morphogenesis Powered by Photosynthesis',
    shortName: '3. Plant Growth',
    icon: '🌱',
    cameraPos: { x: 10, y: 6, z: 14 },
    lookAt: { x: 10, y: 2.5, z: 0 },
    vrOffsetDist: 9,
    colorTheme: '#22c55e',
    equation: 'Glucose (C₆H₁₂O₆) + ATP + Minerals ➔ Cellulose, Starch & Floral Biomass',
    description: 'Photosynthetic energy fuels morphogenesis step-by-step: 1. Seed germination and downward root growth (geotropism); 2. Hypocotyl sprout emerging towards light (phototropism); 3. Vegetative stem and true leaf expansion increasing solar catchment; 4. Floral budding and blooming powered by stored Calvin cycle carbohydrates.',
    narration: 'With solar energy captured, the plant undergoes step-by-step growth: roots anchor deep into the soil for water, sprouts push upward to the sun, broad true leaves branch out, and vibrant flowers bloom.',
    keyPoints: [
      'Phase 1: Seed Germination: Radicle emergence & root hair network absorbing H₂O',
      'Phase 2: Sprout & Cotyledons: Hypocotyl arch pushing upwards via phototropism',
      'Phase 3: Vegetative Foliage: Node elongation & leaf surface expansion fueled by ATP',
      'Phase 4: Floral Bloom & Fruit: Sugar translocation to reproductive flower organs'
    ],
    telemetry: {
      growthRate: '2.4 cm / day',
      rootSurfaceArea: '180 cm²',
      leafCount: '8 true leaves',
      biomassAccumulation: '+42 mg dry wt/day'
    }
  },
  {
    id: 4,
    key: 'leaf_macro',
    name: 'Leaf Anatomy & Gas Exchange',
    subtitle: 'Stage 4: Leaf Tissue Micro-Architecture',
    shortName: '4. Leaf & Stomata',
    icon: '🍃',
    cameraPos: { x: 45, y: 16, z: 28 },
    lookAt: { x: 45, y: 3, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#4ade80',
    equation: '6CO₂ + 6H₂O + Light (680nm) ➔ C₆H₁₂O₆ + 6O₂',
    description: 'Inside the leaf cross-section: Waxy Cuticle, Upper Epidermis, columnar Palisade Mesophyll cells, Spongy Mesophyll air caverns, and Vascular Bundles (Xylem delivering H₂O, Phloem exporting Glucose). Lower epidermis stomata guard cells open to inhale CO₂ and release O₂.',
    narration: 'Diving into leaf anatomy, we see palisade cells packed with chloroplasts. Xylem veins deliver water from the roots while stomatal guard cells breathe in carbon dioxide.',
    keyPoints: [
      'Waxy Cuticle: Waterproof lipid barrier reducing transpiration loss',
      'Palisade Mesophyll: Packed columnar cells absorbing >80% of light',
      'Spongy Mesophyll: Irregular cells with vast intercellular air spaces for gas diffusion',
      'Vascular Bundle: Xylem (H₂O transport) & Phloem (Sucrose/Glucose export)',
      'Stomata & Guard Cells: Turgor-driven osmotic valves regulating gas exchange'
    ],
    telemetry: {
      lightAbsorption: '92%',
      co2Concentration: '420 ppm',
      transpirationRate: '1.4 mmol/m²s',
      leafTemp: '24.5 °C'
    }
  },
  {
    id: 5,
    key: 'cell_chloroplast',
    name: 'Plant Cell & Chloroplast Cyclosis',
    subtitle: 'Stage 5: Cellular & Organelle View',
    shortName: '5. Cell & Chloroplast',
    icon: '🌿',
    cameraPos: { x: 85, y: 14, z: 24 },
    lookAt: { x: 85, y: 3, z: 0 },
    vrOffsetDist: 12,
    colorTheme: '#15803d',
    equation: 'Photons + H₂O + CO₂ ➔ Chloroplast Compartments',
    description: 'Inside a palisade mesophyll cell, rigid cellulose walls and a large central vacuole maintain turgor. Chloroplasts glide through the cytoplasm via cytoplasmic streaming (cyclosis). Cutaway chloroplast reveals outer/inner membranes, stroma matrix, granum thylakoid stacks, and lamellae.',
    narration: 'Inside the plant cell, chloroplasts glide in cytoplasmic currents around the central vacuole. Inside each chloroplast, pancake-like thylakoid discs form granum stacks bathed in stroma fluid.',
    keyPoints: [
      'Cellulose Cell Wall & Vacuole: Structural rigidity and turgor regulation',
      'Cytoplasmic Streaming (Cyclosis): Active transport of organelles around vacuole',
      'Double Envelope Membrane: Outer & inner membranes controlling metabolite flux',
      'Stroma: Aqueous alkaline matrix housing Calvin cycle enzymes',
      'Thylakoid Granum Stacks: Dense lipid membrane arrays harboring photosynthetic machinery'
    ],
    telemetry: {
      chloroplastsPerCell: '45 - 60',
      stromaPH: '7.9 (Alkaline)',
      cyclosisSpeed: '3.2 µm/s',
      granaCount: '~40 - 60 per chloroplast'
    }
  },
  {
    id: 6,
    key: 'photosystem_ii',
    name: 'Photosystem II & Water Photolysis',
    subtitle: 'Stage 6: Molecular Thylakoid Membrane',
    shortName: '6. PSII & Photolysis',
    icon: '⚡',
    cameraPos: { x: 130, y: 9, z: 18 },
    lookAt: { x: 130, y: 2, z: 0 },
    vrOffsetDist: 10,
    colorTheme: '#eab308',
    equation: '2H₂O + 4hν (P680) ➔ O₂ + 4H⁺ + 4e⁻ (E° = +1.25 V)',
    description: 'Embedded in the thylakoid lipid bilayer, Photosystem II (PSII) contains LHCII chlorophyll antennae. P680 chlorophyll absorbs photons, exciting electrons. The Oxygen-Evolving Complex (OEC) with its Mn₄CaO₅ catalytic cluster photolyzes 2 water molecules into O₂, 4 H⁺, and 4 high-energy electrons.',
    narration: 'At the thylakoid membrane, light strikes Photosystem Two. P680 chlorophyll absorbs photon energy, photolyzing water at the manganese-calcium cluster to release oxygen and protons.',
    keyPoints: [
      'P680 Reaction Center: Strongest biological oxidizing agent known (E° ≈ +1.25 V)',
      'Mn₄CaO₅ OEC Cluster: Catalyzes the 4-step Kok cycle of water oxidation',
      'Photolysis Reaction: 2H₂O ➔ O₂ (gas) + 4H⁺ (lumen) + 4e⁻',
      'Pheophytin & Plastoquinone (PQ): Primary electron acceptors transferring e⁻ to PQ_A and PQ_B'
    ],
    telemetry: {
      quantumYield: '0.98',
      photonFluxDensity: '1200 µmol/m²s',
      o2EvolutionRate: '28.4 µmol O₂/mg Chl·h',
      lumenPH: '5.8 (Acidic)'
    }
  },
  {
    id: 7,
    key: 'etc_proton_pumping',
    name: 'Electron Transport Chain & PSI',
    subtitle: 'Stage 7: Light-Dependent Reactions',
    shortName: '7. ETC & PSI',
    icon: '🌊',
    cameraPos: { x: 170, y: 9, z: 18 },
    lookAt: { x: 170, y: 2, z: 0 },
    vrOffsetDist: 10,
    colorTheme: '#06b6d4',
    equation: 'NADP⁺ + 2e⁻ + H⁺ ➔ NADPH (via Cyt b₆f & PSI / P700)',
    description: 'Plastoquinone (PQH₂) shuttles electrons through the lipid bilayer to the Cytochrome b₆f complex. Operating via the Q-cycle, Cyt b₆f pumps protons (H⁺) from stroma into lumen. Plastocyanin (PC) carries electrons to Photosystem I (PSI / P700). Second photon re-excites P700, passing electrons via Ferredoxin (Fd) to FNR to synthesize NADPH.',
    narration: 'Electrons flow through Plastoquinone into Cytochrome b6f, pumping protons into the lumen. Plastocyanin carries them to Photosystem One, producing NADPH.',
    keyPoints: [
      'Plastoquinone (PQH₂) Shuttle: Lipophilic electron and proton carrier',
      'Cytochrome b₆f Complex: Q-cycle generating transmembrane proton gradient (ΔpH)',
      'Plastocyanin (PC): Lumenal copper protein electron carrier',
      'Photosystem I (P700): Re-excitation by 700nm photons',
      'FNR & NADPH Synthesis: High-energy reducing agent for the Calvin cycle'
    ],
    telemetry: {
      electronFlux: '4.2 × 10¹⁴ e⁻/s',
      deltaPH: '2.1 pH units',
      pmfMotiveForce: '185 mV',
      nadphProduction: '18.2 µmol/mg Chl·h'
    }
  },
  {
    id: 8,
    key: 'atp_synthase',
    name: 'ATP Synthase Molecular Turbine',
    subtitle: 'Stage 8: Photophosphorylation',
    shortName: '8. ATP Synthase',
    icon: '🔄',
    cameraPos: { x: 210, y: 10, z: 18 },
    lookAt: { x: 210, y: 3, z: 0 },
    vrOffsetDist: 10,
    colorTheme: '#f97316',
    equation: 'ADP + Pᵢ + ~3.3 H⁺(lumen➔stroma) ➔ ATP + H₂O',
    description: 'The electrochemical proton gradient drives H⁺ from the thylakoid lumen back into stroma through the F₀ rotor subunit of ATP Synthase. The rotating central γ-shaft drives sequential conformational changes (Open, Loose, Tight) in the F₁ catalytic α₃β₃ hexamer, mechanically forging ADP and phosphate into ATP.',
    narration: 'Accumulated protons rush through the ATP Synthase turbine into the stroma. The spinning molecular shaft forces ADP and phosphate together to forge cellular ATP.',
    keyPoints: [
      'F₀ Rotor Complex: Embedded c-ring powered by proton translocation',
      'Asymmetric γ-Shaft: Eccentric rotation imparting mechanical strain onto F₁ heads',
      'F₁ Catalytic Hexamer (α₃β₃): 3 active sites cycling through Open, Loose, and Tight states',
      'Rotational Speed: Up to 100-130 revolutions per second under solar illumination'
    ],
    telemetry: {
      turbineRPM: '7,200 RPM',
      atpProductionRate: '36.5 µmol ATP/mg Chl·h',
      protonCurrent: '1.2 × 10¹⁵ H⁺/s',
      mechEfficiency: '94%'
    }
  },
  {
    id: 9,
    key: 'calvin_cycle',
    name: 'RuBisCO & Calvin Cycle',
    subtitle: 'Stage 9: Stroma Biochemical Glucose Synthesis',
    shortName: '9. Calvin Cycle',
    icon: '🧪',
    cameraPos: { x: 250, y: 12, z: 22 },
    lookAt: { x: 250, y: 3, z: 0 },
    vrOffsetDist: 12,
    colorTheme: '#a855f7',
    equation: '3 CO₂ + 9 ATP + 6 NADPH ➔ 1 G3P (➔ Glucose C₆H₁₂O₆) + 9 ADP + 6 NADP⁺',
    description: 'In the stroma, RuBisCO catalyzes carbon fixation by combining CO₂ with RuBP into 3-PGA. Using ATP and NADPH from light reactions, 3-PGA is reduced to G3P. Every 6 turns export 2 G3P molecules to synthesize Glucose (C₆H₁₂O₆) and starch grains, which translocate throughout the plant to power stem elongation, root expansion, and floral bloom.',
    narration: 'In the stroma, RuBisCO fixes carbon dioxide to produce G3P sugars that assemble into glucose and starch, completing the cycle and fueling the plant growth we observed.',
    keyPoints: [
      'Phase 1: Carbon Fixation: RuBisCO carboxylates RuBP into 3-PGA',
      'Phase 2: Reduction: 3-PGA phosphorylated by ATP and reduced by NADPH to G3P',
      'Phase 3: Glucose Synthesis: G3P molecules assemble into Glucose and Starch storage',
      'Phase 4: RuBP Regeneration: Sugar rearrangement consuming ATP to restart the cycle'
    ],
    telemetry: {
      rubiscoActivity: '3.8 µmol CO₂/min·mg',
      g3pExportRate: '12.1 µmol/h',
      glucoseYield: '6.05 µmol/h',
      stromaRubiscoConc: '300 mg/mL'
    }
  }
];

export const SIMULATION_PARAMETERS = {
  lightIntensity: 1.0, // 0.0 to 2.0 (Sunlight photon flux)
  co2Level: 1.0,       // 0.2 to 2.0 (Atmospheric CO2 concentration)
  waterSupply: 1.0,    // 0.2 to 2.0 (Xylem water availability)
  temperature: 25,     // 10 to 45 °C (Optimal enzyme kinetics at 25-30°C)
  simSpeed: 1.0,       // 0.1 to 3.0 (Simulation time multiplier)
  plantGrowth: 1.0     // 0.0 to 1.0 (Plant morphogenesis progress)
};
