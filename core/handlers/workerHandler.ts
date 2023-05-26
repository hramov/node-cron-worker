import { parentPort } from 'worker_threads';
import {ICronWorkerJob} from "../interface";

async function idle() {
    if (parentPort) {
        parentPort.on('message', async (msg: { event: 'task', task: ICronWorkerJob }) => {
            await run(msg.task);
        });
    }
}

async function run(task: ICronWorkerJob) {
    if (parentPort) {
        const job = require(task.path);
        if (job && job.run && typeof job.run === 'function') {
            try {
                await job.run(task.params);
            } catch (_err: unknown) {
                parentPort.postMessage({
                    event: 'error',
                    error: _err,
                });
            }
        }

        parentPort.postMessage({
            event: 'task_complete',
        });
    }
}

idle().catch((err: Error) => console.log(err.message));