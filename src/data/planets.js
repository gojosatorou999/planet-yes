// Registry of every body in the explorer. Order in BODIES is the guided tour order:
// Sun -> Mercury -> ... -> Neptune -> Sun.
//
// visual.radius / visual.orbit are scene units (compressed for visibility, not to scale).
// visual.phase is the starting angle on the orbit. `frame` is how many body radii must
// fit on screen in the exploration view (so moon orbits and rings stay in frame).
// moons[].radius / .orbit are in planet radii; .speed is rad/s (negative = retrograde).

const row = (label, value, note) => ({ label, value, note });

const sun = {
  id: 'sun',
  name: 'Sun',
  order: 0,
  subtitle: 'Our star',
  classification: 'G-type main-sequence star',
  envLabel: 'Structure',
  intro:
    'The Sun is the star at the centre of the solar system. A near-perfect sphere of hot plasma, it holds 99.86% of the system’s mass and ' +
    'supplies the light and heat that drive weather, ocean currents and life on Earth. Every second, nuclear fusion in its core converts ' +
    'about four million tonnes of matter into energy.',
  visual: { radius: 10, orbit: 0, phase: 0 },
  frame: 1.25,
  model: { type: 'sun', spinSpeed: 0.012, axialTilt: 7.25 },
  moons: [],
  headline: [
    { label: 'Diameter', value: '1.39', unit: 'million km' },
    { label: 'Surface temp.', value: '5,500', unit: '°C' },
    { label: 'Core temp.', value: '15', unit: 'million °C' },
  ],
  sections: {
    physical: [
      row('Diameter', '1,392,700 km', '109 times the diameter of Earth'),
      row('Mass', '1.989 × 10³⁰ kg', '333,000 Earth masses'),
      row('Density', '1.41 g/cm³'),
      row('Surface gravity', '274 m/s²', '28 times Earth’s'),
      row('Surface temperature', '5,500 °C', 'Photosphere'),
      row('Known moons', '0'),
    ],
    orbit: [
      row('Distance from Earth', '149.6 million km', '1 astronomical unit'),
      row('Rotation period', '≈ 25 days', 'At the equator; about 35 days at the poles'),
      row('Orbit of the galaxy', '≈ 230 million years', 'One lap around the Milky Way'),
      row('Galactic orbital speed', '≈ 220 km/s'),
      row('Age', '4.6 billion years'),
      row('Light travel time to Earth', '8 min 20 s'),
    ],
    atmosphere: {
      title: 'COMPOSITION BY MASS',
      composition: [
        { label: 'Hydrogen', symbol: 'H', percent: 73.46 },
        { label: 'Helium', symbol: 'He', percent: 24.85 },
        { label: 'Oxygen', symbol: 'O', percent: 0.77 },
        { label: 'Carbon', symbol: 'C', percent: 0.29 },
      ],
      note: 'Iron, neon, nitrogen, silicon, magnesium and sulphur make up the remainder.',
    },
    surfaceTitle: 'INTERIOR AND ATMOSPHERE',
    surface: [
      row('Core', '15 million °C', 'Where hydrogen fuses into helium'),
      row('Photosphere', '≈ 500 km deep', 'The visible surface'),
      row('Corona', '1–3 million °C', 'Outer atmosphere, hotter than the surface'),
      row('Activity cycle', '≈ 11 years', 'Sunspots, flares and eruptions'),
      row('Spectral class', 'G2V'),
    ],
  },
  facts: [
    { title: 'Almost the entire solar system', body: 'The Sun contains 99.86% of all the mass in the solar system. Jupiter makes up most of what remains.' },
    { title: 'Room for 1.3 million Earths', body: 'About 1.3 million Earths could fit inside the Sun by volume.' },
    { title: 'Ancient light', body: 'Energy made by fusion takes tens of thousands of years to reach the Sun’s surface, then only about eight minutes to reach Earth.' },
    { title: 'A solar wind', body: 'The Sun continuously streams charged particles outward, forming the heliosphere that envelops every planet.' },
  ],
};

