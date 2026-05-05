const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require("webpack");
const dotenv = require("dotenv");

module.exports = (webpackConfigEnv, argv) => {
  // Filter environment variables to avoid exposing secrets
  const env = {
    ...process.env,
    ...(dotenv.config().parsed || {})
  };

  const clientEnv = {};
  const allowedKeys = ['FORMS_FLOW_FORMIO_URL', 'FORMS_FLOW_CUSTOM_SERVICES_URL'];

  Object.keys(env).forEach(key => {
    if (allowedKeys.includes(key)) {
      clientEnv[key] = env[key];
    }
  });

  const defaultConfig = singleSpaDefaults({
    orgName: "formsflow",
    projectName: "custom-services-UI",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      port: 3013
    },
    output: {
      filename: "forms-flow-custom-services-UI.js"
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(clientEnv),
      }),
    ],
    externals: ["@formsflow/*", "react", "react-dom"]
  });
};
