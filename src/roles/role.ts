import { Hive } from "../managers/RoomManager";

export interface Role<MEM> {
  id: string;
  create(spawn: StructureSpawn): string | undefined;
  initMemory(): MEM;
  run(creep: Creep, memory: MEM, roomMemory: Hive): void;
}
