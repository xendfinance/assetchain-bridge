import Logger from './logger';

export default class EventLogger {
  public static error(message: string) {
    Logger.error(`${message}`);
  }

  public static warn(message: string) {
    Logger.warn(`${message}`);
  }

  public static info(message: string) {
    Logger.info(`${message}`);
  }

  public static http(message: string) {
    Logger.http(`${message}`);
  }

  public static debug(message: string) {
    Logger.debug(`${message}`);
  }
}
