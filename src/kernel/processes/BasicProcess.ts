import { posisInterface } from "../annotations/PosisInterface";

export abstract class BasicProcess<MemType> implements WombatProcess {

  get memory(): MemType { // private memory
    return this.context.memory;
  }
  get imageName(): string { // image name (maps to constructor)
    return this.context.imageName;
  }
  get id(): PosisPID { // ID
    return this.context.id;
  }
  get parentId(): PosisPID { // Parent ID
    return this.context.parentId;
  }
  get log(): IPosisLogger { // Logger
    return this.context.log;
  }

  @posisInterface("wombatSleepExtension")
  protected wombatSleeper: WombatSleepExtension;

  @posisInterface("wombatKernel")
  protected kernel: WombatKernel;

  constructor(public context: IPosisProcessContext) {
  }

  public sleep(time: number) {
    if (this.wombatSleeper === undefined) { throw new Error("Failed to find sleeper?"); }
    this.wombatSleeper.sleep(time, this.id);
  }

  public ensureRunning(imageName: string, pid: PosisPID | undefined, defaultMemory: any): PosisPID | undefined {
    if (pid !== undefined && this.kernel.getProcessById(pid) !== undefined) {
      return pid;
    }
    return (this.kernel.startProcess(imageName, defaultMemory || {}) || { pid: undefined }).pid;
  }

  public abstract notify(msg: WombatMessage): void;
  public abstract run(): void;
}
