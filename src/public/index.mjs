import { DeltaTime } from './deltaTime.mjs';
import { Keyboard } from './keyboard.mjs';
import { Renderable, Renderer } from './renderer.mjs';
import { Scene } from './scene.mjs';
import { canvasWidth, canvasHeight } from './game/globals.mjs';
import { Player } from './game/player.mjs';
import { EffectsContainer } from './game/effect.mjs';
import { PlatformsContainer } from './game/platform.mjs';
import { CollisionContainer } from './game/collision.mjs';
import { ParticleContainer } from './game/particle.mjs';
import { TargetContainer } from './game/target.mjs';
import { Background } from './game/background.mjs';
import { Score } from './game/score.mjs';

const logicFps = 60;
const canvas = document.getElementById('main');

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const renderer = new Renderer(canvas);
renderer.start();

const fpsToMs = (fps) => 1000 / fps;

const keyboard = new Keyboard();
keyboard.subscribe();

const scene = new Scene();
renderer.addScene(scene);

const collisions = new CollisionContainer();
const particles = new ParticleContainer(scene);

const score = new Score(scene);
const player = new Player(keyboard, collisions, particles, scene, canvas, score);
const platforms = new PlatformsContainer(scene, collisions);
const effects = new EffectsContainer(scene);
const targets = new TargetContainer(scene, collisions);

class Floor {
    constructor() {
        this.renderable = new Renderable();
        this.renderable.type = 'rect';
        this.renderable.h = 1;
        this.renderable.w = canvasWidth;
        this.renderable.x = 0;
        this.renderable.y = canvasHeight - this.renderable.h;
        this.renderable.colorG = 0;
        this.renderable.colorB = 0;
    }
}

scene.addEntity(new Floor());

const background = new Background(document.getElementsByTagName('body')[0]);

const resetGame = () => {
    platforms.clearAll();
    targets.clearAll();
    player.reset();
    platforms.spawnFirstPlatform();
    score.reset();
    background.reset();
};

resetGame();
const deltaTimeRepo = new DeltaTime();
setInterval(() => {
    const dt = deltaTimeRepo.get();
    player.tick(dt);
    platforms.tick(dt);
    targets.tick(dt);
    effects.tick(dt);
    collisions.tick();
    particles.tick(dt);
    background.tick(dt);
    score.tick(dt);

    if (player.isDead()) {
        resetGame();
    }

}, fpsToMs(logicFps));
