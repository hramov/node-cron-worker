import {ICronWorkerJob, INodeCronWorker, INodeCronWorkerScheduleOptions, INodeCronWorkerTask, Modes} from "../interface";
import {NodeCronWorkerRunner} from "./runner";

export class NodeCronWorker implements INodeCronWorker {
    private mode: Modes = Modes.CronThread;
    private readonly runner: NodeCronWorkerRunner;

    constructor() {
        this.runner = new NodeCronWorkerRunner();
    }

    public setMode(mode: Modes): void {
        this.mode = mode;
    }

    public async schedule(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask | Error> {
        if (this.mode === Modes.CronThread) {
            return this.scheduleCronThreadJob(params, options);
        } else if (this.mode === Modes.SingleJobThread) {
            return this.scheduleSingleJobThreadJob(params, options);
        }
        return new Error('Wrong mode');
    }

    private async scheduleCronThreadJob(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        return this.runner.schedule(params, options);
    }

    private async scheduleSingleJobThreadJob(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        return this.runner.scheduleJob(params, options);
    }

}