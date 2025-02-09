import * as THREE from 'three';
import { Option, Some, None } from 'ts-results';
import { disposeObject } from './utils.js';

const NUM_CURVE_POINTS = 3;
const MAX_SEGMENTS = 250;
const MAX_VERTICES = (MAX_SEGMENTS + 1) * NUM_CURVE_POINTS;

export class Trail {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private trailVertices: Float32Array;
  private trailIndices: Uint16Array;
  private trailAlpha: Float32Array;
  private currentSegmentIndex: number = 0;
  private currentCurveIndex: number = 0;
  private totalSegments: number = 0;
  private prevCurve: THREE.Vector3[] | null;
  private lastPosition: THREE.Vector3;
  private color: THREE.Color;

  constructor(
    pointGroup: THREE.Group,
    initialPosition: THREE.Vector3,
    scene: THREE.Scene,
  ) {
    this.trailVertices = new Float32Array(MAX_VERTICES * 3);
    this.trailIndices = new Uint16Array(
      MAX_SEGMENTS * (NUM_CURVE_POINTS - 1) * 6,
    );
    this.trailAlpha = new Float32Array(MAX_VERTICES).fill(1.0);
    this.lastPosition = initialPosition.clone();

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.trailVertices, 3),
    );
    this.geometry.setIndex(new THREE.BufferAttribute(this.trailIndices, 1));
    this.geometry.setAttribute(
      'alpha',
      new THREE.BufferAttribute(this.trailAlpha, 1),
    );

    const sphere = pointGroup.getObjectByName('point-sphere');
    // @ts-ignore `point-sphere` is a THREE.Mesh
    this.color = sphere!.material.color;

    this.material = new THREE.ShaderMaterial({
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
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor * vAlpha, vAlpha);
        }
      `,
      uniforms: {
        uColor: { value: this.color },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);
    this.prevCurve = null;
  }

  /**
   * Computes a curve that follows the Earth's surface below the satellite
   * Creates a ribbon-like trail by computing points in an arc perpendicular to the velocity
   */
  private computeCurrentCurve(
    position: THREE.Vector3,
    earth: THREE.Object3D,
    cameraAxes: Record<string, [number, number, number]> | null,
  ): Option<THREE.Vector3[]> {
    if (!cameraAxes) {
      return None;
    }

    const curvePoints: THREE.Vector3[] = [];
    const direction = new THREE.Vector3(...cameraAxes.direction);
    const columns = new THREE.Vector3(...cameraAxes.columns);

    // Define the field of view for the trail width
    const totalFOV = Math.PI / 8; // 22.5 degrees total width
    const halfFOV = totalFOV / 2;

    for (let i = 0; i < NUM_CURVE_POINTS; i++) {
      const t = i / (NUM_CURVE_POINTS - 1);
      const theta = THREE.MathUtils.lerp(-halfFOV, halfFOV, t);
      const dir = direction.clone().applyAxisAngle(columns, theta).normalize();
      const raycaster = new THREE.Raycaster(position, dir);
      const intersects = raycaster.intersectObject(earth);

      if (intersects.length > 0) {
        const surfPt = intersects[0].point.clone().multiplyScalar(1.003);
        curvePoints.push(surfPt);
      } else {
        return None;
      }
    }

    return Some(curvePoints);
  }

  private addSegment(
    prevCurve: THREE.Vector3[] | null,
    currCurve: THREE.Vector3[],
  ) {
    let startIndex = this.currentCurveIndex * NUM_CURVE_POINTS * 3;
    let indexOffset = this.currentSegmentIndex * (NUM_CURVE_POINTS - 1) * 6;

    for (let i = 0; i < NUM_CURVE_POINTS; i++) {
      const pt = currCurve[i];
      let index = startIndex + i * 3;
      let alphaIndex = startIndex / 3 + i;

      this.trailVertices[index] = pt.x;
      this.trailVertices[index + 1] = pt.y;
      this.trailVertices[index + 2] = pt.z;
      this.trailAlpha[alphaIndex] = 1.0;
    }

    this.currentCurveIndex = (this.currentCurveIndex + 1) % (MAX_SEGMENTS + 1);

    if (!prevCurve) {
      return;
    }

    for (let i = 0; i < NUM_CURVE_POINTS - 1; i++) {
      let i0 = (startIndex / 3 + i) % MAX_VERTICES;
      let i1 = (i0 - NUM_CURVE_POINTS + MAX_VERTICES) % MAX_VERTICES;
      let i2 = (i1 + 1) % MAX_VERTICES;
      let i3 = (i0 + 1) % MAX_VERTICES;

      this.trailIndices[indexOffset++] = i0;
      this.trailIndices[indexOffset++] = i1;
      this.trailIndices[indexOffset++] = i2;

      this.trailIndices[indexOffset++] = i2;
      this.trailIndices[indexOffset++] = i3;
      this.trailIndices[indexOffset++] = i0;
    }

    this.currentSegmentIndex = (this.currentSegmentIndex + 1) % MAX_SEGMENTS;
    this.totalSegments = Math.min(this.totalSegments + 1, MAX_SEGMENTS);
  }

  private updateMesh() {
    this.geometry.attributes.position.needsUpdate = true;
    // Index is guaranteed to exist by the setIndex in the constructor
    this.geometry.index!.needsUpdate = true;

    const minFade = 0.002;
    const maxFade = 0.02;
    const fadeThreshold = 0.9;

    for (let i = 0; i < MAX_VERTICES; i++) {
      let alpha = this.trailAlpha[i];
      let fadeFactor: number;

      if (alpha > fadeThreshold) {
        fadeFactor = minFade;
      } else {
        let t = alpha / fadeThreshold;
        fadeFactor = minFade + (maxFade - minFade) * (1 - t * t);
      }

      this.trailAlpha[i] = Math.max(0, alpha - fadeFactor);
    }

    this.geometry.attributes.alpha.needsUpdate = true;
    this.geometry.setDrawRange(
      0,
      Math.min(this.totalSegments, MAX_SEGMENTS) * (NUM_CURVE_POINTS - 1) * 6,
    );
    this.geometry.computeVertexNormals();
  }

  update(
    position: THREE.Vector3,
    earth: THREE.Object3D,
    cameraAxes: Record<string, [number, number, number]> | null,
  ) {
    const currCurveOption = this.computeCurrentCurve(
      position,
      earth,
      cameraAxes,
    );

    if (!currCurveOption.some) {
      // Reset the trail if any point misses the Earth
      this.prevCurve = null;
      this.currentSegmentIndex = 0;
      this.currentCurveIndex = 0;
      this.totalSegments = 0;
      this.trailAlpha.fill(0);
      this.geometry.attributes.alpha.needsUpdate = true;
    } else {
      const currCurve = currCurveOption.val;
      this.addSegment(this.prevCurve, currCurve);
      if (this.totalSegments > 0) {
        this.updateMesh();
      }
      this.prevCurve = currCurve;
    }

    this.lastPosition.copy(position);
  }

  dispose() {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    disposeObject(this.mesh);
  }
}
