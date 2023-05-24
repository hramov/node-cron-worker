import {INodeCronWorker, INodeCronWorkerScheduleOptions, INodeCronWorkerTask, Modes} from "./interface";
import {NodeCronWorkerTask} from "./node-cron-worker-task";

export class NodeCronWorker implements INodeCronWorker{
    private mode: Modes = Modes.CronThread;

    public setMode(mode: Modes): void {
        this.mode = mode;
    }

    public async schedule(cron: string, func: Function, funcParams: any, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask | Error> {
        if (this.mode === Modes.CronThread) {
            return this.scheduleCronThreadJob();
        } else if (this.mode === Modes.SingleJobThread) {
            return this.scheduleSingleJobThreadJob();
        }
        return new Error('Wrong mode');
    }

    private async scheduleCronThreadJob(): Promise<INodeCronWorkerTask> {
        return new NodeCronWorkerTask();
    }

    private async scheduleSingleJobThreadJob(): Promise<INodeCronWorkerTask> {
        return new NodeCronWorkerTask();
    }

}