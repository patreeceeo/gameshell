// TODO refactor to use @state/fsm ?
import { Machine, StateNodeConfig, assign } from "xstate";
import * as req from "../requests";
import { IUser } from "../../server/state";
import produce from "immer";
import { IFriendCollection, FriendCollection } from "../../models";

interface TWaitThenWorkStates {
  states: {
    waiting: {
      states: {
        initial: {};
        invalid: {};
        ready?: {};
      };
    };
    working: {
      states: {
        fetching?: {};
        validating?: {};
      };
    };
    finished?: {};
    error?: {};
  };
}

type TWaitThenWorkStateNodeConfig = StateNodeConfig<
  TContext,
  TWaitThenWorkStates,
  TEvent
>;

export interface TGameCollection {
  [gameId: string]: {
    displayName: string;
  };
}

interface TInvalidReason {
  type: string;
  [key: string]: any;
}

export interface TInviteRecieved {
  userNameRemote: string;
  hasBeenAccepted?: boolean;
  gameId?: string;
}

export interface TInvitesRecievedCollection {
  [userName: string]: TInviteRecieved;
}

interface TContext {
  userNameLocal?: string;
  friendsByUserName: IFriendCollection;
  selectedGameId?: string;
  error?: Error;
  // TODO map invalid reason type to invalid reasons so only 1 per type?
  invalidBecause: TInvalidReason[];
  invitesRecievedByUserName: TInvitesRecievedCollection;
}

interface TStateSchema {
  states: {
    who: TWaitThenWorkStateNodeConfig;
    what: TWaitThenWorkStateNodeConfig;
    respondToInvites: TWaitThenWorkStateNodeConfig;
    startGame: {};
  };
}

export type TIdentifyUser = {
  type: "IDENTIFY_USER";
  userName: string;
};

export type TInviteFriends = {
  type: "INVITE_FRIENDS";
  userNames: string[];
};

export type TFriendsAcceptInvite = {
  type: "FRIENDS_ACCEPT_INVITE";
  userNames: string[];
};

export type TAcceptInvite = {
  type: "ACCEPT_INVITE";
  userNameRemote: string;
};

export type TRecieveInvites = {
  type: "RECIEVE_INVITES";
  payload: TInviteRecieved[];
};

export type TSelectGame = {
  type: "SELECT_GAME";
  gameId: string;
};

type TSetStatus = {
  type: "SET_STATUS";
  currentStatus: req.UserStatus;
};

export type TFriendsArrive = {
  type: "FRIENDS_ARRIVE";
  users: IUser[];
};

export type TFriendsDepart = {
  type: "FRIENDS_DEPART";
  userNames: string[];
};

export type TStartGame = { type: "START_GAME" };

type TErrorEvent = {
  type: string;
  data: {
    error?: Error;
    invalidReason?: TInvalidReason;
  };
};

type TRetry = {
  type: "RETRY";
};

type TEvent =
  | TIdentifyUser
  | { type: "FINISH_WORKING" }
  | TInviteFriends
  | TRecieveInvites
  | TFriendsAcceptInvite
  | TAcceptInvite
  | TFriendsArrive
  | TFriendsDepart
  | TSelectGame
  | TStartGame
  | { type: "JOIN_GAME" }
  | TSetStatus
  | TErrorEvent
  | TRetry;

const gameData = {
  boggle: [1, 9],
  snake: [1, 9],
  monkey: [1, 9],
  min3test: [3, 9],
  max2test: [1, 2],
};
function getMinAndMaxPlayers(gameId: string) {
  return (gameData as any)[gameId];
}

function getPlayers(context: TContext) {
  return context.friendsByUserName.filter(
    ({ isInvited, hasAcceptedInvite }) => isInvited && hasAcceptedInvite
  );
}

function getPlayerCount(context: TContext) {
  /* add one to count local user
   * TODO: what if local user is spectating?
   */
  return context.friendsByUserName.size + 1;
}

