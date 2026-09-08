/**
 * Human Heart & Cardiovascular System Scientific Stages & Hemodynamics Data
 * 
 * 10 Connected Cinematic Interactive Stages:
 * Stage 1:  Superior & Inferior Vena Cava (Systemic Venous Return)
 * Stage 2:  Right Atrium & Tricuspid Valve (Atrioventricular Filling & Leaflets)
 * Stage 3:  Right Ventricle & Inflow Tract (Pulmonary Muscular Chamber)
 * Stage 4:  Pulmonary Valve & Trunk (Semilunar Ejection to Pulmonary Arteries)
 * Stage 5:  Pulmonary Alveolar Capillaries (Gas Exchange: CO2 Unloading & O2 Oxygenation)
 * Stage 6:  Pulmonary Veins & Left Atrium (Oxygenated Arterial Inflow)
 * Stage 7:  Mitral (Bicuspid) Valve & Annulus (High-Pressure Dual-Leaflet Gateway)
 * Stage 8:  Left Ventricle & Myocardium (Helical High-Pressure Systemic Pump)
 * Stage 9:  Aortic Valve, Sinuses of Valsalva & Aortic Arch (Systemic Distribution)
 * Stage 10: Complete Beating Heart & Cardiac Conduction System (SA Node, AV Node, Purkinje & Dual-Phase Pump)
 */

