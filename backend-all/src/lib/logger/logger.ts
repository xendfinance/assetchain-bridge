import { createLogger, transports, format } from 'winston';

const logLevel = 'info';


const winstonFormatConsole = format.combine(
  format.colorize({
    all: true,
  }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.align(),
  format.printf(
    (info) =>
      `[timestamp : ${info.timestamp as any}] [level: ${info.level}] : ${info.message as string}`,
  ),
);

export default createLogger({
  // format: winstonFormatFile,
  level: 'warn',
  transports: [
    new transports.Console({
      level: logLevel,
      format: winstonFormatConsole,
    }),
  ],
});
