import BaseDisplay from '_base.js';

var BAS_KEY = 'ball-and-stick';

export default
class BallAndStick extends BaseDisplay {

  constructor(canvas) {
    this.lights = [];
    super(canvas);
  }

  drawLight() {

    var light = new LiThree.Light.Point();

    light.specularColor.rgb(0.2, 0.2, 0.2);
    light.position.x = -30;
    light.position.z = -60;
    light.position.y = -30;

    this.lights = [light];
  }

  drawAtom(atom) {
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

    if (canvas.getData('tween')) {
      sphere.scale.set(0, 0, 0);

      new TWEEN.Tween(sphere.scale)
        .to({x: 1, y: 1, z: 1}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
    }
  }

  drawBond(bond) {
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
      d = 0.06;

    var rotation = new LiThree.Math.Quaternion();
    rotation.rotateZ(Math.atan2(deltaY, deltaX));
    rotation.rotateY(-Math.asin(deltaZ / distance));

    var c = (bond.order - 1) * d;

    for (var i = 0; i < bond.order; i++) {
      let cylinder = LiThree.ObjectFactory.Cylinder(distance, d, d);
      cylinder.material.color = beginC;
      this._programCylinderShader(cylinder, endC);
      elements.cylinders.push(cylinder);

      world.add(cylinder);
    }

    for (var j in elements.cylinders) {
      let cylinder = elements.cylinders[j];

      cylinder.rotation = rotation;
      cylinder.position.copy(middle);
      cylinder.position.y += j * d * 2.1 - c;
    }

  }

  _programCylinderShader(cylinder, endC) {
    renderer.initShape(cylinder);

    var fragmentProgram = cylinder.shader.fragmentProgram,
      vertexProgram = cylinder.shader.vertexProgram;

    this._orbitShader(cylinder);

    fragmentProgram.clear();

    fragmentProgram.code(`vec3 effectiveColor = halfColor > 0.5 ? vColor : %c2; gl_FragColor = vec4(%lw + effectiveColor, 1.0);`, {
      c2: fragmentProgram.uniform('vec3', function () {
        this.value(endC.toArray());
      }),
      hc: fragmentProgram.varying('float', 'halfColor'),
      lw: 'lightWeight'
    });

    vertexProgram.code(`%hc = %vp.x < 0.5 ? 1.0 : 0.0;`, {
      lw: 'lightWeight',
      vp: 'vPosition',
      hc: vertexProgram.varying('float', 'halfColor')
    });

    cylinder.shader.create();
  }

  _orbitShader(object) {
    var
      vertexProgram = object.shader.vertexProgram,
      orbitHelper = this.canvas.orbitHelper;

    vertexProgram.clear();
    vertexProgram.code('mat4 mvMatrix = %vm * %om * %mm;\ngl_Position = %p * mvMatrix  * vec4(%vp, 1.0);', {
      p: 'pMatrix',
      vm: 'vMatrix',
      mm: 'mMatrix',
      vp: 'vPosition',
      om: vertexProgram.uniform('mat4', function () {
        this.value(orbitHelper.matrix);
      })
    });
    object.shader.initLighting();
  }

  create() {
    this.drawLight();
    this.up();
  }

  up() {
    var world = renderer.world;

    for (var i in this.lights) {
      world.add(this.lights[i]);
    }
  }

  down() {
    var world = renderer.world;

    for (var i in this.lights) {
      world.remove(this.lights[i]);
    }

  }

}