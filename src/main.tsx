import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const rootElement = document.getElementById("root");
const fallbackElement = document.getElementById("app-fallback");

if (fallbackElement) {
  fallbackElement.remove();
}

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element #root not found. Check index.html structure.");
}
