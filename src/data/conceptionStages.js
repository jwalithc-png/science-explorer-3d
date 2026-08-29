/**
 * Human Conception & Child Formation Scientific Stages & Biological Hierarchy Data
 * 
 * 9 Connected Cinematic Interactive Stages:
 * Stage 1: 🏊 Sperm Journey & Chemotaxis (Female Reproductive Tract Motility)
 * Stage 2: 🥚 The Mature Oocyte & Corona Radiata (Encounter at Ampulla)
 * Stage 3: ⚡ Acrosome Reaction & Membrane Fusion (Izumo1 - Juno Receptor Binding)
 * Stage 4: 💫 Cortical Reaction, Zinc Spark & Syngamy (The Spark of Life / Zygote)
 * Stage 5: 🔬 Cleavage Divisions & Blastocyst (Morula to Pluripotent Blastocyst)
 * Stage 6: 🧬 Endometrial Implantation & Gastrulation (3 Germ Layers & Placenta Origin)
 * Stage 7: ❤️ Embryonic Organogenesis & The First Heartbeat (Weeks 4-8 C-Shaped Embryo)
 * Stage 8: 👶 Fetal Development & Placental Life-Support (Amniotic Sac & Umbilical Cord)
 * Stage 9: 🌟 Full-Term Child Formation & Miracle of Life (Week 40 Ready for Birth)
 */

