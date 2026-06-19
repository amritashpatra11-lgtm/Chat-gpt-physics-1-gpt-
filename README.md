# Physics Explorer

A dependency-free, mobile-first interactive physics platform designed to remain usable on low-end Android devices and unstable networks.

## Included in this milestone

- ChatGPT-style discovery interface and searchable catalogue of 100 school-physics simulations.
- Every catalogue entry opens an interactive lab.
- Specialised numerical/visual modules for:
  - Constant-acceleration kinematics and variable acceleration
  - Free fall and projectile motion
  - Hooke's law, SHM, damping, forcing, and resonance
  - Travelling waves, standing waves, and harmonics
  - Coulomb models, Ohm's law, resistor networks, and RC concepts
  - Thin lenses, mirrors, ray tracing, and interference
- A general interactive concept module for the remaining first-milestone topics. Its interface is ready to be replaced by topic-specific solvers incrementally.
- Fixed-timestep physics engine with render-rate decoupling.
- Automatic animation suspension when the page is hidden.
- Low-performance mode: 30 FPS target, reduced sampling, DPR reduction, and visual-effect removal.
- Local saved-lab storage, dark/light mode, offline service worker, and installable PWA manifest.
- No runtime dependencies, chart libraries, Three.js, WASM, or external fonts.

## Run locally

Because the project uses JavaScript modules, serve the directory over HTTP rather than opening `index.html` directly.

### Python

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

### Node

```bash
npx serve .
```

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload every file and folder from this project, preserving the directory structure.
3. Open **Settings → Pages**.
4. Set the deployment source to the repository's main branch and `/ (root)`.
5. Save. GitHub will provide the public URL.

No build step is required.

## Architecture

- `app.js`: navigation, catalogue, search, favourites, question-to-lab matching, lazy module loading.
- `data/catalog.js`: metadata for all 100 simulations.
- `core/engine.js`: fixed-timestep animation engine and Canvas utilities.
- `core/lab-ui.js`: reusable controls, metrics, transport controls, and lab shell.
- `simulators/*.js`: lazily imported simulation modules.
- `sw.js`: cache-first offline support.

## Extending a simulation

Create a module exporting:

```js
export function createSimulator(container, { item, lowPerformance }) {
  // mount UI and start engine
  return () => {
    // stop animation and release observers/listeners
  };
}
```

Then map the module key in `simulatorModule()` inside `app.js`.
