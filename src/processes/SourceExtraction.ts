import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SourceExtractionMemory {
  room: string;
  souceId: string;
  workerSpot: RoomPosition;

  worker: string;
  prespawn: number;
}

export class SourceExtractionProcess extends BasicProcess<SourceExtractionMemory> {
  public static imageName = "Overmind/SourceExtractionProcess";

  @posisInterface("spawn")
  private spawner!: IPosisSpawnExtension;

  constructor(context: IPosisProcessContext) {
    super(context);
    if (this.memory.room === undefined) {
      throw new Error("Must specify room");
    }
    if (this.memory.souceId === undefined) {
      throw new Error("Must specify souceId");
    }
  }

  public notify(msg: WombatMessage): void {
    //
  }

  public run(): void {
    const source = Game.getObjectById<Source>(this.memory.souceId);
    if (source === undefined || source === null) {
      this.log.warn("lost vision on source?");
      return;
    }
  }
}
