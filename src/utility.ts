import { p5 } from "./main";
import { Vector } from "./math";

export function fromAngle(angle: number, size: number = 1) {
    return vec(cos(angle) * size, sin(angle) * size);
}
export function add(v1: Vector, v2: Vector) {
    return vec(v1.x + v2.x, v1.y + v2.y);
}
export function vec(x: number = 0, y: number = 0) {
    return new Vector(x, y);
}
export function sub(v1: Vector, v2: Vector) {
    return vec(v1.x - v2.x, v1.y - v2.y);
}
export function mult(v1: Vector, s: number) {
    return vec(v1.x * s, v1.y * s);
}
export function div(v1: Vector, s: number) {
    return vec(v1.x / s, v1.y / s);
}
export const min = Math.min;
export const max = Math.max;
export const sqrt = Math.sqrt;
export let dist = (v1: Vector, v2: Vector) => sqrt(distSq(v1, v2));
export let distSq = (v1: Vector, v2: Vector) =>
    (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2;
export const cos = Math.cos;
export const sin = Math.sin;
export const atan2 = Math.atan2;
export const PI = Math.PI;
export const abs = Math.abs;
export const sign = Math.sign;
export const random = (s: number, e: number | null = null) => {
    return e === null ? Math.random() * s : s + Math.random() * (e - s);
};
export const map = (
    x: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
) => (x * (end2 - start2) - start1 * end2 + end1 * start2) / (end1 - start1);
export const floor = Math.floor;
export const ceil = Math.ceil;
export function rotate(vector: Vector, angle: number) {
    return vec(
        vector.x * cos(angle) - vector.y * sin(angle),
        vector.x * sin(angle) + vector.y * cos(angle)
    );
}

export function distToLine(point: Vector, start: Vector, end: Vector) {
    return Math.sqrt(distToLineSq(point, start, end));
}
export function distToLineSq(point: Vector, start: Vector, end: Vector) {
    const a = end.y - start.y;
    const b = start.x - end.x;
    const c = -(a * start.x + b * start.y);
    return (a * point.x + b * point.y + c) ** 2 / (a * a + b * b);
}
export function distToLineC(point: Vector, start: Vector, end: Vector) {
    return Math.sqrt(distToLineSqC(point, start, end));
}
export function distToLineSqC(
    point: Vector,
    start: Vector,
    end: Vector,
    dv?: Vector
) {
    let directingVector: Vector;
    const vec = sub(start, end);
    const p1 = sub(point, start);
    const p2 = sub(point, end);
    if (dv) {
        directingVector = dv.copy();
    } else {
        directingVector = vec.copy();
    }
    const dot = max(p1.dot(directingVector), p2.dot(directingVector));
    if (dot < 0 || dot * dot > vec.magSq() * directingVector.magSq()) {
        return min(p1.magSq(), p2.magSq());
    } else {
        const a = end.y - start.y;
        const b = start.x - end.x;
        const c = -(a * start.x + b * start.y);
        return (a * point.x + b * point.y + c) ** 2 / (a * a + b * b);
    }
}

export function constrain(x: number, start: number, end: number): number;
export function constrain(x: Vector, start: Vector, end: Vector): Vector;
export function constrain(
    x: number | Vector,
    start: number | Vector,
    end: number | Vector
) {
    if (
        x instanceof Vector &&
        start instanceof Vector &&
        end instanceof Vector
    ) {
        return vec(
            constrain(x.x, start.x, end.x),
            constrain(x.y, start.y, end.y)
        );
    } else {
        if (start > end) [end, start] = [start, end];
        return x < end ? (x > start ? x : start) : end;
    }
}
export function drawArrow(
    x: number,
    y: number,
    vec: Vector,
    size: number,
    col: number[]
) {
    p5.stroke(col);
    p5.fill(col);
    p5.strokeWeight(2);
    vec.setMag(size);
    p5.line(x, y, x + vec.x, y + vec.y);
    const angle = PI / 10;
    const v1 = rotateVector(vec.copy().mult(-1), angle);
    v1.setMag(4);
    const v2 = rotateVector(v1, -angle * 2);
    p5.beginShape();
    p5.vertex(x + vec.x, y + vec.y);
    p5.vertex(x + vec.x + v1.x, y + vec.y + v1.y);
    p5.vertex(x + vec.x + v2.x, y + vec.y + v2.y);
    p5.endShape(p5.CLOSE);
}
export function rotateVector(vect: Vector, angle: number) {
    return vec(
        vect.x * Math.cos(angle) - vect.y * Math.sin(angle),
        vect.x * Math.sin(angle) + vect.y * Math.cos(angle)
    );
}
export function average(...vectors: Vector[]) {
    const sum = vec();
    for (let i = 0; i < vectors.length; i++) {
        sum.x += vectors[i].x;
        sum.y += vectors[i].y;
    }
    return div(sum, vectors.length);
}
