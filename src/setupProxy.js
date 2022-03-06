const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api', {
      target: 'http://localhost:8888', //如有需要，请改成你自己本地的代理路径
      changeOrigin: true,
      secure: false,
    }),
  );
};
