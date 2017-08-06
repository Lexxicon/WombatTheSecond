import { BasicProcess } from "../kernel/processes/BasicProcess";
export interface HiveMemory {
  room: string;

  bootstrap: PosisPID;
  harvester: PosisPID;
  upgrader: PosisPID;
  builder: PosisPID;
}

export class HiveProcess extends BasicProcess<HiveMemory> {
  public static imageName = "Overmind/HiveProcess";

  constructor(context: IPosisProcessContext) {
    super(context);
    _.defaultsDeep(this.memory, {

    });
  }

  public notify(msg: any): void {
    this.log.debug(`recieved message ${msg}`);
  }

  public run(): void {
    console.log("tick " + this.memory.room);
  }

}
