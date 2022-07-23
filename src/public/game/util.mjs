export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const randomInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;
