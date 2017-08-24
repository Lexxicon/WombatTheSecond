import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { HiveProcess } from "./Hive";
import { SpawnController } from "./SpawnController";
export interface OvermindMemory {
  spawnController: PosisPID | undefined;
  hives: { [hiveName: string]: PosisPID; };
}

export class OvermindProcess extends BasicProcess<OvermindMemory> {
  public static imageName = "Overmind/OvermindProcess";

  public notify(msg: WombatMessage): void {
    this.log.info(`Recieved msg ${msg}`);
  }

  private findNewHives(): void {
    for (const name in Game.rooms) {
      if (Game.rooms[name].controller === undefined) { continue; }
      if (this.memory.hives[name] === undefined && Game.rooms[name].controller!.my) {
        this.log.info(`Starting hive for ${name}`);
        const process = this.kernel.startProcess(HiveProcess.imageName, { room: name });
        if (process === undefined) { throw new Error("Failed to start new hive"); }
        this.memory.hives[name] = process.pid;
        this.log.debug(`Hive started with id ${process.pid}`);
      }
    }
  }

  private purgeOldHives(): void {
    for (const hive in this.memory.hives) {
      if (Game.rooms[hive] === undefined || !Game.rooms[hive].controller!.my) {
        this.log.info(`Lost hive ${hive}`);
        this.kernel.killProcess(this.memory.hives[hive]);
        delete this.memory.hives[hive];
      }
    }
  }

  public run(): void {
    if (!this.memory.spawnController || !this.kernel.getProcessById(this.memory.spawnController)) {
      const result = this.kernel.startProcess(SpawnController.imageName, { spawnQueue: [], spawnStatus: {} });
      this.memory.spawnController = (result || { pid: undefined }).pid;
    }
    this.findNewHives();
    this.purgeOldHives();
  }
}
