import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';

// 兼容旧 hash 路由（#/path?query → /path?query）
// 必须在 BrowserRouter 初始化之前执行，因为 replaceState 不触发 popstate 事件
(function() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    window.history.replaceState(null, '', hash.substring(1));
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();