import * as THREE from 'three';

export function _rot(state, point_name, q) {
    // q is xyzw
    if (!state.points || !state.points[point_name]) {
        console.error(
            `Point with name '${point_name}' does not exist in state.points.`
        );
        return;
    }

    const pointGroup = state.points[point_name];

    if (!pointGroup) {
        console.error(`Point '${point_name}' does not have a geometryGroup.`);
        return;
    }

    const quaternion = new THREE.Quaternion(q[0], q[2], q[3], q[1]);

    pointGroup.setRotationFromQuaternion(quaternion);
}
