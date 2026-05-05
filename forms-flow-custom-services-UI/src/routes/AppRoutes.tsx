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
          <div className="portal-container">
            <div className="portal-card portal-status-center">
              <h2>Patient Portal</h2>
              <p>Please use a valid external link to access your form.</p>
            </div>
          </div>
        }
      />
      <Route path={APP_ROUTES.EXTERNAL_LINK} element={<ExternalLinkPage />} />
      <Route
        path={APP_ROUTES.NOT_FOUND}
        element={
          <div className="portal-container">
            <div className="portal-card portal-status-center">
              <h2>404 — Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
