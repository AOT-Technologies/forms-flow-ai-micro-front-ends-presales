import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import { Formio } from '@formio/js';

import { AppConfig } from './config/AppConfig';

const FORMIO_URL = AppConfig.formioUrl;
Formio.setProjectUrl(FORMIO_URL);
Formio.setBaseUrl(FORMIO_URL);

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err) {
    // Customize the root error boundary for your microfrontend here.
    console.error('Custom Services UI Error:', err);
    return <div className="p-4 text-danger">Something went wrong in Custom Services UI.</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
