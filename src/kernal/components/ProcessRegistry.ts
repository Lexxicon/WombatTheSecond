import { ProcessIDManager } from "kernal/components/ProcessIDManager";
import { LoggerFactory } from "kernal/logger/LoggerFactory";

const logger = LoggerFactory.getLogger("ProcessRegistry");

export class ProcessRegistry implements WombatProcessRegistry {
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

  public getNewProcess(context: IPosisProcessContext): IPosisProcess | undefined {
    if (!this.registry[context.imageName]) {
      logger.warn("requested image doesn't exist!");
      return;
    }
    logger.debug(`Created ${context.imageName}`);
    return new this.registry[context.imageName](context);
  }
}
