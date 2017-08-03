import { Logger } from "kernal/logger/Logger";
import { LogLevel } from "kernal/logger/LogLevel";

export class LoggerFactory {
  public static getLogger(name: string): IPosisLogger {
    return new Logger(name, LogLevel.DEBUG);
  }
  constructor() {
    throw new Error("don't instantiate me");
  }
}
