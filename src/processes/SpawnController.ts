import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { SpawnNotifier } from "./SpawnNotifier";

export interface SpawnControllerMemory {
  spawnQueue: Array<{ name: string; request: SpawnRequest }>;
  spawnStatus: { [name: string]: EPosisSpawnStatus };
}

export interface SpawnRequest {
  rooms: string[];
  body: BodyPartConstant[][];
  priority?: number | undefined;
  pid?: PosisPID | undefined;
}

export class SpawnController extends BasicProcess<SpawnControllerMemory> implements IPosisSpawnExtension {
  public static imageName: string = "Overmind/SpawnController";

  @posisInterface("extensionRegistry")
  public extensionReg!: WombatExtensionRegistry;

  constructor(context: IPosisProcessContext) {
    super(context);
    this.extensionReg.register("spawn", this);
  }

  public notify(msg: WombatMessage): void {
    this.log.info("interupting sleep");
    this.sleep(0);
  }

  public run(): void {
    this.cleanUpMemory();

    if (this.memory.spawnQueue.length === 0) {
      this.sleep(100);
      return;
    }

    const spawns = _.filter(Game.spawns, (spawn: Spawn) => !spawn.spawning);

    for (let i = this.memory.spawnQueue.length - 1; i >= 0; i--) {
      const req = this.memory.spawnQueue[i];
      const rankedSpawns = this.rankSpawns(spawns, req.request);

      for (let j = 0; j < rankedSpawns.length; j++) {
        const rslt = rankedSpawns[j].spawn.createCreep(req.request.body[0], req.name, { pid: req.request.pid });
        if (_.isString(rslt)) {
          spawns.splice(rankedSpawns[j].index, 1);
          this.log.info("spawning: " + req.name);
          this.memory.spawnQueue.splice(i, 1);
          this.memory.spawnStatus[req.name] = EPosisSpawnStatus.SPAWNING;
          this.kernel.startProcess(SpawnNotifier.imageName, { creep: req.name });
          break;
        }
      }
    }
  }

  private cleanUpMemory(): void {
    const spawnStatus = this.memory.spawnStatus;
    for (const name in Memory.creeps) {
      const creep = Game.creeps[name];
      // purge dead creeps
      if (!creep && spawnStatus[name] !== EPosisSpawnStatus.SPAWNING) {
        this.log.debug("removing " + name);
        delete Memory.creeps[name];
        delete spawnStatus[name];
      }
    }
  }

  private rankSpawns(spawns: StructureSpawn[], request: SpawnRequest):
    Array<{ index: number, rank: number, spawn: StructureSpawn }> {

    const spawnCost = this.calculateBodyCost(request.body[0]);
    return _(spawns)
      // spawn doesn't have enough to fulfill request
      .filter((s) => s.room.energyAvailable >= spawnCost)
      // rank spawn based on distance and available energy
      .map((spawn: Spawn, index: number) => {
        const dist = Game.map.getRoomLinearDistance(spawn.room.name, request.rooms[0]);
        const rank = spawn.room.energyAvailable - (dist * 50);
        return { index, rank, spawn };
      })
      // order by rank
      .sort((s) => s.rank).value();
  }

  private calculateBodyCost(body: BodyPartConstant[]): number {
    let cost = 0;
    for (let i = 0; i < body.length; i++) {
      cost += BODYPART_COST[body[i]];
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
    // odds are we are sleeping and this is the first request, so wake us up
    if (this.memory.spawnQueue.length === 1) {
      this.sleep(0);
    }
    return req.name;
  }

  public getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
    const stat = { status: this.memory.spawnStatus[id], message: "" };
    if (stat.status === EPosisSpawnStatus.SPAWNING && Game.creeps[id] && !Game.creeps[id].spawning) {
      this.memory.spawnStatus[id] = EPosisSpawnStatus.SPAWNED;
      stat.status = EPosisSpawnStatus.SPAWNED;
    }
    if (stat.status === undefined) {
      stat.status = EPosisSpawnStatus.ERROR;
      stat.message = "Missing from memory";
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
