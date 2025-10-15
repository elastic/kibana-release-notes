import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';
import { HashRouter } from 'react-router-dom';
import { getBasename } from './config';
import { GitHubServiceContextProvider } from './common/github-service-context';

import '@elastic/eui/dist/eui_theme_amsterdam_light.css';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter basename={getBasename()}>
      <GitHubServiceContextProvider>
        <App />
      </GitHubServiceContextProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
