import {ScheduleOptions} from "node-cron";

export interface INodeCronWorker {
    setMode(mode: Modes): void
    schedule(cron: string, func: Function, funcParams: any, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask | Error>
}

export interface INodeCronWorkerScheduleOptions extends ScheduleOptions {}

export interface INodeCronWorkerTask {
    start(): void;
    stop(): void;
    status(): void;
}

export const enum Modes {
    CronThread,
    SingleJobThread
}