const mercury = {
  id: 'mercury',
  name: 'Mercury',
  order: 1,
  subtitle: 'The swift planet',
  classification: 'Terrestrial planet',
  intro:
    'Mercury is the smallest planet and the closest to the Sun. With almost no atmosphere to retain heat, its surface swings from searing ' +
    'days to freezing nights, and it is covered in craters from billions of years of impacts.',
  visual: { radius: 1.1, orbit: 22, phase: 0.6 },
  frame: 1.1,
  model: { type: 'world', map: 'mercurymap.jpg', bump: 'mercurybump.jpg', bumpScale: 1.2, roughness: 0.98, axialTilt: 0.03, spinSpeed: 0.012, fallback: 0x6e6862, atmosphere: null },
  moons: [],
  headline: [
    { label: 'Diameter', value: '4,879', unit: 'km' },
    { label: 'Orbital period', value: '88', unit: 'days' },
    { label: 'Known moons', value: '0', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '4,879 km', '38% of Earth’s'),
      row('Mass', '3.30 × 10²³ kg'),
      row('Density', '5.43 g/cm³'),
      row('Surface gravity', '3.7 m/s²'),
      row('Average temperature', '167 °C', 'From −180 °C at night to 430 °C by day'),
      row('Known moons', '0'),
    ],
    orbit: [
      row('Distance from the Sun', '57.9 million km', '0.39 astronomical units'),
      row('Orbital period', '88 days'),
      row('Rotation period', '58.6 Earth days', 'Sidereal day'),
      row('Axial tilt', '0.03°'),
      row('Orbital speed', '47.4 km/s', 'Fastest of the planets'),
      row('Sunlight travel time', '3 min 13 s'),
    ],
    atmosphere: {
      title: 'EXOSPHERE COMPOSITION',
      composition: [
        { label: 'Oxygen', symbol: 'O₂', percent: 42 },
        { label: 'Sodium', symbol: 'Na', percent: 29 },
        { label: 'Hydrogen', symbol: 'H₂', percent: 22 },
        { label: 'Helium', symbol: 'He', percent: 6 },
      ],
      note: 'Mercury has only a tenuous exosphere of atoms blasted off its surface; potassium and other traces make up the rest.',
    },
    surface: [
      row('Surface', 'Cratered rock', 'Heavily scarred by impacts'),
      row('Largest feature', 'Caloris Basin', 'About 1,550 km wide'),
      row('Interior', 'Large iron core', 'About 85% of the planet’s radius'),
      row('Polar craters', 'Water ice', 'In permanently shadowed craters'),
      row('Tectonics', 'Shrinking crust', 'Cliffs formed as the planet cooled'),
    ],
  },
  facts: [
    { title: 'A day longer than its year', body: 'Mercury turns slowly while racing round the Sun, so one sunrise to the next takes 176 Earth days, twice its 88-day year.' },
    { title: 'Ice near the Sun', body: 'Despite the heat, permanently shadowed polar craters hold deposits of water ice.' },
    { title: 'Shrinking world', body: 'As its giant iron core cooled and contracted, Mercury’s crust wrinkled into cliffs hundreds of kilometres long.' },
    { title: 'Fastest planet', body: 'Mercury’s orbital speed of 47 km/s is the highest of any planet.' },
  ],
};

