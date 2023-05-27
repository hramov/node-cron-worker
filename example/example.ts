import {join} from "path";
import {Supervisor} from "../core/main";

async function testSupervisor() {
    const task = {
        name: 'Job',
        path: join(__dirname, 'jobs', 'job.ts'),
        enabled: true,
        cronTime: '*/5 * * * * *',
        params: {
            foo: 'bar'
        },
        runOnce: false,
    };

    const supervisor = new Supervisor([task], {
        timezone: 'Europe/Moscow',
        poolMin: 1,
        poolMax: 5,
        logs: true,
    });

    supervisor.start();
}

testSupervisor();