import { Hive } from "../managers/RoomManager";
import { Role } from "./role";

interface WorkerMemory {
  job: Jobs;
  jobID: string;
}

enum Jobs {
  REPAIR,
  BUILD,
  UPGRADE,
  IDLE
}

export class Worker implements Role<WorkerMemory> {
  public id = "WORKER";

  public create(spawn: StructureSpawn): string | undefined {
    const rslt = spawn.createCreep([WORK, MOVE, CARRY], undefined, { role: this.id });
    if (_.isString(rslt)) {
      return rslt;
    }
    return undefined;
  }

  public initMemory(): WorkerMemory {
    return {
      job: Jobs.IDLE,
      jobID: ""
    };
  }

  public run(creep: Creep, memory: WorkerMemory, hive: Hive): void {
    throw new Error("Method not implemented.");
  }
}
