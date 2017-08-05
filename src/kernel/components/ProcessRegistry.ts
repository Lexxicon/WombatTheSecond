import { LoggerFactory } from "./../logger/LoggerFactory";
import { ProcessIDManager } from "./ProcessIDManager";

const logger = LoggerFactory.getLogger("ProcessRegistry");

export class ProcessRegistry implements WombatProcessRegistry {
  private registry: { [name: string]: WombatProcessConstructor } = {};

  public register(imageName: string, constructor: WombatProcessConstructor): boolean {

    if (this.registry[imageName]) {
      logger.error(`Name already registered: ${imageName}`);
      return false;
    }

    logger.debug(`Registered ${imageName}`);
    this.registry[imageName] = constructor;
    return true;
  }

  public getNewProcess(context: IPosisProcessContext): WombatProcess | undefined {
    if (!this.registry[context.imageName]) {
      logger.warn("requested image doesn't exist!");
      return;
    }
    logger.debug(`Created ${context.imageName}`);
    const posisP = new this.registry[context.imageName](context);

    if (!this.isWombatProcess(posisP)) {
      (posisP as any).notify = (msg: any) => {/** */ };
    }

    return posisP as WombatProcess;
  }

  private isWombatProcess(process: IPosisProcess | WombatProcess): process is WombatProcess {
    return (process as WombatProcess).notify !== undefined;
  }
}
