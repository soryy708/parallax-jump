import { Renderable } from "../renderer.mjs";
import { clamp } from './util.mjs';

export class Particle {
    constructor(x, y, r, vx, vy, ttl) {
        this.renderable = new Renderable();
        this.renderable.type = 'circle';
        this.renderable.x = x;
        this.renderable.y = y;
        this.renderable.r = r;
        this.vx = vx;
        this.vy = vy;
        this.ttl = ttl;
        this.life = 0;
    }

    tick(dt) {
        this.renderable.x = this.renderable.x + this.vx * dt;
        this.renderable.y = this.renderable.y + this.vy * dt;
        this.life += dt;
        this.renderable.colorA = clamp(1 - this.life / this.ttl, 0, 1);
    }

    isAlive() {
        return this.life < this.ttl;
    }
}

export class ParticleContainer {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    add(particle) {
        this.particles.push(particle);
        this.scene.addEntity(particle);
    }

    tick(dt) {
        this.particles.forEach(particle =>
            particle.tick(dt)
        );

        const deadParticles = this.particles.filter(particle => !particle.isAlive());
        this.particles = this.particles.filter(particle => particle.isAlive());
        this.scene.removeEntities(deadParticles);
    }
}
