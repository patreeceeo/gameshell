import sut, {
  TFriendsAcceptInvite,
  TInviteFriends,
  TIdentifyUser,
  TSelectGame,
} from ".";
import { interpret } from "xstate";
import { identifyUser } from "../requests";

jest.mock("../requests", () => ({
  identifyUser: jest.fn(),
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
      });

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
      });

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
      });

      service.execute(newState, newState.actions as any);

      expect(newState.context.error).toBe(error);
      expect(newState.matches("who.error")).toBe(true);
    });
  });

  describe("what", () => {
    it("allows user to invite friends", () => {
      // TODO: how does the friend list get populated?
      // a parallel machine?
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

      const service = interpret(
        sutWithContext
      ); /*.onTransition((state) =>
        console.log("transition", state.value)
      );*/
      service.start();

      service.send({
        type: "IDENTIFY_USER",
        userName: "morthy",
      } as TIdentifyUser);

      service.send({ type: "FINISH_WORKING" });

      service.send({
        type: "INVITE_FRIENDS",
        userNames: ["morty"],
      } as TInviteFriends);

      const newState = service.send({
        type: "INVITE_FRIENDS",
        userNames: ["rick"],
      } as TInviteFriends);

      expect(newState.context.friendsByUserName).toEqual({
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

    it("keeps track of what friends have accepted", () => {
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

      const service = interpret(
        sutWithContext
      ); /*.onTransition((state) =>
        console.log("transition", state.value)
      );*/
      service.start();

      service.send({
        type: "IDENTIFY_USER",
        userName: "morthy",
      } as TIdentifyUser);

      service.send({ type: "FINISH_WORKING" });

      service.send({
        type: "INVITE_FRIENDS",
        userNames: ["morty"],
      } as TInviteFriends);

      service.send({
        type: "INVITE_FRIENDS",
        userNames: ["rick"],
      } as TInviteFriends);

      // TODO: defend against accepting invitations that haven't been sent?
      const newState = service.send({
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

    it("allows user to select a game", () => {
      const service = interpret(
        sut
      ); /*.onTransition((state) =>
        console.log("transition", state.value)
      );*/
      service.start();

      service.send({
        type: "IDENTIFY_USER",
        userName: "morthy",
      } as TIdentifyUser);

      service.send({ type: "FINISH_WORKING" });

      const newState = service.send({
        type: "SELECT_GAME",
        gameId: "boggle",
      } as TSelectGame);

      expect(newState.context.selectedGameId).toEqual("boggle");
    });

    it("validates", () => {
      const service = interpret(
        sut
      ); /*.onTransition((state) =>
        console.log("transition", state.value)
      );*/
      service.start();
      service.send({
        type: "IDENTIFY_USER",
        userName: "morthy",
      } as TIdentifyUser);

      service.send({ type: "FINISH_WORKING" });

      service.send({
        type: "INVITE_FRIENDS",
        userNames: ["morty"],
      } as TInviteFriends);

      service.send({
        type: "FRIENDS_ACCEPT_INVITE",
        userNames: ["morty"],
      } as TFriendsAcceptInvite);

      const newState = service.send({
        type: "SELECT_GAME",
        gameId: "min3test",
      } as TSelectGame);

      expect(newState.context.invalidBecause).toEqual(
        expect.arrayContaining([
          {
            type: "numberOfPlayers",
            allowedRange: [3, 9],
            currentPlayerCount: 2,
          },
        ])
      );
    });
  });
});