const venus = {
  id: 'venus',
  name: 'Venus',
  order: 2,
  subtitle: 'The veiled planet',
  classification: 'Terrestrial planet',
  intro:
    'Venus is almost Earth’s twin in size, yet it is the hottest planet. A dense carbon dioxide atmosphere and clouds of sulphuric acid ' +
    'trap heat in a runaway greenhouse effect, hiding a surface of volcanic plains.',
  visual: { radius: 1.9, orbit: 34, phase: 2.4 },
  frame: 1.1,
  model: {
    type: 'world', map: 'venusmap.jpg', tint: 0xf0cf94, roughness: 0.9, axialTilt: 177.4, spinSpeed: -0.008, fallback: 0xc9a56a,
    atmosphere: { color: [0.95, 0.75, 0.45], rim: 1.1, glow: 0.55 },
  },
  moons: [],
  headline: [
    { label: 'Diameter', value: '12,104', unit: 'km' },
    { label: 'Surface temp.', value: '464', unit: '°C' },
    { label: 'Known moons', value: '0', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '12,104 km', '95% of Earth’s'),
      row('Mass', '4.87 × 10²⁴ kg'),
      row('Density', '5.24 g/cm³'),
      row('Surface gravity', '8.87 m/s²'),
      row('Average temperature', '464 °C', 'Hot enough to melt lead'),
      row('Known moons', '0'),
    ],
    orbit: [
      row('Distance from the Sun', '108.2 million km', '0.72 astronomical units'),
      row('Orbital period', '224.7 days'),
      row('Rotation period', '243 Earth days', 'Retrograde, the opposite way to most planets'),
      row('Axial tilt', '177.4°'),
      row('Orbital speed', '35.0 km/s'),
      row('Sunlight travel time', '6 min'),
    ],
    atmosphere: {
      title: 'ATMOSPHERIC COMPOSITION',
      composition: [
        { label: 'Carbon dioxide', symbol: 'CO₂', percent: 96.5 },
        { label: 'Nitrogen', symbol: 'N₂', percent: 3.5 },
        { label: 'Sulphur dioxide', symbol: 'SO₂', percent: 0.015 },
      ],
      note: 'Surface pressure is about 92 times Earth’s. Clouds of sulphuric acid circle the planet.',
    },
    surface: [
      row('Surface', 'Volcanic plains', 'Most of the planet is lava-formed'),
      row('Highest point', 'Maxwell Montes', 'About 11 km above the mean surface'),
      row('Volcanoes', 'Over 1,600', 'Large volcanoes, many possibly active'),
      row('Surface pressure', '92 bar', 'Like 900 m beneath Earth’s oceans'),
      row('Water', 'None on the surface', 'Lost long ago to space'),
    ],
  },
  facts: [
    { title: 'A day longer than a year', body: 'Venus takes 243 Earth days to rotate once, but only 225 days to orbit the Sun.' },
    { title: 'Spinning backwards', body: 'It rotates in the opposite direction to most planets, so the Sun rises in the west.' },
    { title: 'Hotter than Mercury', body: 'Its thick atmosphere traps heat, making Venus hotter than Mercury despite being nearly twice as far from the Sun.' },
    { title: 'Seen through radar', body: 'Thick clouds hide the surface from view; spacecraft have mapped it using radar.' },
  ],
};

const earth = {
  id: 'earth',
  name: 'Earth',
  order: 3,
  subtitle: 'Our home planet',
  classification: 'Terrestrial planet',
  intro:
    'Earth is the third planet from the Sun and the only world known to harbour life. ' +
    'Its surface is shaped by liquid water, a dynamic crust of shifting plates and a thin, ' +
    'protective atmosphere, all held together by a magnetic field generated in a molten iron core.',
  visual: { radius: 2, orbit: 47, phase: 4.1 },
  frame: 2.6,
  model: { type: 'earth', axialTilt: 23.44, spinSpeed: 0.05 },
  moons: [{ name: 'Moon', radius: 0.3, orbit: 2.15, speed: 0.32, tilt: 0.2, map: 'moonmap1k.jpg', bump: 'moonbump1k.jpg', color: 0xd9d9d9 }],
  headline: [
    { label: 'Diameter', value: '12,742', unit: 'km' },
    { label: 'Orbital period', value: '365.25', unit: 'days' },
    { label: 'Known moons', value: '1', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '12,742 km', 'Mean; 12,756 km at the equator'),
      row('Mass', '5.972 × 10²⁴ kg'),
      row('Density', '5.51 g/cm³', 'Densest planet in the solar system'),
      row('Surface gravity', '9.81 m/s²'),
      row('Average temperature', '15 °C', 'Range from −89 °C to 57 °C'),
      row('Known moons', '1', 'The Moon'),
    ],
    orbit: [
      row('Distance from the Sun', '149.6 million km', '1 astronomical unit'),
      row('Orbital period', '365.25 days'),
      row('Rotation period', '23 h 56 m 4 s', 'Sidereal day'),
      row('Axial tilt', '23.44°'),
      row('Orbital speed', '29.78 km/s'),
      row('Sunlight travel time', '8 min 20 s'),
    ],
    atmosphere: {
      composition: [
        { label: 'Nitrogen', symbol: 'N₂', percent: 78.08 },
        { label: 'Oxygen', symbol: 'O₂', percent: 20.95 },
        { label: 'Argon', symbol: 'Ar', percent: 0.93 },
        { label: 'Carbon dioxide', symbol: 'CO₂', percent: 0.042 },
      ],
      note: 'Trace amounts of neon, helium, methane and water vapour make up the remainder.',
    },
    surface: [
      row('Oceans', '71%', 'Of the surface is covered by liquid water'),
      row('Land', '29%', 'Continents and islands'),
      row('Highest point', '8,849 m', 'Mount Everest'),
      row('Deepest point', '10,935 m', 'Challenger Deep, Mariana Trench'),
      row('Crust', 'Tectonic plates', 'Seven major plates in constant motion'),
    ],
  },
  facts: [
    { title: 'Not a perfect sphere', body: 'Rotation makes Earth bulge at the equator. Its equatorial diameter is about 43 km larger than the pole-to-pole diameter.' },
    { title: 'A magnetic shield', body: 'Convection in the liquid outer core generates a magnetic field that deflects most of the charged particles streaming from the Sun.' },
    { title: 'A stabilising Moon', body: 'The Moon’s gravity helps keep Earth’s axial tilt steady, moderating climate over geological time.' },
    { title: 'Roughly 4.54 billion years old', body: 'Earth formed with the rest of the solar system, and the oldest known minerals on its surface date back more than 4.4 billion years.' },
  ],
};

