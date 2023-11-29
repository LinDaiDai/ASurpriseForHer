
interface IProps {
  onStart:() => void;
}

export const Pre = (props: IProps) => {
  return <div>
    <button onClick={props.onStart}>开始游戏</button>
  </div>
};
