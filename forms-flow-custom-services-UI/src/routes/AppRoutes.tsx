import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExternalLinkPage from '../pages/ExternalLink/ExternalLinkPage';
import { APP_ROUTES } from '../constants/routes';

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.HOME}
        element={
          <div className="ff-status-page">
            <div className="ff-status-card ff-status-card--loading">
              <h1>Patient Portal</h1>
              <p>Please use a valid external link to access your form.</p>
            </div>
          </div>
        }
      />
      <Route path={APP_ROUTES.EXTERNAL_LINK} element={<ExternalLinkPage />} />
      <Route
        path={APP_ROUTES.NOT_FOUND}
        element={
          <div className="ff-status-page">
            <div className="ff-status-card ff-status-card--error">
              <div className="ff-icon-circle ff-icon-circle--warning">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1>404 — Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
