import { Renderable } from '../renderer.mjs';
import { canvasWidth, canvasHeight } from './globals.mjs';
import { clamp, randomInRange } from './util.mjs';
import { CircleCollider } from './collision.mjs';
import { Particle } from './particle.mjs';
import { PlayerIndicator } from './indicator.mjs';

const g = 9.8; // https://en.wikipedia.org/wiki/Gravitational_constant

export class Player {
    constructor(keyboard, collisions, particles, scene, canvas, score) {
        this.keyboard = keyboard;
        this.collisions = collisions;
        this.particles = particles;
        this.scene = scene;
        this.canvas = canvas;
        this.score = score;
        this.canvasRotation = 10;

        // Renderable
        this.renderable = new Renderable();
        this.renderable.type = 'ellipse';
        this.renderable.r = 8;
        this.renderable.z = 1;

        // Collider
        this.collider = new CircleCollider(
            this.renderable.x,
            this.renderable.y,
            this.renderable.r
        );

        // Physics
        this.mass = 10;
        this.accelerationClampMin = -Infinity;
        this.accelerationClampMax = 5;
        this.velocityYClampMin = -50;
        this.velocityYClampMax = 50;
        this.velocityXMagnitude = 10;

        // Jumping
        this.jumpGrace = 2;
        this.maxJumpTime = 3;
        this.jumpAcceleration = -1 * this.mass;
        this.jumpForce = 10;

        this.reset();

        // Input
        this.keyboard.onKeyDown('Space', this.onJumpKeyDown.bind(this));
        this.keyboard.onKeyUp('Space', this.onJumpKeyUp.bind(this));
        this.keyboard.onKeyDown('KeyW', this.onJumpKeyDown.bind(this));
        this.keyboard.onKeyUp('KeyW', this.onJumpKeyUp.bind(this));
        this.keyboard.onKeyDown('ArrowUp', this.onJumpKeyDown.bind(this));
        this.keyboard.onKeyUp('ArrowUp', this.onJumpKeyUp.bind(this));

        this.scene.addEntity(this);
    }

    onJumpKeyDown() {
        if (this.canJump()) {
            this.jumping = true;
            this.jumpTime = 0;
            this.acceleration = 0;
            this.velocityY = this.jumpForce * -1;

            this.doubleJumped = this.isDoubleJump();
        }
    }

    onJumpKeyUp() {
        this.jumping = false;
    }

    reset() {
        this.renderable.x = canvasWidth / 4;
        this.renderable.y = 0;
        this.collider.x = this.renderable.x;
        this.collider.y = this.renderable.y;
        this.acceleration = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.jumpTime = 0;
        this.timeFromCollisionEnd = 0;
        this.doubleJumped = false;
        this.died = false;
    }

    showIndicator() {
        if (!this.indicator) {
            this.indicator = new PlayerIndicator();
            this.scene.addEntity(this.indicator);
        }
    }

    hideIndicator() {
        if (this.indicator) {
            this.scene.removeEntity(this.indicator);
            this.indicator = null;
        }
    }

    createLandingParticleCloud(vx) {
        const particleCount = 6;
        for (let i = 0; i < particleCount; ++i) {
            const particleRadius = randomInRange(2, 5);
            const particleVelocityX = randomInRange(-4, 4) + vx / 2;
            const particleVelocityY = randomInRange(-4, 4);
            const particleTtl = randomInRange(5, 10);
            this.particles.add(new Particle(
                this.renderable.x,
                this.renderable.y + this.renderable.r / 2,
                particleRadius,
                particleVelocityX,
                particleVelocityY,
                particleTtl
            ));
        }
    }

    createBloodParticleCloud() {
        const particleCount = 32;
        for (let i = 0; i < particleCount; ++i) {
            const particleRadius = randomInRange(1, 4);
            const particleVelocityX = randomInRange(-16, 16) + this.velocityX;
            const particleVelocityY = randomInRange(-16, 0);
            const particleTtl = randomInRange(2, 5);
            const particle = new Particle(
                this.renderable.x,
                this.renderable.y + this.renderable.r / 2,
                particleRadius,
                particleVelocityX,
                particleVelocityY,
                particleTtl
            );
            particle.renderable.colorG = 0;
            particle.renderable.colorB = 0;
            this.particles.add(particle);
        }
    }

    createDoubleJumpParticle() {
        const particleRadius = randomInRange(2, 4);
        const particleVelocityX = randomInRange(-3, 3);
        const particleVelocityY = randomInRange(0, 6);
        const particleTtl = randomInRange(5, 10);
        const particle = new Particle(
            this.renderable.x,
            this.renderable.y + this.renderable.r / 2,
            particleRadius,
            particleVelocityX,
            particleVelocityY,
            particleTtl
        );
        particle.renderable.colorR = 1;
        particle.renderable.colorG = 0.8;
        particle.renderable.colorB = randomInRange(0, 0.5);
        this.particles.add(particle);
    }