function areSelectionsValid(context: TContext) {
  if (context.selectedGameId) {
    const [min, max] = getMinAndMaxPlayers(context.selectedGameId) || [
      0,
      Infinity,
    ];
    const playerCount = getPlayerCount(context);
    return playerCount >= min && playerCount <= max;
  } else {
    return false;
  }
}

function uniqueUserNameLocal(context: TContext, event: TIdentifyUser) {
  return !context.friendsByUserName.has(event.userName);
}

export const identifyUser = assign({
  userNameLocal: (_, { userName }: TIdentifyUser) => userName,
});

const inviteFriends = assign({
  friendsByUserName: (context: TContext, event: TInviteFriends) => {
    return context.friendsByUserName.batchUpdate(event.userNames, (entry) => ({
      ...entry,
      isInvited: true,
    }));
  },
});

const acceptInvite = assign({
  invitesRecievedByUserName: (context: TContext, event: TAcceptInvite) => {
    return produce(context.invitesRecievedByUserName, (draft) => {
      draft[event.userNameRemote] = {
        ...draft[event.userNameRemote],
        hasBeenAccepted: true,
      };
    });
  },
});

const ackAcceptedInvites = assign({
  friendsByUserName: (context: TContext, event: TFriendsAcceptInvite) => {
    return context.friendsByUserName.batchUpdate(event.userNames, (entry) => ({
      ...entry,
      hasAcceptedInvite: true,
    }));
  },
});

const ackFriendsArrive = assign({
  friendsByUserName: (context: TContext, event: TFriendsArrive) => {
    return context.friendsByUserName.add(
      event.users.map(({ userName }) => userName)
    );
  },
});

const ackFriendsDepart = assign({
  friendsByUserName: (context: TContext, event: TFriendsDepart) => {
    return context.friendsByUserName.batchDelete(event.userNames);
  },
});

const ackRecieveInvites = assign({
  invitesRecievedByUserName: (context: TContext, event: TRecieveInvites) => {
    // TODO: watch out for memory leaks!
    return event.payload.reduce((acc: TInvitesRecievedCollection, invite) => {
      return {
        ...acc,
        [invite.userNameRemote]: {
          gameId: invite.gameId,
          hasBeenAccepted: false,
        },
      };
    }, context.invitesRecievedByUserName);
  },
});

const selectGame = assign({
  selectedGameId: (_, { gameId }: TSelectGame) => gameId,
});

const setStatus = assign({
  currentStatus: (_, { currentStatus }: TSetStatus) => ({ currentStatus }),
});

const handleInvalidReason = assign({
  invalidBecause: (context: TContext, event: TErrorEvent) => {
    return [
      ...context.invalidBecause,
      ...(event.data.invalidReason ? [event.data.invalidReason] : []),
    ];
  },
});

const setInvalidNumberOfPlayers = assign({
  invalidBecause: (context: TContext) => {
    const reason = {
      type: "numberOfPlayers",
      allowedRange: getMinAndMaxPlayers(context.selectedGameId),
      currentPlayerCount: getPlayerCount(context),
    };
    return [...context.invalidBecause, reason];
  },
});

const setInvalidDuplicateUserName = assign({
  invalidBecause: (context: TContext, event: TIdentifyUser) => {
    const reason = {
      type: "duplicateUserName",
      userName: event.userName,
    };
    return [...context.invalidBecause, reason];
  },
});

