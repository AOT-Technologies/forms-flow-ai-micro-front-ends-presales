import { BASE_ROUTE } from "./index";

export const APP_ROUTES = {
  HOME: `${BASE_ROUTE}custom-services`,
  MAGIC_LINK: `${BASE_ROUTE}custom-services/magic-links/public-form`,
  NOT_FOUND: '*',
} as const;

export const API_ROUTES = {
  MAGIC_LINK: {
    GET_FORM: (token: string) => `/v1/magic-links/public-form?token=${token}`,
    SUBMIT_FORM: '/v1/magic-links/form',
  },
} as const;
