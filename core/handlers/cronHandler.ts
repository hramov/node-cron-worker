import {parentPort, workerData} from 'worker_threads';
import { Cron } from '../cron';
import {TaskMessage} from "../interface";

function register() {
    const { jobs, options } = workerData;
    const cron = new Cron(options);

    for (const job of jobs) {
        if (!cron.validate(job.cronTime)) {
            throw new Error('Wrong cron time format');
        }
        cron.schedule(job);
    }

    parentPort?.on('message', (msg: { event: string }) => {
        if (msg.event === TaskMessage.Start) {
            cron.start();
        } else if (msg.event === TaskMessage.Stop) {
            cron.stop();
        }
    })
}

register();