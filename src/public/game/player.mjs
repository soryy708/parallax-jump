import { Renderable } from '../renderer.mjs';
import { canvasWidth, canvasHeight } from './globals.mjs';
import { clamp, randomInRange } from './util.mjs';
import { CircleCollider } from './collision.mjs';
import { Particle } from './particle.mjs';

const g = 9.8; // https://en.wikipedia.org/wiki/Gravitational_constant

export class Player {
    constructor(keyboard, collisions, particles) {
        this.keyboard = keyboard;
        this.collisions = collisions;
        this.particles = particles;

        // Renderable
        this.renderable = new Renderable();
        this.renderable.type = 'ellipse';
        this.renderable.r = 8;

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
        this.jumpGrace = 1;
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
        particle.renderable.colorR = randomInRange(0.5, 1);
        particle.renderable.colorG = randomInRange(0.5, 1);
        particle.renderable.colorB = 0;
        this.particles.add(particle);
    }

    tick(dt) {
        if (this.renderable.y === canvasHeight) {
            this.createBloodParticleCloud();
            this.died = true;
        }

        const colliders = this.collisions.getColliders(this);
        const platformWeStandOn = colliders.find(collider => collider.collider.h >= canvasHeight - (this.collider.y + this.collider.r));
        this.colliding = this.collider.y === canvasHeight || platformWeStandOn;
        if (this.colliding) {
            if (this.timeFromCollisionEnd > 0) {
                colliders.forEach(collider => {
                    this.createLandingParticleCloud(collider.velocity || 0);
                });
                this.renderable.r2 = this.renderable.r * 0.75;
            }
            this.timeFromCollisionEnd = 0;
        } else {
            this.timeFromCollisionEnd += dt;
            this.renderable.r2 = this.renderable.r;
        }

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
        } else if (this.colliding && platformWeStandOn || this.collider.y === canvasHeight) {
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
        )? 1 : 0)) * this.velocityXMagnitude;

        this.renderable.y = clamp(this.renderable.y + this.velocityY * dt, -Infinity, canvasHeight);
        this.velocityY = clamp(this.velocityY + this.acceleration * dt, this.velocityYClampMin, this.velocityYClampMax);
        this.renderable.x = clamp(this.renderable.x + this.velocityX * dt, 0, canvasWidth);

        this.collider.x = this.renderable.x;
        this.collider.y = this.renderable.y;
    }

    canJump() {
        return this.colliding || this.timeFromCollisionEnd < this.jumpGrace || (this.isDoubleJump() && !this.doubleJumped);
    }

    isDoubleJump() {
        return !this.collding && this.timeFromCollisionEnd >= this.jumpGrace;
    }

    isDead() {
        return this.died;
    }
}
