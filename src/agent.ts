import P5 from "p5";
import { FlowField } from "./flowField";
import { deltaTime, p5 } from "./main";
import { Vector } from "./math";
import { Path } from "./path";
import { PhysicsObject } from "./physicsObject";
import {
    add,
    atan2,
    constrain,
    cos,
    dist,
    fromAngle,
    map,
    min,
    mult,
    PI,
    random,
    rotate,
    sin,
    sqrt,
    sub,
    vec,
} from "./utility";

export enum ShowOptions {
    DOT,
    CIRCLE,
    TRIANGLE,
    TARGET,
    NONE,
}
export class Agent extends PhysicsObject {
    public maxSpeed = 2;
    public maxForce = 1;
    public age = 0;
    public wanderingAngle: number = 0;

    constructor(
        x: number | Vector,
        y: number = 0,
        mass: number = 1,
        public lifetime: number = Infinity
    ) {
        super(x, y, mass);
    }
    setVelRnd(s: number = this.maxSpeed) {
        return super.setVelRnd(s);
    }
    getAgentsInFOV(group: Agent[], r: number, fieldOfView?: number) {
        const colls = this.getCollisions(r).filter((x) =>
            group.includes(x as Agent)
        );
        if (fieldOfView) {
            const angle = this.angle;
            const newArr = [];
            for (let i = 0; i < colls.length; i++) {
                const agentAngle = sub(colls[i].pos, this.pos).normalize();
                const headingVector = vec(cos(angle), sin(angle));
                if (agentAngle.dot(headingVector) > fieldOfView / 2) {
                    newArr.push(colls[i]);
                }
            }
            return newArr;
        } else {
            return colls;
        }
    }
    seperation(
        group: Agent[],
        debug: boolean = false,
        r: number = 200,
        fieldOfView: number = PI / 2,
        colls?: Agent[]
    ): Vector {
        const closeAgents = this.getAgentsInFOV(group, r, fieldOfView);
        const angle = this.angle;
        const force = vec();
        for (let i = 0; i < closeAgents.length; i++) {
            const d = dist(this.pos, closeAgents[i].pos);
            force.add(this.flee(closeAgents[i].pos).div(d));
        }
        if (debug) {
            for (let i = 0; i < closeAgents.length; i++) {
                p5.stroke(0);
                p5.strokeWeight(10);
                p5.point(closeAgents[i].pos.x, closeAgents[i].pos.y);
            }
            p5.fill(0, 100, 255, 30);
            p5.noStroke();
            p5.arc(
                this.pos.x,
                this.pos.y,
                r * 2,
                r * 2,
                angle - fieldOfView / 2,
                angle + fieldOfView / 2
            );
        }
        return force.div(closeAgents.length || 1).limit(this.maxForce);
    }
    stayWithinWindow(radius: number = 10) {
        return this.stayWithin(vec(0, 0), vec(p5.width, p5.height), radius);
    }
    stayWithin(min: Vector, max: Vector, radius: number) {
        if (
            this.pos.x < min.x + radius ||
            this.pos.x > max.x - radius ||
            this.pos.y < min.y + radius ||
            this.pos.y > max.y - radius
        ) {
            const target = vec(
                constrain(this.pos.x, min.x + radius, max.x - radius),
                constrain(this.pos.y, min.y + radius, max.y - radius)
            );
            return this.seek(target);
        } else {
            return vec();
        }
    }
    follow(
        toFollow: Path | FlowField,
        debug: boolean = false,
        offset: number = 40,
        lookAhead: number = 100,
        applyOutside: boolean = false
    ) {
        if (toFollow instanceof Path) {
            const vecN = this.vel.copy().normalize();
            const nextPos = vec(
                this.pos.x + vecN.x * lookAhead,
                this.pos.y + vecN.y * lookAhead
            );
            let normalPoint: Vector, dir: number | undefined, target: Vector;
            if (debug) {
                normalPoint = toFollow.getNormalPoint(nextPos);
                dir = toFollow.getDirection(this.vel, nextPos);
                target = toFollow.getNext(normalPoint, offset * dir);
                p5.strokeWeight(5);
                p5.stroke(120);
                p5.line(this.pos.x, this.pos.y, nextPos.x, nextPos.y);
                p5.line(nextPos.x, nextPos.y, normalPoint.x, normalPoint.y);
                p5.strokeWeight(9);
                p5.stroke(255, 0, 0);
                p5.point(normalPoint.x, normalPoint.y);
                p5.stroke(0, 255, 0);
                p5.point(nextPos.x, nextPos.y);
                p5.stroke(0, 0, 255);
                p5.point(target.x, target.y);
            }
            if (
                !toFollow.isInside(this.pos) ||
                !toFollow.isInside(nextPos) ||
                applyOutside
            ) {
                if (typeof dir !== "number") {
                    normalPoint = toFollow.getNormalPoint(nextPos);
                    dir = toFollow.getDirection(this.vel, nextPos);
                    target = toFollow.getNext(normalPoint, offset * dir);
                }
                return this.seek(target!, -1);
            }
            return vec();
        } else {
            const seek = toFollow
                .lookup(this.pos)
                .setMag(this.maxSpeed)
                .sub(this.vel);
            return seek;
        }
    }
    flee(target: Vector, mag: number = this.maxSpeed) {
        return this.seek(
            vec(this.pos.x * 2 - target.x, this.pos.y * 2 - target.y),
            -1,
            mag
        );
    }
    seek(
        target: Vector,
        arrival: number = -1,
        magSpeed: number = this.maxSpeed
    ) {
        const desiredVel = sub(target, this.pos).setMag(magSpeed);
        const d = dist(this.pos, target);
        if (d < arrival) {
            desiredVel.setMag(p5.map(d, 0, arrival, 0, this.maxSpeed));
        }
        const seekForce = sub(desiredVel, this.vel);
        seekForce.limit(this.maxForce);
        return seekForce;
    }
    pursue(
        target: PhysicsObject,
        debug: boolean = false,
        pred: number | "auto" = 2,
        maxDist: number = 200,
        maxPred: number = 5
    ) {
        let targetPos: Vector;
        if (pred === "auto") {
            const d = dist(target.pos, this.pos);
            const t = map(d, 0, maxDist, 0, maxPred);
            targetPos = vec(
                target.pos.x + target.vel.x * t,
                target.pos.y + target.vel.y * t
            );
        } else {
            targetPos = vec(
                target.pos.x + target.vel.x * pred,
                target.pos.y + target.vel.y * pred
            );
        }
        if (debug) {
            p5.stroke(0, 240, 20);
            p5.strokeWeight(3);
            p5.fill(0, 100, 20);
            p5.circle(targetPos.x, targetPos.y, 20);
        }
        return this.seek(targetPos);
    }
    evade(
        target: PhysicsObject,
        pred: number | "auto" = 2,
        debug: boolean = false
    ) {
        const pursueForce = this.pursue(target, debug, pred);
        return vec(-pursueForce.x, -pursueForce.y);
    }
    wander(
        debug: boolean = false,
        bigCircleRadius: number = 50,
        distBigCircle: number = 100,
        smallCircleRadius: number = 10
    ) {
        const angle = this.angle;
        const wanderingAngle = angle + this.wanderingAngle;
        const bigCircle = add(this.pos, mult(fromAngle(angle), distBigCircle));
        const smallCircle = add(
            bigCircle,
            mult(fromAngle(wanderingAngle), bigCircleRadius)
        );
        const newPos = add(
            smallCircle,
            mult(fromAngle(p5.random(0, PI * 2)), smallCircleRadius)
        );
        const target = add(
            bigCircle,
            sub(newPos, bigCircle).setMag(bigCircleRadius)
        );
        this.wanderingAngle = sub(target, bigCircle).heading() - angle;

        if (debug) {
            p5.noFill();
            p5.stroke(255);
            p5.strokeWeight(2);
            p5.circle(bigCircle.x, bigCircle.y, bigCircleRadius * 2);
            p5.circle(smallCircle.x, smallCircle.y, smallCircleRadius * 2);
            p5.stroke(0, 255, 0);
            p5.strokeWeight(15);
            p5.point(smallCircle.x, smallCircle.y);
            p5.stroke(255, 0, 0);
            p5.point(target.x, target.y);
        }
        return this.seek(target);
    }
    wrap() {
        if (this.pos.x < -10) {
            this.pos.x = p5.width;
        }
        if (this.pos.x > p5.width + 10) {
            this.pos.x = 0;
        }
        if (this.pos.y < -10) {
            this.pos.y = p5.height;
        }
        if (this.pos.y > p5.height + 10) {
            this.pos.y = 0;
        }
        this.updateQuadtree();
        return this;
    }
    show(size: number = 1, showOption: ShowOptions = ShowOptions.TRIANGLE) {
        switch (showOption) {
            case ShowOptions.DOT:
                p5.stroke(0);
                p5.strokeWeight(10 * size);
                p5.point(this.pos.x, this.pos.y);
                break;
            case ShowOptions.CIRCLE:
                p5.stroke(50);
                p5.strokeWeight(2);
                p5.fill(100);
                p5.circle(this.pos.x, this.pos.y, 20 * size);
                break;
            case ShowOptions.TRIANGLE:
                const angle = this.angle;
                const baseSize = 20 * size;
                const height = 30 * size;
                p5.stroke(50);
                p5.strokeWeight(2);
                p5.fill(100);
                let pt1 = rotate(vec(-height / 2, -baseSize / 2), angle);
                let pt2 = rotate(vec(-height / 2, baseSize / 2), angle);
                let pt3 = rotate(vec(height / 2, 0), angle);

                p5.triangle(
                    this.pos.x + pt1.x,
                    this.pos.y + pt1.y,
                    this.pos.x + pt2.x,
                    this.pos.y + pt2.y,
                    this.pos.x + pt3.x,
                    this.pos.y + pt3.y
                );
                break;
            case ShowOptions.TARGET:
                p5.stroke(255);
                p5.strokeWeight(2 * size);
                p5.fill(255, 10, 30);
                p5.circle(this.pos.x, this.pos.y, 20 * size);
                break;
        }
        return this;
    }
    setVel(x: Vector | number, y: number = 0) {
        this.vel = x instanceof Vector ? x : vec(x, y);
        return this;
    }
    update(debug: boolean = false, vel: number = 1, acc: number = 1) {
        this.age += deltaTime;
        this.vel.limit(this.maxSpeed);
        super.update();
        p5.strokeWeight(1);
        if (debug) {
            p5.stroke(0, 255, 0);
            p5.line(
                this.pos.x,
                this.pos.y,
                this.pos.x + this.vel.x * vel,
                this.pos.y + this.vel.y * vel
            );
            p5.stroke(255, 0, 0);
            p5.line(
                this.pos.x,
                this.pos.y,
                this.pos.x + this.pAcc.x * acc,
                this.pos.y + this.pAcc.y * acc
            );
        }
        if (this.age*60/1000 >= this.lifetime) {
            this.kill();
        }
        return this;
    }
    get angle() {
        return p5.atan2(this.vel.y, this.vel.x);
    }
}
