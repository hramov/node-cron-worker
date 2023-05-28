import {parentPort, workerData} from 'worker_threads';
import { Cron } from './cron';
import {ICronWorkerJob, TaskMessage} from "../interface";

function register() {
    if (parentPort) {
        const {jobs, options} = workerData;
        const cron = new Cron(options);
        for (const job of jobs) {
            if (!cron.validate(job.cronTime)) {
                throw new Error('Wrong cron time format');
            }
            cron.schedule(job);
        }

        parentPort.on('message', (msg: { event: string, data?: ICronWorkerJob }) => {
            if (msg.event === TaskMessage.Start) {
                cron.start();
            } else if (msg.event === TaskMessage.Stop) {
                cron.stop();
            } else if (msg.event === TaskMessage.AddTask && msg.data) {
                if (!cron.validate(msg.data.cronTime)) {
                    throw new Error('Wrong cron time format');
                }
                const task = cron.schedule(msg.data);
                if (msg.data.enabled) {
                    task.start();
                }
            } else if (msg.event === TaskMessage.GetStat) {
                cron.getWorkerStat();
            }
        })
    }
}

register();