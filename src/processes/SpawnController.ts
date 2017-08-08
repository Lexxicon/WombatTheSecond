import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SpawnControllerMemory {
  spawnQueue: SpawnRequest[];
}

export interface SpawnRequest {
  rooms: string[];
  body: string[][];
  priority?: number | undefined;
  pid?: string | number | undefined;
}

export class SpawnController extends BasicProcess<SpawnControllerMemory> implements IPosisSpawnExtension {

  public notify(msg: any): void {
    this.sleep(0);
  }

  public run(): void {
    if (this.memory.spawnQueue.length === 0) {
      this.sleep(100);
      return;
    }
  }

  public spawnCreep(opts: SpawnRequest): string {
    throw new Error("Method not implemented.");
  }

  public getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
    throw new Error("Method not implemented.");
  }

  public getCreep(id: string): Creep | undefined {
    throw new Error("Method not implemented.");
  }

}
