import { Application } from "express";
import { createServer } from "http";
import * as socketIO from "socket.io";

export function startSocketApp(app: Application) {
  const io = socketIO(createServer(app));
}
