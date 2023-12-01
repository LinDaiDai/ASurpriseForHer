import React, { useEffect, useRef, useState } from 'react';
// import { MazeGame } from './mazeGame';
import { MazeGame } from './game';
import '@style/base.less';
import { PreGame } from '@components/preGame';
import { Pre } from './pre';

const Maze = () => {
  const [isStart, setIsStart] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const game = new MazeGame();
      game.init({
        canvas: canvasRef.current,
      });
    }
  }, [canvasRef.current]);

  const handleStart = () => {
    setIsStart(true);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* {!isStart ? <PreGame>
        <Pre onStart={handleStart}></Pre>
      </PreGame> : null } */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%'}} id="renderCanvas"></canvas>
    </div>
  );
};

export default Maze;
