/**
 * Astronomical Telemetry and Scaled Visual Parameters
 * Scaled so all planets and moons visibly and gracefully move around their parent bodies in real-time.
 */

export const CELESTIAL_DATA = {
  Sun: {
    name: 'Sun',
    type: 'Yellow Dwarf Star (G2V)',
    symbol: '☀️',
    radius: 38.0,
    distance: 0,
    orbitSpeed: 0,
    visualOrbitSpeed: 0,
    visualRotationSpeed: 0.06,
    axialTiltDeg: 7.25,
    temperature: '5,500°C (Surface) / 15M°C (Core)',
    diameter: '1,392,700 km (109 Earths)',
    distanceFromSun: '0 km (Center of System)',
    moonsCount: '8 Planets, 5+ Dwarf Planets',
    description: 'The Sun is the star at the center of our Solar System, emitting incandescent plasma, solar wind, and life-giving energy.'
  },
  Mercury: {
    name: 'Mercury',
    type: 'Terrestrial Planet',
    symbol: '☿',
    radius: 2.2,
    distance: 65,
    orbitSpeed: 4.15,
    visualOrbitSpeed: 0.75, // Fast inner orbit (~8.5s per revolution)
    visualRotationSpeed: 0.12,
    axialTiltDeg: 0.034,
    orbitInclination: 7.0,
    temperature: '-180°C to 430°C',
    diameter: '4,879 km',
    distanceFromSun: '57.9M km (0.39 AU)',
    orbitalPeriodDays: '87.97 Days',
    moonsCount: '0',
    description: 'Mercury is the smallest planet and closest to the Sun, featuring a heavily cratered, Moon-like surface with extreme thermal swings.'
  },
  Venus: {
    name: 'Venus',
    type: 'Terrestrial Planet',
    symbol: '♀',
    radius: 5.4,
    distance: 95,
    orbitSpeed: 1.62,
    visualOrbitSpeed: 0.52, // (~12s per revolution)
    visualRotationSpeed: -0.10, // Distinct Retrograde Rotation (spins clockwise)!
    axialTiltDeg: 177.3,
    orbitInclination: 3.39,
    temperature: '465°C (Runaway Greenhouse)',
    diameter: '12,104 km',
    distanceFromSun: '108.2M km (0.72 AU)',
    orbitalPeriodDays: '224.7 Days',
    moonsCount: '0',
    description: 'Venus is shrouded in opaque sulfuric acid clouds and a crushing CO₂ atmosphere, rotating in retrograde opposite to most planets.'
  },
  Earth: {
    name: 'Earth',
    type: 'Terrestrial Planet (Habitable)',
    symbol: '⊕',
    radius: 5.8,
    distance: 140,
    orbitSpeed: 1.0,
    visualOrbitSpeed: 0.38, // (~16.5s per revolution)
    visualRotationSpeed: 0.24, // Clearly visible rotation (~14 deg/sec)
    axialTiltDeg: 23.44,
    orbitInclination: 0.0,
    temperature: '15°C (-88°C to 58°C)',
    diameter: '12,742 km',
    distanceFromSun: '149.6M km (1.0 AU)',
    orbitalPeriodDays: '365.25 Days (1.0 Year)',
    moonsCount: '1 (The Moon)',
    description: 'Earth is our home planet with dynamic liquid oceans, moving cloud systems, protective atmosphere, and vibrant city lights on the night side.'
  },
  Moon: {
    name: 'Moon (Luna)',
    type: 'Natural Satellite',
    symbol: '☾',
    radius: 1.5,
    distance: 12.0,
    orbitSpeed: 6.0,
    visualOrbitSpeed: 1.8, // Orbits Earth visibly
    visualRotationSpeed: 0.15,
    axialTiltDeg: 1.54,
    orbitInclination: 5.14,
    temperature: '-130°C to 120°C',
    diameter: '3,474 km',
    distanceFromSun: '149.6M km (Orbits Earth)',
    orbitalPeriodDays: '27.3 Days (around Earth)',
    moonsCount: 'Parent: Earth',
    description: 'Earth\'s natural satellite, featuring dark basaltic lunar maria, impact crater rays, and tidal synchronization.'
  },
  Mars: {
    name: 'Mars',
    type: 'Terrestrial Planet (Red Planet)',
    symbol: '♂',
    radius: 3.1,
    distance: 195,
    orbitSpeed: 0.53,
    visualOrbitSpeed: 0.28, // (~22s per revolution)
    visualRotationSpeed: 0.23,
    axialTiltDeg: 25.19,
    orbitInclination: 1.85,
    temperature: '-65°C (-140°C to 20°C)',
    diameter: '6,779 km',
    distanceFromSun: '227.9M km (1.52 AU)',
    orbitalPeriodDays: '687 Days (1.88 Years)',
    moonsCount: '2 (Phobos, Deimos)',
    description: 'The Red Planet, colored by iron oxide regolith, featuring giant volcanoes like Olympus Mons and vast canyon rift systems.'
  },
  Jupiter: {
    name: 'Jupiter',
    type: 'Gas Giant',
    symbol: '♃',
    radius: 16.5,
    distance: 290,
    orbitSpeed: 0.084,
    visualOrbitSpeed: 0.18, // (~35s per revolution)
    visualRotationSpeed: 0.48, // Fastest spinning planet!
    axialTiltDeg: 3.13,
    orbitInclination: 1.30,
    temperature: '-110°C (Cloud Tops)',
    diameter: '139,820 km (11 Earths)',
    distanceFromSun: '778.5M km (5.2 AU)',
    orbitalPeriodDays: '4,333 Days (11.86 Years)',
    moonsCount: '95 known (Io, Europa, Ganymede, Callisto)',
    description: 'The king of planets, a colossal gas giant with dynamic counter-rotating jet streams and the ancient Great Red Spot storm vortex.'
  },
  Saturn: {
    name: 'Saturn',
    type: 'Gas Giant (Ringed Planet)',
    symbol: '♄',
    radius: 13.8,
    distance: 390,
    orbitSpeed: 0.034,
    visualOrbitSpeed: 0.13, // (~48s per revolution)
    visualRotationSpeed: 0.42,
    axialTiltDeg: 26.73,
    orbitInclination: 2.48,
    temperature: '-140°C',
    diameter: '116,460 km',
    distanceFromSun: '1.43B km (9.58 AU)',
    orbitalPeriodDays: '10,759 Days (29.45 Years)',
    moonsCount: '146 known (Titan, Enceladus)',
    description: 'An elegant gas giant encircled by a spectacular ring system of water ice particles, displaying the Cassini Division and Encke Gap.'
  },
  Uranus: {
    name: 'Uranus',
    type: 'Ice Giant',
    symbol: '♅',
    radius: 8.5,
    distance: 490,
    orbitSpeed: 0.012,
    visualOrbitSpeed: 0.09, // (~70s per revolution)
    visualRotationSpeed: -0.32, // Retrograde & rolling on its side!
    axialTiltDeg: 97.77,
    orbitInclination: 0.77,
    temperature: '-195°C',
    diameter: '50,724 km',
    distanceFromSun: '2.87B km (19.2 AU)',
    orbitalPeriodDays: '30,687 Days (84.0 Years)',
    moonsCount: '28 known (Titania, Oberon, Miranda)',
    description: 'An ice giant rolling on its side at an extreme 98° axial tilt, rich in methane ices creating an aquamarine atmospheric hue.'
  },
  Neptune: {
    name: 'Neptune',
    type: 'Ice Giant',
    symbol: '♆',
    radius: 8.2,
    distance: 590,
    orbitSpeed: 0.006,
    visualOrbitSpeed: 0.065, // (~95s per revolution)
    visualRotationSpeed: 0.35,
    axialTiltDeg: 28.32,
    orbitInclination: 1.77,
    temperature: '-200°C',
    diameter: '49,244 km',
    distanceFromSun: '4.50B km (30.1 AU)',
    orbitalPeriodDays: '60,190 Days (164.8 Years)',
    moonsCount: '16 known (Triton)',
    description: 'The outermost major planet, an azure ice giant with supersonic winds reaching 2,100 km/h and white high-altitude methane clouds.'
  },
  Pluto: {
    name: 'Pluto',
    type: 'Dwarf Planet (Kuiper Belt)',
    symbol: '♇',
    radius: 1.8,
    distance: 690,
    orbitSpeed: 0.004,
    visualOrbitSpeed: 0.045, // Outer slow orbit
    visualRotationSpeed: -0.12, // Retrograde
    axialTiltDeg: 122.53,
    orbitInclination: 17.16,
    temperature: '-230°C',
    diameter: '2,376 km',
    distanceFromSun: '5.90B km (39.5 AU)',
    orbitalPeriodDays: '90,560 Days (248 Years)',
    moonsCount: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
    description: 'The iconic dwarf planet with its frozen nitrogen heart (Tombaugh Regio), reddish-brown tholin terrain, and towering water-ice mountains.'
  }
};

