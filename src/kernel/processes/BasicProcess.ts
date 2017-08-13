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
  private wombatSleeper: WombatSleepExtension;

  constructor(public context: IPosisProcessContext) {
  }

  public sleep(time: number) {
    if (this.wombatSleeper === undefined) { throw new Error("Failed to find sleeper?"); }
    this.wombatSleeper.sleep(time, this.id);
  }

  public abstract notify(msg: WombatMessage): void;
  public abstract run(): void;
}
