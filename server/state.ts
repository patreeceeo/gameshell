type GameName = "snake" | "mario";

type RoleName = "player" | "spectator";

interface IState {
  users: IUser[];

  inProgressGame?: GameName;
}

export interface IUser {
  userName: string;
  role: RoleName;
}

const state: IState = {
  users: [],
};

export async function gameIsInProgress() {
  return !!state.inProgressGame;
}

export async function addPlayer(userName: string) {
  const player: IUser = {
    userName,
    role: "player",
  };
  state.users.push(player);
  return player;
}

export async function addSpectator(userName: string) {
  const spectator: IUser = {
    userName,
    role: "spectator",
  };
  state.users.push(spectator);
  return spectator;
}

export async function listPlayers(): Promise<IUser[]> {
  return state.users.filter(({ role }) => role === "player");
}

export async function listSpectators(): Promise<IUser[]> {
  return state.users.filter(({ role }) => role === "player");
}

