// src/setupProxy.js
// File này dùng để cấu hình proxy cho development
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    })
  );
};

// Bạn cần cài đặt http-proxy-middleware: npm install http-proxy-middleware --save