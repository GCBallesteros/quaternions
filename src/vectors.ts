export class Vector3 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
  ) {}

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector3 {
    const len = this.length();
    if (len === 0) {
      return new Vector3();
    }
    return this.scale(1 / len);
  }

  applyQuaternion(q: { x: number; y: number; z: number; w: number }): Vector3 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    // Calculate quat * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // Calculate result * inverse quat
    return new Vector3(
      ix * qw + iw * -qx + iy * -qz - iz * -qy,
      iy * qw + iw * -qy + iz * -qx - ix * -qz,
      iz * qw + iw * -qz + ix * -qy - iy * -qx,
    );
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}
