import React from 'react';
import { observer } from 'mobx-react';
import { levelStore } from '@store/level';
// @ts-ignore
import { Link } from 'umi';

const Map = observer(() => {
  const { currentLevel, totalScore, levels } = levelStore;

  return (
    <div>
      <h1>Hello, Map!</h1>
      <div>当前关卡：{currentLevel}</div>
      <div>当前总分数：{totalScore}</div>
      <ul>
        {
          levels.map(item => {
            return (
              <li key={item.level}>
                <div>关卡：{item.level}</div>
                <div>分数：{item.score}</div>
                <div>是否解锁：{item.isUnlock ? '是' : '否'}</div>
                <br />
                <button>
                  <Link to={`/games/${item.key}`}>进入关卡</Link>
                </button>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
});

export default Map;
