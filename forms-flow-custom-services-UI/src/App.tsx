import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './index.css';
import './App.css';

function App() {
  useEffect(() => {
    // Add custom scrolling class when custom-services UI mounts
    document.documentElement.classList.add('custom-services-theme-active');
    document.body.classList.add('custom-services-theme-active');

    return () => {
      // Remove class cleanly when unmounted to prevent affecting other UIs
      document.documentElement.classList.remove('custom-services-theme-active');
      document.body.classList.remove('custom-services-theme-active');
    };
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
