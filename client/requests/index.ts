import * as socketIO from "socket.io-client";
import { IUser } from "../../server/state";
import { TInviteRecieved } from "../state";

export class Identity {
  constructor(readonly userName: string) {}
}

class Response {
  success: boolean;
}

const socket = socketIO();

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
  socket.emit("identifyUser", userName);
  return { success: true };
}

export function onFriendsArrive(callback: (users: IUser[]) => void) {
  socket.on("friendsArrive", callback);
}

export function onFriendsDepart(callback: (userNames: string[]) => void) {
  socket.on("friendsDepart", callback);
}

export function onRecieveInvites(
  callback: (invites: TInviteRecieved[]) => void
) {
  socket.on("recieveInvites", callback);
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
  socket.emit("sendInvites", userNames, gameId);
  return { success: true };
}

export async function startGame(
  userNames: string[],
  gameId: string
): Promise<Response> {
  void userNames;
  void gameId;
  return { success: true };
}

export async function acceptInvite(
  userNameLocal: string,
  userNameRemote: string
): Promise<Response> {
  void userNameLocal;
  void userNameRemote;
  return { success: true };
}
