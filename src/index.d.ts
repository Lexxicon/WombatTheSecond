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

declare module NodeJS {
  interface Global {
    TERRAIN_PLAIN: TerrainType;
    TERRAIN_SWAMP: TerrainType;
    TERRAIN_WALL: TerrainType;
  }
}
