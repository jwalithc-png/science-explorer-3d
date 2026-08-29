/**
 * Solar System Live Orbital Simulation Stages
 * Features 10 Dynamic Celestial Bodies revolving around the central Sun in real-time orbits.
 */

export const SOLAR_STAGES = [
  {
    id: 1,
    key: 'sun',
    name: 'The Sun — Our Star',
    subtitle: 'Center of the Solar System (Yellow Dwarf G2V)',
    shortName: '1. Sun',
    icon: '☀️',
    cameraPos: { x: 0, y: 35, z: 80 },
    lookAt: { x: 0, y: 0, z: 0 },
    vrOffsetDist: 70,
    colorTheme: '#facc15',
    equation: '4 ¹H ➔ ⁴He + 2e⁺ + 2νₑ + 26.7 MeV (E = mc²)',
    description: 'The Sun is the incandescent gravitational heart of our Solar System, comprising 99.86% of its total mass. Deep within its core, nuclear fusion converts 600 million tons of hydrogen into helium every second, powering the entire solar system.',
    narration: 'We are at the center of the solar system observing the Sun. Thermonuclear fusion at its core emits radiant photons, solar wind, and gravitational anchoring for all planets.',
    keyPoints: [
      'Type: Yellow Dwarf Star (G2V Class)',
      'Core Temperature: 15,000,000°C | Surface: 5,500°C',
      'Solar Wind: 1,800+ km/s plasma streaming radially across the system',
      'Mass: 1.989 × 10³⁰ kg (333,000 Earth masses)'
    ],
    telemetry: {
      spectralClass: 'G2V Star',
      diameter: '1,392,700 km',
      surfaceTemp: '5,500 °C',
      distanceFromCenter: '0 km'
    }
  },
  {
    id: 2,
    key: 'mercury',
    name: 'Mercury — The Swift Planet',
    subtitle: '1st Planet: Closest Terrestrial World (0.39 AU)',
    shortName: '2. Mercury',
    icon: '☿',
    cameraPos: { x: 65, y: 4, z: 12 },
    lookAt: { x: 65, y: 0, z: 0 },
    vrOffsetDist: 10,
    colorTheme: '#a3a3a3',
    equation: 'Orbital Period: 87.97 Days | Orbital Velocity: 47.36 km/s',
    description: 'Mercury is the smallest and innermost planet, completing an orbit around the Sun in just 88 days. Its heavily cratered, Moon-like surface experiences the most extreme temperature swings in the solar system.',
    narration: 'Tracking Mercury in its swift orbit around the Sun. Lacking a thick atmosphere, daytime temperatures soar to 430 degrees Celsius while night plunges to minus 180.',
    keyPoints: [
      'Orbital Radius: 57.9 Million km (0.39 AU)',
      'Day/Night Thermal Swing: -180°C to 430°C',
      'High Density: Massive metallic iron core (~85% of planet radius)',
      'Impact Basins: Caloris Basin spanning 1,550 km'
    ],
    telemetry: {
      orbitalVelocity: '47.4 km/s',
      diameter: '4,879 km',
      temperature: '-180°C to 430°C',
      distanceFromSun: '57.9M km'
    }
  },
  {
    id: 3,
    key: 'venus',
    name: 'Venus — The Greenhouse World',
    subtitle: '2nd Planet: Retrograde Acid Atmosphere (0.72 AU)',
    shortName: '3. Venus',
    icon: '♀',
    cameraPos: { x: 95, y: 6, z: 18 },
    lookAt: { x: 95, y: 0, z: 0 },
    vrOffsetDist: 16,
    colorTheme: '#facc15',
    equation: 'Runaway Greenhouse: 96.5% CO₂ + H₂SO₄ Clouds (Surface Pressure: 92 bar)',
    description: 'Shrouded in opaque sulfuric acid clouds, Venus is the hottest planet in our solar system due to an extreme runaway greenhouse effect. Uniquely, Venus rotates in retrograde (clockwise) on a 177.3° axial tilt.',
    narration: 'Approaching Venus, Earth’s twin in size but an inferno in climate. Dense carbon dioxide traps solar heat, raising surface temperatures above 465 degrees Celsius.',
    keyPoints: [
      'Surface Pressure: 92 Earth Atmospheres (equivalent to 900m ocean depth)',
      'Retrograde Rotation: Spins clockwise opposite to most planets',
      'Atmospheric Super-Rotation: Cloud tops circle planet in 4 Earth days',
      'Sulfuric Acid Clouds: Highly reflective yellow albedo'
    ],
    telemetry: {
      surfaceTemp: '465 °C',
      diameter: '12,104 km',
      surfacePressure: '92 bar',
      distanceFromSun: '108.2M km'
    }
  },
  {
    id: 4,
    key: 'earth',
    name: 'Earth & Moon — The Living Oasis',
    subtitle: '3rd Planet: Liquid Oceans & Nitrogen-Oxygen Atmosphere (1.0 AU)',
    shortName: '4. Earth & Moon',
    icon: '⊕',
    cameraPos: { x: 140, y: 6, z: 20 },
    lookAt: { x: 140, y: 0, z: 0 },
    vrOffsetDist: 18,
    colorTheme: '#38bdf8',
    equation: 'Goldilocks Habitable Zone: 71% Liquid H₂O + Protective Magnetosphere',
    description: 'Earth is our home planet and the only known world harboring life. Liquid oceans, dynamic swirling weather clouds, protective magnetic field, and glowing nighttime city lights characterize this vibrant blue marble, accompanied by its natural satellite, the Moon.',
    narration: 'We are tracking Earth as it orbits in the habitable zone. Notice the glistening oceans, swirling cloud weather systems, and the Moon orbiting in synchronous tidal lock.',
    keyPoints: [
      'Liquid Water: Over 70% of planetary surface covered by oceans',
      'Atmospheric Scattering: Rayleigh scattering creates the radiant blue horizon',
      'Natural Satellite (Luna): 3,474 km diameter, drives oceanic tides',
      'Magnetosphere: Deflects charged solar wind particles into polar auroras'
    ],
    telemetry: {
      surfaceTemp: '15 °C (-88 to 58°C)',
      diameter: '12,742 km',
      moons: '1 (Luna)',
      distanceFromSun: '149.6M km'
    }
  },
  {
    id: 5,
    key: 'mars',
    name: 'Mars — The Red Planet',
    subtitle: '4th Planet: Iron Oxide Crust & Ancient Water Rifts (1.52 AU)',
    shortName: '5. Mars',
    icon: '♂',
    cameraPos: { x: 195, y: 5, z: 16 },
    lookAt: { x: 195, y: 0, z: 0 },
    vrOffsetDist: 14,
    colorTheme: '#ef4444',
    equation: 'Fe₂O₃ Rust Regolith + Olympus Mons (21.9 km height) + Valles Marineris',
    description: 'Mars is colored red by iron-oxide rust covering its desert terrain. It features Olympus Mons, the largest volcano in the solar system, the colossal Valles Marineris canyon canyon, carbon dioxide polar ice caps, and two orbiting captured asteroid moons, Phobos and Deimos.',
    narration: 'Locking onto Mars, the Red Planet. Its thin atmosphere reveals ancient dry riverbeds, towering volcanic shields, and glistening white carbon dioxide polar ice caps.',
    keyPoints: [
      'Olympus Mons: Shield volcano 3 times taller than Mount Everest',
      'Valles Marineris: Canyon system spanning over 4,000 km across Mars',
      'Polar Ice Caps: Water and dry ice (CO₂) expanding and retreating with seasons',
      'Moons: Phobos and Deimos orbiting in close proximity'
    ],
    telemetry: {
      surfaceTemp: '-65 °C',
      diameter: '6,779 km',
      moons: '2 (Phobos, Deimos)',
      distanceFromSun: '227.9M km'
    }
  },
  {
    id: 6,
    key: 'jupiter',
    name: 'Jupiter — The King of Gas Giants',
    subtitle: '5th Planet: Great Red Spot & Galilean Moons (5.20 AU)',
    shortName: '6. Jupiter',
    icon: '♃',
    cameraPos: { x: 290, y: 12, z: 45 },
    lookAt: { x: 290, y: 0, z: 0 },
    vrOffsetDist: 40,
    colorTheme: '#f59e0b',
    equation: 'Gas Giant (H₂ / He) | Great Red Spot Storm (350+ Years) | 95 Moons',
    description: 'Jupiter is the largest planet in our solar system, with a mass 2.5 times that of all other planets combined. Dynamic counter-rotating atmospheric jet bands, the ancient Great Red Spot storm vortex, and its 4 massive Galilean moons (Io, Europa, Ganymede, Callisto) form a miniature planetary system.',
    narration: 'Approaching Jupiter, the colossal gas giant. Observe the counter-rotating cloud bands, the giant Great Red Spot cyclonic storm, and the four Galilean moons orbiting in real time.',
    keyPoints: [
      'Great Red Spot: Anticyclonic storm larger than planet Earth',
      'Galilean Moons: Volcanic Io, Ocean Europa, Giant Ganymede, Cratered Callisto',
      'Rapid Rotation: Fastest spinning planet (~9 hours 55 minutes per rotation)',
      'Atmospheric Composition: 90% Hydrogen, 10% Helium with ammonia cloud bands'
    ],
    telemetry: {
      cloudTopTemp: '-110 °C',
      diameter: '139,820 km (11 Earths)',
      moonsCount: '95 known',
      distanceFromSun: '778.5M km'
    }
  },
  {
    id: 7,
    key: 'saturn',
    name: 'Saturn — The Ringed Jewel',
    subtitle: '6th Planet: Spectacular Icy Ring System (9.58 AU)',
    shortName: '7. Saturn',
    icon: '♄',
    cameraPos: { x: 390, y: 14, z: 42 },
    lookAt: { x: 390, y: 0, z: 0 },
    vrOffsetDist: 38,
    colorTheme: '#fbbf24',
    equation: 'Icy Particle Rings (99% Pure H₂O Ice) + Cassini Division (4,800 km)',
    description: 'Saturn is encircled by an extraordinary ring system spanning 282,000 km across yet only tens of meters thick, composed of billions of water ice particles. Tilted at a 26.7° angle, Saturn hosts a diverse family of 146 moons including haze-shrouded Titan and geyser-active Enceladus.',
    narration: 'Here is Saturn, the jewel of the solar system. Millions of icy ring particles catch the sunlight, separated by the dark gap of the Cassini Division, with Titan orbiting nearby.',
    keyPoints: [
      'Ring Architecture: Main A, B, C rings with Cassini Division and Encke Gap',
      'Axial Tilt: 26.73° providing dramatic changing ring angle views',
      'Moon Titan: Massive nitrogen atmosphere and methane rivers/lakes',
      'Moon Enceladus: Cryovolcanic water geysers venting from subsurface ocean'
    ],
    telemetry: {
      temperature: '-140 °C',
      diameter: '116,460 km',
      moonsCount: '146 known',
      distanceFromSun: '1.43 Billion km'
    }
  },
  {
    id: 8,
    key: 'uranus',
    name: 'Uranus — The Tilted Ice Giant',
    subtitle: '7th Planet: Extreme 98° Axial Tilt & Aquamarine Methane (19.2 AU)',
    shortName: '8. Uranus',
    icon: '♅',
    cameraPos: { x: 490, y: 10, z: 30 },
    lookAt: { x: 490, y: 0, z: 0 },
    vrOffsetDist: 26,
    colorTheme: '#38bdf8',
    equation: 'Axial Tilt: 97.77° (Rolling on its side) | Methane Ice & Hydrogen Mantle',
    description: 'Uranus is an aquamarine ice giant rolling through space on its side at an extreme 97.8° tilt, likely the result of an ancient cosmic collision. Atmospheric methane absorbs red light, giving the planet its serene cyan hue.',
    narration: 'Entering the realm of Uranus. Tilted at nearly ninety-eight degrees, this ice giant rolls around the Sun on its orbital path with a vertical ring system.',
    keyPoints: [
      'Extreme Axial Tilt: 97.77° causing 42-year long polar nights and days',
      'Ice Giant Composition: Water, ammonia, and methane ices over a rocky core',
      'Vertical Ring System: 13 faint, narrow concentric rings',
      'Atmospheric Methane: Imparts signature aquamarine cyan coloration'
    ],
    telemetry: {
      temperature: '-195 °C',
      diameter: '50,724 km',
      moonsCount: '28 known',
      distanceFromSun: '2.87 Billion km'
    }
  },
  {
    id: 9,
    key: 'neptune',
    name: 'Neptune — The Supersonic Wind World',
    subtitle: '8th Planet: Azure Ice Giant & Cryovolcanic Triton (30.1 AU)',
    shortName: '9. Neptune',
    icon: '♆',
    cameraPos: { x: 590, y: 10, z: 30 },
    lookAt: { x: 590, y: 0, z: 0 },
    vrOffsetDist: 26,
    colorTheme: '#2563eb',
    equation: 'Supersonic Winds: Up to 2,100 km/h | Great Dark Spot Storm Vortex',
    description: 'Neptune is the outermost major planet, an azure ice giant whipped by supersonic winds reaching 2,100 km/h—the fastest recorded anywhere in the solar system. Its massive moon Triton orbits in retrograde with active nitrogen geysers.',
    narration: 'We have arrived at Neptune, the furthest major planet. Supersonic storms rage across its azure blue atmosphere, while the icy moon Triton orbits in retrograde.',
    keyPoints: [
      'Supersonic Winds: Atmospheric storms reaching 2,100 km/h (1,300 mph)',
      'Great Dark Spot: Earth-sized storm system in southern hemisphere',
      'Moon Triton: Cryovolcanic geysers erupting nitrogen gas into space',
      'High-Altitude Cirrus Clouds: Bright white frozen methane clouds'
    ],
    telemetry: {
      temperature: '-200 °C',
      diameter: '49,244 km',
      moonsCount: '16 known',
      distanceFromSun: '4.50 Billion km'
    }
  },
  {
    id: 10,
    key: 'pluto',
    name: 'Pluto — The Heart of the Kuiper Belt',
    subtitle: 'Dwarf Planet: Nitrogen Ice Heart & Charon Binary (39.5 AU)',
    shortName: '10. Pluto',
    icon: '♇',
    cameraPos: { x: 690, y: 6, z: 16 },
    lookAt: { x: 690, y: 0, z: 0 },
    vrOffsetDist: 12,
    colorTheme: '#d6d3d1',
    equation: 'Kuiper Belt World: Tombaugh Regio (N₂ Ice Glacier) + Charon Binary',
    description: 'Pluto is a dwarf planet in the icy Kuiper Belt. It features a bright nitrogen-ice glacier heart named Tombaugh Regio, water-ice mountain ranges, reddish-brown tholin terrain, and forms a mutually tidally locked binary system with its large moon Charon.',
    narration: 'At the frontier of the solar system lies Pluto. Its bright nitrogen ice heart glistens in the faint sunlight, locked in a gravitational dance with its partner moon Charon.',
    keyPoints: [
      'Tombaugh Regio: Smooth convective glacier of frozen nitrogen and methane',
      'Water-Ice Mountains: Towering peaks reaching 3,500 meters into space',
      'Binary System: Pluto and Charon orbit a common center of mass outside Pluto',
      'Kuiper Belt Location: 5.9 Billion kilometers from the Sun (39.5 AU)'
    ],
    telemetry: {
      temperature: '-230 °C',
      diameter: '2,376 km',
      moonsCount: '5 (Charon, Styx, Nix...)',
      distanceFromSun: '5.90 Billion km'
    }
  }
];

export const SOLAR_SIMULATION_PARAMETERS = {
  timeMultiplier: 1.0,
  orbitSpeedMult: 1.0,
  rotationSpeedMult: 1.0,
  simSpeed: 1.0,
  showOrbits: true,
  showLabels: true
};
