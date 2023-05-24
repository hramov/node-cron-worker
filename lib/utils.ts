export function replaceCircular(censor: any) {
    let i = 0;
    return function(key: string, value: any) {
        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) return '[Circular]';
        if(i >= 29) return '[Unknown]';
        ++i;
        return value;
    }
}