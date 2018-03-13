export type PID = string | number;

interface ProcessImage<InitialMemory, MemType extends InitialMemory> {
  imageName: string;
  getDefaultMemory(): MemType;
  new(context: ProcessContext<MemType>): WombatProcess;
}

interface ProcessContext<InitialMemory> {
  initMem: InitialMemory;
}

export interface Kernal {
  startProcess<T, M extends T>(image: ProcessImage<T, M>, initMem: T): PID;
  killProcess(pid: PID): void;
  setParent(pid: PID, parentID?: PID): boolean;
}

export class WombatKernel {
  public testInvoke(): void {
    const pImg = {
      imageName: "te",
      getDefaultMemory() { return { one: 1, two: 2 }; },
      new(context: ProcessContext<{ one: number, two: number }>) { return { run() { /**/ }, notify() { /**/ } }; }
    };
  }

  public startProcess<T, M extends T>(image: ProcessImage<T, M>, initMem: T): PID {
    const mem = _.merge(image.getDefaultMemory(), initMem);
    const pCtx = { initMem: mem };
    const rslt = new image(pCtx);
    return "";
  }
}
