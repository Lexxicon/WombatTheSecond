import { LogLevel } from "./LogLevel";

export class Logger implements IPosisLogger {
  // Use for HTML styling (Colors match screeps_console)
  private static styles = {
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
      this.vlog(level, `[${level}] ${this.name} ${message}`);
    }
  }

  private vlog(level: LogLevel, message: string): void {
    if (this.gameTick !== Game.time) {
      this.yOffset = 0.2;
    }
    this.gameTick = Game.time;
    const style = Logger.styles[level] || Logger.styles.default;
    const color = (style.match(/color: ([a-z]*)/) || [, "white"])[1];
    const vis = new RoomVisual();
    vis.text(message, 0, this.yOffset, { align: "left", color });
    this.yOffset += 0.8;
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
