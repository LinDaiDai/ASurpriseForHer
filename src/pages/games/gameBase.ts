import {
  Scene,
  Engine,
} from '@babylonjs/core';

export interface IGameProps {
	canvas: HTMLCanvasElement;
}

export class GameBase {
  public canvas!: HTMLCanvasElement;
  public engine!: Engine;
  public scene!: Scene;
  public score: number = 0;
  public onScoreChange: (score: number) => void = () => {};

  constructor(props: IGameProps) {
    const { canvas } = props;
    this.canvas = canvas;
    this._init();
  }

  private _init() {
    const engine = new Engine(this.canvas, true);
    const scene = new Scene(engine);
    this.engine = engine;
    this.scene = scene;
		engine.runRenderLoop(function () {
			scene.render();
		});
		window.addEventListener("resize", function () {
			engine.resize();
		});
  }

  public registerScoreChange(cb: (score: number) => void) {
    this.onScoreChange = cb;
  }

  public dispose() {
    this.scene.dispose();
  }
}
