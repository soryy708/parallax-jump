import { Renderable } from '../renderer.mjs';
import { clamp, randomInRange } from './util.mjs';
import { canvasWidth, canvasHeight } from './globals.mjs';

export class Wind {
    constructor() {
        this.renderable = new Renderable();
        this.renderable.type = 'rect';

        this.renderable.w = randomInRange(256, 512);
        this.renderable.h = randomInRange(1, 4);
        this.renderable.x = canvasWidth + this.renderable.w;
        this.renderable.y = randomInRange(0, canvasHeight);
        this.renderable.z = 2;

        const lightness = randomInRange(0.125, 0.33);
        this.renderable.colorA = lightness;
        this.renderable.colorR = 1;
        this.renderable.colorG = 1;
        this.renderable.colorB = 1;

        this.velocity = randomInRange(-48, -96);
    }

    isExpired() {
        return this.renderable.x + this.renderable.w <= 0;
    }

    tick(dt) {
        this.renderable.x += this.velocity * dt;
    }
}

export class EffectsContainer {
    constructor(scene) {
        this.scene = scene;

        this.effects = [];
        this.timeFromLastSpawn = 0;
    }

    tick(dt) {
        this.timeFromLastSpawn += dt;
        if (this.shouldSpawn()) {
            this.timeFromLastSpawn = 0;
            this.spawn();
        }

        this.effects.forEach(effect => {
            effect.tick(dt);
        });

        this.clearExpiredEffects();
    }

    shouldSpawn() {
        const minSpawnInterval = 1;
        const maxSpawnInterval = 16;
        return this.timeFromLastSpawn > clamp(Math.random() * maxSpawnInterval, minSpawnInterval, maxSpawnInterval);
    }

    spawn(h, v) {
        const wind = new Wind(h, v);
        this.effects.push(wind);
        this.scene.addEntity(wind);
    }

    clearExpiredEffects() {
        const expiredEffects = this.effects.filter(effect => effect.isExpired());
        const notExpiredEffects = this.effects.filter(effect => !effect.isExpired());
        this.effects = notExpiredEffects;
        this.scene.removeEntities(expiredEffects);
    }
}
