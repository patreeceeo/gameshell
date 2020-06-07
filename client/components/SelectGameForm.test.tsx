import * as React from "react";
import { SelectGameForm } from ".";
import { render, screen } from "@testing-library/react";

describe("SelectGameForm when app is in initial state", () => {
  const games = {
    boggle: {
      displayName: "bOgGlE",
    },
    monkey: {
      displayName: "Monkey See",
    },
  };
  beforeEach(() => render(<SelectGameForm games={games} />));

  it("renders an interactive element for each game", async () => {
    await screen.findByText("bOgGlE", { selector: "label" });
    await screen.findByText("Monkey See", { selector: "label" });
  });
});

