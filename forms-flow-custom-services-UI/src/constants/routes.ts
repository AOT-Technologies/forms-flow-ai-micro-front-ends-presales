import { BASE_ROUTE } from "./index";

export const APP_ROUTES = {
  HOME: `${BASE_ROUTE}custom-services`,
  MAGIC_LINK: `${BASE_ROUTE}custom-services/magic-link/public`,
  NOT_FOUND: '*',
} as const;

export const API_ROUTES = {
  MAGIC_LINK: {
    GET_FORM: (token: string) => `/api/v1/magic-link/get-form?token=${token}`,
    SUBMIT_FORM: '/api/v1/magic-link/submit-form',
  },
} as const;
