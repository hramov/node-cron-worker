import {INodeCronWorkerScheduleOptions, INodeCronWorkerTask} from "./node-cron-worker";

export interface INodeCronWorker {
    setMode(mode: Modes): void
    schedule(cron: string, func: Function, funcParams: any, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask>
}

export const enum Modes {
    CronThread,
    SingleJobThread
}