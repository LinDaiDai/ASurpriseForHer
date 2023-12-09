import React, { useEffect, useRef, useState } from 'react';
import { levelStore } from '@/store/level';
import { MazeGame } from './game';
import { PreGame } from '@components/preGame';
import { Button } from '@components/button';
import { Pre } from './pre';
import { End } from './end';
import '@style/base.less';
import './index.less';

const Maze = () => {
  const gameRef = useRef<MazeGame | null>(null);
  const [status, setStatus] = useState<string>('pre');
  const [score, setScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countDown, setCountDown] = useState<number>(15);
  const timerRef = useRef<any>(null);

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
    setStatus('start');

    timerRef.current = setInterval(() => {
      setCountDown((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEnd = () => {
    levelStore.updateLevelScore(1, gameRef.current?.getScore() || 0);
    levelStore.unlockLevel(1);
    setStatus('end');
    clearInterval(timerRef.current);
    gameRef.current?.dispose();
  };

  const handleBackToSquareOne = () => {
    if (gameRef.current) {
      gameRef.current.backToSquareOne();
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {status === 'pre' ? <PreGame>
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
      {status === 'end' ? <PreGame>
        <End score={score}></End>
      </PreGame> : null }
    </div>
  );
};

export default Maze;
