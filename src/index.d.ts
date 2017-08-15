interface Memory {
  uuid: number;
  username: string;
  revision: string;
  buildTime: string;
  kernel: {};
  pids: {};
}

interface CreepMemory {
  pid?: PosisPID;
}

declare const ROOM_WIDTH = 50;
declare const ROOM_HEIGHT = 50;
