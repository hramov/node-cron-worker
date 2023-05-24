import {INodeCronWorker, Modes} from "./interface";
import {schedule, ScheduleOptions} from "node-cron";
import {NodeCronWorkerTask} from "./node-cron-worker-task";

export interface INodeCronWorkerScheduleOptions extends ScheduleOptions {}

export interface INodeCronWorkerTask {
    start(): void;
    stop(): void;
    status(): void;

}

export class NodeCronWorker implements INodeCronWorker{
    setMode(mode: Modes): void {}

    async schedule(cron: string, func: Function, funcParams: any, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        return new NodeCronWorkerTask();
    }

}