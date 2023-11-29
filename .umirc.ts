import { defineConfig } from "umi";
const path = require('path');

export default defineConfig({
  routes: [
    { path: "/", component: "home" },
    { path: "/map", component: "map" },
    {
      path: "/games",
      layout: false,
      routes: [
        { path: "/games/maze", component: "games/levels/maze" },
        { path: "/games/pingPong", component: "games/levels/pingPong" },
        { path: "/games/launchCube", component: "games/levels/launchCube" },
      ],
    },
    { path: "/finish", component: "finish" },
  ],
  npmClient: 'pnpm',
  alias: {
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@style': path.resolve(__dirname, 'src/style'),
    '@components': path.resolve(__dirname, 'src/components'),
  }
});
