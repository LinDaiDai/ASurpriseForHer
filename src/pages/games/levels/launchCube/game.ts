import * as CANNON from 'cannon';
window.CANNON = CANNON;
import {
  Color3,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  FreeCamera,
  CannonJSPlugin,
  PhysicsImpostor,
  PointerEventTypes,
  DynamicTexture, StandardMaterial,
} from '@babylonjs/core';
import { TOWERS } from './constants';
import { GameBase, IGameProps } from '../../gameBase';
import { GridMaterial } from '@babylonjs/materials';

class LaunchCubeGame extends GameBase {
  private _towerMeshes: Mesh[] = [];

  constructor(props: IGameProps) {
    super(props);
    this.initScene();
  }

  public initScene() {
    const scene = this.scene;
    const gravityVector = new Vector3(0, -9.8, 0);
    const physicsPlugin = new CannonJSPlugin();
    this.scene.enablePhysics(gravityVector, physicsPlugin);

    const camera = new FreeCamera("camera1", new Vector3(-6, 10, 0), scene);
    camera.setTarget(new Vector3(0, 10, 400));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const environment = scene.createDefaultEnvironment({ createGround: false, skyboxSize: 1000 });
    environment && environment.setMainColor(Color3.FromHexString("#74b9ff"));

    const ground = MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.8, restitution: 0.5, disableBidirectionalTransformation: true }, scene);
    ground.checkCollisions = true;
    // 网格材质
    ground.material = new GridMaterial("mat", scene);

    this._createTowers();
    this._bindPointerEvents();
  };

  private _createTowers() {
    for (let x = 0; x < TOWERS.length; x++) {
      for (let z = 0; z < TOWERS[x].length; z++) {
        const text = TOWERS[x][z];

        const material = this._createTextMaterial(text);
        const box = MeshBuilder.CreateBox("towerBox", { size: 2 }, this.scene);
        box.position.x = (x - 4) * 6;
        box.position.y = 2 + z * 2;
        box.position.z = 40;
        material && (box.material = material);
        box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor,
          { mass: 2, friction: 5, restitution: 0 }, this.scene);
        this._towerMeshes.push(box);
      }
    }
  }

  private _createTextMaterial(text?: string) {
    if (!text) {
      return;
    }
    // 创建一个动态纹理
    const texture = new DynamicTexture("dynamic texture", {width:512, height:256}, this.scene); 
    const material = new StandardMaterial("Mat", this.scene);
    // // 将动态纹理应用到材质上
    material.diffuseTexture = texture;

    // 在纹理上绘制红色背景
    const ctx = texture.getContext();
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, texture.getSize().width, texture.getSize().height);
    // material.diffuseColor = new Color3(1, 0, 0);

    // 在纹理上绘制文字
    ctx.font = "bold 90px fantasy";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, texture.getSize().width / 2, texture.getSize().height / 2);
    texture.update();

    return material;
  }

  private _bindPointerEvents() {
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERPICK) {

        const bullet = MeshBuilder.CreateSphere('bullet', { diameter: 0.2 });
        const ray = event.pickInfo?.ray;
        console.log(ray);
        if (!ray) return;
        ray.direction.scaleInPlace(0.2);
        bullet.position.copyFrom(ray.origin);
        bullet.position.addInPlace(ray.direction);
        bullet.physicsImpostor = new PhysicsImpostor(bullet, PhysicsImpostor.SphereImpostor, { mass: 3 });
        bullet.physicsImpostor.setLinearVelocity(ray.direction.scale(400));
      }
    });
  }
}

export { LaunchCubeGame };
