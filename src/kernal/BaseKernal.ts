
export class BaseKernal implements IPosisKernel {

  private currentPID: PosisPID;

  public startProcess(imageName: string, startContext: any): { pid: PosisPID; process: IPosisProcess; } | undefined {
    throw new Error("Method not implemented.");
  }
  public killProcess(pid: PosisPID): void {
    throw new Error("Method not implemented.");
  }
  public getProcessById(pid: PosisPID): IPosisProcess | undefined {
    throw new Error("Method not implemented.");
  }
  public setParent(pid: PosisPID, parentId?: string | number | undefined): boolean {
    throw new Error("Method not implemented.");
  }
}
