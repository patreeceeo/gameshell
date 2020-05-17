import * as express from "express";
import { startMainLoop } from "./server";

var app = express();

if (process.env.NODE_ENV === "development") {
  const webpack = require("webpack");
  const path = require("path");
  const config = require("./webpack.config");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: path.join(__dirname, "../", config.output.publicPath),
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
