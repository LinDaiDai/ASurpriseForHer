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
} from '@babylonjs/core';

import { BrickProceduralTexture, RoadProceduralTexture } from '@babylonjs/procedural-textures';


interface IProps {
	canvas: HTMLCanvasElement;
}


interface IPlayer extends Mesh {
  speed: Vector3;
  nextspeed: Vector3;
  nexttorch: Vector3;
}

class MazeGame {
  private _canvas!: HTMLCanvasElement;
  private _scene!: Scene;
  private _camera!: ArcRotateCamera;
  private _shadowGenerator!: ShadowGenerator;
  private _player!: IPlayer;
  private _keyCodeMap: { [key: string]: boolean } = {};
  private _torch!: PointLight;
  private _lightImpostor!: Mesh;
  private _dots: Mesh[] = [];
  private _score: number = 0;
  private _onScoreChange: (score: number) => void = () => {};

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

  public registerScoreChange(cb: (score: number) => void) {
    this._onScoreChange = cb;
  }

  public backToSquareOne() {
    const player = this._player;
    player.position = new Vector3(0, 0.9, 0); // 起点是 (0, 0.9, 0)
    player.speed = new Vector3(0, 0, 0.08); // 初始速度是 (0, 0, 0.08)

    const camera = this._camera;
    camera.position = new Vector3(0, 10, -10); // 初始相机位置是 (0, 10, -10)
    camera.setTarget(Vector3.Zero()); // 初始相机目标是 (0, 0, 0)
  }
  
  public createScene(engine: Engine) {
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
    scene.collisionsEnabled = true;
    this._scene = scene;

    const camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 30, new Vector3(0, 3, 0), scene);
    // camera.attachControl(this._canvas, true);
    this._camera = camera;

    // 点光源
    const torch = new PointLight("light1",new Vector3(0, 0, 0), scene);
    torch.intensity = 0.7;
    torch.diffuse = Color3.FromHexString('#ff9944');
    this._torch = torch;

    const shadowGenerator = new ShadowGenerator(1024, torch);
    shadowGenerator.setDarkness(0.2);
    // shadowGenerator.useBlurVarianceShadowMap = true;
    shadowGenerator.blurBoxOffset = 1.0;
    shadowGenerator.blurScale = 20.0;
    this._shadowGenerator = shadowGenerator;

    const sky = new HemisphericLight("sky", new Vector3(0, 1.0, 0), scene);
		sky.intensity = 0.5;
    sky.diffuse = bgColor;

    this._createGround();
    this._createWalls();
    this._createDots();
    this._createPlayer();
    this._bindMovePlayer();

