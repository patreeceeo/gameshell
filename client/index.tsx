import * as React from "react";
import * as ReactDOM from "react-dom";
import HelloWorld from "./components/HelloWorld";

const App =
  process.env.NODE_ENV === "development"
    ? require("react-hot-loader/root").hot(HelloWorld)
    : HelloWorld;

ReactDOM.render(<App />, document.getElementById("main"));
