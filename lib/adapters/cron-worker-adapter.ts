import { parentPort, workerData } from 'worker_threads';
import { schedule } from 'node-cron';
import {NEW_TASK_EVENT} from "../constants";
import {replaceCircular} from "../utils";

const { params, options } = JSON.parse(workerData);

// TODO require to pass path in workerData
const jobPath = './../../example/jobs/';
const job = require(jobPath + params.name);
const run = job.run.bind({}, params.params);

const cronTask = schedule(params.cronTime, run, options);

if (parentPort) {
    parentPort.postMessage({
        event: NEW_TASK_EVENT,
        data: JSON.stringify(cronTask, replaceCircular(cronTask)),
    });
}