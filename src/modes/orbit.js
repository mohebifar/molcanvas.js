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
    var canvas = this.canvas,
      camera = canvas.renderer.camera;

    this._wheelEvent = function (delta) {
      camera.position.z += delta / 100;
    };

    this._dragEvent = function (point, delta, unproject, e) {
      if (e.button === 0) {
        var dx = -delta.x / 400,
          dy = -delta.y / 400;

        canvas.orbitHelper.rotate(dx, dy);
      } else if (e.button === 2) {
        e.preventDefault();
        camera.position.x += -delta.x / 100;
        camera.position.y += delta.y / 100;
      }
    };

    this.up();
  }


}