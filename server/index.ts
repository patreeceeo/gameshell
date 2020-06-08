import { Application } from "express";
import { createServer } from "http";
import * as socketIO from "socket.io";
import { partial } from "../utils";
import { addPlayer, listPlayers } from "./state";

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
  socket.on("disconnect", partial(handleDisconnection, socket));
  socket.on("identifyUser", partial(handleIdentifyUser, socket));
  socket.on("sendInvites", partial(handleSendInvites, socket));
}

const socketsByUserName: { [userName: string]: socketIO.Socket } = {};
const userNamesBySocketId: { [socketId: string]: string } = {};

async function handleIdentifyUser(socket: socketIO.Socket, userName: string) {
  await addPlayer(userName);
  socketsByUserName[userName] = socket;
  userNamesBySocketId[socket.id] = userName;

  const allPlayers = await listPlayers();

  Object.entries(socketsByUserName).forEach(([recievingUserName, socket]) => {
    const otherPlayers = allPlayers.filter(
      ({ userName }) => userName !== recievingUserName
    );
    socket.emit("friendsArrive", otherPlayers);
  });
}

async function handleSendInvites(
  socket: socketIO.Socket,
  userNames: string,
  gameId: string
) {
  const invite = {
    userNameRemote: userNamesBySocketId[socket.id],
    gameId,
  };
  Object.entries(socketsByUserName).forEach(([recievingUserName, socket]) => {
    if (userNames.includes(recievingUserName)) {
      socket.emit("recieveInvites", [invite]);
    }
  });
}

function handleDisconnection(socket: socketIO.Socket) {
  count--;
  console.log("disconnected!");
  const userNameDeparted = userNamesBySocketId[socket.id];
  delete userNamesBySocketId[socket.id];
  delete socketsByUserName[userNameDeparted];
  socket.broadcast.emit("friendsDepart", [userNameDeparted]);
}
