//Created by Ren Yuan


class Agent extends c2.Line {
    constructor() {
        let x1 = random(width);
        let y1 = random(height);
        let x2 = random(width);
        let y2 = random(height);
        super(x1, y1, x2, y2);

        this.v1 = new c2.Vector(random(-2, 2), random(-2, 2));
        this.v2 = new c2.Vector(random(-2, 2), random(-2, 2));
        this.weight = random(1, 10);
        this.color = color(random(0, 8), random(30, 60), random(20, 100));
    }

    update(){
        this.bounce(this.p1, this.v1);
        this.bounce(this.p2, this.v2);
    }

    bounce(p, v){
        p.x += v.x;
        p.y += v.y;

        if (p.x < 0) {
            p.x = 0;
            v.x *= -1;
        } else if (p.x > width) {
            p.x = width;
            v.x *= -1;
        }
        if (p.y < 0) {
            p.y = 0;
            v.y *= -1;
        } else if (p.y > height) {
            p.y = height;
            v.y *= -1;
        }
    }

    display() {
        stroke(this.color);
        strokeWeight(this.weight);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }
}

let agents = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);

    for (let i = 0; i < 20; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }

    for (let i = 0; i < agents.length-1; i++) {
        for (let j = i+1; j < agents.length; j++) {
          let p = agents[i].intersection(agents[j]);
            if(p!=null){
                let w = agents[i].weight > agents[j].weight ? agents[i].weight:agents[j].weight;

                stroke('#333333');
                strokeWeight(w);
                point(p.x, p.y);
            }
        }
    }
}