
export class ProcessRegistry implements IPosisProcessRegistry {
  private registry: { [name: string]: PosisProcessConstructor } = {};

  public register(imageName: string, constructor: new (context: IPosisProcessContext) => IPosisProcess): boolean {
    this.registry[imageName] = constructor;
    return true;
  }
}
