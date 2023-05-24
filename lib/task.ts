import {INodeCronWorkerTask} from "./interface";
import {ScheduledTask} from "node-cron";
import {Worker} from "worker_threads";

export class NodeCronWorkerTask implements INodeCronWorkerTask {

    constructor(private readonly task: ScheduledTask, private readonly worker: Worker) {}

    start(): void {}

    stop(): void {}

    status(): void {}

}