interface OvermindMemory {
  name: string;
}

class OvermindProcess implements WombatProcess {
  public static imageName = "Overmind/OvermindProcess";

  get memory(): any { // private memory
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

  constructor(private context: IPosisProcessContext) {

  }

  public notify(msg: any): void {
    this.context.log.info(`Recieved msg ${msg}`);
  }

  public run(): void {
    this.log.info(`tick`);
  }
}
export const bundle: IPosisBundle<OvermindMemory> = {

  install(registry: IPosisProcessRegistry) {
    registry.register(OvermindProcess.imageName, OvermindProcess);
  },

  rootImageName: OvermindProcess.imageName,
  makeDefaultRootMemory: (override) => {
    if (override) { return override; }

    return { name: "" };
  }
};
