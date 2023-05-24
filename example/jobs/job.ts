import { parentPort } from 'worker_threads';

export function run(params: any) {
    if (parentPort) {
        parentPort.postMessage({
            event: 'message',
            data: '123',
        })
    }
}