(function(root) {
"use strict";

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Canvas = (function () {
  function Canvas(renderer) {
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

  _prototypeProperties(Canvas, null, {
    attach: {
      value: function attach(molecule) {
        var _this2 = this;


        var _this = this,
            i,
            j = 0,
            count = molecule.atoms.length;

        for (i in molecule.atoms) {
          (function () {
            var atom = molecule.atoms[i];

            _this2.addAtom(atom, function () {
              if (++j === count) {
                for (var i in molecule.atoms) {
                  var _atom = molecule.atoms[i];

                  for (var k in _atom.bonds) {
                    _this.addBond(_atom.bonds[k]);
                  }
                }
              }
            }, false);
          })();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    clear: {
      value: function clear() {
        var atoms = this.atoms.slice(0, this.atoms.length);

        for (var i in atoms) {
          this.removeAtom(atoms[i]);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addAtom: {
      value: function addAtom(atom) {
        var callback = arguments[1] === undefined ? false : arguments[1];
        var drawBonds = arguments[2] === undefined ? true : arguments[2];
        this.atoms.push(atom);
        var i,
            _this = this;

        atom.on("bond", function () {});

        atom.on("delete", function () {
          for (var i in _this._displays) {
            var _display = _this._displays[i];
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeAtom: {
      value: function removeAtom(atom) {
        atom.emit("delete");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addBond: {
      value: function addBond(bond) {
        var _this = this;

        _this.bonds.push(bond);

        bond.on("delete", function () {
          for (var i in _this._displays) {
            var _display = _this._displays[i];
            _display.removeBond(bond);
          }

          _this.bonds.splice(_this.bonds.indexOf(bond), 1);
        });


        setTimeout(function () {
          _this._display.drawBond(bond);
        }, 0);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeBond: {
      value: function removeBond(bond) {
        bond.emit("delete");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setMode: {
      value: function setMode(mode) {
        if (this._mode) {
          this._mode.down();
        }

        for (var i in this._modes) {
          var _mode = this._modes[i];

          if (_mode instanceof mode) {
            this._mode = _mode;
            this._mode.up();
            return;
          }
        }

        this._mode = new mode(this);
        this._mode.create();
        this._modes.push(this._mode);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setDisplay: {
      value: function setDisplay(display) {
        if (this._display) {
          this._display.down();
        }

        for (var i in this._displays) {
          var _display = this._displays[i];

          if (_display instanceof display) {
            this._display = _display;
            this._display.up();
            return;
          }
        }

        this._display = new display(this);
        this._display.create();
        this._displays.push(this._display);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    unsetData: {
      value: function unsetData(key) {
        delete this._data[key];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setData: {
      value: function setData(key) {
        var value = arguments[1] === undefined ? true : arguments[1];
        this._data[key] = value;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getData: {
      value: function getData(key) {
        return this._data[key];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasData: {
      value: function hasData(key) {
        return typeof this._data[key] !== "undefined";
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    show: {
      value: function show() {
        this.renderer.draw();
        var _this = this;

        if (this.getData("tween") && TWEEN) {
          TWEEN.update();
        }

        requestAnimationFrame(function () {
          _this.show();
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _attachInteractive: {
      value: function AttachInteractive() {
        var renderer = this.renderer;
        var interactive = new LiThree.Interactive(renderer);

        this.interactive = interactive;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Canvas;
})();

var OrbitHelper = (function () {
  function OrbitHelper(canvas) {
    this.canvas = canvas;

    this.quaternion = new LiThree.Math.Quaternion();
    this.matrix = null;

    this.origin = new LiThree.Math.Vector3();
    this.speed = 1;

    canvas.renderer.camera.position.z = -10;

    this._getMatrix();
  }

  _prototypeProperties(OrbitHelper, null, {
    rotate: {
      value: function rotate(dx, dy) {
        dx *= this.speed;
        dy *= this.speed;

        var r = Math.sqrt(dx * dx + dy * dy),
            dq = new LiThree.Math.Quaternion(1, 0, 0, 0),
            cq = this.quaternion,
            rs = Math.sin(r * Math.PI) / r;

        if (r < 0.000001) {
          return;
        }

        dq.x = Math.cos(r * Math.PI);
        dq.y = 0;
        dq.z = rs * dx;
        dq.w = -rs * dy;

        this.quaternion = new LiThree.Math.Quaternion(1, 0, 0, 0);
        this.quaternion.multiply(dq);
        this.quaternion.multiply(cq);

        this._getMatrix();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    distance: {
      value: function distance(delta) {
        var canvas = this.canvas,
            camera = canvas.renderer.camera;

        delta *= this.speed / 50;

        if (canvas.getData("tween")) {
          var z = camera.position.z + delta;
          new TWEEN.Tween(camera.position).to({ z: z }, 200).easing(TWEEN.Easing.Cubic.Out).start();
        } else {
          camera.position.z += delta / 2;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getMatrix: {
      value: function GetMatrix() {
        this.matrix = LiThree.Math.Matrix4.fromRotationTranslationScaleOrigin(this.quaternion, this.origin, new LiThree.Math.Vector3(1, 1, 1), this.origin);
        return this.matrix;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitHelper;
})();

var BaseDisplay = (function () {
  function BaseDisplay(canvas) {
    this.canvas = canvas;
    this._atoms = [];
  }

  _prototypeProperties(BaseDisplay, null, {
    drawAll: {
      value: function drawAll() {},
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return BaseDisplay;
})();

var BAS_KEY = "ball-and-stick";

var BallAndStick = (function (BaseDisplay) {
  function BallAndStick(canvas) {
    this.lights = [];
    _get(Object.getPrototypeOf(BallAndStick.prototype), "constructor", this).call(this, canvas);
  }

  _inherits(BallAndStick, BaseDisplay);

  _prototypeProperties(BallAndStick, null, {
    drawLight: {
      value: function drawLight() {
        var light = new LiThree.Light.Point();

        light.specularColor.rgb(0.2, 0.2, 0.2);
        light.position.x = -30;
        light.position.z = -60;
        light.position.y = -30;

        this.lights = [light];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    drawAtom: {
      value: function drawAtom(atom, callback) {
        var canvas = this.canvas,
            renderer = canvas.renderer,
            world = renderer.world;

        var position = atom.position;

        var radius = Math.exp(-Math.pow(atom.element.atomicRadius - 91, 2) / 500) * atom.element.atomicRadius / 200;

        var sphere = LiThree.ObjectFactory.Sphere(radius, 20, 20);

        //sphere.drawingMode = LiThree.Common.drawingMode.LINES;
        sphere.position.copy(position);

        sphere.material.shininess = 10;
        sphere.material.color.hex = atom.element.color;

        world.add(sphere);

        renderer.initShape(sphere);
        this._orbitShader(sphere);
        sphere.shader.create();

        var elements = {
          sphere: sphere,
          position: sphere.position,
          color: sphere.material.color,
          radius: radius
        };

        atom.setData(BAS_KEY, elements);

        if (canvas.getData("tween")) {
          sphere.scale.set(0, 0, 0);

          new TWEEN.Tween(sphere.scale).to({ x: 1, y: 1, z: 1 }, 500).easing(TWEEN.Easing.Elastic.Out).start();
        }

        if (callback) {
          callback(null, atom);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeAtom: {
      value: function removeAtom(atom) {
        var canvas = this.canvas,
            renderer = canvas.renderer,
            world = renderer.world,
            data = atom.getData(BAS_KEY);

        if (data) {
          world.remove(data.sphere);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    drawBond: {
      value: function drawBond(bond) {
        var elements;

        if (bond.hasData(BAS_KEY)) {
          elements = bond.getData(BAS_KEY);
          return;
        } else {
          elements = {
            cylinders: []
          };
          bond.setData(BAS_KEY, elements);
        }

        var renderer = this.canvas.renderer,
            world = renderer.world,
            begin = bond.begin,
            end = bond.end,
            beginD = begin.getData(BAS_KEY),
            endD = end.getData(BAS_KEY);

        if (!beginD || !endD) {
          return;
        }

        var beginP = beginD.position,
            endP = endD.position,
            beginC = beginD.color,
            endC = endD.color,
            distance = beginP.distance(endP),
            middle = beginP.clone().add(endP).divide(2),
            deltaX = endP.x - beginP.x,
            deltaY = endP.y - beginP.y,
            deltaZ = endP.z - beginP.z,
            d = 0.06;

        var rotation = new LiThree.Math.Quaternion();
        rotation.rotateZ(Math.atan2(deltaY, deltaX));
        rotation.rotateY(-Math.asin(deltaZ / distance));

        var c = (bond.order - 1) * d;

        for (var i = 0; i < bond.order; i++) {
          var cylinder = LiThree.ObjectFactory.Cylinder(distance, d, d);
          cylinder.material.color = beginC;
          this._programCylinderShader(cylinder, endC);
          elements.cylinders.push(cylinder);

          world.add(cylinder);
        }

        for (var j in elements.cylinders) {
          var cylinder = elements.cylinders[j];

          cylinder.rotation = rotation;
          cylinder.position.copy(middle);
          cylinder.position.y += j * d * 2.1 - c;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeBond: {
      value: function removeBond(bond) {
        var canvas = this.canvas,
            renderer = canvas.renderer,
            world = renderer.world,
            data = bond.getData(BAS_KEY);

        if (data) {
          for (var i in data.cylinders) {
            world.remove(data.cylinders[i]);
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _programCylinderShader: {
      value: function ProgramCylinderShader(cylinder, endC) {
        renderer.initShape(cylinder);

        var fragmentProgram = cylinder.shader.fragmentProgram,
            vertexProgram = cylinder.shader.vertexProgram;

        this._orbitShader(cylinder);

        fragmentProgram.clear();

        fragmentProgram.code("vec3 effectiveColor = halfColor > 0.5 ? vColor : %c2; gl_FragColor = vec4(%lw + effectiveColor, 1.0);", {
          c2: fragmentProgram.uniform("vec3", function () {
            this.value(endC.toArray());
          }),
          hc: fragmentProgram.varying("float", "halfColor"),
          lw: "lightWeight"
        });

        vertexProgram.code("%hc = %vp.x < 0.5 ? 1.0 : 0.0;", {
          lw: "lightWeight",
          vp: "vPosition",
          hc: vertexProgram.varying("float", "halfColor")
        });

        cylinder.shader.create();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _orbitShader: {
      value: function OrbitShader(object) {
        var vertexProgram = object.shader.vertexProgram,
            orbitHelper = this.canvas.orbitHelper;

        vertexProgram.clear();
        vertexProgram.code("mat4 mvMatrix = %vm * %om * %mm;\ngl_Position = %p * mvMatrix  * vec4(%vp, 1.0);", {
          p: "pMatrix",
          vm: "vMatrix",
          mm: "mMatrix",
          vp: "vPosition",
          om: vertexProgram.uniform("mat4", function () {
            this.value(orbitHelper.matrix);
          })
        });
        object.shader.initLighting();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
        this.drawLight();
        this.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    up: {
      value: function up() {
        var world = renderer.world;

        for (var i in this.lights) {
          world.add(this.lights[i]);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        var world = renderer.world;

        for (var i in this.lights) {
          world.remove(this.lights[i]);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return BallAndStick;
})(BaseDisplay);

var EditorMode = (function () {
  function EditorMode(canvas) {
    this.canvas = canvas;
  }

  _prototypeProperties(EditorMode, null, {
    up: {
      value: function up() {
        var interactive = this.canvas.interactive;

        interactive.on("drag", this._dragEvent);
        interactive.on("click", this._clickEvent);
        interactive.on("tap", this._clickEvent);
        interactive.on("wheel", this._wheelEvent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        var interactive = this.canvas.interactive;

        interactive.off("drag", this._dragEvent);
        interactive.off("click", this._clickEvent);
        interactive.off("wheel", this._wheelEvent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
        var canvas = this.canvas,
            camera = canvas.renderer.camera,
            orbitHelper = canvas.orbitHelper;

        this._wheelEvent = function (delta) {
          orbitHelper.distance(delta);
        };


        this._clickEvent = function (point, unproject, e) {
          var pos = unproject(0);
          pos.unproject(orbitHelper.matrix.clone());
          var atom = new Chem.Atom();
          atom.position = pos;

          atom.atomicNumber = 6;

          var ray = LiThree.Math.Ray.fromPoints(camera.position, unproject(0));
          var caster = new LiThree.RayCaster(ray);
          var resu = caster.intersectTriangle(new LiThree.Math.Vector3(-1, -1, 0), new LiThree.Math.Vector3(-1, 1, 0), new LiThree.Math.Vector3(1, 0, 0));

          console.log(resu);
          canvas.addAtom(atom);
        };

        this._dragEvent = function (point, delta, unproject, e) {
          var position = unproject(0.5);

          if (e.button === 0) {} else if (e.button === 2) {}
        };

        this.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return EditorMode;
})();

var OrbitMode = (function () {
  function OrbitMode(canvas) {
    this.canvas = canvas;
  }

  _prototypeProperties(OrbitMode, null, {
    up: {
      value: function up() {
        var interactive = this.canvas.interactive;

        interactive.on("drag", this._dragEvent);
        interactive.on("touchmove", this._dragEvent);
        interactive.on("wheel", this._wheelEvent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        var interactive = this.canvas.interactive;

        interactive.off("drag", this._dragEvent);
        interactive.off("touchmove", this._dragEvent);
        interactive.off("wheel", this._wheelEvent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
        var canvas = this.canvas,
            camera = canvas.renderer.camera,
            orbitHelper = canvas.orbitHelper;

        this._wheelEvent = function (delta) {
          orbitHelper.distance(delta);
        };

        this._dragEvent = function (point, delta, unproject, e) {
          if (e instanceof TouchEvent || e.button === 0) {
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitMode;
})();

// TODO: draw cylinder dynamically
//
root.MolCanvas = {
  Canvas: Canvas,
  Display: {
    BallAndStick: BallAndStick
  },
  Mode: {
    Orbit: OrbitMode,
    Editor: EditorMode
  }
};
})
(this);
//# sourceMappingURL=molcanvas.js.map