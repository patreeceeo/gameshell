// import { Identity } from "../../server/state";

export class Identity {
  constructor(readonly userName: string) {}
}

class Response {
  success: boolean;
}

export class UserStatus {
  static ready(value: boolean) {
    void value;
    return new UserStatus();
  }
  static custom(value: string) {
    void value;
    return new UserStatus();
  }
}

export async function identifyUser({ userName }: Identity): Promise<Response> {
  void userName;
  return { success: true };
}

export async function setStatus(
  id: Identity,
  statusValue: UserStatus
): Promise<Response> {
  void id;
  void statusValue;
  return { success: true };
}

export async function sendInvites(
  userNames: string[],
  gameId?: string
): Promise<Response> {
  void userNames;
  void gameId;
  return { success: true };
}

export async function startGame(
  players: Identity[],
  gameId: string
): Promise<Response> {
  void players;
  void gameId;
  return { success: true };
}
