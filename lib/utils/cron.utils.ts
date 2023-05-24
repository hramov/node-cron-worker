export function convertAsterisksToRanges(expressions: string[]){
    expressions[0] = convertAsterisk(expressions[0], '0-59');
    expressions[1] = convertAsterisk(expressions[1], '0-59');
    expressions[2] = convertAsterisk(expressions[2], '0-23');
    expressions[3] = convertAsterisk(expressions[3], '1-31');
    expressions[4] = convertAsterisk(expressions[4], '1-12');
    expressions[5] = convertAsterisk(expressions[5], '0-6');

    return expressions;
}

export function convertExpression(expression: string) {
    let expressions = removeSpaces(expression).split(' ');
    expressions = appendSecondExpression(expressions);
    expressions = convertAsterisksToRanges(expressions);
    expressions = convertAllRanges(expressions);
    expressions = convertSteps(expressions);
    return normalizeIntegers(expressions).join(' ');
}

export function convertAllRanges(expressions: string[]) {
    for(let i = 0; i < expressions.length; i++){
        expressions[i] = convertRange(expressions[i]);
    }
    return expressions;
}

export function convertSteps(expressions: string[]){
    const stepValuePattern = /^(.+)\/(\w+)$/;
    for(let i = 0; i < expressions.length; i++){
        const match = stepValuePattern.exec(expressions[i]);
        const isStepValue = match !== null && match.length > 0;
        if(isStepValue){
            const baseDivider = Number(match[2]);
            if(isNaN(baseDivider)){
                throw baseDivider + ' is not a valid step value';
            }
            const values = match[1].split(',');
            const stepValues = [];
            const divider = parseInt(baseDivider.toString(), 10);
            for(let j = 0; j <= values.length; j++){
                const value = parseInt(values[j], 10);
                if(value % divider === 0){
                    stepValues.push(value);
                }
            }
            expressions[i] = stepValues.join(',');
        }
    }
    return expressions;
}

function replaceWithRange(expression: string, text: string, init: string, end: string) {

    const numbers = [];
    let last = parseInt(end);
    let first = parseInt(init);

    if(first > last){
        last = parseInt(init);
        first = parseInt(end);
    }

    for(let i = first; i <= last; i++) {
        numbers.push(i);
    }

    return expression.replace(new RegExp(text, 'i'), numbers.join());
}

function convertRange(expression: string){
    const rangeRegEx = /(\d+)-(\d+)/;
    let match = rangeRegEx.exec(expression);
    while(match !== null && match.length > 0){
        expression = replaceWithRange(expression, match[0], match[1], match[2]);
        match = rangeRegEx.exec(expression);
    }
    return expression;
}

function removeSpaces(str: string) {
    return str.replace(/\s{2,}/g, ' ').trim();
}

function normalizeIntegers(expressions: string[]) {
    const result: number[][] = [];
    for (let i=0; i < expressions.length; i++){
        const numbers = expressions[i].split(',').map((item: string) => Number(item));
        for (let j=0; j<numbers.length; j++){
            numbers[j] = parseInt(String(numbers[j]));
        }
        result[i] = numbers;
    }
    return result;
}

function appendSecondExpression(expressions: string[]) {
    if(expressions.length === 5){
        return ['0'].concat(expressions);
    }
    return expressions;
}

function convertAsterisk(expression: string, replacement: string) {
    return expression.indexOf('*') !== -1 ? expression.replace('*', replacement) : expression;
}