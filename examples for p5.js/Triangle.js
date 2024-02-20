//Created by Ren Yuan
//c2js.org

class Agent extends c2.Triangle{
    constructor(p1, p2, p3){
        super(p1, p2, p3);

        this.color = color(random(0, 8), random(30, 60), random(20, 100));
    }

    subdivide() {
        let agents = new Array(4);
        let a = this.p1.lerp(this.p2, random(.1, .9));
        let b = this.p2.lerp(this.p3, random(.1, .9));
        let c = this.p3.lerp(this.p1, random(.1, .9)); 
        agents[0] = new Agent(this.p1, a, c);
        agents[1] = new Agent(this.p2, b, a);
        agents[2] = new Agent(this.p3, c, b);
        agents[3] = new Agent(a, b, c);
        return agents;
    }
}

function subdivide(agent) {
    if (agent.area()<1000) return;
    agents.push(agent);

    let triangles = agent.subdivide();
    for (let i=0; i<triangles.length; i++) {
      if(random()<.8) subdivide(triangles[i]);
    }
}

let agents = [];

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);

    subdivide(new Agent(new c2.Point(0,0), new c2.Point(width,0), new c2.Point(0,height)));
    subdivide(new Agent(new c2.Point(width,0), new c2.Point(width,height), new c2.Point(0,height)));
}

function draw() {
    background('#cccccc');

    for(let i=0; i<agents.length; i++){
        stroke('#333333');
        strokeWeight(1);
        fill(agents[i].color);
        triangle(agents[i].p1.x, agents[i].p1.y, agents[i].p2.x, agents[i].p2.y, agents[i].p3.x, agents[i].p3.y);
    }
}