
import { LoggerFactory } from "kernal/logger/LoggerFactory";

const logger = LoggerFactory.getLogger("ProcessRegistry");

export class ProcessRegistry implements IPosisProcessRegistry {
  private registry: { [name: string]: PosisProcessConstructor } = {};

  public register(imageName: string, constructor: new (context: IPosisProcessContext) => IPosisProcess): boolean {
    if (this.registry[imageName]) {
      logger.error(`Name already registered: ${imageName}`);
      return false;
    }
    logger.debug(`Registered ${imageName}`);
    this.registry[imageName] = constructor;
    return true;
  }

  public install(bundle: IPosisBundle<any>) {
    bundle.install(this);
  }

  public getNewProcess(imageName: string, context: IPosisProcessContext): IPosisProcess | undefined {
    if (!this.registry[imageName]) { return; }
    logger.debug(`Created ${imageName}`);
    return new this.registry[imageName](context);
  }
}
