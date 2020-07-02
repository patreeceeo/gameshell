import sut, { TContext, TEvent, getPlayerCount } from ".";
import { interpret, StateMachine } from "@xstate/fsm";
import * as Friends from "../../models/FriendCollection";
import * as requests from "../requests";

jest.mock("../requests");

test("getPlayerCount", () => {
  const friendsByUserName = Friends.create([
    {
      userName: "homer",
      isInvited: true,
      hasAcceptedInvite: true,
    },
    {
      userName: "marge",
      isInvited: true,
      hasAcceptedInvite: true,
    },
    {
      userName: "bart",
      isInvited: true,
      hasAcceptedInvite: false,
    },
    {
      userName: "lisa",
      isInvited: false,
      hasAcceptedInvite: false,
    },
  ]);

  expect(getPlayerCount(({ friendsByUserName } as unknown) as TContext)).toBe(
    3
  );
});

function testExtendedState() {
  let service: StateMachine.Service<TContext, TEvent>;

  beforeEach(() => {
    service = interpret(sut);
    service.start();
  });

  function sendEvents(events: TEvent[]) {
    events.forEach((event) => {
      service.send(event);
    });
  }
  it("Stores the local user's name in the extended state", () => {
    sendEvents([
      {
        type: "IDENTIFY_USER",
        userName: "rick",
      },
    ]);

    expect(service.state.context.userNameLocal).toBe("rick");
  });
  it("Doesn't allow me to use a name that's already been taken", () => {
    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: [{ userName: "bigdog", role: "player" }],
      },
      {
        type: "IDENTIFY_USER",
        userName: "bigdog", // should fail
      },
    ]);

    expect(service.state.context.userNameLocal).not.toBe("bigdog");
  });
  it("Stores who has arrived in the extended state", () => {
    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: [
          { userName: "morty", role: "player" },
          { userName: "balthazar", role: "player" },
          { userName: "bigdog", role: "player" },
        ],
      },
    ]);
    expect([...service.state.context.friendsByUserName.keys()]).toEqual([
      "morty",
      "balthazar",
      "bigdog",
    ]);
  });
  it("Stores local user's selected game in the extended state", () => {
    sendEvents([
      {
        type: "SELECT_GAME",
        gameId: "snake",
      },
    ]);
    expect(service.state.context.selectedGameId).toEqual("snake");
  });
  it("Stores invitations in the extended state", () => {
    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: [
          { userName: "morty", role: "player" },
          { userName: "balthazar", role: "player" },
          { userName: "bigdog", role: "player" },
        ],
      },
      {
        type: "INVITE_FRIENDS",
        userNames: ["balthazar", "bigdog"],
      },
    ]);
    expect(
      [...service.state.context.friendsByUserName.values()].map(
        ({ isInvited }) => isInvited
      )
    ).toEqual([false, true, true]);
  });
  it("Keeps track of the local user's invitations using extended state", () => {
    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: [
          { userName: "morty", role: "player" },
          { userName: "balthazar", role: "player" },
          { userName: "bigdog", role: "player" },
        ],
      },
      {
        type: "RECIEVE_INVITES",
        payload: [{ userNameRemote: "balthazar" }],
      },
    ]);
    expect(
      [...service.state.context.invitesRecievedByUserName.values()].map(
        ({ userNameRemote }) => userNameRemote
      )
    ).toEqual(["balthazar"]);
  });
  it("Keeps track of who has accepted their invitation using the extended state", () => {
    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: [
          { userName: "morty", role: "player" },
          { userName: "balthazar", role: "player" },
          { userName: "bigdog", role: "player" },
        ],
      },
      {
        type: "INVITE_FRIENDS",
        userNames: ["balthazar", "bigdog"],
      },
      {
        type: "FRIENDS_ACCEPT_INVITE",
        userNames: ["balthazar"],
      },
    ]);
    expect(
      [...service.state.context.friendsByUserName.values()].map(
        ({ hasAcceptedInvite }) => hasAcceptedInvite
      )
    ).toEqual([false, true, false]);
  });
}

function testSideEffects() {
  let service: StateMachine.Service<TContext, TEvent>;

  beforeEach(() => {
    jest.resetAllMocks();
    service = interpret(sut);
    service.start();
  });

  function sendEvents(events: TEvent[]) {
    events.forEach((event) => {
      service.send(event);
    });
  }

  it("pushes the local user's name", () => {
    const userName = "bonfire";
    service.send({ type: "IDENTIFY_USER", userName });

    expect(requests.identifyUser).toHaveBeenCalledTimes(1);
    expect(requests.identifyUser).toHaveBeenCalledWith({ userName });
  });

  it("pushes invites", () => {
    const gameId = "boggle";
    const userNames = ["maria", "luigi", "frog"];

    sendEvents([
      { type: "SELECT_GAME", gameId },
      { type: "INVITE_FRIENDS", userNames },
    ]);

    expect(requests.sendInvites).toHaveBeenCalledTimes(1);
    expect(requests.sendInvites).toHaveBeenCalledWith(userNames, gameId);
  });

  it("pushes accepts", () => {
    const userName = "prince";
    const userNameRemote = "maria";

    sendEvents([
      { type: "IDENTIFY_USER", userName },
      { type: "ACCEPT_INVITE", userNameRemote },
    ]);

    expect(requests.acceptInvite).toHaveBeenCalledTimes(1);
    expect(requests.acceptInvite).toHaveBeenCalledWith(
      userName,
      userNameRemote
    );
  });

  it("pushes start games", () => {
    const userNames = ["maria", "frog"];
    const gameId = "isp_speed_test";

    sendEvents([
      {
        type: "FRIENDS_ARRIVE",
        users: userNames.map((userName: string) => ({
          userName,
          role: "player",
        })),
      },
      { type: "SELECT_GAME", gameId },
      { type: "INVITE_FRIENDS", userNames },
      { type: "FRIENDS_ACCEPT_INVITE", userNames },
      { type: "START_GAME" },
    ]);
    expect(requests.startGame).toHaveBeenCalledTimes(1);
    expect(requests.startGame).toHaveBeenCalledWith(userNames, gameId);
  });
}

describe("machine", () => {
  // TODO randomized tests
  describe("extended state (context)", testExtendedState);

  describe("side effects (actions, etc)", testSideEffects);
});
