//Created by Ren Yuan
//c2js.org

class Agent extends c2.Rect{
    constructor() {
        let x = random(width);
        let y = random(height);
        let w = random(width);
        let h = random(height);
        super(x, y, w, h);

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
        } else if (this.p.x > width-this.w) {
            this.p.x = width-this.w;
            this.vx *= -1;
        }
        if (this.p.y < 0) {
            this.p.y = 0;
            this.vy *= -1;
        } else if (this.p.y > height-this.h) {
            this.p.y = height-this.h;
            this.vy *= -1;
        }
    }

    display(){
        stroke('#333333');
        strokeWeight(1);
        drawingContext.setLineDash([5, 5]);
        noFill();
        rect(this.p.x, this.p.y, this.w, this.h);
    }
}

let agents = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);

    for (let i = 0; i < 10; i++) agents[i] = new Agent();
}

function draw() {
    background('#cccccc');

    for (let i = 0; i < agents.length; i++) {
        agents[i].display();
        agents[i].update();
    }

    for (let i = 0; i < agents.length-1; i++) {
        for (let j = i+1; j < agents.length; j++) {
          let rectangle = agents[i].intersection(agents[j]);
            if(rectangle!=null){
                noStroke();
                let c = lerpColor(agents[i].color, agents[j].color, .5);
                fill(c);
                rect(rectangle.p.x, rectangle.p.y, rectangle.w, rectangle.h);
            }
        }
    }
}