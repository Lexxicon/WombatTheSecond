import { ProcessIDManager } from "kernal/components/ProcessIDManager";
import { ExtensionRegistry } from "kernal/ExtensionRegistry";
import { LoggerFactory } from "kernal/logger/LoggerFactory";
import { ProcessStatus } from "kernal/ProcessStatus";
import { WombatProcessInfo } from "kernal/WombatProcessInfo";

export class BaseKernal implements IPosisKernel {

  private kernelPID: PosisPID;
  private currentPID: PosisPID;

  private processRegistry: WombatProcessInfo;
  private extensionRegistry: ExtensionRegistry;
  private idManager: ProcessIDManager;

  constructor(processRegistry: WombatProcessInfo, extensionRegistry: ExtensionRegistry) {
    this.processRegistry = processRegistry;
    this.extensionRegistry = extensionRegistry;
  }

  public startProcess(imageName: string, startContext: any): { pid: PosisPID; process: IPosisProcess; } | undefined {
    const self = this;
    const pCtx: WombatProcessInfo = {
      id: this.idManager.getId(),
      parentId: this.currentPID,
      imageName,
      memory: startContext,
      status: ProcessStatus.STARTING,
      log: LoggerFactory.getLogger(imageName),
      queryPosisInterface: self.extensionRegistry.getExtension.bind(self.extensionRegistry)
    };
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
