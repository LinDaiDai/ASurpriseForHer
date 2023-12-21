import React, { useEffect, useRef, useState } from 'react';
import { levelStore } from '@/store/level';
import { MazeGame } from './game';
import { PreGame } from '@components/preGame';
import { Button } from '@components/button';
import { useGameStatus } from '@hooks/useGameStatus';
import { Pre } from './pre';
import { End } from './end';
import '@style/base.less';
import './index.less';

const Maze = () => {
  const gameRef = useRef<MazeGame | null>(null);
  const [score, setScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleEnd = () => {
    levelStore.updateLevelScore(1, gameRef.current?.getScore() || 0);
    levelStore.unlockLevel(1);
    gameRef.current?.dispose();
  };

  const { gameStatus, countDown, changeGameStatus } = useGameStatus({
    onGameEnd: handleEnd,
  });

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const handleScoreChange = (score: number) => {
        setScore(score);
      }

      const game = new MazeGame();
      game.init({
        canvas: canvasRef.current,
      });
      game.registerScoreChange(handleScoreChange);
      gameRef.current = game;
    }
  }, [canvasRef.current]);

  const handleStart = () => {
    changeGameStatus('playing');
  };

  const handleBackToSquareOne = () => {
    if (gameRef.current) {
      gameRef.current.backToSquareOne();
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {gameStatus === 'ready' ? <PreGame>
        <Pre onStart={handleStart}></Pre>
      </PreGame> : null }
      <canvas ref={canvasRef} id="renderCanvas"></canvas>
      <div className="buttons">
        <div>分数：{ score }</div>
        <div>剩余时间：{ countDown }</div>
        <Button
          onClick={handleBackToSquareOne}
        >回到起点</Button>
      </div>
      {gameStatus === 'end' ? <PreGame>
        <End score={score}></End>
      </PreGame> : null }
    </div>
  );
};

export default Maze;
