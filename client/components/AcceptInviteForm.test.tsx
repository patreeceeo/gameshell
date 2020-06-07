import * as React from "react";
import { AcceptInviteForm } from ".";
import { render, screen, fireEvent } from "@testing-library/react";
import { TInvitesRecievedCollection } from "../state";

describe("AcceptInviteForm when invites have been recieved by local user", () => {
  const games = {
    boggle: {
      displayName: "bOgGlE",
    },
  };
  let spyAccept: jest.SpyInstance;
  const invitesRecievedByUserName: TInvitesRecievedCollection = {
    steve: {
      hasBeenAccepted: false,
      userNameRemote: "steve",
      gameId: "boggle",
    },
  };
  beforeEach(() => {
    spyAccept = jest.fn();
    render(
      <AcceptInviteForm
        onAccept={spyAccept as any}
        invitesRecievedByUserName={invitesRecievedByUserName}
        games={games}
      />
    );
  });

  it("shows what game(s) the local user is being invited to play", async () => {
    await screen.findByText((text) => /bOgGlE/.test(text), {
      selector: '[aria-label="invite from steve"]',
    });
  });

  it("allows the local user to accept any invite they've recieved", async () => {
    fireEvent.click(
      await screen.findByLabelText("accept invite", {
        selector: '[aria-label="invite from steve"] > button',
      })
    );

    expect(spyAccept).toHaveBeenCalledTimes(1);
    expect(spyAccept).toHaveBeenCalledWith("steve");
  });
});
