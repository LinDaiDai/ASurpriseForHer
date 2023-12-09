import { PropsWithChildren, useState } from 'react';
import './index.less';

interface IButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Button = (props: PropsWithChildren<IButtonProps>) => {
  const { onClick, style, children } = props;
  const [animate, setAnimate] = useState<boolean>(false);

  const handleClick = (e: any) => {
    onClick && onClick();
    e.preventDefault;
    //reset animation
    e.target.classList.remove('animate');
    
    e.target.classList.add('animate');
    setTimeout(function(){
      e.target.classList.remove('animate');
    },700);
  }

  const _style = {
    ...style,
  }

  return <button
    style={_style}
    className="bubbly-button"
    onClick={(e) => handleClick(e)}
  >{ children }</button>
}

export { Button };
