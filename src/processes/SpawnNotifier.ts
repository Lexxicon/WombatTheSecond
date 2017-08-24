import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
export interface NotifierMemory {
  creep: string;
}

export class SpawnNotifier extends BasicProcess<NotifierMemory> {
  public static imageName: string = "Overmind/SpawnNotifier";

  public notify(msg: any): void {
    this.log.info("Recieved Message: " + JSON.stringify(msg));
  }

  public run() {
    const creep = Game.creeps[this.memory.creep as string];

    if (creep !== undefined && !creep.spawning) {
      try {
        const creepPID = Game.creeps[this.memory.creep as string].memory.pid;
        if (creepPID !== undefined) {
          this.kernel.notify(creepPID, { type: "spawnMessage", creep: creep.name } as SpawnMessage);
        }
      } catch (error) {
        this.log.warn(`error notifying ${this.memory.creep}. ${error}`);
      }
      this.log.debug("sent notification for " + creep.name);
      return 1;
    }
  }
}
