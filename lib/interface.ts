import {EventEmitter} from "events";

export type CronFunc = ((now: Date | "manual" | "init") => void) | string;

/**
 * CronThread - one additional thread for all jobs
 * SingleJobThread - one job - one thread
 */
export const enum Modes {
    CronThread,
    SingleJobThread
}

export const enum TaskMessage {
    Start = 'start',
    Stop = 'stop',
}

export interface ICronWorkerJob {
    name: string;
    path: string;
    enabled: boolean;
    cronTime: string;
    params: any;
    runOnce: boolean;
}

export interface INodeCronWorker {
    setMode(mode: Modes): void
    schedule(params: ICronWorkerJob, funcParams: any, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask | Error>
}

export interface INodeCronWorkerScheduleOptions extends IScheduleOptions {}

export interface INodeCronWorkerTask {
    setCallback(cb: Function): void;
    start(): void;
    stop(): void;
    journal(): void;
}

export interface IScheduledTask extends EventEmitter {
    now: (now?: Date) => void;
    start: () => void;
    stop: () => void;
}

export interface IScheduleOptions {
    scheduled?: boolean | undefined;
    timezone?: string;
    recoverMissedExecutions?: boolean;
    name?: string;
    runOnInit?: boolean;
}
