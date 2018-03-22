export interface Role<MEM> {
  id: string;
  create(spawn: StructureSpawn, mem: MEM): void;
  run(creep: Creep): void;
}
