import * as React from "react";
import WhatForm from "./WhatForm";
import { render, screen } from "@testing-library/react";

/**
 * @ts-jest-environment jsdom
 */

describe("WhatForm initial state", () => {
  const games = {
    boggle: {
      displayName: "bOgGlE",
    },
    monkey: {
      displayName: "Monkey See",
    },
  };
  const friendsByUserName = {
    rick: {
      isInvited: false,
      hasAcceptedInvite: false,
    },
    steve: {
      isInvited: false,
      hasAcceptedInvite: false,
    },
  };
  beforeEach(() =>
    render(<WhatForm games={games} friendsByUserName={friendsByUserName} />)
  );

  it("renders an interactive element for each game", async () => {
    await screen.findByText("bOgGlE", { selector: "label" });
    await screen.findByText("Monkey See", { selector: "label" });
  });
  it("renders an interactive element for each online friend", async () => {
    await screen.findByText("rick", { selector: "label" });
    await screen.findByText("steve", { selector: "label" });
  });
});

