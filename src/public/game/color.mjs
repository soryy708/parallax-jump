export const hslToRgb = (color) => {
    if (color.s === 0) {
        return {
            r: color.l * 255,
            g: color.l * 255,
            b: color.l * 255,
        };
    }

    const c = (1 - Math.abs(2 * color.l - 1)) * color.s;
    const x = c * (1 - Math.abs((color.h / 60) % 2 - 1));
    const m = color.l - c / 2;

    const [rt, gt, bt] = (() => {
        if (0 <= color.h && color.h < 60) {
            return [c, x, 0];
        }
        if (60 <= color.h && color.h < 120) {
            return [x, c, 0];
        }
        if (120 <= color.h && color.h < 180) {
            return [0, c, x];
        }
        if (180 <= color.h && color.h < 240) {
            return [0, x, c];
        }
        if (240 <= color.h && color.h < 300) {
            return [x, 0, c];
        }
        if (300 <= color.h && color.h < 360) {
            return [c, 0, x];
        }
    })();

    return {
        r: (rt + m) * 255,
        g: (gt + m) * 255,
        b: (bt + m) * 255,
    };
};