    createTargetCollectionParticleCloud(target) {
        const particleCount = 4;
        for (let i = 0; i < particleCount; ++i) {
            const spread = 8;
            const particleRadius = randomInRange(2, target.renderable.r);
            const particleVelocityX = randomInRange(-1 * spread, spread) - target.velocity + Math.max(0, this.velocityX) * 2;
            const particleVelocityY = randomInRange(-1 * spread, spread);
            const particleTtl = randomInRange(2, 5);
            const particle = new Particle(
                target.renderable.x,
                target.renderable.y + target.renderable.r / 2,
                particleRadius,
                particleVelocityX,
                particleVelocityY,
                particleTtl
            );
            particle.renderable.colorR = target.renderable.colorR;
            particle.renderable.colorG = target.renderable.colorG;
            particle.renderable.colorB = target.renderable.colorB;
            this.particles.add(particle);
        }
    }

    onCollisionWithPlatform(collider) {
        this.createLandingParticleCloud(collider.velocity || 0);
        this.renderable.r2 = this.renderable.r * 0.75;
        this.canvas.style.transform = `rotateX(${this.canvasRotation *= -1}deg)`;
    }

    tick(dt) {
        const remainingDoubleJump = this.doubleJumped ? (this.jumping ? (1 - this.jumpTime / this.maxJumpTime) : 0) : 1;
        const jumpIndicator = this.collidingWithPlatform ? 1 : remainingDoubleJump;
        const yellowness = jumpIndicator;
        this.renderable.colorB = 1 - yellowness;

        if (this.renderable.y === canvasHeight) {
            this.createBloodParticleCloud();
            this.died = true;
        }

        const allColliders = this.collisions.getColliders(this);
        const platformColliders = allColliders.filter(collider => collider.label === 'platform');
        const targetColliders = allColliders.filter(collider => collider.label === 'target');
        const platformWeStandOn = platformColliders.find(collider => collider.collider.h >= canvasHeight - (this.collider.y + this.collider.r));
        this.collidingWithPlatform = this.collider.y === canvasHeight || platformWeStandOn;
        if (this.collidingWithPlatform) {
            if (this.timeFromCollisionEnd > 0) {
                platformColliders.forEach(this.onCollisionWithPlatform.bind(this));
            } else {
                this.canvas.style.transform = `rotateX(0)`;
            }
            this.timeFromCollisionEnd = 0;
        } else {
            this.timeFromCollisionEnd += dt;
            this.renderable.r2 = this.renderable.r;
        }

        targetColliders.forEach(target => {
            this.createTargetCollectionParticleCloud(target);
            target.onCollect();
            this.score.onCollect(target);
        });

        if (this.jumping) {
            if (this.isDoubleJump()) {
                this.renderable.r2 = this.renderable.r * 1.5;
            } else {
                this.renderable.r2 = this.renderable.r * 1.25;
            }
            this.acceleration = clamp(this.acceleration + this.jumpAcceleration * dt, this.accelerationClampMin, this.accelerationClampMax);
            if (this.doubleJumped) {
                this.createDoubleJumpParticle();
            }
            this.jumpTime += dt;
            if (this.jumpTime >= this.maxJumpTime) {
                this.jumping = false;
            }
        } else if (this.collidingWithPlatform && platformWeStandOn || this.collider.y === canvasHeight) {
            if (this.velocityY >= 0) {
                this.acceleration = 0;
                this.velocityY = 0;
            }
        } else {
            this.acceleration = clamp(this.acceleration + this.mass * g * dt, this.accelerationClampMin, this.accelerationClampMax);
        }

        this.velocityX = (((
            this.keyboard.isDown('KeyA') ||
            this.keyboard.isDown('ArrowLeft')
        ) ? -1 : 0) + ((
            this.keyboard.isDown('KeyD') ||
            this.keyboard.isDown('ArrowRight')
        ) ? 1 : 0)) * this.velocityXMagnitude;

        this.renderable.y = clamp(this.renderable.y + this.velocityY * dt, -Infinity, canvasHeight);
        this.velocityY = clamp(this.velocityY + this.acceleration * dt, this.velocityYClampMin, this.velocityYClampMax);
        this.renderable.x = clamp(this.renderable.x + this.velocityX * dt, 0, canvasWidth);

        this.collider.x = this.renderable.x;
        this.collider.y = this.renderable.y;

        if (this.renderable.y - this.renderable.r <= 0) {
            this.showIndicator();
        } else {
            this.hideIndicator();
        }
        if (this.indicator) {
            this.indicator.update(this.renderable.x, Math.abs(this.renderable.y - this.renderable.r) / 3);
        }
    }

    canJump() {
        return this.collidingWithPlatform || this.timeFromCollisionEnd < this.jumpGrace || (this.isDoubleJump() && !this.doubleJumped);
    }

    isDoubleJump() {
        return !this.collding && this.timeFromCollisionEnd >= this.jumpGrace;
    }

    isDead() {
        return this.died;
    }
}
