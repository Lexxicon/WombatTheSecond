import { Logger } from "kernal/logger/Logger";
import { LogLevel } from "kernal/logger/LogLevel";

export class LoggerFactory implements WombatLoggerFactory {
  public getLogger(name: string): IPosisLogger {
    return LoggerFactory.getLogger(name);
  }

  public static getLogger(name: string): IPosisLogger {
    return new Logger(name, LogLevel.DEBUG);
  }
}
