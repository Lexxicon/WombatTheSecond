export type PID = string | number;

interface ProcessImage<InitialMemory, MemType extends InitialMemory> {
  imageName: string;
  getDefaultMemory(): MemType;
  new(context: ProcessContext<MemType>): Process;
}

interface ProcessContext<InitialMemory> {
  initMem: InitialMemory;
}

interface Process {
  id: PID;
}

interface TestIniMem {
  one: number;
}

interface TestMem {
  one: number;
  two: number;
}

class TestImage implements Process {
  public static imageName = "TestImageName";

  public static getDefaultMemory(): TestMem {
    throw new Error("Method not implemented.");
  }

  public id: PID;

  constructor(context: ProcessContext<TestIniMem>) {
    this.id = "";
  }
}

const t: ProcessImage<TestIniMem, TestMem> = TestImage;

export interface Kernel {
  startProcess<T, M extends T>(image: ProcessImage<T, M>, initMem: T): PID;
  killProcess(pid: PID): void;
  setParent(pid: PID, parentID?: PID): boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class WombatKernel {
  public testInvoke(): void {
    const iMem = {
      one: 1
    };

    const rs = this.startProcess(TestImage, iMem);
  }

  public startProcess<T, M extends T>(image: ProcessImage<T, M>, initMem: T): PID {
    const mem = _.merge(image.getDefaultMemory(), initMem);
    const pCtx = { initMem: mem };
    const rslt = new image(pCtx);
    return "";
  }
}
