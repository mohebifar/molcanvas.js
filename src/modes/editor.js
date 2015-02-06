export default
class EditorMode {

  constructor(canvas) {
    this.canvas = canvas;
  }

  up() {
    var interactive = this.canvas.interactive;

    interactive.on('drag', this._dragEvent);
    interactive.on('click', this._clickEvent);
    interactive.on('wheel', this._wheelEvent);
  }

  down() {
    var interactive = this.canvas.interactive;

    interactive.off('drag', this._dragEvent);
    interactive.off('click', this._clickEvent);
    interactive.off('wheel', this._wheelEvent);
  }

  create() {
    var canvas = this.canvas,
      camera = canvas.renderer.camera;

    this._wheelEvent = function (delta) {
      if (canvas.getData('tween')) {
        var z = camera.position.z + delta / 50;
        new TWEEN.Tween(camera.position)
          .to({z: z}, 200)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      } else {
        camera.position.z += delta / 100;
      }
    };


    this._clickEvent = function (point, unproject, e) {
      var pos = unproject(0);
      pos.unproject(canvas.orbitHelper.matrix.clone());
      var atom = new Chem.Atom();
      atom.position = pos;

      atom.atomicNumber = 6;

      var ray = LiThree.Math.Ray.fromPoints(camera.position, unproject(0));
      var resu = ray.intersectTriangle(
        new LiThree.Math.Vector3(-1, -1, 0),
        new LiThree.Math.Vector3(-1, 1, 0),
        new LiThree.Math.Vector3(1, 0, 0));

      canvas.addAtom(atom);
    };

    this._dragEvent = function (point, delta, unproject, e) {
      var position = unproject(0.5);

      if (e.button === 0) {

      } else if (e.button === 2) {

      }

    };

    this.up();
  }

}