import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SpawnControllerMemory {
  spawnQueue: Array<{ name: string; request: SpawnRequest }>;
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

  private generateName(): string {
    let name = "";
    name += Game.time.toString(16).slice(-4);
    name += ":";
    name += Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(-4);
    return name;
  }

  public spawnCreep(opts: SpawnRequest): string {
    const req = { name: this.generateName(), request: opts };
    this.memory.spawnQueue.push(req);
    return req.name;
  }

  public getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
    throw new Error("Method not implemented.");
  }

  public getCreep(id: string): Creep | undefined {
    throw new Error("Method not implemented.");
  }

}
