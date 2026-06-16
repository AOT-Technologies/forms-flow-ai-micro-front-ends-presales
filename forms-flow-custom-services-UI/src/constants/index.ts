declare global {
  interface Window {
    _env_?: any;
  }
}

import { AppConfig } from '../config/AppConfig';

export const MULTITENANCY_ENABLED = AppConfig.multiTenancyEnabled;

export const BASE_ROUTE = MULTITENANCY_ENABLED ? "/tenant/:tenantId/" : "/";
