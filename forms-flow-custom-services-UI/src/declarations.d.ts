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
    FORMIO_URL: string;
    PROXY_URL: string;
  }
}
