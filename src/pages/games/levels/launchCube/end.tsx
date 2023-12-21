// @ts-ignore
import { Link } from 'umi';
import { Button } from '@components/button';
import { levelStore } from '@/store/level';
import './index.less';

interface IProps {
  score: number;
}

export const End = (props: IProps) => {
  const { score } = props;
  const handleReturn = () => {
    
  }

  return <div className="game-end">
    <div>游戏结束，当前游戏分数是：{score}</div>
    <div>目前总分数：{levelStore.totalScore}</div>
    <Button>
      <Link to="/map">返回地图</Link>
    </Button>
  </div>
};
