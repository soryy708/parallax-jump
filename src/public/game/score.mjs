import { TextEntity } from './text.mjs';
import { targetMinVelocity, targetMaxVelocity } from './target.mjs';

export class Score {
    constructor(scene) {
        this.scene = scene;

        this.score = 0;
        this.maxScore = Number(window.localStorage.getItem('maxScore') || '0');

        this.text = new TextEntity(this.getScoreText(), 0, 32, 32);
        this.scene.addEntity(this.text);
    }

    getScoreText() {
        return this.maxScore === this.score ? Math.floor(this.score) : `${Math.floor(this.score)}/${Math.floor(this.maxScore)}`;
    }

    tick() {
        this.maxScore = Math.max(this.score, this.maxScore);
        this.text.setText(this.getScoreText());
    }

    onCollect(target) {
        const baseScore = 7;
        const velocityUtilization = (target.velocity - targetMinVelocity) / (targetMaxVelocity - targetMinVelocity);
        const velocityBonus = Math.round(5 * velocityUtilization);
        this.score += baseScore + velocityBonus;
    }

    reset() {
        this.maxScore = Math.max(this.score, this.maxScore);
        window.localStorage.setItem('maxScore', `${this.maxScore}`);
        this.score = 0;
    }
}
