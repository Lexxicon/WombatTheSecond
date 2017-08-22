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
