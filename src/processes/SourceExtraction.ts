import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SourceExtractionMemory {
  room: RoomName;
}

export class SourceExtractionProcess extends BasicProcess<SourceExtractionMemory> {
  public static imageName = "Overmind/SourceExtractionProcess";

  public notify(msg: WombatMessage): void {
    throw new Error("Not implemented yet.");
  }

  public run(): void {
    throw new Error("Not implemented yet.");
  }
}
