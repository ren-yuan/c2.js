//Created by Ren Yuan


class Agent extends c2.Point {
    constructor(x, y) {
        super(x, y);

        this.weight = random(1, 5);
        this.color = color(random(0, 8), random(30, 60), random(20, 100), 50);
    }
}

let agents = new Array(10);

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    background('#cccccc');

    for (let i = 0; i < agents.length; i++) {
        let x = random(width);
        let y = random(height);
        agents[i] = new Agent(x, y);
    }
}

function draw() {
    for (let i = 0; i < agents.length; i++) {
        let next = (i+1) % agents.length;
        agents[i].rotate(.01, agents[next]);

        stroke(agents[i].color);
        strokeWeight(agents[i].weight);
        line(agents[i].x, agents[i].y, agents[next].x, agents[next].y);

        stroke('#333333');
        point(agents[i].x, agents[i].y);
    }
}