import BaseDisplay from '_base.js';

var BAS_KEY = 'ball-and-stick';

export default
class BallAndStick extends BaseDisplay {

  constructor(canvas) {
    this.light = false;
    super(canvas);
  }

  drawLight() {
    var light = new LiThree.Light.Point();

    light.position.x = -30;
    light.position.z = -60;
    light.position.y = -30;

    this.light = light;
  }

  drawAtom(atom) {
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

    if(! beginD || ! endD) {
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
      let cylinder = LiThree.ObjectFactory.Cylinder(distance, d, d);
      cylinder.material.color = beginC;
      this._programCylinderShader(cylinder, endC);
      elements.cylinders.push(cylinder);

      world.add(cylinder);
    }

    for(var j in elements.cylinders) {
      let cylinder = elements.cylinders[j];

      cylinder.rotation = rotation;
      cylinder.position.copy(middle);
      cylinder.position.y += j * 0.2 - c;
    }

  }

  _programCylinderShader(cylinder, endC) {
    renderer.initShape(cylinder);

    cylinder.shader.fragmentProgram.clear();

    cylinder.shader.fragmentProgram.code(`vec3 effectiveColor = halfColor > 0.5 ? vColor : %c2; gl_FragColor = vec4(%lw + effectiveColor, 1.0);`, {
      c2: cylinder.shader.fragmentProgram.uniform('vec3', function () {
        this.value(endC.toArray());
      }),
      hc: cylinder.shader.fragmentProgram.varying('float', 'halfColor'),
      lw: 'lightWeight'
    });

    cylinder.shader.vertexProgram.code(`%hc = %vp.x < 0.5 ? 1.0 : 0.0;`, {
      lw: 'lightWeight',
      vp: 'vPosition',
      hc: cylinder.shader.vertexProgram.varying('float', 'halfColor')
    });

    cylinder.shader.create();
  }

  create() {
    this.drawLight();
    this.up();
  }

  up() {
    var world = renderer.world;

    world.add(this.light);
  }

  down() {
    var world = renderer.world;

    world.remove(this.light);
  }

}