
export interface Role<MEM> {
  id: string;
  create(spawn: StructureSpawn): string | undefined;
  initMemory(): MEM;
  run(creep: Creep, memory: MEM): void;
}
