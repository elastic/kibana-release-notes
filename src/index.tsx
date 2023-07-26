import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { getBasename } from './config';

import '@elastic/eui/dist/eui_theme_amsterdam_light.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
