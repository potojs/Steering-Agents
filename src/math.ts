import { atan2, sqrt, vec } from "./utility";

export class Vector {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    mult(s: number) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    div(s: number) {
        this.mult(1 / s);
        return this;
    }
    add(vec: Vector) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }
    sub(vec: Vector) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
    copy() {
        return vec(this.x, this.y);
    }
    dot(vec: Vector) {
        return vec.x * this.x + vec.y * this.y;
    }
    mag() {
        return sqrt(this.magSq());
    }
    magSq() {
        return this.x * this.x + this.y * this.y;
    }
    normalize() {
        if (!this.isNull()) {
            this.div(this.mag());
        }
        return this;
    }
    isNull() {
        return this.x === 0 && this.y === 0;
    }
    setMag(x: number) {
        this.normalize();
        this.mult(x);
        return this;
    }
    limit(lim: number) {
        if (this.magSq() > lim * lim) {
            this.setMag(lim);
        }
        return this;
    }
    heading() {
        return atan2(this.y, this.x);
    }
}
