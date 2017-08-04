import { LoggerFactory } from "kernal/logger/LoggerFactory";

const logger = LoggerFactory.getLogger("ExtensionRegistry");

export class BaseExtensionRegistry implements WombatExtensionRegistry {
  private registry: { [interfaceId: string]: IPosisExtension } = {};

  public register(interfaceId: string, extension: IPosisExtension): boolean {
    if (this.registry[interfaceId]) {
      logger.error(`Interface Id already registered: ${interfaceId}`);
      return false;
    }
    logger.debug(`Registered ${interfaceId}`);
    this.registry[interfaceId] = extension;
    return true;
  }

  public unregister(interfaceId: string): boolean {
    if (this.registry[interfaceId]) {
      logger.debug(`Unregistered ${interfaceId}`);
      delete this.registry[interfaceId];
      return true;
    } else {
      logger.error(`Interface Id not registered: ${interfaceId}`);
      return false;
    }
  }

  public getExtension(interfaceId: string): IPosisExtension | undefined {
    if (!this.registry[interfaceId]) { return; }
    return this.registry[interfaceId];
  }
}
