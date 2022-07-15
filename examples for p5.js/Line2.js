//Created by Ren Yuan


class Agent extends c2.Line {
    constructor() {
        let x1 = random(width);
        let y1 = random(height);
        let x2 = random(width);
        let y2 = random(height);
        super(x1, y1, x2, y2);

        this.v1 = new c2.Vector(random(-5, 5), random(-5, 5));
        this.v2 = new c2.Vector(random(-5, 5), random(-5, 5));
        this.weight = random(1, 5);
        this.color = color(random(0, 30), random(30, 60), random(20, 100));
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
}

let agents = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);

    for (let i = 0; i < 20; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
    }

    let n = 30;
    for (let i = 0; i < agents.length-1; i++) {
        for (let j = 0; j < n; j++) {
            let t = norm(j, 0, n);
            let c = lerpColor(agents[i].color, agents[i+1].color, t);
            let w = lerp(agents[i].weight, agents[i+1].weight, t);
            let l = agents[i].lerp(agents[i+1], t);
            stroke(c);
            strokeWeight(w);
            line(l.p1.x, l.p1.y, l.p2.x, l.p2.y);
        }
    }
}