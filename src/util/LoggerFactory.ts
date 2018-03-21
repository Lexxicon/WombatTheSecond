import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export class LoggerFactory {
  public getLogger(name: string): Logger {
    return LoggerFactory.getLogger(name);
  }

  public static getLogger(name: string, level: LogLevel = LogLevel.DEBUG): Logger {
    return new Logger(name, level);
  }
}
