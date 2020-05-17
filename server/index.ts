import { Application } from "express";
import { createServer } from "http";
import * as socketIO from "socket.io";

interface IMessageArrive {
  userName: string;
}

type GameName = "snake" | "mario";

type RoleName = "player" | "spectator";

interface IState {
  users: IUser[];

  inProgressGame?: GameName;
}

interface IUser {
  userName: string;
  role: RoleName;
}

const state: IState = {
  users: [],
};

function gameIsInProgress() {
  return !!state.inProgressGame;
}

function addPlayer(socket: socketIO.Socket, userName: string) {
  state.users.push({
    userName,
    role: "player",
  });
  respond(socket);
}

function addSpectator(socket: socketIO.Socket, userName: string) {
  state.users.push({
    userName,
    role: "spectator",
  });
  respond(socket);
}

function listPlayers(): IUser[] {
  return state.users.filter(({ role }) => role === "player");
}

function listSpectators(): IUser[] {
  return state.users.filter(({ role }) => role === "player");
}

function respond(socket: socketIO.Socket) {
  socket.emit("listPlayers", listPlayers());
  socket.emit("listSpectators", listSpectators());
}

export function startMainLoop(app: Application): void {
  const http = createServer(app);
  const io = socketIO(http);

  const portNumber = process.env.PORT || 3000;

  io.on("connection", handleConnection);
  http.listen(portNumber, () => {
    console.log(`listening on *:${portNumber}`);
  });
}

/* use partial? */
function asHandler(
  fn: (socket: socketIO.Socket, ...args: any[]) => any
): (...args: any[]) => any {
  return (socket: socketIO.Socket) => (...args: any[]) => fn(socket, ...args);
}

function handleConnection(socket: socketIO.Socket) {
  socket.on("disconnect", handleDisconnection);
  socket.on("arrive", asHandler(handleArrive)(socket));
  respond(socket);
}

function handleArrive(socket: socketIO.Socket, message: IMessageArrive) {
  if (gameIsInProgress()) {
    addSpectator(socket, message.userName);
  } else {
    addPlayer(socket, message.userName);
  }
}

function handleDisconnection() {
  console.log("disconnected!");
}
