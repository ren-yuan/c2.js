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

let regionColor;

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);

    regionColor = color(random(0, 30), random(30, 60), 60);

    for (let i = 0; i < agents.length; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    let convexHull = new c2.ConvexHull();
    convexHull.compute(agents);
    let vertices = convexHull.vertices;
    let region = convexHull.region;

    stroke('#333333');
    strokeWeight(1);
    fill(regionColor);
    drawPolygon(region.vertices);

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