const mars = {
  id: 'mars',
  name: 'Mars',
  order: 4,
  subtitle: 'The red planet',
  classification: 'Terrestrial planet',
  intro:
    'Mars is a cold desert world whose iron-rich dust gives it a rusty colour. Home to the tallest volcano and deepest canyon known in ' +
    'the solar system, it also bears the channels and minerals of an ancient, wetter past.',
  visual: { radius: 1.5, orbit: 60, phase: 5.2 },
  frame: 2.9,
  model: {
    type: 'world', map: 'marsmap1k.jpg', bump: 'marsbump1k.jpg', bumpScale: 1.5, roughness: 0.95, axialTilt: 25.19, spinSpeed: 0.05, fallback: 0x9a5a3c,
    atmosphere: { color: [0.85, 0.5, 0.35], rim: 0.7, glow: 0.35 },
  },
  moons: [
    { name: 'Phobos', radius: 0.12, orbit: 1.85, speed: 0.9, tilt: 0.15, color: 0x9d8f84 },
    { name: 'Deimos', radius: 0.09, orbit: 2.6, speed: 0.5, tilt: -0.2, color: 0xb0a396 },
  ],
  headline: [
    { label: 'Diameter', value: '6,779', unit: 'km' },
    { label: 'Orbital period', value: '687', unit: 'days' },
    { label: 'Known moons', value: '2', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '6,779 km', 'About half of Earth’s'),
      row('Mass', '6.42 × 10²³ kg'),
      row('Density', '3.93 g/cm³'),
      row('Surface gravity', '3.71 m/s²'),
      row('Average temperature', '−65 °C', 'Range from −140 °C to 20 °C'),
      row('Known moons', '2', 'Phobos and Deimos'),
    ],
    orbit: [
      row('Distance from the Sun', '227.9 million km', '1.52 astronomical units'),
      row('Orbital period', '687 days'),
      row('Rotation period', '24 h 37 m', 'Almost the same as Earth’s day'),
      row('Axial tilt', '25.19°'),
      row('Orbital speed', '24.1 km/s'),
      row('Sunlight travel time', '12 min 38 s'),
    ],
    atmosphere: {
      composition: [
        { label: 'Carbon dioxide', symbol: 'CO₂', percent: 95.3 },
        { label: 'Nitrogen', symbol: 'N₂', percent: 2.7 },
        { label: 'Argon', symbol: 'Ar', percent: 1.6 },
        { label: 'Oxygen', symbol: 'O₂', percent: 0.13 },
      ],
      note: 'The atmosphere is very thin, with a surface pressure under 1% of Earth’s.',
    },
    surface: [
      row('Surface', 'Iron-oxide dust', 'Gives the planet its red colour'),
      row('Highest point', 'Olympus Mons', 'About 21.9 km, the tallest known volcano'),
      row('Longest canyon', 'Valles Marineris', 'About 4,000 km long'),
      row('Polar caps', 'Water and CO₂ ice'),
      row('Largest basin', 'Hellas Planitia', 'An impact basin about 2,300 km across'),
    ],
  },
  facts: [
    { title: 'A towering volcano', body: 'Olympus Mons rises about two and a half times higher than Mount Everest and is roughly the size of Arizona.' },
    { title: 'Blue sunsets', body: 'Fine dust in the Martian sky scatters light so that sunsets appear blue near the Sun.' },
    { title: 'A doomed moon', body: 'Phobos orbits so close that tidal forces are slowly pulling it in; it will break apart or crash in tens of millions of years.' },
    { title: 'A watery past', body: 'River valleys, lake beds and minerals show that liquid water once flowed across the surface.' },
  ],
};

