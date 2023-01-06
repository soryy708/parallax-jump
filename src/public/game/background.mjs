import { hslToRgb } from './color.mjs';
// gradient top rgb(31, 52, 96) = hsl(221, 0.512, 0.249)
// gradient bottom rgb(4, 18, 49) = hsl(221, 0.849, 0.104)

const initialHue = 221;
const initialSaturation = 0.512;
const saturationDelta = 0.849 - 0.512;
const initialLightness = 0.249;
const lightnessDelta = 0.104 - 0.249;

const targetTime = 1000;

const normalizeHue = (hue) => Math.abs(Math.floor(hue)) % 360;

function hueFromTime(time) {
    const progress = time / Math.max(time, targetTime);
    const hueDelta = 360 - initialHue;
    return normalizeHue(initialHue + progress * hueDelta);
}

function saturationFromTime(time) {
    const amplitude = 0.25;
    const period = 100;
    return initialSaturation + Math.sin(time / period) * amplitude;
}

export class Background {
    constructor(htmlElement) {
        this.htmlElement = htmlElement;
        this.elapsedTime = 0;
    }

    tick(dt) {
        this.elapsedTime += dt;

        const rgbTop = hslToRgb({
            h: hueFromTime(this.elapsedTime),
            s: saturationFromTime(this.elapsedTime),
            l: initialLightness
        });
        const rgbBottom = hslToRgb({
            h: hueFromTime(this.elapsedTime),
            s: saturationFromTime(this.elapsedTime) + saturationDelta,
            l: initialLightness + lightnessDelta
        });
        this.htmlElement.style.backgroundImage = `linear-gradient(rgb(${rgbTop.r}, ${rgbTop.g}, ${rgbTop.b}), rgb(${rgbBottom.r}, ${rgbBottom.g}, ${rgbBottom.b}))`;
    }

    reset() {
        this.elapsedTime = 0;
    }
}
