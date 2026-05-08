declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_FORMIO_URL: string;
    REACT_APP_CUSTOM_SERVICES_URL: string;
  }
}
