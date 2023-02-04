import { Renderable } from '../renderer.mjs';
import { CircleCollider } from './collision.mjs';
import { canvasWidth, canvasHeight } from './globals.mjs';
import { clamp, randomInRange } from './util.mjs';

export const targetMinVelocity = 15;
export const targetMaxVelocity = 26;

export class Target {
    constructor(y, velocity) {
        this.label = 'target';
        this.collected = false;

        this.renderable = new Renderable();
        this.renderable.type = 'circle';
        this.renderable.x = canvasWidth;
        this.renderable.y = y;
        this.renderable.r = 6;
        this.renderable.colorR = 0;
        this.renderable.colorG = 255;
        this.renderable.colorB = 0;

        this.velocity = velocity;

        const collisionBufferRadius = 8;
        this.collider = new CircleCollider(this.renderable.x, this.renderable.y, this.renderable.r + collisionBufferRadius);
    }

    tick(dt) {
        this.renderable.x = clamp(this.renderable.x - this.velocity * dt, -1 * this.renderable.r, canvasWidth);
        this.collider.x = this.renderable.x;
    }

    isExpired() {
        return this.collected || this.renderable.x <= -1 * this.renderable.r;
    }

    onCollect() {
        this.collected = true;
    }
}

export class TargetContainer {
    constructor(scene, collisions) {
        this.scene = scene;
        this.collisions = collisions;

        this.targets = [];
        this.timeFromLastSpawn = 0;
    }

    tick(dt) {
        this.timeFromLastSpawn += dt;
        if (this.shouldSpawn()) {
            this.timeFromLastSpawn = 0;
            this.spawn();
        }

        this.targets.forEach(target => {
            target.tick(dt);
        });

        this.clearExpired();
    }

    shouldSpawn() {
        const minSpawnInterval = 13;
        const maxSpawnInterval = 17;
        return this.timeFromLastSpawn > clamp(Math.random() * maxSpawnInterval, minSpawnInterval, maxSpawnInterval);
    }

    spawn() {
        const velocity = randomInRange(targetMinVelocity, targetMaxVelocity);
        const minY = 8;
        const y = randomInRange(minY, canvasHeight / 2);
        const target = new Target(y, velocity);
        this.targets.push(target);
        this.scene.addEntity(target);
        this.collisions.addEntity(target);
        return target;
    }

    clearExpired() {
        const expired = this.targets.filter(target => target.isExpired());
        const notExpired = this.targets.filter(target => !target.isExpired());
        this.targets = notExpired;
        this.scene.removeEntities(expired);
        this.collisions.removeEntities(expired);
    }

    clearAll() {
        this.scene.removeEntities(this.targets);
        this.collisions.removeEntities(this.targets);
        this.targets = [];
    }
}
