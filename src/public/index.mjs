import { DeltaTime } from './deltaTime.mjs';
import { Keyboard } from './keyboard.mjs';
import { Renderer } from './renderer.mjs';
import { Scene } from './scene.mjs';
import { canvasWidth, canvasHeight } from './game/globals.mjs';
import { Player } from './game/player.mjs';
import { PlatformsContainer } from './game/platform.mjs';
import { CollisionContainer } from './game/collision.mjs';
import { ParticleContainer } from './game/particle.mjs';
import { TextEntity } from './game/text.mjs';

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

const player = new Player(keyboard, collisions, particles);
scene.addEntity(player);
const platforms = new PlatformsContainer(scene, collisions);
let score = 0;
let maxScore = 0;
const getScoreText = () => maxScore === score ? Math.floor(score) : `${Math.floor(score)}/${Math.floor(maxScore)}`;
const text = new TextEntity(getScoreText(), 0, 32, 32);
scene.addEntity(text);

const resetGame = () => {
    platforms.clearAll();
    player.reset();
    platforms.spawnFirstPlatform();
    maxScore = Math.max(score, maxScore);
    score = 0;
};

resetGame();
const deltaTimeRepo = new DeltaTime();
setInterval(() => {
    const dt = deltaTimeRepo.get();
    player.tick(dt);
    platforms.tick(dt);
    collisions.tick();
    particles.tick(dt);
    score += dt;
    maxScore = Math.max(score, maxScore);
    text.setText(getScoreText());

    if (player.renderable.y === canvasHeight) {
        resetGame();
    }
}, fpsToMs(logicFps));
