// @ts-ignore
import { Link, Outlet } from 'umi';
import './index.less';

export default function Layout() {
  return (
    <div className="navs">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/map">Map</Link>
        </li>
        <li>
          <Link to="/games">Games</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
