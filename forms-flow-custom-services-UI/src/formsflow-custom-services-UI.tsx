import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM: (ReactDOM as any),
  rootComponent: App,
  errorBoundary(err, _info, _props) {
    // Customize the root error boundary for your microfrontend here.
    console.error('Custom Services UI Error:', err);
    return <div className="p-4 text-danger">Something went wrong in Custom Services UI.</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
