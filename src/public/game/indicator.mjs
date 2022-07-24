import { Renderable } from "../renderer.mjs";

export class PlayerIndicator {
    constructor() {
        this.renderable = new Renderable();
        this.renderable.type = 'rect';
        this.renderable.w = 1;
        this.renderable.h = 1;
    }

    update(x, h) {
        this.renderable.x = x;
        this.renderable.h = h;
    }
}
