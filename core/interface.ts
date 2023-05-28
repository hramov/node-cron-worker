export const enum TaskMessage {
    Start = 'start',
    Stop = 'stop',
    AddTask = 'addTask',
    GetStat = 'getStat'
}

export interface ICronWorkerJob {
    name: string;
    path: string;
    enabled: boolean;
    cronTime: string;
    params?: any;
    runOnce?: boolean;
}

export interface INodeCronWorkerScheduleOptions extends IScheduleOptions {
    poolMin: number;
    poolMax: number;
    logs: boolean;
}

export interface IScheduleOptions {
    scheduled?: boolean | undefined;
    timezone?: string;
    recoverMissedExecutions?: boolean;
    name?: string;
    runOnInit?: boolean;
}

export const enum LogLevels {
    Debug = 'debug',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export interface ILogger {
    debug(message: string, context?: string): void;
    info(message: string, context?: string): void;
    warning(message: string, context?: string): void;
    error(message: string, stack?: string, context?: string): void;
}

export interface LogMessage {
    level: LogLevels,
    message: string,
}