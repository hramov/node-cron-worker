import {INodeCronWorkerTask, TaskMessage} from "./interface";
import {Worker} from "worker_threads";

export class NodeCronWorkerTask implements INodeCronWorkerTask {
    private readonly taskLog: string[];
    private callback: Function;

    constructor(private readonly worker: Worker) {
        this.taskLog = [];
        this.worker.on('message', (msg: any) => {
            this.taskLog.push(msg);
            if (this.callback && typeof this.callback === 'function') {
                this.callback(msg);
            }
        })
    }

    setCallback(cb: Function) {
        this.callback = cb;
    }

    start(): void {
        this.worker.postMessage({
            event: TaskMessage.Start,
            data: null,
        });
    }

    stop(): void {
        this.worker.postMessage({
            event: TaskMessage.Stop,
            data: null,
        });
    }

    journal(): string[] {
        return this.taskLog;
    }

}