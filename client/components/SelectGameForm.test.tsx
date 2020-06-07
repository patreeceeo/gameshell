import * as React from "react";
import { SelectGameForm } from ".";
import { render, screen, fireEvent } from "@testing-library/react";

describe("SelectGameForm when app is in initial state", () => {
  let spyChange: jest.SpyInstance;
  const games = {
    boggle: {
      displayName: "bOgGlE",
    },
    monkey: {
      displayName: "Monkey See",
    },
  };
  beforeEach(() => {
    spyChange = jest.fn();
    render(
      <SelectGameForm
        games={games}
        onChange={spyChange as any}
        selectedGameId={undefined}
      />
    );
  });

  it("renders an interactive element for each game", async () => {
    await screen.findByText("bOgGlE", { selector: "label" });
    await screen.findByText("Monkey See", { selector: "label" });
  });

  it("attaches an event handler that is called whenever the selection changes", async () => {
    fireEvent.click(await screen.findByText("bOgGlE"));

    expect(spyChange).toHaveBeenCalledTimes(1);
    expect(spyChange).toHaveBeenCalledWith("boggle");

    fireEvent.click(await screen.findByText("Monkey See"));

    expect(spyChange).toHaveBeenCalledTimes(2);
    expect(spyChange).toHaveBeenCalledWith("boggle");
  });
});
