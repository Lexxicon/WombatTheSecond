import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface ArchitectMemory {
  room: RoomName;
}

export class ArchitectProcess extends BasicProcess<ArchitectMemory> {
  public static imageName = "Overmind/ArchitectProcess";

  public notify(msg: WombatMessage): void {
    throw new Error("Not implemented yet.");
  }

  public run(): void {
    throw new Error("Not implemented yet.");
  }
}
