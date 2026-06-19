const groups = [
  ['Mechanics', [
    ['v = u + at', 'Velocity under constant acceleration', 'v = u + at', 'kinematics'],
    ['s = ut + ½at²', 'Displacement under constant acceleration', 's = ut + ½at²', 'kinematics'],
    ['v² = u² + 2as', 'Velocity–displacement relation', 'v² = u² + 2as', 'kinematics'],
    ['Free-fall simulator', 'Motion under gravity with optional air drag', 'y = y₀ + v₀t − ½gt²', 'freefall'],
    ['Projectile motion', 'Launch angle, speed, range, and trajectory', 'R = v₀² sin(2θ) / g', 'projectile'],
    ['Two-dimensional projectile motion', 'Resolve velocity and acceleration into vectors', 'x=v₀cosθ·t; y=v₀sinθ·t−½gt²', 'projectile'],
    ['Inclined plane', 'Forces and acceleration on a slope', 'a = g(sinθ − μcosθ)', 'forces'],
    ['Friction forces', 'Normal force, friction, and motion threshold', 'f ≤ μN', 'forces'],
    ['Static vs kinetic friction', 'Compare sticking and sliding regimes', 'fₛ≤μₛN; fₖ=μₖN', 'forces'],
    ['Circular motion', 'Position and velocity around a circle', 'v = ωr', 'circular'],
    ['Centripetal force', 'Radial force required for circular motion', 'F = mv²/r', 'circular'],
    ['Banked curves', 'Balance forces on a tilted roadway', 'tanθ = v²/(rg)', 'circular'],
    ["Newton's Second Law", 'Change mass and net force to observe acceleration', 'F = ma', 'forces'],
    ['Action-reaction forces', 'Visualize equal and opposite interaction pairs', 'F₁₂ = −F₂₁', 'collisions'],
    ['Momentum conservation', 'Track total momentum before and after interaction', 'Σpᵢ = Σp𝒇', 'collisions'],
    ['Elastic collision', 'Conserve momentum and kinetic energy', 'p and K conserved', 'collisions'],
    ['Inelastic collision', 'Objects stick while momentum remains conserved', 'm₁u₁+m₂u₂=(m₁+m₂)v', 'collisions'],
    ['Rocket motion', 'Mass loss, thrust, and changing velocity', 'Δv = vₑ ln(m₀/m)', 'collisions'],
    ['Center of mass', 'Move particles and locate their weighted centre', 'r_cm = Σmᵢrᵢ/Σmᵢ', 'collisions'],
    ['Variable acceleration', 'Integrate acceleration numerically over time', 'v = ∫a(t)dt', 'kinematics']
  ]],
  ['Energy', [
    ['Kinetic energy', 'Connect mass and speed to energy', 'K = ½mv²', 'energy'],
    ['Gravitational potential energy', 'Compare reference height and stored energy', 'U = mgh', 'energy'],
    ['Spring potential energy', 'Stretch a spring and inspect stored energy', 'U = ½kx²', 'energy'],
    ['Conservation of energy', 'Watch potential and kinetic energy exchange', 'K + U = constant', 'energy'],
    ['Roller coaster energy', 'Track speed and energy along a height profile', '½mv² + mgh = E', 'energy'],
    ['Pendulum energy transfer', 'Observe periodic conversion between K and U', 'E = ½mv² + mgh', 'energy'],
    ['Escape velocity', 'Find the speed needed to leave a gravitating body', 'vₑ = √(2GM/R)', 'energy'],
    ['Power output', 'Relate work, energy, and time', 'P = W/t', 'energy'],
    ['Work-energy theorem', 'See how net work changes kinetic energy', 'W_net = ΔK', 'energy'],
    ['Mechanical efficiency', 'Compare useful output with total input', 'η = E_out/E_in', 'energy']
  ]],
  ['Rotational Motion', [
    ['Torque visualization', 'Adjust force, lever arm, and angle', 'τ = rFsinθ', 'rotation'],
    ['Angular velocity', 'Connect angle swept to time', 'ω = dθ/dt', 'rotation'],
    ['Angular acceleration', 'See changing rotational speed', 'α = dω/dt', 'rotation'],
    ['Rotational kinetic energy', 'Energy stored in rotation', 'K_rot = ½Iω²', 'rotation'],
    ['Moment of inertia', 'Redistribute mass and change rotational resistance', 'I = Σmᵢrᵢ²', 'rotation'],
    ['Flywheel simulator', 'Store and release rotational energy', 'E = ½Iω²', 'rotation'],
    ['Rotational equilibrium', 'Balance clockwise and anticlockwise torques', 'Στ = 0', 'rotation'],
    ['Rolling without slipping', 'Link translational and angular motion', 'v = ωR', 'rotation'],
    ['Gyroscope simulator', 'Visualize spin and precession vectors', 'Ω ≈ τ/L', 'rotation'],
    ['Angular momentum conservation', 'Change inertia and observe spin rate', 'I₁ω₁ = I₂ω₂', 'rotation']
  ]],
  ['Oscillations', [
    ["Hooke's Law", 'Stretch a spring and measure restoring force', 'F = −kx', 'oscillations'],
    ['Simple harmonic motion', 'Inspect sinusoidal position, velocity, and acceleration', 'x = A cos(ωt+φ)', 'oscillations'],
    ['Spring-mass system', 'Change mass and stiffness to alter period', 'T = 2π√(m/k)', 'oscillations'],
    ['Damped oscillations', 'Observe amplitude decay caused by resistance', 'x=Ae⁻ᵝᵗcos(ω_dt)', 'oscillations'],
    ['Forced oscillations', 'Drive an oscillator at adjustable frequency', 'mx¨+bx˙+kx=F₀cosωt', 'oscillations'],
    ['Resonance', 'Find the frequency producing maximum response', 'ω₀ = √(k/m)', 'oscillations'],
    ['Coupled oscillators', 'Watch energy transfer between connected masses', 'M x¨ + Kx = 0', 'oscillations'],
    ['Physical pendulum', 'Change pivot distance and rotational inertia', 'T=2π√(I/mgd)', 'oscillations'],
    ['Torsional pendulum', 'Twist an object against a restoring torque', 'T=2π√(I/κ)', 'oscillations'],
    ['Energy in SHM', 'Track kinetic and potential energy through a cycle', 'E = ½kA²', 'oscillations']
  ]],
  ['Waves', [
    ['Wave speed', 'Change frequency and wavelength', 'v = fλ', 'waves'],
    ['Standing waves', 'Adjust mode number and boundary conditions', 'L = nλ/2', 'waves'],
    ['Beats phenomenon', 'Superpose nearby frequencies', 'f_beat = |f₁−f₂|', 'waves'],
    ['Doppler effect', 'Move source and observer', 'f′ = f(v±vₒ)/(v∓vₛ)', 'waves'],
    ['Reflection of waves', 'Observe inversion at fixed and free boundaries', 'θᵢ = θᵣ', 'waves'],
    ['Refraction of waves', 'Change medium and propagation direction', 'sinθ₁/sinθ₂ = v₁/v₂', 'waves'],
    ['Interference', 'Superpose coherent waves and inspect fringes', 'I ∝ cos²(Δφ/2)', 'waves'],
    ['Diffraction', 'Change aperture relative to wavelength', 'sinθ ≈ λ/a', 'waves'],
    ['Sound intensity', 'Relate power, distance, and decibel level', 'I=P/(4πr²)', 'waves'],
    ['Harmonics', 'Build tones from integer frequency multiples', 'fₙ = nf₁', 'waves']
  ]],
  ['Electricity', [
    ["Coulomb's Law", 'Move charges and inspect electric force vectors', 'F = kq₁q₂/r²', 'electricity'],
    ['Electric field mapping', 'Trace field direction around point charges', 'E = F/q', 'electricity'],
    ['Electric potential', 'Map potential around a charge distribution', 'V = kq/r', 'electricity'],
    ['Capacitor charging', 'Observe exponential voltage growth', 'V=V₀(1−e⁻ᵗ/ᴿᶜ)', 'electricity'],
    ['Capacitor discharging', 'Observe exponential voltage decay', 'V=V₀e⁻ᵗ/ᴿᶜ', 'electricity'],
    ['Series resistors', 'Combine resistors in one path', 'R_eq = ΣRᵢ', 'electricity'],
    ['Parallel resistors', 'Combine resistors across common nodes', '1/R_eq = Σ1/Rᵢ', 'electricity'],
    ["Ohm's Law", 'Change voltage and resistance to set current', 'I = V/R', 'electricity'],
    ["Kirchhoff's Current Law", 'Balance current at a junction', 'ΣI_in = ΣI_out', 'electricity'],
    ["Kirchhoff's Voltage Law", 'Balance potential changes around a loop', 'ΣΔV = 0', 'electricity'],
    ['Wheatstone bridge', 'Balance a bridge circuit', 'R₁/R₂ = R₃/R₄', 'electricity'],
    ['RC circuits', 'Explore time constant and transient response', 'τ = RC', 'electricity'],
    ['RL circuits', 'Explore current growth through an inductor', 'τ = L/R', 'electricity'],
    ['RLC resonance', 'Tune inductive and capacitive reactance', 'f₀=1/(2π√LC)', 'electricity'],
    ['Power dissipation', 'Inspect electrical energy converted per second', 'P=VI=I²R=V²/R', 'electricity']
  ]],
  ['Magnetism', [
    ['Magnetic field around wire', 'Visualize circular field lines', 'B=μ₀I/(2πr)', 'magnetism'],
    ['Solenoid magnetic field', 'Change turns, current, and length', 'B≈μ₀nI', 'magnetism'],
    ['Electromagnetic induction', 'Change flux to generate emf', 'ε = −dΦ/dt', 'magnetism'],
    ["Faraday's law", 'Connect changing magnetic flux to voltage', 'ε = −N dΦ/dt', 'magnetism'],
    ["Lenz's law", 'Reveal the direction opposing flux change', 'Induced effect opposes change', 'magnetism'],
    ['Moving conductor', 'Slide a rod through a magnetic field', 'ε = Blv', 'magnetism'],
    ['Electric motor', 'Convert electrical input into rotational motion', 'τ = NIAB sinθ', 'magnetism'],
    ['Generator', 'Convert rotation into alternating voltage', 'ε = NBAω sinωt', 'magnetism'],
    ['Transformer', 'Change AC voltage using turn ratio', 'Vₛ/Vₚ=Nₛ/Nₚ', 'magnetism'],
    ['Hall effect', 'Separate charge carriers in a magnetic field', 'V_H = BI/(nqt)', 'magnetism']
  ]],
  ['Optics', [
    ['Mirror equation', 'Move an object and locate the image', '1/f = 1/v + 1/u', 'optics'],
    ['Lens equation', 'Trace image formation through a thin lens', '1/f = 1/v − 1/u', 'optics'],
    ['Ray tracing', 'Drag objects and inspect principal rays', 'Geometric optics', 'optics'],
    ['Magnification', 'Compare image and object size', 'm = hᵢ/hₒ = v/u', 'optics'],
    ['Prism dispersion', 'Separate wavelengths by refractive index', 'n = c/v', 'optics'],
    ['Optical fiber', 'Guide light using repeated total internal reflection', 'θᵢ > θ_c', 'optics'],
    ['Total internal reflection', 'Find the critical angle between media', 'sinθ_c = n₂/n₁', 'optics'],
    ["Young's double slit", 'Change wavelength, separation, and screen distance', 'β = λD/d', 'optics'],
    ['Diffraction grating', 'Resolve wavelengths with many slits', 'd sinθ = nλ', 'optics'],
    ['Telescope', 'Compare focal lengths and angular magnification', 'M = fₒ/fₑ', 'optics'],
    ['Microscope', 'Combine objective and eyepiece magnification', 'M ≈ (L/fₒ)(D/fₑ)', 'optics']
  ]],
  ['Modern Physics', [
    ['Photoelectric effect', 'Change photon energy and stopping potential', 'K_max = hf − φ', 'modern'],
    ['Bohr atom simulator', 'Move between quantized hydrogen energy levels', 'Eₙ = −13.6eV/n²', 'modern'],
    ['Radioactive decay', 'Observe probabilistic exponential decay', 'N=N₀e⁻ˡᵗ', 'modern'],
    ['Quantum tunneling visualization', 'Change barrier height, width, and particle energy', 'T ∝ e⁻²ᵏᵃ', 'modern']
  ]]
];

