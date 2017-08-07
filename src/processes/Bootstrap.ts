import { BasicProcess } from "../kernel/processes/BasicProcess";
export interface BootstrapMemory {
  room: string;
  workerNames: string[];
}

export class BootstrapProcess extends BasicProcess<BootstrapMemory> {
  private static workerBody = [WORK, MOVE, CARRY];

  public notify(msg: any): void {
    throw new Error("Not implemented yet.");
  }

  public run(): void {
    throw new Error("Not implemented yet.");
  }
}