const jupiter = {
  id: 'jupiter',
  name: 'Jupiter',
  order: 5,
  subtitle: 'The giant planet',
  classification: 'Gas giant',
  intro:
    'Jupiter is the largest planet, a banded world of hydrogen and helium with no solid surface. Its immense gravity shapes the ' +
    'solar system, and storms such as the Great Red Spot have raged for centuries.',
  visual: { radius: 6, orbit: 88, phase: 1.3 },
  frame: 4.2,
  model: {
    type: 'world', map: 'jupitermap.jpg', roughness: 0.85, axialTilt: 3.13, spinSpeed: 0.12, fallback: 0xb89b7a,
    atmosphere: { color: [0.8, 0.7, 0.55], rim: 0.6, glow: 0.3 },
  },
  moons: [
    { name: 'Io', radius: 0.07, orbit: 1.9, speed: 0.8, tilt: 0.05, color: 0xe8c862 },
    { name: 'Europa', radius: 0.06, orbit: 2.4, speed: 0.55, tilt: 0.08, color: 0xe2d6bf },
    { name: 'Ganymede', radius: 0.1, orbit: 3.0, speed: 0.38, tilt: -0.05, color: 0xa89c8a },
    { name: 'Callisto', radius: 0.09, orbit: 3.7, speed: 0.26, tilt: 0.1, color: 0x7d7364 },
  ],
  headline: [
    { label: 'Diameter', value: '139,822', unit: 'km' },
    { label: 'Orbital period', value: '11.86', unit: 'years' },
    { label: 'Known moons', value: '97', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '139,822 km', 'Mean; 142,984 km at the equator'),
      row('Mass', '1.898 × 10²⁷ kg', '318 Earth masses'),
      row('Density', '1.33 g/cm³'),
      row('Gravity', '24.79 m/s²', 'At the 1-bar level'),
      row('Average temperature', '−110 °C', 'At the 1-bar cloud tops'),
      row('Known moons', '97', 'Count as of 2025; four large Galilean moons'),
    ],
    orbit: [
      row('Distance from the Sun', '778.5 million km', '5.2 astronomical units'),
      row('Orbital period', '11.86 years'),
      row('Rotation period', '9 h 56 m', 'Shortest day of any planet'),
      row('Axial tilt', '3.13°'),
      row('Orbital speed', '13.1 km/s'),
      row('Sunlight travel time', '43 min'),
    ],
    atmosphere: {
      composition: [
        { label: 'Hydrogen', symbol: 'H₂', percent: 89.8 },
        { label: 'Helium', symbol: 'He', percent: 10.2 },
        { label: 'Methane', symbol: 'CH₄', percent: 0.3 },
        { label: 'Ammonia', symbol: 'NH₃', percent: 0.03 },
      ],
      note: 'Percentages are by volume. Clouds of ammonia crystals form the pale bands.',
    },
    surface: [
      row('Surface', 'No solid surface', 'Gas gradually becomes liquid with depth'),
      row('Great Red Spot', '≈ 16,000 km wide', 'A storm observed for over 150 years'),
      row('Magnetic field', 'Strongest of the planets', '≈ 20,000 times Earth’s'),
      row('Rings', 'Faint', 'Made mostly of dust'),
      row('Wind speeds', 'Up to 600 km/h'),
    ],
  },
  facts: [
    { title: 'More than all the rest', body: 'Jupiter is more than twice as massive as all the other planets combined.' },
    { title: 'A shortening day', body: 'It spins so fast that a day lasts under ten hours, flattening the planet at its poles.' },
    { title: 'Worlds of its own', body: 'Its four Galilean moons were discovered by Galileo in 1610. Europa is thought to hide a deep ocean beneath its ice.' },
    { title: 'A lasting storm', body: 'The Great Red Spot is a giant anticyclone wide enough to swallow Earth, though it has been shrinking.' },
  ],
};

