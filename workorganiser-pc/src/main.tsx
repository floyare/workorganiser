"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.scss";
import { ErrorBoundary } from "react-error-boundary";
import { invoke } from '@tauri-apps/api/tauri'

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    invoke('close_splashscreen')
  }, 1000)
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
