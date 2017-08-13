import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface EmergencyWorkerMemory {
  room: string;
  workerId: CreepNameOrString;
  state: State;
  job?: Job;
  sourceTarget?: SourceId;
  spawnTarget?: StructureId<StructureSpawn>;
  constructionTarget?: ConstructionSiteId;
}

enum State {
  GATHER,
  WORK
}

enum Job {
  FILL,
  BUILD,
  UPGRADE,
}

export class EmergencyWorkerProcess extends BasicProcess<EmergencyWorkerMemory> {
  public static imageName = "Overmind/EmergencyWorkerProcess";

  @posisInterface("spawn")
  private spawner: IPosisSpawnExtension;

  public notify(msg: WombatMessage): void {
    this.log.debug(() => JSON.stringify(msg));
  }

  public run() {
    const creep = this.spawner.getCreep(this.memory.workerId as string);
    if (creep === undefined) {
      this.log.debug(`Creep ${this.memory.workerId} is no more`);
      return 1;
    }
    switch (creep.carry.energy) {
      case 0:
        this.memory.state = State.GATHER;
        // clear memory of previous job
        delete this.memory.job;
        delete this.memory.constructionTarget;
        delete this.memory.spawnTarget;
        break;
      case creep.carryCapacity:
        this.memory.state = State.WORK;
        // clear memory of the gather
        delete this.memory.sourceTarget;
        break;
    }

    switch (this.memory.state) {
      case State.GATHER: this.doGather(creep); break;
      case State.WORK: this.doWork(creep); break;
    }
  }

  private doWork(creep: Creep) {
    switch (this.memory.job) {
      // fall through to find job it should do
      default:
      case Job.FILL:
        if (this.fillSpawn(creep)) { this.memory.job = Job.FILL; break; }
        this.log.debug("failed fill");
      case Job.BUILD:
        if (this.build(creep)) { this.memory.job = Job.BUILD; break; }
        this.log.debug("failed build");
      case Job.UPGRADE:
        if (this.upgradeController(creep)) { this.memory.job = Job.UPGRADE; break; }
        this.log.debug("failed upgrade");
        this.log.warn("failed to find a task");
        delete this.memory.job;
    }
  }

  private find<T extends RoomObject & { id: ObjectId<T> }>(lookup: FindType<T>): ObjectId<T> | undefined {
    const results = Game.rooms[this.memory.room].find(lookup);
    if (results.length > 0) {
      return results[0].id;
    } else {
      return undefined;
    }
  }

  private upgradeController(creep: Creep) {
    const controller = Game.rooms[this.memory.room].controller!;
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }
    return true;
  }

  private fillSpawn(creep: Creep): boolean {
    if (this.memory.spawnTarget === undefined) {
      this.memory.spawnTarget = this.find(FIND_MY_SPAWNS);
    }

    if (this.memory.spawnTarget === undefined) {
      this.log.warn("no spawn target id");
    } else {
      const spawn = Game.getObjectById(this.memory.spawnTarget);
      if (spawn === undefined || spawn === null) {
        this.log.warn("failed to lookup room spawn");
        delete this.memory.spawnTarget;
      } else if (spawn.energy !== spawn.energyCapacity) {
        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(spawn);
        }
        return true;
      }
    }
    return false;
  }

  private build(creep: Creep): boolean {
    if (this.memory.constructionTarget === undefined) {
      this.memory.constructionTarget = this.find(FIND_MY_CONSTRUCTION_SITES);
    }

    if (this.memory.constructionTarget === undefined) {
      this.log.debug("no construction target id");
    } else {
      const site = Game.getObjectById(this.memory.constructionTarget);
      if (site !== undefined && site !== null) {
        if (creep.build(site) === ERR_NOT_IN_RANGE) {
          creep.moveTo(site);
        }
        return true;
      }
    }
    return false;
  }

  private doGather(creep: Creep): boolean {
    if (this.memory.sourceTarget === undefined) {
      const source = creep.pos.findClosestByPath(FIND_SOURCES);
      if (source) {
        this.memory.sourceTarget = source.id;
      } else {
        this.log.warn("failed to find a harvest source");
        return false;
      }
    }

    const target = Game.getObjectById(this.memory.sourceTarget);
    if (target) {
      if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
      return true;
    }
    return false;
  }
}
