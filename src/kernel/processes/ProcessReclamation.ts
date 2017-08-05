export class ProcessReclamation implements WombatProcess {
  private context: IPosisProcessContext;

  constructor(context: IPosisProcessContext) {
    this.context = context;
  }

  public notify(msg: any): void {
    throw new Error("Method not implemented.");
  }
  public run(): void {
    throw new Error("Method not implemented.");
  }
}