const conciergeMach = Machine<TContext, TStateSchema, TEvent>(
  {
    id: "concierge",
    initial: "who",
    context: {
      userNameLocal: null,
      friendsByUserName: FriendCollection([]),
      selectedGameId: null,
      invitesRecievedByUserName: {},
      invalidBecause: [],
    },
    states: {
      who: {
        initial: "waiting",
        onDone: "what",
        states: {
          waiting: {
            on: {
              IDENTIFY_USER: [
                {
                  target: "working",
                  actions: identifyUser,
                  cond: "uniqueUserNameLocal",
                },
                {
                  target: ".invalid",
                  actions: setInvalidDuplicateUserName,
                },
              ],
              FRIENDS_ARRIVE: {
                target: "waiting",
                actions: ackFriendsArrive,
              },
              FRIENDS_DEPART: {
                target: "waiting",
                actions: ackFriendsDepart,
              },
              RECIEVE_INVITES: {
                target: "waiting",
                actions: ackRecieveInvites,
              },
            },
            initial: "initial",
            states: {
              initial: {},
              invalid: {},
            },
          },
          working: {
            // TODO: handle server errors
            on: {
              FINISH_WORKING: "finished",
            },
            invoke: {
              id: "identifyUser",
              src: (_, event: TIdentifyUser) =>
                req.identifyUser({ userName: event.userName }),
              onDone: {
                target: "finished",
              },
              onError: {
                target: "error",
                actions: handleInvalidReason,
              },
            },
          },
          finished: {
            type: "final",
          },
          error: {
            on: {
              RETRY: "working",
            },
          },
        },
      },
      what: {
        initial: "waiting",
        states: {
          waiting: {
            initial: "initial",
            on: {
              SET_STATUS: {
                // Should this go to a different state?
                target: "waiting",
                actions: setStatus,
              },
              SELECT_GAME: {
                target: "working",
                actions: selectGame,
              },
              FRIENDS_ARRIVE: {
                target: "working",
                actions: ackFriendsArrive,
              },
              FRIENDS_DEPART: {
                target: "working",
                actions: ackFriendsDepart,
              },
              INVITE_FRIENDS: {
                target: "working",
                actions: inviteFriends,
              },
              FRIENDS_ACCEPT_INVITE: {
                target: "working",
                actions: ackAcceptedInvites,
              },
              RECIEVE_INVITES: {
                target: "#concierge.respondToInvites",
                actions: ackRecieveInvites,
              },
              ACCEPT_INVITE: {
                target: "working",
                actions: acceptInvite,
              },
              START_GAME: [
                {
                  target: "#concierge.startGame",
                  cond: "areSelectionsValid",
                },
                {
                  target: ".invalid",
                  actions: setInvalidNumberOfPlayers,
                },
              ],
            },
            states: {
              initial: {},
              invalid: {},
              ready: {},
            },
          },
          working: {
            initial: "fetching",
            states: {
              fetching: {
                invoke: {
                  id: "invites",
                  src: (
                    context: TContext,
                    event: TInviteFriends | TAcceptInvite
                  ) => {
                    switch (event.type) {
                      case "INVITE_FRIENDS":
                        return req.sendInvites(
                          event.userNames,
                          context.selectedGameId
                        );
                      case "ACCEPT_INVITE":
                        return req.acceptInvite(
                          context.userNameLocal,
                          event.userNameRemote
                        );
                      default:
                        return Promise.resolve({});
                    }
                  },
                  onDone: "#concierge.what.waiting.ready",
                  onError: {
                    target: "#concierge.what.waiting",
                    // actions: handleError,
                  },
                },
              },
            },
          },
          error: {},
        },
      },
      respondToInvites: {
        initial: "waiting",
        states: {
          waiting: {},
          working: {},
        },
      },
      startGame: {
        invoke: {
          id: "startGame",
          src: (context: TContext, event: TStartGame) => {
            return event.type === "START_GAME" &&
              context.invalidBecause.length === 0
              ? req.startGame(
                  getPlayers(context).keys(),
                  context.selectedGameId
                )
              : Promise.resolve({});
          },
          onDone: "#concierge.what.waiting.ready",
          onError: {
            target: "#concierge.what.waiting",
            // actions: handleError,
          },
        },
      },
    },
  },
  {
    guards: {
      areSelectionsValid,
      uniqueUserNameLocal,
    },
  }
);

export default conciergeMach;
