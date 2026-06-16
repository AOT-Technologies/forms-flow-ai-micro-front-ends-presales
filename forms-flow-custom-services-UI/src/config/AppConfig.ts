export const FORMS_FLOW_CUSTOM_SERVICES_URL = window._env_?.REACT_APP_CUSTOM_SERVICES_URL ?? (typeof process !== "undefined" ? process.env.REACT_APP_CUSTOM_SERVICES_URL : undefined);
export const FORMS_FLOW_FORMIO_URL = window._env_?.REACT_APP_API_PROJECT_URL ?? (typeof process !== "undefined" ? process.env.REACT_APP_API_PROJECT_URL : undefined);
const MULTITENANCY_ENABLED_VARIABLE = (window._env_?.REACT_APP_MULTI_TENANCY_ENABLED) || false;

export const AppConfig = {
  customServicesUrl: FORMS_FLOW_CUSTOM_SERVICES_URL,
  formioUrl: FORMS_FLOW_FORMIO_URL,
  multiTenancyEnabled: MULTITENANCY_ENABLED_VARIABLE === "true" || MULTITENANCY_ENABLED_VARIABLE === true,
};
