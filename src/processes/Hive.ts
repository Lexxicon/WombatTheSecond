import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { ArchitectMemory, ArchitectProcess } from "./ArchitectProcess";
import { BootstrapMemory, BootstrapProcess } from "./Bootstrap";
export interface HiveMemory {
  room: string;

  state: HiveState;

  bootstrap: PosisPID;

  architect: PosisPID;
}

enum HiveState {
  UNKNOWN,
  BOOTSTRAP,
  GROWTH,
}

export class HiveProcess extends BasicProcess<HiveMemory> {
  public static imageName = "Overmind/HiveProcess";

  @posisInterface("wombatKernel")
  private kernel: WombatKernel;

  constructor(context: IPosisProcessContext) {
    super(context);
    _.defaultsDeep(this.memory, {
      state: HiveState.UNKNOWN
    });
  }

  public notify(msg: WombatMessage): void {
    this.log.debug(`recieved message ${msg}`);
  }

  public run(): void {
    if (this.memory.bootstrap === undefined || !this.kernel.getProcessById(this.memory.bootstrap)) {
      this.log.debug("starting bootstrap");
      const result = this.kernel.startProcess(BootstrapProcess.imageName, {
        room: this.memory.room,
        workerIds: []
      } as BootstrapMemory);
      if (result) {
        this.memory.bootstrap = result.pid;
        this.memory.state = HiveState.BOOTSTRAP;
      }
    }
    if (this.memory.architect === undefined || !this.kernel.getProcessById(this.memory.architect)) {
      const result = this.kernel.startProcess(
        ArchitectProcess.imageName, {
          room: this.memory.room
        } as ArchitectMemory);
      if (result) {
        this.memory.architect = result.pid;
      }
    }
  }
}
