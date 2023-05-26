import {join} from "path";
import {Supervisor} from "../core/main";

async function testSupervisor() {
    const options = {
        timezone: 'Europe/Moscow',
        poolMin: 2,
        poolMax: 5,
    }

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

    const supervisor = new Supervisor([task], options);
    supervisor.start();
}

testSupervisor();