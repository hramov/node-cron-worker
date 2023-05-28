import {join} from "path";
import {Supervisor} from "../core/main";

function testSupervisor() {
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
        poolMin: 2,
        poolMax: 5,
        logs: true,
    });

    supervisor.start();

    setInterval(async () => {
        const stat = await supervisor.getStat();
        console.table(stat)
    }, 1000);

    supervisor.addTask(task) // add one job
    supervisor.addTasks([task]) // add multiple jobs
}

testSupervisor();