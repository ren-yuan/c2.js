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

    let voronoi = new c2.Voronoi();
    voronoi.compute(agents);
    let triangles = voronoi.triangles;
    let vertices = voronoi.vertices;
    let edges = voronoi.edges;
    let regions = voronoi.regions;

    let rectangle = new c2.Rect(0, 0, width, height);

    let maxArea = 0;
    let minArea = Number.POSITIVE_INFINITY;
    for (let i = 0; i < regions.length; i++) {
        let clip = rectangle.clip(regions[i]);
        if(clip != null) regions[i] = clip;

        let area = regions[i].area();
        if(area < minArea) minArea = area;
        if(area > maxArea) maxArea = area;
    }

    stroke('#333333');
    strokeWeight(1);
    for (let i = 0; i < regions.length; i++) {
        let t = norm(regions[i].area(), minArea, maxArea);
        let c = color(8*t, 30+30*t, 20+80*t);
        fill(c);
        drawPolygon(regions[i].vertices);
    }

    for (let i = 0; i < agents.length; i++) {
        agents[i].display();
        agents[i].update();
    }
}

function drawPolygon(vertices) {
    beginShape();
    for (let v of vertices) vertex(v.x, v.y);
    endShape(CLOSE);
}