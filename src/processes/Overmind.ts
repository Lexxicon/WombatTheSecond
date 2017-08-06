import { BasicProcess } from "../kernel/processes/BasicProcess";
import { HiveProcess } from "./Hive";
export interface OvermindMemory {
  hives: { [hiveName: string]: PosisPID; };
}

export class OvermindProcess extends BasicProcess<OvermindMemory> {
  public static imageName = "Overmind/OvermindProcess";

  constructor(context: IPosisProcessContext) {
    super(context);
  }

  public notify(msg: any): void {
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
    this.findNewHives();
    this.purgeOldHives();
  }
}
