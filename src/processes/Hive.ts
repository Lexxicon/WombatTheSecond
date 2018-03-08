import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { ArchitectMemory, ArchitectProcess } from "./ArchitectProcess";
import { BootstrapMemory, BootstrapProcess } from "./Bootstrap";
import { SignerMemory, SignerProcess } from "./SignerProcess";

export interface HiveMemory {
  room: string;

  state: HiveState;

  bootstrap: PosisPID | undefined;
  architect: PosisPID | undefined;
  signer: PosisPID | undefined;
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

  public notify(msg: WombatMessage): void {
    this.log.debug(`recieved message ${msg}`);
  }

  public run(): void {
    this.memory.bootstrap = this.ensureRunning(BootstrapProcess.imageName, this.memory.bootstrap, {
      room: this.memory.room,
      workerIds: []
    } as BootstrapMemory);

    if (this.memory.bootstrap) {
      this.memory.state = HiveState.BOOTSTRAP;
    }

    this.memory.architect = this.ensureRunning(ArchitectProcess.imageName, this.memory.architect, {
      room: this.memory.room
    } as ArchitectMemory);

    this.memory.signer = this.ensureRunning(
      SignerProcess.imageName,
      this.memory.signer,
      {
        controller: Game.rooms[this.memory.room].controller!.id,
        message: "[Ypsillon Pact] This room is claimed by Lexxicon.",
      } as SignerMemory);
  }
}
