export default
class Canvas {

  constructor(renderer) {
    this.renderer = renderer;
    renderer.world = new LiThree.World();
    this.atoms = [];
    this.bonds = [];
    this._display = false;
    this._displays = [];

    this._mode = false;
    this._modes = [];

    this._data = {};

    this.orbitHelper = new OrbitHelper(this);

    this._attachInteractive();
  }

  attach(molecule) {

    var _this = this, i, j = 0, count = molecule.atoms.length;

    for (i in molecule.atoms) {
      let atom = molecule.atoms[i];

      this.addAtom(atom, function () {

        if (++j === count) {
          for (var i in molecule.atoms) {
            let atom = molecule.atoms[i];

            for (var k in atom.bonds) {
              _this.addBond(atom.bonds[k]);
            }

          }
        }
      }, false);
    }

  }

  clear() {
    var atoms = this.atoms.slice(0, this.atoms.length);

    for (var i in atoms) {
      this.removeAtom(atoms[i]);
    }
  }

  addAtom(atom, callback = false, drawBonds = true) {
    this.atoms.push(atom);
    var i,
      _this = this;

    atom.on('bond', function () {
      // TODO: draw cylinder dynamically
    });

    atom.on('delete', function () {
      for (var i in _this._displays) {
        let _display = _this._displays[i];
        _display.removeAtom(atom);
      }

      _this.atoms.splice(_this.atoms.indexOf(atom), 1);
    });

    setTimeout(function () {
      _this._display.drawAtom(atom, callback);
    }, 0);

    if (drawBonds) {
      for (i in atom.bonds) {
        _this.addBond(atom.bonds[i]);
      }
    }
  }

  removeAtom(atom) {
    atom.emit('delete');
  }

  addBond(bond) {
    var _this = this;

    _this.bonds.push(bond);

    bond.on('delete', function () {
      for (var i in _this._displays) {
        let _display = _this._displays[i];
        _display.removeBond(bond);
      }

      _this.bonds.splice(_this.bonds.indexOf(bond), 1);
    });


    setTimeout(function () {
      _this._display.drawBond(bond)
    }, 0);
  }

  removeBond(bond) {
    bond.emit('delete');
  }

  setMode(mode) {
    if (this._mode) {
      this._mode.down();
    }

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
    if (this._display) {
      this._display.down();
    }

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

  unsetData(key) {
    delete this._data[key];
  }

  setData(key, value = true) {
    this._data[key] = value;
  }

  getData(key) {
    return this._data[key];
  }

  hasData(key) {
    return typeof this._data[key] !== 'undefined';
  }

  show() {
    this.renderer.draw();
    var _this = this;

    if (this.getData('tween') && TWEEN) {
      TWEEN.update();
    }

    requestAnimationFrame(function () {
      _this.show();
    });
  }

  _attachInteractive() {
    var renderer = this.renderer;
    var interactive = new LiThree.Interactive(renderer);

    this.interactive = interactive;
  }

}