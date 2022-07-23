export class Scene {
    constructor() {
        this.entities = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const i = this.entities.findIndex(e => e === entity);
        if (i !== -1) {
            this.entities.splice(i, 1);
        }
    }

    removeEntities(entities) {
        this.entities = this.entities.filter(entity => !entities.includes(entity));
    }

    forEach(callback) {
        this.entities.forEach(callback);
    }
}
