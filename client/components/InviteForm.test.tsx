import * as React from "react";
import { InviteForm } from "./";
import { render, screen, fireEvent } from "@testing-library/react";

const interactiveEls = "label, input, button";

describe("InviteForm when app is in initial state", () => {
  const friendsByUserName = {
    adam: {
      isInvited: false,
      hasAcceptedInvite: false,
    },
    steve: {
      isInvited: false,
      hasAcceptedInvite: false,
    },
  };
  let spySubmit: jest.SpyInstance;
  beforeEach(() => {
    spySubmit = jest.fn();
    render(
      <InviteForm
        friendsByUserName={friendsByUserName}
        onSubmit={spySubmit as any}
      />
    );
  });

  it("has individual invite 'buttons'", async () => {
    fireEvent.click(
      await screen.findByLabelText("invite steve", {
        selector: interactiveEls,
      })
    );
    fireEvent.click(
      await screen.findByLabelText("send invites", {
        selector: interactiveEls,
      })
    );

    expect(spySubmit).toHaveBeenCalledTimes(1);
    expect(spySubmit).toHaveBeenCalledWith(["steve"]);

    fireEvent.click(
      await screen.findByLabelText("invite adam", {
        selector: interactiveEls,
      })
    );
    fireEvent.click(
      await screen.findByLabelText("send invites", {
        selector: interactiveEls,
      })
    );

    expect(spySubmit).toHaveBeenCalledTimes(2);
    expect(spySubmit).toHaveBeenCalledWith(["adam", "steve"]);
  });

  it("has a bulk invite 'button'", async () => {
    fireEvent.click(
      await screen.findByLabelText("invite everyone", {
        selector: "input",
      })
    );
    fireEvent.click(
      await screen.findByLabelText("send invites", {
        selector: interactiveEls,
      })
    );
    expect(spySubmit).toHaveBeenCalledTimes(1);
    expect(spySubmit).toHaveBeenCalledWith(["adam", "steve"]);
  });
});

