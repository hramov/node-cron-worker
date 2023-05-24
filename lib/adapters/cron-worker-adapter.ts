import { parentPort, workerData } from 'worker_threads';
import { schedule } from 'node-cron';
import {NEW_TASK_EVENT} from "../constants";
import {TaskMessage} from "../interface";

const { params, options } = JSON.parse(workerData);

const job = require(params.path);
const run = job.run.bind({}, params.params);

const cronTask = schedule(params.cronTime, run, options);

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
    })
}