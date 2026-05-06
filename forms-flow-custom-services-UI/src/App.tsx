import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App(props: any) {
  // If basename is not provided, we default to '/' 
  // In single-spa, we can determine the basename from the path if needed, 
  // but usually we want it to be /custom-services-UI when running in the root config.
  const basename = props.basename || (window.location.pathname.startsWith('/custom-services') ? '/custom-services' : '/');

  return (
    <Router basename={basename}>
      <AppRoutes />
    </Router>
  );
}

export default App;
