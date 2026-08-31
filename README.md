# js_ribbon_effect

# 3D Twisting Ribbon Scroller

A retro-inspired **3D demoscene ribbon scroller effect** built with [Three.js](https://threejs.org/). The project creates a long, animated ribbon that twists and waves through 3D space while displaying continuously scrolling neon text.

The scene also includes a colorful particle starfield, fog, neon lighting, metallic materials, and interactive camera controls.

## Features

- **3D twisting ribbon**
  - 40-unit ribbon length
  - 2.5-unit ribbon width
  - 400 length segments and 10 width segments for smooth deformation
  - Dynamic wave motion along the ribbon
  - Continuous twisting around the ribbon spine

- **Demoscene-style scroller**
  - Text generated dynamically with the HTML5 Canvas API
  - Neon cyan and magenta borders
  - Glowing white text
  - Continuously scrolling texture
  - Repeating text pattern

- **Dual-sided ribbon**
  - Separate front and back meshes
  - Back-side UV coordinates are vertically flipped so the text remains readable on the reverse side

- **Retro/neon visual style**
  - Dark background
  - Cyan and magenta point lights
  - Metallic ribbon material
  - Exponential scene fog
  - ACES Filmic tone mapping

- **Animated starfield**
  - 1,500 colored particles
  - Slowly rotating background particle cloud

- **Interactive camera**
  - OrbitControls
  - Click and drag to rotate the camera
  - Mouse wheel to zoom
  - Damped camera movement
  - Minimum and maximum camera distance limits

- **Responsive**
  - Automatically adjusts to browser window resizing
  - Pixel ratio is capped at 2 for better performance

## Demo

Open `index.html` in a modern web browser.

The project is designed as a self-contained browser demo, with Three.js and OrbitControls loaded from CDNs.

## Project Structure

```text
3d-twisting-ribbon/
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`

Provides the basic HTML document structure and loads:

- `style.css`
- Three.js r128
- Three.js OrbitControls
- `script.js`

### `style.css`

Contains the fullscreen layout and the neon demoscene-style UI overlay.

### `script.js`

Contains the complete Three.js scene implementation, including:

- Scene and camera setup
- WebGL renderer
- Lighting
- OrbitControls
- Dynamic canvas texture generation
- Ribbon geometry
- Ribbon deformation and twisting
- Scrolling texture animation
- Starfield generation
- Animation loop
- Window resize handling

## How It Works

### 1. Scene Setup

A Three.js scene is created with exponential fog:

```javascript
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.015);
```

The perspective camera starts at:

```javascript
camera.position.set(0, 0, 12.5);
```

The renderer uses antialiasing and ACES Filmic tone mapping for a more polished appearance.

### 2. Ribbon Geometry

The ribbon starts as a `PlaneGeometry`:

```javascript
const geometryFront = new THREE.PlaneGeometry(
    ribbonLength,
    ribbonWidth,
    lengthSegments,
    widthSegments
);
```

The high number of length segments is important because every vertex is repositioned every frame to create the animated shape.

### 3. Ribbon Wave Motion

The ribbon's center line, or spine, is calculated using multiple sine and cosine waves.

The Y position uses:

```javascript
const spineY =
    Math.sin(x0 * 0.3 + time * 2.0) * 3.0 +
    Math.cos(x0 * 0.15 + time * 1.2) * 1.5;
```

The Z position uses:

```javascript
const spineZ =
    Math.cos(x0 * 0.25 + time * 1.8) * 4.0;
```

Combining multiple waves gives the ribbon a more complex, organic motion than a single sine wave.

### 4. Ribbon Twist

Each vertex is rotated around the ribbon spine:

```javascript
const twistAngle = x0 * 0.4 + time * 2.5;

const dy = y0 * Math.cos(twistAngle);
const dz = y0 * Math.sin(twistAngle);
```

The resulting position is:

```text
X = original X
Y = spineY + dy
Z = spineZ + dz
```

This creates the characteristic continuously twisting ribbon effect.

### 5. Scrolling Text

The scroller texture is generated using an HTML5 Canvas.

The text:

```text
★ 3D TWISTING RIBBON SCROLLER ★ DEMOSCENE EFFECT ★ THREE.JS GRAPHICS ★
```

is rendered into the canvas and converted into a `THREE.CanvasTexture`.

The texture is repeated along the ribbon:

```javascript
texture.repeat.set(4, 1);
```

During animation, the texture offset is continuously changed:

```javascript
textTexture.offset.x = -(elapsedTime * 0.15) % 1;
```

This produces the classic horizontal demoscene scrolling-text effect.

### 6. Dual-Sided Rendering

Two meshes are used instead of a single double-sided material.

The front mesh uses:

```javascript
side: THREE.FrontSide
```

The back mesh uses:

```javascript
side: THREE.BackSide
```

The back mesh also flips its V texture coordinate:

```javascript
uvAttr.setY(i, 1 - uvAttr.getY(i));
```

This compensates for the ribbon's twisting geometry and keeps the text orientation correct on the reverse side.

### 7. Starfield

The background consists of 1,500 randomly positioned particles.

The particles are assigned cyan/green-ish colors and slowly rotate:

```javascript
starField.rotation.y = elapsedTime * 0.02;
starField.rotation.x = elapsedTime * 0.01;
```

This adds depth and motion to the background without requiring a large number of 3D objects.

## Controls

| Action | Control |
|---|---|
| Rotate camera | Click + drag |
| Zoom | Mouse wheel |
| Automatic animation | Always active |

OrbitControls also uses damping to make camera movement smoother.

## Customization

Most of the visual behavior can be changed near the top of `script.js`.

### Ribbon Size

```javascript
const ribbonLength = 40;
const ribbonWidth = 2.5;
```

Increase `ribbonLength` for a longer scroller or `ribbonWidth` for a wider ribbon.

### Geometry Resolution

```javascript
const lengthSegments = 400;
const widthSegments = 10;
```

Higher values create smoother deformation but require more vertex calculations every frame.

### Ribbon Wave

Modify:

```javascript
const spineY =
    Math.sin(x0 * 0.3 + time * 2.0) * 3.0 +
    Math.cos(x0 * 0.15 + time * 1.2) * 1.5;

const spineZ =
    Math.cos(x0 * 0.25 + time * 1.8) * 4.0;
```

The multipliers control:

- Wave frequency
- Wave amplitude
- Animation speed
- Shape of the ribbon path

### Twist

Modify:

```javascript
const twistAngle = x0 * 0.4 + time * 2.5;
```

For example:

- Increase `0.4` for tighter twisting along the ribbon.
- Increase `2.5` for faster rotation over time.

### Scroller Speed

Change:

```javascript
textTexture.offset.x = -(elapsedTime * 0.15) % 1;
```

The `0.15` value controls the scrolling speed.

### Starfield Density

Change:

```javascript
const starCount = 1500;
```

Increasing this creates a denser background but may reduce performance on slower hardware.

### Lighting

The scene uses two colored point lights:

```javascript
const cyanLight = new THREE.PointLight(0x00ffcc, 3, 50);
const magentaLight = new THREE.PointLight(0xff00aa, 3, 50);
```

Their colors, intensity, range, and positions can be modified to create different visual styles.

## Running Locally

Because the project uses JavaScript modules only through regular script loading and external CDN resources, it can usually be opened directly in a browser.

Simply open:

```text
index.html
```

For a more reliable development setup, especially if additional assets or modules are added later, run a local web server.

For example, with Python:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Dependencies

The project uses:

- **Three.js r128**
- **OrbitControls** from the matching Three.js r128 release
- HTML5 Canvas API
- WebGL

Three.js is loaded from:

```text
https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
```

OrbitControls is loaded from:

```text
https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
```

An internet connection is therefore required when loading the project unless the Three.js files are downloaded and served locally.

## Performance Notes

The most expensive part of the demo is the ribbon deformation.

Every animation frame:

1. Every ribbon vertex is processed.
2. Its wave position is calculated.
3. Its twist position is calculated.
4. The geometry position buffer is updated.
5. Vertex normals are recalculated for both ribbon meshes.
6. The scene is rendered.

The project uses:

```javascript
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

to prevent extremely high-DPI displays from creating excessive rendering workloads.

If performance is too low, consider reducing:

```javascript
const lengthSegments = 400;
const widthSegments = 10;
const starCount = 1500;
```

## Browser Compatibility

A modern browser with WebGL support is recommended.

Suitable browsers include current versions of:

- Chrome / Chromium
- Firefox
- Microsoft Edge
- Safari

## Inspiration

The visual style is inspired by classic **Amiga and PC demoscene scrollers**, particularly the combination of:

- Large scrolling messages
- Waving/twisting geometry
- Neon colors
- Starfields
- Metallic surfaces
- Real-time procedural animation

The implementation uses modern WebGL through Three.js while recreating the visual spirit of those classic effects.

## License

No license is specified by the original project code.

If you publish or redistribute this project, add an appropriate license file and update this section accordingly.

## Author / Credits

### Technology

- Three.js
- WebGL
- HTML5 Canvas
- JavaScript
- CSS

### Effect

**3D Twisting Ribbon Scroller — Demoscene-inspired Three.js effect**

---

Enjoy experimenting with the ribbon equations, colors, lighting, text, and animation timing to create your own demoscene-style effects!
