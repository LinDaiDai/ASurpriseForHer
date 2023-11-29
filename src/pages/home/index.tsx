import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
// @ts-ignore
import { Link } from 'umi';
import './index.less';
import '../../style/base.less';

const Home = observer(() => {

  return (
    <div>
      <h1>Hello, World!</h1>
      <Link to="/map">进入关卡预览</Link>
    </div>
  );
});

export default Home;
