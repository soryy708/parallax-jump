export class Renderable {
    constructor() {
        this.type = 'unknown';
        this.x = 0;
        this.y = 0;
        this.colorR = 1;
        this.colorG = 1;
        this.colorB = 1;
        this.colorA = 1;
    }
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.scenes = [];
    }

    onAnimationFrame() {
        if (!this.running) {
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.scenes.forEach(scene => {
            scene.forEach(sceneObject => {
                const renderable = sceneObject.renderable;
                if (!renderable) {
                    return;
                }
                this.context.fillStyle = `rgb(${renderable.colorR * 255}, ${renderable.colorG * 255}, ${renderable.colorB * 255})`;
                this.context.globalAlpha = renderable.colorA;
                switch (renderable.type) {
                    case 'rect': {
                        this.context.fillRect(renderable.x, renderable.y, renderable.w, renderable.h);
                        break;
                    }
                    case 'circle': {
                        this.context.beginPath();
                        this.context.arc(renderable.x, renderable.y, renderable.r, 0, 2 * Math.PI);
                        this.context.fill();
                        break;
                    }
                    case 'text': {
                        this.context.font = renderable.font;
                        this.context.fillText(renderable.text, renderable.x, renderable.y);
                        break;
                    }
                }
            });
        });

        window.requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    start() {
        this.running = true;
        this.onAnimationFrame();
    }

    stop() {
        this.running = false;
    }

    addScene(scene) {
        this.scenes.push(scene);
    }

    removeScene(scene) {
        const i = this.scenes.findIndex(s => s === scene);
        if (i !== -1) {
            this.scenes.splice(i, 1);
        }
    }
}