// Moons configuration
export const MOON_DATA = [
  {
    name: 'Moon',
    parent: 'Earth',
    radius: 1.5,
    distance: 12.0,
    visualOrbitSpeed: 1.8,
    visualRotationSpeed: 0.15,
    color: '#a8a29e',
    specular: 0.05
  },
  {
    name: 'Io',
    parent: 'Jupiter',
    radius: 1.2,
    distance: 24.0,
    visualOrbitSpeed: 2.5,
    visualRotationSpeed: 0.3,
    color: '#eab308',
    specular: 0.1
  },
  {
    name: 'Europa',
    parent: 'Jupiter',
    radius: 1.0,
    distance: 31.0,
    visualOrbitSpeed: 2.0,
    visualRotationSpeed: 0.25,
    color: '#cbd5e1',
    specular: 0.6
  },
  {
    name: 'Ganymede',
    parent: 'Jupiter',
    radius: 1.8,
    distance: 40.0,
    visualOrbitSpeed: 1.5,
    visualRotationSpeed: 0.2,
    color: '#94a3b8',
    specular: 0.2
  },
  {
    name: 'Callisto',
    parent: 'Jupiter',
    radius: 1.6,
    distance: 52.0,
    visualOrbitSpeed: 1.1,
    visualRotationSpeed: 0.18,
    color: '#64748b',
    specular: 0.1
  },
  {
    name: 'Titan',
    parent: 'Saturn',
    radius: 1.7,
    distance: 36.0,
    visualOrbitSpeed: 1.4,
    visualRotationSpeed: 0.22,
    color: '#f59e0b',
    specular: 0.2
  },
  {
    name: 'Enceladus',
    parent: 'Saturn',
    radius: 0.7,
    distance: 22.0,
    visualOrbitSpeed: 2.2,
    visualRotationSpeed: 0.35,
    color: '#f8fafc',
    specular: 0.8
  }
];

export const ASTEROID_BELT_CONFIG = {
  count: 3500,
  innerRadius: 225,
  outerRadius: 275,
  minSize: 0.15,
  maxSize: 0.75,
  heightSpread: 8.0,
  baseOrbitSpeed: 0.15
};
