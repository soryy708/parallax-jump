export class Keyboard {
    constructor() {
        this.keyStates = new Map();
        this.keyDownListeners = new Map();
        this.keyUpListeners = new Map();
    }

    subscribe() {
        document.addEventListener('keydown', this._onKeyDown.bind(this));
        document.addEventListener('keyup', this._onKeyUp.bind(this));
    }

    unsubscribe() {
        document.removeEventListener('keydown', this._onKeyDown.bind(this));
        document.removeEventListener('keyup', this._onKeyUp.bind(this));
    }

    _onKeyDown(event) {
        if (event.repeat) {
            return;
        }
        const keyCode = event.code;
        this.keyStates.set(keyCode, true);
        if (this.keyDownListeners.has(keyCode)) {
            this.keyDownListeners.get(keyCode).forEach(listener => listener(keyCode));
        }
    }

    _onKeyUp(event) {
        const keyCode = event.code;
        this.keyStates.delete(keyCode);
        if (this.keyUpListeners.has(keyCode)) {
            this.keyUpListeners.get(keyCode).forEach(listener => listener(keyCode));
        }
    }

    /**
     * 
     * @param {String} keyCode https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
     * @returns 
     */
    isDown(keyCode) {
        return this.keyStates.has(keyCode);
    }

    onKeyDown(keyCode, callback) {
        if (!this.keyDownListeners.has(keyCode)) {
            this.keyDownListeners.set(keyCode, []);
        }
        this.keyDownListeners.get(keyCode).push(callback);
    }

    onKeyUp(keyCode, callback) {
        if (!this.keyUpListeners.has(keyCode)) {
            this.keyUpListeners.set(keyCode, []);
        }
        this.keyUpListeners.get(keyCode).push(callback);
    }
}
