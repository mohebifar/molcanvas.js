export default
class OrbitMode {

  constructor(canvas) {
    this.canvas = canvas;
  }

  up() {
    var interactive = this.canvas.interactive;

    interactive.on('drag', this._dragEvent);
    interactive.on('wheel', this._wheelEvent);
  }

  down() {
    var interactive = this.canvas.interactive;

    interactive.off('drag', this._dragEvent);
    interactive.off('wheel', this._wheelEvent);
  }

  create() {
    this._wheelEvent = function (delta) {
      camera.position.z += delta / 100;
    };

    this._dragEvent = function (point, delta, unproject, e) {
      if (e.button === 0) {

        var dx = -delta.x / 500;
        var dy = -delta.y / 500;
        var r = Math.sqrt(dx * dx + dy * dy);

        var dq = new LiThree.Math.Quaternion(1, 0, 0, 0);
        var cq = camera.rotation;

        var rs = Math.sin(r * Math.PI) / r;
        dq.x = Math.cos(r * Math.PI);
        dq.y = 0;
        dq.z = rs * dx;
        dq.w = -rs * dy;


        camera.rotation = new LiThree.Math.Quaternion(1, 0, 0, 0);

        camera.rotation.multiply(dq);
        camera.rotation.multiply(cq);

        camera.getMatrix();

      } else if (e.button === 2) {
        e.preventDefault();
        camera.position.x += -delta.x / 100;
        camera.position.y += delta.y / 100;
      }
    };

    this.up();
  }

}