///<reference path='./node.d.ts' />

export function millis2seconds(milliseconds: number) {
    return Math.ceil(milliseconds / 1000);
}
