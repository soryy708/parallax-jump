class Collider {
    constructor(x, y) {
        this.type = 'unknown';
        this.x = x;
        this.y = y;
        this.collisionListeners = [];
    }

    onCollision(callback) {
        this.collisionListeners.push(callback);
    }

    publishCollision(other) {
        this.collisionListeners.forEach(callback => callback(other));
    }
}

export class RectangleCollider extends Collider {
    constructor(x, y, w, h) {
        super(x, y);
        this.type = 'rect';
        this.w = w;
        this.h = h;
    }
}

export class CircleCollider extends Collider {
    constructor(x, y, r) {
        super(x, y);
        this.type = 'circle';
        this.r = r;
    }
}

function rectCollidesRect(r1, r2) {
    return (
        (
            r1.x >= r2.x && r1.x <= r2.x + r2.w &&
            r1.y >= r2.y && r1.y <= r2.y + r2.h
        ) || (
            r1.x + r1.w >= r2.x && r1.x + r1.w <= r2.x + r2.w &&
            r1.y + r1.h >= r2.y && r1.y + r1.h <= r2.y + r2.h
        )
    );
}

function rectCollidesCircle(r, c) {
    const distX = Math.abs(c.x - r.x - r.w / 2);
    const distY = Math.abs(c.y - r.y - r.h / 2);

    if (distX > (r.w / 2 + c.r) || distY > (r.h / 2 + c.r)) {
        return false;
    }

    if (distX <= (r.w / 2) || distY <= (r.h / 2)) {
        return true;
    }

    const dx = distX - r.w / 2;
    const dy = distY - r.h / 2;
    return (dx * dx + dy * dy <= (c.r * c.r));
}

function circleCollidesCircle(c1, c2) {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2)) <= c1.r + c2.r;
}

export class CollisionContainer {
    constructor() {
        this.entities = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntities(entities) {
        this.entities = this.entities.filter(entity => !entities.includes(entity));
    }

    tick() {
        this.entities.forEach((entityA, i) => {
            this.entities.slice(i).forEach(entityB => {
                const colliderA = entityA.collider;
                const colliderB = entityB.collider;
                const collides = this.checkCollision(colliderA, colliderB);
                if (collides) {
                    this.publishCollision(entityA, entityB);
                }
            });
        });
    }

    getColliders(entityA) {
        return this.entities.filter(entityB =>
            this.checkCollision(entityA.collider, entityB.collider)
        );
    }

    checkCollision(colliderA, colliderB) {
        if (colliderA === colliderB) {
            return false;
        }
        switch (colliderA.type) {
            case 'rect': {
                switch (colliderB.type) {
                    case 'rect': {
                        return rectCollidesRect(colliderA, colliderB);
                    }
                    case 'circle': {
                        return rectCollidesCircle(colliderA, colliderB);
                    }
                }
                break;
            }
            case 'circle': {
                switch (colliderB.type) {
                    case 'rect': {
                        return rectCollidesCircle(colliderB, colliderA);
                    }
                    case 'circle': {
                        return circleCollidesCircle(colliderA, colliderB);
                    }
                }
                break;
            }
        }
    }

    publishCollision(entityA, entityB) {
        entityA.collider.publishCollision(entityB);
        entityB.collider.publishCollision(entityA);
    }
}
