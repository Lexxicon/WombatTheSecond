
import { ProcessIDManager } from "kernal/components/ProcessIDManager";
import { LoggerFactory } from "kernal/logger/LoggerFactory";
import { WombatProcessRegistry } from "kernal/WombatProcessRegistry";

interface ProcessTable {
  [id: string]: WombatProcessInfo;
}

interface ProcessMemory {
  [id: string]: {};
}

interface KernelMemory {
  processTable: ProcessTable;
  processMemory: ProcessMemory;
}

export class WombatKernal implements IPosisKernel {
  private logger: IPosisLogger = LoggerFactory.getLogger("Kernel");

  /** lowered after the first request to kill the kernel process */
  private kernalKillGuard = true;

  /** id of the process running the kernel */
  private kernelPID: PosisPID;
  /** id of the currently evaluating process */
  private currentPID: PosisPID;

  /** contains all process images that the kernel can create */
  private processRegistry: WombatProcessRegistry;
  /** contains all extensions that can be accessed by processes */
  private extensionRegistry: WombatExtensionRegistry;
  /** responsible for generating unique ids. Must return ids when finished */
  private idManager: ProcessIDManager;

  private memoryRoot: {
    kernel: KernelMemory
  };

  get memory(): KernelMemory {
    return this.memoryRoot.kernel || (this.memoryRoot.kernel = { processTable: {}, processMemory: {} });
  }

  /** all processes metadata */
  get processTable(): ProcessTable {
    return this.memory.processTable || (this.memory.processTable = {});
  }

  get processMemory(): ProcessMemory {
    return this.memory.processMemory || (this.memory.processMemory = {});
  }

  constructor(processRegistry: WombatProcessRegistry, extensionRegistry: WombatExtensionRegistry, kernelMemory: any) {
    this.memoryRoot = kernelMemory;
    this.processRegistry = processRegistry;
    this.extensionRegistry = extensionRegistry;
  }

  public startProcess(imageName: string, startContext: any): { pid: PosisPID; process: IPosisProcess; } | undefined {
    const self = this;
    const id = this.idManager.getId();

    const pCtx: IPosisProcessContext = {
      id,
      parentId: this.currentPID,
      imageName,
      memory: startContext,
      log: LoggerFactory.getLogger(imageName),
      queryPosisInterface: self.extensionRegistry.getExtension.bind(self.extensionRegistry)
    };

    const process = this.processRegistry.getNewProcess(pCtx);
    if (!process) {
      this.idManager.returnId(id);
      throw new Error("Failed to create process");
    }

    const wombatCtx: WombatProcessInfo = {
      id,
      parentId: this.currentPID,
      name: imageName,

      status: ProcessStatus.STARTING,
      error: undefined,

      startTick: Game.time,
      wakeTick: undefined,
      endedTick: undefined,
    };

    this.processTable[pCtx.id] = wombatCtx;
    return { pid: pCtx.id, process };
  }

  public killProcess(pid: PosisPID): void {
    this.logger.debug(`Killing ${pid}`);
    if (pid === this.kernelPID && this.kernalKillGuard) {
      this.logger.warn("Surpressing kernel kill request. Request again to actuall kill kernel");
      this.kernalKillGuard = false;
      return;
    }
    const process = this.processTable[pid];

    const ids = Object.keys(this.processTable);
    for (let i = 0; i < ids.length; i++) {
      if (this.processTable[ids[i]].parentId === process.id) {
        this.killProcess(ids[i]);
      }
    }

    process.status = ProcessStatus.KILLLED;
    this.logger.info(`Killed ${pid}`);
  }

  public getProcessById(pid: PosisPID): IPosisProcess | undefined {
    return this.processTable[pid] && this.processTable[pid].process;

  }

  public setParent(id: PosisPID, parentId?: PosisPID): boolean {
    if (!this.processTable[id]) { return false; }
    this.processTable[id].parentId = parentId || -1;
    return true;
  }

  private createProcess(id: PosisPID): IPosisProcess | undefined {
    const pinfo = this.processTable[id];

    const self = this;
    const pCtx: IPosisProcessContext = {
      id,
      get parentId() { return pinfo.parentId; },
      imageName: pinfo.name,
      memory: startContext,
      log: LoggerFactory.getLogger(`${pinfo.name}-${pinfo.id}`),
      queryPosisInterface: self.extensionRegistry.getExtension.bind(self.extensionRegistry)
    };

    const k = pCtx.queryPosisInterface("baseKernel");
    if (k && k.getProcessById(1)) {
      console.log("hit");
    }
    const process = this.processRegistry.getNewProcess(pCtx);
    if (!process) {
      this.idManager.returnId(id);
      throw new Error("Failed to create process");
    }

    return undefined;
  }
}
