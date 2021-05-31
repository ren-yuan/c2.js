//Created by Ren Yuan


const renderer = new c2.Renderer(document.getElementById('c2'));
resize();

renderer.background('#cccccc');
let random = new c2.Random();


class Agent extends c2.Line {
    constructor() {
        let x1 = random.next(renderer.width);
        let y1 = random.next(renderer.height);
        let x2 = random.next(renderer.width);
        let y2 = random.next(renderer.height);
        super(x1, y1, x2, y2);

        this.v1 = new c2.Vector(random.next(-2, 2), random.next(-2, 2));
        this.v2 = new c2.Vector(random.next(-2, 2), random.next(-2, 2));
        this.weight = random.next(1, 10);
        this.color = c2.Color.hsl(random.next(0, 30), random.next(30, 60), random.next(20, 100));
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
        } else if (p.x > renderer.width) {
            p.x = renderer.width;
            v.x *= -1;
        }
        if (p.y < 0) {
            p.y = 0;
            v.y *= -1;
        } else if (p.y > renderer.height) {
            p.y = renderer.height;
            v.y *= -1;
        }
    }

    display() {
        renderer.stroke(this.color);
        renderer.lineWidth(this.weight);
        renderer.lineDash(false);
        renderer.fill(false);
        renderer.line(this);
    }
}

let agents = [];
for (let i = 0; i < 20; i++) agents[i] = new Agent();


renderer.draw(() => {
    renderer.clear();

    for (let i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].display();
    }

    for (let i = 0; i < agents.length-1; i++) {
        for (let j = i+1; j < agents.length; j++) {
          let p = agents[i].intersection(agents[j]);
            if(p!=null){
                let c = c2.Color.lerp(agents[i].color, agents[j].color, .5);
                let w = agents[i].weight > agents[j].weight ? agents[i].weight:agents[j].weight;

                renderer.stroke('#333333');
                renderer.lineWidth(w);
                renderer.point(p);
            }
        }
    }
});


window.addEventListener('resize', resize);
function resize() {
    let parent = renderer.canvas.parentElement;
    renderer.size(parent.clientWidth, parent.clientWidth / 16 * 9);
}