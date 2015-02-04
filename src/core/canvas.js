export default
class Canvas {

  constructor(renderer) {
    this.renderer = renderer;
    renderer.world = new LiThree.World();
    this.atoms = [];
    this._display = false;
    this._displays = [];

    this._mode = false;
    this._modes = [];

    this._attachInteractive();
  }

  attach(molecule) {

    var i;

    for (i in molecule.atoms) {
      let atom = molecule.atoms[i];
      this.addAtom(atom);
    }


  }

  addAtom(atom) {
    this.atoms.push(atom);
    var i;

    atom.on('bond', function (bond) {

    });

    this._display.drawAtom(atom);

    for (i in atom.bonds) {
      let bond = atom.bonds[i];
      this._display.drawBond(bond);
    }
  }

  setMode(mode) {

    for (var i in this._modes) {
      let _mode = this._modes[i];

      if (_mode instanceof mode) {
        this._mode = _mode;
        this._mode.up();
        return;
      }
    }

    this._mode = new mode(this);
    this._mode.create();
    this._modes.push(this._mode);
  }

  setDisplay(display) {
    for (var i in this._displays) {
      let _display = this._displays[i];

      if (_display instanceof display) {
        this._display = _display;
        this._display.up();
        return;
      }
    }

    this._display = new display(this);
    this._display.create();
    this._displays.push(this._display);
  }

  _attachInteractive() {
    var renderer = this.renderer;
    var interactive = new LiThree.Interactive(renderer);

    this.interactive = interactive;
  }

  show() {
    this.renderer.draw();
    var _this = this;

    requestAnimationFrame(function () {
      _this.show();
    });
  }

}