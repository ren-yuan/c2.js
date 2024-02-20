//Created by Ren Yuan


class Agent extends c2.Point {
    constructor() {
        let x = random(width);
        let y = random(height);
        super(x, y);

        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.x = 0;
            this.vx *= -1;
        } else if (this.x > width) {
            this.x = width;
            this.vx *= -1;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -1;
        } else if (this.y > height) {
            this.y = height;
            this.vy *= -1;
        }
    }

    display() {
        stroke('#333333');
        strokeWeight(5);
        point(this.x, this.y);
    }
}

let agents = new Array(20);

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);

    for (let i = 0; i < agents.length; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    let delaunay = new c2.Delaunay();
    delaunay.compute(agents);
    let vertices = delaunay.vertices;
    let edges = delaunay.edges;
    let triangles = delaunay.triangles;

    let maxArea = 0;
    let minArea = Number.POSITIVE_INFINITY;
    for (let i = 0; i < triangles.length; i++) {
        let area = triangles[i].area();
        if(area < minArea) minArea = area;
        if(area > maxArea) maxArea = area;
    }

    stroke('#333333');
    strokeWeight(1);
    for (let i = 0; i < triangles.length; i++) {
        let t = norm(triangles[i].area(), minArea, maxArea);
        let c = color(8*t, 30+30*t, 20+80*t);
        fill(c);
        triangle(triangles[i].p1.x, triangles[i].p1.y,
                triangles[i].p2.x, triangles[i].p2.y,
                triangles[i].p3.x, triangles[i].p3.y);
    }

    for (let i = 0; i < agents.length; i++) {
        agents[i].display();
        agents[i].update();
    }
}