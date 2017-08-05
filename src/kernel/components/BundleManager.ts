import { LoggerFactory } from "./../logger/LoggerFactory";

const logger = LoggerFactory.getLogger("BundleManager");

export class BundleManager {

  private processRegistry: IPosisProcessRegistry;
  private extensionRegistry: WombatExtensionRegistry;
  private installedBundles: Array<IPosisBundle<any>> = [];

  constructor(processRegistry: IPosisProcessRegistry, extensionRegistry: WombatExtensionRegistry) {
    this.processRegistry = processRegistry;
    this.extensionRegistry = extensionRegistry;
  }

  public install(bundle: IPosisBundle<any>): boolean {
    if (this.installedBundles.indexOf(bundle) >= 0) {
      return true;
    }
    bundle.install(this.processRegistry);
    // install into extensions
    logger.warn("not installing extensions");
    return true;
  }
}
