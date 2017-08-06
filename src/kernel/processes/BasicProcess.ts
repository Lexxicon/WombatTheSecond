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
  get kernel(): WombatKernel {
    const k = this.context.queryPosisInterface("wombatKernel");
    if (k === undefined) { throw new Error("Failed to find kernel?"); }
    return k;
  }

  constructor(private context: IPosisProcessContext) {
  }

  public sleep(time: number) {
    const k = this.context.queryPosisInterface("sleep");
    if (k === undefined) { throw new Error("Failed to find sleeper?"); }
    k.sleep(time);
  }

  public abstract notify(msg: any): void;
  public abstract run(): void;
}
