import { PropsWithChildren } from 'react';
import './index.less';

interface IProps {
  
}

const EndGame = (props: PropsWithChildren<IProps>) => {
  return <div className="end-game">
    <div className="end-game-content">
      { props.children }
    </div>
  </div>
}

export { EndGame };
