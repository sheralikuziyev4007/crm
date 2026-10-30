import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Шрифты self-hosted (@fontsource): нет блокирующих запросов к сторонним доменам;
// браузер скачивает только нужные подмножества (latin / cyrillic) благодаря unicode-range
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
