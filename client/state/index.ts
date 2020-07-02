// TODO refactor to use @state/fsm ?
import { createMachine, assign } from "@xstate/fsm";
import * as requests from "../requests";
import { IUser } from "../../server/state";
import * as Friends from "../../models/FriendCollection";
import * as Invites from "../../models/InviteCollection";

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

export interface TContext {
  userNameLocal?: string;
  friendsByUserName: Friends.TTabularMap;
  selectedGameId?: string;
  error?: Error;
  // TODO map invalid reason type to invalid reasons so only 1 per type?
  invalidBecause: TInvalidReason[];
  invitesRecievedByUserName: Invites.TTabularMap;
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
  currentStatus: requests.UserStatus;
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

type TRetry = {
  type: "RETRY";
};

export type TEvent =
  | TIdentifyUser
  | TInviteFriends
  | TRecieveInvites
  | TFriendsAcceptInvite
  | TAcceptInvite
  | TFriendsArrive
  | TFriendsDepart
  | TSelectGame
  | TStartGame
  | TSetStatus
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

// TODO should this be a collection method?
export function getPlayerCount(context: TContext) {
  /* add one to count local user
   * TODO: what if local user is spectating?
   */
  return (
    Friends.filter(
      context.friendsByUserName,
      ({ isInvited, hasAcceptedInvite }) => isInvited && hasAcceptedInvite
    ).size + 1
  );
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

// Optimistically update
export const optUpFriendsInvited = assign({
  friendsByUserName: (context: TContext, event: TInviteFriends) => {
    return Friends.update(
      context.friendsByUserName,
      (entry) => ({
        ...entry,
        isInvited: true,
      }),
      { subset: event.userNames }
    );
  },
});

const acceptInvite = assign({
  invitesRecievedByUserName: (context: TContext, event: TAcceptInvite) => {
    return Invites.update(
      context.invitesRecievedByUserName,
      (entry) => ({ ...entry, hasBeenAccepted: true }),
      { subset: [event.userNameRemote] }
    );
  },
});

const ackAcceptedInvites = assign({
  friendsByUserName: (context: TContext, event: TFriendsAcceptInvite) => {
    return Friends.update(
      context.friendsByUserName,
      (entry) => ({
        ...entry,
        hasAcceptedInvite: true,
      }),
      { subset: event.userNames }
    );
  },
});

const ackFriendsArrive = assign({
  friendsByUserName: (context: TContext, event: TFriendsArrive) => {
    return Friends.add(
      context.friendsByUserName,
      event.users.map(({ userName }) => ({
        userName,
        // shower thought: normalize this data using InviteCollection?
        isInvited: false,
        hasAcceptedInvite: false,
      }))
    );
  },
});

const ackFriendsDepart = assign({
  friendsByUserName: (context: TContext, event: TFriendsDepart) => {
    return Friends.drop(context.friendsByUserName, event.userNames);
  },
});

const ackRecieveInvites = assign({
  invitesRecievedByUserName: (context: TContext, event: TRecieveInvites) => {
    return Invites.add(context.invitesRecievedByUserName, event.payload);
  },
});

const selectGame = assign({
  selectedGameId: (_, { gameId }: TSelectGame) => gameId,
});

const setStatus = assign({
  currentStatus: (_, { currentStatus }: TSetStatus) => ({ currentStatus }),
});

const setInvalidGame = assign({
  invalidBecause: (context: TContext) => {
    const reason = context.selectedGameId
      ? {
          type: "numberOfPlayers",
          allowedRange: getMinAndMaxPlayers(context.selectedGameId),
          currentPlayerCount: getPlayerCount(context),
        }
      : {
          type: "noGameSelected",
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

const eventRequestMap = {
  IDENTIFY_USER: (_: TContext, { userName }: TIdentifyUser) => {
    return requests.identifyUser({ userName });
  },
  INVITE_FRIENDS: (context: TContext, { userNames }: TInviteFriends) => {
    return requests.sendInvites(userNames, context.selectedGameId);
  },
  ACCEPT_INVITE: (context: TContext, { userNameRemote }: TAcceptInvite) => {
    return requests.acceptInvite(
      context.userNameLocal || "no name",
      userNameRemote
    );
  },
  START_GAME: (context: TContext) => {
    const userNames = [
      ...Friends.filter(
        context.friendsByUserName,
        ({ isInvited, hasAcceptedInvite }) => isInvited && hasAcceptedInvite
      ).keys(),
    ];
    if (context.selectedGameId) {
      return requests.startGame(userNames, context.selectedGameId);
    }
  },
};

const conciergeMach = createMachine<TContext, TEvent>({
  id: "concierge",
  initial: "facil",
  context: {
    friendsByUserName: Friends.create([]),
    invitesRecievedByUserName: Invites.create([]),
    invalidBecause: [],
  },
  states: {
    facil: {
      on: {
        IDENTIFY_USER: [
          {
            target: "facil",
            actions: [identifyUser, eventRequestMap.IDENTIFY_USER],
            cond: uniqueUserNameLocal,
          },
          {
            target: "facil",
            actions: setInvalidDuplicateUserName,
          },
        ],
        FRIENDS_ARRIVE: {
          target: "facil",
          actions: ackFriendsArrive,
        },
        FRIENDS_DEPART: {
          target: "facil",
          actions: ackFriendsDepart,
        },
        RECIEVE_INVITES: {
          target: "facil",
          actions: ackRecieveInvites,
        },
        SET_STATUS: {
          target: "facil",
          actions: setStatus,
        },
        SELECT_GAME: {
          target: "facil",
          actions: selectGame,
        },
        INVITE_FRIENDS: {
          target: "facil",
          actions: [optUpFriendsInvited, eventRequestMap.INVITE_FRIENDS],
        },
        FRIENDS_ACCEPT_INVITE: {
          target: "facil",
          actions: ackAcceptedInvites,
        },
        ACCEPT_INVITE: {
          target: "facil",
          // cond: localUserHasBeenIdentified TODO
          actions: [acceptInvite, eventRequestMap.ACCEPT_INVITE],
        },
        START_GAME: [
          {
            target: "facil",
            cond: areSelectionsValid,
            actions: eventRequestMap.START_GAME,
          },
          {
            target: "facil",
            actions: setInvalidGame,
          },
        ],
      },
    },
  },
});

export default conciergeMach;
