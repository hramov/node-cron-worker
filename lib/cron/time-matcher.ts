const { validation } = require('../validation/pattern-validation');
import {convertExpression, matchPattern} from "../utils/cron.utils";

export class TimeMatcher {
    private readonly pattern: string;
    private readonly timezone: string;
    private readonly expressions: string[];

    constructor(pattern: string, timezone: string) {
        validation(pattern);
        this.pattern = convertExpression(pattern);
        this.timezone = timezone;
        this.expressions = this.pattern.split(' ');
    }

    match(rawDate: Date){
        const date = this.apply(rawDate);

        const runOnSecond = matchPattern(this.expressions[0], date.getSeconds());
        const runOnMinute = matchPattern(this.expressions[1], date.getMinutes());
        const runOnHour = matchPattern(this.expressions[2], date.getHours());
        const runOnDay = matchPattern(this.expressions[3], date.getDate());
        const runOnMonth = matchPattern(this.expressions[4], date.getMonth() + 1);
        const runOnWeekDay = matchPattern(this.expressions[5], date.getDay());

        return runOnSecond && runOnMinute && runOnHour && runOnDay && runOnMonth && runOnWeekDay;
    }

    apply(date: Date){
        if (this.timezone){
            const dtf = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hourCycle: 'h23',
                timeZone: this.timezone
            });
            return new Date(dtf.format(date));
        }
        return date;
    }
}