import { Renderable } from "../renderer.mjs";

export class TextEntity {
    constructor(text, x, y, fontSize) {
        this.renderable = new Renderable();
        this.renderable.type = 'text';
        this.renderable.x = x;
        this.renderable.y = y;
        this.renderable.font = `${fontSize}px sans-serif`;
        this.renderable.text = text;
    }

    setText(text) {
        this.renderable.text = text;
    }
}
