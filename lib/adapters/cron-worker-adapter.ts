import { parentPort, workerData } from 'worker_threads';
import { Cron } from '../cron/cron';
import {NEW_TASK_EVENT} from "../constants";
import {TaskMessage} from "../interface";

const { params, options } = JSON.parse(workerData);

const job = require(params.path);
const run = job.run.bind({}, params.params);

if (!Cron.validate(params.cronTime)) {
    throw new Error('Wrong cron time format');
}

const cronTask = Cron.schedule(params.cronTime, run, options);

if (parentPort) {
    parentPort.postMessage({
        event: NEW_TASK_EVENT,
        data: null,
    });

    parentPort.on('message', (msg: { event: string, data: any }) => {
        switch(msg.event) {
            case TaskMessage.Start:
                cronTask.start();
                break;
            case TaskMessage.Stop:
                cronTask.stop();
                break;
            default:
                console.log('Unknown event');
        }
    });
}