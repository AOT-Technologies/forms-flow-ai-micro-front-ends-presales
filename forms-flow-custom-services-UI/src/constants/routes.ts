import { BASE_ROUTE } from "./index";

export const APP_ROUTES = {
  HOME: `${BASE_ROUTE}custom-services`,
  EXTERNAL_LINK: `${BASE_ROUTE}custom-services/external/public`,
  NOT_FOUND: '*',
} as const;

export const API_ROUTES = {
  EXTERNAL: {
    GET_FORM: (token: string) => `/api/v1/external/get-form?token=${token}`,
    SUBMIT_FORM: '/api/v1/external/submit-form',
  },
} as const;
