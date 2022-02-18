import P5 from "p5";
import { QuadtreeItem } from "quadtree-lib";
import { deltaTime, p5, quadtree, QuadTreeItem } from "./main";
import { Vector } from "./math";
import { vec, sub, div, mult, cos, sin, random, PI } from "./utility";

export class PhysicsObject {
    public pos: Vector;
    public vel: Vector;
    public acc: Vector;
    public pPos: Vector;
    public pVel: Vector;
    public pAcc: Vector;
    public mass: number;
    public quadTreeItem: QuadTreeItem;
    public isAlive = true;
    public locked = false;

    constructor(x: number | Vector, y: number = 0, mass: number = 0) {
        if (x instanceof Vector) {
            this.pos = x.copy();
            this.mass = y;
        } else {
            this.pos = vec(x, y);
            this.mass = mass;
        }
        this.vel = vec();
        this.acc = vec();
        this.pPos = vec();
        this.pVel = vec();
        this.pAcc = vec();
        if (this.mass === 0) throw new Error("mass can't be equal to zero!");
        this.quadTreeItem = {
            x: this.pos.x,
            y: this.pos.y,
            userData: this,
        };
        this.addQuadtreeElement();
    }
    addQuadtreeElement() {
        quadtree.push(this.quadTreeItem);
    }
    setVelRnd(speed: number) {
        const a = random(PI * 2);
        this.vel.x = speed * cos(a);
        this.vel.y = speed * sin(a);
        return this;
    }
    kill() {
        this.isAlive = false;
        quadtree.remove(this.quadTreeItem);
    }
    getCollisions(r: number) {
        const colls = quadtree.colliding({
            x: this.pos.x - r,
            y: this.pos.y - r,
            width: r * 2,
            height: r * 2,
        });
        return colls
            .filter((x) => x.userData !== this)
            .filter((x) => sub(this.pos, vec(x.x, x.y)).magSq() < r * r)
            .map((x) => x.userData);
    }
    show(...arg: any) {}
    applyForceTo(point: Vector, mag: number) {
        const force = sub(point, this.pos);
        force.setMag(mag);
        this.applyForce(force);
        return this;
    }
    applyForce(force: Vector) {
        this.acc.x += force.x / this.mass;
        this.acc.y += force.y / this.mass;
        return this;
    }
    updatePrev() {
        this.pPos.x = this.pos.x;
        this.pPos.y = this.pos.y;
        this.pVel.x = this.vel.x;
        this.pVel.y = this.vel.y;
        this.pAcc.x = this.acc.x;
        this.pAcc.y = this.acc.y;
    }
    setPos(x: number | Vector, y: number | null = null) {
        this.updatePrev();
        if (y === null && x instanceof Vector) {
            this.pos.x = x.x;
            this.pos.y = x.y;
        } else {
            this.pos.x = x instanceof Vector ? x.x : x;
            this.pos.y = y ?? (x instanceof Vector ? x.y : 0);
        }
        this.updateQuadtree();
    }
    update() {
        if (!this.locked) {
            this.updatePrev();
            this.vel.x += this.acc.x * deltaTime;
            this.vel.y += this.acc.y * deltaTime;
            this.pos.x += this.vel.x * deltaTime;
            this.pos.y += this.vel.y * deltaTime;
            this.acc.x = 0;
            this.acc.y = 0;
            this.updateQuadtree();
        }
    }
    updateQuadtree() {
        this.quadTreeItem.x = this.pos.x;
        this.quadTreeItem.y = this.pos.y;
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
}
