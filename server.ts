const express = require("express");
var app = express();

const portNumber = process.env.PORT || 3000;

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
}

app.get("/", function (_: any, response: any) {
  response.sendFile(__dirname + "/dist/index.html");
});
app.use(express.static("dist"));

app.listen(portNumber, function () {
  console.log("Your app is listening on port " + portNumber);
});

