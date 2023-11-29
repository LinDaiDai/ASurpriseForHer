import { PropsWithChildren } from 'react';
import './index.less';

interface IProps {
  
}

const PreGame = (props: PropsWithChildren<IProps>) => {
  return <div className="pre-game">
    <div className="pre-game-content">
      { props.children }
    </div>
  </div>
}

export { PreGame };
