import { useRef, useState } from 'react';

interface IProps {
  countDownNumber?: number | 'none';
  onGameEnd?: () => void;
}

type TGameStatus = 'ready' | 'playing' | 'paused' | 'end';
const DEFAULT_DOWN_NUMBER = 15;

export const useGameStatus = (props: IProps) => {
  const { countDownNumber, onGameEnd } = props;
  const [countDown, setCountDown] = useState<number | 'none'>(countDownNumber || DEFAULT_DOWN_NUMBER);
  const [gameStatus, setGameStatus] = useState<TGameStatus>('ready');
  const timer = useRef<any>(null);

  const changeGameStatus = (status: TGameStatus) => {
    setGameStatus(status);

    if (status === 'playing') {
      if (countDown && countDown !== 'none') {
        let count = countDown;
        timer.current = setInterval(() => {
          count--;
          setCountDown(count);
          if (count === 0) {
            changeGameStatus('end');
          }
        }, 1000);
      }
    } else if (status === 'paused') {
      if (timer.current) {
        timer.current = null;
        clearInterval(timer.current);
        console.log('paused');
      }
    } else if (status === 'end') {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      console.log('end');
      onGameEnd && onGameEnd();
    } else if (status === 'ready') {
      setCountDown(countDownNumber || DEFAULT_DOWN_NUMBER);
    }
  }

  return {
    gameStatus,
    countDown,
    changeGameStatus,
  }
}