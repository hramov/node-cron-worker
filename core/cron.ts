import {validation} from "./validation/patternValidation";
import {ICronWorkerJob, INodeCronWorkerScheduleOptions} from "./interface";
import {ScheduledTask} from "./scheduledTask";
import {Pool} from "./pool";

export class Cron {
    private readonly scheduledTasks = new Map<string, { enabled: boolean, task: ScheduledTask}>();
    private readonly workerPool: Pool;

    constructor(private readonly options: INodeCronWorkerScheduleOptions) {
        this.workerPool = new Pool({
            min: this.options.poolMin,
            max: this.options.poolMax,
        })
    }

    public start() {
        for (let i = 0; i < this.scheduledTasks.size; i++) {
            const { enabled, task } = this.scheduledTasks.values().next().value;
            if (enabled) {
                task.start();
            }
        }
    }

    public stop() {
        for (let i = 0; i < this.scheduledTasks.size; i++) {
            const { enabled, task } = this.scheduledTasks.values().next().value;
            if (enabled) {
                task.stop();
            }
        }
    }

    public schedule(job: ICronWorkerJob) {
        const task = this.createTask(job);
        this.scheduledTasks.set(task.getName()!, {
            enabled: job.enabled,
            task: task,
        });
        return task;
    }

    public validate(expression: string) {
        try {
            validation(expression);
            return true;
        } catch (_) {
            return false;
        }
    }

    public getTasks() {
        return this.scheduledTasks;
    }

    private createTask(job: ICronWorkerJob) {
        return new ScheduledTask(job, this.options, this.workerPool);
    }
}