import {join} from "path";
import {Supervisor} from "../main";

async function testSupervisor() {
    const options = {
        timezone: 'Europe/Moscow',
        poolMin: 1,
        poolMax: 5,
    }

    const task = {
        name: 'Job',
        path: join(__dirname, 'jobs', 'job.ts'),
        enabled: true,
        cronTime: '*/2 * * * * *',
        params: {
            foo: 'bar'
        },
        runOnce: false,
    };

    const supervisor = new Supervisor([task], options);
    supervisor.start();

    setTimeout(() => {
        supervisor.stop()
    }, 5000)
}

testSupervisor();