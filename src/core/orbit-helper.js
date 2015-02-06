export default
class OrbitHelper {

  constructor() {
    this.quaternion = new LiThree.Math.Quaternion();
    this.matrix = null;

    this.origin = new LiThree.Math.Vector3();
    this.speed = 1;
    this._getMatrix();
  }

  rotate(dx, dy) {
    var
      r = Math.sqrt(dx * dx + dy * dy),
      dq = new LiThree.Math.Quaternion(1, 0, 0, 0),
      cq = this.quaternion,
      rs = Math.sin(r * Math.PI) / r;

    dq.x = Math.cos(r * Math.PI);
    dq.y = 0;
    dq.z = rs * dx;
    dq.w = -rs * dy;

    this.quaternion = new LiThree.Math.Quaternion(1, 0, 0, 0);
    this.quaternion.multiply(dq);
    this.quaternion.multiply(cq);

    this._getMatrix();
  }

  _getMatrix() {
    this.matrix = LiThree.Math.Matrix4.fromRotationTranslationScaleOrigin(this.quaternion, this.origin, new LiThree.Math.Vector3(1, 1, 1), this.origin);
    return this.matrix;
  }

}