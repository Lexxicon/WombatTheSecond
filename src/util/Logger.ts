import { LogLevel } from "./LogLevel";

export class Logger {
  // Use for HTML styling (Colors match screeps_console)
  private static styles: { [key: string]: string } = {
    default: "color: white; background-color: black",
    [LogLevel.DEBUG]: "color: grey",
    [LogLevel.INFO]: "color: white",
    [LogLevel.WARN]: "color: yellow",
    [LogLevel.ERROR]: "color: red",
    [LogLevel.FATAL]: "color: yellow; background-color: red",
  };
  private name: string;
  private logLevel: LogLevel;
  private gameTick = 0;
  private yOffset = 0;

  constructor(name: string = "", logLevel: LogLevel = LogLevel.DEBUG) {
    this.name = name;
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, message: (() => string) | string): void {
    if (level >= this.logLevel) {
      if (typeof message === "function") {
        message = message();
      }
      const style = Logger.styles[level] || Logger.styles.default;
      console.log(`<log severity="${level}" style="${style}">[${level}] ${this.name} ${message}</log>`);
    }
  }

  public debug(message: (() => string) | string): void {
    this.log(LogLevel.DEBUG, message);
  }

  public info(message: (() => string) | string): void {
    this.log(LogLevel.INFO, message);
  }

  public warn(message: (() => string) | string): void {
    this.log(LogLevel.WARN, message);
  }

  public error(message: (() => string) | string): void {
    this.log(LogLevel.ERROR, message);
  }

  public fatal(message: (() => string) | string): void {
    this.log(LogLevel.FATAL, message);
  }
}
