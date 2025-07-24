import './index.css';
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { SupabaseProvider } from './auth/SupabaseProvider';

render(
  <SupabaseProvider>
    <App />
  </SupabaseProvider>,
  document.getElementById("root")
);