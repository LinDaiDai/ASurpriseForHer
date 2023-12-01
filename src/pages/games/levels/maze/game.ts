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
  FreeCamera,
} from '@babylonjs/core';

import { BrickProceduralTexture, RoadProceduralTexture } from '@babylonjs/procedural-textures';


interface IProps {
	canvas: HTMLCanvasElement;
}

class MazeGame {
  private _canvas!: HTMLCanvasElement;

  public init(props: IProps) {
    const { canvas } = props;
    this._canvas = canvas;
		const engine = new Engine(canvas, true);
		const scene = this.createScene(engine);
		engine.runRenderLoop(function () {
			scene.render();
		});
		window.addEventListener("resize", function () {
			engine.resize();
		});
  }
  
  createScene(engine: Engine) {
    const scene = new Scene(engine);

    const bgColor = Color3.FromHexString('#101230');
    scene.clearColor = bgColor.toColor4(1);
    scene.ambientColor = bgColor;

    // 雾化
    scene.fogMode = Scene.FOGMODE_LINEAR;
		scene.fogColor = bgColor;
		scene.fogDensity = 0.3;
		scene.fogStart = 10.0;
    scene.fogEnd = 70.0;
    
    scene.gravity = new Vector3(0, -0.9, 0);
    // scene.collisionsEnabled = true;

    const camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 30, new Vector3(0, 3, 0), scene);
    // camera.attachControl(this._canvas, true);

    // 点光源
    const torch = new PointLight("light1",new Vector3(10, 1, 20), scene);
    torch.intensity = 0.7;
    torch.diffuse = Color3.FromHexString('#ff9944');

    const shadowGenerator = new ShadowGenerator(1024, torch);
    shadowGenerator.setDarkness(0.2);
    // shadowGenerator.useBlurVarianceShadowMap = true;
    // shadowGenerator.blurBoxOffset = 1.0;
		// shadowGenerator.blurScale = 20.0;

    const sky = new HemisphericLight("sky", new Vector3(0, 1.0, 0), scene);
		sky.intensity = 0.5;
    sky.diffuse = bgColor;

    // 砖块纹理
    const brickTexture = new BrickProceduralTexture("brick", 512, scene);
    brickTexture.numberOfBricksHeight = 5;
    brickTexture.numberOfBricksWidth = 5;
    // 墙壁
    const wallMat = new StandardMaterial("wallMat", scene);
    wallMat.diffuseTexture = brickTexture;
    
    // 地板纹理
    const roadTexture = new RoadProceduralTexture("road", 512, scene);
    // 地板材质
    const groundMat = new StandardMaterial("gmat", scene);
    groundMat.diffuseTexture = roadTexture;
    groundMat.specularPower = 5;

    // 地板
    const ground = MeshBuilder.CreatePlane("g", { size: 120 }, scene);
    ground.position = new Vector3(0, 0, 0);
    ground.rotation.x = Math.PI / 2;
    ground.material = groundMat;
		ground.receiveShadows = true;
    ground.checkCollisions = true;

    // 墙壁
    // for (var i = 0; i < 100; i++) {
    //   var px = Math.random() * 100 - 50;
    //   var pz = Math.random() * 100 - 50;
      
    // }
    const wall = MeshBuilder.CreateBox("w", { size: 3 }, scene);
    wall.position = new Vector3(0, 1.5, 5);

    wall.material = wallMat;
    wall.checkCollisions = true;

    shadowGenerator.getShadowMap()?.renderList?.push(wall);

    
    return scene;
  }
}

export { MazeGame };
