import { BasicProcess } from "../kernel/processes/BasicProcess";
export interface HiveMemory {
  room: string;

  state: HiveState;

  bootstrap: PosisPID;
}

enum HiveState {
  UNKNOWN,
  BOOTSTRAP,
  GROWTH,
}

export class HiveProcess extends BasicProcess<HiveMemory> {
  public static imageName = "Overmind/HiveProcess";

  constructor(context: IPosisProcessContext) {
    super(context);
    _.defaultsDeep(this.memory, {
      state: HiveState.UNKNOWN
    });
  }

  public notify(msg: any): void {
    this.log.debug(`recieved message ${msg}`);
  }

  public run(): void {
  }

}