const saturn = {
  id: 'saturn',
  name: 'Saturn',
  order: 6,
  subtitle: 'The ringed planet',
  classification: 'Gas giant',
  intro:
    'Saturn is a gas giant encircled by the most extensive ring system known. Its rings of ice and rock stretch hundreds of thousands ' +
    'of kilometres yet are mostly only tens of metres thick. It is the least dense planet in the solar system.',
  visual: { radius: 5, orbit: 122, phase: 3.3 },
  frame: 4.2,
  model: {
    type: 'world', map: 'saturnmap.jpg', roughness: 0.85, axialTilt: 26.73, spinSpeed: 0.11, fallback: 0xd2bd8e,
    atmosphere: { color: [0.85, 0.78, 0.6], rim: 0.55, glow: 0.28 },
    rings: { kind: 'saturn', inner: 1.24, outer: 2.3 },
  },
  moons: [
    { name: 'Enceladus', radius: 0.05, orbit: 2.75, speed: 0.6, tilt: 0.03, color: 0xf2f4f6 },
    { name: 'Rhea', radius: 0.07, orbit: 3.25, speed: 0.4, tilt: -0.03, color: 0xbab5ad },
    { name: 'Titan', radius: 0.12, orbit: 3.8, speed: 0.28, tilt: 0.05, color: 0xd69c4c },
  ],
  headline: [
    { label: 'Diameter', value: '116,464', unit: 'km' },
    { label: 'Orbital period', value: '29.4', unit: 'years' },
    { label: 'Known moons', value: '274', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '116,464 km', 'Mean; 120,536 km at the equator'),
      row('Mass', '5.68 × 10²⁶ kg', '95 Earth masses'),
      row('Density', '0.687 g/cm³', 'Less than water'),
      row('Gravity', '10.44 m/s²', 'At the 1-bar level'),
      row('Average temperature', '−140 °C', 'At the 1-bar cloud tops'),
      row('Known moons', '274', 'Count as of 2025; Titan is the largest'),
    ],
    orbit: [
      row('Distance from the Sun', '1.434 billion km', '9.58 astronomical units'),
      row('Orbital period', '29.4 years'),
      row('Rotation period', '10 h 33 m'),
      row('Axial tilt', '26.73°'),
      row('Orbital speed', '9.68 km/s'),
      row('Sunlight travel time', '1 h 19 min'),
    ],
    atmosphere: {
      composition: [
        { label: 'Hydrogen', symbol: 'H₂', percent: 96.3 },
        { label: 'Helium', symbol: 'He', percent: 3.25 },
        { label: 'Methane', symbol: 'CH₄', percent: 0.45 },
      ],
      note: 'Percentages are by volume, with traces of ammonia, ethane and water ice.',
    },
    surface: [
      row('Surface', 'No solid surface', 'Gas gradually becomes liquid with depth'),
      row('Main rings', '≈ 282,000 km wide', 'Typically about 10 m thick'),
      row('Ring material', 'Water ice', 'From dust grains to house-sized blocks'),
      row('North pole', 'Hexagonal storm', 'A jet stream about 30,000 km across'),
      row('Wind speeds', 'Up to 1,800 km/h'),
    ],
  },
  facts: [
    { title: 'It would float', body: 'Saturn is the only planet less dense than water, so in a large enough ocean it would float.' },
    { title: 'Remarkably thin rings', body: 'The rings span nearly 300,000 km but are often only about ten metres thick.' },
    { title: 'Titan’s thick air', body: 'Saturn’s largest moon has a dense nitrogen atmosphere and lakes of liquid methane and ethane.' },
    { title: 'Geysers on Enceladus', body: 'Plumes of water ice erupt from Enceladus, hinting at a liquid ocean beneath its crust.' },
  ],
};

