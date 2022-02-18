import P5 from "p5";
import Quadtree, { QuadtreeItem } from "quadtree-lib";
import { Agent, ShowOptions } from "./agent";
import { FlowField } from "./flowField";
import { Path, PathSegment, StraightPath } from "./path";
import { PhysicsObject } from "./physicsObject";
import "./style.scss";
import { Target } from "./target";
import { floor, map, mult, PI, random, sin, sub, vec } from "./utility";

export let p5: P5;
export let deltaTime: number;
const agents: Agent[] = [];
export interface QuadTreeItem extends QuadtreeItem {
    userData: PhysicsObject;
}
export let quadtree: Quadtree<QuadTreeItem>;
export let flowfield: FlowField;
let img: P5.Graphics;

const sketch = (p: P5) => {
    p5 = p;
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight);
        img = p5.createGraphics(p5.width, p5.height);
        flowfield = new FlowField(floor(p5.width / 2), floor(p5.height / 2), 2);
        flowfield.fillNoise(10, 10, 1.5);
        quadtree = new Quadtree({
            x: -100,
            y: -100,
            width: p5.width + 100,
            height: p5.height + 100,
        });
        p5.colorMode(p5.HSB);
        p5.strokeCap(p5.SQUARE);
    };
    p5.draw = () => {
        deltaTime = Math.min(p5.deltaTime / 60, 2);
        const mouseX = p5.mouseX;
        const mouseY = p5.mouseY;
        const mouse = vec(mouseX, mouseY);
        for (let i = 0; i < 20; i++) {
            agents.push(
                new Agent(p5.random(p5.width), p5.random(p5.height), 1, 3)
            );
        }
        p5.background(0, 0, 0);
        img.strokeWeight(1);
        for (let i = 0; i < agents.length; i++) {
            agents[i].update();
            img.stroke(
                map(agents[i].vel.heading(), -PI, PI, 0, 360),
                255,
                255,
                10
            );
            if (sub(agents[i].pos, agents[i].pPos).magSq() < 100) {
                img.line(
                    agents[i].pos.x,
                    agents[i].pos.y,
                    agents[i].pPos.x,
                    agents[i].pPos.y
                );
            }
            if (!agents[i].isAlive) {
                agents.splice(i, 1);
                i--;
            }
        }
        for (let i = 0; i < agents.length; i++) {
            const force = vec();
            force.add(agents[i].follow(flowfield));
            agents[i].applyForce(force);
        }
        quadtree.clear();
        for (let i = 0; i < agents.length; i++) {
            agents[i].addQuadtreeElement();
        }
        p5.image(img, 0, 0);
    };
    p5.mousePressed = () => {
        mouseEvent();
    };
    p5.mouseDragged = () => {
        mouseEvent();
    };
};
function mouseEvent() {
    for (let i = 0; i < 10; i++) {
        agents.push(
            new Agent(
                p5.mouseX + random(-10, 10),
                p5.mouseY + random(-10, 10),
                1,
                5
            )
        );
    }
}
new P5(sketch);
