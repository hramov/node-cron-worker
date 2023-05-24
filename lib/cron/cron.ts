import storage from "./storage";
import {validation} from "../validation/pattern-validation";
import {IScheduleOptions} from "../interface";
import {ScheduledTask} from "./scheduled-task";


export function schedule(expression: string, func: Function, options: IScheduleOptions) {
    const task = createTask(expression, func, options);
    storage.save(task);
    return task;
}

function createTask(expression: string, func: Function, options: IScheduleOptions) {
    return new ScheduledTask(expression, func, options);
}

export function validate(expression: string) {
    try {
        validation(expression);
        return true;
    } catch (_) {
        return false;
    }
}

export function getTasks() {
    return storage.getTasks();
}
