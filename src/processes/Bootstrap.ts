import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { EmergencyWorkerMemory, EmergencyWorkerProcess } from "./EmergencyWorker";
export interface BootstrapMemory {
  room: string;
  workerIds: string[];
}

export class BootstrapProcess extends BasicProcess<BootstrapMemory> {
  public static imageName = "Overmind/BootstrapProcess";
  private static workerBody = [WORK, MOVE, CARRY];

  @posisInterface("spawn")
  private spawnExt: IPosisSpawnExtension;

  @posisInterface("baseKernel")
  private kernel: IPosisKernel;

  public notify(msg: WombatMessage): void {
    this.log.info(JSON.stringify(msg));
    if (this.isSpawnCallback(msg)) {
      const initMem: EmergencyWorkerMemory = {
        room: this.memory.room,
        workerId: msg.creep,
        state: 0
      };
      this.kernel.startProcess(EmergencyWorkerProcess.imageName, initMem);
    }
  }

  private isSpawnCallback(msg: WombatMessage): msg is SpawnMessage {
    if (msg && msg.type === "spawnMessage") {
      return true;
    }
    return false;
  }

  public run(): void {
    this.handleWorkers();

    if (this.memory.workerIds.length < 4) {
      this.requestNewWorker();
    }
  }

  private handleWorkers(): void {
    for (let i = this.memory.workerIds.length - 1; i >= 0; i--) {
      const id = this.memory.workerIds[i];
      const creep = this.spawnExt.getCreep(id);
      if (creep === undefined) {
        const status = this.spawnExt.getStatus(id);
        switch (status.status) {
          case EPosisSpawnStatus.QUEUED:
          case EPosisSpawnStatus.SPAWNING:
            // unspawned request
            break;
          default:
            // creep is either dead or the spawn request is rejected
            this.memory.workerIds.splice(i, 1);
        }
      }
    }
  }

  private requestNewWorker(): void {
    const result = this.spawnExt.spawnCreep({
      rooms: [this.memory.room],
      body: [BootstrapProcess.workerBody as string[]],
      priority: 0,
      pid: this.id
    });
    this.log.debug(`requested worker creep. ${result}`);
    if (_.isString(result)) {
      this.memory.workerIds.push(result);
    }
  }
}
