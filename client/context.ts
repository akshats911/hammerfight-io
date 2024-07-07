import { Socket } from "socket.io-client";
import { assert } from "../common/errors";
import { Room } from "../common/types/room";
import {
  SocketIoClientSentEvents,
  SocketIoServerSentEvents,
} from "../common/types/socket-io";

export type Context = {
  socket: Socket<SocketIoServerSentEvents, SocketIoClientSentEvents>;
  room: Room;
  playerId: string;
  debugMode: boolean;
};

let context: Context | undefined;

export function getContext() {
  assert(context, "Context should be initialized");
  return context;
}

export function setContext(newContext: Context) {
  assert(!context, "Context should not be defined");
  context = newContext;
}

export function destroyContext() {
  context = undefined;
}

export function isDebugMode(): boolean {
  return getContext().debugMode;
}
