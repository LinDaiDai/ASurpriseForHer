import React, { useEffect, useRef, useState } from 'react';
import { levelStore } from '@/store/level';
import { LaunchCubeGame } from './game';
import { PreGame } from '@components/preGame';
import { Button } from '@components/button';
import { useGameStatus } from '@hooks/useGameStatus';
import { Pre } from './pre';
import { End } from './end';
import '@style/base.less';

const LaunchCube = () => {
  const gameRef = useRef<LaunchCubeGame | null>(null);
  const [score, setScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleEnd = () => {
    const number = gameRef.current?.getCorrectNumber();
    console.log(number);
    setScore(number || 0);
    levelStore.updateLevelScore(3, number || 0);
    levelStore.unlockLevel(3);
    gameRef.current?.dispose?.();
  };

  const { gameStatus, changeGameStatus } = useGameStatus({
    countDownNumber: 'none',
    onGameEnd: handleEnd,
  });

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const game = new LaunchCubeGame({
        canvas: canvasRef.current,
      });
      gameRef.current = game;
    }
  }, [canvasRef.current]);

  const handleStart = () => {
    changeGameStatus('playing');
  };

  const submit = () => {
    changeGameStatus('end');
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {gameStatus === 'ready' ? <PreGame>
        <Pre onStart={handleStart}></Pre>
      </PreGame> : null }
      <canvas ref={canvasRef} id="renderCanvas"></canvas>
      <div className="buttons">
        <Button
          onClick={submit}
        >提交</Button>
      </div>
      {gameStatus === 'end' ? <PreGame>
        <End score={score}></End>
      </PreGame> : null }
    </div>
  );
};

export default LaunchCube;
