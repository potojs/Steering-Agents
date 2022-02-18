import P5 from "p5";
import { p5 } from "./main";
import { Vector } from "./math";
import { PhysicsObject } from "./physicsObject";
import {
    abs,
    add,
    atan2,
    constrain,
    cos,
    dist,
    distSq,
    distToLine,
    distToLineC,
    distToLineSq,
    distToLineSqC,
    fromAngle,
    min,
    mult,
    PI,
    rotate,
    sign,
    sqrt,
    sub,
    vec,
} from "./utility";

export class Path {
    show(...arg: any): any {}
    isInside(point: Vector) {
        return false;
    }
    getNormalPoint(point: Vector) {
        return vec();
    }
    getNext(point: Vector, amt: number) {
        return vec();
    }
    getDirection(vect: Vector, pos: Vector) {
        return 1;
    }
    getDistTo(p: Vector) {}
    getDistToSq(p: Vector) {}
}

export class StraightPath extends Path {
    public segs: PathSegment[] = [];

    constructor(points: Vector[], radius: number = 0) {
        super();
        for (let i = 0; i < points.length - 1; i++) {
            this.segs.push(new PathSegment(points[i], points[i + 1], radius));
        }
    }
    getNext(point: Vector, amt: number, segement?: number): Vector {
        // UNOP
        const index = segement || this.getClosest(point)[0];
        const seg = this.segs[index];
        const pred = vec(
            point.x + seg.directingVector.x * amt,
            point.y + seg.directingVector.y * amt
        );
        const pos1 = constrain(pred, seg.start, seg.end);
        const left = sub(pred, pos1);
        const distLeft = left.mag();
        if (left.isNull()) {
            return pos1;
        } else {
            const dir =
                sign(left.x / seg.directingVector.x) ||
                sign(left.y / seg.directingVector.y);
            let nextIndex = index + dir;
            if (nextIndex >= 0 && nextIndex < this.segs.length) {
                const nextSeg = this.segs[nextIndex];
                let vect: Vector;
                if (dir === 1) {
                    vect = this.getNext(nextSeg.start, distLeft, nextIndex);
                } else {
                    vect = this.getNext(nextSeg.end, -distLeft, nextIndex);
                }
                return vect;
            }
            return pos1;
        }
    }
    getClosest(point: Vector): [number, number] {
        let bestDist = Infinity;
        let bestSeg = 0;
        for (let i = 0; i < this.segs.length; i++) {
            const distSq = this.segs[i].getDistToSq(point);
            if (distSq < bestDist) {
                bestDist = distSq;
                bestSeg = i;
            }
        }
        return [bestSeg, bestDist];
    }
    getNormalPoint(point: Vector): Vector {
        return this.segs[this.getClosest(point)[0]].getNormalPoint(point);
    }
    getDirection(vect: Vector, pos: Vector): number {
        return this.segs[this.getClosest(pos)[0]].getDirection(vect);
    }
    isInside(point: Vector) {
        const [index, distSq] = this.getClosest(point);
        return distSq < this.segs[index].radiusSq;
    }
    show() {
        for (let i = 0; i < this.segs.length; i++) {
            this.segs[i].drawBackground();
        }
        for (let i = 0; i < this.segs.length; i++) {
            this.segs[i].drawLine();
        }
    }
}

export class PathSegment extends Path {
    public start: Vector;
    public end: Vector;
    public radius: number;
    public normal: Vector;
    public normalRange: Vector;
    public directingVector: Vector;
    public radiusSq: number;
    public length: number;
    public lengthSq: number;

    constructor(
        x1: number | Vector,
        y1: number | Vector,
        x2: number = 0,
        y2: number = 0,
        radius: number = 0
    ) {
        super();
        if (x1 instanceof Vector && y1 instanceof Vector) {
            this.start = x1.copy();
            this.end = y1.copy();
            this.radius = x2;
        } else if (typeof x1 === "number" && typeof y1 === "number") {
            this.start = vec(x1, y1);
            this.end = vec(x2, y2);
            this.radius = radius;
        } else {
            throw new Error("Invalid arguments");
        }
        this.directingVector = sub(this.end, this.start).normalize();
        this.normal = rotate(this.directingVector, PI / 2);
        this.normalRange = mult(this.normal, this.radius);
        this.radiusSq = this.radius ** 2;
        this.length = dist(this.start, this.end);
        this.lengthSq = distSq(this.start, this.end);
    }
    getDirection(vect: Vector): number {
        const dot =
            this.directingVector.x * vect.x + this.directingVector.y * vect.y;
        if (dot === 0) return 0;
        return sign(dot);
    }
    getNext(point: Vector, amt: number) {
        const pred = vec(
            point.x + this.directingVector.x * amt,
            point.y + this.directingVector.y * amt
        );
        const pos1 = constrain(pred, this.start, this.end);
        return pos1;
    }
    getDistToSq(point: Vector) {
        return distToLineSqC(point, this.start, this.end);
    }
    getDistTo(point: Vector) {
        return distToLineC(point, this.start, this.end);
    }
    isInside(point: Vector) {
        const distSq = this.getDistToSq(point);

        const dot =
            this.directingVector.x * (point.x - this.start.x) +
            this.directingVector.y * (point.y - this.start.y);
        return distSq < this.radiusSq && dot > 0 && dot < this.length;
    }
    getNormalPoint(point: Vector) {
        const dx = point.x - this.start.x;
        const dy = point.y - this.start.y;
        const dot = constrain(
            dx * this.directingVector.x + dy * this.directingVector.y,
            0,
            this.length
        );

        return vec(
            this.start.x + this.directingVector.x * dot,
            this.start.y + this.directingVector.y * dot
        );
    }
    drawBackground() {
        p5.fill(150);
        p5.circle(this.start.x, this.start.y, this.radius * 2);
        p5.circle(this.end.x, this.end.y, this.radius * 2);
        p5.noStroke();
        p5.beginShape();
        p5.vertex(
            this.start.x + this.normalRange.x,
            this.start.y + this.normalRange.y
        );
        p5.vertex(
            this.start.x - this.normalRange.x,
            this.start.y - this.normalRange.y
        );
        p5.vertex(
            this.end.x - this.normalRange.x,
            this.end.y - this.normalRange.y
        );
        p5.vertex(
            this.end.x + this.normalRange.x,
            this.end.y + this.normalRange.y
        );
        p5.endShape(p5.CLOSE);
    }
    drawLine() {
        p5.stroke(80);
        p5.strokeWeight(8);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
    show() {
        this.drawBackground();
        this.drawLine();
    }
}
