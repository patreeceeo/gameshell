import * as express from "express";
import { startMainLoop } from "./server";

var app = express();

if (process.env.NODE_ENV === "development") {
  const webpack = require("webpack");
  const config = require("./webpack.config");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath,
    })
  );
  app.use(
    require("webpack-hot-middleware")(compiler, {
      log: console.log,
      reload: true,
    })
  );
} else {
  app.get("/", function (_: any, response: any) {
    response.sendFile(__dirname + "/dist/index.html");
  });
}

// TODO: use NGINX instead
app.use(
  express.static("dist", {
    // Don't cache HTML
    extensions: ["css", "js"],
  })
);

startMainLoop(app);