export const CONCEPTION_STAGES = [
  {
    id: 1,
    key: 'sperm_journey',
    name: 'Sperm Journey & Chemotaxis',
    subtitle: 'Stage 1: The Microscopic Odyssey (Motility & Capacitation)',
    shortName: '1. Sperm Journey',
    icon: '🏊',
    timeline: '0 to 2 Hours Post-Insemination',
    cameraPos: { x: -120, y: 6, z: 20 },
    lookAt: { x: -120, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#38bdf8',
    equation: 'ATP + Dynein Axoneme (9+2) ➔ Sine Wave Propulsive Thrust (~35 µm/s)',
    description: 'Over 200-300 million spermatozoa embark on an arduous journey through the female reproductive tract. Swimming against fluid currents in the cervical canal and Fallopian tube, sperm undergo capacitation (hyperactivation and cholesterol efflux). Guided by thermal gradients (thermotaxis) and progesterone chemical cues (chemotaxis) released by the cumulus oophorus, the most viable sperm reach the ampulla.',
    narration: 'Over two hundred million sperm begin their journey through the female reproductive tract. Propelled by whip-like flagella and guided by chemical signals, only the strongest swimmers reach the Fallopian tube ampulla.',
    keyPoints: [
      'Flagellar 9+2 Microtubule Axoneme: Powered by ATP hydrolysis from mitochondrial midpiece spiral',
      'Capacitation: Removal of glycoprotein coat and destabilization of acrosomal plasma membrane',
      'Chemotaxis & Thermotaxis: Swimming up progesterone gradients and slight temperature differences',
      'Rheotaxis: Upstream swimming against ciliated epithelial mucosal micro-currents'
    ],
    telemetry: {
      spermCount: '250 Million',
      swimmingSpeed: '35 - 50 µm/s',
      flagellarBeatRate: '25 - 35 Hz',
      atpConsumption: '4.5 × 10⁻¹⁷ mol/s'
    }
  },
  {
    id: 2,
    key: 'oocyte_encounter',
    name: 'The Oocyte & Corona Radiata',
    subtitle: 'Stage 2: Approaching the Female Gamete',
    shortName: '2. The Oocyte',
    icon: '🥚',
    timeline: 'Hour 2 to 4 (In the Ampulla)',
    cameraPos: { x: -75, y: 7, z: 22 },
    lookAt: { x: -75, y: 0, z: 0 },
    vrOffsetDist: 15,
    colorTheme: '#fb7185',
    equation: 'Secondary Oocyte (Metaphase II) + 1st Polar Body + Corona Radiata Matrix',
    description: 'At the ampulla of the Fallopian tube awaits the massive mature secondary oocyte (~120 µm in diameter — one of the largest human cells). It is enveloped by the Corona Radiata (radiating granulosa/cumulus cells embedded in hyaluronic acid extracellular matrix) and the translucent glycoprotein shell known as the Zona Pellucida (composed of ZP1, ZP2, ZP3, and ZP4 filaments).',
    narration: 'In the ampulla lies the giant mature egg, surrounded by follicular corona radiata cells and a glowing protective shell called the zona pellucida.',
    keyPoints: [
      'Mature Secondary Oocyte: Arrested at Metaphase II of meiosis until sperm entry',
      'Corona Radiata: Protective cloud of cumulus follicular cells producing progesterone',
      'Zona Pellucida: 15 µm thick extracellular matrix composed of crosslinked ZP glycoproteins',
      'Perivitelline Space: Fluid-filled gap containing the extruded 1st Polar Body'
    ],
    telemetry: {
      oocyteDiameter: '120 µm',
      zonaThickness: '15 µm',
      cumulusCellCount: '~3,000 Cells',
      meioticState: 'Metaphase II'
    }
  },
  {
    id: 3,
    key: 'acrosome_fusion',
    name: 'Acrosome Reaction & Fusion',
    subtitle: 'Stage 3: Penetrating the Protective Glycoprotein Barrier',
    shortName: '3. Acrosome Fusion',
    icon: '⚡',
    timeline: 'Hour 4 to 5 (Membrane Docking)',
    cameraPos: { x: -30, y: 6, z: 18 },
    lookAt: { x: -30, y: 0, z: 0 },
    vrOffsetDist: 12,
    colorTheme: '#facc15',
    equation: 'Izumo1 (Sperm) + Juno (Oocyte) ➔ Bilayer Membrane Fusion & Core Influx',
    description: 'Upon contact with the zona pellucida, sperm undergo the Acrosome Reaction: outer acrosomal membranes fuse, releasing hydrolytic enzymes (Hyaluronidase and Acrosin) that dissolve a tunnel through the zona matrix. The victorious sperm reaches the oolemma (egg plasma membrane), where its Izumo1 protein specifically binds to oocyte Juno receptors, initiating bilateral membrane fusion.',
    narration: 'Upon binding to the zona pellucida, the sperm releases acrosomal enzymes to digest through the shell. The sperm head docks with the egg membrane via Izumo1 and Juno receptor proteins, initiating fusion.',
    keyPoints: [
      'Acrosomal Exocytosis: Regulated release of Acrosin and Hyaluronidase enzymes',
      'Hyperactivation: High-amplitude, asymmetric flagellar beating drilling through the zona',
      'Izumo1-Juno Receptor Complex: Molecular lock-and-key mediating gamete membrane recognition',
      'Microvilli Engulfment: Oocyte microvilli wrap around sperm head to internalize genetic payload'
    ],
    telemetry: {
      acrosinEnzymeFlux: '8.2 × 10⁻¹² units',
      receptorAffinity: 'Kd ≈ 12 nM',
      fusionDuration: '2.4 Minutes',
      membraneVoltage: '-70 mV'
    }
  },
  {
    id: 4,
    key: 'fertilization_spark',
    name: 'Cortical Reaction & Syngamy',
    subtitle: 'Stage 4: The Spark of Life (Zinc Spark & Pronuclear Fusion)',
    shortName: '4. The Spark of Life',
    icon: '💫',
    timeline: 'Hour 5 to 24 (Zygote Formation)',
    cameraPos: { x: 15, y: 7, z: 20 },
    lookAt: { x: 15, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#a855f7',
    equation: '23 Maternal Chromosomes (1n) + 23 Paternal Chromosomes (1n) ➔ Diploid Zygote (2n, 46)',
    description: 'Sperm entry triggers PLC-zeta, causing oscillatory Calcium waves (Ca²⁺) and the spectacular bioluminescent Zinc Spark across the egg cortex. Cortical granules fuse with the oolemma, releasing ovoperoxidase and proteases that permanently harden the zona pellucida (Slow Block to Polyspermy). The secondary oocyte completes meiosis II. Male and female pronuclei migrate towards each other, decondense, and undergo Syngamy to form the single-celled Diploid Zygote (46 chromosomes).',
    narration: 'The spark of life ignites! A wave of calcium and a zinc flash surge across the egg cortex, locking out all other sperm. Male and female pronuclei fuse their genetic codes to forge a new diploid zygote.',
    keyPoints: [
      'Calcium Wave & Zinc Spark: Repetitive Ca²⁺ transients activating maternal metabolism',
      'Cortical Reaction (Zonal Hardening): Permanent biochemical block preventing lethal polyspermy',
      'Completion of Meiosis II: Extrusion of 2nd Polar Body',
      'Syngamy: Nuclear envelopes break down, combining 23 maternal + 23 paternal chromosomes'
    ],
    telemetry: {
      calciumPeak: '1.2 µM [Ca²⁺]i',
      zincSparkIons: '~10 Billion Zn²⁺',
      corticalGranules: '~15,000 Fused',
      chromosomeCount: '46 (Diploid 2n)'
    }
  },
  {
    id: 5,
    key: 'cleavage_blastocyst',
    name: 'Cleavage & Blastocyst Formation',
    subtitle: 'Stage 5: Mitotic Cell Division (Days 1 to 6)',
    shortName: '5. Blastocyst',
    icon: '🔬',
    timeline: 'Day 1 to 6 (Journey to Uterus)',
    cameraPos: { x: 60, y: 8, z: 22 },
    lookAt: { x: 60, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#22c55e',
    equation: '1 Zygote ➔ 2-Cell ➔ 4-Cell ➔ 8-Cell ➔ 16-Cell Morula ➔ 128-Cell Blastocyst',
    description: 'The zygote undergoes rapid mitotic cleavages without increasing overall size: 2-cell (Day 1), 4-cell (Day 2), 8-cell (Day 3), and a compact ball called the Morula (16-32 cells, Day 4). By Day 5-6, Na⁺/K⁺ ATPase pumps fluid inside to form the fluid-filled Blastocoel cavity. The embryo differentiates into two distinct lineages: the outer Trophoblast (future placenta) and the pluripotent Inner Cell Mass (ICM / Embryoblast, the future baby). The blastocyst hatches from the zona pellucida.',
    narration: 'Over six days, the zygote divides into two, four, eight, and sixteen cells to form the morula. It expands into a blastocyst featuring the inner cell mass that will become the child and the trophoblast that will become the placenta.',
    keyPoints: [
      'Compaction: Blastomeres maximize cell-cell contact through tight junctions and E-cadherin',
      'Cavitation: Trophoblast sodium pumps drive osmotic water influx to form the Blastocoel',
      'Inner Cell Mass (ICM): Pluripotent embryonic stem cells expressing Oct4, Sox2, and Nanog',
      'Zona Hatching: Blastocyst sheds glycoprotein shell, preparing for uterine implantation'
    ],
    telemetry: {
      cellCount: '128 - 256 Blastomeres',
      blastocystSize: '~150 - 200 µm',
      pluripotencyIndex: '100% (ICM)',
      hcgSecretion: 'Initiating (~5 mIU/mL)'
    }
  },
  {
    id: 6,
    key: 'implantation_gastrulation',
    name: 'Implantation & Gastrulation',
    subtitle: 'Stage 6: Uterine Nidation & 3 Germ Layers (Weeks 2 to 3)',
    shortName: '6. Implantation',
    icon: '🧬',
    timeline: 'Week 2 to 3 (Day 7 - 21)',
    cameraPos: { x: 105, y: 9, z: 24 },
    lookAt: { x: 105, y: 0, z: 0 },
    vrOffsetDist: 15,
    colorTheme: '#f97316',
    equation: 'Bilaminar Disc (Epiblast + Hypoblast) ➔ Gastrulation (Ectoderm + Mesoderm + Endoderm)',
    description: 'The blastocyst adheres to and burrows into the vascular endometrium. The trophoblast differentiates into inner Cytotrophoblast and invasive multinucleated Syncytiotrophoblast, eroding maternal capillaries to create blood lacunae. The inner cell mass forms a bilaminar disc (Epiblast and Hypoblast). During Gastrulation (Week 3), cells invaginate through the Primitive Streak, generating the 3 definitive Primary Germ Layers: Ectoderm (nervous system & skin), Mesoderm (muscles, bones, heart & blood), and Endoderm (gut & lungs).',
    narration: 'The blastocyst implants into the maternal uterine wall. The embryonic disc undergoes gastrulation, folding into three fundamental germ layers that lay down the architectural blueprint of every human organ.',
    keyPoints: [
      'Syncytiotrophoblast Invasion: Secretes hCG hormone to maintain corpus luteum and progesterone',
      'Primitive Streak & Node: Establishes bilateral body axes (Cranio-Caudal and Dorso-Ventral)',
      'Trilaminar Germ Layers: Ectoderm (neural/skin), Mesoderm (cardiac/muscle/bone), Endoderm (viscera)',
      'Neurulation Origin: Notochord induces overlying ectoderm to form neural plate and neural tube'
    ],
    telemetry: {
      implantationDepth: '100% Interstitial',
      hcgConcentration: '250 - 500 mIU/mL',
      germLayers: '3 (Ecto, Meso, Endo)',
      embryonicLength: '1.5 - 2.5 mm'
    }
  },
  {
    id: 7,
    key: 'embryo_heartbeat',
    name: 'Embryogenesis & First Heartbeat',
    subtitle: 'Stage 7: The Rhythm of Life & Organogenesis (Weeks 4 to 8)',
    shortName: '7. First Heartbeat',
    icon: '❤️',
    timeline: 'Week 4 to 8 (Day 22 - 56)',
    cameraPos: { x: 150, y: 9, z: 22 },
    lookAt: { x: 150, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#ef4444',
    equation: 'Primitive Cardiac Tube ➔ Spontaneous Peristaltic Myocardial Contraction (~120-160 BPM)',
    description: 'On Day 21-22, the primitive heart tube begins beating spontaneously — the very first functional organ system of the human body! The C-shaped embryo exhibits neural tube closure, optic vesicles (eyes), otic placodes (ears), branchial arches, and budding limb buds that develop digital rays (fingers and toes). By the end of Week 8 (the close of the embryonic period), 90% of all anatomical adult structures are present in miniature form.',
    narration: 'At just three weeks, the primitive heart tube begins its first rhythmic beats. Facial features, brain vesicles, and delicate paddle-shaped limb buds form as the human blueprint takes physical shape.',
    keyPoints: [
      'Cardiac Looping & Septation: Primitive tubular heart loops to form 4-chambered cardiac structure',
      'Neural Tube Closure: Cranial and caudal neuropores close, forming brain and spinal cord',
      'Limb Bud Morphogenesis: Apical Ectodermal Ridge (AER) drives arm and leg elongation with finger separation',
      'End of Embryonic Stage: Transition to Fetus at Week 9 with fully established organ systems'
    ],
    telemetry: {
      embryonicHeartRate: '140 - 165 BPM',
      crownRumpLength: '15 - 30 mm',
      somiteCount: '42 - 44 Pairs',
      gestationalAge: 'Week 7 (Day 49)'
    }
  },
  {
    id: 8,
    key: 'fetal_placenta',
    name: 'Fetal Development & Placenta',
    subtitle: 'Stage 8: Life-Support System & Sensory Growth (Weeks 12 to 28)',
    shortName: '8. Fetal Placenta',
    icon: '👶',
    timeline: 'Week 12 to 28 (Second Trimester)',
    cameraPos: { x: 195, y: 10, z: 24 },
    lookAt: { x: 195, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#38bdf8',
    equation: 'Placental Villi Countercurrent Exchange: 2 Umbilical Arteries (O₂-poor) + 1 Umbilical Vein (O₂-rich)',
    description: 'Floating weightlessly inside the clear, warm Amniotic Sac, the developing fetus grows rapidly. Translucent skin reveals intricate microvascular capillary beds. The fully formed Discoid Placenta acts as fetal lungs, kidneys, and gastrointestinal tract: maternal blood in intervillous spaces transfers oxygen and nutrients across the syncytiovascular barrier. The fetus kicks, grasps with tiny fingers, swallows amniotic fluid, and responds to external auditory sounds.',
    narration: 'Suspended weightlessly in the protective amniotic fluid, the fetus grows in comfort. The placenta and umbilical cord deliver vital oxygen and nutrients, while the baby begins moving, hearing, and kicking.',
    keyPoints: [
      'Amniotic Sac & Fluid: Provides constant 37°C temperature, mechanical cushioning, and lung practice',
      'Umbilical Cord Architecture: 2 Arteries + 1 Vein enveloped in resilient Wharton’s Jelly',
      'Placental Barrier: Prevents direct maternal-fetal blood mixing while enabling gas and IgG antibody transfer',
      'Sensory Neurological Awakening: Auditory cochlea functional by Week 20; responsive to maternal voice'
    ],
    telemetry: {
      fetalHeartRate: '135 - 150 BPM',
      fetalWeight: '~900 - 1,200 g',
      crownRumpLength: '24 - 32 cm',
      amnioticFluidVolume: '~750 mL'
    }
  },
  {
    id: 9,
    key: 'full_term_child',
    name: 'Full-Term Child Formation',
    subtitle: 'Stage 9: The Miracle of Life (Week 38 to 40 - Ready for Birth)',
    shortName: '9. Full-Term Miracle',
    icon: '🌟',
    timeline: 'Week 38 to 40 (Full-Term Infant)',
    cameraPos: { x: 240, y: 11, z: 26 },
    lookAt: { x: 240, y: 0, z: 0 },
    vrOffsetDist: 18,
    colorTheme: '#ec4899',
    equation: '3.4 kg Full-Term Human Infant: 100 Trillion Cells, Mature Alveoli & Ready for First Breath',
    description: 'After 280 days of marvelous biological development, the full-term baby is complete and ready for birth. Positioned in cephalic vertex orientation, the infant has plump subcutaneous fat, soft vernix caseosa coating, mature pulmonary surfactant in lung alveoli, fully formed fingernails, and a strong, steady heartbeat. The incredible journey from a single swimming microscopic sperm and solitary egg to a conscious, breathing human child is complete.',
    narration: 'After nine miraculous months, child formation is complete. From a single sperm and egg cell, an intricate, conscious human life has formed with over one hundred trillion cells, ready to take its first breath.',
    keyPoints: [
      'Cephalic Presentation: Head engaged in maternal pelvis ready for labor and delivery',
      'Pulmonary Surfactant Maturation: Type II pneumocytes produce dipalmitoylphosphatidylcholine for lung expansion',
      'Vernix Caseosa & Lanugo: Protective waterproof biofilm shielding newborn skin',
      'Cardiopulmonary Transition at Birth: Closure of Foramen Ovale and Ductus Arteriosus upon first breath'
    ],
    telemetry: {
      gestationalAge: '40 Weeks (Full Term)',
      averageBirthWeight: '3.4 kg (7.5 lbs)',
      infantLength: '50 - 52 cm',
      cellTotal: '~100 Trillion Cells'
    }
  }
];

export const CONCEPTION_SIMULATION_PARAMETERS = {
  heartRateBPM: 140,         // 100 to 180 BPM for embryo/fetal heartbeat
  spermMotilitySpeed: 1.0,   // 0.2 to 2.5x sperm flagellar swimming speed
  calciumWaveIntensity: 1.0, // 0.0 to 2.0x glow & ripple intensity
  amnioticGlow: 1.0,         // 0.2 to 2.0x fluid translucency
  simSpeed: 1.0,             // 0.2 to 3.0x simulation time multiplier
  rotationSpeed360: 0.5,     // 0.0 to 2.0 auto turntable rotation speed
  autoRotate360: false,      // Auto 360 degree turntable spin toggle
  crossSectionView: false    // Cutaway internal anatomical cross-section toggle
};
