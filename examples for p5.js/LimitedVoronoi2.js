//Created by Ren Yuan


class Agent extends c2.Cell{
    constructor() {
        let x = random(width);
        let y = random(height);
        let r = random(width / 25, width / 5);
        super(x, y, r);

        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.color = color(random(0, 8), random(30, 60), random(20, 100));
    }

    update(){
        this.p.x += this.vx;
        this.p.y += this.vy;

        if (this.p.x < 0) {
            this.p.x = 0;
            this.vx *= -1;
        } else if (this.p.x > width) {
            this.p.x = width;
            this.vx *= -1;
        }
        if (this.p.y < 0) {
            this.p.y = 0;
            this.vy *= -1;
        } else if (this.p.y > height) {
            this.p.y = height;
            this.vy *= -1;
        }
    }

    display(){
        if (this.state != 2) {
            stroke('#333333');
            strokeWeight(1);
            drawingContext.setLineDash([5, 5]);
            noFill();
            drawCell(this);

            stroke('#333333');
            strokeWeight(1);
            drawingContext.setLineDash([]);
            fill(this.color);
            drawPolygon(this.polygon(4).vertices);

            stroke('#333333');
            strokeWeight(5);
            point(this.p.x, this.p.y);
        }
    }
}

let agents = new Array(20);

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    ellipseMode(RADIUS);

    for (let i = 0; i < agents.length; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    let voronoi = new c2.LimitedVoronoi();
    voronoi.compute(agents);

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

function drawCell(cell) {
    if (cell.state != 1) {
        circle(cell.p.x, cell.p.y, cell.r);
        return;
    }

    drawingContext.beginPath();
    drawingContext.moveTo(cell.vertices[0].x, cell.vertices[0].y);
    for (let i = 0; i < cell.vertices.length; i++) {
        const v1 = cell.vertices[i];
        const v2 = cell.vertices[(i + 1) % cell.vertices.length];
        if (v1.type == 0) {
            drawingContext.lineTo(v2.x, v2.y);
        } else {
            drawingContext.arc(cell.p.x, cell.p.y, cell.r, v1.a, v2.a);
        }
    }
    //if (fill) drawingContext.fill();
    if (stroke) drawingContext.stroke();
}