import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
export interface BootstrapMemory {
  room: string;
  workerIds: string[];
}

export class BootstrapProcess extends BasicProcess<BootstrapMemory> {
  public static imageName = "Overmind/BootstrapProcess";
  private static workerBody = [WORK, MOVE, CARRY];

  @posisInterface("spawn")
  private spawnExt: IPosisSpawnExtension;

  public notify(msg: any): void {
    this.log.info(JSON.stringify(msg));
  }

  public run(): void {
    for (let i = this.memory.workerIds.length - 1; i >= 0; i--) {
      const id = this.memory.workerIds[i];
      const creep = this.spawnExt.getCreep(id);
      if (creep !== undefined) {
        creep.say("hi");
      } else {
        const status = this.spawnExt.getStatus(id);
        switch (status.status) {
          case EPosisSpawnStatus.ERROR:
            this.memory.workerIds.splice(i, 1);
            break;
          case EPosisSpawnStatus.SPAWNED:
            break;
          default:
        }
      }
    }

    if (this.memory.workerIds.length < 2) {
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
}
