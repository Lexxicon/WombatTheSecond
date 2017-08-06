
import { ProcessIDManager } from "./components/ProcessIDManager";
import { LoggerFactory } from "./logger/LoggerFactory";

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

interface PInfo {
  pid: PosisPID;
  process: WombatProcess;
}

interface IPosisExtension {
  wombatKernel: BaseKernel;
}

export class BaseKernel implements WombatKernel {
  private logger: IPosisLogger = LoggerFactory.getLogger("Kernel");

  /** id of the currently evaluating process */
  private currentPID: PosisPID;

  /** contains all process images that the kernel can create */
  private processRegistry: WombatProcessRegistry;
  /** contains all extensions that can be accessed by processes */
  private extensionRegistry: WombatExtensionRegistry;
  /** responsible for generating unique ids. Must return ids when finished */
  private idManager: ProcessIDManager;

  private processCache: { [id: string]: WombatProcess } = {};

  private pTree: { [id: string]: PosisPID[] } = {};
  private rootProcesses: PosisPID[] = [];

  private runCount: number = 0;

  private memoryRoot: { kernel: KernelMemory };

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

  constructor(
    processRegistry: WombatProcessRegistry,
    extensionRegistry: WombatExtensionRegistry,
    idManager: ProcessIDManager,
    kernelMemory: () => any) {

    this.memoryRoot = { get kernel(): KernelMemory { return kernelMemory(); } };
    this.processRegistry = processRegistry;
    this.extensionRegistry = extensionRegistry;
    this.idManager = idManager;

    extensionRegistry.register("wombatKernel", this);
    extensionRegistry.register("baseKernel", this);
    extensionRegistry.register("sleep", this);
  }

  public notify(pid: PosisPID, msg: any): void {
    const proc = this.getProcessById(pid);
    if (proc) { proc.notify(msg); }
  }
  public startProcess(imageName: string, startContext: any): PInfo | undefined {
    const id = this.idManager.getId();

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

    this.processTable[id] = wombatCtx;
    this.processMemory[id] = startContext;

    const process = this.createProcess(id);
    if (!process) {
      wombatCtx.status = ProcessStatus.ERROR;
      wombatCtx.endedTick = Game.time;
      wombatCtx.error = "Failed to create";
      throw new Error("Failed to create process");
    }

    return { pid: id, process };
  }

  public killProcess(pid: PosisPID): void {
    this.logger.debug(`Killing [${pid}]`);
    const process = this.processTable[pid];

    const ids = Object.keys(this.processTable);
    for (let i = 0; i < ids.length; i++) {
      if (this.processTable[ids[i]].parentId === process.id) {
        this.killProcess(ids[i]);
      }
    }

    process.status = ProcessStatus.KILLLED;
    process.endedTick = Game.time;
    this.logger.info(`Killed [${pid}]`);
  }

  public getProcessById(pid: PosisPID): WombatProcess | undefined {
    return this.processTable[pid] && this.createProcess(pid);

  }

  public setParent(id: PosisPID, parentId?: PosisPID): boolean {
    if (!this.processTable[id]) { return false; }
    this.processTable[id].parentId = parentId || "";
    return true;
  }

  public run() {
    this.buildProcTree();
    for (let i = 0; i < this.rootProcesses.length; i++) {
      this.runProcess(this.rootProcesses[i]);
    }
    this.reclaimProcesses();
  }

  private runProcess(pid: PosisPID) {
    const pInfo = this.processTable[pid];
    if (pInfo && this.isAlive(pInfo.status)) {
      if (!pInfo.wakeTick || Game.time > pInfo.wakeTick) {
        this.runCount++;
        pInfo.status = ProcessStatus.RUNNING;
        delete pInfo.wakeTick;
        try {
          const process = this.getProcessById(pid);
          if (process) {
            this.currentPID = pid;
            process.run();
          }
        } catch (e) {
          this.killProcess(pid);
          pInfo.status = ProcessStatus.ERROR;
          pInfo.error = e.stack || JSON.stringify(e);
          this.logger.error(`error running [${pid}]:${pInfo.name}\n${e.stack}`);
        } finally {
          this.currentPID = "";
        }
      }
      if (this.pTree[pid]) {
        for (let i = 0; i < this.pTree[pid].length; i++) {
          this.runProcess(this.pTree[pid][i]);
        }
      }
    }
  }

  private reclaimProcesses() {
    const pids = _.keys(this.processTable);
    for (let i = 0; i < pids.length; i++) {
      const ctx = this.processTable[pids[i]];
      if (!this.isAlive(ctx.status) && (!ctx.endedTick || Game.time - ctx.endedTick > 50)) {
        this.logger.debug("reclaiming [" + ctx.id + "] :" + ctx.name);
        delete this.processTable[ctx.id];
        delete this.processMemory[ctx.id];
        delete this.processCache[ctx.id];
        this.idManager.returnId(ctx.id);
      }
    }
  }

  private buildProcTree() {
    this.pTree = {};
    this.rootProcesses = [];
    const procs = _.values(this.processTable) as WombatProcessInfo[];
    for (let i = 0; i < procs.length; i++) {
      if (procs[i].parentId) {
        this.pTree[procs[i].parentId] = this.pTree[procs[i].parentId] || [];
        this.pTree[procs[i].parentId].push(procs[i].id);
      } else {
        this.rootProcesses.push(procs[i].id);
      }
    }
  }

  private isAlive(status: ProcessStatus): boolean {
    switch (status) {
      case ProcessStatus.DONE:
      case ProcessStatus.ERROR:
      case ProcessStatus.KILLLED:
        return false;
      case ProcessStatus.RUNNING:
      case ProcessStatus.SLEEP:
      case ProcessStatus.STARTING:
        return true;
      default:
        this.logger.warn("found unexpected status: " + status);
        return false;
    }
  }

  private createProcess(id: PosisPID): WombatProcess | undefined {
    if (this.processCache[id]) {
      return this.processCache[id];
    }

    const self = this;
    const pinfo = self.processTable[id];

    const pCtx: IPosisProcessContext = {
      id,
      imageName: pinfo.name,
      get parentId() { return self.processTable[id].id; },
      get memory() { return (self.processMemory[id] || (self.processMemory[id] = {})); },
      log: LoggerFactory.getLogger(`[${pinfo.id}]${pinfo.name}`),
      queryPosisInterface: self.extensionRegistry.getExtension.bind(self.extensionRegistry)
    };

    const process = this.processRegistry.getNewProcess(pCtx);
    if (!process) {
      this.idManager.returnId(id);
      throw new Error("Failed to create process");
    }

    this.processCache[id] = process;
    return process;
  }
}