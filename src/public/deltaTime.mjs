export class DeltaTime {
    get() {
        const previousTime = this.previous || Date.now();
        const now = Date.now();
        this.previous = now;
        return (now - previousTime) / 100;
    }
}
