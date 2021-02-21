import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export interface ILoggerOptions {
    format: winston.Logform.Format;
    transports: (
        | DailyRotateFile
        | winston.transports.ConsoleTransportInstance
    )[];
    defaultMeta: Record< string, any>
}