const uranus = {
  id: 'uranus',
  name: 'Uranus',
  order: 7,
  subtitle: 'The tilted ice giant',
  classification: 'Ice giant',
  intro:
    'Uranus is a pale blue-green ice giant that rotates on its side. Methane in its atmosphere absorbs red light, and a hot, dense ' +
    'mantle of water, ammonia and methane ices lies beneath its clouds.',
  visual: { radius: 3.4, orbit: 152, phase: 0.2 },
  frame: 4.1,
  model: {
    type: 'world', map: 'uranusmap.jpg', roughness: 0.8, axialTilt: 97.77, spinSpeed: -0.07, fallback: 0x8fd3d9,
    atmosphere: { color: [0.5, 0.85, 0.9], rim: 0.8, glow: 0.45 },
    rings: { kind: 'uranus', inner: 1.55, outer: 2.05 },
  },
  moons: [
    { name: 'Ariel', radius: 0.06, orbit: 2.7, speed: 0.55, tilt: 0.02, color: 0xc6c2bd },
    { name: 'Titania', radius: 0.08, orbit: 3.2, speed: 0.38, tilt: -0.02, color: 0xa8a29a },
    { name: 'Oberon', radius: 0.075, orbit: 3.75, speed: 0.28, tilt: 0.03, color: 0x8e8780 },
  ],
  headline: [
    { label: 'Diameter', value: '50,724', unit: 'km' },
    { label: 'Orbital period', value: '84', unit: 'years' },
    { label: 'Known moons', value: '29', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '50,724 km', '4 times Earth’s'),
      row('Mass', '8.68 × 10²⁵ kg', '14.5 Earth masses'),
      row('Density', '1.27 g/cm³'),
      row('Gravity', '8.69 m/s²', 'At the 1-bar level'),
      row('Average temperature', '−195 °C', 'At the 1-bar level'),
      row('Known moons', '29', 'Count as of 2025'),
    ],
    orbit: [
      row('Distance from the Sun', '2.871 billion km', '19.2 astronomical units'),
      row('Orbital period', '84 years'),
      row('Rotation period', '17 h 14 m', 'Retrograde'),
      row('Axial tilt', '97.77°', 'The planet rolls on its side'),
      row('Orbital speed', '6.80 km/s'),
      row('Sunlight travel time', '2 h 40 min'),
    ],
    atmosphere: {
      composition: [
        { label: 'Hydrogen', symbol: 'H₂', percent: 83 },
        { label: 'Helium', symbol: 'He', percent: 15 },
        { label: 'Methane', symbol: 'CH₄', percent: 2.3 },
      ],
      note: 'Percentages are by volume. Methane gives Uranus its blue-green colour.',
    },
    surface: [
      row('Surface', 'No solid surface', 'Clouds over a deep icy mantle'),
      row('Mantle', 'Water, ammonia, methane', 'Hot, dense “ices”'),
      row('Rings', '13 known', 'Narrow, dark and faint'),
      row('Coldest recorded', '−224 °C', 'The coldest planetary atmosphere'),
      row('Magnetic field', 'Tilted and offset', 'Not aligned with the rotation axis'),
    ],
  },
  facts: [
    { title: 'Rolling on its side', body: 'Uranus is tilted by almost 98°, so each pole gets about 42 years of sunlight followed by 42 years of darkness.' },
    { title: 'Found by telescope', body: 'William Herschel discovered Uranus in 1781, the first planet found with a telescope.' },
    { title: 'The coldest atmosphere', body: 'Despite being closer than Neptune, Uranus has recorded the lowest temperatures of any planetary atmosphere.' },
    { title: 'Literary moons', body: 'Its moons are named after characters from works by Shakespeare and Alexander Pope.' },
  ],
};

