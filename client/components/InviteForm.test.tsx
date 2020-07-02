import * as React from "react";
import { InviteForm } from "./";
import { render, screen, fireEvent } from "@testing-library/react";
import * as Friends from "../../models/FriendCollection";

const interactiveEls = "label, input, button";

describe("InviteForm when app is in initial state", () => {
  const friendsByUserName = Friends.create([
    {
      userName: "adam",
      isInvited: false,
      hasAcceptedInvite: false,
    },
    {
      userName: "steve",
      isInvited: false,
      hasAcceptedInvite: false,
    },
  ]);

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
        selector: interactiveEls,
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

  it("indicates the status of each invitation", async () => {
    await screen.findByLabelText("not invited", {
      selector: '[aria-label="adam\'s invitation status"] > *',
    });
  });

  it("invite button becomes cancel button when clicked", async () => {
    const button = await screen.findByLabelText("invite steve", {
      selector: interactiveEls,
    });
    fireEvent.click(button);
    expect(button.getAttribute("aria-label")).toBe("cancel invite to steve");
  });
});

describe("InviteForm when invites have been sent", () => {
  const friendsByUserName = Friends.create([
    {
      userName: "adam",
      isInvited: true,
      hasAcceptedInvite: false,
    },
    {
      userName: "steve",
      isInvited: false,
      hasAcceptedInvite: false,
    },
  ]);
  beforeEach(() => {
    render(<InviteForm friendsByUserName={friendsByUserName} />);
  });

  it("indicates which users have been invited", async () => {
    await screen.findByLabelText("invited", {
      selector: '[aria-label="adam\'s invitation status"] > *',
    });
  });
});

describe("InviteForm when invites have been accepted", () => {
  const friendsByUserName = Friends.create([
    {
      userName: "adam",
      isInvited: true,
      hasAcceptedInvite: true,
    },
    {
      userName: "steve",
      isInvited: false,
      hasAcceptedInvite: false,
    },
  ]);
  beforeEach(() => {
    render(<InviteForm friendsByUserName={friendsByUserName} />);
  });

  it("indicates which users have accepted", async () => {
    await screen.findByLabelText("accepted", {
      selector: '[aria-label="adam\'s invitation status"] > *',
    });
  });
});
