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
    this._display = false;
    this._displays = [];

    this._mode = false;
    this._modes = [];

    this._attachInteractive();
  }

  _prototypeProperties(Canvas, null, {
    attach: {
      value: function attach(molecule) {
        var i;

        for (i in molecule.atoms) {
          var atom = molecule.atoms[i];
          this.addAtom(atom);
        }

      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addAtom: {
      value: function addAtom(atom) {
        this.atoms.push(atom);
        var i;

        atom.on("bond", function (bond) {});

        this._display.drawAtom(atom);

        for (i in atom.bonds) {
          var bond = atom.bonds[i];
          this._display.drawBond(bond);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setMode: {
      value: function setMode(mode) {
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
    _attachInteractive: {
      value: function AttachInteractive() {
        var renderer = this.renderer;
        var interactive = new LiThree.Interactive(renderer);

        this.interactive = interactive;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    show: {
      value: function show() {
        this.renderer.draw();
        var _this = this;

        requestAnimationFrame(function () {
          _this.show();
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Canvas;
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
        var light2 = new LiThree.Light.Point();

        light2.position.x = 30;
        light2.position.z = 60;
        light2.position.y = 30;

        var light1 = new LiThree.Light.Point();

        light1.position.x = -30;
        light1.position.z = -60;
        light1.position.y = -30;

        this.lights = [light1, light2];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    drawAtom: {
      value: function drawAtom(atom) {
        var renderer = this.canvas.renderer,
            world = renderer.world;

        var position = atom.position;

        var radius = Math.exp(-Math.pow(atom.element.atomicRadius - 91, 2) / 500) * atom.element.atomicRadius / 100;

        var sphere = LiThree.ObjectFactory.Sphere(radius, 50, 50);

        //sphere.drawingMode = LiThree.Common.drawingMode.LINES;
        sphere.position.copy(position);
        sphere.position.multiply(2);

        sphere.material.color.hex = atom.element.color;

        world.add(sphere);

        var elements = {
          sphere: sphere,
          position: sphere.position,
          color: sphere.material.color,
          radius: radius
        };

        atom.setData(BAS_KEY, elements);
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
            d = 0.1;

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
          cylinder.position.y += j * 0.2 - c;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _programCylinderShader: {
      value: function ProgramCylinderShader(cylinder, endC) {
        renderer.initShape(cylinder);

        cylinder.shader.fragmentProgram.clear();

        cylinder.shader.fragmentProgram.code("vec3 effectiveColor = halfColor > 0.5 ? vColor : %c2; gl_FragColor = vec4(%lw + effectiveColor, 1.0);", {
          c2: cylinder.shader.fragmentProgram.uniform("vec3", function () {
            this.value(endC.toArray());
          }),
          hc: cylinder.shader.fragmentProgram.varying("float", "halfColor"),
          lw: "lightWeight"
        });

        cylinder.shader.vertexProgram.code("%hc = %vp.x < 0.5 ? 1.0 : 0.0;", {
          lw: "lightWeight",
          vp: "vPosition",
          hc: cylinder.shader.vertexProgram.varying("float", "halfColor")
        });

        cylinder.shader.create();
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

var OrbitMode = (function () {
  function OrbitMode(canvas) {
    this.canvas = canvas;
  }

  _prototypeProperties(OrbitMode, null, {
    up: {
      value: function up() {
        var interactive = this.canvas.interactive;

        interactive.on("drag", this._dragEvent);
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
        interactive.off("wheel", this._wheelEvent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
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
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitMode;
})();

//
root.ChemCanvas = {
  Canvas: Canvas,
  Display: {
    BallAndStick: BallAndStick
  },
  Mode: {
    Orbit: OrbitMode
  }
};
})
(this);
//# sourceMappingURL=chemcanvas.js.map