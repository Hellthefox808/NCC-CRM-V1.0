/**
 * Application logger utility for standardized logging across backend services.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private get currentLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    if (
      envLevel === "debug" ||
      envLevel === "info" ||
      envLevel === "warn" ||
      envLevel === "error"
    ) {
      return envLevel as LogLevel;
    }
    return "info";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.currentLevel];
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.log(message, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(message, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(message, ...args);
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(message, ...args);
    }
  }
}

export const logger = new Logger();
