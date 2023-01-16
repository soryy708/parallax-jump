import { Renderable } from "../renderer.mjs";
import { RectangleCollider } from "./collision.mjs";
import { canvasWidth, canvasHeight } from './globals.mjs';
import { clamp, randomInRange } from './util.mjs';
import { hslToRgb } from './color.mjs';

const minPlatformVelocity = -40;
const maxPlatformVelocity = -5;

export class Platform {
    constructor(height, velocity) {
        this.label = 'platform';

        this.maxWidth = 48;
        this.minWidth = 16;

        this.renderable = new Renderable();
        this.renderable.type = 'rect';
        this.renderable.x = canvasWidth;
        this.renderable.y = canvasHeight - height;
        this.renderable.w = clamp(height / canvasHeight * this.maxWidth, this.minWidth, this.maxWidth);
        this.renderable.h = height;

        const minLightness = 0.4;
        const lightnessOffset = 1 - (velocity - minPlatformVelocity) / (maxPlatformVelocity - minPlatformVelocity);
        const lightness = minLightness + (lightnessOffset * (1 - minLightness));
        const hsl = { h: 0, s: 0, l: lightness };
        const rgb = hslToRgb(hsl);
        this.renderable.colorR = rgb.r / 255;
        this.renderable.colorG = rgb.g / 255;
        this.renderable.colorB = rgb.b / 255;

        this.velocity = velocity;

        this.collider = new RectangleCollider(this.renderable.x, this.renderable.y, this.renderable.w, this.renderable.h);
    }

    tick(dt) {
        this.renderable.x = clamp(this.renderable.x + this.velocity * dt, -1 * this.renderable.w, canvasWidth);
        this.collider.x = this.renderable.x;
    }

    isExpired() {
        return this.renderable.x <= -1 * this.renderable.w;
    }
}

export class PlatformsContainer {
    constructor(scene, collisions) {
        this.scene = scene;
        this.collisions = collisions;

        this.platforms = [];
        this.timeFromLastSpawn = 0;

        this.minPlatformHeight = 16;
        this.maxPlatformHeight = canvasHeight * 0.66;
    }

    tick(dt) {
        this.timeFromLastSpawn += dt;
        if (this.shouldSpawn()) {
            this.timeFromLastSpawn = 0;
            this.spawnPlatform(
                randomInRange(this.minPlatformHeight, this.maxPlatformHeight),
                randomInRange(minPlatformVelocity, maxPlatformVelocity)
            );
        }

        this.platforms.forEach(platform => {
            platform.tick(dt);
        });

        this.clearExpiredPlatforms();
    }

    shouldSpawn() {
        const minSpawnInterval = 7;
        const maxSpawnInterval = 10;
        return this.timeFromLastSpawn > clamp(Math.random() * maxSpawnInterval, minSpawnInterval, maxSpawnInterval);
    }

    spawnPlatform(h, v) {
        const platform = new Platform(h, v);
        this.platforms.push(platform);
        this.scene.addEntity(platform);
        this.collisions.addEntity(platform);
        return platform;
    }

    spawnFirstPlatform() {
        const platform = this.spawnPlatform(canvasHeight / 2, -50);
        platform.renderable.w = 96;
    }

    clearExpiredPlatforms() {
        const expiredPlatforms = this.platforms.filter(platform => platform.isExpired());
        const notExpiredPlatforms = this.platforms.filter(platform => !platform.isExpired());
        this.platforms = notExpiredPlatforms;
        this.scene.removeEntities(expiredPlatforms);
        this.collisions.removeEntities(expiredPlatforms);
    }

    clearAll() {
        this.scene.removeEntities(this.platforms);
        this.collisions.removeEntities(this.platforms);
        this.platforms = [];
    }
}
