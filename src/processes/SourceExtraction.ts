import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SourceExtractionMemory {
  room: string;
  souceId: SourceId;
  containerId: StructureId<Container>;
  workerSpot: RoomPosition;

  worker: CreepName;
  prespawn: number;

  hauler: CreepName;

  storageId: StructureId<Structure>;
  distanceToStorage: number;
}

export class SourceExtractionProcess extends BasicProcess<SourceExtractionMemory> {
  public static imageName = "Overmind/SourceExtractionProcess";

  @posisInterface("spawn")
  private spawner: IPosisSpawnExtension;

  constructor(context: IPosisProcessContext) {
    super(context);
    if (this.memory.room === undefined) {
      throw new Error("Must specify room");
    }
    if (this.memory.souceId === undefined) {
      throw new Error("Must specify souceId");
    }
    if (this.memory.storageId === undefined) {
      throw new Error("Must specify storageId");
    }
  }

  public notify(msg: WombatMessage): void {
    //
  }

  private initMemory(storage: Structure, source: Source): void {
    if (this.memory.distanceToStorage === undefined) {
      const path = PathFinder.search(storage.pos, source.pos);
      this.memory.distanceToStorage = path.path.length;
      this.memory.workerSpot = path.path[Math.max(0, path.path.length - 2)];
    }
    if (this.memory.containerId === undefined) {
      const result = Game.rooms[this.memory.room].lookForAt(LOOK_STRUCTURES, this.memory.workerSpot);
      if (result === undefined || result === null || result.length === 0) {
        // no container?
      } else {
        if (result[0].structureType === STRUCTURE_CONTAINER) {
          this.memory.containerId = result[0].id;
        } else {
          // what did we find?!
        }
      }
    }
  }

  public run(): void {
    const source = Game.getObjectById(this.memory.souceId);
    if (source === undefined || source === null) {
      this.log.info("lost vision on source?");
      return;
    }
    const storage = Game.getObjectById(this.memory.storageId)!;
    if (storage === undefined || storage === null) {
      this.log.info("lost vision on storage?");
      return;
    }
    this.initMemory(storage, source);
  }
}