    return scene;
  }

  public dispose() {
    this._scene.dispose();
  }

  public getScore() {
    return this._score;
  }

  private _createGround() {
    // 地板纹理
    const roadTexture = new RoadProceduralTexture("road", 512, this._scene);
    // 地板材质
    const groundMat = new StandardMaterial("gmat", this._scene);
    groundMat.diffuseTexture = roadTexture;
    groundMat.specularPower = 5;

    // 地板
    const ground = MeshBuilder.CreatePlane("g", { size: 120 }, this._scene);
    ground.position = new Vector3(0, 0, 0);
    ground.rotation.x = Math.PI / 2;
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
  }

  private _createWalls() {
    // 砖块纹理
    const brickTexture = new BrickProceduralTexture("brick", 512, this._scene);
    brickTexture.numberOfBricksHeight = 5;
    brickTexture.numberOfBricksWidth = 5;
    // 墙壁
    const wallMat = new StandardMaterial("wallMat", this._scene);
    wallMat.diffuseTexture = brickTexture;
    // 墙壁
    for (var i = 0; i < 100; i++) {
      // -50, 50
      var px = Math.random() * 100 - 50;
      var pz = Math.random() * 100 - 50;
      if ((px > 4 || px < -4) && (pz > 4 || pz < -4)) {
        var wall = MeshBuilder.CreateBox("w" + i, { size: 3 }, this._scene);
        wall.position = new Vector3(px, 1.5, pz);
        if (Math.random() > 0.5) {
          wall.scaling.x = 3;
        } else {
          wall.scaling.z = 3;
        }
        wall.material = wallMat;
        this._shadowGenerator.getShadowMap()?.renderList?.push(wall);
        wall.checkCollisions = true;
      }
    }
  }

  private _createDots() {
    for (let i = 0; i < 20; i++) {
      const dotMat = new StandardMaterial("dot", this._scene);
      dotMat.emissiveColor = Color3.FromHexString('#ff9900');
      dotMat.specularPower = 128;
  
      const dot = MeshBuilder.CreateSphere("dot", {
        segments: 8,
        diameter: 0.5,
      }, this._scene);
      dot.material = dotMat;
      dot.position = this._generateDotRandomPosition();
      this._shadowGenerator.getShadowMap()?.renderList?.push(dot);
      dot.checkCollisions = true;

      this._dots.push(dot);
    }
  }

  // 创建一个函数来生成一个随机的位置
  private _generateDotRandomPosition() {
    let position;
    do {
        position = new Vector3(Math.random() * 60 - 30, 0.1, Math.random() * 60 - 30);
    } while (this._checkCollisionWithWalls(position)); // 假设你有一个函数可以检查位置是否与墙壁重合
    return position;
  }

  private _checkCollisionWithWalls(position: Vector3) {
    const walls = this._scene.meshes.filter((mesh) => mesh.name.startsWith('w'));
    for (var i = 0; i < walls.length; i++) {
      const wall = walls[i];
      if (wall.intersectsPoint(wall.position)) {
        console.log('wall:', wall.name, wall.position, position);
        return true;
      }
    }
    return false;
  }

  private _createPlayer() {
    const scene = this._scene;

    var player1Mat = new StandardMaterial("pmat", scene);
		player1Mat.emissiveColor = Color3.FromHexString('#ff9900');
    player1Mat.specularPower = 128;

    var playereMat = new StandardMaterial("pemat", scene);
		playereMat.emissiveColor = Color3.FromHexString('#ffffff');
		playereMat.specularPower = 128;
	
		var playerbMat = new StandardMaterial("pbmat", scene);
		playerbMat.diffuseColor = Color3.Black();
    
    var player = MeshBuilder.CreateSphere("playerbody", {
			segments: 8,
			diameter: 1.8,
		}, scene) as IPlayer;
    player.material = player1Mat;
    player.position.y = 0.9;

    var playere1 = MeshBuilder.CreateSphere("eye1",  {
      segments: 8,
      diameter: 0.5,
    }, scene);
    playere1.material = playereMat;
    playere1.position.y = 0.5;
    playere1.position.z = 0.5;
    playere1.position.x = -0.3;
    playere1.parent = player;
  
    var playere2 = MeshBuilder.CreateSphere("eye2", {
      segments: 8,
      diameter: 0.5,
    }, scene);
    playere2.material = playereMat;
    playere2.position.y = 0.5;
    playere2.position.z = 0.5;
    playere2.position.x = 0.3;
    playere2.parent = player;

    var playereb1 = MeshBuilder.CreateSphere("eye1b", {
      segments: 8,
      diameter: 0.25,
    }, scene);
    playereb1.material = playerbMat;
    playereb1.position.y = 0.5;
    playereb1.position.z = 0.7;
    playereb1.position.x = -0.3;
    playereb1.parent = player;
  
    var playereb2 = MeshBuilder.CreateSphere("eye2b", {
      segments: 8,
      diameter: 0.25,
    }, scene);
    playereb2.material = playerbMat;
    playereb2.position.y = 0.5;
    playereb2.position.z = 0.7;
    playereb2.position.x = 0.3;
    playereb2.parent = player;

    this._shadowGenerator?.getShadowMap()?.renderList?.push(player);
    player.checkCollisions = true;
    player.ellipsoid = new Vector3(0.9, 0.45, 0.9);
    player.speed = new Vector3(0, 0, 0.08);
		player.nextspeed = Vector3.Zero();
    player.nexttorch = Vector3.Zero();

    var lightImpostor = MeshBuilder.CreateSphere("sphere1",{
      segments: 16,
      diameter: 0.1,
    }, scene);
    var lightImpostorMat = new StandardMaterial("mat", scene);
    lightImpostor.material = lightImpostorMat;
    lightImpostorMat.emissiveColor = Color3.Yellow();
    lightImpostorMat.linkEmissiveWithDiffuse = true;
    lightImpostor.position.y = 4.0;
    lightImpostor.position.z = 0.7;
    lightImpostor.position.x = 1.2;
    lightImpostor.parent = player;
    this._lightImpostor = lightImpostor;

    this._player = player;
  }

  private _bindMovePlayer() {
    const player = this._player;
    this._canvas.addEventListener('keydown', (event) => {
      this._keyCodeMap[event.keyCode] = true;

       // 阻止键盘事件的默认行为和冒泡
      event.preventDefault();
      event.stopPropagation();
		});
	
    this._canvas.addEventListener('keyup', (event) => {
			this._keyCodeMap[event.keyCode] = false;
		});
	
    this._canvas.addEventListener('blur', (event) => {
			for (var k in this._keyCodeMap) {
				this._keyCodeMap[k] = false;
			}
    });
    
    this._scene.registerBeforeRender(() => {
      const v = 0.5;
      let tempv = Vector3.Zero();

			player.nextspeed.x = 0.0;
			player.nextspeed.z = 0.00001;
      if (this._keyCodeMap[37]) {
        player.nextspeed.x = -v;
      }
      if (this._keyCodeMap[39]) {
        player.nextspeed.x = v;
      }
      if (this._keyCodeMap[38]) {
        player.nextspeed.z = v;
      }
      if (this._keyCodeMap[40]) {
        player.nextspeed.z = -v;
      }

      player.speed = Vector3.Lerp(player.speed, player.nextspeed, 0.1);

      if (player.speed.length() > 0.01) {
        tempv.copyFrom(player.speed);
        
        // 点积？
        var dot = Vector3.Dot(tempv.normalize(), Axis.Z);
        // 计算点积的反余弦，得到一个角度al。
        var al = Math.acos(dot);

        // 如果 tempv 的 x 分量小于 0，那么将 al 设置为2π - al。
        if (tempv.x < 0.0) {
          al = Math.PI * 2 - al;
        }

        // Tab
        if (this._keyCodeMap[9]) {
					console.log("dot,al:", dot, al);			
        }
        
        // 如果 al 大于 player.rotation.y，那么将 t 设置为 π / 30。
        // 否则，将 t 设置为 -π / 30。
        let t = al > player.rotation.y ? Math.PI / 30 : -Math.PI / 30;

        // 计算 player.rotation.y 和 al 的差值 ad。
        var ad = Math.abs(player.rotation.y - al);

        // 如果 ad 大于 π，那么将 t 设置为 -t。
        if (ad > Math.PI) {
          t = -t;
        }
        // 如果 ad 小于 π / 15，那么将 t 设置为 0。
        if (ad < Math.PI / 15) {
          t = 0;
        }

        // 将 player.rotation.y 加上 t。
        player.rotation.y += t;
        // 如果 player.rotation.y 大于 2π，那么将 player.rotation.y 减去 2π。
        if (player.rotation.y > Math.PI * 2) {
          player.rotation.y -= Math.PI * 2;
        }
        // 如果 player.rotation.y 小于 0，那么将 player.rotation.y 加上 2π。
        if (player.rotation.y < 0) {
          player.rotation.y += Math.PI * 2;
        }
      }

      player.moveWithCollisions(player.speed);
			
			if (player.position.x > 60.0) { player.position.x = 60.0; }
			if (player.position.x < -60.0) { player.position.x = -60.0; }
			if (player.position.z > 60.0) { player.position.z = 60.0; }
      if (player.position.z < -60.0) { player.position.z = -60.0; }
      
      this._adjustCamera();


      for (var i = 0; i < this._dots.length; i++) {
        const dot = this._dots[i];
        if (player.intersectsPoint(dot.position)) {
          dot.dispose();
          this._dots.splice(i, 1);
          i--;
          this._score = this._score + 1;
          this._onScoreChange(this._score);
          console.log('score:', this._score);
        }
      }
    });
  }

  private _adjustCamera() {
    const player = this._player;
    player.nexttorch = this._lightImpostor.getAbsolutePosition(); 
    this._torch.position.copyFrom(player.nexttorch);
    // 这行代码设置了火炬的亮度，其值在0.7到0.8之间随机。
    this._torch.intensity = 0.7 + Math.random() * 0.1;
    // 这两行代码在x和z轴上对火炬的位置进行了微小的随机调整。
    this._torch.position.x += Math.random() * 0.125 - 0.0625;
    this._torch.position.z += Math.random() * 0.125 - 0.0625;
    // 使摄像机的目标平滑地插值到玩家的位置加上速度的15倍。
    this._camera.target = Vector3.Lerp(this._camera.target, player.position.add(player.speed.scale(10.0)), 0.05);
    // 调整了摄像机的半径，使其基于玩家的速度进行变化。
    this._camera.radius = this._camera.radius * 0.95 + (25.0 + player.speed.length() * 25.0) * 0.05;
  }
}

export { MazeGame };
