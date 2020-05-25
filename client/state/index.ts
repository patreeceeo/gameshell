// TODO refactor to use @state/fsm ?
import { Machine, StateNodeConfig, assign } from "xstate";
// TODO use T instead of I
// also favor classes over interfaces?
// also find a central place for these types
import * as req from "../requests";
import { IUser } from "../../server/state";

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

/* MAYBE TODO: a better name than 'friend'? */
interface TFriend {
  isInvited: boolean;
  hasAcceptedInvite: boolean;
}

interface TFriendCollection {
  [userName: string]: TFriend;
}

interface TInvalidReason {
  type: string;
  [key: string]: any;
}

interface TInviteRecieved {
  userNameFrom: string;
  gameId?: string;
}

interface TInvitesRecievedCollection {
  [userName: string]: TInviteRecieved;
}

interface TContext {
  localUserName?: string;
  friendsByUserName: TFriendCollection;
  selectedGameId?: string;
  error?: Error;
  invalidBecause: TInvalidReason[];
  invitesRecievedByUserName: TInvitesRecievedCollection;
}

interface TStateSchema {
  states: {
    who: TWaitThenWorkStateNodeConfig;
    what: TWaitThenWorkStateNodeConfig;
    respondToInvites: TWaitThenWorkStateNodeConfig;
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

type TErrorEvent = {
  type: string;
  data: Error;
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
  | TFriendsArrive
  | TSelectGame
  | { type: "START_GAME" }
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

function getPlayerCount(context: TContext) {
  /* add one to count local user
   * TODO: what if local user is spectating?
   */
  return (
    Object.values(context.friendsByUserName).filter(
      ({ isInvited, hasAcceptedInvite }) => isInvited && hasAcceptedInvite
    ).length + 1
  );
}

function areSelectionsValid(context: TContext) {
  const [min, max] = getMinAndMaxPlayers(context.selectedGameId) || [
    0,
    Infinity,
  ];
  /* add one to count local user
   * TODO: what if local user is spectating?
   */
  const playerCount = getPlayerCount(context);
  return playerCount >= min && playerCount <= max;
}

export const identifyUser = assign({
  localUserName: (_, { userName }: TIdentifyUser) => userName,
});

const inviteFriends = assign({
  friendsByUserName: (context: TContext, event: TInviteFriends) => {
    // TODO: watch out for memory leaks!
    return event.userNames.reduce((acc: TFriendCollection, name: string) => {
      return {
        ...acc,
        [name]: {
          ...acc[name],
          isInvited: true,
        },
      };
    }, context.friendsByUserName);
  },
});

const ackAcceptedInvites = assign({
  friendsByUserName: (context: TContext, event: TFriendsAcceptInvite) => {
    // TODO: watch out for memory leaks!
    return event.userNames.reduce((acc: TFriendCollection, name: string) => {
      return {
        ...acc,
        [name]: {
          ...acc[name],
          hasAcceptedInvite: true,
        },
      };
    }, context.friendsByUserName);
  },
});

const ackFriendsArrive = assign({
  friendsByUserName: (context: TContext, event: TFriendsArrive) => {
    // TODO: watch out for memory leaks!
    return event.users.reduce((acc: TFriendCollection, { userName }) => {
      return {
        ...acc,
        [userName]: {
          isInvited: false,
          hasAcceptedInvite: false,
        },
      };
    }, context.friendsByUserName);
  },
});

const ackRecieveInvites = assign({
  invitesRecievedByUserName: (context: TContext, event: TRecieveInvites) => {
    // TODO: watch out for memory leaks!
    return event.payload.reduce((acc: TInvitesRecievedCollection, invite) => {
      return {
        ...acc,
        [invite.userNameFrom]: {
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

const handleError = assign({
  error: (_, event: TErrorEvent) => {
    return event.data;
  },
});

const setInvalid = assign({
  invalidBecause: (context: TContext) => {
    const reason = {
      type: "numberOfPlayers",
      allowedRange: getMinAndMaxPlayers(context.selectedGameId),
      currentPlayerCount: getPlayerCount(context),
    };
    return [...context.invalidBecause, reason];
  },
});

const conciergeMach = Machine<TContext, TStateSchema, TEvent>(
  {
    id: "concierge",
    initial: "who",
    context: {
      localUserName: null,
      friendsByUserName: {},
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
              IDENTIFY_USER: {
                target: "working",
                actions: identifyUser,
              },
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
                actions: handleError,
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
            },
            states: {
              initial: {},
              invalid: {
                entry: setInvalid,
              },
              ready: {},
            },
          },
          working: {
            initial: "validating",
            states: {
              validating: {
                on: {
                  "": [
                    {
                      target: "fetching",
                      cond: "areSelectionsValid",
                    },
                    {
                      target: "#concierge.what.waiting.invalid",
                    },
                  ],
                },
              },
              fetching: {
                invoke: {
                  id: "invites",
                  src: (context: TContext, event: TInviteFriends) => {
                    if (event.type === "INVITE_FRIENDS") {
                      return req.sendInvites(
                        event.userNames,
                        context.selectedGameId
                      );
                    } else {
                      return Promise.resolve({});
                    }
                  },
                  onDone: "#concierge.what.waiting.ready",
                  onError: {
                    target: "#concierge.what.waiting",
                    actions: handleError,
                  },
                },
              },
            },
          },
          error: {},
          // validating: {
          //   on: {
          //     "": [
          //       {
          //         target: "waiting.ready",
          //         cond: "areSelectionsValid",
          //       },
          //       {
          //         target: "waiting.invalid",
          //       },
          //     ],
          //   },
        },
      },
      respondToInvites: {
        initial: "waiting",
        states: {
          waiting: {},
          working: {},
        },
      },
    },
  },
  {
    guards: {
      areSelectionsValid,
    },
  }
);

export default conciergeMach;
