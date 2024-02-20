//Created by Ren Yuan
//c2js.org

class Agent extends c2.Circle{
    constructor() {
        let x = random(width);
        let y = random(height);
        let r = random(10, width/15);
        super(x, y, r);

        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.color = color(random(0, 8), random(30, 60), random(20, 100));
    }

    update(){
        this.p.x += this.vx;
        this.p.y += this.vy;

        if (this.p.x < this.r) {
            this.p.x = this.r;
            this.vx *= -1;
        } else if (this.p.x > width-this.r) {
            this.p.x = width-this.r;
            this.vx *= -1;
        }
        if (this.p.y < this.r) {
            this.p.y = this.r;
            this.vy *= -1;
        } else if (this.p.y > height-this.r) {
            this.p.y = height-this.r;
            this.vy *= -1;
        }
    }

    display(){
        noStroke();
        fill(this.color);
        circle(this.p.x, this.p.y, this.r);
    }

    bounds(){
        return this;
    }
}

function drawQuadTree(quadTree){
    stroke('#333333');
    strokeWeight(1);
    noFill();
    let bounds = quadTree.bounds;
    rect(bounds.p.x, bounds.p.y, bounds.w, bounds.h);

    if(quadTree.leaf()) return;
    for(let i=0; i<4; i++) drawQuadTree(quadTree.children[i]);
}

let agents = [];

let quadTree;

let strokeCircle;

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    ellipseMode(RADIUS);

    for (let i = 0; i < 25; i++) agents[i] = new Agent();

    quadTree = new c2.QuadTree(new c2.Rect(0, 0, width, height), 1);

    strokeCircle = new c2.Circle(0, 0, width/10);
}

function draw() {
    background('#cccccc');

    quadTree.clear();
    quadTree.insert(agents);

    drawQuadTree(quadTree);

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }

    let mouse = new c2.Point(mouseX, mouseY);
    strokeCircle.p = mouse;

    stroke('#000000');
    strokeWeight(1);
    drawingContext.setLineDash([5, 5]);
    noFill();
    circle(strokeCircle.p.x, strokeCircle.p.y, strokeCircle.r);
    drawingContext.setLineDash([]);

    let objects = quadTree.query(strokeCircle);

    for(let i=0; i<objects.length; i++){
        stroke('#000000');
        strokeWeight(1);
        noFill();
        circle(objects[i].p.x, objects[i].p.y, objects[i].r);
    }
}