// Global variables
let scene, camera, renderer, controls;
let ribbonMesh, originalPositions;
let textTexture;
let starField;
const clock = new THREE.Clock();

// Ribbon settings
const ribbonLength = 40;
const ribbonWidth = 2.5;
const lengthSegments = 400;
const widthSegments = 10;

init();
animate();

function init() {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.015);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 0, 25);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 5;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00ffcc, 3, 50);
    cyanLight.position.set(-15, 10, 10);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00aa, 3, 50);
    magentaLight.position.set(15, -10, 10);
    scene.add(magentaLight);

    // 6. Create Ribbon Texture and Geometry
    textTexture = createTextTexture();
    createRibbon();

    // 7. Add Background Starfield / Particle Cloud
    createStarfield();

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);
}

// Generate dynamic dynamic scroller text texture using 2D Canvas
function createTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Background fill
    ctx.fillStyle = '#0a0014';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon borders
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ff00aa';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Glowing Text
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = "★ 3D TWISTING RIBBON SCROLLER ★ DEMOSCENE EFFECT ★ THREE.JS GRAPHICS ★ ";
    ctx.fillText(text.repeat(2), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1); // Repeat along the length

    return texture;
}

// Create ribbon mesh
function createRibbon() {
    // Plane geometry along the X-axis
    const geometry = new THREE.PlaneGeometry(
        ribbonLength, 
        ribbonWidth, 
        lengthSegments, 
        widthSegments
    );

    // Save a copy of initial vertex coordinates
    originalPositions = geometry.attributes.position.clone();

    // Material setup
    const material = new THREE.MeshStandardMaterial({
        map: textTexture,
        side: THREE.DoubleSide,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false
    });

    ribbonMesh = new THREE.Mesh(geometry, material);
    scene.add(ribbonMesh);
}

// Create background particle starfield
function createStarfield() {
    const starCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 120;
        positions[i + 1] = (Math.random() - 0.5) * 120;
        positions[i + 2] = (Math.random() - 0.5) * 120;

        colors[i] = Math.random() > 0.5 ? 0.0 : 1.0;     // R
        colors[i + 1] = Math.random() > 0.5 ? 1.0 : 0.0; // G
        colors[i + 2] = 0.8;                            // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Update ribbon vertex math
    updateRibbonGeometry(elapsedTime);

    // Scroll text texture continuously
    if (textTexture) {
        textTexture.offset.x = -(elapsedTime * 0.15) % 1;
    }

    // Slowly rotate background starfield
    if (starField) {
        starField.rotation.y = elapsedTime * 0.02;
        starField.rotation.x = elapsedTime * 0.01;
    }

    // Update camera controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
}

// Core math algorithm for deform + twist
function updateRibbonGeometry(time) {
    const positionAttribute = ribbonMesh.geometry.attributes.position;
    const orig = originalPositions;

    for (let i = 0; i < positionAttribute.count; i++) {
        // Fetch base grid position
        const x0 = orig.getX(i);
        const y0 = orig.getY(i);

        // 1. Calculate Ribbon Spine Path (Waves)
        const spineY = Math.sin(x0 * 0.3 + time * 2.0) * 3.0 + 
                       Math.cos(x0 * 0.15 + time * 1.2) * 1.5;

        const spineZ = Math.cos(x0 * 0.25 + time * 1.8) * 4.0;

        // 2. Calculate Ribbon Twist Angle along length
        const twistAngle = x0 * 0.4 + time * 2.5;

        // 3. Rotate vertex offset (y0) around the spine in YZ plane
        const dy = y0 * Math.cos(twistAngle);
        const dz = y0 * Math.sin(twistAngle);

        // 4. Set dynamic vertex coordinates
        positionAttribute.setXYZ(
            i, 
            x0, 
            spineY + dy, 
            spineZ + dz
        );
    }

    // Notify Three.js to update geometry buffers & recalculate light reflection normals
    positionAttribute.needsUpdate = true;
    ribbonMesh.geometry.computeVertexNormals();
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
