import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reset global de estilos para Telegram Mini App (elimina márgenes blancos)
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.backgroundColor = "#0f1015";
document.body.style.color = "#ffffff";
document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
