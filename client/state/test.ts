import sut, {
  TFriendsAcceptInvite,
  TFriendsArrive,
  TInviteFriends,
  TIdentifyUser,
  TSelectGame,
  TRecieveInvites,
} from ".";
import { interpret } from "xstate";
import { identifyUser, sendInvites } from "../requests";

jest.mock("../requests", () => ({
  identifyUser: jest.fn(),
  sendInvites: jest.fn(),
}));

describe("rootMachine", () => {
  beforeEach(jest.resetAllMocks);

  describe("who", () => {
    it("allows user to identify herself", () => {
      const service = interpret(sut);
      service.start();
      const newState = service.send({
        type: "IDENTIFY_USER",
        userName: "wilma",
      } as TIdentifyUser);

      expect(newState.context.localUserName).toBe("wilma");
      expect(newState.matches("who.working")).toBe(true);
    });

    it("lets the server know who she is", () => {
      ((identifyUser as any) as jest.SpyInstance).mockImplementation(() =>
        Promise.resolve({})
      );
      const service = interpret(sut);
      service.start();
      service.send({
        type: "IDENTIFY_USER",
        userName: "wilma",
      } as TIdentifyUser);

      expect(identifyUser).toHaveBeenCalledTimes(1);
      expect(identifyUser).toHaveBeenCalledWith({ userName: "wilma" });
    });

    it.skip("handles errors", () => {
      // TODO
      const error = new Error("");
      ((identifyUser as any) as jest.SpyInstance).mockImplementation(() =>
        Promise.reject(error)
      );
      const service = interpret(sut).onTransition((state) =>
        console.log("transition", state.value)
      );
      service.start();
      const newState = service.send({
        type: "IDENTIFY_USER",
        userName: "wilma",
      } as TIdentifyUser);

      service.execute(newState, newState.actions as any);

      expect(newState.context.error).toBe(error);
      expect(newState.matches("who.error")).toBe(true);
    });
  });

  describe("what", () => {
    it("keeps track of what friends are online", () => {
      const newState = sut.transition("what", {
        type: "FRIENDS_ARRIVE",
        users: [
          {
            userName: "fry",
          },
        ],
      } as TFriendsArrive);

      expect(newState.context.friendsByUserName).toEqual({
        fry: {
          isInvited: false,
          hasAcceptedInvite: false,
        },
      });
    });

    it("allows user to select a game", () => {
      const newState = sut.transition("what", {
        type: "SELECT_GAME",
        gameId: "boggle",
      } as TSelectGame);

      expect(newState.context.selectedGameId).toEqual("boggle");
    });

    it("allows user to invite friends", () => {
      const sutWithContext = sut.withContext({
        ...sut.context,
        friendsByUserName: {
          morty: {
            isInvited: false,
            hasAcceptedInvite: false,
          },
          rick: {
            isInvited: false,
            hasAcceptedInvite: false,
          },
          kronenberger: {
            isInvited: false,
            hasAcceptedInvite: false,
          },
        },
      });

      let state = sutWithContext.transition("what", {
        type: "INVITE_FRIENDS",
        userNames: ["morty"],
      } as TInviteFriends);

      // TODO Skip over the invoked service for now
      state.value = { what: { waiting: "ready" } };

      state = sutWithContext.transition(state, {
        type: "INVITE_FRIENDS",
        userNames: ["rick"],
      } as TInviteFriends);

      expect(state.context.friendsByUserName).toEqual({
        morty: expect.objectContaining({
          isInvited: true,
        }),
        rick: expect.objectContaining({
          isInvited: true,
        }),
        kronenberger: expect.objectContaining({
          isInvited: false,
        }),
      });
    });

    it("lets the server know who is invited", (done) => {
      // TODO: allow jest to auto-mock
      ((sendInvites as any) as jest.SpyInstance).mockImplementation(() =>
        Promise.resolve({})
      );
      const service = interpret(
        sut
      ); /*.onTransition((state, event) => {
        console.log("transitioning from", state.value, "because of", event);
      });*/
      service.start();
      service.send({
        type: "IDENTIFY_USER",
        userName: "wilma",
      } as TIdentifyUser);

      service.send({ type: "FINISH_WORKING" });

      service.send({ type: "SELECT_GAME", gameId: "boggle" } as TSelectGame);

      setTimeout(() => {
        service.send({
          type: "INVITE_FRIENDS",
          userNames: ["JoJo", "Elsa"],
        } as TInviteFriends);

        expect(sendInvites).toHaveBeenCalledTimes(1);
        expect(sendInvites).toHaveBeenCalledWith(["JoJo", "Elsa"], "boggle");
        done();
      });
    });

    it("keeps track of what friends have accepted", () => {
      const sutWithContext = sut.withContext({
        ...sut.context,
        friendsByUserName: {
          morty: {
            isInvited: true,
            hasAcceptedInvite: false,
          },
          rick: {
            isInvited: false,
            hasAcceptedInvite: false,
          },
          kronenberger: {
            isInvited: false,
            hasAcceptedInvite: false,
          },
        },
      });

      // TODO: defend against accepting invitations that haven't been sent?
      const newState = sutWithContext.transition("what", {
        type: "FRIENDS_ACCEPT_INVITE",
        userNames: ["morty"],
      } as TFriendsAcceptInvite);

      expect(newState.context.friendsByUserName).toEqual({
        morty: expect.objectContaining({
          hasAcceptedInvite: true,
        }),
        rick: expect.objectContaining({
          hasAcceptedInvite: false,
        }),
        kronenberger: expect.objectContaining({
          hasAcceptedInvite: false,
        }),
      });
    });

    it("allows user to recieve invites", () => {
      // TODO: can send multiple events to transition?
      let state = sut.transition("what", {
        type: "RECIEVE_INVITES",
        payload: [
          { userNameFrom: "JoJo" },
          {
            userNameFrom: "Elsa",
            gameId: "hideseek",
          },
          {
            userNameFrom: "JoJo",
            gameId: "militia",
          },
        ],
      } as TRecieveInvites);

      expect(state.context.invitesRecievedByUserName).toEqual({
        Elsa: {
          gameId: "hideseek",
          hasBeenAccepted: false,
        },
        JoJo: {
          gameId: "militia",
          hasBeenAccepted: false,
        },
      });
      expect(state.matches("respondToInvites")).toBe(true);
    });

    it("validates", () => {
      let state = sut.transition("what", {
        type: "INVITE_FRIENDS",
        userNames: ["morty"],
      } as TInviteFriends);

      // TODO Skip over the invoked service for now
      state.value = { what: { waiting: "ready" } };

      state = sut.transition(state, {
        type: "FRIENDS_ACCEPT_INVITE",
        userNames: ["morty"],
      } as TFriendsAcceptInvite);

      // TODO Skip over the invoked service for now
      state.value = { what: { waiting: "ready" } };

      state = sut.transition(state, {
        type: "SELECT_GAME",
        gameId: "min3test",
      } as TSelectGame);

      expect(state.context.invalidBecause).toEqual(
        expect.arrayContaining([
          {
            type: "numberOfPlayers",
            allowedRange: [3, 9],
            currentPlayerCount: 2,
          },
        ])
      );
    });

    it("does not allow the user to start the game from an invalid state", () => {
      let state = sut.transition("what.waiting.ready", {
        type: "START_GAME",
      });

      expect(state.matches("startGame")).toBe(false);
    });

    it("allows the user to start the game from a valid state", () => {
      const sutTriviallyValid = sut.withContext({
        ...sut.context,
        selectedGameId: "unknown",
      });
      let state = sutTriviallyValid.transition("what.waiting.ready", {
        type: "START_GAME",
      });

      expect(state.matches("startGame")).toBe(true);
    });

    // TODO let server know about starting game
  });
});
