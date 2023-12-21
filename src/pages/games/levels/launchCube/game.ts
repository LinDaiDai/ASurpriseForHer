import {
  Scene,
  Color3,
  Vector3,
  ArcRotateCamera,
  PointLight,
  HemisphericLight,
  ShadowGenerator,
  StandardMaterial,
  MeshBuilder,
  CreateSphere,
	Engine,
  Axis,
  Mesh,
  FreeCamera,
  CannonJSPlugin,
  PhysicsImpostor,
} from '@babylonjs/core';
import { GameBase, IGameProps } from '../../gameBase';
// 导入 GridMaterial
import { GridMaterial } from '@babylonjs/materials';

class LaunchCubeGame extends GameBase {
  constructor(props: IGameProps) {
    super(props);
    this.initScene();
  }

  public initScene() {
    const scene = this.scene;
    const gravityVector = new Vector3(0, -9.8, 0);
    // const physicsPlugin = new CannonJSPlugin();
    // this.scene.enablePhysics(gravityVector);

    const camera = new FreeCamera("camera1", new Vector3(0, 10, 80), scene);
    camera.setTarget(new Vector3(0, 10, 400));
    camera.attachControl(this.canvas, true);

    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const environment = scene.createDefaultEnvironment({ createGround: false, skyboxSize: 1000 });
    environment && environment.setMainColor(Color3.FromHexString("#74b9ff"));

    var ground = MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.8, restitution: 0.5, disableBidirectionalTransformation: true }, scene);
    ground.checkCollisions = true;
    // 网格材质
    ground.material = new GridMaterial("mat", scene);
  };
}

export { LaunchCubeGame };