const neptune = {
  id: 'neptune',
  name: 'Neptune',
  order: 8,
  subtitle: 'The distant ice giant',
  classification: 'Ice giant',
  intro:
    'Neptune is the most distant planet, a deep blue ice giant lashed by the fastest winds in the solar system. ' +
    'It was found through mathematical prediction before it was ever seen through a telescope.',
  visual: { radius: 3.3, orbit: 180, phase: 5.9 },
  frame: 3.6,
  model: {
    type: 'world', map: 'neptunemap.jpg', roughness: 0.8, axialTilt: 28.32, spinSpeed: 0.075, fallback: 0x3f5fc4,
    atmosphere: { color: [0.25, 0.42, 0.95], rim: 0.9, glow: 0.5 },
  },
  moons: [
    { name: 'Proteus', radius: 0.05, orbit: 2.2, speed: 0.6, tilt: 0.1, color: 0x8b8782 },
    { name: 'Triton', radius: 0.11, orbit: 3.1, speed: -0.34, tilt: 0.5, color: 0xdcc9c0 },
  ],
  headline: [
    { label: 'Diameter', value: '49,244', unit: 'km' },
    { label: 'Orbital period', value: '164.8', unit: 'years' },
    { label: 'Known moons', value: '16', unit: '' },
  ],
  sections: {
    physical: [
      row('Diameter', '49,244 km', '3.9 times Earth’s'),
      row('Mass', '1.02 × 10²⁶ kg', '17 Earth masses'),
      row('Density', '1.64 g/cm³'),
      row('Gravity', '11.15 m/s²', 'At the 1-bar level'),
      row('Average temperature', '−200 °C', 'At the 1-bar level'),
      row('Known moons', '16', 'Count as of 2025'),
    ],
    orbit: [
      row('Distance from the Sun', '4.495 billion km', '30.1 astronomical units'),
      row('Orbital period', '164.8 years'),
      row('Rotation period', '16 h 6 m'),
      row('Axial tilt', '28.32°'),
      row('Orbital speed', '5.43 km/s'),
      row('Sunlight travel time', '4 h 10 min'),
    ],
    atmosphere: {
      composition: [
        { label: 'Hydrogen', symbol: 'H₂', percent: 80 },
        { label: 'Helium', symbol: 'He', percent: 19 },
        { label: 'Methane', symbol: 'CH₄', percent: 1.5 },
      ],
      note: 'Percentages are by volume. Methane absorbs red light and tints the planet deep blue.',
    },
    surface: [
      row('Surface', 'No solid surface', 'Clouds over a deep icy mantle'),
      row('Fastest winds', '≈ 2,100 km/h', 'Supersonic, the fastest recorded on any planet'),
      row('Storms', 'Great Dark Spot', 'Dark storms appear and fade over years'),
      row('Rings', 'Five faint rings', 'Dusty and clumped into arcs'),
      row('Interior heat', 'Radiates more than it receives'),
    ],
  },
  facts: [
    { title: 'Found with mathematics', body: 'Astronomers predicted Neptune’s position from irregularities in Uranus’s orbit, and it was observed in 1846.' },
    { title: 'One lap since discovery', body: 'Neptune completed its first full orbit since its discovery in 2011.' },
    { title: 'A captured moon', body: 'Triton orbits backwards, which suggests it was captured from the Kuiper Belt. It has nitrogen geysers.' },
    { title: 'Supersonic winds', body: 'Winds reach about 2,100 km/h despite the little sunlight at this distance.' },
  ],
};

// Tour order: the Sun first, then outward to Neptune, then back to the Sun.
// Bodies are drawn larger than true scale relative to their orbits so they stay legible.
const SIZE_BOOST = 1.4;
export const BODIES = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].map((b) => ({
  ...b,
  visual: { ...b.visual, radius: b.visual.radius * SIZE_BOOST },
}));

export const getBody = (id) => BODIES.find((b) => b.id === id);
export const nextBody = (id) => BODIES[(BODIES.findIndex((b) => b.id === id) + 1) % BODIES.length];
export const DEFAULT_BODY = sun;
