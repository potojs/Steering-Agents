import { p5 } from "./main";
import { Vector } from "./math";
import {
    constrain,
    drawArrow,
    floor,
    fromAngle,
    map,
    PI,
    vec,
} from "./utility";

export class FlowField {
    public vectors: Vector[][] = [];
    public cols: number;
    public rows: number;
    public res: number;
    constructor(cols: number, rows: number, res: number = 1) {
        this.cols = cols;
        this.rows = rows;
        this.res = res;
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(vec());
            }
            this.vectors.push(row);
        }
    }
    lookup(pos: Vector) {
        const cpos = constrain(
            pos,
            vec(0, 0),
            vec(this.res * (this.cols - 1), this.res * (this.rows - 1))
        );
        return this.vectors[floor(cpos.y / this.res)][
            floor(cpos.x / this.res)
        ].copy();
    }
    show(pos: Vector) {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const x = pos.x + i * this.res;
                const y = pos.y + j * this.res;
                drawArrow(
                    x + this.res / 2,
                    y + this.res / 2,
                    this.get(i, j).copy(),
                    this.res,
                    [this.get(i, j).mag()*30, 255-this.get(i, j).mag()*10, 0]
                );
            }
        }
    }
    fill(func: (x: number, y: number) => Vector) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.set(func(j * this.res, i * this.res), j, i);
            }
        }
    }
    fillNoise(
        scaleX: number,
        scaleY: number = 0,
        rots: number = 0,
        zoff: number = 0
    ) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const angle = map(
                    p5.noise(j / scaleX, i / (scaleY || scaleX), zoff),
                    0,
                    1,
                    0,
                    PI * (rots || 1) * 2
                );
                this.set(fromAngle(angle), j, i);
            }
        }
    }
    init(data: FlowField | Vector[][] | Vector) {
        if (data instanceof Vector) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.set(data, j, i);
                }
            }
        } else {
            if (data instanceof FlowField) {
                data = data.vectors;
            }
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.set(data, j, i);
                }
            }
        }
    }
    set(value: Vector | FlowField | Vector[][], x: number, y: number) {
        if (value instanceof Vector) {
            this.vectors[y][x].x = value.x;
            this.vectors[y][x].y = value.y;
        } else if (value instanceof FlowField) {
            this.vectors[y][x].x = value.get(x, y).x;
            this.vectors[y][x].y = value.get(x, y).y;
        } else {
            this.vectors[y][x].x = value[y][x].x;
            this.vectors[y][x].y = value[y][x].y;
        }
    }
    get(x: number, y: number) {
        return this.vectors[y][x];
    }
}
