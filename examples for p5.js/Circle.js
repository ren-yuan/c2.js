//Created by Ren Yuan


class Agent extends c2.Circle{
    constructor() {
        let x = random(width);
        let y = random(height);
        let r = random(width/4);
        super(x, y, r);

        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.color = color(random(0, 30), random(30, 60), random(20, 100));
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
}


let agents = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);
    ellipseMode(RADIUS);

    for (let i = 0; i < 10; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }

    for (let i = 0; i < agents.length-1; i++) {
        for (let j = i+1; j < agents.length; j++) {
          let points = agents[i].intersection(agents[j]);
            if(points!=null){
                let c = lerpColor(agents[i].color, agents[j].color, .5);
                stroke(c);
                strokeWeight(2);
                line(points[0].x, points[0].y, points[1].x, points[1].y);
              
                stroke('#333333');
                strokeWeight(5);
                point(points[0].x, points[0].y);
                point(points[1].x, points[1].y);
            }
        }
    }
}