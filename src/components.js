import * as THREE from "three";

// Object Frames
function createArrow(direction, origin, length, color, name) {
  const group = new THREE.Group();
  group.name = name;
  const normalizedDirection = direction.clone().normalize();

  // Shaft
  const shaftGeometry = new THREE.CylinderGeometry(
    length / 70,
    length / 50,
    length - 1000 / 20,
    16,
  );
  const shaftMaterial = new THREE.MeshBasicMaterial({
    color,
  });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.copy(
    origin
      .clone()
      .add(
        normalizedDirection.clone().multiplyScalar((length - 1000 / 20) / 2),
      ),
  );
  shaft.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    normalizedDirection,
  );
  group.add(shaft);

  // Head
  //const headGeometry = new THREE.ConeGeometry(200, 1000, 16);
  const headGeometry = new THREE.ConeGeometry(length / 40, length / 8, 16);
  const headMaterial = new THREE.MeshBasicMaterial({
    color,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.copy(
    origin
      .clone()
      .add(normalizedDirection.clone().multiplyScalar(length - 500 / 20)),
  );
  head.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    normalizedDirection,
  );
  group.add(head);

  return group;
}

export function createFrame(pos, length) {
  const frameGroup = new THREE.Group();
  frameGroup.name = "frame";

  const xAxisArrow = createArrow(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(pos.x, pos.y, pos.z),
    length,
    0xff0000,
    "xaxis",
  ); // X-axis (red)
  const yAxisArrow = createArrow(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(pos.x, pos.y, pos.z),
    length,
    0x00ff00,
    "yaxis",
  ); // Y-axis (green)
  const zAxisArrow = createArrow(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(pos.x, pos.y, pos.z),
    length,
    0x0000ff,
    "zaxis",
  ); // Z-axis (blue)

  frameGroup.add(xAxisArrow, yAxisArrow, zAxisArrow);
  frameGroup.position.set(pos.x, pos.y, pos.z);

  return frameGroup;
}

// Floating Points
export function createFloatingPoint(
  radius = 50,
  widthSegments = 16,
  heightSegments = 16,
  color = 0xff0000,
) {
  const pointGroup = new THREE.Group();
  const geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );
  const material = new THREE.MeshBasicMaterial({
    color,
  });
  const floatingPoint = new THREE.Mesh(geometry, material);
  pointGroup.add(floatingPoint);
  return pointGroup;
}

export function createLineGeometry(start, end) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(6); // Two 3D points, so 6 values

  // Set the start and end points
  vertices.set([start.x, start.y, start.z, end.x, end.y, end.z]);

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  return geometry;
}
