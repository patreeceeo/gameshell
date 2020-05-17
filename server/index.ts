import { Application } from "express";
import { createServer } from "http";
import * as socketIO from "socket.io";
import {
  gameIsInProgress,
  addPlayer,
  addSpectator,
  listSpectators,
  listPlayers,
} from "./state";
import { partial } from "../utils";

interface IMessageArrive {
  userName: string;
}

let count = 0;

export function startMainLoop(app: Application): void {
  const http = createServer(app);
  const io = socketIO(http);

  const portNumber = process.env.PORT || 3000;

  io.on("connection", handleConnection);

  http.listen(portNumber, () => {
    console.log(`listening on *:${portNumber}`);
  });
}

function handleConnection(socket: socketIO.Socket) {
  count++;
  console.log("there are now", count, "clients");
  socket.on("disconnect", handleDisconnection);
  socket.on("arrive", partial(handleArrive, socket));
}

function emitToAll(socket: socketIO.Socket, message: string, data: any) {
  socket.emit(message, data);
  socket.broadcast.emit(message, data);
}

async function handleArrive(socket: socketIO.Socket, message: IMessageArrive) {
  if (await gameIsInProgress()) {
    await addSpectator(message.userName);
    emitToAll(socket, "addSpectator", {
      spectators: await listSpectators(),
    });
  } else {
    await addPlayer(message.userName);
    emitToAll(socket, "addPlayer", {
      players: await listPlayers(),
    });
  }
}

function handleDisconnection() {
  count--;
  console.log("disconnected!");
}
