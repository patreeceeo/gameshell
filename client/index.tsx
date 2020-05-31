import * as React from "react";
import * as ReactDOM from "react-dom";
import Concierge from "./components/Concierge";

const App =
  process.env.NODE_ENV === "development"
    ? require("react-hot-loader/root").hot(Concierge)
    : Concierge;

ReactDOM.render(<App />, document.getElementById("main"));
