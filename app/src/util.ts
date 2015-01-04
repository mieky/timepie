///<reference path='./node.d.ts' />

function millis2seconds(milliseconds: number) {
    return Math.ceil(milliseconds / 1000);
}

module.exports = {
    millis2seconds: millis2seconds
};
