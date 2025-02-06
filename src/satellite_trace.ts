import *
as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import {
    OrbitControls
} from "https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/controls/OrbitControls.js";

// === Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window
    .innerHeight, 0.001, 10000);
camera.position.set(0, 4, 6);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Earth Setup ===
const earthRadius = 3;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
const earthTexture = new THREE.TextureLoader()
    .load("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg");

const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 1,
    metalness: 0.1,

});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// === Lighting ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 2)); // Strong ambient light

// === Satellite Setup ===
const satelliteGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const satelliteMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000
});
const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
scene.add(satellite);

// === Trail Setup (Preallocated Buffer) ===
const numCurvePoints = 3;
const maxSegments = 250;
const maxVertices = (maxSegments + 1) * numCurvePoints;

const trailVertices = new Float32Array(maxVertices * 3);
// (numCurvePoints - 1) * 6 -> 6 edges per quad
const trailIndices = new Uint16Array(maxSegments * (numCurvePoints - 1) * 6);

let currentSegmentIndex = 0;
let currentCurveIndex = 0;
let totalSegments = 0; // To know when we fill up the buffer

const ribbonGeometry = new THREE.BufferGeometry();

const ribbonMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        precision highp float;
        varying float vAlpha;
        attribute float alpha;
        void main() {
            vAlpha = alpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        varying float vAlpha;
        uniform vec3 uColor;  // ✅ Uniform for color
        void main() {
            gl_FragColor = vec4(uColor * vAlpha, vAlpha);
        }
    `,
    uniforms: {
        uColor: { value: new THREE.Color(1.0, 1.0, 0.0) }, // ✅ Initial color (yellow)
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

ribbonGeometry.setAttribute("position", new THREE.BufferAttribute(trailVertices,
    3));
ribbonGeometry.setIndex(new THREE.BufferAttribute(trailIndices, 1));
const trailAlpha = new Float32Array(maxVertices * 3)
    .fill(1.0);
ribbonGeometry.setAttribute("alpha", new THREE.BufferAttribute(trailAlpha, 1));


const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
scene.add(ribbonMesh);

// === Orbit & Animation Variables ===
const orbitRadius = 4;
let angle = 0;
const orbitSpeed = 0.005;
let lastPosition = new THREE.Vector3(orbitRadius, 0, 0);
let previousCurve = null;

// FOV parameters
const totalFOV = Math.PI / 8;
const halfFOV = totalFOV / 2;

// === Compute Curve ===
function computeCurrentCurve() {
    const curvePoints = [];
    const nadir = satellite.position.clone()
        .negate()
        .normalize();
    const velocity = new THREE.Vector3()
        .subVectors(satellite.position, lastPosition)
        .normalize();

    for (let i = 0; i < numCurvePoints; i++) {
        const t = i / (numCurvePoints - 1);
        const theta = THREE.MathUtils.lerp(-halfFOV, halfFOV, t);
        const dir = nadir.clone()
            .applyAxisAngle(velocity, theta)
            .normalize();
        const raycaster = new THREE.Raycaster(satellite.position, dir);
        const intersects = raycaster.intersectObject(earth);

        if (intersects.length > 0) {
            const surfPt = intersects[0].point.clone()
                .normalize()
                .multiplyScalar(earthRadius);
            curvePoints.push(surfPt);
        } else {
            curvePoints.push(new THREE.Vector3());
        }
    }

    return curvePoints;
}

// === Add Ribbon Segment in Circular Buffer ===
function addRibbonSegment(prevCurve, currCurve) {
    let startIndex = currentCurveIndex * numCurvePoints * 3;
    let indexOffset = currentSegmentIndex * (numCurvePoints - 1) * 6;

    for (let i = 0; i < numCurvePoints; i++) {
        const pt = currCurve[i].clone()
            .normalize()
            .multiplyScalar(earthRadius * 1.02);

        let index = startIndex + i * 3;
        let alphaIndex = startIndex / 3 + i;

        trailVertices[index] = pt.x;
        trailVertices[index + 1] = pt.y;
        trailVertices[index + 2] = pt.z;

        // ✅ New points always start at full opacity
        trailAlpha[alphaIndex] = 0.8;
    }

    /* for (let i = 0; i < trailAlpha.length; i++) {
    trailAlpha[i] = trailAlpha[i]*0.9;
    } */
    currentCurveIndex = (currentCurveIndex + 1) % (maxSegments + 1);

    if (!prevCurve) {
        return;
    }

    for (let i = 0; i < numCurvePoints - 1; i++) {
        let i0 = (startIndex / 3 + i) % maxVertices;
        let i1 = (i0 - numCurvePoints + maxVertices) % maxVertices;
        let i2 = (i1 + 1) % maxVertices;
        let i3 = (i0 + 1) % maxVertices;

        trailIndices[indexOffset++] = i0;
        trailIndices[indexOffset++] = i1;
        trailIndices[indexOffset++] = i2;

        trailIndices[indexOffset++] = i2;
        trailIndices[indexOffset++] = i3;
        trailIndices[indexOffset++] = i0;
    }

    // Typically the currentSegementIndex is one behind curveSegmentIndex
    // If got N curves we have N-1 segments. Telephone posts!
    currentSegmentIndex = (currentSegmentIndex + 1) % maxSegments;
    totalSegments = Math.min(totalSegments + 1, maxSegments);
}

// === Update Ribbon Mesh Efficiently ===
function updateTrailMesh() {
    ribbonGeometry.attributes.position.needsUpdate = true;
    ribbonGeometry.index.needsUpdate = true;

    const minFade = 0.002; // Minimum fade (slowest decay)
    const maxFade = 0.02; // Maximum fade (fastest decay)
    const fadeThreshold = 0.6; // Alpha level where fade accelerates

    for (let i = 0; i < maxVertices; i++) {
        let alpha = trailAlpha[i];

        // Apply non-linear fade: slow at high alpha, fast at low alpha
        let fadeFactor;
        if (alpha > fadeThreshold) {
            fadeFactor = minFade; // Small fade for bright areas
        } else {
            let t = alpha /
            fadeThreshold; // Normalize alpha to [0,1] before threshold
            fadeFactor = minFade + (maxFade - minFade) * (1 - t *
            t); // Quadratic ease-in
        }

        // Apply fading
        trailAlpha[i] = Math.max(0, alpha - fadeFactor);
    }

    ribbonGeometry.attributes.alpha.needsUpdate = true;

    ribbonGeometry.setDrawRange(
        0, Math.min(totalSegments, maxSegments) * (numCurvePoints - 1) * 6);
    ribbonGeometry.computeVertexNormals();
}


// === Animation Loop ===
let isPaused = false;

function animate() {
    if (isPaused) {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        return;
    }
    const t = performance.now() * 0.001;
    ribbonMaterial.uniforms.uColor.value.set(Math.sin(t) * 0.5 + 0.5, 0.5, 1.0);

    angle += orbitSpeed;
    satellite.position.set(orbitRadius * Math.cos(angle), 0, orbitRadius * Math
        .sin(angle));

    const currCurve = computeCurrentCurve();

    addRibbonSegment(previousCurve, currCurve);

    lastPosition.copy(satellite.position);
    previousCurve = currCurve;

    if (totalSegments > 0) updateTrailMesh();

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