const iconByCategory = {
  Mechanics: '↗', Energy: '⚡', 'Rotational Motion': '⟳', Oscillations: '∿', Waves: '≈',
  Electricity: 'ϟ', Magnetism: '◎', Optics: '◒', 'Modern Physics': 'ψ'
};

let count = 0;
export const catalog = groups.flatMap(([category, entries]) => entries.map(([title, description, formula, module]) => {
  count += 1;
  return {
    number: count,
    id: `${count}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    title,
    description,
    formula,
    category,
    level: 'School',
    module,
    icon: iconByCategory[category],
    live: true
  };
}));

export const categories = groups.map(([name]) => name);

export const featuredIds = [
  '5-projectile-motion',
  '41-hooke-s-law',
  '51-wave-speed',
  '61-coulomb-s-law',
  '68-ohm-s-law',
  '87-lens-equation'
];

export const challenges = [
  { title: 'Maximum-range launch', text: 'Use Projectile Motion to find the angle producing the greatest range on level ground. Then explain why complementary angles share the same range.' },
  { title: 'Design a soft spring', text: 'Use the Spring-Mass System to create a 2.0 s period while keeping mass below 2 kg. Record one valid pair of m and k.' },
  { title: 'Protect an LED', text: "Use Ohm's Law to choose a resistor that limits current to 20 mA from a 9 V source. Ignore LED forward voltage for the first estimate." },
  { title: 'Focus an image', text: 'Use the Lens Equation to place an object so that a converging lens makes a real image exactly twice the object height.' }
];