export const HEART_STAGES = [
  {
    id: 1,
    key: 'vena_cava',
    name: 'Superior & Inferior Vena Cava',
    subtitle: 'Stage 1: Systemic Venous Return & Deoxygenated Inflow',
    shortName: '1. Vena Cava',
    icon: '🔵',
    timeline: 'Continuous Venous Return (Central Venous Pressure: 2 - 6 mmHg)',
    cameraPos: { x: -135, y: 5, z: 20 },
    lookAt: { x: -135, y: 0, z: 0 },
    vrOffsetDist: 15,
    colorTheme: '#3b82f6',
    equation: 'CVP = 2 - 6 mmHg | Deoxygenated Hemoglobin (Hb-CO2) Return ~ 75% Saturation',
    description: 'The Superior Vena Cava drains deoxygenated venous blood from the head, neck, upper limbs, and thorax, while the Inferior Vena Cava drains the lower body and abdominal organs. Both large conduit vessels empty directly into the right atrium with low venous pressure, initiating the cardiac cycle.',
    narration: 'Deoxygenated venous blood from the entire body returns to the heart through the superior and inferior vena cava, flowing with gentle low pressure into the right atrium.',
    keyPoints: [
      'Superior Vena Cava: Drains systemic blood from head, neck, chest, and arms',
      'Inferior Vena Cava: Largest vein in the human body, draining abdomen, pelvis, and legs',
      'Central Venous Pressure: 2 - 6 mmHg driving low-resistance laminar flow',
      'Deoxygenated Hemoglobin: Blue-tinted blood carrying metabolic carbon dioxide'
    ],
    telemetry: {
      flowRate: '5.0 L/min',
      venousPressure: '4 mmHg',
      o2Saturation: '75%',
      vesselDiameter: '20 - 24 mm'
    }
  },
  {
    id: 2,
    key: 'right_atrium_tricuspid',
    name: 'Right Atrium & Tricuspid Valve',
    subtitle: 'Stage 2: Atrial Filling & The Tricuspid Gateway',
    shortName: '2. Right Atrium',
    icon: '🚪',
    timeline: 'Atrial Diastole & Systole (Pressure: 0 - 5 mmHg)',
    cameraPos: { x: -105, y: 6, z: 22 },
    lookAt: { x: -105, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#60a5fa',
    equation: 'Atrial Booster Kick (~20% Ventricular Filling) + Tricuspid Inflow',
    description: 'The Right Atrium features thin muscular walls lined with pectinate muscles and the interatrial septum bearing the fossa ovalis. Blood flows across the Tricuspid Valve, composed of 3 fibrous leaflets anchored by fine chordae tendineae to papillary muscles that prevent backflow into the atrium during contraction.',
    narration: 'The right atrium gathers returning blood and gently squeezes it through the three-leaflet tricuspid valve, where chordae tendineae anchor the flaps to prevent backflow.',
    keyPoints: [
      'Pectinate Muscles: Comb-like muscular ridges augmenting atrial contraction power',
      'Fossa Ovalis: Central depression representing the closed fetal foramen ovale',
      'Tricuspid Valve: 3 flexible fibrous cusps (anterior, posterior, septal)',
      'Chordae Tendineae: Fibrous strings tethering valve leaflets to papillary muscles'
    ],
    telemetry: {
      atrialPressure: '2 - 5 mmHg',
      valveArea: '7 - 9 cm²',
      fillingVolume: '60 - 80 mL',
      atrialKick: '20% of EDV'
    }
  },
  {
    id: 3,
    key: 'right_ventricle',
    name: 'Right Ventricle & Trabeculae',
    subtitle: 'Stage 3: The Crescent Low-Pressure Muscular Pump',
    shortName: '3. Right Ventricle',
    icon: '🌊',
    timeline: 'Ventricular Systole (Peak Pressure: 25 mmHg)',
    cameraPos: { x: -75, y: 6, z: 22 },
    lookAt: { x: -75, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#0284c7',
    equation: 'RV Systolic Pressure = 25 mmHg | Diastolic Pressure = 4 mmHg',
    description: 'The Right Ventricle wraps crescents around the thick left ventricle. Its interior is lined with trabeculae carneae muscular columns and the prominent moderator band (septomarginal trabecula) which rapidly conducts electrical excitation from the septal branch to the anterior papillary muscle.',
    narration: 'Inside the crescent-shaped right ventricle, muscular trabeculae and the electrical moderator band coordinate a rapid squeeze, propelling blood toward the lungs under gentle low pressure.',
    keyPoints: [
      'Crescent Shape: Wraps around the high-pressure conical left ventricle',
      'Trabeculae Carneae: Muscular ridges preventing blood stasis and suction',
      'Moderator Band: Shortcut conduction conduit to anterior papillary muscle',
      'Low Pressure System: 25/4 mmHg preserves delicate pulmonary alveolar capillaries'
    ],
    telemetry: {
      rvPressure: '25 / 4 mmHg',
      strokeVolume: '70 mL',
      wallThickness: '3 - 5 mm',
      ejectionFraction: '55%'
    }
  },
  {
    id: 4,
    key: 'pulmonary_valve_artery',
    name: 'Pulmonary Valve & Trunk',
    subtitle: 'Stage 4: Semilunar Ejection to the Pulmonary Arteries',
    shortName: '4. Pulmonary Trunk',
    icon: '🍃',
    timeline: 'Rapid Ventricular Ejection (~180 ms)',
    cameraPos: { x: -45, y: 6, z: 22 },
    lookAt: { x: -45, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#06b6d4',
    equation: 'dP/dt Ejection Velocity ~ 0.8 - 1.2 m/s across Semilunar Cusps',
    description: 'During ventricular systole, rising chamber pressure pushes the 3 pocket-like semilunar cusps of the Pulmonary Valve open against the artery wall. Blood rushes into the wide Pulmonary Trunk, which promptly bifurcates into the Left and Right Pulmonary Arteries carrying deoxygenated blood into both lungs.',
    narration: 'Under systolic pressure, the pulmonary semilunar valve opens wide. Blood surges into the pulmonary trunk, branching to the left and right lungs to be renewed.',
    keyPoints: [
      'Semilunar Cusps: 3 pocket-like valves without chordae tendineae',
      'Pulmonary Bifurcation: Splits into left and right branches to both lungs',
      'Elastic Arterial Windkessel: Artery stretches during ejection to smooth blood flow',
      'Valvular Closure (S2 Dub): Snaps shut when pressure in pulmonary artery exceeds ventricle'
    ],
    telemetry: {
      peakVelocity: '1.0 m/s',
      valveDiameter: '20 mm',
      ejectionDuration: '180 ms',
      trunkPressure: '25 / 10 mmHg'
    }
  },
  {
    id: 5,
    key: 'alveolar_gas_exchange',
    name: 'Pulmonary Alveolar Gas Exchange',
    subtitle: 'Stage 5: Microvascular Oxygenation & Hemoglobin Activation',
    shortName: '5. Alveolar Exchange',
    icon: '🫁',
    timeline: 'Transit Time: ~0.75 seconds across Alveolar Capillary Bed',
    cameraPos: { x: -15, y: 6, z: 20 },
    lookAt: { x: -15, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#a855f7',
    equation: 'Deoxyhemoglobin (Blue) + 4 O2 ➔ Oxyhemoglobin (Ruby Crimson Red)',
    description: 'In the microscopic capillary web enveloping lung alveoli, erythrocyte red blood cells squeeze single-file through 7 µm diameter capillaries. Carbon dioxide diffuses out into the alveolar air space while oxygen binds avidly to hemoglobin heme iron centers, instantly turning venous blue erythrocytes into brilliant arterial ruby red.',
    narration: 'In the microscopic alveolar capillaries of the lungs, red blood cells release carbon dioxide and absorb fresh oxygen, transforming instantly from venous blue to vibrant crimson red.',
    keyPoints: [
      'Alveolar-Capillary Membrane: Ultra-thin 0.5 µm barrier allowing rapid passive diffusion',
      'Hemoglobin O2 Affinity: Cooperativity binds 4 oxygen molecules per hemoglobin tetramer',
      'Color Metamorphosis: Shifts from deep cyan-purple deoxygenated state to scarlet arterial red',
      'Carbon Dioxide Clearance: CO2 expelled via carbonic anhydrase reaction into exhaled breath'
    ],
    telemetry: {
      capillaryDiameter: '7 µm',
      o2SaturationGain: '75% ➔ 98%',
      diffusionDistance: '0.5 µm',
      erythrocyteTransit: '0.75 s'
    }
  },
  {
    id: 6,
    key: 'pulmonary_veins_left_atrium',
    name: 'Pulmonary Veins & Left Atrium',
    subtitle: 'Stage 6: Oxygenated Arterial Inflow to the Left Heart',
    shortName: '6. Left Atrium',
    icon: '🔴',
    timeline: 'Continuous Inflow (Mean LA Pressure: 6 - 10 mmHg)',
    cameraPos: { x: 15, y: 6, z: 22 },
    lookAt: { x: 15, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#f43f5e',
    equation: '4 Pulmonary Veins ➔ 98% SaO2 Ruby Blood Inflow ➔ Left Atrial Filling',
    description: 'Four Pulmonary Veins (two left, two right) deliver newly oxygen-saturated scarlet blood into the smooth-walled Left Atrium located on the posterior heart base. The left atrium acts as an elastic reservoir during ventricular systole and an active booster pump during diastole.',
    narration: 'Four pulmonary veins deliver freshly oxygenated scarlet blood into the left atrium, building the reservoir that will supply the entire human body.',
    keyPoints: [
      'Four Pulmonary Veins: Only veins in post-natal humans carrying oxygenated blood',
      'Smooth Posterior Wall: Formed by incorporation of embryonic pulmonary vein tissue',
      'Left Atrial Auricle / Appendage: Trabeculated ear-like pouch providing volume buffer',
      'Elevated Filling Pressure: 8 mmHg pressure prepares rapid left ventricular loading'
    ],
    telemetry: {
      laPressure: '6 - 10 mmHg',
      o2Saturation: '98%',
      veinCount: '4 Vessels',
      reservoirCapacity: '65 mL'
    }
  },
  {
    id: 7,
    key: 'mitral_valve',
    name: 'Mitral (Bicuspid) Valve & Annulus',
    subtitle: 'Stage 7: The High-Pressure Dual-Leaflet Gateway',
    shortName: '7. Mitral Valve',
    icon: '💎',
    timeline: 'Early Diastolic Rapid Inflow & Atrial Systole',
    cameraPos: { x: 45, y: 6, z: 22 },
    lookAt: { x: 45, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#fb7185',
    equation: 'Mitral Inflow E/A Waves | Peak Pressure Gradient = 2 - 4 mmHg',
    description: 'The Mitral Valve features 2 heavy, durable fibrous leaflets (Anterior and Posterior) seated within a flexible fibrous annulus. Powerful chordae tendineae tether the leaflets to massive anterolateral and posteromedial papillary muscles, withstanding up to 120 mmHg of systolic backpressure without leaking.',
    narration: 'The bicuspid mitral valve opens like a double gate, pouring oxygen-rich blood into the left ventricle. Robust fibrous chords prevent the leaflets from prolapsing under extreme pressure.',
    keyPoints: [
      'Bicuspid Design: 2 large leaflets shaped like a bishop\'s miter',
      'Papillary Muscle Architecture: Dual muscle heads contracting synchronously with ventricle',
      'First Heart Sound (S1 Lub): Audible closure of mitral and tricuspid valves at onset of systole',
      'Extreme Tensile Strength: Chordae tendineae withstand 120 mmHg systolic pressure'
    ],
    telemetry: {
      orificeArea: '4 - 6 cm²',
      peakInflowRate: '450 mL/s',
      valveThickness: '1.5 mm',
      closureSound: 'S1 Component'
    }
  },
  {
    id: 8,
    key: 'left_ventricle_myocardium',
    name: 'Left Ventricle & Thick Myocardium',
    subtitle: 'Stage 8: The Powerful Helical Systemic Muscular Engine',
    shortName: '8. Left Ventricle',
    icon: '⚡',
    timeline: 'Isovolumetric Contraction & Rapid Ejection (120 mmHg Peak)',
    cameraPos: { x: 75, y: 6, z: 24 },
    lookAt: { x: 75, y: 0, z: 0 },
    vrOffsetDist: 17,
    colorTheme: '#ef4444',
    equation: 'LV Peak Pressure = 120 mmHg | Cardiac Work = P × V ~ 1.0 Joule per Beat',
    description: 'The Left Ventricle is a thick, bullet-shaped muscular chamber with myocardium 3 times thicker than the right ventricle (8 - 12 mm). Its myofibrils are arranged in counter-rotating helical layers: contracting like a wringing towel to generate the tremendous 120 mmHg pressure needed to circulate blood through 60,000 miles of systemic vessels.',
    narration: 'The left ventricle is the muscular powerhouse of the body. Its spiral muscle fibers wring like a towel, creating high systolic pressure to drive blood through sixty thousand miles of vessels.',
    keyPoints: [
      'Helical Myofibril Alignment: Outer left-handed and inner right-handed spiral wringing motion',
      'Myocardial Wall: 8 - 12 mm thick (3x right ventricle) generating 120 mmHg systemic pressure',
      'Frank-Starling Law: Increased end-diastolic filling stretches fibers to produce stronger contractions',
      'Metabolic Demand: Consumes massive ATP, extracting ~75% of arterial oxygen'
    ],
    telemetry: {
      peakSystolicPressure: '120 mmHg',
      diastolicPressure: '8 mmHg',
      myocardialThickness: '11 mm',
      strokeWork: '1.1 Joules'
    }
  },
  {
    id: 9,
    key: 'aortic_valve_arch',
    name: 'Aortic Valve & Aortic Arch',
    subtitle: 'Stage 9: The Semilunar Crown & Systemic Arterial Highway',
    shortName: '9. Aortic Arch',
    icon: '👑',
    timeline: 'Rapid Arterial Ejection (120/80 mmHg Systemic Pressure Wave)',
    cameraPos: { x: 105, y: 6, z: 24 },
    lookAt: { x: 105, y: 0, z: 0 },
    vrOffsetDist: 17,
    colorTheme: '#dc2626',
    equation: 'Cardiac Output (CO) = HR × SV = 75 bpm × 70 mL = 5.25 L/min',
    description: 'High left ventricular pressure blows open the 3 semilunar cusps of the Aortic Valve. Just above the cusps sit the Sinuses of Valsalva, where the Left and Right Coronary Arteries originate to nourish the heart itself. The Ascending Aorta arches over the pulmonary vessels, giving off 3 vital arterial trunks to the brain and upper body.',
    narration: 'Blood erupts through the aortic valve into the majestic aortic arch. From here, three great arteries carry oxygen to the brain and body, while coronary arteries nourish the heart muscle itself.',
    keyPoints: [
      'Sinuses of Valsalva: Dilated pockets preventing leaflets from adhering to the aortic wall during ejection',
      'Coronary Ostia: Openings feeding left and right coronary arteries during ventricular diastole',
      '3 Major Arch Branches: Brachiocephalic trunk, left common carotid, left subclavian artery',
      'Second Heart Sound (S2 Dub): Sharp closure of the aortic valve when ventricular pressure falls'
    ],
    telemetry: {
      aorticPressure: '120 / 80 mmHg',
      cardiacOutput: '5.25 L/min',
      ejectionVelocity: '1.5 m/s',
      archDiameter: '28 mm'
    }
  },
  {
    id: 10,
    key: 'complete_beating_heart',
    name: 'Complete Beating Heart & Conduction Network',
    subtitle: 'Stage 10: The Master Muscular Engine & Electrical Pacemaker',
    shortName: '10. Beating Heart',
    icon: '💓',
    timeline: '75 Beats per Minute (Continuous Lifelong Rhythm ~ 2.5 Billion Beats)',
    cameraPos: { x: 140, y: 6, z: 26 },
    lookAt: { x: 140, y: 0, z: 0 },
    vrOffsetDist: 18,
    colorTheme: '#b91c1c',
    equation: 'SA Node (75 bpm) ➔ AV Node Delay (0.12s) ➔ Bundle of His ➔ Purkinje Fibers ➔ Ventricular Systole',
    description: 'The Sinoatrial (SA) Node in the right atrium initiates rhythmic electrical action potentials. Signals spread through the atria, pause at the Atrioventricular (AV) Node for 120 ms to allow complete ventricular filling, then race through the Bundle of His and Purkinje Fibers to trigger explosive, synchronized ventricular contraction.',
    narration: 'The complete beating heart operates under an electrical master clock. The SA node sparks, traveling through the AV node and Purkinje fibers to pump blood endlessly, over two billion times in a lifetime.',
    keyPoints: [
      'SA Node (Natural Pacemaker): Spontaneous phase-4 depolarization generating regular impulses',
      'AV Nodal Delay (120 ms): Crucial physiological pause allowing atria to fully empty into ventricles',
      'His-Purkinje System: High-speed conduction (4 m/s) ensuring apex-to-base ventricular contraction',
      'Synchronized Lub-Dub Acoustics: S1 (mitral/tricuspid close) followed by S2 (aortic/pulmonary close)'
    ],
    telemetry: {
      heartRate: '75 BPM',
      conductionSpeed: '4.0 m/s',
      prInterval: '0.16 s',
      lifelongBeats: '2.5 Billion'
    }
  }
];

export const HEART_SIMULATION_PARAMETERS = {
  heartRateBPM: 75,
  bloodPressureSys: 120,
  strokeVolumeML: 70,
  cardiacContractility: 1.0,
  simSpeed: 1.0
};
