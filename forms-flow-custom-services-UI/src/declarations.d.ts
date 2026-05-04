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
    FORMS_FLOW_FORMIO_URL: string;
    FORMS_FLOW_CUSTOM_SERVICES_URL: string;
  }
}
