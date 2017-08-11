import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SpawnControllerMemory {
  spawnQueue: Array<{ name: string; request: SpawnRequest }>;
  spawnStatus: { [name: string]: EPosisSpawnStatus };
}

export interface SpawnRequest {
  rooms: string[];
  body: BodyPartType[][];
  priority?: number | undefined;
  pid?: PosisPID | undefined;
}

export class SpawnController extends BasicProcess<SpawnControllerMemory> implements IPosisSpawnExtension {

  public notify(msg: any): void {
    this.sleep(0);
  }

  public run(): void {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        delete this.memory.spawnStatus[name];
      }
    }

    if (this.memory.spawnQueue.length === 0) {
      this.sleep(100);
      return;
    }
    const spawns = _.filter(Game.spawns, (spawn: Spawn) => !spawn.spawning);

    for (let i = this.memory.spawnQueue.length - 1; i >= 0; i--) {
      const req = this.memory.spawnQueue[i];
      const rankedSpawns = this.rankSpawns(spawns, req.request);
      const spawnCost = this.calculateBodyCost(req.request.body[0]);

      for (let j = 0; j < rankedSpawns.length; j++) {
        if (rankedSpawns[j].rank - spawnCost >= 0) {
          const rslt = rankedSpawns[j].spawn.createCreep(req.request.body[0], req.name);
          if (_.isString(rslt)) {
            spawns.splice(rankedSpawns[j].index, 1);
            this.memory.spawnQueue.splice(i, 1);
            this.memory.spawnStatus[req.name] = EPosisSpawnStatus.SPAWNING;
            break;
          }
        }
      }
    }
  }

  private rankSpawns(spawns: StructureSpawn[], request: SpawnRequest):
    Array<{ index: number, rank: number, spawn: StructureSpawn }> {

    return _.map(spawns, (spawn: Spawn, index: number) => {
      const dist = Game.map.getRoomLinearDistance(spawn.room.name, request.rooms[0]);
      const rank = spawn.room.energyAvailable - (dist * 50);
      return { index, rank, spawn };
    }).sort((s) => s.rank);
  }

  private calculateBodyCost(body: BodyPartType[]): number {
    let cost = 0;
    for (let i = 0; i < body.length; i++) {
      cost += BODYPART_COST[body[i] as string];
    }
    return cost;
  }

  private generateName(): string {
    let name = "";
    name += Game.time.toString(16).slice(-4);
    name += ":";
    name += Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(-4);
    return name;
  }

  public spawnCreep(opts: SpawnRequest): string {
    if (opts.body.length === 0) { throw new Error("no body def given"); }
    const req = { name: this.generateName(), request: opts };
    this.memory.spawnQueue.push(req);
    this.memory.spawnStatus[req.name] = EPosisSpawnStatus.QUEUED;
    return req.name;
  }

  public getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
    const stat = { status: this.memory.spawnStatus[id] || EPosisSpawnStatus.ERROR };
    if (stat.status === EPosisSpawnStatus.SPAWNING && Game.creeps[id] && !Game.creeps[id].spawning) {
      this.memory.spawnStatus[id] = EPosisSpawnStatus.SPAWNED;
      stat.status = EPosisSpawnStatus.SPAWNED;
    }
    return stat;
  }

  public getCreep(id: string): Creep | undefined {
    const stat = this.getStatus(id);
    if (stat.status === EPosisSpawnStatus.SPAWNED) {
      return Game.creeps[id];
    } else {
      return undefined;
    }
  }

}
