import {validation} from "../validation/pattern-validation";
import {IScheduleOptions} from "../interface";
import {ScheduledTask} from "./scheduled-task";

export class Cron {
    private static readonly scheduledTasks = new Map();

    public static schedule(expression: string, func: Function, options: IScheduleOptions) {
        const task = this.createTask(expression, func, options);
        Cron.scheduledTasks.set(task.getName(), task);
        return task;
    }

    public static createTask(expression: string, func: Function, options: IScheduleOptions) {
        return new ScheduledTask(expression, func, options);
    }

    public static validate(expression: string) {
        try {
            validation(expression);
            return true;
        } catch (_) {
            return false;
        }
    }

    public static getTasks() {
        return Cron.scheduledTasks;
    }
}

/**
 * пришло время запуска
 * поднимаем поток
 * запускаем задачу
 * отслеживаем окончание работы -> event('stop');
 * убиваем поток
 */

/**
 * 1) cron supervisor -> worker pool -> worker -> task (multiple threads)
 * 2) worker -> cron supervisor -> task (one thread)
 */